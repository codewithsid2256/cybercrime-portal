'use strict';

const { CATEGORIES, STATES } = require('../config');
const { icon, layout } = require('./layout');

function homePage({ stats, recent, user }) {
  const total = 48213 + stats.total;
  const resolved = 21764 + stats.byStatus.closed;
  const amountSaved = 1934500000 + stats.amount * 0.42;

  const statCards = [
    { ico: 'file', label: 'Complaints registered', value: total.toLocaleString('en-IN'), sub: `${stats.last7} in the last 7 days`, tone: 'blue' },
    { ico: 'check', label: 'Complaints resolved', value: resolved.toLocaleString('en-IN'), sub: 'Closed after action', tone: 'green' },
    { ico: 'wallet', label: 'Amount saved / refunded', value: `₹${(amountSaved / 10000000).toFixed(1)} Cr`, sub: 'Through timely freezes', tone: 'amber' },
    { ico: 'clock', label: 'Avg. first response', value: '4.2 hrs', sub: 'Helpline 1930 · 24×7', tone: 'violet' },
  ];

  const catCards = CATEGORIES.slice(0, 8).map((c) => `
    <a class="cat-card" href="/crime-types#${c.id}">
      <span class="cat-card-ico tone-${['blue','teal','amber','rose','violet','green','sky','slate'][CATEGORIES.indexOf(c) % 8]}">${icon(c.icon, 24)}</span>
      <span class="cat-card-body">
        <strong>${c.label}</strong>
        <span>${c.desc}</span>
      </span>
      <span class="cat-card-arrow">${icon('arrowRight', 16)}</span>
    </a>`).join('');

  const recentRows = recent.map((c) => `
    <div class="record-row">
      <div class="record-ico">${icon('file', 17)}</div>
      <div class="record-main">
        <div class="record-title">
          <strong>${c.complaintNo}</strong>
          <span class="chip chip-xs">${c.categoryLabel}</span>
        </div>
        <div class="record-meta">${c.complainant.state} · ${c.complainant.district} · filed ${new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
      </div>
      <div class="record-right">
        <span class="mini-status mini-${c.status}">${c.status.replace('-', ' ')}</span>
      </div>
    </div>`).join('');

  const body = `
  <!-- HERO -->
  <section class="hero">
    <div class="hero-bg" style="background-image:url('/img/hero.png')"></div>
    <div class="hero-overlay"></div>
    <div class="container hero-inner">
      <div class="hero-copy">
        <span class="hero-eyebrow">${icon('shield', 15)} Secure · Confidential · 24×7</span>
        <h1>Report cyber crime.<br><span class="hero-hl">Protect what matters.</span></h1>
        <p>A single, secure window to register a cyber crime complaint, upload digital evidence and track its investigation — from any device, anywhere in India.</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="/report">${icon('shield', 19)} Report a Cyber Crime</a>
          <a class="btn btn-ghost-light btn-lg" href="/track">${icon('search', 19)} Track your complaint</a>
        </div>
        <div class="hero-trust">
          <span>${icon('lock', 15)} 256-bit encryption</span>
          <span>${icon('user', 15)} Identity protected</span>
          <span>${icon('globe', 15)} Available in 12 languages</span>
        </div>
      </div>
      <div class="hero-side">
        <div class="hero-card">
          <div class="hero-card-head">${icon('siren', 18)} Need help right now?</div>
          <a class="hero-helpline" href="tel:1930">
            <span class="hh-label">Financial fraud helpline</span>
            <span class="hh-num">1930</span>
            <span class="hh-note">Report within the first hour to freeze stolen funds</span>
          </a>
          <a class="hero-emergency" href="tel:112">${icon('alert', 16)} Emergency · 112</a>
        </div>
      </div>
    </div>
  </section>

  <!-- STAT BAND -->
  <section class="stat-band">
    <div class="container stat-grid">
      ${statCards.map((s) => `
        <div class="stat-card">
          <span class="stat-ico tone-${s.tone}">${icon(s.ico, 22)}</span>
          <div>
            <span class="stat-value">${s.value}</span>
            <span class="stat-label">${s.label}</span>
            <span class="stat-sub">${s.sub}</span>
          </div>
        </div>`).join('')}
    </div>
  </section>

  <!-- SERVICES -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="kicker">Citizen Services</span>
          <h2>What would you like to do today?</h2>
        </div>
        <p class="section-lead">Choose a service below. Every complaint is acknowledged instantly with a unique NCRP number.</p>
      </div>
      <div class="service-grid">
        <a class="service-card" href="/report">
          <span class="service-ico blue">${icon('file', 26)}</span>
          <h3>Register a complaint</h3>
          <p>File a new cyber crime complaint and attach screenshots, bank statements, PDFs or short videos as evidence.</p>
          <span class="service-link">Start a complaint ${icon('arrowRight', 15)}</span>
        </a>
        <a class="service-card" href="/track">
          <span class="service-ico teal">${icon('search', 26)}</span>
          <h3>Track status</h3>
          <p>Use your complaint number and registered mobile number to see live status and officer remarks.</p>
          <span class="service-link">Check status ${icon('arrowRight', 15)}</span>
        </a>
        <a class="service-card" href="/crime-types">
          <span class="service-ico amber">${icon('grid', 26)}</span>
          <h3>Know the crime types</h3>
          <p>Understand how each category of cyber crime is defined, what to report and which evidence matters.</p>
          <span class="service-link">Browse categories ${icon('arrowRight', 15)}</span>
        </a>
        <a class="service-card" href="/awareness">
          <span class="service-ico green">${icon('book', 26)}</span>
          <h3>Stay cyber safe</h3>
          <p>Read advisories on the latest scams, safe-payment practices and digital hygiene checklists.</p>
          <span class="service-link">View advisories ${icon('arrowRight', 15)}</span>
        </a>
      </div>
    </div>
  </section>

  <!-- CATEGORIES -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="kicker">Categories</span>
          <h2>Frequently reported cyber crimes</h2>
        </div>
        <a class="btn btn-outline" href="/crime-types">All categories ${icon('arrowRight', 16)}</a>
      </div>
      <div class="cat-grid">${catCards}</div>
    </div>
  </section>

  <!-- PROCESS -->
  <section class="section">
    <div class="container">
      <div class="section-head center">
        <div>
          <span class="kicker">How it works</span>
          <h2>From complaint to action — in four steps</h2>
        </div>
      </div>
      <ol class="steps">
        <li class="step">
          <span class="step-num">1</span>
          <span class="step-ico">${icon('plus', 22)}</span>
          <h3>File your complaint</h3>
          <p>Choose a category, describe what happened and attach any evidence you have.</p>
        </li>
        <li class="step">
          <span class="step-num">2</span>
          <span class="step-ico">${icon('file', 22)}</span>
          <h3>Get an NCRP number</h3>
          <p>Your complaint is acknowledged instantly with a unique number for future reference.</p>
        </li>
        <li class="step">
          <span class="step-ico">${icon('users', 22)}</span>
          <span class="step-num">3</span>
          <h3>Cyber cell reviews</h3>
          <p>An officer verifies the facts, evidence and linked transactions, and coordinates with banks.</p>
        </li>
        <li class="step">
          <span class="step-ico">${icon('shield', 22)}</span>
          <span class="step-num">4</span>
          <h3>Action &amp; tracking</h3>
          <p>Track every update online. You are notified at each stage until closure.</p>
        </li>
      </ol>
    </div>
  </section>

  <!-- SAFETY TIPS -->
  <section class="section section-dark">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="kicker light">Advisory</span>
          <h2>Four habits that stop most cyber fraud</h2>
        </div>
        <a class="btn btn-ghost-light" href="/awareness">All advisories ${icon('arrowRight', 16)}</a>
      </div>
      <div class="tips-grid">
        <div class="tip-card">
          <span class="tip-ico">${icon('lock', 22)}</span>
          <h3>Never share an OTP</h3>
          <p>No bank, wallet or government official will ever ask for your OTP, PIN or CVV.</p>
        </div>
        <div class="tip-card">
          <span class="tip-ico">${icon('upi', 22)}</span>
          <h3>Scanning sends money</h3>
          <p>A QR code always debits you. There is no such thing as scanning to receive money.</p>
        </div>
        <div class="tip-card">
          <span class="tip-ico">${icon('phone', 22)}</span>
          <h3>Call 1930 immediately</h3>
          <p>Report fraudulent transfers during the "golden hour" to maximise chances of a freeze.</p>
        </div>
        <div class="tip-card">
          <span class="tip-ico">${icon('eye', 22)}</span>
          <h3>Verify before you click</h3>
          <p>Check domains carefully, avoid unknown links, and never install remote-access apps on request.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- RECENT (fictional) -->
  <section class="section">
    <div class="container recent-wrap">
      <div class="recent-main">
        <div class="section-head">
          <div>
            <span class="kicker">Recent activity</span>
            <h2>Latest complaints (sample data)</h2>
          </div>
        </div>
        <div class="record-list">${recentRows}</div>
        <p class="fictional-note">${icon('info', 15)} These entries are fictitious samples generated for this demonstration prototype. Names have not been verified and no real complaints are shown.</p>
      </div>
      <aside class="recent-side">
        <div class="side-card">
          <h3>${icon('siren', 18)} Golden hour protocol</h3>
          <p>If money has already left your account, the first 60 minutes matter most.</p>
          <ol class="side-list">
            <li>Call <strong>1930</strong> and report the transaction immediately.</li>
            <li>Inform your bank to freeze the beneficiary account.</li>
            <li>File the complaint here and attach the transaction screenshot.</li>
          </ol>
          <a class="btn btn-primary btn-block" href="/report">${icon('shield', 17)} Report now</a>
        </div>
        <div class="side-card side-card-muted">
          <h3>${icon('chat', 18)} Not sure where to start?</h3>
          <p>Read the FAQ to understand what counts as a cyber crime, how to attach evidence, and how long action usually takes.</p>
          <a class="btn btn-outline btn-block" href="/page/faq">Read the FAQ</a>
        </div>
      </aside>
    </div>
  </section>`;

  return layout({ title: 'Home', active: 'home', user, body });
}

