'use strict';

const { icon, layout, alertBox } = require('./layout');
const { escapeHtml } = require('../util');

const ADVISORIES = [
  {
    slug: 'qr-code-scam',
    title: 'The QR code trap: scanning never receives money',
    date: '2026-11-10',
    tag: 'UPI Fraud',
    img: '/img/awareness-upi.png',
    summary: 'Fraudsters posing as buyers or "bank officers" send a QR code and ask you to scan it to receive a refund. Scanning authorises a debit instead.',
    body: [
      'A QR code encodes a payment instruction. When you scan and approve it, money moves <strong>out</strong> of your account — it can never move money in.',
      'Common pretexts: a buyer for an item you listed online, a "refund" from a bank, a delivery agent confirming an address, or a customer support agent "verifying" a transaction.',
      'Never scan a code sent by an unknown person to receive money. To receive a payment you only need to share your UPI ID or a personal QR that you generated in your own app.',
      'If you scanned a fraudulent code, call <strong>1930</strong> immediately and file a complaint on this portal. The first hour is critical for freezing the beneficiary account.',
    ],
  },
  {
    slug: 'phishing-emails',
    title: 'Spotting phishing: five checks before you click',
    date: '2026-11-04',
    tag: 'Phishing',
    img: '/img/awareness-phishing.png',
    summary: 'Lookalike domains, urgency, and credential-harvesting pages are the three pillars of most phishing attacks. Here is how to verify before you click.',
    body: [
      'Check the exact domain, not just the name: <em>icici-secure-login.example</em> is not <em>icicibank.com</em>. Fraudsters register close variants with extra words or hyphens.',
      'Beware of urgency: "your account will be frozen in 24 hours" is designed to make you act before you think.',
      'No bank or government portal will ask for your net-banking password, card PIN, CVV or OTP over email, SMS or a call.',
      'Hover over links to preview the real destination. On mobile, long-press the link and look at the preview.',
      'When in doubt, open your bank app directly (or type the domain yourself) instead of following the link.',
    ],
  },
  {
    slug: 'social-media-hygiene',
    title: 'Locking down your social media profiles',
    date: '2026-10-27',
    tag: 'Social Media',
    img: '/img/awareness-social.png',
    summary: 'Most social media crimes begin with public profile data. A ten-minute privacy review dramatically reduces your exposure.',
    body: [
      'Set your profile and friends list to "friends only". Fraudsters use your friends\' names and photos to impersonate you to people who trust you.',
      'Enable two-factor authentication and review active sessions for unknown devices.',
      'Avoid posting live location, boarding passes, ID documents or photos of your keys and documents.',
      'Report fake profiles to the platform and file a complaint here if money was demanded or your identity is being misused.',
      'If someone threatens to leak intimate images, do not pay. Preserve the chat, stop responding and report immediately — this is a punishable crime.',
    ],
  },
];

function awarenessPage({ user }) {
  const cards = ADVISORIES.map((a) => `
    <article class="adv-card" id="${a.slug}">
      <div class="adv-img"><img src="${a.img}" alt="" loading="lazy"></div>
      <div class="adv-body">
        <div class="adv-meta"><span class="chip chip-xs">${escapeHtml(a.tag)}</span><span class="muted-sm">${escapeHtml(new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))}</span></div>
        <h3>${a.title}</h3>
        <p>${a.summary}</p>
        <details class="adv-details">
          <summary>Read the full advisory ${icon('chevronDown', 15)}</summary>
          <ul class="adv-points">${a.body.map((b) => `<li>${b}</li>`).join('')}</ul>
        </details>
      </div>
    </article>`).join('');

  const dos = ['Verify the UPI ID of a new payee in your app before paying.', 'Enable transaction alerts for every debit.', 'Use official app stores only.', 'Keep your phone OS and banking apps updated.', 'Use a screen lock and device encryption.'];
  const donts = ['Never screen-share with anyone claiming to be a bank or police officer.', 'Never install remote-access apps on request.', 'Never share OTPs — not even with someone who knows your account number.', 'Never pay to "unlock" profits or "release" a prize.', 'Never accept a job that asks you to pay first.'];

  const body = `
  <section class="page-head">
    <div class="container">
      <span class="kicker">Awareness</span>
      <h1>Advisories &amp; cyber safety</h1>
      <p class="page-sub">Timely, plain-language advice on the scams being reported most often.</p>
    </div>
  </section>

  <section class="section section-tight">
    <div class="container">
      <div class="adv-grid">${cards}</div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="section-head"><div><span class="kicker">Quick reference</span><h2>The five-way safety rule</h2></div></div>
      <div class="do-dont">
        <div class="do-card">
          <h3>${icon('check', 19)} Always do this</h3>
          <ul class="tick-list">${dos.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
        </div>
        <div class="dont-card">
          <h3>${icon('x', 19)} Never do this</h3>
          <ul class="cross-list">${donts.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="cta-band">
        <div>
          <h2>Been a victim of fraud?</h2>
          <p>Time is the single biggest factor in recovering stolen money. Report immediately — you will get an instant acknowledgement number.</p>
        </div>
        <div class="cta-actions">
          <a class="btn btn-primary" href="/report">${icon('shield', 17)} File a complaint</a>
          <a class="btn btn-outline-light" href="tel:1930">${icon('phone', 17)} Call 1930</a>
        </div>
      </div>
    </div>
  </section>`;

  return layout({ title: 'Awareness', active: 'awareness', user, body });
}

