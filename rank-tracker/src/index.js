import dashboard from './dashboard.html';

// בתוכנית החינמית מותרות 50 בקשות יוצאות לכל הרצה, אז משאירים מרווח
const FETCH_BUDGET = 40;
// כמה ימים אחורה למשוך כשלקוח חדש נוסף (Search Console שומר 16 חודשים)
const BACKFILL_DAYS = 90;
// נתוני Search Console מתעדכנים באיחור ומשתנים כמה ימים, אז כל יום מושכים מחדש את הימים האחרונים
const REFRESH_DAYS = 7;
// כמה ביטויים בכל שאילתה (הם נשלחים כביטוי רגולרי אחד)
const KEYWORDS_PER_QUERY = 40;
const ROW_LIMIT = 25000;

const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

// בדיקת המיקום המדויק בגוגל (Serper): עד איזה מקום בודקים, ו-10 תוצאות בכל עמוד
const MAX_DEPTH = 50;
const PAGE_SIZE = 10;
const MAX_FAILS_PER_DAY = 3;
// השעה (שעון ישראל) שבה מתחיל העדכון היומי
const SYNC_HOUR = 7;

const todayIL = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date());
const hourIL = () => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', hourCycle: 'h23' }).format(new Date()));

function shiftDate(date, days) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function normalize(url) {
  return url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[?#].*$/, '').replace(/\/+$/, '');
}

// Search Console שומר את השאילתות באותיות קטנות ועם רווח אחד בין מילים
export const normalizeKeyword = (k) => String(k).trim().toLowerCase().replace(/\s+/g, ' ');

// ---------- מיקום מדויק בגוגל ישראל (Serper) ----------

// target יכול להיות דומיין ("example.co.il") או דומיין עם נתיב ("user.github.io/site")
export function matchesTarget(url, target) {
  const u = normalize(url);
  const t = normalize(target);
  if (u === t || u.startsWith(t + '/')) return true;
  if (!t.includes('/')) return u.split('/')[0].endsWith('.' + t);
  return false;
}

async function serperPage(env, keyword, page, spend) {
  spend();
  const res = await fetch(env.SERPER_URL || 'https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': env.SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: keyword, gl: 'il', hl: 'iw', num: PAGE_SIZE, page }),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return (json.organic || []).map((r) => r.link).filter(Boolean);
}

// עוברת עמוד אחרי עמוד עד שהדומיין נמצא, כך שביטוי שמדורג בעמוד הראשון עולה בדיקה אחת בלבד
async function serpPosition(env, keyword, domain, spend) {
  let seen = 0;
  for (let page = 1; seen < MAX_DEPTH; page++) {
    const links = await serperPage(env, keyword, page, spend);
    for (const link of links) {
      seen++;
      if (seen > MAX_DEPTH) break;
      if (matchesTarget(link, domain)) return { position: seen, url: link };
    }
    if (links.length === 0) break;
  }
  return { position: null, url: null };
}

async function runSerp(env, today, spend, budgetLeft) {
  const { results: pending } = await env.DB.prepare(
    `SELECT k.id, k.keyword, k.fail_date, k.fail_count, c.domain
       FROM keywords k JOIN clients c ON c.id = k.client_id
      WHERE NOT EXISTS (SELECT 1 FROM serp s WHERE s.keyword_id = k.id AND s.date = ?1)
        AND NOT (k.fail_date = ?1 AND k.fail_count >= ?2)
      ORDER BY k.id LIMIT 50`
  ).bind(today, MAX_FAILS_PER_DAY).all();

  const writes = [];
  let checked = 0, failed = 0;
  for (const k of pending) {
    // מתחילים ביטוי רק אם נשאר מספיק תקציב לבדוק אותו עד הסוף
    if (budgetLeft() < MAX_DEPTH / PAGE_SIZE) break;
    try {
      const r = await serpPosition(env, k.keyword, k.domain, spend);
      writes.push(env.DB.prepare('INSERT OR REPLACE INTO serp (keyword_id, date, position, url) VALUES (?, ?, ?, ?)')
        .bind(k.id, today, r.position, r.url));
      checked++;
    } catch (err) {
      if (err.budget) break;
      // לא רושמים מיקום כשהבדיקה נכשלה, כדי שלא תופיע "נפילה" שלא קרתה. ננסה שוב בריצה הבאה.
      const count = k.fail_date === today ? k.fail_count + 1 : 1;
      writes.push(env.DB.prepare('UPDATE keywords SET fail_date = ?, fail_count = ? WHERE id = ?').bind(today, count, k.id));
      failed++;
      console.error(`serp ${k.keyword}: ${err.message}`);
    }
  }
  if (writes.length) await env.DB.batch(writes);
  return { checked, failed };
}

