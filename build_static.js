const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DOMAIN = 'https://physiobyrutvi.in';
const PHONE = '+91 88794 75065';
const PHONE_LINK = 'tel:+918879475065';
const WHATSAPP = 'https://wa.me/918879475065?text=' + encodeURIComponent('Hello PhysioByRutvi, I would like to ask about a home physiotherapy visit. My name is ___, suburb is ___, and preferred day/time is ___.');
// The currently verified Calendly event is still the 30-minute event. Do not label it as 15 minutes.
const CALENDLY = 'https://calendly.com/gandhirutvi13/30min';

const pages = [
  {
    source: 'Home.dc.html',
    output: 'index.html',
    route: '/',
    title: 'Home Physiotherapy in Mumbai | PhysioByRutvi',
    description: 'Clinically led physiotherapy home visits across Bhayander to Andheri, with assessment-led care and a physiotherapist matched to the patient’s needs.',
    type: 'home'
  },
  {
    source: 'About Dr Rutvi.dc.html',
    output: 'about/index.html',
    route: '/about/',
    title: 'Dr Rutvi K Gandhi (PT), MPT, BPT, MIAP | PhysioByRutvi',
    description: 'Meet Dr Rutvi K Gandhi (PT), Founder and Clinical Lead of PhysioByRutvi, and learn about her education, clinical training and approach to home physiotherapy.',
    type: 'about'
  },
  {
    source: 'Conditions.dc.html',
    output: 'conditions/index.html',
    route: '/conditions/',
    title: 'Conditions Supported with Home Physiotherapy | PhysioByRutvi',
    description: 'Explore assessment-led home physiotherapy support for musculoskeletal concerns, post-operative rehabilitation, sports recovery and senior mobility.',
    type: 'conditions'
  }
];

const conditionPages = [
  ['back-neck-pain', 'Back & Neck Pain', 'Assessment-led support for stiffness, movement limitations and musculoskeletal back or neck concerns.', 'A physiotherapy assessment considers movement, strength, daily tasks and warning signs before a plan is recommended. Care may include education, graded exercise, movement practice and hands-on techniques where clinically suitable.'],
  ['sports-injury', 'Sports Injury Rehabilitation', 'Progressive rehabilitation for strains, sprains and return to activity.', 'Rehabilitation is matched to the stage of injury and the demands of the patient’s sport or activity. Progress is reviewed through movement quality, strength, tolerance and confidence rather than a fixed recovery promise.'],
  ['post-surgery-rehabilitation', 'Post-Operative Rehabilitation', 'Home rehabilitation aligned with the surgeon’s guidance and the patient’s recovery stage.', 'The physiotherapist reviews available medical guidance, current precautions and functional goals. Early mobility, range, strength and daily activities are progressed only when appropriate.'],
  ['knee-joint-pain', 'Knee & Joint Concerns', 'Physiotherapy support for mobility, strength and everyday function around painful or stiff joints.', 'Assessment looks at joint movement, muscle capacity, walking and task demands. Management may involve load modification, graded strengthening, mobility work and practical home guidance.'],
  ['sciatica', 'Sciatica & Referred Leg Symptoms', 'Assessment-led physiotherapy for radiating leg symptoms and movement limitations.', 'Radiating symptoms can have different causes. The first step is a careful assessment, including screening for signs that require medical referral. Suitable care may include education, graded movement and strength work.'],
  ['posture-and-workstation', 'Posture & Workstation Concerns', 'Practical movement and workstation guidance for work-related discomfort.', 'The aim is not to force one “perfect” posture. Assessment considers how long positions are held, movement variety, task setup, strength and recovery habits.'],
  ['frozen-shoulder', 'Frozen Shoulder', 'Stage-appropriate support for shoulder pain, stiffness and reduced range.', 'Frozen shoulder can change slowly and should not be forced. Care is paced to irritability and may include education, gentle mobility, strength work and medical coordination where needed.'],
  ['senior-mobility', 'Senior Mobility', 'Home-based strength, balance and mobility support for older adults.', 'The plan considers the home environment, daily tasks, fall risk, walking confidence and relevant medical history. Family or caregiver participation can be included when helpful and consented.']
];

const servicePages = [
  ['myofascial-release-iastm-cupping', 'Myofascial Release, IASTM & Cupping', 'Hands-on modalities that may be considered as part of a wider rehabilitation plan.', 'Myofascial release, instrument-assisted soft-tissue mobilisation and cupping are not stand-alone cures. Where clinically suitable, they may be used to support short-term comfort or movement while active rehabilitation addresses strength, control and function.'],
  ['post-operative-rehabilitation', 'Post-Operative Rehabilitation', 'Structured home rehabilitation after orthopaedic procedures.', 'Care follows available surgeon guidance, precautions and the patient’s stage of recovery. The plan may include mobility, range-of-motion work, graded strengthening, walking practice and home-task training.'],
  ['sports-rehabilitation', 'Sports Rehabilitation', 'Progressive care from injury assessment through return to activity.', 'The rehabilitation plan is built around the demands of the sport, current capacity and recovery stage. Return-to-sport decisions may require coordination with the treating doctor or coach.'],
  ['senior-physiotherapy', 'Senior Physiotherapy', 'Home physiotherapy supporting mobility, balance, strength and independence.', 'Assessment considers health history, medication-related concerns, the home environment, daily function and falls risk. Treatment is paced to the individual and may involve family or caregiver education.']
];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function extractXdc(source) {
  const open = source.indexOf('<x-dc>');
  const close = source.lastIndexOf('</x-dc>');
  if (open < 0 || close < 0) throw new Error('Missing <x-dc> source wrapper');
  return source.slice(open + 6, close);
}