const RESOURCES = [
  { name: 'Complaint registration guide', type: 'PDF', size: 'Download', href: '/downloads/complaint-guide', desc: 'A step-by-step illustrated guide to filing a cyber crime complaint through the portal.' },
  { name: 'Evidence checklist', type: 'TXT', size: 'Download', href: '/downloads/evidence-checklist', desc: 'What screenshots, statements and identifiers to attach for each crime category.' },
  { name: 'Cyber safety checklist', type: 'TXT', size: 'Download', href: '/downloads/cyber-safety-checklist', desc: 'A printable one-page safety checklist for families, schools and small businesses.' },
];

function resourcesPage({ user }) {
  const rows = RESOURCES.map((r) => `
    <div class="res-row">
      <span class="res-ico">${icon('file', 22)}</span>
      <div class="res-main">
        <strong>${escapeHtml(r.name)}</strong>
        <span>${escapeHtml(r.desc)}</span>
      </div>
      <span class="res-type">${r.type}</span>
      <a class="btn btn-sm btn-outline" href="${r.href}">${icon('download', 15)} ${r.size}</a>
    </div>`).join('');

  const body = `
  <section class="page-head">
    <div class="container">
      <span class="kicker">Resources</span>
      <h1>Downloads &amp; guidance</h1>
      <p class="page-sub">Printable checklists and guides to help you prepare an effective complaint.</p>
    </div>
  </section>
  <section class="section section-tight">
    <div class="container">
      <div class="res-list">${rows}</div>

      <div class="section-head" style="margin-top:56px"><div><span class="kicker">External links</span><h2>Official cyber-safety resources</h2></div></div>
      <div class="link-grid">
        <a class="link-card" href="https://cybercrime.gov.in" target="_blank" rel="noopener"><span class="link-ico tone-blue">${icon('globe', 20)}</span><span><strong>cybercrime.gov.in</strong><span>Official National Cyber Crime Reporting Portal</span></span>${icon('external', 15)}</a>
        <a class="link-card" href="https://www.cert-in.org.in" target="_blank" rel="noopener"><span class="link-ico tone-teal">${icon('shield', 20)}</span><span><strong>CERT-In</strong><span>National nodal agency for cyber incident response</span></span>${icon('external', 15)}</a>
        <a class="link-card" href="https://www.rbi.org.in" target="_blank" rel="noopener"><span class="link-ico tone-amber">${icon('bank', 20)}</span><span><strong>RBI Awareness</strong><span>Reserve Bank of India consumer awareness pages</span></span>${icon('external', 15)}</a>
        <a class="link-card" href="https://www.mha.gov.in" target="_blank" rel="noopener"><span class="link-ico tone-rose">${icon('siren', 20)}</span><span><strong>Ministry of Home Affairs</strong><span>Official ministry portal</span></span>${icon('external', 15)}</a>
      </div>
      <p class="muted-sm" style="margin-top:16px">${icon('info', 13)} External links open third-party websites. This prototype is not responsible for their content.</p>
    </div>
  </section>`;
  return layout({ title: 'Resources', active: 'resources', user, body });
}

