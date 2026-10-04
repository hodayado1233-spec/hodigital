#!/usr/bin/env node
// Turns month-<domain>-<YYYY-MM>.json files (from fetch-google.mjs) into draft client reports,
// using the same template as the studio. A matching rankings-<domain>-<date>.json in the same
// folder is added automatically. Summary and the optimization log stay empty: those are
// written in the studio before the report goes to the client.
//
// Usage: node build-report.mjs [folder]      (default: current folder)

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = process.argv[2] || ".";
const template = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "report-template.html"), "utf8");
const files = readdirSync(dir);
const bundles = files.filter((f) => /^month-.+\.json$/.test(f));
if (!bundles.length) { console.error("✗ לא נמצאו קובצי month-….json בתיקייה " + dir); process.exit(1); }

const sumCount = (a) => (a || []).reduce((s, x) => s + (x.count || 0), 0);
const bare = (d) => String(d).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");

for (const f of bundles) {
  const b = JSON.parse(readFileSync(join(dir, f), "utf8"));
  if (b.type !== "hodigital-month") continue;
  const domain = bare(b.client.domain);
  const rankFile = files.filter((x) => x.startsWith(`rankings-${domain}-`) && x.endsWith(".json")).sort().pop();
  const rankings = rankFile ? JSON.parse(readFileSync(join(dir, rankFile), "utf8")) : [];
  const { prev: gscPrev, ...gsc } = b.gsc || {};
  const { prev: gaPrev, ...ga } = b.ga || {};
  const leads = b.leads || {};
  const pm = prevMonthOf(b.month);

  const data = {
    schema: 1, month: b.month, generatedAt: new Date().toLocaleDateString("he-IL"),
    client: b.client, agency: { name: "HODIGITAL", contact: "הודיה ארנטרוי" },
    summary: "", highlights: [], nextSteps: [], optimizations: [],
    gsc, gscPrev: gscPrev || null,
    ga, gaPrev: gaPrev || null,
    leads: { total: sumCount(leads.channels), organic: leads.organic, channels: leads.channels || [], source: leads.source || "" },
    leadsPrev: leads.prev ? { total: sumCount(leads.prev.channels) } : null,
    rankings: rankings.map((r) => ({ keyword: r.keyword, position: r.position ?? null, url: r.url || "", aiOverview: r.aiOverview || null })),
    rankingsNote: rankFile ? `נבדק בדפדפן נסתר, google.co.il, ${new Date(rankings[0]?.checkedAt || Date.now()).toLocaleDateString("he-IL")}` : "",
    history: [
      { month: pm, clicks: gscPrev?.clicks, ai: gaPrev?.ai, leads: leads.prev ? sumCount(leads.prev.channels) : null },
      { month: b.month, clicks: gsc.clicks, ai: ga.ai, leads: sumCount(leads.channels) },
    ],
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  const html = template.replace(/(<script id="report-data" type="application\/json">)[\s\S]*?(<\/script>)/, (_, a, c) => a + json + c);
  const out = join(dir, `draft-report-${domain.replace(/[^a-z0-9]+/g, "-")}-${b.month}.html`);
  writeFileSync(out, html);
  console.log(`${b.client.name}: ${out}${rankFile ? "" : "  (בלי מיקומים)"}`);
}

function prevMonthOf(m) { const [y, mo] = m.split("-").map(Number); const d = new Date(y, mo - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