function replaceSection(source, startMarker, endMarker, replacement) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (start < 0 || end < 0 || end <= start) return source;
  return source.slice(0, start) + replacement + '\n\n' + source.slice(end);
}

function verifiedReviewSection() {
  let review = null;
  try {
    const data = JSON.parse(read('data/google-reviews.json'));
    if (data.connected && data.reviews && data.reviews[0]) review = { ...data.reviews[0], rating: data.rating, count: data.userRatingCount, url: data.googleMapsUri };
  } catch (_) {}
  if (!review) return '';
  return `<!-- ===================== VERIFIED GOOGLE REVIEW ===================== -->
<section id="reviews" style="background:#F6F2EC;padding:clamp(56px,8vw,108px) clamp(20px,5vw,52px);">
  <div style="max-width:1220px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:clamp(28px,5vw,64px);align-items:center;">
    <div data-reveal>
      <div style="font-size:11.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#0E4F52;">Verified Google feedback</div>
      <h2 style="font-family:'Fraunces',serif;font-size:clamp(38px,6vw,72px);line-height:.95;text-transform:uppercase;margin:18px 0;color:#1B2021;">Rated ${review.rating.toFixed(1)}<br>on Google.</h2>
      <p style="color:#717470;font-size:15px;">Based on ${review.count} public Google ratings at the last verified sync.</p>
    </div>
    <article data-reveal data-delay="90" style="background:#fff;border:1px solid rgba(27,32,33,.07);border-radius:24px;padding:clamp(26px,4vw,42px);box-shadow:0 18px 44px rgba(14,79,82,.08);">
      <div style="color:#EE7B5B;letter-spacing:.12em;">★★★★★</div>
      <blockquote style="font-family:'Fraunces',serif;font-size:clamp(20px,2.5vw,28px);line-height:1.4;margin:18px 0;color:#1B2021;">“${escapeHtml(review.text)}”</blockquote>
      <p style="font-weight:700;color:#0E4F52;">${escapeHtml(review.author)}</p>
      <a href="${review.url}" target="_blank" rel="noopener" style="display:inline-flex;margin-top:18px;color:#EE7B5B;font-weight:700;text-decoration:none;">Read on Google →</a>
    </article>
  </div>
</section>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function normalizeBody(source, type) {
  let body = extractXdc(source)
    .replace(/<helmet>[\s\S]*?<\/helmet>/g, '')
    .replace(/<template[\s\S]*?<\/template>/g, '')
    .replace(/<dc-import\b[^>]*><\/dc-import>/g, '')
    .replace(/<dc-import\b[^>]*\/>/g, '')
    .replace(/style-hover="([^"]*)"/g, 'data-hover-style="$1"')
    .replace(/onClick="\{\{[^}]+\}\}"/g, '')
    .replace(/href="\{\{\s*waHref\s*\}\}"/g, `href="${WHATSAPP}"`)
    .replace(/href="\{\{\s*bookHref\s*\}\}"/g, `href="${CALENDLY}"`)
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/src="assets\//g, 'src="/assets/')
    .replace(/href="Home\.dc\.html#approach"/g, 'href="/#approach"')
    .replace(/href="Home\.dc\.html#how"/g, 'href="/how-care-works/"')
    .replace(/href="Home\.dc\.html#reviews"/g, 'href="/#reviews"')
    .replace(/href="Home\.dc\.html"/g, 'href="/"')
    .replace(/href="About(?: Dr Rutvi)?\.dc\.html"/g, 'href="/about/"')
    .replace(/href="Conditions\.dc\.html"/g, 'href="/conditions/"')
    .replace(/\/conditions\/back-and-neck-pain\//g, '/conditions/back-neck-pain/')
    .replace(/\/conditions\/sports-injuries\//g, '/conditions/sports-injury/')
    .replace(/\/conditions\/knee-and-joint-pain\//g, '/conditions/knee-joint-pain/')
    .replace(/\/conditions\/posture-and-work-related-discomfort\//g, '/conditions/posture-and-workstation/')
    .replace(/\/conditions\/strength-and-return-to-activity\//g, '/services/sports-rehabilitation/')
    .replace(/Dr Rutvi Gandhi/g, 'Dr Rutvi K Gandhi (PT)')
    .replace(/Doctor-led/g, 'Clinically led')
    .replace(/doctor-led/g, 'clinically led')
    .replace(/The Same<br><span style="color:#0E4F52;">Expert\.<\/span><br>Every Visit\./g, 'The Right<br><span style="color:#0E4F52;">Expert.</span><br>For Your Needs.')
    .replace(/No rotating aggregator therapists\. One specialist who knows your history and your goals\./g, 'A clinically suitable physiotherapist, matched to the patient’s needs and supported by shared care standards.')
    .replace(/One-on-one, the same specialist, every visit\./g, 'One-on-one care, planned around the patient and delivered by a matched physiotherapist.')
    .replace(/the same specialist, every visit/gi, 'a physiotherapist matched to the patient’s needs')
    .replace(/Same expert, every visit/gi, 'Team-based, clinically led care')
    .replace(/Expert, one-on-one care from Dr Rutvi K Gandhi \(PT\), in your own home, across Mumbai's western suburbs\./g, 'Assessment-led home physiotherapy across Mumbai’s western suburbs, delivered by a matched physiotherapist and guided by shared clinical standards.')
    .replace(/5\.0 · MPT patients treated at home/g, '5.0 Google rating · MPT-led clinical standards')
    .replace(/500\+/g, 'MPT')
    .replace(/Patients treated at home/g, 'Clinically led standards')
    .replace(/<span data-count="8" data-suffix="\+">8\+<\/span>/g, '9')
    .replace(/Conditions treated/g, 'Western-suburb areas')
    .replace(/<span data-count="100" data-suffix="%">100%<\/span>/g, 'Team')
    .replace(/Care in your own home/g, 'Matched to patient needs');

  if (type === 'home') {
    body = replaceSection(body, '<!-- ===================== REVIEWS', '<!-- ===================== ABOUT TEASER', verifiedReviewSection());
    body = body
      .replace(/src="\/assets\/rutvi-3\.png"/g, 'src="/assets/img/dr-rutvi-founder-about-portrait.webp"')
      .replace(/alt="Illustration of Dr Rutvi K Gandhi \(PT\)"/g, 'alt="Dr Rutvi K Gandhi (PT), Founder and Clinical Lead"')
      .replace(/One specialist\.<br>Your corner\./g, 'Clinical standards.<br>Personal care.')
      .replace(/She founded Physio by Rutvi on a simple belief:[\s\S]*?comfort of your own home\./g, 'She founded PhysioByRutvi to make careful, assessment-led physiotherapy easier to access at home. Dr Rutvi leads the clinical standards while visits may be delivered by a suitably matched physiotherapist from the care team.')
      .replace(/Message Dr Rutvi today, a physiotherapist matched to the patient’s needs, at your door, every visit\./g, 'Tell our care team what feels difficult, where you live and when you would prefer help. We will guide the next appropriate step.')
      .replace(/Chat on WhatsApp/g, 'Message the Care Team');
  }

  if (type === 'about') {
    body = body
      .replace(/Dr Rutvi K Gandhi \(PT\), PT, MPT/g, 'Dr Rutvi K Gandhi (PT), MPT, BPT, MIAP')
      .replace(/src="\/assets\/rutvi-3-480\.webp"/g, 'src="/assets/img/dr-rutvi-founder-about-portrait.webp"')
      .replace(/src="\/assets\/rutvi-2-480\.webp"/g, 'src="/assets/img/dr-rutvi-founder-at-work.webp"')
      .replace(/alt="Dr Rutvi K Gandhi \(PT\)"/g, 'alt="Dr Rutvi K Gandhi (PT), Founder and Clinical Lead"')
      .replace(/Talk to Dr Rutvi/g, 'Talk to the Care Team')
      .replace(/Message Dr Rutvi/g, 'Message the Care Team');

    body = body.replace(
      /Musculoskeletal &amp; Sports Physiotherapy, NMIMS School of Science \(SDSOS\), Mumbai \(2024-2026\)/g,
      'Musculoskeletal &amp; Sports Physiotherapy, Sunandan Divatia School of Science, NMIMS Mumbai (2024–2026)<br><span style="color:#717470;">Clinical training: Nanavati Hospital, Mumbai</span>'
    );
  }

  if (type === 'conditions') {
    body = body
      .replace(/Dr Rutvi treats a full range of musculoskeletal and sports conditions/g, 'The PhysioByRutvi team supports a range of musculoskeletal, post-operative, sports and mobility concerns')
      .replace(/Book a Consultation/g, 'Request a Consultation');
  }

  body = body.trim();
  if (!/<main\b/.test(body)) body = `<main id="main-content">\n${body}\n</main>`;
  return body;
}

function brand() {
  return `<span class="pbr-brand__mark" aria-hidden="true">R</span><span><span class="pbr-brand__name">PHYSIO</span><span class="pbr-brand__by">BY RUTVI</span></span>`;
}

function header() {
  const links = [
    ['01', 'Physiotherapy', '/#approach'],
    ['02', 'Conditions', '/conditions/'],
    ['03', 'Services', '/services/'],
    ['04', 'How Care Works', '/how-care-works/'],
    ['05', 'About', '/about/'],
    ['06', 'Reviews', '/#reviews'],
    ['07', 'Service Areas', '/service-areas/'],
    ['08', 'FAQs', '/faqs/']
  ].map(([number, label, href]) => `<a class="pbr-menu__link" href="${href}"><span>${number}</span>${label}</a>`).join('');
  return `<div class="pbr-progress" aria-hidden="true"></div>
<header class="pbr-header">
  <div class="pbr-shell pbr-header__row">
    <a class="pbr-brand" href="/" aria-label="PhysioByRutvi home">${brand()}</a>
    <div class="pbr-header__actions">
      <a class="pbr-icon-btn pbr-icon-btn--call" href="${PHONE_LINK}" aria-label="Call PhysioByRutvi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>
      <a class="pbr-book-btn" href="${CALENDLY}" target="_blank" rel="noopener">Book a Free Consultation</a>
      <button class="pbr-icon-btn pbr-menu-btn" id="pbrMenuOpen" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="pbrMenu"><svg width="19" height="16" viewBox="0 0 19 16" fill="none"><path d="M1 2h17M1 8h17M1 14h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 14h4" stroke="#EE7B5B" stroke-width="2" stroke-linecap="round"/></svg></button>
    </div>
  </div>
</header>
<div class="pbr-menu" id="pbrMenu" data-open="false" role="dialog" aria-modal="true" aria-label="Site navigation" inert>
  <div class="pbr-shell pbr-menu__inner">
    <div class="pbr-menu__top"><a class="pbr-brand" href="/">${brand()}</a><button class="pbr-icon-btn" id="pbrMenuClose" type="button" aria-label="Close menu"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    <div class="pbr-menu__grid">
      <nav class="pbr-menu__links" aria-label="Primary navigation">${links}</nav>
      <aside class="pbr-menu__card"><small>FREE CONSULTATION</small><p>Tell our care team what feels difficult, where you live and when you would prefer help.</p><a class="pbr-menu__cta pbr-menu__cta--book" href="${CALENDLY}" target="_blank" rel="noopener">Book a Free Consultation</a><a class="pbr-menu__cta pbr-menu__cta--wa" href="${WHATSAPP}" target="_blank" rel="noopener">Chat on WhatsApp</a></aside>
    </div>
  </div>
</div>`;
}

function footer() {
  return `<footer class="pbr-footer">
  <div class="pbr-shell pbr-footer__inner">
    <div class="pbr-footer__grid">
      <div class="pbr-footer__brand"><a class="pbr-brand" href="/">${brand()}</a><h2>Movement, restored,<br><em>personally.</em></h2><p>Clinically led home physiotherapy across Mumbai’s western suburbs, with assessment-led care and a physiotherapist matched to the patient’s needs.</p></div>
      <div><div class="pbr-footer__title">Service areas</div><p>Bhayander · Mira Road<br>Dahisar · Borivali<br>Kandivali · Malad<br>Goregaon · Jogeshwari<br>Andheri</p></div>
      <div><div class="pbr-footer__title">Explore</div><ul><li><a href="/conditions/">Conditions</a></li><li><a href="/services/">Services</a></li><li><a href="/how-care-works/">How Care Works</a></li><li><a href="/about/">About</a></li><li><a href="/faqs/">FAQs</a></li></ul></div>
      <div><div class="pbr-footer__title">Get in touch</div><div class="pbr-footer__buttons"><a class="pbr-footer__button pbr-footer__button--wa" href="${WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a><a class="pbr-footer__button pbr-footer__button--book" href="${CALENDLY}" target="_blank" rel="noopener">Book Consultation</a><a href="${PHONE_LINK}">${PHONE}</a></div></div>
    </div>
    <div class="pbr-footer__trust"><span class="pbr-footer__chip">MPT-led clinical standards</span><span class="pbr-footer__chip">Home visits by appointment</span><span class="pbr-footer__chip">Bhayander to Andheri</span><span class="pbr-footer__chip">English · Hindi · Marathi · Gujarati support</span></div>
    <p style="margin-top:26px;color:rgba(246,242,236,.55);font-size:12.5px;">For severe, rapidly worsening or potentially urgent symptoms, contact an appropriate emergency or medical service rather than waiting for a website response.</p>
    <div class="pbr-footer__legal"><span>© 2026 PhysioByRutvi · Dr Rutvi K Gandhi (PT), MPT, BPT, MIAP</span><span><a href="/privacy-policy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/medical-disclaimer/">Medical Disclaimer</a> · <a href="/cancellation-policy/">Cancellation</a></span></div>
  </div>
</footer>
<div class="pbr-mobile-cta" role="group" aria-label="Booking actions"><a class="pbr-mobile-cta__wa" href="${WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a><a class="pbr-mobile-cta__book" href="${CALENDLY}" target="_blank" rel="noopener">Book Consultation</a></div>`;
}