function crimeTypesPage({ user }) {
  const cards = CATEGORIES.map((c, i) => `
    <article class="crime-card" id="${c.id}">
      <div class="crime-head">
        <span class="crime-ico tone-${['blue','teal','amber','rose','violet','green','sky','slate'][i % 8]}">${icon(c.icon, 22)}</span>
        <h3>${c.label}</h3>
      </div>
      <p class="crime-desc">${c.desc}</p>
      <a class="btn btn-sm btn-outline" href="/report?category=${c.id}">Report this ${icon('arrowRight', 14)}</a>
    </article>`).join('');

  const body = `
  <section class="page-head">
    <div class="container">
      <span class="kicker">Citizen guide</span>
      <h1>Cyber crime categories</h1>
      <p class="page-sub">Each category below explains what the crime is, the evidence that helps most, and how to report it. Choose the closest match — an officer will re-classify it if needed.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="crime-grid">${cards}</div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="section-head"><div><span class="kicker">Evidence checklist</span><h2>What to attach to any complaint</h2></div></div>
      <div class="check-grid">
        <div class="check-card"><span class="check-ico">${icon('file', 22)}</span><h3>Screenshots &amp; photos</h3><p>Chats, emails, SMS alerts, fake profiles and the fraudulent payment confirmation page.</p></div>
        <div class="check-card"><span class="check-ico">${icon('bank', 22)}</span><h3>Bank / transaction records</h3><p>Statement showing the debits with UTR or reference numbers, and beneficiary details if visible.</p></div>
        <div class="check-card"><span class="check-ico">${icon('phone', 22)}</span><h3>Communication details</h3><p>Caller numbers, email headers, website URLs and social media handles used by the fraudster.</p></div>
        <div class="check-card"><span class="check-ico">${icon('clock', 22)}</span><h3>Timeline notes</h3><p>Rough times of each event — helpful for tracing the money movement at each stage.</p></div>
      </div>
    </div>
  </section>`;

  return layout({ title: 'Crime Types', active: 'crime-types', user, body });
}