function contactPage({ user }) {
  const body = `
  <section class="page-head">
    <div class="container">
      <span class="kicker">Contact</span>
      <h1>Contact &amp; offices</h1>
      <p class="page-sub">Use the helpline for urgent frauds; use the form for portal-related queries only.</p>
    </div>
  </section>
  <section class="section section-tight">
    <div class="container contact-wrap">
      <div class="contact-main">
        <div class="contact-cards">
          <a class="contact-card" href="tel:1930"><span class="contact-ico blue">${icon('phone', 22)}</span><div><strong>Helpline 1930</strong><span>24×7 for financial cyber frauds</span></div></a>
          <a class="contact-card" href="mailto:support@ncrp.gov.in"><span class="contact-ico teal">${icon('mail', 22)}</span><div><strong>support@ncrp.gov.in</strong><span>Portal queries &amp; grievance escalation</span></div></a>
          <div class="contact-card"><span class="contact-ico amber">${icon('pin', 22)}</span><div><strong>Cyber Crime Coordination Centre</strong><span>Ministry of Home Affairs, New Delhi – 110001</span></div></div>
          <div class="contact-card"><span class="contact-ico violet">${icon('clock', 22)}</span><div><strong>Portal availability</strong><span>Online complaints: 24×7 · Office hours: 9:30 am – 6:00 pm (Mon–Fri)</span></div></div>
        </div>
        <div class="card form-card">
          <div class="card-head"><h2>${icon('chat', 18)} Send a message</h2></div>
          <div class="card-body">
            <form class="contact-form" id="contactForm">
              <div class="form-grid">
                <div class="field"><label for="c-name">Your name <span class="req">*</span></label><input id="c-name" required></div>
                <div class="field"><label for="c-email">Email <span class="req">*</span></label><input id="c-email" type="email" required></div>
                <div class="field field-wide"><label for="c-subject">Subject <span class="req">*</span></label><input id="c-subject" required></div>
                <div class="field field-wide"><label for="c-msg">Message <span class="req">*</span></label><textarea id="c-msg" rows="5" required placeholder="Do not include passwords, OTPs or full card numbers."></textarea></div>
              </div>
              <button class="btn btn-primary" type="submit">${icon('mail', 16)} Send message</button>
              <p class="muted-sm" style="margin-top:12px">${icon('info', 13)} This prototype form is front-end only — no message is transmitted. For a real emergency always call 1930 or 112.</p>
            </form>
          </div>
        </div>
      </div>
      <aside class="contact-side">
        <div class="side-card">
          <h3>${icon('siren', 18)} In an emergency</h3>
          <p class="muted-sm">If someone is threatening you right now, or money is actively being transferred, use the phone lines — do not wait for email.</p>
          <a class="btn btn-primary btn-block" href="tel:1930">${icon('phone', 16)} 1930 · Fraud helpline</a>
          <a class="btn btn-outline btn-block" href="tel:112" style="margin-top:10px">${icon('alert', 16)} 112 · Emergency</a>
        </div>
        <div class="side-card side-card-muted">
          <h3>${icon('book', 18)} Before you write</h3>
          <p class="muted-sm">Most questions are answered in the FAQ — including how to retrieve a lost complaint number and how to add more evidence to an existing complaint.</p>
          <a class="btn btn-outline btn-block" href="/page/faq">Read the FAQ</a>
        </div>
      </aside>
    </div>
  </section>`;
  return layout({ title: 'Contact', active: 'contact', user, body, scripts: ['/js/contact.js'] });
}

