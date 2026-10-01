#!/usr/bin/env node
// Pulls one month of Search Console + GA4 data for every client in clients.json through the
// free Google APIs, and writes month-<domain>-<YYYY-MM>.json files for the report studio.
//
// Usage:
//   node fetch-google.mjs --key service-account.json            (last full month, all clients)
//   node fetch-google.mjs --key service-account.json --month 2026-09 --client example.co.il
//
// One-time setup is described in ../README.md ("חיבור אוטומטי ל-Google").
// No npm packages needed: plain Node 18+.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createSign } from "node:crypto";

// Test hooks: point the script at a mock server. Not needed in normal use.
const TOKEN_URL = process.env.HD_TOKEN_URL;
const GSC_BASE = process.env.HD_GSC_BASE || "https://searchconsole.googleapis.com/webmasters/v3";
const GA_BASE = process.env.HD_GA_BASE || "https://analyticsdata.googleapis.com/v1beta";
const SCOPES = "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly";

// Same list as studio.js: referrers that count as AI traffic. First match wins.
const AI_SOURCES = [
  ["ChatGPT", /chatgpt|chat\.openai|openai\.com/i],
  ["Perplexity", /perplexity/i],
  ["Gemini", /gemini\.google|bard\.google/i],
  ["Copilot", /copilot|edgeservices|bing\.com\/chat/i],
  ["Claude", /claude\.ai|anthropic/i],
  ["DeepSeek", /deepseek/i],
  ["Grok", /grok|x\.ai/i],
  ["Meta AI", /meta\.ai/i],
  ["You.com", /(^|\W)you\.com/i],
  ["Mistral", /mistral/i],
];
const aiName = (src) => (AI_SOURCES.find(([, re]) => re.test(src)) || [])[0] || null;

const args = parseArgs(process.argv.slice(2));
const keyPath = args.key || "service-account.json";
const configPath = args.config || "clients.json";
if (!existsSync(keyPath)) fail(`לא נמצא קובץ המפתח ${keyPath}. ההוראות להורדה שלו ב-README, בפרק "חיבור אוטומטי ל-Google".`);
if (!existsSync(configPath)) fail(`לא נמצא ${configPath}. אפשר להעתיק את clients.example.json ל-clients.json ולמלא את הלקוחות.`);

const key = JSON.parse(readFileSync(keyPath, "utf8"));
let clients = JSON.parse(readFileSync(configPath, "utf8"));
if (args.client) clients = clients.filter((c) => bare(c.domain).includes(bare(args.client)));
if (!clients.length) fail("אין לקוחות שמתאימים לבחירה.");

const month = args.month || lastFullMonth();
const prev = prevMonth(month);
const token = await getToken(key);
console.log(`מושך נתונים ל${month} (והשוואה ל-${prev}) עבור ${clients.length} לקוחות. חשבון השירות: ${key.client_email}\n`);

