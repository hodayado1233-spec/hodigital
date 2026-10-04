/**
 * HODIGITAL monthly SEO reports, Google Apps Script edition.
 *
 * Runs inside your own Google account: it sees every Search Console property and GA4
 * property you already have access to. No Google Cloud project, service account or key.
 * On the 1st of each month it pulls last month's data for every client below, saves a
 * draft report (HTML) and a data file (month-….json) per client to a Drive folder,
 * and emails you a summary with the files attached.
 *
 * Setup is in reports/README.md, section "הדרך הקלה: Google Apps Script".
 */

// ===== 1. Clients: one block per client =====
// gscSite: exactly as in the Search Console property picker
//          ("sc-domain:example.co.il" for a domain property, or "https://www.example.co.il/").
// ga4Property: digits only, from GA4 → Admin → Property details. Leave "" if none.
// leadEvents: optional. Event names that count as leads, and their label in the report.
//             Leave {} to count every key event.
// Not sure of the values? Run listMyProperties once and check the log.
var CLIENTS = [
  {
    name: "שם הלקוח",
    domain: "www.example.co.il",
    gscSite: "sc-domain:example.co.il",
    ga4Property: "",
    leadEvents: {}
  }
];

// ===== 2. Settings =====
var SETTINGS = {
  folderName: "HODIGITAL דוחות חודשיים",
  agencyName: "HODIGITAL",
  agencyContact: "הודיה ארנטרוי",
  // The report design comes from the repository, so design updates reach the script automatically.
  templateUrls: [
    "https://raw.githubusercontent.com/hodayado1233-spec/hodigital/main/reports/report-template.html",
    "https://raw.githubusercontent.com/hodayado1233-spec/hodigital/claude/seo-monthly-reports-platform-z5dav6/reports/report-template.html"
  ]
};

// Referrers that count as AI traffic. Same list as the studio. First match wins.
var AI_SOURCES = [
  ["ChatGPT", /chatgpt|chat\.openai|openai\.com/i],
  ["Perplexity", /perplexity/i],
  ["Gemini", /gemini\.google|bard\.google/i],
  ["Copilot", /copilot|edgeservices|bing\.com\/chat/i],
  ["Claude", /claude\.ai|anthropic/i],
  ["DeepSeek", /deepseek/i],
  ["Grok", /grok|x\.ai/i],
  ["Meta AI", /meta\.ai/i],
  ["You.com", /(^|\W)you\.com/i],
  ["Mistral", /mistral/i]
];

// ===== Run these from the editor =====

/** Run once: schedules runMonthly for the 1st of every month, 8–9 in the morning. */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "runMonthly") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("runMonthly").timeBased().onMonthDay(1).atHour(8).inTimezone("Asia/Jerusalem").create();
  Logger.log("מתוזמן: בכל 1 לחודש בין 8 ל-9 בבוקר. כדי לבדוק עכשיו, מריצים את runMonthly.");
}

/** Lists the Search Console sites and GA4 properties this account can see, to fill CLIENTS. */
function listMyProperties() {
  var sites = api_("get", "https://searchconsole.googleapis.com/webmasters/v3/sites").siteEntry || [];
  Logger.log("=== Search Console (gscSite) ===");
  sites.forEach(function (s) { Logger.log(s.siteUrl + "   (" + s.permissionLevel + ")"); });
  try {
    var acc = api_("get", "https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200").accountSummaries || [];
    Logger.log("=== GA4 (ga4Property) ===");
    acc.forEach(function (a) {
      (a.propertySummaries || []).forEach(function (p) {
        Logger.log(p.property.replace("properties/", "") + "   " + p.displayName + "   [" + a.displayName + "]");
      });
    });
  } catch (e) {
    Logger.log("רשימת נכסי GA4 לא זמינה (" + e.message + "). את מספר הנכס מוצאים ב-GA4 ← אדמין ← פרטי הנכס.");
  }
}

