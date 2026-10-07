import dashboard from './dashboard.html';

const PAGE_SIZE = 10;
// בתוכנית החינמית מותרות 50 בקשות יוצאות ו-50 שאילתות D1 לכל הרצה, אז משאירים מרווח
const FETCH_BUDGET = 35;
const MAX_FAILS_PER_DAY = 3;

const todayIL = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date());
const settings = (env) => ({
  country: env.COUNTRY || 'il',
  language: env.LANGUAGE || 'iw',
  maxDepth: Number(env.MAX_DEPTH) || 50,
});

// ---------- סריקה ----------

function normalize(url) {
  return url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[?#].*$/, '').replace(/\/+$/, '');
}

// target יכול להיות דומיין ("example.co.il") או דומיין עם נתיב ("user.github.io/site")
export function matchesTarget(url, target) {
  const u = normalize(url);
  const t = normalize(target);
  if (u === t || u.startsWith(t + '/')) return true;
  if (!t.includes('/')) return u.split('/')[0].endsWith('.' + t);
  return false;
}

async function fetchPage(env, keyword, page, s) {
  const res = await fetch(env.SERPER_URL || 'https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': env.SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: keyword, gl: s.country, hl: s.language, num: PAGE_SIZE, page }),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return (json.organic || []).map((r) => r.link).filter(Boolean);
}

// עוברת עמוד אחרי עמוד עד שהדומיין נמצא, כך שביטוי שמדורג בעמוד הראשון עולה בקשה אחת בלבד
async function findPosition(env, keyword, domain, s, spend) {
  let seen = 0;
  for (let page = 1; seen < s.maxDepth; page++) {
    spend();
    const links = await fetchPage(env, keyword, page, s);
    for (const link of links) {
      seen++;
      if (seen > s.maxDepth) break;
      if (matchesTarget(link, domain)) return { position: seen, url: link };
    }
    if (links.length === 0) break;
  }
  return { position: null, url: null };
}

export async function runBatch(env) {
  if (!env.SERPER_API_KEY) return { scanned: 0, failed: 0, error: 'SERPER_API_KEY חסר' };
  const s = settings(env);
  const today = todayIL();
  const pagesPerKeyword = Math.ceil(s.maxDepth / PAGE_SIZE);
  const limit = FETCH_BUDGET; // כל ביטוי עולה לפחות בקשה אחת

  const { results: pending } = await env.DB.prepare(
    `SELECT k.id, k.keyword, k.fail_date, k.fail_count, c.domain
       FROM keywords k JOIN clients c ON c.id = k.client_id
      WHERE NOT EXISTS (SELECT 1 FROM rankings r WHERE r.keyword_id = k.id AND r.date = ?1)
        AND NOT (k.fail_date = ?1 AND k.fail_count >= ?2)
      ORDER BY k.id LIMIT ?3`
  ).bind(today, MAX_FAILS_PER_DAY, limit).all();

  let budget = FETCH_BUDGET;
  const writes = [];
  let scanned = 0, failed = 0;
  for (const k of pending) {
    // מתחילים ביטוי רק אם נשאר מספיק תקציב לסרוק אותו עד הסוף
    if (budget < pagesPerKeyword) break;
    try {
      const r = await findPosition(env, k.keyword, k.domain, s, () => budget--);
      writes.push(env.DB.prepare('INSERT OR REPLACE INTO rankings (keyword_id, date, position, url) VALUES (?, ?, ?, ?)')
        .bind(k.id, today, r.position, r.url));
      scanned++;
    } catch (err) {
      // לא רושמים מיקום כשהבדיקה נכשלה, כדי שלא תופיע "נפילה" שלא קרתה. ננסה שוב בריצה הבאה.
      const count = k.fail_date === today ? k.fail_count + 1 : 1;
      writes.push(env.DB.prepare('UPDATE keywords SET fail_date = ?, fail_count = ? WHERE id = ?').bind(today, count, k.id));
      failed++;
      console.error(`${k.keyword}: ${err.message}`);
    }
  }
  if (writes.length) await env.DB.batch(writes);
  return { scanned, failed };
}

// ---------- API ----------

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});
const bad = (msg, status = 400) => json({ error: msg }, status);

function cleanDomain(d) {
  return normalize(String(d || '').trim());
}

async function body(request) {
  try { return await request.json(); } catch { return {}; }
}

async function listClients(env) {
  const [{ results: clients }, { results: keywords }] = await env.DB.batch([
    env.DB.prepare('SELECT id, name, domain FROM clients ORDER BY name'),
    env.DB.prepare('SELECT id, client_id, keyword FROM keywords ORDER BY id'),
  ]);
  return clients.map((c) => ({ ...c, keywords: keywords.filter((k) => k.client_id === c.id).map(({ id, keyword }) => ({ id, keyword })) }));
}

