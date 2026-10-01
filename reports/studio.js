/* HODIGITAL report studio.
 * Everything runs in the browser: data lives in localStorage, reports are rendered by
 * report-template.html and downloaded as a single self-contained HTML file. */
(function () {
  "use strict";

  var STORE_KEY = "hodigital-reports-v1";
  var CATEGORIES = ["תוכן", "טכני", "AI ו-GEO", "מקומי", "קישורים", "המרות", "כללי"];
  var DEFAULT_CHANNELS = ["וואטסאפ", "טופס יצירת קשר", "שיחת טלפון"];
  // Referrers that count as AI traffic in GA4. Order matters: first match wins.
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
    ["Mistral", /mistral/i],
  ];
  var HEB_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

  // ---------- storage ----------
  var db = load();
  var ui = { client: null, month: null };
  try { ui = JSON.parse(localStorage.getItem(STORE_KEY + "-ui")) || ui; } catch (e) {}

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { clients: {} }; } catch (e) { return { clients: {} }; }
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      localStorage.setItem(STORE_KEY + "-ui", JSON.stringify(ui));
    } catch (e) { toast("השמירה בדפדפן נכשלה. הורידי גיבוי כדי לא לאבד נתונים."); }
  }

  // ---------- helpers ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function slugify(s) { return String(s).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[^a-z0-9֐-׿]+/g, "-").replace(/^-|-$/g, "") || "client-" + Date.now(); }
  function monthLabel(m) { var p = m.split("-"); return HEB_MONTHS[+p[1] - 1] + " " + p[0]; }
  function prevMonth(m) { var p = m.split("-").map(Number); var d = new Date(p[0], p[1] - 2, 1); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }
  function lastFullMonth() { var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }
  function fmt(n) { return n == null || isNaN(n) ? "—" : new Intl.NumberFormat("he-IL").format(Math.round(n)); }
  function lines(t) { return String(t || "").split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean); }
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 3200); }

  // Numbers from GSC/GA4 exports: "1,234", "5.2%", "‎12.3", "" → number|null
  function toNum(v) {
    if (v == null) return null;
    var s = String(v).replace(/[‎‏\s]/g, "");
    if (s === "" || s === "-" || s === "—") return null;
    var isPct = /%$/.test(s);
    s = s.replace(/%$/, "");
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
    else s = s.replace(",", ".");
    var n = parseFloat(s);
    if (isNaN(n)) return null;
    return isPct ? n / 100 : n;
  }

  // Minimal RFC4180 CSV parser; skips GA4 "#" comment lines and a UTF-8 BOM.
  function parseCSV(text) {
    text = String(text).replace(/^﻿/, "");
    var sep = (text.split("\n")[0].match(/\t/) && !text.split("\n")[0].match(/,/)) ? "\t" : ",";
    var rows = [], row = [], cell = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += ch;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.length && !(r.length === 1 && r[0].trim() === "") && !/^#/.test(r[0]); });
  }

  // ---------- data model ----------
  function client() { return ui.client && db.clients[ui.client]; }
  function report() {
    var c = client(); if (!c || !ui.month) return null;
    c.months = c.months || {};
    if (!c.months[ui.month]) {
      c.months[ui.month] = {
        gsc: {}, ga: { aiSources: [] }, rankings: [], optimizations: [],
        leads: { channels: DEFAULT_CHANNELS.map(function (n) { return { name: n, count: 0 }; }) },
        summary: "", highlights: [], nextSteps: [],
      };
      // Carry over the keyword list so ranking checks start from last month's set.
      var prev = c.months[prevMonth(ui.month)];
      if (prev && prev.rankings) c.months[ui.month].rankings = prev.rankings.map(function (r) { return { keyword: r.keyword, position: null, url: "" }; });
    }
    return c.months[ui.month];
  }
  function getPath(o, path) { return path.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setPath(o, path, v) { var ks = path.split("."); var last = ks.pop(); var t = ks.reduce(function (a, k) { return a[k] = a[k] || {}; }, o); t[last] = v; }

  // Builds the JSON the report template renders: current month + comparisons + history.
  function buildReportData() {
    var c = client(), R = report(), P = (c.months || {})[prevMonth(ui.month)] || null;
    var g = R.gsc || {};
    var out = {
      schema: 1, month: ui.month,
      generatedAt: new Date().toLocaleDateString("he-IL"),
      client: { name: c.name, domain: c.domain },
      agency: db.agency || { name: "HODIGITAL", contact: "הודיה ארנטרוי" },
      summary: R.summary || "", highlights: R.highlights || [], nextSteps: R.nextSteps || [],
      gsc: { clicks: g.clicks, impressions: g.impressions, ctr: g.ctr, position: g.position, daily: g.daily || [], queries: g.queries || [], pages: g.pages || [] },
      gscPrev: g.prev || (P && P.gsc && P.gsc.clicks != null ? { clicks: P.gsc.clicks, impressions: P.gsc.impressions, ctr: P.gsc.ctr, position: P.gsc.position } : null),
      ga: { sessions: R.ga.sessions, organic: R.ga.organic, ai: R.ga.ai, aiSources: (R.ga.aiSources || []).slice().sort(function (a, b) { return b.sessions - a.sessions; }) },
      gaPrev: P && P.ga ? { sessions: P.ga.sessions, organic: P.ga.organic, ai: P.ga.ai } : null,
      leads: { total: leadTotal(R), organic: R.leads.organic, channels: (R.leads.channels || []).filter(function (x) { return x.name; }), note: R.leads.note || "", source: R.leads.source || "" },
      leadsPrev: P && P.leads ? { total: leadTotal(P) } : null,
      rankingsNote: R.rankingsNote || "",
      rankings: (R.rankings || []).filter(function (r) { return r.keyword; }).map(function (r) {
        var o = { keyword: r.keyword, position: r.position == null || r.position === "" ? null : +r.position, url: r.url || "", aiOverview: r.aiOverview || null };
        var pr = P && (P.rankings || []).find(function (x) { return x.keyword === r.keyword; });
        if (pr) o.prev = pr.position == null || pr.position === "" ? null : +pr.position;
        return o;
      }),
      optimizations: (R.optimizations || []).filter(function (o) { return o.title; }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }),
      history: Object.keys(c.months).filter(function (m) { return m <= ui.month; }).sort().slice(-12).map(function (m) {
        var x = c.months[m]; return { month: m, clicks: x.gsc && x.gsc.clicks, ai: x.ga && x.ga.ai, leads: leadTotal(x) };
      }),
    };
    return out;
  }
  function leadTotal(R) {
    if (!R || !R.leads) return null;
    var ch = R.leads.channels || [];
    var s = ch.reduce(function (a, x) { return a + (+x.count || 0); }, 0);
    return ch.length ? s : (R.leads.total != null ? R.leads.total : null);
  }

  // ---------- importers ----------
  function kindOfTable(header, fileName) {
    var h = (header[0] || "").toLowerCase(), f = (fileName || "").toLowerCase();
    if (/quer|שאילת/.test(h) || /quer/.test(f)) return "queries";
    if (/page|דף|דפים|עמוד/.test(h) || /pages/.test(f)) return "pages";
    if (/date|תאריך/.test(h) || /dates|chart/.test(f)) return "dates";
    return null;
  }
  // GSC rows: plain = key,clicks,impr,ctr,pos ; compare mode = key,c,c',i,i',ctr,ctr',p,p'
  function gscRow(r) {
    if (r.length >= 9) return { k: r[0], c: toNum(r[1]), i: toNum(r[3]), ctr: toNum(r[5]), p: toNum(r[7]), pc: toNum(r[2]), pi: toNum(r[4]), pp: toNum(r[8]) };
    return { k: r[0], c: toNum(r[1]), i: toNum(r[2]), ctr: toNum(r[3]), p: toNum(r[4]) };
  }
  function importGscTable(rows, fileName) {
    var header = rows[0] || [];
    var kind = kindOfTable(header, fileName);
    if (!kind) return null;
    var R = report(), body = rows.slice(1).map(gscRow).filter(function (x) { return x.k && x.c != null; });
    if (kind === "queries") R.gsc.queries = body.slice(0, 50).map(strip);
    if (kind === "pages") R.gsc.pages = body.slice(0, 50).map(strip);
    if (kind === "dates") {
      var daily = body.filter(function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(x.k); }).sort(function (a, b) { return a.k.localeCompare(b.k); });
      R.gsc.daily = daily.map(function (x) { return { d: x.k, c: x.c || 0, i: x.i || 0 }; });
      var c = sum(daily, "c"), i = sum(daily, "i");
      R.gsc.clicks = c; R.gsc.impressions = i; R.gsc.ctr = i ? c / i : null;
      R.gsc.position = i ? daily.reduce(function (a, x) { return a + (x.p || 0) * (x.i || 0); }, 0) / i : null;
      if (daily.length && daily[0].pc != null) {
        var pc = sum(daily, "pc"), pi = sum(daily, "pi");
        R.gsc.prev = { clicks: pc, impressions: pi, ctr: pi ? pc / pi : null, position: pi ? daily.reduce(function (a, x) { return a + (x.pp || 0) * (x.pi || 0); }, 0) / pi : null };
      }
      var m = daily.length ? daily[Math.floor(daily.length / 2)].k.slice(0, 7) : null;
      if (m && m !== ui.month) toast("שימי לב: הנתונים בקובץ הם מ" + monthLabel(m) + ", והדוח הפתוח הוא של " + monthLabel(ui.month) + ".");
    }
    return kind;
    function strip(x) { return { k: x.k, c: x.c, i: x.i, ctr: x.ctr, p: x.p }; }
  }
  function sum(a, k) { return a.reduce(function (s, x) { return s + (x[k] || 0); }, 0); }

  function readFiles(files, onText) {
    var jobs = Array.prototype.map.call(files, function (f) {
      if (/\.zip$/i.test(f.name)) {
        if (!window.JSZip) return Promise.reject(new Error("לא ניתן לפתוח ZIP בלי חיבור לאינטרנט. חלצי את הקבצים והעלי את קובצי ה-CSV."));
        return JSZip.loadAsync(f).then(function (z) {
          return Promise.all(Object.keys(z.files).filter(function (n) { return /\.csv$/i.test(n); }).map(function (n) {
            return z.files[n].async("string").then(function (t) { return { name: n, text: t }; });
          }));
        });
      }
      return f.text().then(function (t) { return [{ name: f.name, text: t }]; });
    });
    return Promise.all(jobs).then(function (lists) { [].concat.apply([], lists).forEach(onText); });
  }

  function importGscFiles(files) {
    var done = [];
    readFiles(files, function (f) { var k = importGscTable(parseCSV(f.text), f.name); if (k) done.push(k); })
      .then(function () { save(); render(); toast(done.length ? "יובאו מ-Search Console: " + done.map(function (k) { return { queries: "ביטויים", pages: "עמודים", dates: "נתונים יומיים" }[k]; }).join(", ") : "לא זוהו קבצי Search Console. העלי את ה-ZIP או את Queries.csv, Pages.csv ו-Dates.csv."); })
      .catch(function (e) { toast(e.message); });
  }

  // GA4 "Traffic acquisition" export with "Session source / medium" (or "Session source").
  function importGa(text) {
    var rows = parseCSV(text);
    var hi = rows.findIndex(function (r) { return r.some(function (c) { return /source|מקור/i.test(c); }); });
    if (hi < 0) { toast("לא נמצאה עמודת מקור. ייצאי את הדוח \"רכישת תנועה\" עם המימד Session source / medium."); return; }
    var header = rows[hi];
    var si = header.findIndex(function (c) { return /^sessions$|^סשנים$|^ביקורים$|^הפעלות$|sessions|סשנים/i.test(c.trim()); });
    if (si < 0) si = 1;
    var dimIdx = header.findIndex(function (c) { return /source|מקור/i.test(c); });
    var total = 0, organic = 0, ai = {};
    rows.slice(hi + 1).forEach(function (r) {
      var src = (r[dimIdx] || "").trim(), n = toNum(r[si]);
      if (!src || n == null || /^(total|grand total|סה"?כ|סך הכול)$/i.test(src)) return;
      total += n;
      if (/\/\s*organic$|^organic search$|חיפוש אורגני/i.test(src)) organic += n;
      for (var i = 0; i < AI_SOURCES.length; i++) if (AI_SOURCES[i][1].test(src)) { ai[AI_SOURCES[i][0]] = (ai[AI_SOURCES[i][0]] || 0) + n; break; }
    });
    var R = report();
    R.ga.sessions = total;
    R.ga.organic = organic || R.ga.organic;
    R.ga.aiSources = Object.keys(ai).map(function (k) { return { name: k, sessions: ai[k] }; });
    R.ga.ai = sum(R.ga.aiSources, "sessions");
    save(); render();
    toast("יובאו " + fmt(total) + " כניסות, מתוכן " + fmt(R.ga.ai) + " ממנועי AI.");
  }

  // Rank checker output (JSON array) or CSV with keyword,position,url.
  function importRankings(text) {
    var list;
    try { list = JSON.parse(text); if (list.results) list = list.results; } catch (e) {
      list = parseCSV(text).filter(function (r, i) { return !(i === 0 && /keyword|ביטוי/i.test(r[0])); })
        .map(function (r) { return { keyword: r[0], position: toNum(r[1]), url: r[2] || "" }; });
    }
    var R = report(), n = 0;
    list.forEach(function (x) {
      if (!x.keyword) return;
      var row = R.rankings.find(function (r) { return r.keyword === x.keyword; });
      if (!row) { row = { keyword: x.keyword }; R.rankings.push(row); }
      row.position = x.position == null ? null : x.position;
      row.url = x.url || "";
      if (x.aiOverview) row.aiOverview = x.aiOverview;
      if (x.checkedAt && !R.rankingsNote) R.rankingsNote = "נבדק בדפדפן נסתר, google.co.il, " + new Date(x.checkedAt).toLocaleDateString("he-IL");
      n++;
    });
    save(); render(); toast("עודכנו " + n + " ביטויים.");
  }

  // ---------- rendering ----------
  function renderClients() {
    var ids = Object.keys(db.clients).sort(function (a, b) { return db.clients[a].name.localeCompare(db.clients[b].name, "he"); });
    $("#clientList").innerHTML = ids.map(function (id) {
      var c = db.clients[id];
      return '<li><button type="button" data-client="' + esc(id) + '" aria-current="' + (id === ui.client) + '">' + esc(c.name) + "<small>" + esc(c.domain) + "</small></button></li>";
    }).join("");
  }

  function render() {
    renderClients();
    var main = $("#main"), c = client();
    if (!c) {
      main.innerHTML = '<div class="step empty-state"><h2>אין עדיין לקוחות</h2><p>הוסיפי לקוח מימין, או טעני את הלקוח לדוגמה כדי לראות איך דוח נראה.</p></div>';
      return;
    }
    if (!ui.month) ui.month = lastFullMonth();
    var R = report(), g = R.gsc || {}, ga = R.ga || {};
    var months = Object.keys(c.months || {}).sort().reverse();
    var h = "";

    h += '<div class="topbar"><div><h1>' + esc(c.name) + '</h1><div class="sub">' + esc(c.domain) + "</div></div>" +
      '<div class="btns"><label>חודש הדוח<input type="month" id="monthPick" value="' + ui.month + '"></label>' +
      (months.length ? '<label>חודשים שמורים<select id="monthSel">' + months.map(function (m) { return '<option value="' + m + '"' + (m === ui.month ? " selected" : "") + ">" + monthLabel(m) + "</option>"; }).join("") + "</select></label>" : "") +
      '<button class="btn primary" id="previewBtn" type="button">תצוגה מקדימה והורדה</button></div></div>';

    // 1 Search Console
    h += step(1, "Search Console: כניסות מגוגל", g.clicks != null,
      '<p class="hint">ב-Search Console: <b>ביצועים ← תוצאות חיפוש</b>, טווח תאריכים = החודש הקודם (אפשר להפעיל "השוואה" לחודש שלפניו), ואז <b>ייצוא ← הורדת CSV</b>. גררי לכאן את קובץ ה-ZIP כמו שהוא.</p>' +
      dropZone("gscDrop", ".zip,.csv", "גררי את ה-ZIP מ-Search Console, או לחצי לבחירה", true) +
      (g.clicks != null ? '<div class="stats">' + stat("קליקים", fmt(g.clicks)) + stat("חשיפות", fmt(g.impressions)) + stat("CTR", g.ctr != null ? (g.ctr * 100).toFixed(1) + "%" : "—") + stat("מיקום ממוצע", g.position != null ? g.position.toFixed(1) : "—") + stat("ביטויים", (g.queries || []).length) + stat("עמודים", (g.pages || []).length) + "</div>" : ""));

    // 2 GA4
    h += step(2, "Analytics: כניסות ממנועי AI", ga.ai != null || ga.sessions != null,
      '<p class="hint">ב-GA4: <b>דוחות ← רכישה ← רכישת תנועה</b>, החליפי את המימד ל-<span class="mono">Session source / medium</span>, טווח = החודש הקודם, ואז <b>שיתוף ← הורדת קובץ ← CSV</b>. הסטודיו מזהה לבד את ChatGPT, Gemini, Perplexity, Copilot, Claude ועוד.</p>' +
      dropZone("gaDrop", ".csv,.txt", "גררי את קובץ ה-CSV מ-GA4, או לחצי לבחירה", false) +
      '<div class="grid2">' + field("ga.sessions", "כל הכניסות לאתר", "number") + field("ga.organic", "כניסות מחיפוש אורגני", "number") + field("ga.ai", "כניסות ממנועי AI", "number") + "</div>" +
      listTable("ga.aiSources", [["name", "מקור AI", "text"], ["sessions", "כניסות", "number"]], "הוספת מקור"));

    // 3 Rankings
    var kwText = (R.rankings || []).map(function (r) { return r.keyword; }).join("\n");
    h += step(3, "מיקומים בגוגל", (R.rankings || []).some(function (r) { return r.position != null; }),
      '<p class="hint">מריצים את <span class="mono">tools/rank-check.mjs</span> על המחשב שלך (דפדפן נסתר, google.co.il) ומעלים לכאן את קובץ התוצאות. אפשר גם להקליד מיקום ידנית. ריק = לא נמצא ב-30 התוצאות הראשונות.</p>' +
      '<details class="how"><summary>רשימת הביטויים להעתקה לסקריפט</summary><textarea id="kwList" style="margin-top:8px" dir="rtl">' + esc(kwText) + '</textarea><div class="btns" style="margin-top:6px"><button class="btn small" id="kwApply" type="button">עדכון רשימת הביטויים</button><button class="btn small" id="kwDownload" type="button">הורדת keywords.txt</button></div></details>' +
      dropZone("rankDrop", ".json,.csv", "גררי את קובץ התוצאות של בודק המיקומים (JSON או CSV)", false) +
      listTable("rankings", [["keyword", "ביטוי", "text"], ["position", "מיקום", "number"], ["url", "עמוד מדורג", "url"], ["aiOverview.shown", "סקירת AI", "check"], ["aiOverview.cited", "האתר צוטט", "check"]], "הוספת ביטוי") +
      field("rankingsNote", "הערה מתחת לכותרת (תאריך הבדיקה)", "text"));

    // 4 Leads
    h += step(4, "לידים מהאתר", leadTotal(R) > 0,
      '<p class="hint">ספירת הלידים לפי ערוץ: טפסים, קליקים לוואטסאפ ולטלפון (מאירועי מפתח ב-GA4, ממערכת הטפסים או מהלקוח עצמו).</p>' +
      listTable("leads.channels", [["name", "ערוץ", "text"], ["count", "לידים", "number"]], "הוספת ערוץ") +
      '<div class="grid2">' + field("leads.organic", "מתוכם מחיפוש אורגני ו-AI", "number") + field("leads.source", "מקור הנתון (שורה קטנה בדוח)", "text") + "</div>" +
      field("leads.note", "הערה על איכות הלידים", "textarea"));

    // 5 Optimizations
    h += step(5, "מה עשינו באתר", (R.optimizations || []).length > 0,
      '<p class="hint">כל פעולה במשפט אחד שהלקוח יבין: מה עשינו ולמה זה טוב לו.</p>' +
      listTable("optimizations", [["date", "תאריך", "date"], ["category", "תחום", "select"], ["title", "מה עשינו", "text"], ["detail", "פירוט", "text"], ["url", "עמוד", "text"]], "הוספת פעולה"));

    // 6 Summary
    h += step(6, "סיכום ותוכנית לחודש הבא", !!R.summary,
      field("summary", "בשורה התחתונה (2–3 משפטים לבעל העסק)", "textarea") +
      '<label>נקודות בולטות (שורה לכל נקודה)<textarea data-lines="highlights">' + esc((R.highlights || []).join("\n")) + "</textarea></label>" +
      '<label>התוכנית לחודש הבא (שורה לכל משימה)<textarea data-lines="nextSteps">' + esc((R.nextSteps || []).join("\n")) + "</textarea></label>" +
      '<div class="btns"><button class="btn primary" id="previewBtn2" type="button">תצוגה מקדימה והורדה</button><button class="btn small ghost" id="deleteMonth" type="button">מחיקת החודש הזה</button><button class="btn small ghost" id="deleteClient" type="button">מחיקת הלקוח</button></div>');

    main.innerHTML = h;
  }

  function step(n, title, done, body) {
    return '<section class="step"><div class="step-head"><h2><span class="n">' + n + "</span>" + esc(title) + '</h2><span class="status ' + (done ? "ok" : "todo") + '">' + (done ? "יש נתונים" : "חסר") + "</span></div>" + body + "</section>";
  }
  function stat(l, v) { return '<span class="stat">' + esc(l) + " <b>" + esc(v) + "</b></span>"; }
  function dropZone(id, accept, text, multiple) {
    return '<label class="drop" id="' + id + '">' + esc(text) + '<input type="file" accept="' + accept + '"' + (multiple ? " multiple" : "") + "></label>";
  }
  function field(path, label, type) {
    var v = getPath(report(), path);
    if (type === "textarea") return "<label>" + esc(label) + '<textarea data-k="' + path + '">' + esc(v || "") + "</textarea></label>";
    return "<label>" + esc(label) + '<input type="' + type + '" data-k="' + path + '" value="' + esc(v == null ? "" : v) + '"' + (type === "number" ? ' inputmode="decimal"' : "") + "></label>";
  }
  function listTable(path, cols, addLabel) {
    var list = getPath(report(), path) || [];
    return '<div class="tbl"><table><thead><tr>' + cols.map(function (c) { return "<th>" + esc(c[1]) + "</th>"; }).join("") + '<th></th></tr></thead><tbody>' +
      list.map(function (row, i) {
        return "<tr>" + cols.map(function (c) {
          var v = getPath(row, c[0]), attr = 'data-list="' + path + '" data-i="' + i + '" data-f="' + c[0] + '"';
          if (c[2] === "check") return '<td style="text-align:center"><input type="checkbox" ' + attr + (v ? " checked" : "") + ' aria-label="' + esc(c[1]) + '"></td>';
          if (c[2] === "select") return "<td><select " + attr + ">" + CATEGORIES.map(function (o) { return "<option" + (o === v ? " selected" : "") + ">" + o + "</option>"; }).join("") + "</select></td>";
          return '<td><input type="' + c[2] + '" ' + attr + ' value="' + esc(v == null ? "" : v) + '"' + (c[2] === "url" ? ' dir="ltr"' : "") + ' aria-label="' + esc(c[1]) + '"></td>';
        }).join("") + '<td class="x"><button class="btn small ghost" type="button" data-del="' + path + '" data-i="' + i + '" aria-label="מחיקת שורה">✕</button></td></tr>';
      }).join("") + '</tbody></table></div><div><button class="btn small" type="button" data-add="' + path + '">+ ' + esc(addLabel) + "</button></div>";
  }

  // ---------- report output ----------
  var templateCache = null;
  function getTemplate() {
    if (templateCache) return Promise.resolve(templateCache);
    return fetch("report-template.html").then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (t) { return (templateCache = t); })
      .catch(function () { throw new Error("לא הצלחתי לטעון את תבנית הדוח. פתחי את הסטודיו דרך הכתובת באינטרנט (GitHub Pages) או דרך שרת מקומי, לא בלחיצה כפולה על הקובץ."); });
  }
  function buildHtml() {
    var data = buildReportData();
    return getTemplate().then(function (t) {
      var json = JSON.stringify(data).replace(/</g, "\\u003c");
      return t.replace(/(<script id="report-data" type="application\/json">)[\s\S]*?(<\/script>)/, function (_, a, b) { return a + json + b; });
    });
  }
  function openPreview() {
    buildHtml().then(function (html) { $("#pvFrame").srcdoc = html; $("#preview").hidden = false; }).catch(function (e) { toast(e.message); });
  }
  function download(name, content, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ---------- events ----------
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t) return;
    var R;
    if (t.dataset.client) { ui.client = t.dataset.client; var ms = Object.keys(db.clients[ui.client].months || {}).sort(); ui.month = ms.length ? ms[ms.length - 1] : lastFullMonth(); save(); render(); return; }
    if (t.dataset.add) {
      R = report(); var list = getPath(R, t.dataset.add); if (!list) { list = []; setPath(R, t.dataset.add, list); }
      var blank = t.dataset.add === "optimizations" ? { date: new Date().toISOString().slice(0, 10), category: CATEGORIES[0], title: "" } : t.dataset.add === "rankings" ? { keyword: "", position: null } : {};
      list.push(blank); save(); render(); return;
    }
    if (t.dataset.del) { R = report(); getPath(R, t.dataset.del).splice(+t.dataset.i, 1); save(); render(); return; }
    switch (t.id) {
      case "previewBtn": case "previewBtn2": openPreview(); break;
      case "pvClose": $("#preview").hidden = true; break;
      case "pvDownload":
        buildHtml().then(function (html) { download("seo-report-" + slugify(client().domain) + "-" + ui.month + ".html", html, "text/html;charset=utf-8"); toast("הדוח ירד. פתחי אותו ושלחי ללקוח, או הדפיסי ל-PDF."); }).catch(function (e) { toast(e.message); });
        break;
      case "backupBtn": download("hodigital-reports-backup-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(db, null, 1), "application/json"); break;
      case "demoBtn":
        fetch("samples/demo.json").then(function (r) { return r.json(); }).then(loadDemo).catch(function () { toast("לא הצלחתי לטעון את הדוגמה."); });
        break;
      case "kwApply":
        R = report();
        var kws = lines($("#kwList").value);
        R.rankings = kws.map(function (k) { return R.rankings.find(function (r) { return r.keyword === k; }) || { keyword: k, position: null, url: "" }; });
        save(); render(); toast("רשימת הביטויים עודכנה.");
        break;
      case "kwDownload": download("keywords-" + slugify(client().domain) + ".txt", lines($("#kwList").value).join("\n") + "\n", "text/plain;charset=utf-8"); break;
      case "deleteMonth":
        if (t.dataset.armed) { delete client().months[ui.month]; ui.month = null; save(); render(); toast("החודש נמחק."); }
        else { t.dataset.armed = "1"; t.textContent = "ללחוץ שוב כדי למחוק"; }
        break;
      case "deleteClient":
        if (t.dataset.armed) { delete db.clients[ui.client]; ui.client = Object.keys(db.clients)[0] || null; ui.month = null; save(); render(); toast("הלקוח נמחק."); }
        else { t.dataset.armed = "1"; t.textContent = "ללחוץ שוב כדי למחוק את הלקוח וכל הדוחות שלו"; }
        break;
    }
  });

  document.addEventListener("change", function (e) {
    var t = e.target, R = report();
    if (t.id === "monthPick" || t.id === "monthSel") { if (t.value) { ui.month = t.value; save(); render(); } return; }
    if (t.id === "restoreInput") {
      var f = t.files[0]; if (!f) return;
      f.text().then(function (txt) {
        var data = JSON.parse(txt); if (!data.clients) throw 0;
        Object.keys(data.clients).forEach(function (k) { db.clients[k] = data.clients[k]; });
        ui.client = ui.client || Object.keys(db.clients)[0]; save(); render(); toast("הגיבוי נטען.");
      }).catch(function () { toast("הקובץ הזה אינו גיבוי של הסטודיו."); });
      return;
    }
    if (t.type === "file") {
      var drop = t.closest(".drop"); if (!drop || !t.files.length) return;
      handleDrop(drop.id, t.files); t.value = ""; return;
    }
    if (!R) return;
    if (t.dataset.k) { setPath(R, t.dataset.k, t.type === "number" ? toNum(t.value) : t.value); save(); return; }
    if (t.dataset.lines) { R[t.dataset.lines] = lines(t.value); save(); return; }
    if (t.dataset.list) {
      var row = getPath(R, t.dataset.list)[+t.dataset.i];
      var v = t.type === "checkbox" ? t.checked : t.type === "number" ? toNum(t.value) : t.value;
      setPath(row, t.dataset.f, v);
      if (t.dataset.list === "ga.aiSources") R.ga.ai = sum(R.ga.aiSources, "sessions");
      save();
      if (t.dataset.list === "ga.aiSources") { var aiInput = document.querySelector('[data-k="ga.ai"]'); if (aiInput) aiInput.value = R.ga.ai; }
    }
  });

  function handleDrop(id, files) {
    if (id === "gscDrop") return importGscFiles(files);
    files[0].text().then(function (txt) { if (id === "gaDrop") importGa(txt); if (id === "rankDrop") importRankings(txt); });
  }
  ["dragover", "dragleave", "drop"].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var d = e.target.closest && e.target.closest(".drop"); if (!d) return;
      e.preventDefault();
      d.classList.toggle("over", ev === "dragover");
      if (ev === "drop" && e.dataTransfer.files.length) handleDrop(d.id, e.dataTransfer.files);
    });
  });

  $("#newClient").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#ncName").value.trim(), domain = $("#ncDomain").value.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!name || !domain) return;
    var id = slugify(domain);
    db.clients[id] = db.clients[id] || { name: name, domain: domain, months: {} };
    ui.client = id; ui.month = lastFullMonth(); save(); render();
    e.target.reset(); toast("הלקוח נוסף. מתחילים מ" + monthLabel(ui.month) + ".");
  });
  $("#pvClose").addEventListener("keydown", function (e) { if (e.key === "Escape") $("#preview").hidden = true; });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") $("#preview").hidden = true; });

  // Turns the sample report into a client with this month and a few earlier months of history.
  function loadDemo(d) {
    var id = "demo-example";
    var months = {};
    (d.history || []).forEach(function (h) {
      if (h.month === d.month) return;
      months[h.month] = { gsc: { clicks: h.clicks }, ga: { ai: h.ai, aiSources: [] }, leads: { channels: [{ name: "סה\"כ", count: h.leads }] }, rankings: [], optimizations: [] };
    });
    var prev = months[prevMonth(d.month)];
    if (prev) {
      prev.gsc = d.gscPrev; prev.ga = { sessions: d.gaPrev.sessions, organic: d.gaPrev.organic, ai: d.gaPrev.ai, aiSources: [] };
      prev.rankings = d.rankings.map(function (r) { return { keyword: r.keyword, position: r.prev }; });
    }
    months[d.month] = {
      gsc: d.gsc, ga: d.ga, rankings: d.rankings.map(function (r) { return { keyword: r.keyword, position: r.position, url: r.url, aiOverview: r.aiOverview }; }),
      rankingsNote: d.rankingsNote, leads: { channels: d.leads.channels, organic: d.leads.organic, note: d.leads.note, source: d.leads.source },
      optimizations: d.optimizations, summary: d.summary, highlights: d.highlights, nextSteps: d.nextSteps,
    };
    db.clients[id] = { name: d.client.name, domain: d.client.domain, months: months };
    ui.client = id; ui.month = d.month; save(); render(); toast("נטען לקוח לדוגמה. הנתונים בו בדויים.");
  }

  render();
})();