/** The monthly run. Can also be run by hand at any time; it always takes the previous full month. */
function runMonthly() {
  var month = lastFullMonth_(), prev = prevMonth_(month);
  var fresh = new Date() < new Date(nextMonth_(month) + "-04T00:00:00");
  var folder = monthFolder_(month);
  var template = loadTemplate_();
  var lines = [], attachments = [], failures = [];

  CLIENTS.forEach(function (c) {
    if (!c.domain || c.domain === "www.example.co.il") return;
    var out = { type: "hodigital-month", version: 1, month: month, fetchedAt: new Date().toISOString(), client: { name: c.name || c.domain, domain: c.domain } };
    var problems = [];
    if (c.gscSite) {
      try { out.gsc = fetchGsc_(c.gscSite, month, prev, fresh); } catch (e) { problems.push("Search Console: " + e.message); }
    }
    if (c.ga4Property) {
      try { var ga = fetchGa_(String(c.ga4Property).replace(/^properties\//, ""), c.leadEvents, month, prev); out.ga = ga.ga; out.leads = ga.leads; }
      catch (e) { problems.push("GA4: " + e.message); }
    }
    if (problems.length) failures.push((c.name || c.domain) + ": " + problems.join(" | "));
    if (!out.gsc && !out.ga) return;

    var slug = bare_(c.domain).replace(/[^a-z0-9]+/g, "-");
    var jsonBlob = Utilities.newBlob(JSON.stringify(out, null, 1), "application/json", "month-" + slug + "-" + month + ".json");
    folder.createFile(jsonBlob);
    attachments.push(jsonBlob);
    if (template) {
      var htmlBlob = Utilities.newBlob(buildReportHtml_(template, out), "text/html", "draft-report-" + slug + "-" + month + ".html");
      folder.createFile(htmlBlob);
      attachments.push(htmlBlob);
    }
    lines.push(summaryLine_(out));
  });

  var body = "דוחות " + monthLabel_(month) + "\n\n" + (lines.length ? lines.join("\n") : "לא נמשכו נתונים. בדקו את רשימת CLIENTS בראש הסקריפט.") +
    (failures.length ? "\n\nלא הצליח:\n" + failures.join("\n") : "") +
    (fresh ? "\n\nנתוני Search Console של הימים האחרונים בחודש עדיין זמניים ועשויים להשתנות מעט עד ה-4 בחודש." : "") +
    (template ? "" : "\n\nלא הצלחתי לטעון את עיצוב הדוח, ולכן נשלחו רק קובצי הנתונים. אפשר לגרור אותם לסטודיו.") +
    "\n\nהקבצים שמורים גם בדרייב, בתיקייה \"" + SETTINGS.folderName + "\"." +
    "\n\nמה נשאר: בדיקת מיקומים על המחשב, ואז לגרור לסטודיו את קובצי month-….json יחד עם rankings-….json, ולכתוב סיכום ויומן אופטימיזציה לפני השליחה ללקוח.";
  MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), subject: "דוחות SEO · " + monthLabel_(month), body: body, attachments: attachments });
  Logger.log(body);
}

// ===== Search Console =====
function fetchGsc_(site, month, prev, fresh) {
  var url = "https://searchconsole.googleapis.com/webmasters/v3/sites/" + encodeURIComponent(site) + "/searchAnalytics/query";
  function q(m, extra) {
    var body = { startDate: m + "-01", endDate: monthEnd_(m), type: "web", dataState: fresh ? "all" : "final" };
    for (var k in extra) body[k] = extra[k];
    return api_("post", url, body, gscHint_);
  }
  var tot = q(month, {}), totPrev = q(prev, {});
  var days = q(month, { dimensions: ["date"], rowLimit: 100 });
  var queries = q(month, { dimensions: ["query"], rowLimit: 50 });
  var pages = q(month, { dimensions: ["page"], rowLimit: 50 });
  var t = (tot.rows || [])[0] || {}, tp = (totPrev.rows || [])[0];
  function row(r) { return { k: r.keys[0], c: r.clicks, i: r.impressions, ctr: r.ctr, p: r.position }; }
  return {
    clicks: t.clicks || 0, impressions: t.impressions || 0, ctr: t.ctr == null ? null : t.ctr, position: t.position == null ? null : t.position,
    daily: (days.rows || []).map(function (r) { return { d: r.keys[0], c: r.clicks, i: r.impressions }; }).sort(function (a, b) { return a.d < b.d ? -1 : 1; }),
    queries: (queries.rows || []).map(row),
    pages: (pages.rows || []).map(row),
    provisional: fresh || undefined,
    prev: tp ? { clicks: tp.clicks, impressions: tp.impressions, ctr: tp.ctr, position: tp.position } : null
  };
}
function gscHint_(code) {
  return code === 403 ? "לחשבון הזה אין גישה לנכס, או שכתובת הנכס (gscSite) לא כתובה בדיוק כמו ב-Search Console. מריצים את listMyProperties כדי לראות את הכתובות הנכונות." : "";
}

