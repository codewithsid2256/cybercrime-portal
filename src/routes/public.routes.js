'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

const db = require('../db');
const { SITE, CATEGORIES, STATES, ALLOWED_MIME, MAX_FILES, MAX_FILE_BYTES } = require('../config');
const { createCaptcha, verifyCaptcha, rateLimit } = require('../security');
const { homePage, crimeTypesPage, helplinePage } = require('../views/public');
const { reportPage } = require('../views/report');
const { trackForm, complaintResult, successPage } = require('../views/track');
const { awarenessPage, resourcesPage, contactPage, staticPage, notFoundPage } = require('../views/content');
const { escapeHtml, digits } = require('../util');

const router = express.Router();

/* ------------------------------------------------------------------ */
/* Upload handling                                                     */
/* ------------------------------------------------------------------ */

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(path.join(UPLOAD_DIR, 'evidence'), { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(UPLOAD_DIR, 'evidence')),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
    cb(null, true);
  },
});

/** Route uploads through a validator so we can render friendly errors. */
function handleEvidence(req, res, next) {
  const mw = upload.array('evidence', MAX_FILES);
  mw(req, res, (err) => {
    if (!err) return next();
    req.uploadError =
      err.code === 'LIMIT_FILE_SIZE'
        ? `Each file must be 5 MB or smaller.`
        : err.code === 'LIMIT_FILE_COUNT'
        ? `You can attach a maximum of ${MAX_FILES} files.`
        : err instanceof multer.MulterError
        ? 'One or more files have an unsupported type. Allowed: JPG, PNG, WEBP, GIF, PDF, MP4, MOV, TXT.'
        : 'Upload failed. Please try again.';
    next();
  });
}

/* ------------------------------------------------------------------ */
/* Public pages                                                        */
/* ------------------------------------------------------------------ */

router.get('/', (req, res) => {
  const stats = db.stats();
  const recent = db
    .listComplaints({ sort: 'newest', pageSize: 5 })
    .rows.map((c) => ({ ...c, complainant: { ...c.complainant, name: '•••••' } }));
  res.send(homePage({ stats, recent, user: req.admin }));
});

router.get('/crime-types', (req, res) => {
  res.send(crimeTypesPage({ user: req.admin }));
});

router.get('/helpline', (req, res) => {
  res.send(helplinePage({ user: req.admin }));
});

router.get('/awareness', (req, res) => {
  res.send(awarenessPage({ user: req.admin }));
});

router.get('/resources', (req, res) => {
  res.send(resourcesPage({ user: req.admin }));
});

router.get('/contact', (req, res) => {
  res.send(contactPage({ user: req.admin }));
});

router.get('/page/:slug', (req, res, next) => {
  const { STATIC_PAGES } = require('../views/content');
  if (!STATIC_PAGES[req.params.slug]) return next();
  res.send(staticPage({ user: req.admin, slug: req.params.slug }));
});

/* ------------------------------------------------------------------ */
/* Report a crime                                                      */
/* ------------------------------------------------------------------ */

function collectValues(body = {}) {
  return {
    category: body.category || '',
    name: (body.name || '').trim(),
    mobile: digits(body.mobile),
    email: (body.email || '').trim(),
    idType: body.idType || '',
    idNumber: (body.idNumber || '').trim(),
    state: body.state || '',
    district: (body.district || '').trim(),
    pincode: digits(body.pincode),
    address: (body.address || '').trim(),
    incidentDate: body.incidentDate || '',
    incidentTime: body.incidentTime || '',
    amountLost: (body.amountLost || '').toString(),
    priority: body.priority || 'normal',
    description: (body.description || '').trim(),
    suspectPlatform: (body.suspectPlatform || '').trim(),
    suspectUrl: (body.suspectUrl || '').trim(),
    suspectPhone: (body.suspectPhone || '').trim(),
    suspectAccount: (body.suspectAccount || '').trim(),
    declaration: body.declaration === 'yes',
  };
}

