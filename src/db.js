'use strict';

const fs = require('fs');
const path = require('path');
const { hashPassword } = require('./security');
const { CATEGORIES } = require('./config');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let state = null;

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

const BASE_TIME = new Date('2026-11-13T09:30:00+05:30').getTime();
const hoursAgo = (h) => new Date(BASE_TIME - h * 3600 * 1000).toISOString();

const SEED_COMPLAINTS = [
  {
    no: 'NCRP/2026/010482', hoursAgo: 3, status: 'under-review', priority: 'high',
    category: 'upi-fraud',
    complainant: { name: 'Ananya Sen', mobile: '9830012345', email: 'ananya.sen@example.com', idType: 'Aadhaar Card', idNumber: '482193746521', state: 'West Bengal', district: 'Howrah', address: 'Flat 4B, Shibpur Housing Estate', pincode: '711102' },
    incident: { date: '2026-11-12', time: '18:40', amountLost: 18500, description: 'Received a phone call from a person claiming to be a bank officer who asked me to scan a QR code to "receive a refund of ₹18,500". Scanning the code debited ₹18,500 from my account instead. The number is now switched off.' },
    suspect: { platform: 'Phone call / UPI', url: '', phone: '+91 98765 43210', account: 'UPI ID: refund.bank@ybl', wallet: '' },
    attachments: [
      { originalName: 'upi-debit-message.png', mime: 'image/png', size: 214560, sample: 'sample-upi-sms.png' },
      { originalName: 'transaction-statement.pdf', mime: 'application/pdf', size: 88210, sample: null },
    ],
    timeline: [
      { status: 'submitted', note: 'Complaint received through the portal.', by: 'System' },
      { status: 'under-review', note: 'Assigned to Cyber Cell, Howrah for initial verification. Bank nodal officer contacted for UTR 4471882093.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010481', hoursAgo: 6, status: 'investigation', priority: 'critical',
    category: 'investment-crypto',
    complainant: { name: 'Rohit Malhotra', mobile: '9910012346', email: 'rohit.m@example.com', idType: 'PAN Card', idNumber: 'BQRPM4821K', state: 'Delhi', district: 'South West Delhi', address: 'C-112, Vasant Kunj', pincode: '110070' },
    incident: { date: '2026-10-28', time: '11:15', amountLost: 420000, description: 'Added to a WhatsApp group "SEBI Approved Crypto Gains" where admins shared a fake trading app. Deposited ₹4,20,000 over three weeks. The app displayed profits but withdrawals were blocked asking for "tax" payments. Group was deleted afterwards.' },
    suspect: { platform: 'WhatsApp + fake app', url: 'https://gainpro-trade.example.com', phone: '+91 70112 33445', account: 'Bank A/C 50100234988122, IFSC HDFC0000451', wallet: 'TQn9W...8fLm' },
    attachments: [{ originalName: 'fake-app-dashboard.png', mime: 'image/png', size: 341002, sample: null }],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Verified UTRs with complainant bank.', by: 'SI P. Nair' },
      { status: 'investigation', note: 'Gold mule account identified and freeze request sent to HDFC nodal desk. Case referred to Cyber Crime Unit.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010478', hoursAgo: 11, status: 'submitted', priority: 'normal',
    category: 'social-media',
    complainant: { name: 'Meera Iyer', mobile: '9845012347', email: 'meera.iyer@example.com', idType: 'Aadhaar Card', idNumber: '992014785633', state: 'Karnataka', district: 'Bengaluru Urban', address: 'No. 8, Indiranagar 2nd Stage', pincode: '560038' },
    incident: { date: '2026-11-10', time: '21:05', amountLost: 0, description: 'A fake Instagram profile is impersonating me using my photos and bio, and is messaging my contacts asking for money. Original account has been cloned twice after reporting.' },
    suspect: { platform: 'Instagram', url: 'https://instagram.com/meera.iyer_official2', phone: '', account: '', wallet: '' },
    attachments: [{ originalName: 'fake-profile.png', mime: 'image/png', size: 156220, sample: null }],
    timeline: [{ status: 'submitted', note: 'Complaint received through the portal.', by: 'System' }],
  },
  {
    no: 'NCRP/2026/010475', hoursAgo: 19, status: 'action-taken', priority: 'high',
    category: 'otp-bank-fraud',
    complainant: { name: 'Suresh Kumar Patel', mobile: '9415012348', email: 'sk.patel@example.com', idType: 'Voter ID', idNumber: 'WB/08/145/009876', state: 'West Bengal', district: 'Kolkata', address: '27B, Lake Gardens', pincode: '700045' },
    incident: { date: '2026-11-09', time: '08:20', amountLost: 74000, description: 'Received an SMS that a new SIM is being activated. Within 10 minutes my number stopped working (SIM swap). Later found three unauthorised IMPS transfers totalling ₹74,000 from my savings account.' },
    suspect: { platform: 'SIM swap + IMPS', url: '', phone: '', account: 'Beneficiary A/C 3021001110987, ICICI0000456', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Telecom operator nodal officer queried for SIM replacement details.', by: 'SI A. Chatterjee' },
      { status: 'action-taken', note: 'Beneficiary account frozen; ₹41,200 placed on hold at ICICI Bank. Chargeback initiated for remaining amount.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010469', hoursAgo: 26, status: 'under-review', priority: 'normal',
    category: 'ecommerce',
    complainant: { name: 'Priyanka Das', mobile: '9831012349', email: 'priyanka.das@example.com', idType: 'Passport', idNumber: 'J8361094', state: 'West Bengal', district: 'Howrah', address: '12/3, Salkia Place', pincode: '711106' },
    incident: { date: '2026-11-06', time: '14:30', amountLost: 12990, description: 'Ordered a refurbished laptop from an Instagram shop page that collected payment through a UPI collect request. No order confirmation or delivery since; the page was deactivated after two days.' },
    suspect: { platform: 'Instagram shop', url: 'https://instagram.com/gadget.deals.kol', phone: '+91 90000 11223', account: 'UPI: gadgetdeals@axl', wallet: '' },
    attachments: [{ originalName: 'order-chat.png', mime: 'image/png', size: 190420, sample: null }],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Notice issued to payment aggregator for beneficiary KYC.', by: 'SI A. Chatterjee' },
    ],
  },
  {
    no: 'NCRP/2026/010461', hoursAgo: 38, status: 'closed', priority: 'normal',
    category: 'job-fraud',
    complainant: { name: 'Arjun Reddy', mobile: '9949012350', email: 'arjun.reddy@example.com', idType: 'Aadhaar Card', idNumber: '771920445612', state: 'Telangana', district: 'Hyderabad', address: 'H.No 3-4-556, Kachiguda', pincode: '500027' },
    incident: { date: '2026-10-15', time: '10:00', amountLost: 5000, description: 'Joined a Telegram group offering ₹2,000 per day for liking YouTube videos. Started with a ₹5,000 "onboarding deposit" which was never refunded and the account was blocked.' },
    suspect: { platform: 'Telegram', url: 'https://t.me/earninghub_official', phone: '', account: 'UPI: earninghub@paytm', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Telegram group reported to platform trust & safety.', by: 'SI P. Nair' },
      { status: 'investigation', note: 'Beneficiary merchant wallet traced; refund initiated.', by: 'Insp. R. Banerjee' },
      { status: 'closed', note: '₹5,000 refunded to complainant on 02 Nov 2026. Complainant confirmed via email. Complaint closed.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010452', hoursAgo: 52, status: 'investigation', priority: 'high',
    category: 'sextortion',
    complainant: { name: 'Kavya Nair', mobile: '9447012351', email: 'kavya.nair@example.com', idType: 'Driving Licence', idNumber: 'KL-07-2020-998877', state: 'Kerala', district: 'Ernakulam', address: 'Villa 9, Kakkanad', pincode: '682030' },
    incident: { date: '2026-10-30', time: '22:15', amountLost: 0, description: 'Received a video call from an unknown WhatsApp number where a morphed obscene call was recorded. The caller is threatening to share it with my contacts unless ₹1,00,000 is paid. Profile appears part of a larger sextortion ring.' },
    suspect: { platform: 'WhatsApp', url: '', phone: '+91 77001 55667', account: '', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received. Complainant reassured about anonymity; digital traces preserved.', by: 'System' },
      { status: 'under-review', note: 'Device examination initiated; CDR requisitioned.', by: 'SI P. Nair' },
      { status: 'investigation', note: 'Two linked numbers traced to Rajasthan; look-out notice drafted. Victim support counsellor assigned.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010444', hoursAgo: 66, status: 'action-taken', priority: 'critical',
    category: 'ransomware',
    complainant: { name: 'Sundar Textiles Pvt. Ltd. (via R. Sundar)', mobile: '9841012352', email: 'rsundar@example.com', idType: 'PAN Card', idNumber: 'AAECS4512Q', state: 'Tamil Nadu', district: 'Coimbatore', address: 'SF No. 112, Kurichi Industrial Estate', pincode: '641021' },
    incident: { date: '2026-10-26', time: '03:12', amountLost: 0, description: 'Company file server encrypted by ransomware extension ".lockbit3", with an extortion note demanding 0.8 BTC. Backups were also encrypted. Business operations halted for three days.' },
    suspect: { platform: 'Ransomware group', url: 'Onion leak page', phone: '', account: '', wallet: 'bc1q...9xk2' },
    attachments: [{ originalName: 'ransom-note-screenshot.png', mime: 'image/png', size: 402330, sample: null }],
    timeline: [
      { status: 'submitted', note: 'Incident reported by IT manager.', by: 'System' },
      { status: 'under-review', note: 'Forensic image of server taken by CERT-In empanelled auditor.', by: 'SI A. Chatterjee' },
      { status: 'investigation', note: 'Initial vector identified as exposed RDP with weak credentials.', by: 'SI P. Nair' },
      { status: 'action-taken', note: 'Advisory issued; IoCs shared with CERT-In. Restoration from offline backup completed. No ransom paid.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010431', hoursAgo: 90, status: 'under-review', priority: 'normal',
    category: 'matrimonial',
    complainant: { name: 'Shreya Ghosh', mobile: '9832012353', email: 'shreya.ghosh@example.com', idType: 'Aadhaar Card', idNumber: '561033998712', state: 'West Bengal', district: 'Kolkata', address: '9, Ballygunge Circular Road', pincode: '700019' },
    incident: { date: '2026-10-05', time: '19:45', amountLost: 65000, description: 'Matched with a profile on a matrimonial site claiming to work abroad. Over two months, transferred ₹65,000 for "customs clearance of a gift". The person stopped responding and the profile was deleted.' },
    suspect: { platform: 'Matrimonial site', url: '', phone: '+44 7xxx xxx112', account: 'A/C 998877665544 (Union Bank)', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Platform asked to preserve profile metadata.', by: 'SI A. Chatterjee' },
    ],
  },
  {
    no: 'NCRP/2026/010420', hoursAgo: 118, status: 'closed', priority: 'normal',
    category: 'credit-card',
    complainant: { name: 'Yash Agarwal', mobile: '9717012354', email: 'yash.agarwal@example.com', idType: 'PAN Card', idNumber: 'AKQPA9901L', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', address: 'Tower C-1404, Sector 137, Noida', pincode: '201305' },
    incident: { date: '2026-09-18', time: '13:02', amountLost: 29950, description: 'Card details were skimmed after a food delivery order; four international transactions totalling ₹29,950 were made on a crypto merchant website within 12 minutes.' },
    suspect: { platform: 'Card not present', url: '', phone: '', account: 'Merchant: crypto-shop.example', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Chargeback raised with card network.', by: 'SI P. Nair' },
      { status: 'action-taken', note: 'Provisional credit of ₹29,950 issued by issuing bank.', by: 'Insp. R. Banerjee' },
      { status: 'closed', note: 'Chargeback upheld by network. Case closed with no loss to complainant.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010408', hoursAgo: 150, status: 'investigation', priority: 'high',
    category: 'upi-fraud',
    complainant: { name: 'Farhan Qureshi', mobile: '9920012355', email: 'farhan.q@example.com', idType: 'Aadhaar Card', idNumber: '331902885410', state: 'Maharashtra', district: 'Mumbai Suburban', address: 'Room 14, Andheri East', pincode: '400069' },
    incident: { date: '2026-09-22', time: '16:20', amountLost: 95000, description: 'Sold a motorcycle online. The "buyer" sent a QR code claiming it was to pay me; scanning it debited ₹95,000 in two transactions. Buyer\'s profile was fake and phone switched off.' },
    suspect: { platform: 'OLX + UPI', url: 'https://olx.example/ad/12345', phone: '+91 88800 12345', account: 'UPI: rahul.deals@oksbi', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'UTR verification done; two mule accounts flagged.', by: 'SI P. Nair' },
      { status: 'investigation', note: 'Mule account holder noticed under Section 35(3) BNSS; bank freeze extended. Amount partly recovered (₹32,000).', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010396', hoursAgo: 190, status: 'closed', priority: 'normal',
    category: 'social-media',
    complainant: { name: 'Neha Verma', mobile: '9811012356', email: 'neha.verma@example.com', idType: 'Voter ID', idNumber: 'DL/05/331/445566', state: 'Delhi', district: 'New Delhi', address: 'B-44, Lajpat Nagar II', pincode: '110024' },
    incident: { date: '2026-08-30', time: '09:10', amountLost: 0, description: 'Twitter/X account was hacked through a credential-phishing page and used to post scam crypto links to my followers for four hours.' },
    suspect: { platform: 'X (Twitter)', url: '', phone: '', account: '', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Emergency takedown request sent to platform grievance officer.', by: 'SI A. Chatterjee' },
      { status: 'action-taken', note: 'Account restored to complainant; fraudulent posts removed.', by: 'SI A. Chatterjee' },
      { status: 'closed', note: 'Complainant confirmed account recovery. Closed.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010383', hoursAgo: 240, status: 'action-taken', priority: 'normal',
    category: 'otp-bank-fraud',
    complainant: { name: 'Gurpreet Singh', mobile: '9814012357', email: 'gurpreet.s@example.com', idType: 'Aadhaar Card', idNumber: '129004556321', state: 'Punjab', district: 'Ludhiana', address: 'House 221, Model Town', pincode: '141002' },
    incident: { date: '2026-08-25', time: '20:40', amountLost: 15000, description: 'Caller posed as a credit card upgrade agent and obtained an OTP. ₹15,000 was withdrawn through a wallet top-up.' },
    suspect: { platform: 'Phone call', url: '', phone: '+91 60000 77889', account: 'Wallet: @fake agent', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Wallet provider issued KYC details.', by: 'SI P. Nair' },
      { status: 'action-taken', note: 'Wallet frozen; ₹15,000 refunded after nodal escalation.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010371', hoursAgo: 300, status: 'investigation', priority: 'high',
    category: 'job-fraud',
    complainant: { name: 'Abdul Rahman', mobile: '9847012358', email: 'abdul.r@example.com', idType: 'Passport', idNumber: 'M7712334', state: 'Kerala', district: 'Malappuram', address: 'Thazhepalam, Tirur', pincode: '676101' },
    incident: { date: '2026-07-28', time: '12:10', amountLost: 180000, description: 'Paid ₹1,80,000 to an "overseas recruitment agent" promising a technician job in Dubai. Visa and appointment letter were forged. The office shut down overnight and calls go unanswered.' },
    suspect: { platform: 'Facebook + WhatsApp', url: 'https://facebook.com/gulf.careers.example', phone: '+971 50 xxx 4412', account: 'A/C 3301922844, South Indian Bank', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Forged documents sent for forensic examination.', by: 'SI A. Chatterjee' },
      { status: 'investigation', note: 'Two agents arrested; charge-sheet under preparation. ₹60,000 recovered.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010367', hoursAgo: 330, status: 'submitted', priority: 'normal',
    category: 'ecommerce',
    complainant: { name: 'Tanya Bose', mobile: '9804012359', email: 'tanya.bose@example.com', idType: 'Aadhaar Card', idNumber: '881200445566', state: 'West Bengal', district: 'North 24 Parganas', address: 'AE-82, Sector 1, Salt Lake', pincode: '700064' },
    incident: { date: '2026-11-11', time: '17:55', amountLost: 3400, description: 'Paid ₹3,400 for a "limited edition" jacket through a WhatsApp business catalogue. Seller stopped replying after payment; other buyers report the same number.' },
    suspect: { platform: 'WhatsApp Business', url: '', phone: '+91 70003 55667', account: 'UPI: stylesbytanya@apl', wallet: '' },
    attachments: [],
    timeline: [{ status: 'submitted', note: 'Complaint received through the portal.', by: 'System' }],
  },
  {
    no: 'NCRP/2026/010355', hoursAgo: 380, status: 'closed', priority: 'normal',
    category: 'credit-card',
    complainant: { name: 'Vikram Joshi', mobile: '9823012360', email: 'vikram.joshi@example.com', idType: 'PAN Card', idNumber: 'AFZPJ7788M', state: 'Gujarat', district: 'Ahmedabad', address: 'B-12, Satellite Complex', pincode: '380015' },
    incident: { date: '2026-07-12', time: '11:00', amountLost: 8900, description: 'Duplicate card was issued by an imposter via IVR social engineering, then used at an ATM in another city.' },
    suspect: { platform: 'Card fraud', url: '', phone: '', account: 'ATM withdrawal - Surat', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'ATM CCTV requisitioned.', by: 'SI P. Nair' },
      { status: 'action-taken', note: 'Suspect identified and arrested by local police; ₹8,900 recovered.', by: 'Insp. R. Banerjee' },
      { status: 'closed', note: 'Amount returned to complainant. Case closed.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010342', hoursAgo: 430, status: 'under-review', priority: 'normal',
    category: 'investment-crypto',
    complainant: { name: 'Ishaan Gupta', mobile: '9810012361', email: 'ishaan.g@example.com', idType: 'Aadhaar Card', idNumber: '661902337788', state: 'Haryana', district: 'Gurugram', address: 'Sector 43, Huda City Centre', pincode: '122002' },
    incident: { date: '2026-10-20', time: '15:30', amountLost: 55000, description: 'Bought "mining hardware" on a Telegram marketplace that demanded full advance in USDT. Wallet received the funds but no hardware was ever shipped.' },
    suspect: { platform: 'Telegram', url: 'https://t.me/miners_bazaar', phone: '', account: '', wallet: 'TXk2...q4bV' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Chain analysis requested from FIU-IND liaison.', by: 'SI P. Nair' },
    ],
  },
  {
    no: 'NCRP/2026/010330', hoursAgo: 500, status: 'investigation', priority: 'critical',
    category: 'sextortion',
    complainant: { name: 'Anonymous (name withheld)', mobile: '9000012362', email: 'anon.2026@example.com', idType: 'Other', idNumber: 'XXXXXXXX', state: 'Rajasthan', district: 'Jaipur', address: 'Address withheld for safety', pincode: '302001' },
    incident: { date: '2026-07-04', time: '23:10', amountLost: 200000, description: 'Was trapped in a sextortion scam on Instagram; paid ₹2,00,000 in installments over six weeks after threats to share a made-up "video". Reached out after being unable to continue paying.' },
    suspect: { platform: 'Instagram + WhatsApp', url: '', phone: '+91 79000 11002', account: 'Multiple mule A/Cs', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received with identity protection flag.', by: 'System' },
      { status: 'under-review', note: 'Physical & mental wellbeing check done. Victim assigned a counsellor.', by: 'SI A. Chatterjee' },
      { status: 'investigation', note: 'Gang operating from Mewat identified; five accounts frozen; ₹68,000 recovered so far.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010318', hoursAgo: 570, status: 'closed', priority: 'normal',
    category: 'matrimonial',
    complainant: { name: 'Deepa Krishnan', mobile: '9846012363', email: 'deepa.k@example.com', idType: 'Aadhaar Card', idNumber: '220019887766', state: 'Tamil Nadu', district: 'Chennai', address: 'Flat 6C, Besant Nagar', pincode: '600090' },
    incident: { date: '2026-06-18', time: '10:45', amountLost: 25000, description: 'Matrimonial profile asked for money for a "medical emergency" of their mother. Sent ₹25,000. Later found identical profile photos used on multiple fake profiles.' },
    suspect: { platform: 'Matrimonial site', url: '', phone: '+91 88001 44556', account: 'UPI: care.help@ybl', wallet: '' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received.', by: 'System' },
      { status: 'under-review', note: 'Reverse image search and platform notice completed.', by: 'SI P. Nair' },
      { status: 'action-taken', note: 'Profile removed; beneficiary account frozen with ₹11,000 balance.', by: 'Insp. R. Banerjee' },
      { status: 'closed', note: '₹11,000 refunded; remaining amount unrecoverable. Case closed with complainant consent.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010306', hoursAgo: 640, status: 'action-taken', priority: 'normal',
    category: 'ransomware',
    complainant: { name: 'City Care Hospital (via S. Menon)', mobile: '9446012364', email: 'admin@citycare.example.com', idType: 'Other', idNumber: 'GSTIN 29AAECC1234F1Z5', state: 'Karnataka', district: 'Bengaluru Urban', address: '80 Feet Road, Koramangala', pincode: '560095' },
    incident: { date: '2026-06-02', time: '02:30', amountLost: 0, description: 'Hospital management system and patient records encrypted by ransomware; attackers exfiltrated 40 GB of data and demanded payment to prevent leak.' },
    suspect: { platform: 'Ransomware group', url: 'Onion leak site', phone: '', account: '', wallet: '3Fz9...kL2p' },
    attachments: [],
    timeline: [
      { status: 'submitted', note: 'Complaint received from hospital administrator.', by: 'System' },
      { status: 'under-review', note: 'CERT-In incident response team engaged.', by: 'SI A. Chatterjee' },
      { status: 'investigation', note: 'Data leak assessment completed; patients intimated as per DPDP Act obligations.', by: 'SI P. Nair' },
      { status: 'action-taken', note: 'Systems restored from immutable backup; leak site takedown requested via international liaison.', by: 'Insp. R. Banerjee' },
    ],
  },
  {
    no: 'NCRP/2026/010294', hoursAgo: 720, status: 'submitted', priority: 'high',
    category: 'other',
    complainant: { name: 'Ritu Sharma', mobile: '9829012365', email: 'ritu.sharma@example.com', idType: 'Aadhaar Card', idNumber: '441908772211', state: 'Madhya Pradesh', district: 'Indore', address: '21, Vijay Nagar Main Road', pincode: '452010' },
    incident: { date: '2026-11-12', time: '19:25', amountLost: 0, description: 'Received an email from a lookalike domain of my bank (icici-secure-login.example) asking me to "re-verify PAN". The link opened a fake net-banking page. I did not enter credentials but want to report it.' },
    suspect: { platform: 'Phishing email', url: 'https://icici-secure-login.example', phone: '', account: '', wallet: '' },
    attachments: [{ originalName: 'phishing-email.png', mime: 'image/png', size: 128440, sample: 'sample-phishing-email.png' }],
    timeline: [{ status: 'submitted', note: 'Complaint received through the portal.', by: 'System' }],
  },
];

function buildSeed() {
  const { CATEGORIES: cats } = require('./config');
  const complaints = SEED_COMPLAINTS.map((c, i) => {
    const cat = cats.find((x) => x.id === c.category) || cats[cats.length - 1];
    const createdAt = hoursAgo(c.hoursAgo);
    const timeline = c.timeline.map((t, idx) => ({
      at: hoursAgo(c.hoursAgo - idx * Math.max(1, Math.floor(c.hoursAgo / (c.timeline.length + 1)))),
      status: t.status,
      note: t.note,
      by: t.by,
    }));
    const attachments = (c.attachments || []).map((a, k) => ({
      id: `ev-${i}-${k}`,
      originalName: a.originalName,
      storedName: null,
      mime: a.mime,
      size: a.size,
      uploadedAt: createdAt,
      url: a.sample ? `/img/samples/${a.sample}` : '/img/samples/evidence-placeholder.svg',
      seeded: true,
    }));
    return {
      id: i + 1,
      complaintNo: c.no,
      firNo: ['investigation', 'action-taken', 'closed'].includes(c.status)
        ? `FIR-${String(120 + i).padStart(4, '0')}/2026`
        : null,
      createdAt,
      updatedAt: timeline[timeline.length - 1].at,
      status: c.status,
      priority: c.priority,
      category: cat.id,
      categoryLabel: cat.label,
      complainant: c.complainant,
      incident: c.incident,
      suspect: c.suspect,
      attachments,
      timeline,
      assignedTo: c.timeline[c.timeline.length - 1].by,
      remarks: '',
    };
  });

  return {
    meta: { version: 1, seededAt: new Date().toISOString() },
    counters: { complaintNo: 10482, seq: complaints.length },
    admins: [
      {
        id: 1,
        username: 'admin',
        passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'Admin@1930'),
        name: 'Insp. R. Banerjee',
        role: 'admin',
        unit: 'Cyber Crime Coordination Centre',
      },
      {
        id: 2,
        username: 'officer',
        passwordHash: hashPassword('Officer@1930'),
        name: 'SI A. Chatterjee',
        role: 'officer',
        unit: 'Cyber Cell, Howrah',
      },
    ],
    complaints,
  };
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function save() {
  ensureDir();
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

let saveTimer = null;
function saveDebounced() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      save();
    } catch (err) {
      console.error('[db] save failed:', err.message);
    }
  }, 250);
}

function load() {
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (state && Array.isArray(state.complaints) && state.counters) return state;
    } catch (err) {
      console.warn('[db] could not parse db.json, reseeding:', err.message);
    }
  }
  state = buildSeed();
  save();
  return state;
}

function getState() {
  if (!state) load();
  return state;
}

/* ------------------------------------------------------------------ */
/* Complaint helpers                                                   */
/* ------------------------------------------------------------------ */

function makeComplaintNo(year = new Date().getFullYear()) {
  const s = getState();
  s.counters.complaintNo = (s.counters.complaintNo || 0) + 1;
  const n = String(s.counters.complaintNo).padStart(6, '0');
  return `NCRP/${year}/${n}`;
}

function addComplaint(data) {
  const s = getState();
  const id = ++s.counters.seq;
  const now = new Date().toISOString();
  const cat = CATEGORIES.find((c) => c.id === data.category) || CATEGORIES[CATEGORIES.length - 1];
  const complaint = {
    id,
    complaintNo: makeComplaintNo(),
    firNo: null,
    createdAt: now,
    updatedAt: now,
    status: 'submitted',
    priority: data.priority || 'normal',
    category: cat.id,
    categoryLabel: cat.label,
    complainant: data.complainant,
    incident: data.incident,
    suspect: data.suspect || {},
    attachments: data.attachments || [],
    timeline: [{ at: now, status: 'submitted', note: 'Complaint received through the portal.', by: 'System' }],
    assignedTo: null,
    remarks: '',
  };
  s.complaints.push(complaint);
  saveDebounced();
  return complaint;
}

function findComplaint({ complaintNo, mobile }) {
  const s = getState();
  const norm = (v) => String(v || '').replace(/\D/g, '').slice(-10);
  return s.complaints.find(
    (c) =>
      String(c.complaintNo).toLowerCase() === String(complaintNo || '').trim().toLowerCase() &&
      norm(c.complainant.mobile) === norm(mobile) &&
      norm(mobile).length === 10
  );
}

function getComplaintById(id) {
  const s = getState();
  return s.complaints.find((c) => c.id === Number(id));
}

function getComplaintByNo(no) {
  const s = getState();
  return s.complaints.find((c) => c.complaintNo.toLowerCase() === String(no || '').toLowerCase());
}

function updateComplaint(id, patch, { statusNote = '', by = 'System' } = {}) {
  const c = getComplaintById(id);
  if (!c) return null;
  const now = new Date().toISOString();
  Object.assign(c, patch, { updatedAt: now });
  if (patch.status && patch.status !== c.status) {
    // handled by caller passing status explicitly
  }
  if (statusNote) {
    c.timeline.push({ at: now, status: patch.status || c.status, note: statusNote, by });
  }
  saveDebounced();
  return c;
}

function addTimelineEntry(id, { status, note, by }) {
  const c = getComplaintById(id);
  if (!c) return null;
  const now = new Date().toISOString();
  if (status) c.status = status;
  c.timeline.push({ at: now, status: status || c.status, note, by });
  c.updatedAt = now;
  saveDebounced();
  return c;
}

function addAttachments(id, files) {
  const c = getComplaintById(id);
  if (!c) return null;
  c.attachments.push(...files);
  c.updatedAt = new Date().toISOString();
  saveDebounced();
  return c;
}

/* ------------------------------------------------------------------ */
/* Queries & stats                                                     */
/* ------------------------------------------------------------------ */

function listComplaints({ q = '', status = '', category = '', state = '', priority = '', sort = 'newest', page = 1, pageSize = 10 } = {}) {
  const s = getState();
  let rows = [...s.complaints];

  const term = String(q).trim().toLowerCase();
  if (term) {
    rows = rows.filter((c) =>
      [
        c.complaintNo, c.firNo, c.complainant.name, c.complainant.mobile, c.complainant.email,
        c.complainant.district, c.complainant.state, c.categoryLabel, c.incident.description,
      ].filter(Boolean).join(' ').toLowerCase().includes(term)
    );
  }
  if (status) rows = rows.filter((c) => c.status === status);
  if (category) rows = rows.filter((c) => c.category === category);
  if (state) rows = rows.filter((c) => c.complainant.state === state);
  if (priority) rows = rows.filter((c) => c.priority === priority);

  const sorters = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
    amount: (a, b) => (b.incident.amountLost || 0) - (a.incident.amountLost || 0),
    updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  };
  rows.sort(sorters[sort] || sorters.newest);

  const total = rows.length;
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.max(1, Number(pageSize) || 10);
  const start = (p - 1) * ps;
  return { rows: rows.slice(start, start + ps), total, page: p, pageSize: ps, pages: Math.max(1, Math.ceil(total / ps)) };
}

function stats() {
  const s = getState();
  const rows = s.complaints;
  const byStatus = {};
  const byCategory = {};
  const byState = {};
  let amount = 0;
  for (const c of rows) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    byState[c.complainant.state] = (byState[c.complainant.state] || 0) + 1;
    amount += Number(c.incident.amountLost || 0);
  }
  const since = Date.now() - 7 * 24 * 3600 * 1000;
  const last7 = rows.filter((c) => new Date(c.createdAt).getTime() >= since).length;

  // 30-day daily series
  const series = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000);
    const key = day.toISOString().slice(0, 10);
    const count = rows.filter((c) => c.createdAt.slice(0, 10) === key).length;
    series.push({ date: key, count });
  }

  return { total: rows.length, byStatus, byCategory, byState, amount, last7, series };
}

/* ------------------------------------------------------------------ */
/* Admins                                                              */
/* ------------------------------------------------------------------ */

function findAdminByUsername(username) {
  const s = getState();
  return s.admins.find((a) => a.username.toLowerCase() === String(username || '').toLowerCase());
}
function getAdminById(id) {
  const s = getState();
  return s.admins.find((a) => a.id === Number(id));
}

module.exports = {
  DB_FILE,
  DATA_DIR,
  load,
  getState,
  save,
  addComplaint,
  findComplaint,
  getComplaintById,
  getComplaintByNo,
  updateComplaint,
  addTimelineEntry,
  addAttachments,
  listComplaints,
  stats,
  findAdminByUsername,
  getAdminById,
  buildSeed,
};