// ===== GA4 =====
function fetchGa_(id, leadEvents, month, prev) {
  var url = "https://analyticsdata.googleapis.com/v1beta/properties/" + id + ":runReport";
  var names = leadEvents && Object.keys(leadEvents).length ? Object.keys(leadEvents) : null;
  function range(m) { return [{ startDate: m + "-01", endDate: monthEnd_(m) }]; }
  function traffic(m) { return api_("post", url, { dateRanges: range(m), dimensions: [{ name: "sessionSourceMedium" }], metrics: [{ name: "sessions" }], limit: 10000 }, gaHint_); }
  function leads(m) {
    var body = {
      dateRanges: range(m),
      dimensions: [{ name: "eventName" }, { name: "sessionDefaultChannelGroup" }, { name: "sessionSource" }],
      metrics: [{ name: names ? "eventCount" : "keyEvents" }],
      limit: 10000
    };
    if (names) body.dimensionFilter = { filter: { fieldName: "eventName", inListFilter: { values: names } } };
    return api_("post", url, body, gaHint_);
  }
  var t = summarizeTraffic_(traffic(month)), tp = summarizeTraffic_(traffic(prev));
  var l = summarizeLeads_(leads(month), names ? leadEvents : null), lp = summarizeLeads_(leads(prev), names ? leadEvents : null);
  t.prev = { sessions: tp.sessions, organic: tp.organic, ai: tp.ai };
  l.source = names ? "אירועי GA4: " + names.map(function (n) { return leadEvents[n]; }).join(", ") : "אירועי מפתח ב-GA4";
  l.prev = { channels: lp.channels };
  return { ga: t, leads: l };
}
function summarizeTraffic_(res) {
  var sessions = 0, organic = 0, ai = {};
  (res.rows || []).forEach(function (r) {
    var src = r.dimensionValues[0].value, n = Number(r.metricValues[0].value) || 0;
    sessions += n;
    if (/\/\s*organic$/i.test(src)) organic += n;
    var name = aiName_(src);
    if (name) ai[name] = (ai[name] || 0) + n;
  });
  var list = Object.keys(ai).map(function (k) { return { name: k, sessions: ai[k] }; }).sort(function (a, b) { return b.sessions - a.sessions; });
  return { sessions: sessions, organic: organic, ai: list.reduce(function (s, x) { return s + x.sessions; }, 0), aiSources: list };
}
function summarizeLeads_(res, labels) {
  var by = {}, organic = 0;
  (res.rows || []).forEach(function (r) {
    var ev = r.dimensionValues[0].value, channel = r.dimensionValues[1].value, source = r.dimensionValues[2].value;
    var n = Math.round(Number(r.metricValues[0].value) || 0);
    if (!n) return;
    var label = (labels && labels[ev]) || ev;
    by[label] = (by[label] || 0) + n;
    if (/organic search/i.test(channel) || aiName_(source)) organic += n;
  });
  return { channels: Object.keys(by).map(function (k) { return { name: k, count: by[k] }; }).sort(function (a, b) { return b.count - a.count; }), organic: organic };
}
function gaHint_(code) {
  return code === 403 ? "לחשבון הזה אין גישה לנכס GA4, או שמספר הנכס (ga4Property) שגוי. צריך מספר בלבד, לא G-XXXX." : "";
}

