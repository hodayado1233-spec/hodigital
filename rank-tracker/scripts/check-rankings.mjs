// סריקת דירוגים יומית: לכל לקוח ולכל ביטוי בודקת באיזה מקום הדומיין מופיע בגוגל
// ושומרת את המיקום ואת דף הנחיתה ב-data/<client-id>.json.
//
// הרצה: SERPER_API_KEY=... node rank-tracker/scripts/check-rankings.mjs
// בדיקה בלי API (מיקומים אקראיים): MOCK=1 node rank-tracker/scripts/check-rankings.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(ROOT, 'data');
const PAGE_SIZE = 10;
const API_KEY = process.env.SERPER_API_KEY;
const MOCK = process.env.MOCK === '1';

// התאריך לפי שעון ישראל, כדי שסריקה של 03:00 UTC תירשם ליום הנכון
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date());

function normalize(url) {
  return url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[?#].*$/, '').replace(/\/+$/, '');
}

// target יכול להיות דומיין ("example.co.il") או דומיין עם נתיב ("user.github.io/site")
function matchesTarget(url, target) {
  const u = normalize(url);
  const t = normalize(target);
  if (u === t || u.startsWith(t + '/')) return true;
  if (!t.includes('/')) {
    const host = u.split('/')[0];
    return host.endsWith('.' + t);
  }
  return false;
}

async function fetchPage(keyword, page, settings) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: keyword, gl: settings.country, hl: settings.language, num: PAGE_SIZE, page }),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return (json.organic || []).map((r) => r.link).filter(Boolean);
}

// עוברת עמוד אחרי עמוד עד שהדומיין נמצא או עד maxDepth, כך שביטוי שמדורג גבוה עולה בקשה אחת בלבד
async function findPosition(keyword, domain, settings) {
  if (MOCK) {
    const pos = Math.random() < 0.15 ? null : 1 + Math.floor(Math.random() * settings.maxDepth);
    return { position: pos, url: pos ? `https://${domain}/` : null };
  }
  let seen = 0;
  for (let page = 1; seen < settings.maxDepth; page++) {
    const links = await fetchPage(keyword, page, settings);
    for (const link of links) {
      seen++;
      if (seen > settings.maxDepth) break;
      if (matchesTarget(link, domain)) return { position: seen, url: link };
    }
    if (links.length === 0) break;
  }
  return { position: null, url: null };
}

async function loadJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

async function main() {
  if (!API_KEY && !MOCK) {
    console.error('חסר SERPER_API_KEY. יש להגדיר אותו ב-GitHub: Settings → Secrets and variables → Actions.');
    process.exit(1);
  }
  const config = JSON.parse(await readFile(join(ROOT, 'clients.json'), 'utf8'));
  const settings = { country: 'il', language: 'iw', maxDepth: 50, ...config.settings };
  await mkdir(DATA_DIR, { recursive: true });

  let failures = 0;
  for (const client of config.clients) {
    const file = join(DATA_DIR, `${client.id}.json`);
    const data = await loadJson(file, { keywords: {} });

    for (const keyword of client.keywords) {
      try {
        const { position, url } = await findPosition(keyword, client.domain, settings);
        const history = (data.keywords[keyword] ||= []);
        const entry = { date: today, position, url };
        const last = history[history.length - 1];
        if (last && last.date === today) history[history.length - 1] = entry;
        else history.push(entry);
        console.log(`${client.name} | ${keyword} → ${position ?? 'לא נמצא'}`);
      } catch (err) {
        // לא רושמים כלום כשהבדיקה נכשלה, כדי שלא תופיע "נפילה" שלא קרתה
        failures++;
        console.error(`${client.name} | ${keyword} → שגיאה: ${err.message}`);
      }
    }

    data.updated = today;
    await writeFile(file, JSON.stringify(data, null, 1) + '\n');
  }

  if (failures) {
    console.error(`${failures} בדיקות נכשלו`);
    process.exitCode = 1;
  }
}

main();