const STATIC_PAGES = {
  faq: {
    title: 'Frequently Asked Questions',
    kicker: 'Help',
    intro: 'Answers to common questions about reporting and tracking cyber crime on this portal.',
    body: `
      <div class="faq-list">
        <details class="faq-item" open><summary>Is filing a complaint on this portal free?</summary><p>Yes. Registering a complaint, uploading evidence and tracking status are all free of cost. No payment is ever requested by the portal or by any officer on its behalf.</p></details>
        <details class="faq-item"><summary>What evidence should I attach?</summary><p>Screenshots of chats, emails and the fraudulent payment page; bank statements highlighting the debits with UTR numbers; the phone numbers, UPI IDs, URLs or handles used by the suspect. Up to five files of 5 MB each can be attached at submission; more can be shared with the investigating officer later.</p></details>
        <details class="faq-item"><summary>How quickly will my complaint be reviewed?</summary><p>Financial frauds are triaged first. In this prototype, the status timeline shows the officer workflow — verification, investigation and action. In the real system, first response is usually a matter of hours for financial fraud and a few working days for other categories.</p></details>
        <details class="faq-item"><summary>Can I file a complaint anonymously?</summary><p>You must provide contact details so officers can verify the complaint and follow up. However, sensitive categories such as sextortion and harassment can be flagged for additional confidentiality, and your name is never displayed publicly.</p></details>
        <details class="faq-item"><summary>I lost my complaint number. What now?</summary><p>Check the acknowledgement email or SMS from the time of filing. If you cannot find it, call 1930 with your registered mobile number. In this prototype, you can also search with a sample record shown on the Track page.</p></details>
        <details class="faq-item"><summary>Is this the official government portal?</summary><p>No. This website is a demonstration prototype built as an independent project. It is not affiliated with the Government of India. For official complaints, use cybercrime.gov.in or call 1930.</p></details>
        <details class="faq-item"><summary>What should I do immediately after a financial fraud?</summary><p>Call 1930, inform your bank to block the channel used and freeze the beneficiary, then file a complaint here with transaction screenshots. Speed is decisive — action within the first hour dramatically improves recovery chances.</p></details>
      </div>`,
  },
  privacy: {
    title: 'Privacy Policy',
    kicker: 'Legal',
    intro: 'How this prototype handles the information you enter.',
    body: `
      <div class="prose">
        <h2>1. What this prototype stores</h2>
        <p>Complaints submitted through this demonstration site — including the details you type and any evidence files you upload — are stored on the server hosting the prototype (for example, an ephemeral container on a cloud platform). Records may be reset at any time without notice.</p>
        <h2>2. Do not submit real personal data</h2>
        <p>This is not an official government service. <strong>Do not submit real identity numbers, real financial account details, or real evidence of an actual crime.</strong> Use fictitious data when exploring the portal. For a real incident, use the official portal at cybercrime.gov.in or call 1930.</p>
        <h2>3. Cookies</h2>
        <p>The only cookie used is a signed session cookie for officer logins on the admin console. No analytics, advertising or third-party tracking cookies are used.</p>
        <h2>4. Uploaded files</h2>
        <p>Uploaded files are stored in the application's uploads directory and served only to authenticated officers and to the citizen who verifies a complaint using its complaint number and mobile number.</p>
        <h2>5. Data removal</h2>
        <p>Because this is a prototype environment, records may be deleted whenever the service restarts or is redeployed. There is no guarantee of retention.</p>
        <h2>6. Contact</h2>
        <p>For questions about this prototype, use the contact page. For actual cyber crime, always use official channels.</p>
      </div>`,
  },
  terms: {
    title: 'Terms of Use',
    kicker: 'Legal',
    intro: 'Conditions for using this demonstration website.',
    body: `
      <div class="prose">
        <h2>1. Demonstration only</h2>
        <p>This website is a prototype created for demonstration and educational purposes. It is not operated by, endorsed by, or affiliated with the Government of India, the Ministry of Home Affairs, or any police authority. All names, complaint numbers and case records are fictitious.</p>
        <h2>2. No legal effect</h2>
        <p>Submitting a complaint here does not constitute a legal complaint, FIR, or communication with any authority. No action will be taken on any submission.</p>
        <h2>3. Acceptable use</h2>
        <p>Do not use this prototype to upload unlawful content, attempt to gain unauthorised access, or disrupt the service. Do not impersonate any person or authority.</p>
        <h2>4. Accuracy</h2>
        <p>Workflow descriptions, statistics and response times shown here are illustrative and may not reflect real procedures or performance.</p>
        <h2>5. Liability</h2>
        <p>The prototype is provided "as is" without warranties. The authors are not liable for any loss arising from its use.</p>
      </div>`,
  },
  accessibility: {
    title: 'Accessibility Statement',
    kicker: 'Help',
    intro: 'This prototype aims to follow the principles of the GIGW accessibility guidelines.',
    body: `
      <div class="prose">
        <h2>Measures taken</h2>
        <ul>
          <li>Semantic HTML landmarks, skip-to-content link and logical heading order.</li>
          <li>Keyboard-operable navigation, forms and the multi-step complaint wizard.</li>
          <li>Colour combinations chosen for WCAG AA contrast where possible.</li>
          <li>Visible focus outlines on all interactive elements.</li>
          <li>Form labels, error messages and hints associated with their inputs.</li>
          <li>Status is never communicated by colour alone — badges and text labels are used together.</li>
        </ul>
        <h2>Known limitations</h2>
        <ul>
          <li>The Hindi toggle is illustrative and does not translate all content.</li>
          <li>Decorative illustrations carry empty alt text; key information is always available in text form.</li>
        </ul>
        <h2>Feedback</h2>
        <p>Accessibility issues can be reported through the contact page.</p>
      </div>`,
  },
  about: {
    title: 'About this Portal',
    kicker: 'About',
    intro: 'A citizen-first redesign prototype of a national cyber crime reporting portal.',
    body: `
      <div class="prose">
        <p>This portal prototype demonstrates how a national cyber crime reporting service could look and behave — from a guided multi-step complaint form with evidence upload, to a secure tracking page, to an officer console with triage, case notes and status workflows.</p>
        <h2>What is included</h2>
        <ul>
          <li><strong>Citizen side:</strong> home, crime-type guide, 4-step complaint wizard with file uploads and captcha, instant acknowledgement, status tracking with timeline and evidence review, helpline directory, awareness advisories and downloadable checklists.</li>
          <li><strong>Officer side:</strong> secure login, dashboard with workload analytics, searchable complaint register, case detail view with evidence gallery, status and priority updates, officer notes and CSV export.</li>
          <li><strong>Engineering:</strong> an Express application with server-rendered HTML, a JSON persistence layer, signed session cookies, bcrypt password hashing, upload validation and rate limiting.</li>
        </ul>
        <h2>What it is not</h2>
        <p>This is not an official government service and is not connected to any police database, bank or telecom system. Sample records are fictitious. See the footer disclaimer.</p>
        <h2>Technology</h2>
        <p>Node.js · Express · Server-rendered views · Vanilla JavaScript · Custom design system · Deployable on Render, with persistent data support via a mounted disk.</p>
      </div>`,
  },
};

