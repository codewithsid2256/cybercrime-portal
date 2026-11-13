'use strict';

const path = require('path');
const express = require('express');

const db = require('./db');
const { verifySessionCookie, parseCookies } = require('./security');
const { getAdminById } = require('./db');
const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');
const { notFoundPage, errorPage } = require('./views/content');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(express.json({ limit: '200kb' }));

/* ---------- Security headers ---------- */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "font-src 'self' data:",
      "connect-src 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
    ].join('; ')
  );
  next();
});

/* ---------- Static assets ---------- */
app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css'), { maxAge: '1h' }));
app.use('/js', express.static(path.join(__dirname, '..', 'public', 'js'), { maxAge: '1h' }));
app.use('/img', express.static(path.join(__dirname, '..', 'public', 'img'), { maxAge: '7d' }));
app.use('/fonts', express.static(path.join(__dirname, '..', 'public', 'fonts'), { maxAge: '30d', immutable: true }));

/* ---------- Load the data store ---------- */
db.load();

/* ---------- Serve uploaded evidence ----------
   In production this should sit behind auth checks. For this prototype we
   allow public access to files whose stored names are randomly generated,
   and the citizen-facing record page only reveals URLs to the complaint
   owner (complaint number + mobile verification). */
app.use('/uploads', express.static(publicRoutes.UPLOAD_DIR, { maxAge: '1d' }));

/* ---------- Attach session user ---------- */
app.use((req, res, next) => {
  const cookies = parseCookies(req);
  const session = verifySessionCookie(cookies.ncrp_admin);
  req.admin = session ? getAdminById(session.sub) || null : null;
  res.locals.admin = req.admin;
  next();
});

/* ---------- Health ---------- */
app.get('/healthz', (req, res) => {
  res.json({ ok: true, service: 'ncrp-prototype', time: new Date().toISOString() });
});

/* ---------- Routes ---------- */
app.use('/admin', adminRoutes.router);
app.use('/', publicRoutes.router);

/* ---------- 404 / error ---------- */
app.use((req, res) => {
  if (req.path.startsWith('/admin')) {
    return res.status(404).redirect('/admin');
  }
  res.status(404).send(notFoundPage({ user: req.admin }));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err && err.stack ? err.stack : err);
  if (res.headersSent) return;
  res.status(500).send(errorPage({ user: req.admin, message: 'An unexpected error occurred. Please try again.' }));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`NCRP prototype listening on http://0.0.0.0:${PORT}`);
});

module.exports = { app, server };