function leadSection(eyebrow, title, intro) {
  return `<section style="position:relative;overflow:hidden;background:#FDF8F5;padding:clamp(54px,8vw,108px) clamp(20px,5vw,52px);">
  <div data-parallax=".035" style="position:absolute;right:-5%;top:-8%;width:min(620px,70%);opacity:.65;pointer-events:none;"><svg viewBox="0 0 620 360" fill="none"><path d="M20 330C180 55 440 55 600 330" stroke="#EE7B5B" stroke-width="2.4"/><path d="M90 340C220 140 400 140 530 340" stroke="#CFE3D8" stroke-width="2"/></svg></div>
  <div style="position:relative;max-width:1120px;margin:auto;"><div data-reveal style="color:#0E4F52;font-size:11.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;">${eyebrow}</div><h1 data-reveal data-delay="60" style="max-width:14ch;margin:18px 0 24px;font-family:'Fraunces',serif;font-size:clamp(42px,7vw,88px);font-weight:600;line-height:.94;letter-spacing:-.02em;text-transform:uppercase;color:#1B2021;">${title}</h1><p data-reveal data-delay="110" style="max-width:62ch;margin:0;color:#4A4F4C;font-size:clamp(16px,1.8vw,20px);line-height:1.65;">${intro}</p><div data-reveal data-delay="160" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px;"><a href="${WHATSAPP}" target="_blank" rel="noopener" style="border-radius:999px;background:#EE7B5B;color:#1B2021;padding:15px 24px;text-decoration:none;font-weight:700;">Message the Care Team</a><a href="${CALENDLY}" target="_blank" rel="noopener" style="border:1.5px solid #0E4F52;border-radius:999px;color:#0E4F52;padding:14px 24px;text-decoration:none;font-weight:700;">Book Consultation</a></div></div>
</section>`;
}

