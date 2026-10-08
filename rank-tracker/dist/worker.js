const dashboard = "<!DOCTYPE html>\n<html lang=\"he\" dir=\"rtl\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<meta name=\"robots\" content=\"noindex, nofollow\">\n<title>מעקב ביטויים | HODIGITAL</title>\n<link rel=\"manifest\" href=\"/manifest.webmanifest\">\n<link rel=\"apple-touch-icon\" href=\"/icon-180.png\">\n<link rel=\"icon\" href=\"/icon-192.png\">\n<meta name=\"theme-color\" content=\"#0c0a10\">\n<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n<meta name=\"mobile-web-app-capable\" content=\"yes\">\n<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">\n<meta name=\"apple-mobile-web-app-title\" content=\"מעקב ביטויים\">\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n<link href=\"https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Hebrew:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">\n<style>\n:root{\n  --ink:#0c0a10;\n  --panel:#15121c;\n  --panel-2:#1c1826;\n  --line:rgba(255,255,255,.09);\n  --text:#f5f4f7;\n  --muted:#a49eb2;\n  --violet:#7b61ff;\n  --uv:#c4b8ff;\n  --up:#2bff88;\n  --up-bg:rgba(43,255,136,.12);\n  --down:#ff5c72;\n  --down-bg:rgba(255,92,114,.13);\n  --flat:#a49eb2;\n  --sans:'IBM Plex Sans Hebrew',system-ui,-apple-system,'Segoe UI',Arial,sans-serif;\n  --mono:ui-monospace,'SF Mono','Cascadia Mono',Menlo,Consolas,monospace;\n}\n*{box-sizing:border-box}\n[hidden]{display:none!important}\nbody{margin:0;padding-top:env(safe-area-inset-top);background:var(--ink);color:var(--text);font-family:var(--sans);font-size:15px;line-height:1.5}\na{color:var(--uv)}\n.wrap{max-width:1200px;margin:0 auto;padding:0 16px}\n\nheader{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;padding:20px 0 16px}\n.brand{font-weight:700;font-size:20px;letter-spacing:.02em}\n.brand span{color:var(--violet)}\n.updated{color:var(--muted);font-size:13px}\n.controls{margin-inline-start:auto;display:flex;flex-wrap:wrap;gap:8px}\nselect,input,button,textarea{font:inherit;color:var(--text);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:7px 12px}\ntextarea{width:100%;min-height:110px;resize:vertical}\nbutton{cursor:pointer;background:var(--violet);border-color:var(--violet);font-weight:600}\nbutton.ghost{background:var(--panel-2);border-color:var(--line)}\nbutton.danger{background:transparent;border-color:var(--down);color:var(--down)}\nbutton:disabled{opacity:.5;cursor:default}\nbutton:hover:not(:disabled){filter:brightness(1.1)}\n:focus-visible{outline:2px solid var(--uv);outline-offset:2px}\n\n.ticker{overflow:hidden;border-block:1px solid var(--line);background:var(--panel);white-space:nowrap;font-family:var(--mono);font-size:13px}\n.ticker-track{display:inline-flex;gap:32px;padding:9px 0;animation:tick 60s linear infinite}\n.ticker:hover .ticker-track{animation-play-state:paused}\n@keyframes tick{from{transform:translateX(0)}to{transform:translateX(50%)}}\n@media (prefers-reduced-motion:reduce){.ticker-track{animation:none}}\n.ticker-item b{font-family:var(--sans);font-weight:500;color:var(--text)}\n\n.statusbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin-top:16px;color:var(--muted);font-size:13px}\n.statusbar .warn{color:var(--down)}\n.notice{margin-top:12px;padding:12px 14px;border:1px solid var(--down);border-radius:10px;background:var(--down-bg);font-size:14px}\n.notice code{display:inline-block;max-width:100%;overflow-wrap:anywhere;direction:ltr;font-family:var(--mono);background:var(--panel-2);padding:1px 6px;border-radius:4px;user-select:all}\n.num{font-family:var(--mono)}\n.health{margin-top:12px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel);font-size:14px}\n.health summary{cursor:pointer;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;list-style:none}\n.health summary::-webkit-details-marker{display:none}\n.health .when{color:var(--muted);font-size:13px}\n.health .more{margin-inline-start:auto;color:var(--muted);font-size:12px}\n.health .text{white-space:pre-line;margin-top:10px;line-height:1.7}\n.health .older{margin-top:12px;border-top:1px solid var(--line);padding-top:8px}\n.health .older div{display:flex;gap:10px;align-items:baseline;padding:4px 0;font-size:13px}\n.health .older span.t{color:var(--muted);white-space:nowrap}\n.dot{display:inline-flex;align-items:center;gap:6px;font-weight:600}\n.dot::before{content:\"\";width:8px;height:8px;border-radius:50%;background:currentColor}\n.dot.ok{color:var(--up)}.dot.warn{color:#ffc35c}.dot.error{color:var(--down)}\n.statusbar button{margin-inline-start:auto;padding:5px 12px;font-size:13px}\n\n.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:16px 0 20px}\n.kpi{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px}\n.kpi .label{color:var(--muted);font-size:13px}\n.kpi .value{font-size:28px;font-weight:700;font-family:var(--mono)}\n.kpi.up .value{color:var(--up)}\n.kpi.down .value{color:var(--down)}\n\n.table-wrap{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow-x:auto}\ntable{width:100%;border-collapse:collapse;min-width:1000px}\nth,td{padding:11px 14px;text-align:right;border-bottom:1px solid var(--line);vertical-align:middle}\nth{font-size:12px;color:var(--muted);font-weight:500;user-select:none;white-space:nowrap}\nth[data-sort]{cursor:pointer}\nth[aria-sort=\"ascending\"]::after{content:\" ▲\"}\nth[aria-sort=\"descending\"]::after{content:\" ▼\"}\ntr:last-child td{border-bottom:0}\ntbody tr:hover{background:var(--panel-2)}\n.kw{font-weight:600;min-width:150px}\n.pos{font-family:var(--mono);font-size:18px;font-weight:700}\n.pos.none{font-family:var(--sans);font-size:13px;color:var(--muted);font-weight:400}\n.chg{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);font-weight:600;padding:2px 9px;border-radius:999px;font-size:13px;white-space:nowrap}\n.chg.up{color:var(--up);background:var(--up-bg)}\n.chg.down{color:var(--down);background:var(--down-bg)}\n.chg.flat{color:var(--flat)}\n.lp{max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:ltr;text-align:left;font-size:13px}\n.best{font-family:var(--mono);color:var(--muted)}\n.del{background:none;border:0;color:var(--muted);padding:2px 6px;font-size:16px;line-height:1}\n.del:hover{color:var(--down)}\nsvg.spark{display:block}\n\n.empty{padding:40px 20px;text-align:center;color:var(--muted)}\n\n.panel{margin:20px 0;padding:16px;background:var(--panel);border:1px solid var(--line);border-radius:12px}\n.panel h2{font-size:16px;margin:0 0 12px}\n.row{display:flex;flex-wrap:wrap;align-items:center;gap:10px}\n.row h2{margin:0;margin-inline-end:auto}\n.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}\n.field{display:flex;flex-direction:column;gap:4px;flex:1;min-width:160px}\n.field span{font-size:12px;color:var(--muted)}\n.hint{font-size:12px;color:var(--muted);margin:6px 0 0}\n.msg{font-size:13px;color:var(--up);min-height:1.2em}\n.msg.err{color:var(--down)}\n.domain{direction:ltr}\n\n.tabs{display:flex;gap:6px}\n.tabs{padding:4px;background:var(--panel);border:1px solid var(--line);border-radius:10px}\n.tab{background:transparent;border-color:transparent;color:var(--muted);font-weight:600;padding:6px 14px}\n.tab:hover:not([aria-current=\"page\"]){color:var(--text);background:var(--panel-2)}\n.tab[aria-current=\"page\"]{background:var(--violet);border-color:var(--violet);color:#fff}\n.ov-table{min-width:920px}\n.ov-table tbody tr{cursor:pointer}\n.ov-client{display:flex;align-items:center;gap:10px;min-width:220px}\n.ov-client img{width:20px;height:20px;border-radius:4px;background:#fff;flex:none}\n.ov-client .fav-fallback{width:20px;height:20px;border-radius:4px;background:var(--panel-2);display:inline-flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted);flex:none}\n.ov-client b{display:block;font-weight:600}\n.ov-client span.d{display:block;color:var(--muted);font-size:12px;direction:ltr;text-align:right}\n.metric{display:flex;align-items:center;gap:8px;white-space:nowrap}\n.metric .v{font-family:var(--mono);font-size:16px;font-weight:700;min-width:44px}\n.metric .v.none{color:var(--muted);font-weight:400}\n.warn-dot{color:var(--down);font-size:12px;margin-inline-start:6px}\n.ov-actions{display:flex;justify-content:flex-end;margin:0 0 12px}\n/* בטלפון: כל לקוח ככרטיס במקום שורה בטבלה רחבה */\n@media (max-width:700px){\n  .ov-table{min-width:0}\n  .ov-table thead{display:none}\n  .ov-table,.ov-table tbody,.ov-table tr,.ov-table td{display:block}\n  .ov-table tr{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;padding:14px;border-bottom:1px solid var(--line)}\n  .ov-table td{border:0;padding:0}\n  .ov-table td:first-child{grid-column:1 / -1}\n  .ov-table td[data-label]::before{content:attr(data-label);display:block;color:var(--muted);font-size:11px;margin-bottom:2px}\n  .metric{flex-wrap:wrap;gap:4px 6px}\n  .metric svg{display:none}\n}\n\n#report{display:none}\n\n@media print{\n  body{background:#fff;color:#0c0a10;font-size:12px}\n  .screen{display:none!important}\n  #report{display:block;padding:0}\n  #report h1{font-size:22px;margin:0 0 4px}\n  #report .sub{color:#5f5a69;margin-bottom:18px}\n  #report table{min-width:0;font-size:12px}\n  #report th{color:#5f5a69}\n  #report th,#report td{border-bottom:1px solid #e3e0e8;padding:7px 8px}\n  #report .chg.up{color:#00863f;background:#e3f9ec}\n  #report .chg.down{color:#c4142d;background:#fde8eb}\n  #report .chg.flat{color:#5f5a69}\n  #report .lp{max-width:220px}\n  #report .summary{display:flex;gap:24px;margin-bottom:16px}\n  #report .summary b{font-size:18px;display:block}\n  #report footer{margin-top:20px;color:#5f5a69;font-size:11px}\n}\n</style>\n</head>\n<body>\n<div class=\"screen\">\n  <div class=\"wrap\">\n    <header>\n      <div class=\"brand\">HO<span>DIGITAL</span> · מעקב ביטויים</div>\n      <nav class=\"tabs\">\n        <button type=\"button\" class=\"tab\" id=\"tab-all\">דשבורד לקוחות</button>\n        <button type=\"button\" class=\"tab\" id=\"tab-client\">לקוח</button>\n      </nav>\n      <div class=\"controls\" id=\"detail-controls\">\n        <select id=\"client\" aria-label=\"בחירת לקוח\"></select>\n        <input id=\"search\" type=\"search\" placeholder=\"חיפוש ביטוי\" aria-label=\"חיפוש ביטוי\">\n      </div>\n    </header>\n  </div>\n\n  <main class=\"wrap\" id=\"overview-view\" hidden>\n    <section class=\"kpis\" id=\"ov-kpis\"></section>\n    <div class=\"ov-actions\"><button type=\"button\" class=\"ghost\" id=\"ov-add\">+ לקוח חדש</button></div>\n    <div class=\"table-wrap\">\n      <table class=\"ov-table\">\n        <thead>\n          <tr>\n            <th data-ovsort=\"name\">לקוח</th>\n            <th data-ovsort=\"visibility\">נראות</th>\n            <th data-ovsort=\"top10\">בטופ 10</th>\n            <th data-ovsort=\"avg\">מיקום ממוצע</th>\n            <th data-ovsort=\"clicks\">קליקים (30 יום)</th>\n            <th data-ovsort=\"keywords\">ביטויים</th>\n            <th data-ovsort=\"moves\">מהבדיקה הקודמת</th>\n          </tr>\n        </thead>\n        <tbody id=\"ov-rows\"></tbody>\n      </table>\n      <div class=\"empty\" id=\"ov-empty\" hidden>עוד אין לקוחות. לוחצים \"+ לקוח חדש\" כדי להתחיל.</div>\n    </div>\n    <p class=\"hint\">נראות = אחוז הקליקים המשוער שהאתר מקבל מכל הביטויים במעקב, לפי המיקום של כל ביטוי (100% = כולם במקום הראשון). השינויים הם מול לפני 7 ימים.</p>\n  </main>\n\n  <div id=\"detail-view\">\n  <div class=\"ticker\" id=\"ticker\" aria-hidden=\"true\"><div class=\"ticker-track\" id=\"ticker-track\"></div></div>\n  <main class=\"wrap\">\n    <div class=\"statusbar\">\n      <span id=\"status\"></span>\n      <button id=\"scan\" type=\"button\" class=\"ghost\">עדכון עכשיו</button>\n    </div>\n    <div class=\"notice\" id=\"notice\" hidden></div>\n    <details class=\"health\" id=\"health\" hidden></details>\n    <section class=\"kpis\" id=\"kpis\"></section>\n    <div class=\"table-wrap\">\n      <table>\n        <thead>\n          <tr>\n            <th data-sort=\"keyword\">ביטוי</th>\n            <th data-sort=\"position\">מיקום</th>\n            <th data-sort=\"day\">שינוי יומי</th>\n            <th data-sort=\"week\">7 ימים</th>\n            <th data-sort=\"month\">30 ימים</th>\n            <th>מגמה (30 יום)</th>\n            <th data-sort=\"best\">שיא</th>\n            <th data-sort=\"clicks\">קליקים (30 יום)</th>\n            <th data-sort=\"impressions\">חשיפות (30 יום)</th>\n            <th>דף נחיתה</th>\n            <th><span hidden>מחיקה</span></th>\n          </tr>\n        </thead>\n        <tbody id=\"rows\"></tbody>\n      </table>\n      <div class=\"empty\" id=\"empty\" hidden></div>\n    </div>\n\n    <section class=\"panel row\" id=\"export-panel\">\n      <h2>דוח חודשי ללקוח</h2>\n      <select id=\"month\" aria-label=\"בחירת חודש\"></select>\n      <button id=\"csv\" type=\"button\">ייצוא לאקסל (CSV)</button>\n      <button id=\"print\" type=\"button\" class=\"ghost\">דוח להדפסה / PDF</button>\n    </section>\n\n    <section class=\"panel grid2\">\n      <form id=\"kw-form\">\n        <h2>הוספת ביטויים ל<span id=\"kw-client-name\">לקוח</span></h2>\n        <textarea id=\"kw-input\" placeholder=\"ביטוי אחד בכל שורה\" aria-label=\"ביטויים להוספה\"></textarea>\n        <div class=\"row\" style=\"margin-top:8px\">\n          <button type=\"submit\">הוספה</button>\n          <span class=\"msg\" id=\"kw-msg\"></span>\n        </div>\n        <p class=\"hint\">ביטוי חדש ייבדק בעדכון הקרוב (תוך 10 דקות), או מיד בלחיצה על \"עדכון עכשיו\". המיקום נבדק כל בוקר בגוגל ישראל, כמו בגלישה בסתר.</p>\n      </form>\n      <form id=\"client-form\">\n        <h2 id=\"client-form-title\">לקוח חדש</h2>\n        <div class=\"row\">\n          <label class=\"field\"><span>שם הלקוח</span><input id=\"c-name\" required></label>\n          <label class=\"field\"><span>דומיין</span><input id=\"c-domain\" class=\"domain\" placeholder=\"example.co.il\" required></label>\n        </div>\n        <div class=\"row\" style=\"margin-top:10px\">\n          <button type=\"submit\" id=\"c-save\">יצירת לקוח</button>\n          <button type=\"button\" class=\"ghost\" id=\"c-edit-current\">עריכת הלקוח הנוכחי</button>\n          <button type=\"button\" class=\"ghost\" id=\"c-cancel\" hidden>ביטול</button>\n          <button type=\"button\" class=\"danger\" id=\"c-delete\" hidden>מחיקת לקוח</button>\n          <span class=\"msg\" id=\"c-msg\"></span>\n        </div>\n        <p class=\"hint\">דומיין בלי https ובלי www, כמו שהאתר רשום ב-Search Console.</p>\n      </form>\n    </section>\n  </main>\n  </div>\n</div>\n<div id=\"report\"></div>\n\n<script>\nconst DEMO = new URLSearchParams(location.search).has('demo');\nconst $ = (id) => document.getElementById(id);\nconst state = { view: 'all', overview: [], ovSort: { key: 'visibility', dir: 1 }, clients: [], client: null, data: { keywords: {} }, status: null, sort: { key: 'position', dir: 1 }, query: '', editing: false };\n\nconst esc = (s) => String(s ?? '').replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c]));\nconst fmtDate = (d) => d ? d.split('-').reverse().join('/') : '';\nconst monthName = (ym) => new Date(ym + '-01T12:00:00').toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });\nconst fmtPos = (p) => Number.isInteger(p) ? String(p) : p.toFixed(1);\nconst fmtNum = (n) => Number(n || 0).toLocaleString('he-IL');\nconst prettyUrl = (u) => { try { return decodeURI(u.replace(/^https?:\\/\\/(www\\.)?/, '')); } catch { return u; } };\n\nasync function call(method, path, body) {\n  if (DEMO) return demoApi(method, path, body);\n  const res = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });\n  if (res.status === 401) { location.href = '/login'; throw new Error('נדרשת כניסה'); }\n  const data = await res.json().catch(() => ({}));\n  if (!res.ok) throw new Error(data.error || 'שגיאה ' + res.status);\n  return data;\n}\n\n// שינוי במיקום: מספר חיובי = עלייה בדירוג (מספר המיקום ירד)\nfunction delta(prev, cur) {\n  if (prev === undefined) return { kind: 'flat', text: '—', value: 0 };\n  const p = prev?.position ?? null, c = cur?.position ?? null;\n  if (p === null && c === null) return { kind: 'flat', text: '—', value: 0 };\n  if (p === null) return { kind: 'up', text: '▲ חדש', value: 1000 };\n  if (c === null) return { kind: 'down', text: '▼ יצא', value: -1000 };\n  const v = Math.round((p - c) * 10) / 10;\n  if (v > 0) return { kind: 'up', text: '▲ ' + fmtPos(v), value: v };\n  if (v < 0) return { kind: 'down', text: '▼ ' + fmtPos(-v), value: v };\n  return { kind: 'flat', text: '0', value: 0 };\n}\n\n// הרשומה האחרונה שתאריכה לפני או בדיוק ב-date\nfunction entryAt(history, date) {\n  let found;\n  for (const e of history) { if (e.date <= date) found = e; else break; }\n  return found;\n}\n\nfunction shiftDate(date, days) {\n  const d = new Date(date + 'T12:00:00Z');\n  d.setUTCDate(d.getUTCDate() + days);\n  return d.toISOString().slice(0, 10);\n}\n\nfunction sparkline(history) {\n  const pts = history.slice(-30);\n  const depth = Math.max(10, ...pts.map((e) => e.position || 0));\n  const w = 110, h = 30, pad = 3;\n  if (pts.length < 2) return '<span class=\"best\">—</span>';\n  const x = (i) => w - pad - (i * (w - 2 * pad)) / (pts.length - 1); // RTL: היום בצד שמאל\n  const y = (p) => pad + ((Math.min(p, depth) - 1) * (h - 2 * pad)) / (depth - 1);\n  let d = '', open = false;\n  pts.forEach((e, i) => {\n    if (e.position === null) { open = false; return; }\n    d += (open ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(e.position).toFixed(1);\n    open = true;\n  });\n  const dd = delta(pts[0], pts[pts.length - 1]);\n  const color = dd.kind === 'up' ? 'var(--up)' : dd.kind === 'down' ? 'var(--down)' : 'var(--flat)';\n  return `<svg class=\"spark\" width=\"${w}\" height=\"${h}\" viewBox=\"0 0 ${w} ${h}\" role=\"img\" aria-label=\"מגמת מיקום\"><path d=\"${d}\" fill=\"none\" stroke=\"${color}\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>`;\n}\n\nconst chip = (d) => `<span class=\"chg ${d.kind}\">${d.text}</span>`;\n\n// מקור המיקום: הבדיקה היומית בגוגל (Serper) אם יש ללקוח נתונים כאלה, אחרת המיקום הממוצע מ-Search Console\nconst useSerp = () => Object.keys(state.data.serp || {}).length > 0;\nconst mainHist = (id) => (useSerp() ? state.data.serp[id] : state.data.keywords?.[id]) || [];\nconst gscHist = (id) => state.data.keywords?.[id] || [];\nconst noneLabel = () => useSerp() ? `לא בטופ ${state.status?.maxDepth || 50}` : 'אין חשיפות';\n\nfunction buildRows() {\n  if (!state.client) return [];\n  return state.client.keywords.map(({ id, keyword }) => {\n    const h = mainHist(id);\n    const cur = h[h.length - 1];\n    const today = cur?.date;\n    const ranked = h.filter((e) => e.position !== null);\n    const g = gscHist(id);\n    const gLast = g[g.length - 1]?.date;\n    const last30 = gLast ? g.filter((e) => e.date > shiftDate(gLast, -30)) : [];\n    return {\n      id, keyword, history: h, cur,\n      clicks: last30.reduce((s, e) => s + (e.clicks || 0), 0),\n      impressions: last30.reduce((s, e) => s + (e.impressions || 0), 0),\n      position: cur?.position ?? null,\n      url: cur?.url || ranked[ranked.length - 1]?.url || null,\n      day: delta(h[h.length - 2], cur),\n      week: today ? delta(entryAt(h, shiftDate(today, -7)), cur) : delta(undefined),\n      month: today ? delta(entryAt(h, shiftDate(today, -30)), cur) : delta(undefined),\n      best: ranked.length ? Math.min(...ranked.map((e) => e.position)) : null,\n    };\n  });\n}\n\nfunction sortValue(r, key) {\n  switch (key) {\n    case 'keyword': return r.keyword;\n    case 'position': case 'best': return r[key] ?? 9999;\n    case 'clicks': case 'impressions': return -r[key];\n    default: return -r[key].value;\n  }\n}\n\nfunction renderStatus() {\n  const s = state.status, c = state.client;\n  if (!s) { $('status').textContent = ''; return; }\n  const parts = [];\n  if (s.serp) {\n    const { done, total, failed } = s.serp;\n    parts.push(total && done >= total\n      ? `המיקומים בגוגל נבדקו היום (${done} ביטויים)`\n      : `בדיקת המיקומים בגוגל: ${done} מתוך ${total} היום (מתחילה כל יום ב-0${s.syncHour}:00)`);\n    if (failed) parts.push(`<span class=\"warn\">${failed} בדיקות נכשלו היום</span>`);\n  }\n  if (state.data.updated) parts.push(`קליקים וחשיפות מ-Search Console עד ${fmtDate(state.data.updated)}`);\n  $('status').innerHTML = parts.join(' · ');\n  $('scan').disabled = !s.configured && !s.serperConfigured;\n\n  let notice = '';\n  if (s.secretInvalid) {\n    notice = 'הסוד GSC_SERVICE_ACCOUNT לא תקין. צריך להדביק בו את כל התוכן של קובץ ה-JSON שהורד מ-Google Cloud.';\n  } else if (!s.configured && !s.serperConfigured) {\n    notice = 'המערכת עוד לא מחוברת: צריך להוסיף ב-Cloudflare את הסוד SERPER_API_KEY (מיקום מדויק בגוגל), ואם רוצים גם קליקים וחשיפות, את GSC_SERVICE_ACCOUNT.';\n  } else if (!s.configured) {\n    notice = '';\n  } else if (c?.gsc_error === 'no_access') {\n    notice = `אין גישה לאתר <b>${esc(c.domain)}</b> ב-Search Console. ב-Search Console של האתר: הגדרות ← משתמשים והרשאות ← הוספת משתמש, עם הכתובת <code>${esc(s.serviceAccountEmail)}</code> והרשאה מוגבלת. אחר כך לוחצים \"עדכון עכשיו\".`;\n  } else if (c?.gsc_error) {\n    notice = 'שגיאה במשיכת הנתונים מ-Search Console: ' + esc(c.gsc_error);\n  } else if (c && c.keywords.length && !c.backfilled) {\n    notice = 'מושכת את ההיסטוריה מ-Search Console. זה לוקח עד כמה דקות.';\n  }\n  $('notice').innerHTML = notice;\n  $('notice').hidden = !notice;\n}\n\nconst STATUS_LABEL = { ok: 'הכול תקין', warn: 'יש מה לבדוק', error: 'יש בעיה' };\nconst fmtStamp = (ts) => new Date(ts.replace(' ', 'T') + 'Z').toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });\n\nfunction renderHealth() {\n  const [last, ...older] = state.reports || [];\n  const el = $('health');\n  el.hidden = !last;\n  if (!last) return;\n  const open = el.open;\n  el.innerHTML = `\n    <summary>\n      <b>הבדיקה היומית של Claude</b>\n      <span class=\"dot ${esc(last.status)}\">${STATUS_LABEL[last.status] || esc(last.status)}</span>\n      <span class=\"when\">${fmtStamp(last.created_at)}</span>\n      <span class=\"more\">לפרטים</span>\n    </summary>\n    <div class=\"text\">${esc(last.summary)}</div>\n    ${older.length ? `<div class=\"older\">${older.map((r) => `<div><span class=\"dot ${esc(r.status)}\"></span><span class=\"t\">${fmtStamp(r.created_at)}</span><span>${esc(r.summary.split('\\n')[0])}</span></div>`).join('')}</div>` : ''}`;\n  el.open = open || last.status !== 'ok';\n}\n\nfunction render() {\n  const rows = buildRows();\n  const shown = rows\n    .filter((r) => r.keyword.includes(state.query))\n    .sort((a, b) => {\n      const va = sortValue(a, state.sort.key), vb = sortValue(b, state.sort.key);\n      return (typeof va === 'string' ? va.localeCompare(vb, 'he') : va - vb) * state.sort.dir;\n    });\n\n  $('kw-client-name').textContent = state.client ? state.client.name : 'לקוח';\n  $('kw-form').querySelector('button').disabled = !state.client;\n  $('c-edit-current').hidden = !state.client || state.editing;\n\n  const ranked = rows.filter((r) => r.position !== null);\n  const avg = ranked.length ? (ranked.reduce((s, r) => s + r.position, 0) / ranked.length).toFixed(1) : '—';\n  const clicks = rows.reduce((s, r) => s + r.clicks, 0);\n  $('kpis').innerHTML = [\n    ['ביטויים במעקב', rows.length, ''],\n    ['מיקום ממוצע', avg, ''],\n    ['בטופ 3', ranked.filter((r) => r.position <= 3).length, ''],\n    ['בטופ 10', ranked.filter((r) => r.position <= 10).length, ''],\n    ['קליקים ב-30 יום', fmtNum(clicks), ''],\n    ['עלו מאתמול', rows.filter((r) => r.day.kind === 'up').length, 'up'],\n    ['ירדו מאתמול', rows.filter((r) => r.day.kind === 'down').length, 'down'],\n  ].map(([l, v, c]) => `<div class=\"kpi ${c}\"><div class=\"label\">${l}</div><div class=\"value\">${v}</div></div>`).join('');\n\n  const items = rows.filter((r) => r.cur).map((r) =>\n    `<span class=\"ticker-item\"><b>${esc(r.keyword)}</b> ${r.position !== null ? fmtPos(r.position) : '—'} ${chip(r.day)}</span>`).join('');\n  $('ticker-track').innerHTML = items + items;\n  $('ticker').hidden = !items;\n\n  $('rows').innerHTML = shown.map((r) => `\n    <tr>\n      <td class=\"kw\">${esc(r.keyword)}</td>\n      <td>${r.position !== null ? `<span class=\"pos\">${fmtPos(r.position)}</span>` : `<span class=\"pos none\">${r.cur ? noneLabel() : 'ממתין לנתונים'}</span>`}</td>\n      <td>${chip(r.day)}</td>\n      <td>${chip(r.week)}</td>\n      <td>${chip(r.month)}</td>\n      <td>${sparkline(r.history)}</td>\n      <td class=\"best\">${r.best !== null ? fmtPos(r.best) : '—'}</td>\n      <td class=\"num\">${fmtNum(r.clicks)}</td>\n      <td class=\"num\">${fmtNum(r.impressions)}</td>\n      <td class=\"lp\">${r.url ? `<a href=\"${esc(r.url)}\" target=\"_blank\" rel=\"noopener\" title=\"${esc(r.url)}\">${esc(prettyUrl(r.url))}</a>` : '—'}</td>\n      <td><button class=\"del\" type=\"button\" data-del=\"${r.id}\" title=\"הסרת הביטוי\" aria-label=\"הסרת ${esc(r.keyword)}\">×</button></td>\n    </tr>`).join('');\n\n  const empty = $('empty');\n  empty.hidden = rows.length > 0;\n  empty.textContent = !state.clients.length\n    ? 'עוד אין לקוחות. מוסיפים לקוח ראשון בטופס \"לקוח חדש\" למטה.'\n    : 'אין עדיין ביטויים ללקוח הזה. מוסיפים אותם בטופס למטה.';\n\n  document.querySelectorAll('th[data-sort]').forEach((th) => {\n    th.setAttribute('aria-sort', th.dataset.sort === state.sort.key ? (state.sort.dir === 1 ? 'ascending' : 'descending') : 'none');\n  });\n\n  renderStatus();\n  renderHealth();\n  fillMonths();\n}\n\nfunction fillMonths() {\n  const months = new Set();\n  [state.data.keywords, state.data.serp].forEach((src) =>\n    Object.values(src || {}).forEach((h) => h.forEach((e) => months.add(e.date.slice(0, 7)))));\n  const list = [...months].sort().reverse();\n  const sel = $('month'), prev = sel.value;\n  sel.innerHTML = list.map((m) => `<option value=\"${m}\">${monthName(m)}</option>`).join('');\n  if (list.includes(prev)) sel.value = prev;\n  $('csv').disabled = $('print').disabled = !list.length;\n}\n\n// סיכום חודשי: מיקום בתחילת החודש (הסריקה האחרונה לפניו, או הראשונה בו) מול הסריקה האחרונה בחודש\nfunction monthReport(ym) {\n  const start = ym + '-01', end = ym + '-31';\n  return state.client.keywords.map(({ id, keyword }) => {\n    const h = mainHist(id);\n    const inMonth = h.filter((e) => e.date >= start && e.date <= end);\n    const first = entryAt(h, shiftDate(start, -1)) || inMonth[0];\n    const last = inMonth[inMonth.length - 1];\n    const ranked = inMonth.filter((e) => e.position !== null);\n    const gMonth = gscHist(id).filter((e) => e.date >= start && e.date <= end);\n    return {\n      keyword,\n      clicks: gMonth.reduce((s, e) => s + (e.clicks || 0), 0),\n      impressions: gMonth.reduce((s, e) => s + (e.impressions || 0), 0),\n      start: first?.position ?? null,\n      end: last?.position ?? null,\n      change: last ? delta(first, last) : delta(undefined),\n      best: ranked.length ? Math.min(...ranked.map((e) => e.position)) : null,\n      url: [...inMonth].reverse().find((e) => e.url)?.url || null,\n      scanned: !!last,\n    };\n  });\n}\n\nfunction exportCsv() {\n  const ym = $('month').value;\n  const out = (p) => p !== null ? fmtPos(p) : noneLabel();\n  const lines = [['ביטוי', 'מיקום בתחילת החודש', 'מיקום בסוף החודש', 'שינוי', 'המיקום הטוב ביותר בחודש', 'קליקים', 'חשיפות', 'דף נחיתה']];\n  monthReport(ym).filter((r) => r.scanned).forEach((r) => {\n    const change = r.change.kind === 'flat' ? '0' : r.change.text.replace('▲ ', '+').replace('▼ ', '-');\n    lines.push([r.keyword, out(r.start), out(r.end), change, r.best !== null ? fmtPos(r.best) : '—', r.clicks, r.impressions, r.url ? prettyUrl(r.url) : '—']);\n  });\n  const csv = '﻿' + lines.map((l) => l.map((v) => `\"${String(v).replace(/\"/g, '\"\"')}\"`).join(',')).join('\\r\\n');\n  const a = document.createElement('a');\n  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));\n  a.download = `דוח מיקומים - ${state.client.name} - ${ym}.csv`;\n  a.click();\n  setTimeout(() => URL.revokeObjectURL(a.href), 1000);\n}\n\nfunction printReport() {\n  const ym = $('month').value;\n  const rows = monthReport(ym).filter((r) => r.scanned);\n  const clicks = rows.reduce((s, r) => s + r.clicks, 0);\n  const ups = rows.filter((r) => r.change.kind === 'up').length;\n  const top10 = rows.filter((r) => r.end !== null && r.end <= 10).length;\n  const out = (p) => p !== null ? fmtPos(p) : `<span style=\"color:#5f5a69\">${noneLabel()}</span>`;\n  $('report').innerHTML = `\n    <h1>דוח מיקומים בגוגל · ${esc(state.client.name)}</h1>\n    <div class=\"sub\">${monthName(ym)} · ${esc(state.client.domain)}</div>\n    <div class=\"summary\">\n      <div><b>${rows.length}</b>ביטויים במעקב</div>\n      <div><b>${ups}</b>ביטויים שהשתפרו</div>\n      <div><b>${top10}</b>ביטויים בעמוד הראשון</div>\n      <div><b>${fmtNum(clicks)}</b>קליקים מהביטויים</div>\n    </div>\n    <table>\n      <thead><tr><th>ביטוי</th><th>תחילת החודש</th><th>סוף החודש</th><th>שינוי</th><th>שיא החודש</th><th>קליקים</th><th>חשיפות</th><th>דף נחיתה</th></tr></thead>\n      <tbody>${rows.map((r) => `<tr><td class=\"kw\">${esc(r.keyword)}</td><td>${out(r.start)}</td><td><b>${out(r.end)}</b></td><td>${chip(r.change)}</td><td>${r.best !== null ? fmtPos(r.best) : '—'}</td><td>${fmtNum(r.clicks)}</td><td>${fmtNum(r.impressions)}</td><td class=\"lp\">${r.url ? esc(prettyUrl(r.url)) : '—'}</td></tr>`).join('')}</tbody>\n    </table>\n    <footer>${useSerp() ? 'מיקום: בדיקה יומית בגוגל ישראל. קליקים וחשיפות: Google Search Console.' : 'מקור הנתונים: Google Search Console (מיקום ממוצע).'} הופק על ידי HODIGITAL · הודיה ארנטרוי · 054-725-3007</footer>`;\n  const prevTitle = document.title;\n  document.title = `דוח מיקומים - ${state.client.name} - ${monthName(ym)}`;\n  window.print();\n  document.title = prevTitle;\n}\n\n// ---------- מסך כל הלקוחות ----------\n\nfunction miniSpark(values, lowerIsBetter) {\n  const pts = values.map((v, i) => [i, v]).filter(([, v]) => v !== null && v !== undefined);\n  const w = 64, h = 22, pad = 2;\n  if (pts.length < 2) return '';\n  const vals = pts.map(([, v]) => v);\n  let min = Math.min(...vals), max = Math.max(...vals);\n  if (min === max) { min -= 1; max += 1; }\n  const x = (i) => w - pad - (i * (w - 2 * pad)) / (values.length - 1); // RTL: היום בצד שמאל\n  const y = (v) => {\n    const t = (v - min) / (max - min);\n    return pad + (lowerIsBetter ? t : 1 - t) * (h - 2 * pad);\n  };\n  const first = vals[0], last = vals[vals.length - 1];\n  const better = lowerIsBetter ? last < first : last > first;\n  const color = first === last ? 'var(--flat)' : better ? 'var(--up)' : 'var(--down)';\n  const d = pts.map(([i, v], n) => (n ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join('');\n  return `<svg width=\"${w}\" height=\"${h}\" viewBox=\"0 0 ${w} ${h}\" aria-hidden=\"true\"><path d=\"${d}\" fill=\"none\" stroke=\"${color}\" stroke-width=\"1.6\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></svg>`;\n}\n\n// שינוי מול לפני 7 ימים. lowerIsBetter למיקום ממוצע (מספר קטן יותר = טוב יותר)\nfunction changeChip(cur, prev, { lowerIsBetter = false, suffix = '', digits = 1 } = {}) {\n  if (cur === null || cur === undefined || prev === null || prev === undefined) return '';\n  const diff = Math.round((cur - prev) * 10 ** digits) / 10 ** digits;\n  if (!diff) return '<span class=\"chg flat\">0</span>';\n  const good = lowerIsBetter ? diff < 0 : diff > 0;\n  const n = Math.abs(diff);\n  // החץ מראה שיפור (▲) או הרעה (▼), כמו בשאר המערכת, גם כשבמיקום ממוצע המספר קטן\n  return `<span class=\"chg ${good ? 'up' : 'down'}\">${good ? '▲' : '▼'} ${digits ? fmtPos(n) : n}${suffix}</span>`;\n}\n\nfunction overviewRow(c) {\n  const sr = c.series;\n  const cur = sr[sr.length - 1];\n  const prev = cur ? entryAt(sr, shiftDate(cur.date, -7)) : undefined;\n  const host = c.domain.split('/')[0];\n  const clicksPct = c.clicksPrev30 ? Math.round(((c.clicks30 - c.clicksPrev30) / c.clicksPrev30) * 100) : null;\n  return {\n    c, cur, prev, host, clicksPct,\n    visibility: cur?.visibility ?? -1,\n    top10: cur?.top10 ?? -1,\n    avg: cur?.avg ?? 999,\n    clicks: c.clicks30 ?? -1,\n    moves: c.up - c.down,\n  };\n}\n\nfunction renderOverview() {\n  const list = state.overview || [];\n  const rows = list.map(overviewRow);\n  const { key, dir } = state.ovSort;\n  rows.sort((a, b) => key === 'name'\n    ? a.c.name.localeCompare(b.c.name, 'he') * dir\n    : ((key === 'avg' ? a[key] - b[key] : b[key] - a[key]) || a.c.name.localeCompare(b.c.name, 'he')) * dir);\n\n  const withData = rows.filter((r) => r.cur);\n  const avgVis = withData.length ? (withData.reduce((s, r) => s + r.cur.visibility, 0) / withData.length).toFixed(1) + '%' : '—';\n  $('ov-kpis').innerHTML = [\n    ['לקוחות', list.length, ''],\n    ['ביטויים במעקב', fmtNum(list.reduce((s, c) => s + c.keywords, 0)), ''],\n    ['נראות ממוצעת', avgVis, ''],\n    ['ביטויים בטופ 10', fmtNum(withData.reduce((s, r) => s + r.cur.top10, 0)), ''],\n    ['עלו מהבדיקה הקודמת', fmtNum(list.reduce((s, c) => s + c.up, 0)), 'up'],\n    ['ירדו מהבדיקה הקודמת', fmtNum(list.reduce((s, c) => s + c.down, 0)), 'down'],\n  ].map(([l, v, cl]) => `<div class=\"kpi ${cl}\"><div class=\"label\">${l}</div><div class=\"value\">${v}</div></div>`).join('');\n\n  const metric = (value, spark, chip, none) => `<div class=\"metric\"><span class=\"v${none ? ' none' : ''}\">${value}</span>${spark}${chip}</div>`;\n  $('ov-rows').innerHTML = rows.map((r) => {\n    const sr = r.c.series, cur = r.cur, prev = r.prev;\n    return `<tr data-client=\"${r.c.id}\" tabindex=\"0\">\n      <td><div class=\"ov-client\">\n        <img src=\"https://www.google.com/s2/favicons?domain=${encodeURIComponent(r.host)}&sz=32\" alt=\"\" loading=\"lazy\" onerror=\"this.outerHTML='<span class=&quot;fav-fallback&quot;>${esc(r.c.name.slice(0, 1))}</span>'\">\n        <div><b>${esc(r.c.name)}${r.c.gscError ? '<span class=\"warn-dot\" title=\"אין גישה ל-Search Console\">●</span>' : ''}</b><span class=\"d\">${esc(r.c.domain)}</span></div>\n      </div></td>\n      <td data-label=\"נראות\">${cur ? metric(cur.visibility.toFixed(cur.visibility < 10 ? 2 : 1) + '%', miniSpark(sr.map((e) => e.visibility)), changeChip(cur.visibility, prev?.visibility, { suffix: '%', digits: 2 })) : metric('—', '', '', true)}</td>\n      <td data-label=\"בטופ 10\">${cur ? metric(cur.top10, miniSpark(sr.map((e) => e.top10)), changeChip(cur.top10, prev?.top10, { digits: 0 })) : metric('—', '', '', true)}</td>\n      <td data-label=\"מיקום ממוצע\">${cur && cur.avg !== null ? metric(fmtPos(cur.avg), miniSpark(sr.map((e) => e.avg), true), changeChip(cur.avg, prev?.avg, { lowerIsBetter: true })) : metric(cur ? '&gt;' + (state.status?.maxDepth || 50) : '—', '', '', true)}</td>\n      <td data-label=\"קליקים (30 יום)\">${r.c.clicks30 !== null ? metric(fmtNum(r.c.clicks30), '', r.clicksPct !== null ? changeChip(r.clicksPct, 0, { suffix: '%', digits: 0 }) : '') : metric('—', '', '', true)}</td>\n      <td class=\"num\" data-label=\"ביטויים\">${fmtNum(r.c.keywords)}</td>\n      <td data-label=\"מהבדיקה הקודמת\"><div class=\"metric\">${r.c.up ? `<span class=\"chg up\">▲ ${r.c.up}</span>` : ''}${r.c.down ? `<span class=\"chg down\">▼ ${r.c.down}</span>` : ''}${!r.c.up && !r.c.down ? '<span class=\"chg flat\">—</span>' : ''}</div></td>\n    </tr>`;\n  }).join('');\n  $('ov-empty').hidden = list.length > 0;\n  document.querySelectorAll('th[data-ovsort]').forEach((th) => {\n    th.setAttribute('aria-sort', th.dataset.ovsort === key ? (dir === 1 ? 'ascending' : 'descending') : 'none');\n  });\n}\n\nfunction showView(view, clientId) {\n  state.view = view;\n  $('overview-view').hidden = view !== 'all';\n  $('detail-view').hidden = view === 'all';\n  $('detail-controls').hidden = view === 'all';\n  $('tab-all').setAttribute('aria-current', view === 'all' ? 'page' : 'false');\n  $('tab-client').setAttribute('aria-current', view === 'all' ? 'false' : 'page');\n  $('tab-client').textContent = state.client && view !== 'all' ? state.client.name : 'לקוח';\n  const hash = view === 'all' ? '#all' : `#client-${clientId ?? state.client?.id ?? ''}`;\n  if (location.hash !== hash) history.replaceState(null, '', hash);\n  if (view === 'all') {\n    call('GET', '/api/overview').then((o) => { state.overview = o; renderOverview(); }).catch(() => {});\n  }\n}\n\n// ---------- טעינה ----------\n\nasync function loadClients(selectId) {\n  [state.clients, state.reports] = await Promise.all([call('GET', '/api/clients'), call('GET', '/api/reports')]);\n  const sel = $('client');\n  sel.innerHTML = state.clients.map((c) => `<option value=\"${c.id}\">${esc(c.name)}</option>`).join('');\n  sel.hidden = !state.clients.length;\n  let saved = selectId;\n  if (saved == null) { try { saved = localStorage.getItem('rt-client'); } catch {} }\n  if (saved != null && state.clients.some((c) => String(c.id) === String(saved))) sel.value = String(saved);\n  await loadClient(sel.value);\n}\n\nasync function loadClient(id) {\n  state.client = state.clients.find((c) => String(c.id) === String(id)) || null;\n  const [data, status] = await Promise.all([\n    state.client ? call('GET', `/api/clients/${state.client.id}/rankings`) : { keywords: {} },\n    call('GET', '/api/status'),\n  ]);\n  state.data = data;\n  state.status = status;\n  if (state.client) { try { localStorage.setItem('rt-client', state.client.id); } catch {} }\n  render();\n}\n\nfunction flash(el, text, isErr) {\n  el.textContent = text;\n  el.classList.toggle('err', !!isErr);\n  if (!isErr) setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, 3000);\n}\n\nfunction setEditing(on) {\n  state.editing = on;\n  $('client-form-title').textContent = on ? 'עריכת לקוח' : 'לקוח חדש';\n  $('c-save').textContent = on ? 'שמירה' : 'יצירת לקוח';\n  $('c-cancel').hidden = $('c-delete').hidden = !on;\n  $('c-name').value = on ? state.client.name : '';\n  $('c-domain').value = on ? state.client.domain : '';\n  render();\n}\n\nfunction init() {\n  $('client').addEventListener('change', (e) => { setEditing(false); loadClient(e.target.value).then(() => showView('client')); });\n  $('tab-all').addEventListener('click', () => showView('all'));\n  $('tab-client').addEventListener('click', () => showView('client'));\n  $('ov-add').addEventListener('click', () => { setEditing(false); showView('client'); $('c-name').scrollIntoView({ block: 'center' }); $('c-name').focus(); });\n  const openClient = (tr) => { $('client').value = tr.dataset.client; setEditing(false); loadClient(tr.dataset.client).then(() => { showView('client'); scrollTo(0, 0); }); };\n  $('ov-rows').addEventListener('click', (e) => { const tr = e.target.closest('tr[data-client]'); if (tr) openClient(tr); });\n  $('ov-rows').addEventListener('keydown', (e) => { const tr = e.target.closest('tr[data-client]'); if (tr && e.key === 'Enter') openClient(tr); });\n  document.querySelectorAll('th[data-ovsort]').forEach((th) => th.addEventListener('click', () => {\n    const key = th.dataset.ovsort;\n    state.ovSort = { key, dir: state.ovSort.key === key ? -state.ovSort.dir : 1 };\n    renderOverview();\n  }));\n  $('search').addEventListener('input', (e) => { state.query = e.target.value.trim(); render(); });\n  document.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {\n    const key = th.dataset.sort;\n    state.sort = { key, dir: state.sort.key === key ? -state.sort.dir : 1 };\n    render();\n  }));\n  $('csv').addEventListener('click', exportCsv);\n  $('print').addEventListener('click', printReport);\n\n  $('scan').addEventListener('click', async () => {\n    const btn = $('scan');\n    btn.disabled = true; btn.textContent = 'מעדכנת...';\n    try {\n      const r = await call('POST', '/api/scan');\n      if (r.error) alert(r.error);\n      await loadClient(state.client?.id);\n    } catch (err) { alert(err.message); }\n    btn.textContent = 'עדכון עכשיו';\n    renderStatus();\n  });\n\n  $('rows').addEventListener('click', async (e) => {\n    const id = e.target.closest('[data-del]')?.dataset.del;\n    if (!id) return;\n    const kw = state.client.keywords.find((k) => String(k.id) === id);\n    if (!confirm(`להסיר את \"${kw.keyword}\"? כל ההיסטוריה של הביטוי תימחק.`)) return;\n    await call('DELETE', `/api/keywords/${id}`);\n    await loadClients(state.client.id);\n  });\n\n  $('kw-form').addEventListener('submit', async (e) => {\n    e.preventDefault();\n    const keywords = $('kw-input').value.split('\\n').map((s) => s.trim()).filter(Boolean);\n    if (!keywords.length) return;\n    try {\n      await call('POST', `/api/clients/${state.client.id}/keywords`, { keywords });\n      $('kw-input').value = '';\n      flash($('kw-msg'), `נוספו ${keywords.length} ביטויים`);\n      await loadClients(state.client.id);\n    } catch (err) { flash($('kw-msg'), err.message, true); }\n  });\n\n  $('client-form').addEventListener('submit', async (e) => {\n    e.preventDefault();\n    const payload = { name: $('c-name').value, domain: $('c-domain').value };\n    try {\n      if (state.editing) {\n        await call('PATCH', `/api/clients/${state.client.id}`, payload);\n        setEditing(false);\n        await loadClients(state.client.id);\n        flash($('c-msg'), 'נשמר');\n      } else {\n        const { id } = await call('POST', '/api/clients', payload);\n        $('c-name').value = $('c-domain').value = '';\n        await loadClients(id);\n        flash($('c-msg'), 'הלקוח נוצר. עכשיו מוסיפים ביטויים.');\n        $('kw-input').focus();\n      }\n    } catch (err) { flash($('c-msg'), err.message, true); }\n  });\n  $('c-edit-current').addEventListener('click', () => setEditing(true));\n  $('c-cancel').addEventListener('click', () => setEditing(false));\n  $('c-delete').addEventListener('click', async () => {\n    if (!confirm(`למחוק את \"${state.client.name}\" עם כל הביטויים וההיסטוריה שלו? אי אפשר לשחזר.`)) return;\n    await call('DELETE', `/api/clients/${state.client.id}`);\n    setEditing(false);\n    await loadClients();\n  });\n\n  const m = location.hash.match(/^#client-(\\d+)/);\n  loadClients(m ? m[1] : undefined)\n    .then(() => showView(m ? 'client' : 'all'))\n    .catch((err) => { showView('client'); $('empty').hidden = false; $('empty').textContent = 'שגיאה בטעינה: ' + err.message; });\n}\n\n// ---------- מצב הדגמה (?demo=1): נתונים מומצאים, בלי שרת ----------\n\nlet demo;\nfunction demoApi(method, path, body) {\n  if (!demo) {\n    const today = new Date().toISOString().slice(0, 10);\n    const mk = (id, name, domain, kws) => ({ id, name, domain, backfilled: 1, gsc_error: null, keywords: kws.map((k, i) => ({ id: id * 100 + i, keyword: k })) });\n    demo = { clients: [\n      mk(1, 'HODIGITAL', 'hodigital.co.il', ['שיווק דיגיטלי 360', 'שיווק דיגיטלי לבעלי עסקים', 'קידום אתרים לעסקים קטנים', 'ניהול קמפיינים בגוגל']),\n      mk(2, 'מסעדת הגפן', 'hagefen.co.il', ['מסעדה כשרה בתל אביב', 'מסעדת שף בצפון']),\n    ], rankings: {} };\n    for (const c of demo.clients) for (const k of c.keywords) {\n      let p = 4 + ((k.id * 7) % 40);\n      demo.rankings[k.id] = Array.from({ length: 75 }, (_, d) => {\n        p = Math.max(1, Math.min(60, p + Math.round((Math.random() - 0.55) * 4)));\n        const pos = p > 50 ? null : Math.round((p + Math.random()) * 10) / 10;\n        const impressions = pos ? Math.round(400 / pos) : 0;\n        return { date: shiftDate(today, d - 74), position: pos, url: pos ? `https://${c.domain}/${k.id % 2 ? 'services/' : ''}` : null, impressions, clicks: Math.round(impressions * (pos && pos < 4 ? 0.2 : 0.03)) };\n      });\n    }\n  }\n  let m;\n  if (path === '/api/clients' && method === 'GET') return structuredClone(demo.clients);\n  if (path === '/api/overview') {\n    const CTR = [0, 31.7, 24.7, 18.7, 13.6, 9.5, 6.2, 4.2, 3.1, 3.0, 2.5];\n    const ctr = (p) => p === null ? 0 : p <= 10 ? CTR[Math.max(1, Math.round(p))] : p <= 20 ? 1 : 0;\n    return demo.clients.map((c, ci) => {\n      const hs = c.keywords.map((k) => demo.rankings[k.id].map((e) => ({ ...e, position: e.position && Math.round(e.position) })));\n      const series = hs[0].slice(-31).map((e, i, arr) => {\n        const idx = hs[0].length - arr.length + i;\n        const ps = hs.map((h) => h[idx].position);\n        const ranked = ps.filter((p) => p !== null);\n        return {\n          date: e.date,\n          visibility: Math.round((ps.reduce((s, p) => s + ctr(p), 0) / (ps.length * 31.7)) * 1000) / 10,\n          top3: ranked.filter((p) => p <= 3).length,\n          top10: ranked.filter((p) => p <= 10).length,\n          avg: ranked.length ? Math.round((ranked.reduce((a, b) => a + b, 0) / ranked.length) * 10) / 10 : null,\n        };\n      });\n      const sumClicks = (from, to) => c.keywords.reduce((s, k) => s + demo.rankings[k.id].slice(from, to).reduce((a, e) => a + e.clicks, 0), 0);\n      return { id: c.id, name: c.name, domain: c.domain, gscError: null, keywords: c.keywords.length, source: 'serp', series,\n        clicks30: sumClicks(-30), clicksPrev30: sumClicks(-60, -30), up: ci + 1, down: 1 };\n    });\n  }\n  if (path === '/api/reports') return [\n    { id: 2, created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), status: 'ok', summary: 'כל 2 הלקוחות עודכנו היום, הנתונים מ-Search Console עדכניים.\\nבולט: \"מסעדת שף בצפון\" עלה 3 מקומות השבוע.' },\n    { id: 1, created_at: new Date(Date.now() - 864e5).toISOString().slice(0, 19).replace('T', ' '), status: 'ok', summary: 'כל 2 הלקוחות עודכנו היום.' },\n  ];\n  if (path === '/api/status') return { today: '', syncHour: 7, maxDepth: 50, serperConfigured: true, serp: { total: 6, done: 6, failed: 0 }, configured: true, serviceAccountEmail: 'demo@example.iam.gserviceaccount.com' };\n  if ((m = path.match(/\\/api\\/clients\\/(\\d+)\\/rankings/))) {\n    const c = demo.clients.find((c) => c.id === Number(m[1]));\n    const keywords = {}, serp = {};\n    c.keywords.forEach((k) => {\n      keywords[k.id] = demo.rankings[k.id] || [];\n      serp[k.id] = keywords[k.id].map((e) => ({ date: e.date, position: e.position && Math.round(e.position), url: e.url }));\n    });\n    return { updated: shiftDate(new Date().toISOString().slice(0, 10), -3), keywords, serp, serpUpdated: new Date().toISOString().slice(0, 10) };\n  }\n  throw new Error('במצב הדגמה אי אפשר לשנות נתונים');\n}\n\ninit();\n</script>\n</body>\n</html>\n";
// אייקונים לאפליקציה בטלפון (נוצרו מהלוגו של האתר), בפורמט PNG ב-base64
const ICON_180 = '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';
const ICON_192 = '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';
const ICON_512 = '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';


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

// ---------- כניסה ----------
// אחרי הזנת הסיסמה נשמרת עוגייה לשנה, כדי שבטלפון (גם כאפליקציה במסך הבית) לא יבקשו סיסמה בכל פתיחה.
// ערך העוגייה נגזר מהסיסמה, כך ששינוי הסיסמה ב-Cloudflare מנתק את כל המכשירים.

const COOKIE = 'rt_session';
const SESSION_DAYS = 365;

function safeEqual(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function sessionToken(env) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.DASHBOARD_PASSWORD), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('hodigital-ranks-session'));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function authorized(request, env) {
  if (!env.DASHBOARD_PASSWORD) return false;
  const cookie = (request.headers.get('Cookie') || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (cookie && safeEqual(cookie.slice(COOKIE.length + 1), await sessionToken(env))) return true;
  // תמיכה גם בכניסה הישנה (חלון הסיסמה של הדפדפן)
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  let decoded;
  try { decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0))); } catch { return false; }
  return safeEqual(decoded.slice(decoded.indexOf(':') + 1), env.DASHBOARD_PASSWORD);
}

