'use strict';

const crypto = require('crypto');

const SECRET = process.env.SESSION_SECRET || 'ncrp-dev-secret-do-not-use-in-production';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

function hmac(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex');
}

/* ---------- Stateless signed cookies ---------- */

function createSessionCookie(user) {
  const payload = b64url(JSON.stringify({
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    exp: Date.now() + SESSION_TTL_MS,
  }));
  return `${payload}.${hmac(payload)}`;
}

function verifySessionCookie(value) {
  if (!value || typeof value !== 'string' || !value.includes('.')) return null;
  const [payload, sig] = value.split('.');
  if (!payload || !sig) return null;
  const expected = hmac(payload);
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(fromB64url(payload).toString('utf8'));
    if (!data || !data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  });
  return out;
}

function setSessionCookie(res, req, token) {
  const secure = process.env.COOKIE_SECURE === 'true' && (req.secure || req.headers['x-forwarded-proto'] === 'https');
  const attrs = [
    `ncrp_admin=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (secure) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'ncrp_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
}

/* ---------- Captcha (signed arithmetic challenge) ---------- */

function createCaptcha() {
  const a = 2 + crypto.randomInt(8);
  const b = 2 + crypto.randomInt(8);
  const exp = Date.now() + 1000 * 60 * 30;
  const payload = b64url(JSON.stringify({ a, b, exp }));
  return { a, b, token: `${payload}.${hmac(payload)}` };
}

function verifyCaptcha(token, answer) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || hmac(payload) !== sig) return false;
  try {
    const data = JSON.parse(fromB64url(payload).toString('utf8'));
    if (!data || data.exp < Date.now()) return false;
    return Number(answer) === data.a + data.b;
  } catch {
    return false;
  }
}

/* ---------- Simple in-memory rate limiter ---------- */

const buckets = new Map();

function rateLimit(key, { max = 10, windowMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return { allowed: false, retryAfterSec: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, remaining: max - hits.length };
}

function resetRateLimit(key) {
  buckets.delete(key);
}

/* ---------- Misc ---------- */

function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  return bcrypt.hashSync(password, 10);
}
function checkPassword(password, hash) {
  const bcrypt = require('bcryptjs');
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

module.exports = {
  createSessionCookie,
  verifySessionCookie,
  parseCookies,
  setSessionCookie,
  clearSessionCookie,
  createCaptcha,
  verifyCaptcha,
  rateLimit,
  resetRateLimit,
  hashPassword,
  checkPassword,
};