function threeCardSection(title, cards) {
  return `<section style="background:#F6F2EC;padding:clamp(56px,8vw,100px) clamp(20px,5vw,52px);"><div style="max-width:1120px;margin:auto;"><h2 data-reveal style="max-width:16ch;margin:0 0 34px;font-family:'Fraunces',serif;font-size:clamp(34px,5vw,58px);line-height:1;text-transform:uppercase;color:#1B2021;">${title}</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:18px;">${cards.map((card, index) => `<article data-reveal data-delay="${index * 70}" style="border:1px solid rgba(27,32,33,.07);border-radius:22px;background:#fff;padding:28px;box-shadow:0 12px 32px rgba(14,79,82,.05);"><div style="color:#EE7B5B;font:600 20px/1 'Fraunces',serif;">0${index + 1}</div><h3 style="margin:18px 0 10px;color:#0E4F52;font:600 23px/1.15 'Fraunces',serif;">${card[0]}</h3><p style="margin:0;color:#4A4F4C;font-size:15px;line-height:1.65;">${card[1]}</p></article>`).join('')}</div></div></section>`;
}

function safetySection() {
  return `<section style="background:#0E4F52;color:#FDF8F5;padding:clamp(54px,7vw,88px) clamp(20px,5vw,52px);"><div data-reveal style="max-width:900px;margin:auto;"><div style="color:#EE7B5B;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;">Safety and suitability</div><h2 style="margin:16px 0;font:500 clamp(30px,4.5vw,52px)/1.08 'Fraunces',serif;">Assessment comes before a treatment plan.</h2><p style="max-width:68ch;color:rgba(246,242,236,.82);font-size:16px;line-height:1.7;">The information on this website is educational and does not replace individual medical assessment. Some symptoms may require medical review or emergency care before physiotherapy. Where clinically suitable, the physiotherapist will explain options, expected limitations and when referral is appropriate.</p></div></section>`;
}