let failed = 0;
for (const c of clients) {
  const out = { type: "hodigital-month", version: 1, month, fetchedAt: new Date().toISOString(), client: { name: c.name || c.domain, domain: c.domain } };
  const problems = [];
  if (c.gscSite) {
    try { Object.assign(out, await fetchGsc(c.gscSite)); } catch (e) { problems.push("Search Console: " + e.message); }
  }
  if (c.ga4Property) {
    try { Object.assign(out, await fetchGa(String(c.ga4Property).replace(/^properties\//, ""), c.leadEvents)); } catch (e) { problems.push("GA4: " + e.message); }
  }
  const file = `month-${bare(c.domain).replace(/[^a-z0-9]+/g, "-")}-${month}.json`;
  if (out.gsc || out.ga) writeFileSync(file, JSON.stringify(out, null, 1));
  const g = out.gsc || {}, ga = out.ga || {};
  console.log(`${c.name || c.domain}`);
  if (out.gsc) console.log(`  Search Console: ${fmt(g.clicks)} קליקים, ${fmt(g.impressions)} חשיפות`);
  if (out.ga) console.log(`  GA4: ${fmt(ga.sessions)} כניסות, ${fmt(ga.ai)} מ-AI, ${fmt(sum(out.leads?.channels || [], "count"))} לידים`);
  problems.forEach((p) => console.log("  ✗ " + p));
  if (out.gsc || out.ga) console.log(`  נשמר: ${file}`);
  if (problems.length) failed++;
  console.log("");
}
console.log("גוררים את קובצי ה-month-….json לסטודיו, לאזור \"ייבוא אוטומטי\".");
if (failed) process.exitCode = 1;

// ---------- Search Console ----------
async function fetchGsc(site) {
  const q = (body) => post(`${GSC_BASE}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { type: "web", dataState: "final", ...body }, gscHint);
  const range = (m) => ({ startDate: `${m}-01`, endDate: monthEnd(m) });
  const [tot, totPrev, days, queries, pages] = await Promise.all([
    q({ ...range(month) }), q({ ...range(prev) }),
    q({ ...range(month), dimensions: ["date"], rowLimit: 100 }),
    q({ ...range(month), dimensions: ["query"], rowLimit: 50 }),
    q({ ...range(month), dimensions: ["page"], rowLimit: 50 }),
  ]);
  const t = (tot.rows || [])[0] || {}, tp = (totPrev.rows || [])[0];
  const row = (r) => ({ k: r.keys[0], c: r.clicks, i: r.impressions, ctr: r.ctr, p: r.position });
  return {
    gsc: {
      clicks: t.clicks ?? 0, impressions: t.impressions ?? 0, ctr: t.ctr ?? null, position: t.position ?? null,
      daily: (days.rows || []).map((r) => ({ d: r.keys[0], c: r.clicks, i: r.impressions })).sort((a, b) => a.d.localeCompare(b.d)),
      queries: (queries.rows || []).map(row),
      pages: (pages.rows || []).map(row),
      prev: tp ? { clicks: tp.clicks, impressions: tp.impressions, ctr: tp.ctr, position: tp.position } : null,
    },
  };
}
function gscHint(status) {
  if (status === 403) return `לחשבון השירות אין גישה לנכס. ב-Search Console: הגדרות ← משתמשים והרשאות ← הוספת משתמש ← ${key.client_email} (הרשאה מוגבלת מספיקה). ודאו גם שכתובת הנכס ב-clients.json זהה בדיוק (למשל sc-domain:example.co.il).`;
  return "";
}

// ---------- GA4 ----------
async function fetchGa(propertyId, leadEvents) {
  const report = (body) => post(`${GA_BASE}/properties/${propertyId}:runReport`, body, gaHint);
  const range = (m) => [{ startDate: `${m}-01`, endDate: monthEnd(m) }];
  const traffic = (m) => report({ dateRanges: range(m), dimensions: [{ name: "sessionSourceMedium" }], metrics: [{ name: "sessions" }], limit: 10000 });
  // Leads: the events listed in clients.json, or every key event when none are listed.
  const names = leadEvents ? Object.keys(leadEvents) : null;
  const leads = (m) => report({
    dateRanges: range(m),
    dimensions: [{ name: "eventName" }, { name: "sessionDefaultChannelGroup" }, { name: "sessionSource" }],
    metrics: [{ name: names ? "eventCount" : "keyEvents" }],
    ...(names ? { dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: names } } } } : {}),
    limit: 10000,
  });
  const [t, tp, l, lp] = await Promise.all([traffic(month), traffic(prev), leads(month), leads(prev)]);
  const ga = summarizeTraffic(t), gaPrev = summarizeTraffic(tp);
  const ld = summarizeLeads(l, leadEvents), ldPrev = summarizeLeads(lp, leadEvents);
  return {
    ga: { ...ga, prev: { sessions: gaPrev.sessions, organic: gaPrev.organic, ai: gaPrev.ai } },
    leads: { ...ld, source: names ? "אירועי GA4: " + Object.values(leadEvents).join(", ") : "אירועי מפתח ב-GA4", prev: { channels: ldPrev.channels } },
  };
}
function summarizeTraffic(res) {
  let sessions = 0, organic = 0;
  const ai = {};
  for (const r of res.rows || []) {
    const src = r.dimensionValues[0].value, n = Number(r.metricValues[0].value) || 0;
    sessions += n;
    if (/\/\s*organic$/i.test(src)) organic += n;
    const name = aiName(src);
    if (name) ai[name] = (ai[name] || 0) + n;
  }
  const aiSources = Object.entries(ai).map(([name, s]) => ({ name, sessions: s })).sort((a, b) => b.sessions - a.sessions);
  return { sessions, organic, ai: sum(aiSources, "sessions"), aiSources };
}
function summarizeLeads(res, labels) {
  const by = {};
  let organic = 0;
  for (const r of res.rows || []) {
    const [ev, channel, source] = r.dimensionValues.map((d) => d.value);
    const n = Math.round(Number(r.metricValues[0].value) || 0);
    if (!n) continue;
    const label = (labels && labels[ev]) || ev;
    by[label] = (by[label] || 0) + n;
    if (/organic search/i.test(channel) || aiName(source)) organic += n;
  }
  return { channels: Object.entries(by).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count), organic };
}
function gaHint(status) {
  if (status === 403) return `לחשבון השירות אין גישה לנכס. ב-GA4: אדמין ← ניהול גישה לנכס ← + ← ${key.client_email} בתפקיד "צופה". ודאו גם שמספר הנכס ב-clients.json נכון (מספר בלבד, לא G-XXXX).`;
  return "";
}

// ---------- auth & http ----------
async function getToken(k) {
  const now = Math.floor(Date.now() / 1000);
  const aud = TOKEN_URL || k.token_uri || "https://oauth2.googleapis.com/token";
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: k.client_email, scope: SCOPES, aud, iat: now, exp: now + 3600 })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(k.private_key).toString("base64url");
  const res = await fetch(aud, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.access_token) fail(`ההתחברות ל-Google נכשלה (${res.status}): ${j.error_description || j.error || "בדקו שקובץ המפתח תקין"}`);
  return j.access_token;
}
async function post(url, body, hint) {
  const res = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = j.error?.message || res.statusText;
    if (res.status === 403 && /has not been used|is disabled/i.test(msg)) throw new Error(`ה-API לא מופעל בפרויקט. ${msg.match(/https:\/\/\S+/)?.[0] || ""}`);
    throw new Error(hint(res.status) || `${res.status}: ${msg}`);
  }
  return j;
}

// ---------- helpers ----------
function parseArgs(a) {
  const o = {};
  for (let i = 0; i < a.length; i++) if (a[i].startsWith("--")) o[a[i].slice(2)] = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : true;
  return o;
}
function lastFullMonth() { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return ym(d); }
function prevMonth(m) { const [y, mo] = m.split("-").map(Number); return ym(new Date(y, mo - 2, 1)); }
function monthEnd(m) { const [y, mo] = m.split("-").map(Number); return `${m}-${String(new Date(y, mo, 0).getDate()).padStart(2, "0")}`; }
function ym(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function bare(d) { return String(d).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, ""); }
function sum(a, k) { return a.reduce((s, x) => s + (x[k] || 0), 0); }
function fmt(n) { return n == null ? "—" : new Intl.NumberFormat("he-IL").format(Math.round(n)); }
function fail(msg) { console.error("✗ " + msg); process.exit(1); }
