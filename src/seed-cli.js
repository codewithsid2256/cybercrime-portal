'use strict';

/**
 * Reset the prototype data store back to its seeded (fictitious) state.
 *   npm run seed
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

if (fs.existsSync(DB_FILE)) {
  const backup = `${DB_FILE}.backup-${Date.now()}`;
  fs.copyFileSync(DB_FILE, backup);
  console.log(`Backed up existing store to ${backup}`);
}

// Remove the store so the next load() seeds fresh data.
fs.mkdirSync(DATA_DIR, { recursive: true });
if (fs.existsSync(DB_FILE)) fs.unlinkSync(DB_FILE);

const db = require('./db');
const state = db.load();

// Clean out previously uploaded evidence files.
const evidenceDir = path.join(UPLOAD_DIR, 'evidence');
if (fs.existsSync(evidenceDir)) {
  for (const file of fs.readdirSync(evidenceDir)) {
    if (file.startsWith('.')) continue;
    fs.unlinkSync(path.join(evidenceDir, file));
  }
}

console.log(`Seeded ${state.complaints.length} fictitious complaints.`);
console.log(`Data file: ${DB_FILE}`);
console.log('Admin credentials: admin / Admin@1930 (override with ADMIN_PASSWORD)');