function detailBody(kind, name, description, detail) {
  return `<main id="main-content">${leadSection(kind, name, description)}${threeCardSection('What the process may include', [
    ['Assessment', 'A conversation and physical assessment considering symptoms, movement, daily tasks, goals and relevant medical information.'],
    ['Plan', detail],
    ['Review', 'Progress is reviewed and the plan is adjusted. Results and timelines differ between people, and no outcome is guaranteed.']
  ])}${safetySection()}</main>`;
}

function servicesIndexBody() {
  return `<main id="main-content">${leadSection('Services', 'Care designed around real life.', 'Home physiotherapy begins with assessment and a clear plan. Services are provided by suitably qualified physiotherapists under shared clinical standards led by Dr Rutvi K Gandhi (PT).')}<section style="background:#F6F2EC;padding:clamp(56px,8vw,100px) clamp(20px,5vw,52px);"><div style="max-width:1120px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:18px;">${servicePages.map(([slug, name, description], index) => `<a data-reveal data-delay="${index * 70}" href="/services/${slug}/" style="min-height:240px;border-radius:24px;background:${index === 0 ? '#0E4F52' : '#fff'};color:${index === 0 ? '#FDF8F5' : '#1B2021'};padding:30px;text-decoration:none;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 15px 38px rgba(14,79,82,.07);"><div style="color:#EE7B5B;font-size:12px;font-weight:700;letter-spacing:.14em;">0${index + 1}</div><div><h2 style="margin:0 0 12px;font:600 28px/1.08 'Fraunces',serif;">${name}</h2><p style="margin:0;color:${index === 0 ? 'rgba(246,242,236,.78)' : '#4A4F4C'};line-height:1.6;">${description}</p><span style="display:inline-block;margin-top:18px;color:#EE7B5B;font-weight:700;">View service →</span></div></a>`).join('')}</div></section>${safetySection()}</main>`;
}

