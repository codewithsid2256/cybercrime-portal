'use strict';

/**
 * Central configuration and reference data for the portal.
 * Everything here is plain data so it can be reused by views & validation.
 */

const SITE = {
  name: 'National Cyber Crime Reporting Portal',
  nameHi: 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल',
  short: 'NCRP',
  helpline: '1930',
  emergency: '112',
  email: 'support@ncrp.gov.in',
  address: 'Cyber Crime Coordination Centre, Ministry of Home Affairs, New Delhi – 110001',
  prototypeNotice:
    'DEMONSTRATION PROTOTYPE — This website is an independent academic/portfolio project. It is NOT affiliated with, endorsed by, or operated by the Government of India or any police authority. All complaint records shown are fictitious sample data.',
  lastUpdated: '13 November 2026',
};

const CATEGORIES = [
  {
    id: 'upi-fraud',
    label: 'UPI / Payment Fraud',
    short: 'UPI Fraud',
    icon: 'upi',
    desc: 'Fake payment requests, QR code fraud, "collect request" scams, fraudulent cashback links.',
  },
  {
    id: 'otp-bank-fraud',
    label: 'OTP / Banking Fraud',
    short: 'Bank Fraud',
    icon: 'bank',
    desc: 'SIM swap, OTP theft, unauthorised net-banking or card transactions, KYC update scams.',
  },
  {
    id: 'credit-card',
    label: 'Credit / Debit Card Fraud',
    short: 'Card Fraud',
    icon: 'card',
    desc: 'Card skimming, stolen card details, international transactions you never made.',
  },
  {
    id: 'social-media',
    label: 'Social Media Crime',
    short: 'Social Media',
    icon: 'social',
    desc: 'Account hacking, fake profiles, impersonation, stalking, abusive or morphed content.',
  },
  {
    id: 'sextortion',
    label: 'Cyber Bullying / Sextortion',
    short: 'Harassment',
    icon: 'alert',
    desc: 'Intimate-image threats, video-call blackmail, online harassment and defamation.',
  },
  {
    id: 'job-fraud',
    label: 'Job / Task Fraud',
    short: 'Job Fraud',
    icon: 'briefcase',
    desc: 'Fake work-from-home offers, Telegram "like & earn" tasks, investment in fake portals.',
  },
  {
    id: 'ecommerce',
    label: 'Online Shopping Fraud',
    short: 'E-commerce',
    icon: 'cart',
    desc: 'Non-delivery of goods, counterfeit products, fake sellers, refund and lottery scams.',
  },
  {
    id: 'investment-crypto',
    label: 'Investment / Crypto Fraud',
    short: 'Investment',
    icon: 'trend',
    desc: 'Fake trading apps, crypto wallets, ponzi schemes, guaranteed-return investment groups.',
  },
  {
    id: 'ransomware',
    label: 'Hacking / Ransomware',
    short: 'Hacking',
    icon: 'bug',
    desc: 'Device or website hacking, ransomware attacks, data leaks, unauthorised access.',
  },
  {
    id: 'matrimonial',
    label: 'Matrimonial / Romance Fraud',
    short: 'Romance Fraud',
    icon: 'heart',
    desc: 'Fake profiles on matrimonial or dating sites, emotional manipulation, money requests.',
  },
  {
    id: 'other',
    label: 'Other Cyber Crime',
    short: 'Other',
    icon: 'grid',
    desc: 'Any other cyber incident not covered by the categories above.',
  },
];

const STATUSES = [
  {
    id: 'submitted',
    label: 'Submitted',
    tone: 'blue',
    desc: 'Your complaint has been received and queued for verification.',
    citizen: 'Complaint received. It will be verified by a cyber cell officer shortly.',
  },
  {
    id: 'under-review',
    label: 'Under Review',
    tone: 'amber',
    desc: 'An officer is verifying the facts, evidence and linked transactions.',
    citizen: 'A cyber cell officer is reviewing your complaint and attached evidence.',
  },
  {
    id: 'investigation',
    label: 'Under Investigation',
    tone: 'violet',
    desc: 'The complaint has been converted into an investigation and referred to the concerned unit.',
    citizen: 'Your complaint is under investigation. You may be contacted for additional details.',
  },
  {
    id: 'action-taken',
    label: 'Action Taken',
    tone: 'green',
    desc: 'Action has been initiated (e.g. bank hold, freeze request, notice to platform).',
    citizen: 'Action has been initiated on your complaint (e.g. bank freeze / takedown notice).',
  },
  {
    id: 'closed',
    label: 'Closed',
    tone: 'slate',
    desc: 'The complaint has been closed. Closure remarks are available in the timeline.',
    citizen: 'Your complaint has been closed. Refer to the remarks shared by the officer.',
  },
];

const ID_TYPES = ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving Licence', 'Voter ID', 'Other'];

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'video/mp4', 'video/quicktime',
  'text/plain',
]);

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file

const CHART_COLORS = ['#0d3866', '#0e7490', '#c2410c', '#15803d', '#7c3aed', '#b91c1c', '#0369a1', '#a16207', '#be185d', '#374151', '#0891b2'];

// Baseline figures so the public counter band looks like a live national portal.
// (Prototype only — clearly disclosed in the footer.)
const PUBLIC_BASELINE = {
  complaints: 48213,
  resolved: 21764,
  amountSaved: 1934500000, // ₹193.45 crore
  avgResponseHours: 4.2,
};

module.exports = {
  SITE,
  CATEGORIES,
  STATUSES,
  ID_TYPES,
  STATES,
  ALLOWED_MIME,
  MAX_FILES,
  MAX_FILE_BYTES,
  CHART_COLORS,
  PUBLIC_BASELINE,
};
