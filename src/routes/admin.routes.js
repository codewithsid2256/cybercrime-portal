'use strict';

const express = require('express');
const path = require('path');

const db = require('../db');
const { STATES, STATUSES, CATEGORIES } = require('../config');
const { checkPassword, createSessionCookie, setSessionCookie, clearSessionCookie, rateLimit, resetRateLimit } = require('../security');
const { loginPage, dashboardPage, complaintsPage, complaintDetailPage, analyticsPage } = require('../views/admin');

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.admin) {
    return res.redirect(`/admin/login?next=${encodeURIComponent(req.originalUrl)}`);
  }
  next();
}

/* ---------------------------- Auth ---------------------------- */

router.get('/login', (req, res) => {
  if (req.admin) return res.redirect('/admin');
  res.send(loginPage({}));
});

router.post('/login', (req, res) => {
  const { username = '', password = '' } = req.body || {};
  const key = `login:${req.ip}:${String(username).toLowerCase()}`;
  const limit = rateLimit(key, { max: 8, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return res.status(429).send(loginPage({ error: `Too many failed attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).`, username }));
  }

  const admin = db.findAdminByUsername(username);
  if (!admin || !checkPassword(password, admin.passwordHash)) {
    return res.status(401).send(loginPage({ error: 'Invalid username or password.', username }));
  }

  resetRateLimit(key);
  setSessionCookie(res, req, createSessionCookie(admin));
  const next = typeof req.query.next === 'string' && req.query.next.startsWith('/admin') ? req.query.next : '/admin';
  res.redirect(next);
});

router.get('/logout', (req, res) => {
  clearSessionCookie(res);
  res.redirect('/admin/login');
});

/* -------------------------- Dashboard -------------------------- */

router.get('/', requireAdmin, (req, res) => {
  const stats = db.stats();
  const recent = db.listComplaints({ sort: 'newest', pageSize: 8 }).rows;
  const alerts = db
    .listComplaints({ sort: 'newest', pageSize: 50 })
    .rows.filter((c) => c.priority !== 'normal' && !['closed', 'action-taken'].includes(c.status))
    .slice(0, 5);
  res.send(dashboardPage({ admin: req.admin, stats, recent, alerts }));
});

router.get('/analytics', requireAdmin, (req, res) => {
  res.send(analyticsPage({ admin: req.admin, stats: db.stats() }));
});

/* -------------------------- Complaints ------------------------- */

router.get('/complaints', requireAdmin, (req, res) => {
  const filters = {
    q: (req.query.q || '').toString().trim(),
    status: (req.query.status || '').toString(),
    category: (req.query.category || '').toString(),
    state: (req.query.state || '').toString(),
    priority: (req.query.priority || '').toString(),
    sort: (req.query.sort || 'newest').toString(),
    page: Number(req.query.page) || 1,
    pageSize: 10,
  };
  const result = db.listComplaints(filters);
  res.send(complaintsPage({ admin: req.admin, result, filters, states: STATES }));
});

router.get('/complaints/:id', requireAdmin, (req, res, next) => {
  const c = db.getComplaintById(req.params.id);
  if (!c) return next();
  res.send(complaintDetailPage({ admin: req.admin, c, flash: req.query.saved ? 'Case updated successfully.' : '' }));
});

router.post('/complaints/:id/status', requireAdmin, (req, res, next) => {
  const c = db.getComplaintById(req.params.id);
  if (!c) return next();
  const { status, priority, assignedTo, firNo, note } = req.body || {};
  if (!STATUSES.some((s) => s.id === status)) {
    return res.status(400).send('Invalid status.');
  }
  if (!note || String(note).trim().length < 4) {
    return res.redirect(`/admin/complaints/${c.id}`);
  }
  db.updateComplaint(c.id, {
    status,
    priority: ['normal', 'high', 'critical'].includes(priority) ? priority : c.priority,
    assignedTo: (assignedTo || '').trim() || c.assignedTo,
    firNo: (firNo || '').trim() || c.firNo,
  });
  db.addTimelineEntry(c.id, { status, note: String(note).trim(), by: req.admin.name });
  res.redirect(`/admin/complaints/${c.id}?saved=1`);
});

/* ---------------------------- Export --------------------------- */

function csvCell(v) {
  const s = String(v === undefined || v === null ? '' : v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

router.get('/export.csv', requireAdmin, (req, res) => {
  const rows = db.listComplaints({ sort: 'newest', pageSize: 10000 }).rows;
  const head = ['Complaint No', 'Filed', 'Status', 'Priority', 'Category', 'Complainant', 'Mobile', 'Email', 'District', 'State', 'Incident Date', 'Amount (INR)', 'Assigned To', 'FIR No'];
  const lines = [head.join(',')];
  for (const c of rows) {
    lines.push([
      c.complaintNo, c.createdAt, c.status, c.priority, c.categoryLabel,
      c.complainant.name, c.complainant.mobile, c.complainant.email,
      c.complainant.district, c.complainant.state,
      c.incident.date, c.incident.amountLost || 0,
      c.assignedTo || '', c.firNo || '',
    ].map(csvCell).join(','));
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="ncrp-complaints-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send('\uFEFF' + lines.join('\r\n'));
});

module.exports = { router, requireAdmin };