function helplinePage({ user }) {
  const body = `
  <section class="page-head">
    <div class="container">
      <span class="kicker">Emergency</span>
      <h1>Helplines &amp; emergency contacts</h1>
      <p class="page-sub">If money has been transferred fraudulently, call the national helpline immediately — speed decides how much can be recovered.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="helpline-grid">
        <a class="helpline-card" href="tel:1930">
          <span class="helpline-card-ico blue">${icon('siren', 26)}</span>
          <span class="helpline-card-body"><strong>National Cyber Crime Helpline</strong><span class="helpline-big">1930</span><span>24×7 · Financial cyber fraud · Hindi, English &amp; regional languages</span></span>
        </a>
        <a class="helpline-card" href="tel:112">
          <span class="helpline-card-ico rose">${icon('alert', 26)}</span>
          <span class="helpline-card-body"><strong>National Emergency Number</strong><span class="helpline-big">112</span><span>Police · Fire · Ambulance — single emergency line</span></span>
        </a>
        <a class="helpline-card" href="tel:1091">
          <span class="helpline-card-ico amber">${icon('users', 26)}</span>
          <span class="helpline-card-body"><strong>Women Helpline</strong><span class="helpline-big">1091</span><span>24×7 · Support for women in distress</span></span>
        </a>
        <a class="helpline-card" href="tel:1098">
          <span class="helpline-card-ico green">${icon('heart', 26)}</span>
          <span class="helpline-card-body"><strong>Child Helpline</strong><span class="helpline-big">1098</span><span>24×7 · Child safety and cyber bullying support</span></span>
        </a>
      </div>
      <div class="section-head" style="margin-top:48px"><div><span class="kicker">What to keep ready</span><h2>Calling checklist</h2></div></div>
      <ol class="checklist">
        <li>Your bank account number and the last four digits of the card used.</li>
        <li>Transaction reference / UTR numbers for every fraudulent debit.</li>
        <li>The phone number, UPI ID or account number the money went to, if known.</li>
        <li>Approximate time of each call, message or transaction.</li>
      </ol>
    </div>
  </section>`;
  return layout({ title: 'Helpline', active: 'helpline', user, body });
}

function statesData() {
  return STATES;
}

module.exports = { homePage, crimeTypesPage, helplinePage, statesData };