function staticPage({ user, slug }) {
  const page = STATIC_PAGES[slug];
  const body = `
  <section class="page-head">
    <div class="container">
      <span class="kicker">${escapeHtml(page.kicker)}</span>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="page-sub">${escapeHtml(page.intro)}</p>
    </div>
  </section>
  <section class="section section-tight">
    <div class="container narrow-800">${page.body}
      <div class="alert alert-info" style="margin-top:32px">${icon('info', 18)}<div class="alert-body">Reminder: this is a demonstration prototype and is not affiliated with the Government of India. For real cyber crime, use <strong>cybercrime.gov.in</strong> or call <strong>1930</strong>.</div></div>
    </div>
  </section>`;
  return layout({ title: page.title, user, body });
}

function notFoundPage({ user }) {
  const body = `
  <section class="section section-tight">
    <div class="container narrow center-text">
      <div class="error-code">404</div>
      <h1>Page not found</h1>
      <p class="page-sub" style="margin:0 auto 26px">The page you are looking for does not exist or has moved.</p>
      <div class="center-actions">
        <a class="btn btn-primary" href="/">${icon('dashboard', 16)} Go to home</a>
        <a class="btn btn-outline" href="/report">${icon('file', 16)} Report a crime</a>
      </div>
    </div>
  </section>`;
  return layout({ title: 'Not Found', user, body });
}

function errorPage({ user, message }) {
  const body = `
  <section class="section section-tight">
    <div class="container narrow">
      ${alertBox('error', escapeHtml(message || 'Something went wrong. Please try again.'), { dismissible: false })}
      <div class="center-actions" style="margin-top:20px">
        <a class="btn btn-primary" href="/">Go to home</a>
        <a class="btn btn-ghost" href="/contact">Contact support</a>
      </div>
    </div>
  </section>`;
  return layout({ title: 'Error', user, body });
}

module.exports = { awarenessPage, resourcesPage, contactPage, staticPage, notFoundPage, errorPage, STATIC_PAGES };