function howCareWorksBody() {
  return `<main id="main-content">${leadSection('How care works', 'Four clear steps. No guesswork.', 'From the first enquiry to the home assessment, the process is designed to be clear, respectful and clinically responsible.')}<section style="background:#0E4F52;color:#FDF8F5;padding:clamp(60px,8vw,104px) clamp(20px,5vw,52px);"><div style="max-width:1000px;margin:auto;display:grid;gap:24px;">${[
    ['Book a consultation', 'Share your area, preferred time and a brief reason for the enquiry. Avoid sending unnecessary sensitive medical details through advertising forms.'],
    ['Check suitability', 'The care team confirms the service area, availability and whether a physiotherapy home visit appears appropriate.'],
    ['Home assessment', 'A qualified physiotherapist assesses movement, function, goals and relevant safety considerations before recommending a plan.'],
    ['Review and progress', 'The plan is reviewed over time and adjusted according to response, goals and any medical guidance.']
  ].map((step, index) => `<article data-reveal data-delay="${index * 70}" style="display:grid;grid-template-columns:70px 1fr;gap:22px;padding:24px 0;border-bottom:1px solid rgba(246,242,236,.14);"><div style="width:54px;height:54px;border:1px solid rgba(246,242,236,.3);border-radius:50%;display:grid;place-items:center;color:#EE7B5B;font:600 20px/1 'Fraunces',serif;">${index + 1}</div><div><h2 style="margin:0 0 8px;color:#FDF8F5;font:500 28px/1.15 'Fraunces',serif;">${step[0]}</h2><p style="margin:0;max-width:66ch;color:rgba(246,242,236,.76);line-height:1.65;">${step[1]}</p></div></article>`).join('')}</div></section></main>`;
}

function serviceAreasBody() {
  return `<main id="main-content">${leadSection('Service areas', 'Home visits from Bhayander to Andheri.', 'Availability depends on the patient’s location, timing and the most suitable physiotherapist. The care team confirms availability before a booking is finalised.')}${threeCardSection('Western-suburb coverage', [
    ['North zone', 'Bhayander, Mira Road and Dahisar.'],
    ['Central zone', 'Borivali, Kandivali and Malad.'],
    ['South zone', 'Goregaon, Jogeshwari and Andheri.']
  ])}</main>`;
}

function faqBody() {
  const questions = [
    ['Will Dr Rutvi attend every visit?', 'Not necessarily. Dr Rutvi is Founder and Clinical Lead. Visits may be delivered by another suitably qualified physiotherapist matched to the patient’s needs and location.'],
    ['What happens during the first visit?', 'The physiotherapist discusses the concern, relevant history, movement, function and goals before explaining suitable next steps.'],
    ['How many sessions will be required?', 'This cannot be responsibly estimated without assessment. Recommendations depend on the concern, goals, response and any medical guidance.'],
    ['Are IASTM and cupping available?', 'They may be considered where clinically suitable, but they are not required for every patient and are not presented as stand-alone cures.'],
    ['Which areas are covered?', 'Home visits are offered from Bhayander to Andheri, subject to therapist availability.'],
    ['What if symptoms appear urgent?', 'Seek urgent medical assistance for severe or rapidly worsening symptoms, major trauma, breathing difficulty, chest pain, sudden weakness, loss of consciousness or other emergency concerns.']
  ];
  return `<main id="main-content">${leadSection('FAQs', 'Straight answers before you book.', 'These answers explain the service model. Individual clinical questions require an appropriate assessment.')}<section style="background:#F6F2EC;padding:clamp(54px,8vw,96px) clamp(20px,5vw,52px);"><div style="max-width:920px;margin:auto;">${questions.map((item, index) => `<details data-reveal data-delay="${Math.min(index * 45, 180)}" style="border-bottom:1px solid rgba(27,32,33,.14);padding:22px 0;"><summary style="cursor:pointer;color:#1B2021;font:600 clamp(20px,2.5vw,27px)/1.25 'Fraunces',serif;">${item[0]}</summary><p style="max-width:68ch;margin:14px 0 0;color:#4A4F4C;line-height:1.7;">${item[1]}</p></details>`).join('')}</div></section></main>`;
}

function reviewsBody() {
  return `<main id="main-content">${leadSection('Reviews', 'Public feedback, shown transparently.', 'The website displays only feedback available from the connected Google Business Profile. Reviews are not invented, rewritten or incentivised.')}${verifiedReviewSection()}</main>`;
}