// ===== Report draft (same logic as tools/build-report.mjs) =====
function buildReportHtml_(template, b) {
  var gsc = JSON.parse(JSON.stringify(b.gsc || {})), ga = JSON.parse(JSON.stringify(b.ga || {})), leads = b.leads || {};
  var gscPrev = gsc.prev || null, gaPrev = ga.prev || null;
  delete gsc.prev; delete ga.prev;
  var data = {
    schema: 1, month: b.month, generatedAt: Utilities.formatDate(new Date(), "Asia/Jerusalem", "d.M.yyyy"),
    client: b.client, agency: { name: SETTINGS.agencyName, contact: SETTINGS.agencyContact },
    summary: "", highlights: [], nextSteps: [], optimizations: [], rankings: [], rankingsNote: "",
    gsc: gsc, gscPrev: gscPrev, ga: ga, gaPrev: gaPrev,
    leads: { total: sumCount_(leads.channels), organic: leads.organic, channels: leads.channels || [], source: leads.source || "" },
    leadsPrev: leads.prev ? { total: sumCount_(leads.prev.channels) } : null,
    history: [
      { month: prevMonth_(b.month), clicks: gscPrev && gscPrev.clicks, ai: gaPrev && gaPrev.ai, leads: leads.prev ? sumCount_(leads.prev.channels) : null },
      { month: b.month, clicks: gsc.clicks, ai: ga.ai, leads: sumCount_(leads.channels) }
    ]
  };
  var json = JSON.stringify(data).replace(/</g, "\\u003c");
  return template.replace(/(<script id="report-data" type="application\/json">)[\s\S]*?(<\/script>)/, function (_, a, c) { return a + json + c; });
}
function loadTemplate_() {
  for (var i = 0; i < SETTINGS.templateUrls.length; i++) {
    try {
      var r = UrlFetchApp.fetch(SETTINGS.templateUrls[i], { muteHttpExceptions: true });
      if (r.getResponseCode() === 200 && r.getContentText().indexOf('id="report-data"') > -1) return r.getContentText();
    } catch (e) {}
  }
  return null;
}

// ===== helpers =====
function api_(method, url, body, hint) {
  var opts = { method: method, muteHttpExceptions: true, headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() } };
  if (body) { opts.contentType = "application/json"; opts.payload = JSON.stringify(body); }
  var res = UrlFetchApp.fetch(url, opts), code = res.getResponseCode(), j = {};
  try { j = JSON.parse(res.getContentText()); } catch (e) {}
  if (code >= 200 && code < 300) return j;
  var msg = (j.error && j.error.message) || ("שגיאה " + code);
  if (/has not been used|is disabled/i.test(msg)) {
    var link = (msg.match(/https:\/\/\S+/) || [""])[0].replace(/[.,]$/, "");
    throw new Error("צריך להפעיל את ה-API פעם אחת. פותחים את הקישור, לוחצים Enable ומריצים שוב: " + link);
  }
  throw new Error((hint && hint(code)) || msg);
}
function aiName_(src) { for (var i = 0; i < AI_SOURCES.length; i++) if (AI_SOURCES[i][1].test(src)) return AI_SOURCES[i][0]; return null; }
function summaryLine_(b) {
  var g = b.gsc || {}, ga = b.ga || {}, l = b.leads || {};
  function ch(cur, prv) { if (cur == null || prv == null || prv === 0) return ""; var d = Math.round((cur - prv) / prv * 100); return " (" + (d >= 0 ? "+" : "") + d + "%)"; }
  var leadsNow = sumCount_(l.channels), leadsPrev = l.prev ? sumCount_(l.prev.channels) : null;
  return "• " + b.client.name + ": " +
    (b.gsc ? fmt_(g.clicks) + " קליקים" + ch(g.clicks, g.prev && g.prev.clicks) : "בלי Search Console") + ", " +
    (b.ga ? fmt_(ga.ai) + " כניסות AI" + ch(ga.ai, ga.prev && ga.prev.ai) + ", " + fmt_(leadsNow) + " לידים" + ch(leadsNow, leadsPrev) : "בלי GA4");
}
function monthFolder_(month) {
  var it = DriveApp.getFoldersByName(SETTINGS.folderName);
  var root = it.hasNext() ? it.next() : DriveApp.createFolder(SETTINGS.folderName);
  var sub = root.getFoldersByName(month);
  return sub.hasNext() ? sub.next() : root.createFolder(month);
}
function sumCount_(a) { return (a || []).reduce(function (s, x) { return s + (x.count || 0); }, 0); }
function fmt_(n) { return n == null ? "—" : Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function bare_(d) { return String(d).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, ""); }
function ym_(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2); }
function lastFullMonth_() { var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return ym_(d); }
function prevMonth_(m) { var p = m.split("-"); return ym_(new Date(+p[0], +p[1] - 2, 1)); }
function nextMonth_(m) { var p = m.split("-"); return ym_(new Date(+p[0], +p[1], 1)); }
function monthEnd_(m) { var p = m.split("-"); return m + "-" + ("0" + new Date(+p[0], +p[1], 0).getDate()).slice(-2); }
function monthLabel_(m) { var n = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"]; var p = m.split("-"); return n[+p[1] - 1] + " " + p[0]; }
