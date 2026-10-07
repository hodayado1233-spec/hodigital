// Checks Google rankings for a client's keywords in a fresh incognito browser
// context and writes them into that month's report file.
//
// Usage:
//   node rank-check.mjs <client-id> <YYYY-MM> [--headed] [--mobile] [--pages=3]
//
// Reads  reports/data/<client>/keywords.json
// Writes reports/data/<client>/<YYYY-MM>.json  (only the "rankings" key; the rest is kept)
// "prev" for each keyword is taken from the previous month's report, when one exists.

import { chromium, devices } from 'playwright';
import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const args = process.argv.slice(2);
const [clientId, month] = args.filter(a => !a.startsWith('--'));
const flag = name => args.includes(`--${name}`);
const opt = (name, def) => (args.find(a => a.startsWith(`--${name}=`)) || '').split('=')[1] || def;

if (!clientId || !/^\d{4}-\d{2}$/.test(month || '')) {
  console.error('Usage: node rank-check.mjs <client-id> <YYYY-MM> [--headed] [--mobile] [--pages=3]');
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'reports', 'data', clientId);
const config = JSON.parse(await readFile(path.join(dir, 'keywords.json'), 'utf8'));
const mobile = flag('mobile') || config.device === 'mobile';
const maxPages = Number(opt('pages', 3)); // 10 results per page

const exists = p => access(p).then(() => true, () => false);
const readJson = async p => (await exists(p)) ? JSON.parse(await readFile(p, 'utf8')) : null;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const jitter = (min, max) => sleep(min + Math.random() * (max - min));

function prevMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

// True when a result URL belongs to the client's domain (including subdomains).
function isClientUrl(href, domain) {
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    const d = domain.replace(/^www\./, '');
    return host === d || host.endsWith('.' + d);
  } catch { return false; }
}

async function waitIfCaptcha(page) {
  if (!page.url().includes('/sorry/') && !(await page.locator('form#captcha-form, #recaptcha').count())) return;
  if (!flag('headed')) {
    throw new Error('Google showed a CAPTCHA. Run again with --headed and solve it in the window.');
  }
  console.log('  CAPTCHA – solve it in the browser window, the check will continue on its own…');
  await page.waitForURL(u => !u.toString().includes('/sorry/'), { timeout: 5 * 60_000 });
}

async function acceptConsent(page) {
  const btn = page.locator('button:has-text("אישור הכול"), button:has-text("Accept all")').first();
  if (await btn.count()) await btn.click().catch(() => {});
}

// Organic result links on the current SERP page, in order. Ads live outside #rso.
async function organicLinks(page) {
  return page.$$eval('#rso a:has(h3)', as => {
    const seen = new Set();
    return as.map(a => a.href).filter(h => h.startsWith('http') && !h.includes('google.') && !seen.has(h) && seen.add(h));
  });
}

async function checkKeyword(page, keyword) {
  let offset = 0;
  for (let p = 0; p < maxPages; p++) {
    const url = `https://www.google.co.il/search?q=${encodeURIComponent(keyword)}&hl=iw&gl=il&pws=0&start=${p * 10}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await acceptConsent(page);
    await waitIfCaptcha(page);
    await page.waitForSelector('#rso', { timeout: 15_000 }).catch(() => {});
    const links = await organicLinks(page);
    const idx = links.findIndex(h => isClientUrl(h, config.domain));
    if (idx >= 0) {
      const u = new URL(links[idx]);
      return { position: offset + idx + 1, url: u.pathname + u.search };
    }
    if (!links.length) break;
    offset += links.length;
    await jitter(2500, 5000);
  }
  return { position: null, url: null };
}

const prevReport = await readJson(path.join(dir, `${prevMonth(month)}.json`));
const prevByKeyword = new Map((prevReport?.rankings?.keywords || []).map(k => [k.keyword, k.position]));

const browser = await chromium.launch({ headless: !flag('headed') });
// A new context has no cookies or history – the same as an incognito window.
const context = await browser.newContext({
  ...(mobile ? devices['Pixel 7'] : { viewport: { width: 1366, height: 900 } }),
  locale: 'he-IL',
  timezoneId: 'Asia/Jerusalem',
});
const page = await context.newPage();

const results = [];
try {
  for (const keyword of config.keywords) {
    const r = await checkKeyword(page, keyword);
    const prev = prevByKeyword.get(keyword) ?? null;
    results.push({ keyword, position: r.position, prev, url: r.url });
    console.log(`${String(r.position ?? '-').padStart(4)}  ${keyword}  ${r.url ?? ''}`);
    await jitter(6000, 12000);
  }
} finally {
  await browser.close();
}

const reportPath = path.join(dir, `${month}.json`);
const report = (await readJson(reportPath)) || { client: { name: clientId, domain: config.domain }, month, kpis: {} };
report.rankings = {
  checkedAt: new Date().toISOString().slice(0, 10),
  engine: 'google.co.il',
  device: mobile ? 'mobile' : 'desktop',
  keywords: results,
};
await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(`\nSaved ${results.length} keywords to ${path.relative(root, reportPath)}`);