async function clientRankings(env, clientId) {
  const { results } = await env.DB.prepare(
    `SELECT k.id AS keyword_id, r.date, r.position, r.url
       FROM rankings r JOIN keywords k ON k.id = r.keyword_id
      WHERE k.client_id = ? ORDER BY r.date`
  ).bind(clientId).all();
  const keywords = {};
  let updated = null;
  for (const r of results) {
    (keywords[r.keyword_id] ||= []).push({ date: r.date, position: r.position, url: r.url });
    if (!updated || r.date > updated) updated = r.date;
  }
  return { updated, keywords };
}

async function status(env) {
  const today = todayIL();
  const row = await env.DB.prepare(
    `SELECT (SELECT COUNT(*) FROM keywords) AS total,
            (SELECT COUNT(*) FROM rankings WHERE date = ?1) AS done,
            (SELECT COUNT(*) FROM keywords WHERE fail_date = ?1 AND fail_count >= ?2
               AND id NOT IN (SELECT keyword_id FROM rankings WHERE date = ?1)) AS failed`
  ).bind(today, MAX_FAILS_PER_DAY).first();
  return { today, ...row, serperConfigured: !!env.SERPER_API_KEY, maxDepth: settings(env).maxDepth };
}

async function api(request, env, path) {
  const method = request.method;
  let m;

  if (path === '/api/status' && method === 'GET') return json(await status(env));
  if (path === '/api/scan' && method === 'POST') return json(await runBatch(env));
  if (path === '/api/clients' && method === 'GET') return json(await listClients(env));

  if (path === '/api/clients' && method === 'POST') {
    const { name, domain } = await body(request);
    if (!name?.trim() || !cleanDomain(domain)) return bad('צריך שם ודומיין');
    const row = await env.DB.prepare('INSERT INTO clients (name, domain) VALUES (?, ?) RETURNING id')
      .bind(name.trim(), cleanDomain(domain)).first();
    return json({ id: row.id }, 201);
  }

  if ((m = path.match(/^\/api\/clients\/(\d+)$/))) {
    const id = Number(m[1]);
    if (method === 'PATCH') {
      const { name, domain } = await body(request);
      if (!name?.trim() || !cleanDomain(domain)) return bad('צריך שם ודומיין');
      await env.DB.prepare('UPDATE clients SET name = ?, domain = ? WHERE id = ?').bind(name.trim(), cleanDomain(domain), id).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      await env.DB.batch([
        env.DB.prepare('DELETE FROM rankings WHERE keyword_id IN (SELECT id FROM keywords WHERE client_id = ?)').bind(id),
        env.DB.prepare('DELETE FROM keywords WHERE client_id = ?').bind(id),
        env.DB.prepare('DELETE FROM clients WHERE id = ?').bind(id),
      ]);
      return json({ ok: true });
    }
  }

  if ((m = path.match(/^\/api\/clients\/(\d+)\/rankings$/)) && method === 'GET') {
    return json(await clientRankings(env, Number(m[1])));
  }

  if ((m = path.match(/^\/api\/clients\/(\d+)\/keywords$/)) && method === 'POST') {
    const { keywords } = await body(request);
    const list = [...new Set((Array.isArray(keywords) ? keywords : []).map((k) => String(k).trim()).filter(Boolean))];
    if (!list.length) return bad('לא הוזנו ביטויים');
    if (list.length > 500) return bad('אפשר להוסיף עד 500 ביטויים בבת אחת');
    await env.DB.batch(list.map((k) => env.DB.prepare('INSERT OR IGNORE INTO keywords (client_id, keyword) VALUES (?, ?)').bind(Number(m[1]), k)));
    return json({ ok: true }, 201);
  }

  if ((m = path.match(/^\/api\/keywords\/(\d+)$/)) && method === 'DELETE') {
    const id = Number(m[1]);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM rankings WHERE keyword_id = ?').bind(id),
      env.DB.prepare('DELETE FROM keywords WHERE id = ?').bind(id),
    ]);
    return json({ ok: true });
  }

  return bad('לא נמצא', 404);
}

// ---------- סיסמה ----------

function authorized(request, env) {
  if (!env.DASHBOARD_PASSWORD) return false;
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  let decoded;
  try { decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0))); } catch { return false; }
  const password = decoded.slice(decoded.indexOf(':') + 1);
  const a = new TextEncoder().encode(password), b = new TextEncoder().encode(env.DASHBOARD_PASSWORD);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export default {
  async fetch(request, env) {
    if (!authorized(request, env)) {
      return new Response('נדרשת סיסמה', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="HODIGITAL", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    const path = new URL(request.url).pathname;
    if (path.startsWith('/api/')) {
      try { return await api(request, env, path); }
      catch (err) { console.error(err); return bad('שגיאת שרת: ' + err.message, 500); }
    }
    if (path === '/' || path === '/index.html') {
      return new Response(dashboard, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
      });
    }
    return new Response('לא נמצא', { status: 404 });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runBatch(env).then((r) => console.log('scan batch', JSON.stringify(r))));
  },
};