function validate(v, files) {
  const errors = {};
  if (!CATEGORIES.some((c) => c.id === v.category)) errors.category = 'Please select a crime category.';
  if (!v.name || v.name.length < 3) errors.name = 'Please enter your full name (at least 3 characters).';
  if (!/^[6-9]\d{9}$/.test(v.mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number starting with 6–9.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) errors.email = 'Enter a valid email address.';
  if (!v.idType) errors.idType = 'Select an identity document type.';
  if (!v.idNumber || v.idNumber.length < 4) errors.idNumber = 'Enter your identity document number.';
  if (!STATES.includes(v.state)) errors.state = 'Select your state or union territory.';
  if (!v.district) errors.district = 'Enter your district.';
  if (!/^\d{6}$/.test(v.pincode)) errors.pincode = 'Enter a valid 6-digit PIN code.';
  if (!v.incidentDate) errors.incidentDate = 'Enter the date of the incident.';
  else {
    const d = new Date(v.incidentDate);
    if (isNaN(d) || d.getTime() > Date.now() + 86400000) errors.incidentDate = 'The incident date cannot be in the future.';
  }
  if (v.amountLost && (isNaN(Number(v.amountLost)) || Number(v.amountLost) < 0)) errors.amountLost = 'Amount must be a positive number.';
  if (!v.description || v.description.length < 30) errors.description = 'Please describe the incident in at least 30 characters.';
  else if (v.description.length > 4000) errors.description = 'Description must be under 4000 characters.';
  if (!v.declaration) errors.declaration = 'You must accept the declaration before submitting.';
  if (files && files.length > MAX_FILES) errors.evidence = `Attach at most ${MAX_FILES} files.`;
  return errors;
}

router.get('/report', (req, res) => {
  const captcha = createCaptcha();
  res.send(reportPage({
    user: req.admin,
    captcha,
    preselectedCategory: req.query.category || '',
    refNo: req.query.ref || '',
  }));
});

router.post('/report', (req, res) => {
  const limit = rateLimit(`report:${req.ip}`, { max: 12, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    res.status(429).send(staticPage({ user: req.admin, slug: 'faq' }));
    return;
  }
  handleEvidence(req, res, () => {
    const v = collectValues(req.body);
    const files = req.files || [];
    const errors = validate(v, files);

    if (req.uploadError && !errors.evidence) errors.evidence = req.uploadError;
    if (!verifyCaptcha(req.body.captchaToken, req.body.captcha)) {
      errors.captcha = 'The answer is incorrect. Please try the new question.';
    }

    if (Object.keys(errors).length) {
      // remove any uploaded files from a failed attempt
      files.forEach((f) => fs.unlink(f.path, () => {}));
      const captcha = createCaptcha();
      res.status(422).send(reportPage({ user: req.admin, values: v, errors, captcha }));
      return;
    }

    const attachments = files.map((f) => ({
      id: `ev-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      originalName: f.originalname,
      storedName: f.filename,
      mime: f.mimetype,
      size: f.size,
      uploadedAt: new Date().toISOString(),
      url: `/uploads/evidence/${f.filename}`,
      seeded: false,
    }));

    const complaint = db.addComplaint({
      category: v.category,
      priority: ['normal', 'high', 'critical'].includes(v.priority) ? v.priority : 'normal',
      complainant: {
        name: v.name,
        mobile: v.mobile,
        email: v.email,
        idType: v.idType,
        idNumber: v.idNumber,
        state: v.state,
        district: v.district,
        pincode: v.pincode,
        address: v.address,
      },
      incident: {
        date: v.incidentDate,
        time: v.incidentTime,
        amountLost: Number(v.amountLost) || 0,
        description: v.description,
      },
      suspect: {
        platform: v.suspectPlatform,
        url: v.suspectUrl,
        phone: v.suspectPhone,
        account: v.suspectAccount,
        wallet: '',
      },
      attachments,
    });

    res.redirect(`/success/${complaint.id}`);
  });
});

router.get('/success/:id', (req, res, next) => {
  const c = db.getComplaintById(req.params.id);
  if (!c) return next();
  res.send(successPage({ user: req.admin, complaint: c }));
});

/* ------------------------------------------------------------------ */
/* Track                                                               */
/* ------------------------------------------------------------------ */

router.get('/track', (req, res) => {
  res.send(trackForm({ user: req.admin }));
});

router.post('/track', (req, res) => {
  const { complaintNo, mobile } = req.body;
  const limit = rateLimit(`track:${req.ip}`, { max: 30, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    res.status(429).send(trackForm({ user: req.admin, values: req.body, error: 'Too many lookups. Please try again in a few minutes.' }));
    return;
  }
  const c = db.findComplaint({ complaintNo, mobile });
  if (!c) {
    res.status(404).send(trackForm({
      user: req.admin,
      values: req.body,
      error: 'No complaint was found with that combination. Check the complaint number and the mobile number used at filing.',
    }));
    return;
  }
  res.send(complaintResult({ user: req.admin, complaint: c }));
});

/* ------------------------------------------------------------------ */
/* Downloads                                                           */
/* ------------------------------------------------------------------ */

router.get('/downloads/:name', (req, res, next) => {
  const files = {
    'complaint-guide': ['complaint-guide.txt', 'text/plain'],
    'evidence-checklist': ['evidence-checklist.txt', 'text/plain'],
    'cyber-safety-checklist': ['cyber-safety-checklist.txt', 'text/plain'],
  };
  const entry = files[req.params.name];
  if (!entry) return next();
  const [file, type] = entry;
  res.setHeader('Content-Type', `${type}; charset=utf-8`);
  res.setHeader('Content-Disposition', `attachment; filename="ncrp-${file}"`);
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'downloads', file));
});

module.exports = { router, UPLOAD_DIR };