// ---------- התחברות ל-Google עם Service Account ----------

const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlJson = (obj) => b64url(new TextEncoder().encode(JSON.stringify(obj)));

function serviceAccount(env) {
  if (!env.GSC_SERVICE_ACCOUNT) return null;
  try {
    const sa = JSON.parse(env.GSC_SERVICE_ACCOUNT);
    return sa.client_email && sa.private_key ? sa : null;
  } catch {
    return null;
  }
}

let cachedToken = null;

async function accessToken(env, sa, spend) {
  if (cachedToken && cachedToken.email === sa.client_email && cachedToken.expires > Date.now() + 60_000) return cachedToken.token;
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const key = await crypto.subtle.importKey(
    'pkcs8', Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'],
  );
  const tokenUrl = env.GOOGLE_TOKEN_URL || 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64urlJson({ alg: 'RS256', typ: 'JWT' }) + '.' +
    b64urlJson({ iss: sa.client_email, scope: GSC_SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  spend();
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + b64url(sig) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('ההתחברות ל-Google נכשלה: ' + (data.error_description || data.error || res.status));
  cachedToken = { email: sa.client_email, token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function gsc(env, token, path, body, spend) {
  spend();
  const base = env.GSC_API_BASE || 'https://www.googleapis.com/webmasters/v3';
  const res = await fetch(base + path, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error?.message || 'Search Console ' + res.status);
    err.status = res.status;
    throw err;
  }
  return data;
}

// מוצאת את הנכס ב-Search Console שמתאים לדומיין של הלקוח: קודם נכס דומיין, אחר כך נכס לפי כתובת
export function pickProperty(sites, domain) {
  const target = normalize(domain);
  const host = target.split('/')[0];
  const usable = sites.filter((s) => s.permissionLevel !== 'siteUnverifiedUser');
  const domainProp = usable.find((s) => s.siteUrl === 'sc-domain:' + host);
  if (domainProp) return domainProp.siteUrl;
  const prefixes = usable
    .filter((s) => !s.siteUrl.startsWith('sc-domain:'))
    .map((s) => ({ siteUrl: s.siteUrl, n: normalize(s.siteUrl) }))
    .filter(({ n }) => target === n || target.startsWith(n + '/') || n.startsWith(target + '/'))
    .sort((a, b) => b.n.length - a.n.length);
  return prefixes[0]?.siteUrl || null;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function queryAll(env, token, property, body, spend) {
  const rows = [];
  for (let startRow = 0; ; startRow += ROW_LIMIT) {
    const data = await gsc(env, token, `/sites/${encodeURIComponent(property)}/searchAnalytics/query`, { ...body, rowLimit: ROW_LIMIT, startRow }, spend);
    rows.push(...(data.rows || []));
    if (!data.rows || data.rows.length < ROW_LIMIT) return rows;
  }
}

// מושכת ללקוח אחד את המיקום, הקליקים, החשיפות ודף הנחיתה לכל ביטוי ולכל יום בטווח
async function fetchClient(env, token, client, keywords, startDate, endDate, spend) {
  // באילו ימים יש כבר נתונים סופיים לאתר. ימים בלי נתונים בכלל עוד לא עובדו בגוגל ולא נשמור אותם.
  const dateRows = await queryAll(env, token, client.gsc_property, { startDate, endDate, dimensions: ['date'] }, spend);
  const dates = dateRows.map((r) => r.keys[0]).sort();
  if (!dates.length) return { rows: [], lastDate: null };

  const byKeyword = new Map(keywords.map((k) => [normalizeKeyword(k.keyword), k.id]));
  const stats = new Map(); // `${id}|${date}` -> נתונים
  const keys = [...byKeyword.keys()];
  for (let i = 0; i < keys.length; i += KEYWORDS_PER_QUERY) {
    const chunk = keys.slice(i, i + KEYWORDS_PER_QUERY);
    const filter = { dimensionFilterGroups: [{ filters: [{ dimension: 'query', operator: 'includingRegex', expression: '^(' + chunk.map(escapeRe).join('|') + ')$' }] }] };
    const [byQuery, byPage] = await Promise.all([
      queryAll(env, token, client.gsc_property, { startDate, endDate, dimensions: ['date', 'query'], ...filter }, spend),
      queryAll(env, token, client.gsc_property, { startDate, endDate, dimensions: ['date', 'query', 'page'], ...filter }, spend),
    ]);
    for (const r of byQuery) {
      const id = byKeyword.get(r.keys[1]);
      if (id) stats.set(`${id}|${r.keys[0]}`, { position: Math.round(r.position * 10) / 10, clicks: r.clicks, impressions: r.impressions, url: null, best: -1 });
    }
    // דף הנחיתה של ביטוי ביום מסוים = הדף עם הכי הרבה חשיפות
    for (const r of byPage) {
      const s = stats.get(`${byKeyword.get(r.keys[1])}|${r.keys[0]}`);
      if (s && r.impressions > s.best) { s.url = r.keys[2]; s.best = r.impressions; }
    }
  }

  const rows = [];
  for (const date of dates) {
    for (const k of keywords) {
      const s = stats.get(`${k.id}|${date}`);
      rows.push({ k: k.id, d: date, p: s?.position ?? null, u: s?.url ?? null, c: s?.clicks ?? 0, i: s?.impressions ?? 0 });
    }
  }
  return { rows, lastDate: dates[dates.length - 1] };
}

async function saveRows(env, rows) {
  // הכנסה של הרבה שורות בשאילתה אחת דרך JSON, כדי לא לעבור את מגבלת השאילתות
  const stmts = [];
  for (let i = 0; i < rows.length; i += 1000) {
    stmts.push(env.DB.prepare(
      `INSERT OR REPLACE INTO rankings (keyword_id, date, position, url, clicks, impressions)
       SELECT json_extract(value, '$.k'), json_extract(value, '$.d'), json_extract(value, '$.p'),
              json_extract(value, '$.u'), json_extract(value, '$.c'), json_extract(value, '$.i')
         FROM json_each(?)`
    ).bind(JSON.stringify(rows.slice(i, i + 1000))));
  }
  if (stmts.length) await env.DB.batch(stmts);
}

// הריצה התקופתית: מ-07:00 בכל יום בודקת מה עוד לא עודכן היום, ומעדכנת עד שנגמר התקציב של הריצה
export async function runBatch(env, { force = false } = {}) {
  if (!force && hourIL() < SYNC_HOUR) return { skipped: 'before sync hour' };
  const today = todayIL();
  let budget = FETCH_BUDGET;
  const spend = () => {
    if (budget <= 0) throw Object.assign(new Error('budget'), { budget: true });
    budget--;
  };
  const result = {};
  const sa = serviceAccount(env);
  if (sa) result.gsc = await runGsc(env, sa, today, force, spend, () => budget);
  if (env.SERPER_API_KEY) result.serp = await runSerp(env, today, spend, () => budget);
  if (!sa && !env.SERPER_API_KEY) result.error = 'לא הוגדרו SERPER_API_KEY או GSC_SERVICE_ACCOUNT';
  return result;
}

async function runGsc(env, sa, today, force, spend, budgetLeft) {
  const [{ results: clients }, { results: keywords }] = await env.DB.batch([
    env.DB.prepare(`SELECT id, name, domain, gsc_property, backfilled, fetched_on FROM clients
                     WHERE ?1 OR fetched_on IS NULL OR fetched_on < ?2 ORDER BY backfilled, id`).bind(force ? 1 : 0, today),
    env.DB.prepare('SELECT id, client_id, keyword FROM keywords'),
  ]);
  if (!clients.length) return { updated: 0 };

  let token, sites;
  try {
    token = await accessToken(env, sa, spend);
  } catch (err) {
    return { updated: 0, error: err.message };
  }

  let updated = 0;
  for (const client of clients) {
    const kws = keywords.filter((k) => k.client_id === client.id);
    try {
      if (!client.gsc_property) {
        sites ||= (await gsc(env, token, '/sites', null, spend)).siteEntry || [];
        client.gsc_property = pickProperty(sites, client.domain);
        if (!client.gsc_property) {
          await env.DB.prepare('UPDATE clients SET gsc_error = ?, fetched_on = ? WHERE id = ?')
            .bind('no_access', today, client.id).run();
          continue;
        }
      }
      if (!kws.length) {
        await env.DB.prepare('UPDATE clients SET gsc_property = ?, gsc_error = NULL, fetched_on = ? WHERE id = ?')
          .bind(client.gsc_property, today, client.id).run();
        continue;
      }
      // צריך לפחות 3 בקשות לכל קבוצת ביטויים, אז לא מתחילים לקוח בלי מספיק תקציב
      if (budgetLeft() < 1 + 2 * Math.ceil(kws.length / KEYWORDS_PER_QUERY)) break;
      const start = shiftDate(today, client.backfilled ? -REFRESH_DAYS : -BACKFILL_DAYS);
      const { rows } = await fetchClient(env, token, client, kws, start, shiftDate(today, -1), spend);
      await saveRows(env, rows);
      await env.DB.prepare('UPDATE clients SET gsc_property = ?, gsc_error = NULL, backfilled = 1, fetched_on = ? WHERE id = ?')
        .bind(client.gsc_property, today, client.id).run();
      updated++;
    } catch (err) {
      if (err.budget) break;
      const code = err.status === 403 ? 'no_access' : err.message.slice(0, 300);
      // 403 = אין הרשאה לנכס. מאפסים כדי לחפש שוב את הנכס בפעם הבאה (אולי הוסיפו הרשאה בינתיים)
      await env.DB.prepare('UPDATE clients SET gsc_error = ?, gsc_property = CASE WHEN ? THEN NULL ELSE gsc_property END, fetched_on = ? WHERE id = ?')
        .bind(code, err.status === 403 ? 1 : 0, today, client.id).run();
      console.error(`${client.name}: ${err.message}`);
    }
  }
  return { updated };
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
    env.DB.prepare('SELECT id, name, domain, gsc_property, gsc_error, backfilled FROM clients ORDER BY name'),
    env.DB.prepare('SELECT id, client_id, keyword FROM keywords ORDER BY id'),
  ]);
  return clients.map((c) => ({ ...c, keywords: keywords.filter((k) => k.client_id === c.id).map(({ id, keyword }) => ({ id, keyword })) }));
}

async function clientRankings(env, clientId) {
  const { results } = await env.DB.prepare(
    `SELECT k.id AS keyword_id, r.date, r.position, r.url, r.clicks, r.impressions
       FROM rankings r JOIN keywords k ON k.id = r.keyword_id
      WHERE k.client_id = ? ORDER BY r.date`
  ).bind(clientId).all();
  const keywords = {};
  let updated = null;
  for (const r of results) {
    (keywords[r.keyword_id] ||= []).push({ date: r.date, position: r.position, url: r.url, clicks: r.clicks || 0, impressions: r.impressions || 0 });
    if (!updated || r.date > updated) updated = r.date;
  }
  const { results: serpRows } = await env.DB.prepare(
    `SELECT k.id AS keyword_id, s.date, s.position, s.url
       FROM serp s JOIN keywords k ON k.id = s.keyword_id
      WHERE k.client_id = ? ORDER BY s.date`
  ).bind(clientId).all();
  const serp = {};
  let serpUpdated = null;
  for (const r of serpRows) {
    (serp[r.keyword_id] ||= []).push({ date: r.date, position: r.position, url: r.url });
    if (!serpUpdated || r.date > serpUpdated) serpUpdated = r.date;
  }
  return { updated, keywords, serp, serpUpdated };
}

// אחוז הקליקים המשוער לכל מיקום בגוגל (ממוצעים מקובלים בתעשייה), לחישוב "נראות"
const CTR_SQL = `CASE
  WHEN p IS NULL THEN 0 WHEN p <= 1 THEN 31.7 WHEN p <= 2 THEN 24.7 WHEN p <= 3 THEN 18.7
  WHEN p <= 4 THEN 13.6 WHEN p <= 5 THEN 9.5 WHEN p <= 6 THEN 6.2 WHEN p <= 7 THEN 4.2
  WHEN p <= 8 THEN 3.1 WHEN p <= 9 THEN 3.0 WHEN p <= 10 THEN 2.5 WHEN p <= 20 THEN 1.0 ELSE 0 END`;
const MAX_CTR = 31.7;
const OVERVIEW_DAYS = 31;

// סיכום יומי לכל לקוח: נראות, ביטויים בטופ 3/10, מיקום ממוצע, עלו/ירדו, קליקים
async function overview(env) {
  const since = shiftDate(todayIL(), -OVERVIEW_DAYS);
  const agg = (table) => env.DB.prepare(
    `SELECT client_id, date, COUNT(*) AS n, COUNT(p) AS ranked, AVG(p) AS avg,
            SUM(p <= 3) AS top3, SUM(p <= 10) AS top10, SUM(${CTR_SQL}) AS ctr
       FROM (SELECT k.client_id, t.date, ROUND(t.position) AS p FROM ${table} t JOIN keywords k ON k.id = t.keyword_id WHERE t.date >= ?)
      GROUP BY client_id, date ORDER BY date`
  ).bind(since);
  const [{ results: clients }, { results: kwCounts }, { results: serpDays }, { results: gscDays }, { results: clickDays }] = await env.DB.batch([
    env.DB.prepare('SELECT id, name, domain, gsc_error FROM clients ORDER BY name'),
    env.DB.prepare('SELECT client_id, COUNT(*) AS n FROM keywords GROUP BY client_id'),
    agg('serp'),
    agg('rankings'),
    env.DB.prepare(
      `SELECT k.client_id, r.date, SUM(r.clicks) AS clicks, SUM(r.impressions) AS impressions
         FROM rankings r JOIN keywords k ON k.id = r.keyword_id WHERE r.date >= ? GROUP BY 1, 2 ORDER BY 2`
    ).bind(shiftDate(todayIL(), -64)),
  ]);

  // שינוי יומי לכל ביטוי (מול הבדיקה הקודמת), לספירת עלו/ירדו
  const { results: moves } = await env.DB.prepare(
    `WITH last AS (
       SELECT k.client_id, s.keyword_id, s.position,
              LAG(s.position) OVER (PARTITION BY s.keyword_id ORDER BY s.date) AS prev,
              LAG(s.date) OVER (PARTITION BY s.keyword_id ORDER BY s.date) AS prev_date,
              ROW_NUMBER() OVER (PARTITION BY s.keyword_id ORDER BY s.date DESC) AS rn
         FROM serp s JOIN keywords k ON k.id = s.keyword_id WHERE s.date >= ?)
     SELECT client_id,
            SUM(CASE WHEN position IS NOT NULL AND (prev IS NULL OR position < prev) THEN 1 ELSE 0 END) AS up,
            SUM(CASE WHEN prev IS NOT NULL AND (position IS NULL OR position > prev) THEN 1 ELSE 0 END) AS down
       FROM last WHERE rn = 1 AND prev_date IS NOT NULL GROUP BY client_id`
  ).bind(shiftDate(todayIL(), -7)).all();

  const series = (rows, id) => rows.filter((r) => r.client_id === id).map((r) => ({
    date: r.date,
    visibility: r.n ? Math.round((r.ctr / (r.n * MAX_CTR)) * 1000) / 10 : 0,
    top3: r.top3 || 0,
    top10: r.top10 || 0,
    avg: r.avg === null ? null : Math.round(r.avg * 10) / 10,
  }));
  return clients.map((c) => {
    const serp = series(serpDays, c.id);
    const clicks = clickDays.filter((r) => r.client_id === c.id);
    const lastClick = clicks[clicks.length - 1]?.date;
    const sum = (from, to) => clicks.filter((r) => r.date > from && r.date <= to).reduce((a, r) => a + r.clicks, 0);
    const m = moves.find((r) => r.client_id === c.id);
    return {
      id: c.id, name: c.name, domain: c.domain, gscError: c.gsc_error,
      keywords: kwCounts.find((r) => r.client_id === c.id)?.n || 0,
      source: serp.length ? 'serp' : 'gsc',
      series: serp.length ? serp : series(gscDays, c.id),
      clicks30: lastClick ? sum(shiftDate(lastClick, -30), lastClick) : null,
      clicksPrev30: lastClick ? sum(shiftDate(lastClick, -60), shiftDate(lastClick, -30)) : null,
      up: m?.up || 0,
      down: m?.down || 0,
    };
  });
}

async function status(env) {
  const sa = serviceAccount(env);
  const today = todayIL();
  const serp = env.SERPER_API_KEY ? await env.DB.prepare(
    `SELECT (SELECT COUNT(*) FROM keywords) AS total,
            (SELECT COUNT(*) FROM serp WHERE date = ?1) AS done,
            (SELECT COUNT(*) FROM keywords WHERE fail_date = ?1 AND fail_count >= ?2
               AND id NOT IN (SELECT keyword_id FROM serp WHERE date = ?1)) AS failed`
  ).bind(today, MAX_FAILS_PER_DAY).first() : null;
  return {
    today,
    syncHour: SYNC_HOUR,
    maxDepth: MAX_DEPTH,
    serperConfigured: !!env.SERPER_API_KEY,
    serp,
    configured: !!sa,
    serviceAccountEmail: sa?.client_email || null,
    secretInvalid: !!env.GSC_SERVICE_ACCOUNT && !sa,
  };
}

async function api(request, env, path) {
  const method = request.method;
  let m;

  if (path === '/api/status' && method === 'GET') return json(await status(env));
  if (path === '/api/scan' && method === 'POST') return json(await runBatch(env, { force: true }));
  if (path === '/api/clients' && method === 'GET') return json(await listClients(env));
  if (path === '/api/overview' && method === 'GET') return json(await overview(env));
  if (path === '/api/reports' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT id, created_at, status, summary FROM reports ORDER BY id DESC LIMIT 14').all();
    return json(results);
  }

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
      // דומיין חדש = אולי נכס אחר ב-Search Console, אז מחפשים מחדש ומושכים שוב את כל ההיסטוריה
      await env.DB.prepare(
        `UPDATE clients SET name = ?1, domain = ?2,
           gsc_property = CASE WHEN domain = ?2 THEN gsc_property END,
           backfilled = CASE WHEN domain = ?2 THEN backfilled ELSE 0 END,
           gsc_error = CASE WHEN domain = ?2 THEN gsc_error END,
           fetched_on = CASE WHEN domain = ?2 THEN fetched_on END
         WHERE id = ?3`
      ).bind(name.trim(), cleanDomain(domain), id).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      await env.DB.batch([
        env.DB.prepare('DELETE FROM rankings WHERE keyword_id IN (SELECT id FROM keywords WHERE client_id = ?)').bind(id),
        env.DB.prepare('DELETE FROM serp WHERE keyword_id IN (SELECT id FROM keywords WHERE client_id = ?)').bind(id),
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
    const list = [...new Set((Array.isArray(keywords) ? keywords : []).map(normalizeKeyword).filter(Boolean))];
    if (!list.length) return bad('לא הוזנו ביטויים');
    if (list.length > 500) return bad('אפשר להוסיף עד 500 ביטויים בבת אחת');
    const clientId = Number(m[1]);
    await env.DB.batch([
      ...list.map((k) => env.DB.prepare('INSERT OR IGNORE INTO keywords (client_id, keyword) VALUES (?, ?)').bind(clientId, k)),
      // ביטויים חדשים צריכים היסטוריה, אז מושכים שוב את כל הטווח ללקוח
      env.DB.prepare('UPDATE clients SET backfilled = 0, fetched_on = NULL WHERE id = ?').bind(clientId),
    ]);
    return json({ ok: true }, 201);
  }

  if ((m = path.match(/^\/api\/keywords\/(\d+)$/)) && method === 'DELETE') {
    const id = Number(m[1]);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM rankings WHERE keyword_id = ?').bind(id),
      env.DB.prepare('DELETE FROM serp WHERE keyword_id = ?').bind(id),
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
    ctx.waitUntil(runBatch(env).then((r) => console.log('batch', JSON.stringify(r))));
  },
};