function contactBody() {
  return `<main id="main-content">${leadSection('Contact and booking', 'Tell us where care is needed.', 'For the first contact, share only what is necessary: the suburb, preferred timing and a short reason for the enquiry. Detailed medical information can be discussed through an appropriate clinical channel.')}<section style="background:#F6F2EC;padding:clamp(56px,8vw,96px) clamp(20px,5vw,52px);"><div style="max-width:1000px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:18px;"><a href="${WHATSAPP}" target="_blank" rel="noopener" style="border-radius:24px;background:#25D366;color:#fff;padding:30px;text-decoration:none;"><strong style="display:block;font:600 30px/1.1 'Fraunces',serif;">WhatsApp</strong><span style="display:block;margin-top:12px;">Start a simple availability conversation.</span></a><a href="${PHONE_LINK}" style="border-radius:24px;background:#fff;color:#0E4F52;padding:30px;text-decoration:none;"><strong style="display:block;font:600 30px/1.1 'Fraunces',serif;">Call</strong><span style="display:block;margin-top:12px;">${PHONE}</span></a><a href="${CALENDLY}" target="_blank" rel="noopener" style="border-radius:24px;background:#EE7B5B;color:#1B2021;padding:30px;text-decoration:none;"><strong style="display:block;font:600 30px/1.1 'Fraunces',serif;">Consultation</strong><span style="display:block;margin-top:12px;">Choose a time through Calendly.</span></a></div></section></main>`;
}

function legalBody(label, title, paragraphs) {
  return `<main id="main-content">${leadSection(label, title, paragraphs[0])}<section style="background:#F6F2EC;padding:clamp(48px,7vw,84px) clamp(20px,5vw,52px);"><div style="max-width:850px;margin:auto;">${paragraphs.slice(1).map((paragraph, index) => `<p data-reveal data-delay="${Math.min(index * 40, 160)}" style="margin:0 0 22px;color:#4A4F4C;font-size:16px;line-height:1.75;">${paragraph}</p>`).join('')}</div></section></main>`;
}

function addGeneratedPages() {
  for (const [slug, name, description, detail] of conditionPages) {
    pages.push({ output: `conditions/${slug}/index.html`, route: `/conditions/${slug}/`, title: `${name} | PhysioByRutvi`, description, body: detailBody('Condition guide', name, description, detail) });
  }
  pages.push({ output: 'services/index.html', route: '/services/', title: 'Home Physiotherapy Services | PhysioByRutvi', description: 'Explore home physiotherapy services delivered under clinically led care standards across Mumbai’s western suburbs.', body: servicesIndexBody() });
  for (const [slug, name, description, detail] of servicePages) {
    pages.push({ output: `services/${slug}/index.html`, route: `/services/${slug}/`, title: `${name} | PhysioByRutvi`, description, body: detailBody('Service', name, description, detail) });
  }
  pages.push(
    { output: 'how-care-works/index.html', route: '/how-care-works/', title: 'How Home Physiotherapy Works | PhysioByRutvi', description: 'Understand the booking, suitability, assessment and review process for PhysioByRutvi home visits.', body: howCareWorksBody() },
    { output: 'service-areas/index.html', route: '/service-areas/', title: 'Home Physiotherapy Service Areas | PhysioByRutvi', description: 'Home physiotherapy availability from Bhayander to Andheri.', body: serviceAreasBody() },
    { output: 'reviews/index.html', route: '/reviews/', title: 'Google Reviews | PhysioByRutvi', description: 'Verified public Google feedback for PhysioByRutvi.', body: reviewsBody() },
    { output: 'faqs/index.html', route: '/faqs/', title: 'Home Physiotherapy FAQs | PhysioByRutvi', description: 'Answers about home visits, team-based care, booking and clinical suitability.', body: faqBody() },
    { output: 'contact/index.html', route: '/contact/', title: 'Contact and Booking | PhysioByRutvi', description: 'Contact the PhysioByRutvi care team about a home physiotherapy visit.', body: contactBody() },
    { output: 'privacy-policy/index.html', route: '/privacy-policy/', title: 'Privacy Policy | PhysioByRutvi', description: 'Privacy information for PhysioByRutvi website visitors and enquiries.', body: legalBody('Privacy', 'Privacy policy.', ['We collect only the information needed to respond to enquiries, arrange services and support safe care.', 'Information submitted through WhatsApp, phone or Calendly is also processed under those providers’ privacy terms. Do not send unnecessary sensitive medical information through advertising forms.', 'Clinical and contact information should be accessed only by authorised people for legitimate service purposes. We do not sell patient information.', 'For privacy questions or correction requests, contact PhysioByRutvi using the published phone or WhatsApp details.']) },
    { output: 'terms/index.html', route: '/terms/', title: 'Terms of Service | PhysioByRutvi', description: 'Service and website terms for PhysioByRutvi.', body: legalBody('Terms', 'Terms of service.', ['Website information is educational and does not create a physiotherapist-patient relationship until an appropriate service is agreed.', 'Home-visit availability depends on location, timing, clinical suitability and therapist capacity.', 'Fees, package validity, cancellation terms and any equipment requirements should be confirmed before purchase.', 'Results and recovery timelines differ. PhysioByRutvi does not guarantee a cure or specific outcome.']) },
    { output: 'medical-disclaimer/index.html', route: '/medical-disclaimer/', title: 'Medical Disclaimer | PhysioByRutvi', description: 'Important medical and emergency information for website visitors.', body: legalBody('Medical disclaimer', 'Education is not diagnosis.', ['Website content cannot diagnose a condition or determine whether physiotherapy is safe for an individual.', 'Seek urgent medical care for severe or rapidly worsening symptoms, major trauma, chest pain, breathing difficulty, sudden weakness, loss of consciousness, loss of bladder or bowel control, or any concern that may be an emergency.', 'A physiotherapist may recommend medical review or decline treatment where assessment suggests that another service is more appropriate.']) },
    { output: 'cancellation-policy/index.html', route: '/cancellation-policy/', title: 'Cancellation Policy | PhysioByRutvi', description: 'Appointment cancellation and rescheduling information.', body: legalBody('Appointments', 'Cancellation policy.', ['Home visits include reserved clinical and travel time.', 'Cancellation notice, rescheduling options, fees and package validity must be confirmed during booking and shown on the patient’s invoice or service confirmation.', 'Emergencies and exceptional circumstances can be discussed with the care team.']) },
    { output: '404.html', route: '/404.html', title: 'Page Not Found | PhysioByRutvi', description: 'The requested page could not be found.', body: `<main id="main-content">${leadSection('404', 'This page has moved.', 'The link may be outdated. Return to the homepage, explore conditions or contact the care team for help finding the right information.')}</main>`, noindex: true }
  );

  const redirects = [
    ['home/index.html', '/home/', '/'],
    ['condition/index.html', '/condition/', '/conditions/'],
    ['privacy-policy.html', '/privacy-policy.html', '/privacy-policy/'],
    ['terms-of-service.html', '/terms-of-service.html', '/terms/'],
    ['conditions/back-and-neck-pain/index.html', '/conditions/back-and-neck-pain/', '/conditions/back-neck-pain/'],
    ['conditions/knee-and-joint-pain/index.html', '/conditions/knee-and-joint-pain/', '/conditions/knee-joint-pain/'],
    ['conditions/posture-and-work-related-discomfort/index.html', '/conditions/posture-and-work-related-discomfort/', '/conditions/posture-and-workstation/'],
    ['conditions/posture/index.html', '/conditions/posture/', '/conditions/posture-and-workstation/'],
    ['conditions/sports-injuries/index.html', '/conditions/sports-injuries/', '/conditions/sports-injury/'],
    ['conditions/strength-and-return-to-activity/index.html', '/conditions/strength-and-return-to-activity/', '/services/sports-rehabilitation/']
  ];
  for (const [output, route, target] of redirects) {
    pages.push({ output, route, title: 'Page Moved | PhysioByRutvi', description: 'This page has moved to a current PhysioByRutvi route.', redirect: target, noindex: true, body: `<main id="main-content">${leadSection('Page moved', 'Continue to the current page.', `This address has been replaced. <a href="${target}">Continue to the current information</a>.`)}</main>` });
  }
}