const loginPage = (error) => `<!DOCTYPE html>
<html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow"><title>כניסה | מעקב ביטויים</title>
<link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/icon-180.png"><link rel="icon" href="/icon-192.png">
<meta name="theme-color" content="#0c0a10"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="מעקב ביטויים">
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0c0a10;color:#f5f4f7;font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif}
form{width:min(340px,calc(100% - 32px));background:#15121c;border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:28px 22px;text-align:center}
img{width:64px;height:64px;border-radius:14px}
h1{font-size:20px;margin:14px 0 4px}p{color:#a49eb2;font-size:14px;margin:0 0 18px}
input,button{width:100%;box-sizing:border-box;font:inherit;font-size:16px;border-radius:10px;padding:12px}
input{background:#1c1826;color:#f5f4f7;border:1px solid rgba(255,255,255,.12);margin-bottom:12px}
button{background:#7b61ff;color:#fff;border:0;font-weight:600;cursor:pointer}
.err{color:#ff5c72;font-size:14px;margin-bottom:12px}
</style></head><body>
<form method="post" action="/login">
<img src="/icon-192.png" alt=""><h1>מעקב ביטויים</h1><p>HODIGITAL</p>
${error ? '<div class="err">סיסמה שגויה, נסי שוב</div>' : ''}
<input type="password" name="password" placeholder="סיסמה" autocomplete="current-password" required autofocus>
<button type="submit">כניסה</button>
</form></body></html>`;

