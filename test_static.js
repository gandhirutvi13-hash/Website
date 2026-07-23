const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const pages = [
  { file: 'index.html', minSections: 7, required: ['pbrMenu', 'Clinical standards', 'dr-rutvi-founder-about-portrait.webp'] },
  { file: 'about/index.html', minSections: 8, required: ['Dr Rutvi K Gandhi (PT)', 'MPT', 'BPT', 'MIAP', 'Nanavati', 'IASTM', 'Myofascial Release', 'dr-rutvi-founder-at-work.webp', 'dr-rutvi-founder-landscape.webp', 'Free 15-Minute'] },
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
  'eradicate pain', 'instant recovery', 'Rutvi visits your home',
  'she replies personally', 'The Person Who', 'The person who assesses you',
  'Message Dr Rutvi today, the same specialist'
];

let failed = false;
function fail(message) { failed = true; console.error(`FAIL: ${message}`); }
const DOMAIN = 'https://physiobyrutvi.in';

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

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (sitemapUrls.length !== new Set(sitemapUrls).size) fail('Sitemap contains duplicate URLs');
if (!sitemapUrls.length) fail('Sitemap contains no URLs');

const indexableTitles = new Map();
const indexableDescriptions = new Map();
for (const url of sitemapUrls) {
  if (!url.startsWith(`${DOMAIN}/`)) fail(`Sitemap URL is outside the canonical domain: ${url}`);
  const route = new URL(url).pathname;
  const file = route === '/' ? 'index.html' : `${route.slice(1)}index.html`;
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) { fail(`Sitemap URL has no local page: ${url}`); continue; }
  const html = fs.readFileSync(full, 'utf8');
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
  const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
  const description = (html.match(/<meta name="description" content="([^"]+)">/) || [])[1];
  if (canonical !== url) fail(`${file} canonical is ${canonical || 'missing'}; expected ${url}`);
  if (/name="robots"[^>]+noindex/i.test(html)) fail(`${file} is in the sitemap but marked noindex`);
  if (!title) fail(`${file} has no title`);
  if (!description) fail(`${file} has no meta description`);
  if (title && indexableTitles.has(title)) fail(`${file} duplicates the title used by ${indexableTitles.get(title)}`);
  if (description && indexableDescriptions.has(description)) fail(`${file} duplicates the description used by ${indexableDescriptions.get(description)}`);
  if (title) indexableTitles.set(title, file);
  if (description) indexableDescriptions.set(description, file);
  if (html.includes('—')) fail(`${file} contains an em dash`);
  const schemaText = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
  if (!schemaText) fail(`${file} has no JSON-LD`);
  else {
    try {
      const schema = JSON.parse(schemaText);
      const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
      if (!graph.some(item => item['@type'] === 'WebSite' && item['@id'] === `${DOMAIN}/#website`)) {
        fail(`${file} schema does not define the referenced WebSite entity`);
      }
    } catch (error) { fail(`${file} contains invalid JSON-LD: ${error.message}`); }
  }
}

function listHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? listHtmlFiles(full) : (entry.name.endsWith('.html') ? [full] : []);
  });
}

const sitemapFiles = new Set(sitemapUrls.map(url => {
  const route = new URL(url).pathname;
  return path.normalize(path.join(ROOT, route === '/' ? 'index.html' : `${route.slice(1)}index.html`));
}));
for (const full of listHtmlFiles(ROOT)) {
  const html = fs.readFileSync(full, 'utf8');
  const relative = path.relative(ROOT, full);
  if (!sitemapFiles.has(path.normalize(full)) && !/name="robots" content="noindex,(?:follow|nofollow)"/i.test(html)) {
    fail(`${relative} is a public non-canonical HTML file without noindex`);
  }
}

for (const file of ['build_static.js', 'site-i18n.js', 'site-i18n.min.js', 'About Dr Rutvi.dc.html', 'Condition.dc.html']) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (content.includes('—')) fail(`${file} can reintroduce em dashes into website content`);
}

