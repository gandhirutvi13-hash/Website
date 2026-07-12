const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const pages = [
  { file: 'index.html', minSections: 7, required: ['pbrMenu', 'Clinical standards', 'dr-rutvi-founder-about-portrait.webp'] },
  { file: 'about/index.html', minSections: 8, required: ['Dr Rutvi K Gandhi (PT)', 'MPT', 'BPT', 'MIAP', 'Nanavati', 'IASTM', 'Myofascial Release', 'dr-rutvi-founder-at-work.webp'] },
  { file: 'conditions/index.html', minSections: 3, required: ['Conditions', 'Bhayander', 'Andheri'] }
];

const requiredRoutes = [
  '404.html',
  'services/index.html',
  'services/myofascial-release-iastm-cupping/index.html',
  'services/post-operative-rehabilitation/index.html',
  'services/sports-rehabilitation/index.html',
  'services/senior-physiotherapy/index.html',
  'how-care-works/index.html', 'service-areas/index.html', 'reviews/index.html',
  'faqs/index.html', 'contact/index.html', 'privacy-policy/index.html',
  'terms/index.html', 'medical-disclaimer/index.html', 'cancellation-policy/index.html',
  ...['back-neck-pain', 'sports-injury', 'post-surgery-rehabilitation', 'knee-joint-pain', 'sciatica', 'posture-and-workstation', 'frozen-shoulder', 'senior-mobility'].map(slug => `conditions/${slug}/index.html`)
];

const banned = [
  '<x-dc', '<dc-import', 'data-dc-script', '{{',
  '+91 98765 43210', 'wa.me/919876543210',
  '[MR DRAFT:', '[GU DRAFT:',
  'Same expert, every visit', 'same specialist, every visit',
  'No rotating aggregator therapists', 'Guaranteed cure', 'guaranteed cure',
  'eradicate pain', 'instant recovery'
];

let failed = false;
function fail(message) { failed = true; console.error(`FAIL: ${message}`); }

for (const page of pages) {
  const full = path.join(ROOT, page.file);
  if (!fs.existsSync(full)) { fail(`${page.file} is missing`); continue; }
  const html = fs.readFileSync(full, 'utf8');
  const sections = (html.match(/<section\b/g) || []).length;
  if (sections < page.minSections) fail(`${page.file} has ${sections} sections; expected at least ${page.minSections}`);
  for (const text of page.required) if (!html.includes(text)) fail(`${page.file} is missing required evidence: ${text}`);
  for (const text of banned) if (html.includes(text)) fail(`${page.file} contains banned text: ${text}`);
  if ((html.match(/id="main-content"/g) || []).length !== 1) fail(`${page.file} must contain exactly one main-content landmark`);
  if (!html.includes('aria-controls="pbrMenu"') || !html.includes('aria-modal="true"') || !html.includes(' inert>')) fail(`${page.file} is missing accessible menu state`);
  if (!html.includes('<link rel="canonical"')) fail(`${page.file} is missing a canonical URL`);
}

for (const file of requiredRoutes) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) { fail(`Required route is missing: ${file}`); continue; }
  const html = fs.readFileSync(full, 'utf8');
  for (const text of banned) if (html.includes(text)) fail(`${file} contains banned text: ${text}`);
  if ((html.match(/id="main-content"/g) || []).length !== 1) fail(`${file} must contain exactly one main-content landmark`);
  if (!html.includes('pbrMenu')) fail(`${file} does not use the shared page shell`);
}

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('https://physiobyrutvi.in/services/myofascial-release-iastm-cupping/')) fail('Sitemap is missing the new IASTM/cupping service');
if (sitemap.includes('/404.html')) fail('Sitemap must not include the 404 page');
const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
if (!robots.includes('Sitemap: https://physiobyrutvi.in/sitemap.xml')) fail('robots.txt has the wrong sitemap location');

const assetFiles = [
  'assets/css/site.css',
  'assets/js/site.js',
  'assets/img/dr-rutvi-founder-about-portrait.webp',
  'assets/img/dr-rutvi-founder-landscape.webp',
  'assets/img/dr-rutvi-founder-at-work.webp'
];
for (const file of assetFiles) if (!fs.existsSync(path.join(ROOT, file))) fail(`Missing asset: ${file}`);

const generated = pages.map(page => fs.readFileSync(path.join(ROOT, page.file), 'utf8')).join('\n');
if (generated.includes('15-Minute') && generated.includes('calendly.com/gandhirutvi13/30min')) {
  fail('A 30-minute Calendly event is incorrectly labelled as 15 minutes');
}

const allGeneratedFiles = [...pages.map(page => page.file), ...requiredRoutes];
for (const file of allGeneratedFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const links = [...html.matchAll(/href="(\/[^"]*)"/g)].map(match => match[1]);
  for (const link of links) {
    const pathname = link.split('#')[0].split('?')[0];
    if (!pathname || pathname === '/') continue;
    if (pathname.startsWith('/assets/')) continue;
    const target = pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : pathname.slice(1);
    if (!fs.existsSync(path.join(ROOT, target))) fail(`${file} links to missing internal route: ${pathname}`);
  }
}

if (failed) process.exit(1);
console.log('PASS: static design, content, safety and structure checks passed.');