const MANIFEST = JSON.stringify({
  name: 'מעקב ביטויים · HODIGITAL',
  short_name: 'מעקב ביטויים',
  lang: 'he',
  dir: 'rtl',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#0c0a10',
  theme_color: '#0c0a10',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
});

const ICONS = { '/icon-180.png': ICON_180, '/icon-192.png': ICON_192, '/icon-512.png': ICON_512 };
const png = (b64) => new Response(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), {
  headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800' },
});
const html = (body, status = 200, extra = {}) => new Response(body, {
  status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store', ...extra },
});

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;

    // קבצים ציבוריים שהטלפון צריך כדי להציג אייקון ושם לפני הכניסה
    if (ICONS[path]) return png(ICONS[path]);
    if (path === '/manifest.webmanifest') {
      return new Response(MANIFEST, { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
    }

    if (path === '/login' && request.method === 'POST') {
      const form = await request.formData().catch(() => null);
      const password = String(form?.get('password') || '');
      if (!env.DASHBOARD_PASSWORD || !safeEqual(password, env.DASHBOARD_PASSWORD)) return html(loginPage(true), 401);
      return new Response(null, {
        status: 303,
        headers: {
          Location: '/',
          'Set-Cookie': `${COOKIE}=${await sessionToken(env)}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    if (path === '/logout') {
      return new Response(null, { status: 303, headers: { Location: '/login', 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
    }

    if (!(await authorized(request, env))) {
      if (path.startsWith('/api/')) return bad('נדרשת כניסה', 401);
      return html(loginPage(false));
    }
    if (path === '/login') return new Response(null, { status: 303, headers: { Location: '/' } });
    if (path.startsWith('/api/')) {
      try { return await api(request, env, path); }
      catch (err) { console.error(err); return bad('שגיאת שרת: ' + err.message, 500); }
    }
    if (path === '/' || path === '/index.html') return html(dashboard);
    return new Response('לא נמצא', { status: 404 });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runBatch(env).then((r) => console.log('batch', JSON.stringify(r))));
  },
};