for (const file of ['home/index.html', 'condition/index.html', 'privacy-policy.html', 'terms-of-service.html']) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const target = (html.match(/http-equiv="refresh" content="0;url=([^"]+)"/) || [])[1];
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
  if (!target || canonical !== `${DOMAIN}${target}`) fail(`${file} does not canonicalize its moved URL to the destination`);
  if (!/name="robots" content="noindex,follow"/.test(html)) fail(`${file} redirect fallback must be noindex,follow`);
}

const assetFiles = [
  'assets/css/site.css',
  'assets/js/site.js',
  'assets/pbr-logo-horizontal.png',
  'assets/pbr-logo-horizontal.webp',
  'assets/pbr-logo-mark.png',
  'assets/pbr-logo-mark.webp',
  'assets/img/dr-rutvi-founder-about-portrait.webp',
  'assets/img/dr-rutvi-founder-landscape.webp',
  'assets/img/dr-rutvi-founder-at-work.webp'
];
for (const file of assetFiles) if (!fs.existsSync(path.join(ROOT, file))) fail(`Missing asset: ${file}`);

const generated = pages.map(page => fs.readFileSync(path.join(ROOT, page.file), 'utf8')).join('\n');
if (!generated.includes('Free 15-Minute Consultation')) fail('The confirmed 15-minute consultation label is missing');
if (!generated.includes('calendly.com/gandhirutvi13/30min')) fail('The existing Calendly event link is missing');
const analytics = fs.readFileSync(path.join(ROOT, 'site-analytics.js'), 'utf8');
if (!analytics.includes("'click_calendly'") || !analytics.includes("'free_15_minute_consultation'")) fail('Calendly lead-click tracking is missing');
for (const field of ['lead_type', 'cta_text', 'cta_location', 'page_path']) {
  if (!analytics.includes(field)) fail(`Lead tracking is missing ${field} context`);
}
if (!/function trackLead[\s\S]*loadGtag\(\)/.test(analytics)) fail('Lead clicks must load analytics immediately before navigation');

const allGeneratedFiles = [...pages.map(page => page.file), ...requiredRoutes];
const developerCredit = 'Developed by <a href="https://github.com/ApeLabsNFT" target="_blank" rel="noopener noreferrer">ApeLabs</a>';
const whatsappDummyPattern = /___|My name is|suburb is\s*_+|preferred day\/time is\s*_+/i;
for (const file of allGeneratedFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (!html.includes(developerCredit)) fail(`${file} is missing the linked ApeLabs developer credit`);
  const whatsappLinks = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map(match => match[1].replace(/&amp;/g, '&'));
  if (!whatsappLinks.length) fail(`${file} has no WhatsApp enquiry link`);
  for (const link of whatsappLinks) {
    let message = '';
    try { message = new URL(link).searchParams.get('text') || ''; }
    catch (error) { fail(`${file} has an invalid WhatsApp URL: ${error.message}`); }
    if (!message) fail(`${file} has a WhatsApp link without a ready-to-send message`);
    if (whatsappDummyPattern.test(message)) fail(`${file} has a WhatsApp message containing dummy blanks: ${message}`);
  }
  const links = [...html.matchAll(/href="(\/[^"]*)"/g)].map(match => match[1]);
  for (const link of links) {
    const pathname = link.split('#')[0].split('?')[0];
    if (!pathname || pathname === '/') continue;
    if (pathname.startsWith('/assets/')) continue;
    const target = pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : pathname.slice(1);
    if (!fs.existsSync(path.join(ROOT, target))) fail(`${file} links to missing internal route: ${pathname}`);
  }
}

for (const file of ['build_static.js', 'site-i18n.js', 'site-i18n.min.js', 'Home.dc.html', 'Home.dc (1).html', 'MobileCTA.dc.html']) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (whatsappDummyPattern.test(content)) fail(`${file} can reintroduce dummy WhatsApp placeholders`);
}

if (failed) process.exit(1);
console.log('PASS: static design, content, safety and structure checks passed.');