function schema(route) {
  const url = `${DOMAIN}${route}`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['MedicalBusiness', 'LocalBusiness'],
        '@id': `${DOMAIN}/#business`,
        name: 'PhysioByRutvi',
        url: DOMAIN,
        telephone: '+918879475065',
        founder: { '@id': `${DOMAIN}/about/#rutvi` },
        areaServed: ['Bhayander', 'Mira Road', 'Dahisar', 'Borivali', 'Kandivali', 'Malad', 'Goregaon', 'Jogeshwari', 'Andheri'].map(name => ({ '@type': 'Place', name }))
      },
      {
        '@type': 'Person',
        '@id': `${DOMAIN}/about/#rutvi`,
        name: 'Dr Rutvi K Gandhi (PT)',
        jobTitle: 'Founder and Clinical Lead',
        alumniOf: ['NMIMS Mumbai', 'Sumandeep Vidyapeeth'],
        url: `${DOMAIN}/about/`
      },
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, isPartOf: { '@id': `${DOMAIN}/#website` } }
    ]
  });
}

function renderPage(page, body) {
  const canonical = `${DOMAIN}${page.route}`;
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#0E4F52">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  ${page.noindex ? '<meta name="robots" content="noindex,follow">' : ''}
  ${page.redirect ? `<meta http-equiv="refresh" content="0;url=${page.redirect}">` : ''}
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en-IN" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${DOMAIN}/assets/social-share.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/site.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <script type="application/ld+json">${schema(page.route)}</script>
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${header()}
  ${body}
  ${footer()}
  <div id="pbrVoiceAgent"><elevenlabs-convai agent-id="agent_4701kwskch1ker1v5s2mpjdabvwq"></elevenlabs-convai></div>
  <script defer src="/assets/js/site.js"></script>
  <script defer src="/site-analytics.min.js"></script>
  <script defer src="/voice-widget-loader.js"></script>
</body>
</html>`.replace(/ & /g, ' &amp; ').split('\n').map(line => line.trimEnd()).join('\n');
}

addGeneratedPages();

for (const page of pages) {
  const body = page.body || normalizeBody(read(page.source), page.type);
  const output = path.join(ROOT, page.output);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, renderPage(page, body));
  console.log(`Built ${page.output}`);
}

const sitemapRoutes = pages.filter(page => !page.noindex).map(page => page.route);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes.map(route => `  <url><loc>${DOMAIN}${route}</loc><lastmod>2026-07-13</lastmod></url>`).join('\n')}
</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${DOMAIN}/sitemap.xml\n`);
console.log('Built sitemap.xml and robots.txt');
