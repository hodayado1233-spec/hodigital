#!/usr/bin/env node
// Checks Google rankings for a list of keywords in a fresh incognito browser context,
// the same way you would by hand: google.co.il, Hebrew interface, no login, no history.
//
// Usage:
//   node rank-check.mjs --domain www.example.co.il --keywords keywords.txt
// Options:
//   --depth 30        how many organic results to scan (3 pages of 10)
//   --headless        run without a visible window (Google shows CAPTCHAs more often)
//   --out results     output file prefix (default: rankings-<domain>-<date>)
//
// Output: <prefix>.json (upload to the studio, step 3) and <prefix>.csv.

import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { chromium } from "playwright";

const args = parseArgs(process.argv.slice(2));
if (!args.domain || !args.keywords) {
  console.log("שימוש: node rank-check.mjs --domain www.example.co.il --keywords keywords.txt [--depth 30] [--headless]");
  process.exit(1);
}
const domain = args.domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase();
const depth = Number(args.depth || 30);
const keywords = readFileSync(args.keywords, "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
const today = new Date().toISOString().slice(0, 10);
const prefix = args.out || `rankings-${domain}-${today}`;
const AI_OVERVIEW_LABELS = ["סקירה כללית של AI", "AI Overview", "סקירה כללית שנוצרה על ידי AI"];

const browser = await chromium.launch({ headless: !!args.headless });
const results = [];

try {
  for (const [n, keyword] of keywords.entries()) {
    // A new context per keyword = a new incognito window: no cookies, no personalization.
    const context = await browser.newContext({ locale: "he-IL", timezoneId: "Asia/Jerusalem", viewport: { width: 1366, height: 900 } });
    const page = await context.newPage();
    const row = { keyword, position: null, url: "", aiOverview: { shown: false, cited: false }, checkedAt: new Date().toISOString() };
    const seen = new Set();
    let rank = 0;

    try {
      for (let start = 0; start < depth && row.position == null; start += 10) {
        const q = new URLSearchParams({ q: keyword, hl: "iw", gl: "il", pws: "0", start: String(start) });
        await page.goto(`https://www.google.co.il/search?${q}`, { waitUntil: "domcontentloaded" });
        await handleConsentAndCaptcha(page);

        if (start === 0) Object.assign(row.aiOverview, await readAiOverview(page));

        const links = await page.$$eval("#search a:has(h3), #rso a:has(h3)", (as) => as.map((a) => a.href));
        const organic = links.filter((h) => /^https?:/.test(h) && !/google\.[a-z.]+\/(search|url|aclk)/.test(h));
        if (!organic.length) break;
        for (const href of organic) {
          const key = href.split("#")[0];
          if (seen.has(key)) continue;
          seen.add(key);
          rank++;
          const host = new URL(href).hostname.replace(/^www\./, "").toLowerCase();
          if (host === domain || host.endsWith("." + domain)) { row.position = rank; row.url = href; break; }
          if (rank >= depth) break;
        }
        if (row.position == null) await sleep(rand(3000, 6000));
      }
    } catch (e) {
      row.error = String(e.message || e);
    }

    results.push(row);
    console.log(`${n + 1}/${keywords.length}  ${keyword}  →  ${row.position ?? "מחוץ ל-" + depth}${row.aiOverview.shown ? "  (סקירת AI" + (row.aiOverview.cited ? ", האתר צוטט" : "") + ")" : ""}${row.error ? "  שגיאה: " + row.error : ""}`);
    await context.close();
    if (n < keywords.length - 1) await sleep(rand(8000, 18000)); // human pace, fewer CAPTCHAs
  }
} finally {
  await browser.close();
  writeFileSync(`${prefix}.json`, JSON.stringify(results, null, 2));
  writeFileSync(`${prefix}.csv`, "﻿keyword,position,url,ai_overview,ai_cited\n" +
    results.map((r) => [r.keyword, r.position ?? "", r.url, r.aiOverview.shown ? 1 : 0, r.aiOverview.cited ? 1 : 0].map(csv).join(",")).join("\n") + "\n");
  console.log(`\nנשמר: ${prefix}.json  (להעלות לסטודיו, שלב 3)  ו-${prefix}.csv`);
}

async function handleConsentAndCaptcha(page) {
  // Cookie consent (shown in some regions).
  const consent = page.locator('button:has-text("אישור הכול"), button:has-text("Accept all"), button:has-text("קבל הכל")');
  if (await consent.first().isVisible().catch(() => false)) { await consent.first().click(); await page.waitForLoadState("domcontentloaded"); }
  // Google "unusual traffic" page: wait for the person to solve it in the visible window.
  if (/\/sorry\//.test(page.url()) || (await page.locator("form#captcha-form, #recaptcha").count())) {
    if (args.headless) throw new Error("גוגל ביקש CAPTCHA. הריצי שוב בלי --headless כדי לפתור אותו בחלון.");
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    await rl.question("גוגל ביקש אימות (CAPTCHA). פתרי אותו בחלון הדפדפן ואז הקישי Enter כאן… ");
    rl.close();
    await page.waitForLoadState("domcontentloaded");
  }
}

// Best effort: Google changes this markup often. Looks for the AI Overview heading,
// then checks whether any link inside that block points at the client's domain.
async function readAiOverview(page) {
  return page.evaluate(({ labels, domain }) => {
    // The tightest element whose text starts with the label is the heading itself.
    const head = Array.from(document.querySelectorAll("h1,h2,h3,div,span,strong"))
      .filter((el) => labels.some((l) => (el.textContent || "").trim().startsWith(l)))
      .sort((a, b) => a.textContent.length - b.textContent.length)[0];
    if (!head) return { shown: false, cited: false };
    let box = head;
    for (let i = 0; i < 8 && box.parentElement; i++) {
      box = box.parentElement;
      if (box.querySelectorAll("a[href^='http']").length >= 3) break;
    }
    const cited = Array.from(box.querySelectorAll("a[href^='http']")).some((a) => {
      try { const h = new URL(a.href).hostname.replace(/^www\./, ""); return h === domain || h.endsWith("." + domain); } catch { return false; }
    });
    return { shown: true, cited };
  }, { labels: AI_OVERVIEW_LABELS, domain });
}

function parseArgs(a) {
  const o = {};
  for (let i = 0; i < a.length; i++) {
    if (!a[i].startsWith("--")) continue;
    const k = a[i].slice(2), v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : true;
    o[k] = v;
  }
  return o;
}
function csv(v) { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function rand(a, b) { return a + Math.floor(Math.random() * (b - a)); }
