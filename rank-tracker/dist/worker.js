const dashboard = "<!DOCTYPE html>\n<html lang=\"he\" dir=\"rtl\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<meta name=\"robots\" content=\"noindex, nofollow\">\n<title>מעקב ביטויים | HODIGITAL</title>\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n<link href=\"https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Hebrew:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">\n<style>\n:root{\n  --ink:#0c0a10;\n  --panel:#15121c;\n  --panel-2:#1c1826;\n  --line:rgba(255,255,255,.09);\n  --text:#f5f4f7;\n  --muted:#a49eb2;\n  --violet:#7b61ff;\n  --uv:#c4b8ff;\n  --up:#2bff88;\n  --up-bg:rgba(43,255,136,.12);\n  --down:#ff5c72;\n  --down-bg:rgba(255,92,114,.13);\n  --flat:#a49eb2;\n  --sans:'IBM Plex Sans Hebrew',system-ui,-apple-system,'Segoe UI',Arial,sans-serif;\n  --mono:ui-monospace,'SF Mono','Cascadia Mono',Menlo,Consolas,monospace;\n}\n*{box-sizing:border-box}\n[hidden]{display:none!important}\nbody{margin:0;background:var(--ink);color:var(--text);font-family:var(--sans);font-size:15px;line-height:1.5}\na{color:var(--uv)}\n.wrap{max-width:1200px;margin:0 auto;padding:0 16px}\n\nheader{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;padding:20px 0 16px}\n.brand{font-weight:700;font-size:20px;letter-spacing:.02em}\n.brand span{color:var(--violet)}\n.updated{color:var(--muted);font-size:13px}\n.controls{margin-inline-start:auto;display:flex;flex-wrap:wrap;gap:8px}\nselect,input,button,textarea{font:inherit;color:var(--text);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:7px 12px}\ntextarea{width:100%;min-height:110px;resize:vertical}\nbutton{cursor:pointer;background:var(--violet);border-color:var(--violet);font-weight:600}\nbutton.ghost{background:var(--panel-2);border-color:var(--line)}\nbutton.danger{background:transparent;border-color:var(--down);color:var(--down)}\nbutton:disabled{opacity:.5;cursor:default}\nbutton:hover:not(:disabled){filter:brightness(1.1)}\n:focus-visible{outline:2px solid var(--uv);outline-offset:2px}\n\n.ticker{overflow:hidden;border-block:1px solid var(--line);background:var(--panel);white-space:nowrap;font-family:var(--mono);font-size:13px}\n.ticker-track{display:inline-flex;gap:32px;padding:9px 0;animation:tick 60s linear infinite}\n.ticker:hover .ticker-track{animation-play-state:paused}\n@keyframes tick{from{transform:translateX(0)}to{transform:translateX(50%)}}\n@media (prefers-reduced-motion:reduce){.ticker-track{animation:none}}\n.ticker-item b{font-family:var(--sans);font-weight:500;color:var(--text)}\n\n.statusbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin-top:16px;color:var(--muted);font-size:13px}\n.statusbar .warn{color:var(--down)}\n.statusbar button{margin-inline-start:auto;padding:5px 12px;font-size:13px}\n\n.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:16px 0 20px}\n.kpi{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px}\n.kpi .label{color:var(--muted);font-size:13px}\n.kpi .value{font-size:28px;font-weight:700;font-family:var(--mono)}\n.kpi.up .value{color:var(--up)}\n.kpi.down .value{color:var(--down)}\n\n.table-wrap{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow-x:auto}\ntable{width:100%;border-collapse:collapse;min-width:860px}\nth,td{padding:11px 14px;text-align:right;border-bottom:1px solid var(--line);vertical-align:middle}\nth{font-size:12px;color:var(--muted);font-weight:500;user-select:none;white-space:nowrap}\nth[data-sort]{cursor:pointer}\nth[aria-sort=\"ascending\"]::after{content:\" ▲\"}\nth[aria-sort=\"descending\"]::after{content:\" ▼\"}\ntr:last-child td{border-bottom:0}\ntbody tr:hover{background:var(--panel-2)}\n.kw{font-weight:600;min-width:150px}\n.pos{font-family:var(--mono);font-size:18px;font-weight:700}\n.pos.none{font-family:var(--sans);font-size:13px;color:var(--muted);font-weight:400}\n.chg{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);font-weight:600;padding:2px 9px;border-radius:999px;font-size:13px;white-space:nowrap}\n.chg.up{color:var(--up);background:var(--up-bg)}\n.chg.down{color:var(--down);background:var(--down-bg)}\n.chg.flat{color:var(--flat)}\n.lp{max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:ltr;text-align:left;font-size:13px}\n.best{font-family:var(--mono);color:var(--muted)}\n.del{background:none;border:0;color:var(--muted);padding:2px 6px;font-size:16px;line-height:1}\n.del:hover{color:var(--down)}\nsvg.spark{display:block}\n\n.empty{padding:40px 20px;text-align:center;color:var(--muted)}\n\n.panel{margin:20px 0;padding:16px;background:var(--panel);border:1px solid var(--line);border-radius:12px}\n.panel h2{font-size:16px;margin:0 0 12px}\n.row{display:flex;flex-wrap:wrap;align-items:center;gap:10px}\n.row h2{margin:0;margin-inline-end:auto}\n.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}\n.field{display:flex;flex-direction:column;gap:4px;flex:1;min-width:160px}\n.field span{font-size:12px;color:var(--muted)}\n.hint{font-size:12px;color:var(--muted);margin:6px 0 0}\n.msg{font-size:13px;color:var(--up);min-height:1.2em}\n.msg.err{color:var(--down)}\n.domain{direction:ltr}\n\n#report{display:none}\n\n@media print{\n  body{background:#fff;color:#0c0a10;font-size:12px}\n  .screen{display:none!important}\n  #report{display:block;padding:0}\n  #report h1{font-size:22px;margin:0 0 4px}\n  #report .sub{color:#5f5a69;margin-bottom:18px}\n  #report table{min-width:0;font-size:12px}\n  #report th{color:#5f5a69}\n  #report th,#report td{border-bottom:1px solid #e3e0e8;padding:7px 8px}\n  #report .chg.up{color:#00863f;background:#e3f9ec}\n  #report .chg.down{color:#c4142d;background:#fde8eb}\n  #report .chg.flat{color:#5f5a69}\n  #report .lp{max-width:220px}\n  #report .summary{display:flex;gap:24px;margin-bottom:16px}\n  #report .summary b{font-size:18px;display:block}\n  #report footer{margin-top:20px;color:#5f5a69;font-size:11px}\n}\n</style>\n</head>\n<body>\n<div class=\"screen\">\n  <div class=\"wrap\">\n    <header>\n      <div class=\"brand\">HO<span>DIGITAL</span> · מעקב ביטויים</div>\n      <div class=\"updated\" id=\"updated\"></div>\n      <div class=\"controls\">\n        <select id=\"client\" aria-label=\"בחירת לקוח\"></select>\n        <input id=\"search\" type=\"search\" placeholder=\"חיפוש ביטוי\" aria-label=\"חיפוש ביטוי\">\n      </div>\n    </header>\n  </div>\n  <div class=\"ticker\" id=\"ticker\" aria-hidden=\"true\"><div class=\"ticker-track\" id=\"ticker-track\"></div></div>\n  <main class=\"wrap\">\n    <div class=\"statusbar\">\n      <span id=\"status\"></span>\n      <button id=\"scan\" type=\"button\" class=\"ghost\">סריקה עכשיו</button>\n    </div>\n    <section class=\"kpis\" id=\"kpis\"></section>\n    <div class=\"table-wrap\">\n      <table>\n        <thead>\n          <tr>\n            <th data-sort=\"keyword\">ביטוי</th>\n            <th data-sort=\"position\">מיקום</th>\n            <th data-sort=\"day\">שינוי יומי</th>\n            <th data-sort=\"week\">7 ימים</th>\n            <th data-sort=\"month\">30 ימים</th>\n            <th>מגמה (30 יום)</th>\n            <th data-sort=\"best\">שיא</th>\n            <th>דף נחיתה</th>\n            <th><span hidden>מחיקה</span></th>\n          </tr>\n        </thead>\n        <tbody id=\"rows\"></tbody>\n      </table>\n      <div class=\"empty\" id=\"empty\" hidden></div>\n    </div>\n\n    <section class=\"panel row\" id=\"export-panel\">\n      <h2>דוח חודשי ללקוח</h2>\n      <select id=\"month\" aria-label=\"בחירת חודש\"></select>\n      <button id=\"csv\" type=\"button\">ייצוא לאקסל (CSV)</button>\n      <button id=\"print\" type=\"button\" class=\"ghost\">דוח להדפסה / PDF</button>\n    </section>\n\n    <section class=\"panel grid2\">\n      <form id=\"kw-form\">\n        <h2>הוספת ביטויים ל<span id=\"kw-client-name\">לקוח</span></h2>\n        <textarea id=\"kw-input\" placeholder=\"ביטוי אחד בכל שורה\" aria-label=\"ביטויים להוספה\"></textarea>\n        <div class=\"row\" style=\"margin-top:8px\">\n          <button type=\"submit\">הוספה</button>\n          <span class=\"msg\" id=\"kw-msg\"></span>\n        </div>\n        <p class=\"hint\">ביטוי חדש ייסרק בריצה הקרובה (תוך 10 דקות), או מיד בלחיצה על \"סריקה עכשיו\".</p>\n      </form>\n      <form id=\"client-form\">\n        <h2 id=\"client-form-title\">לקוח חדש</h2>\n        <div class=\"row\">\n          <label class=\"field\"><span>שם הלקוח</span><input id=\"c-name\" required></label>\n          <label class=\"field\"><span>דומיין</span><input id=\"c-domain\" class=\"domain\" placeholder=\"example.co.il\" required></label>\n        </div>\n        <div class=\"row\" style=\"margin-top:10px\">\n          <button type=\"submit\" id=\"c-save\">יצירת לקוח</button>\n          <button type=\"button\" class=\"ghost\" id=\"c-edit-current\">עריכת הלקוח הנוכחי</button>\n          <button type=\"button\" class=\"ghost\" id=\"c-cancel\" hidden>ביטול</button>\n          <button type=\"button\" class=\"danger\" id=\"c-delete\" hidden>מחיקת לקוח</button>\n          <span class=\"msg\" id=\"c-msg\"></span>\n        </div>\n        <p class=\"hint\">דומיין בלי https ובלי www. תתי-דומיינים נספרים אוטומטית. אפשר גם דומיין עם נתיב, למשל user.github.io/site.</p>\n      </form>\n    </section>\n  </main>\n</div>\n<div id=\"report\"></div>\n\n<script>\nconst DEMO = new URLSearchParams(location.search).has('demo');\nconst $ = (id) => document.getElementById(id);\nconst state = { clients: [], client: null, data: { keywords: {} }, status: null, sort: { key: 'position', dir: 1 }, query: '', editing: false };\n\nconst esc = (s) => String(s ?? '').replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c]));\nconst fmtDate = (d) => d ? d.split('-').reverse().join('/') : '';\nconst monthName = (ym) => new Date(ym + '-01T12:00:00').toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });\nconst maxDepth = () => state.status?.maxDepth || 50;\nconst prettyUrl = (u) => { try { return decodeURI(u.replace(/^https?:\\/\\/(www\\.)?/, '')); } catch { return u; } };\n\nasync function call(method, path, body) {\n  if (DEMO) return demoApi(method, path, body);\n  const res = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });\n  const data = await res.json().catch(() => ({}));\n  if (!res.ok) throw new Error(data.error || 'שגיאה ' + res.status);\n  return data;\n}\n\n// שינוי במיקום: מספר חיובי = עלייה בדירוג (מספר המיקום ירד)\nfunction delta(prev, cur) {\n  if (prev === undefined) return { kind: 'flat', text: '—', value: 0 };\n  const p = prev?.position ?? null, c = cur?.position ?? null;\n  if (p === null && c === null) return { kind: 'flat', text: '—', value: 0 };\n  if (p === null) return { kind: 'up', text: '▲ חדש', value: 1000 };\n  if (c === null) return { kind: 'down', text: '▼ יצא', value: -1000 };\n  const v = p - c;\n  if (v > 0) return { kind: 'up', text: '▲ ' + v, value: v };\n  if (v < 0) return { kind: 'down', text: '▼ ' + -v, value: v };\n  return { kind: 'flat', text: '0', value: 0 };\n}\n\n// הרשומה האחרונה שתאריכה לפני או בדיוק ב-date\nfunction entryAt(history, date) {\n  let found;\n  for (const e of history) { if (e.date <= date) found = e; else break; }\n  return found;\n}\n\nfunction shiftDate(date, days) {\n  const d = new Date(date + 'T12:00:00Z');\n  d.setUTCDate(d.getUTCDate() + days);\n  return d.toISOString().slice(0, 10);\n}\n\nfunction sparkline(history) {\n  const pts = history.slice(-30), depth = maxDepth();\n  const w = 110, h = 30, pad = 3;\n  if (pts.length < 2) return '<span class=\"best\">—</span>';\n  const x = (i) => w - pad - (i * (w - 2 * pad)) / (pts.length - 1); // RTL: היום בצד שמאל\n  const y = (p) => pad + ((Math.min(p, depth) - 1) * (h - 2 * pad)) / (depth - 1);\n  let d = '', open = false;\n  pts.forEach((e, i) => {\n    if (e.position === null) { open = false; return; }\n    d += (open ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(e.position).toFixed(1);\n    open = true;\n  });\n  const dd = delta(pts[0], pts[pts.length - 1]);\n  const color = dd.kind === 'up' ? 'var(--up)' : dd.kind === 'down' ? 'var(--down)' : 'var(--flat)';\n  return `<svg class=\"spark\" width=\"${w}\" height=\"${h}\" viewBox=\"0 0 ${w} ${h}\" role=\"img\" aria-label=\"מגמת מיקום\"><path d=\"${d}\" fill=\"none\" stroke=\"${color}\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>`;\n}\n\nconst chip = (d) => `<span class=\"chg ${d.kind}\">${d.text}</span>`;\n\nfunction buildRows() {\n  if (!state.client) return [];\n  const hist = state.data.keywords || {};\n  return state.client.keywords.map(({ id, keyword }) => {\n    const h = hist[id] || [];\n    const cur = h[h.length - 1];\n    const today = cur?.date;\n    const ranked = h.filter((e) => e.position !== null);\n    return {\n      id, keyword, history: h, cur,\n      position: cur?.position ?? null,\n      url: cur?.url || ranked[ranked.length - 1]?.url || null,\n      day: delta(h[h.length - 2], cur),\n      week: today ? delta(entryAt(h, shiftDate(today, -7)), cur) : delta(undefined),\n      month: today ? delta(entryAt(h, shiftDate(today, -30)), cur) : delta(undefined),\n      best: ranked.length ? Math.min(...ranked.map((e) => e.position)) : null,\n    };\n  });\n}\n\nfunction sortValue(r, key) {\n  switch (key) {\n    case 'keyword': return r.keyword;\n    case 'position': case 'best': return r[key] ?? 9999;\n    default: return -r[key].value;\n  }\n}\n\nfunction renderStatus() {\n  const s = state.status;\n  if (!s) { $('status').textContent = ''; return; }\n  const parts = [`נסרקו היום ${s.done} מתוך ${s.total} ביטויים`];\n  if (s.failed) parts.push(`<span class=\"warn\">${s.failed} נכשלו היום</span>`);\n  if (!s.serperConfigured) parts.push('<span class=\"warn\">חסר מפתח Serper, הסריקה לא פועלת</span>');\n  $('status').innerHTML = parts.join(' · ');\n  $('scan').disabled = !s.serperConfigured || s.done >= s.total;\n}\n\nfunction render() {\n  const rows = buildRows();\n  const depth = maxDepth();\n  const shown = rows\n    .filter((r) => r.keyword.includes(state.query))\n    .sort((a, b) => {\n      const va = sortValue(a, state.sort.key), vb = sortValue(b, state.sort.key);\n      return (typeof va === 'string' ? va.localeCompare(vb, 'he') : va - vb) * state.sort.dir;\n    });\n\n  $('updated').textContent = state.data.updated ? 'עודכן: ' + fmtDate(state.data.updated) : '';\n  $('kw-client-name').textContent = state.client ? state.client.name : 'לקוח';\n  $('kw-form').querySelector('button').disabled = !state.client;\n  $('c-edit-current').hidden = !state.client || state.editing;\n\n  const ranked = rows.filter((r) => r.position !== null);\n  const avg = ranked.length ? (ranked.reduce((s, r) => s + r.position, 0) / ranked.length).toFixed(1) : '—';\n  $('kpis').innerHTML = [\n    ['ביטויים במעקב', rows.length, ''],\n    ['מיקום ממוצע', avg, ''],\n    ['בטופ 3', ranked.filter((r) => r.position <= 3).length, ''],\n    ['בטופ 10', ranked.filter((r) => r.position <= 10).length, ''],\n    ['עלו היום', rows.filter((r) => r.day.kind === 'up').length, 'up'],\n    ['ירדו היום', rows.filter((r) => r.day.kind === 'down').length, 'down'],\n  ].map(([l, v, c]) => `<div class=\"kpi ${c}\"><div class=\"label\">${l}</div><div class=\"value\">${v}</div></div>`).join('');\n\n  const items = rows.filter((r) => r.cur).map((r) =>\n    `<span class=\"ticker-item\"><b>${esc(r.keyword)}</b> ${r.position ?? '—'} ${chip(r.day)}</span>`).join('');\n  $('ticker-track').innerHTML = items + items;\n  $('ticker').hidden = !items;\n\n  $('rows').innerHTML = shown.map((r) => `\n    <tr>\n      <td class=\"kw\">${esc(r.keyword)}</td>\n      <td>${r.position !== null ? `<span class=\"pos\">${r.position}</span>` : `<span class=\"pos none\">${r.cur ? 'לא בטופ ' + depth : 'טרם נסרק'}</span>`}</td>\n      <td>${chip(r.day)}</td>\n      <td>${chip(r.week)}</td>\n      <td>${chip(r.month)}</td>\n      <td>${sparkline(r.history)}</td>\n      <td class=\"best\">${r.best ?? '—'}</td>\n      <td class=\"lp\">${r.url ? `<a href=\"${esc(r.url)}\" target=\"_blank\" rel=\"noopener\" title=\"${esc(r.url)}\">${esc(prettyUrl(r.url))}</a>` : '—'}</td>\n      <td><button class=\"del\" type=\"button\" data-del=\"${r.id}\" title=\"הסרת הביטוי\" aria-label=\"הסרת ${esc(r.keyword)}\">×</button></td>\n    </tr>`).join('');\n\n  const empty = $('empty');\n  empty.hidden = rows.length > 0;\n  empty.textContent = !state.clients.length\n    ? 'עוד אין לקוחות. מוסיפים לקוח ראשון בטופס \"לקוח חדש\" למטה.'\n    : 'אין עדיין ביטויים ללקוח הזה. מוסיפים אותם בטופס למטה.';\n\n  document.querySelectorAll('th[data-sort]').forEach((th) => {\n    th.setAttribute('aria-sort', th.dataset.sort === state.sort.key ? (state.sort.dir === 1 ? 'ascending' : 'descending') : 'none');\n  });\n\n  renderStatus();\n  fillMonths();\n}\n\nfunction fillMonths() {\n  const months = new Set();\n  Object.values(state.data.keywords || {}).forEach((h) => h.forEach((e) => months.add(e.date.slice(0, 7))));\n  const list = [...months].sort().reverse();\n  const sel = $('month'), prev = sel.value;\n  sel.innerHTML = list.map((m) => `<option value=\"${m}\">${monthName(m)}</option>`).join('');\n  if (list.includes(prev)) sel.value = prev;\n  $('csv').disabled = $('print').disabled = !list.length;\n}\n\n// סיכום חודשי: מיקום בתחילת החודש (הסריקה האחרונה לפניו, או הראשונה בו) מול הסריקה האחרונה בחודש\nfunction monthReport(ym) {\n  const start = ym + '-01', end = ym + '-31';\n  return state.client.keywords.map(({ id, keyword }) => {\n    const h = state.data.keywords?.[id] || [];\n    const inMonth = h.filter((e) => e.date >= start && e.date <= end);\n    const first = entryAt(h, shiftDate(start, -1)) || inMonth[0];\n    const last = inMonth[inMonth.length - 1];\n    const ranked = inMonth.filter((e) => e.position !== null);\n    return {\n      keyword,\n      start: first?.position ?? null,\n      end: last?.position ?? null,\n      change: last ? delta(first, last) : delta(undefined),\n      best: ranked.length ? Math.min(...ranked.map((e) => e.position)) : null,\n      url: [...inMonth].reverse().find((e) => e.url)?.url || null,\n      scanned: !!last,\n    };\n  });\n}\n\nfunction exportCsv() {\n  const ym = $('month').value, depth = maxDepth();\n  const out = (p) => p ?? `מחוץ לטופ ${depth}`;\n  const lines = [['ביטוי', 'מיקום בתחילת החודש', 'מיקום בסוף החודש', 'שינוי', 'המיקום הטוב ביותר בחודש', 'דף נחיתה']];\n  monthReport(ym).filter((r) => r.scanned).forEach((r) => {\n    const change = r.change.kind === 'flat' ? '0' : r.change.text.replace('▲ ', '+').replace('▼ ', '-');\n    lines.push([r.keyword, out(r.start), out(r.end), change, r.best ?? '—', r.url ? prettyUrl(r.url) : '—']);\n  });\n  const csv = '﻿' + lines.map((l) => l.map((v) => `\"${String(v).replace(/\"/g, '\"\"')}\"`).join(',')).join('\\r\\n');\n  const a = document.createElement('a');\n  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));\n  a.download = `דוח מיקומים - ${state.client.name} - ${ym}.csv`;\n  a.click();\n  URL.revokeObjectURL(a.href);\n}\n\nfunction printReport() {\n  const ym = $('month').value, depth = maxDepth();\n  const rows = monthReport(ym).filter((r) => r.scanned);\n  const ups = rows.filter((r) => r.change.kind === 'up').length;\n  const top10 = rows.filter((r) => r.end !== null && r.end <= 10).length;\n  const out = (p) => p ?? `<span style=\"color:#5f5a69\">מחוץ לטופ ${depth}</span>`;\n  $('report').innerHTML = `\n    <h1>דוח מיקומים בגוגל · ${esc(state.client.name)}</h1>\n    <div class=\"sub\">${monthName(ym)} · ${esc(state.client.domain)}</div>\n    <div class=\"summary\">\n      <div><b>${rows.length}</b>ביטויים במעקב</div>\n      <div><b>${ups}</b>ביטויים שהשתפרו</div>\n      <div><b>${top10}</b>ביטויים בעמוד הראשון</div>\n    </div>\n    <table>\n      <thead><tr><th>ביטוי</th><th>תחילת החודש</th><th>סוף החודש</th><th>שינוי</th><th>שיא החודש</th><th>דף נחיתה</th></tr></thead>\n      <tbody>${rows.map((r) => `<tr><td class=\"kw\">${esc(r.keyword)}</td><td>${out(r.start)}</td><td><b>${out(r.end)}</b></td><td>${chip(r.change)}</td><td>${r.best ?? '—'}</td><td class=\"lp\">${r.url ? esc(prettyUrl(r.url)) : '—'}</td></tr>`).join('')}</tbody>\n    </table>\n    <footer>הופק על ידי HODIGITAL · הודיה ארנטרוי · 054-725-3007</footer>`;\n  const prevTitle = document.title;\n  document.title = `דוח מיקומים - ${state.client.name} - ${monthName(ym)}`;\n  window.print();\n  document.title = prevTitle;\n}\n\n// ---------- טעינה ----------\n\nasync function loadClients(selectId) {\n  state.clients = await call('GET', '/api/clients');\n  const sel = $('client');\n  sel.innerHTML = state.clients.map((c) => `<option value=\"${c.id}\">${esc(c.name)}</option>`).join('');\n  sel.hidden = !state.clients.length;\n  let saved = selectId;\n  if (saved == null) { try { saved = localStorage.getItem('rt-client'); } catch {} }\n  if (saved != null && state.clients.some((c) => String(c.id) === String(saved))) sel.value = String(saved);\n  await loadClient(sel.value);\n}\n\nasync function loadClient(id) {\n  state.client = state.clients.find((c) => String(c.id) === String(id)) || null;\n  const [data, status] = await Promise.all([\n    state.client ? call('GET', `/api/clients/${state.client.id}/rankings`) : { keywords: {} },\n    call('GET', '/api/status'),\n  ]);\n  state.data = data;\n  state.status = status;\n  if (state.client) { try { localStorage.setItem('rt-client', state.client.id); } catch {} }\n  render();\n}\n\nfunction flash(el, text, isErr) {\n  el.textContent = text;\n  el.classList.toggle('err', !!isErr);\n  if (!isErr) setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, 3000);\n}\n\nfunction setEditing(on) {\n  state.editing = on;\n  $('client-form-title').textContent = on ? 'עריכת לקוח' : 'לקוח חדש';\n  $('c-save').textContent = on ? 'שמירה' : 'יצירת לקוח';\n  $('c-cancel').hidden = $('c-delete').hidden = !on;\n  $('c-name').value = on ? state.client.name : '';\n  $('c-domain').value = on ? state.client.domain : '';\n  render();\n}\n\nfunction init() {\n  $('client').addEventListener('change', (e) => { setEditing(false); loadClient(e.target.value); });\n  $('search').addEventListener('input', (e) => { state.query = e.target.value.trim(); render(); });\n  document.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {\n    const key = th.dataset.sort;\n    state.sort = { key, dir: state.sort.key === key ? -state.sort.dir : 1 };\n    render();\n  }));\n  $('csv').addEventListener('click', exportCsv);\n  $('print').addEventListener('click', printReport);\n\n  $('scan').addEventListener('click', async () => {\n    const btn = $('scan');\n    btn.disabled = true; btn.textContent = 'סורקת...';\n    try {\n      const r = await call('POST', '/api/scan');\n      if (r.error) alert(r.error);\n      await loadClient(state.client?.id);\n    } catch (err) { alert(err.message); }\n    btn.textContent = 'סריקה עכשיו';\n    renderStatus();\n  });\n\n  $('rows').addEventListener('click', async (e) => {\n    const id = e.target.closest('[data-del]')?.dataset.del;\n    if (!id) return;\n    const kw = state.client.keywords.find((k) => String(k.id) === id);\n    if (!confirm(`להסיר את \"${kw.keyword}\"? כל ההיסטוריה של הביטוי תימחק.`)) return;\n    await call('DELETE', `/api/keywords/${id}`);\n    await loadClients(state.client.id);\n  });\n\n  $('kw-form').addEventListener('submit', async (e) => {\n    e.preventDefault();\n    const keywords = $('kw-input').value.split('\\n').map((s) => s.trim()).filter(Boolean);\n    if (!keywords.length) return;\n    try {\n      await call('POST', `/api/clients/${state.client.id}/keywords`, { keywords });\n      $('kw-input').value = '';\n      flash($('kw-msg'), `נוספו ${keywords.length} ביטויים`);\n      await loadClients(state.client.id);\n    } catch (err) { flash($('kw-msg'), err.message, true); }\n  });\n\n  $('client-form').addEventListener('submit', async (e) => {\n    e.preventDefault();\n    const payload = { name: $('c-name').value, domain: $('c-domain').value };\n    try {\n      if (state.editing) {\n        await call('PATCH', `/api/clients/${state.client.id}`, payload);\n        setEditing(false);\n        await loadClients(state.client.id);\n        flash($('c-msg'), 'נשמר');\n      } else {\n        const { id } = await call('POST', '/api/clients', payload);\n        $('c-name').value = $('c-domain').value = '';\n        await loadClients(id);\n        flash($('c-msg'), 'הלקוח נוצר. עכשיו מוסיפים ביטויים.');\n        $('kw-input').focus();\n      }\n    } catch (err) { flash($('c-msg'), err.message, true); }\n  });\n  $('c-edit-current').addEventListener('click', () => setEditing(true));\n  $('c-cancel').addEventListener('click', () => setEditing(false));\n  $('c-delete').addEventListener('click', async () => {\n    if (!confirm(`למחוק את \"${state.client.name}\" עם כל הביטויים וההיסטוריה שלו? אי אפשר לשחזר.`)) return;\n    await call('DELETE', `/api/clients/${state.client.id}`);\n    setEditing(false);\n    await loadClients();\n  });\n\n  loadClients().catch((err) => { $('empty').hidden = false; $('empty').textContent = 'שגיאה בטעינה: ' + err.message; });\n}\n\n// ---------- מצב הדגמה (?demo=1): נתונים מומצאים, בלי שרת ----------\n\nlet demo;\nfunction demoApi(method, path, body) {\n  if (!demo) {\n    const today = new Date().toISOString().slice(0, 10);\n    const mk = (id, name, domain, kws) => ({ id, name, domain, keywords: kws.map((k, i) => ({ id: id * 100 + i, keyword: k })) });\n    demo = { clients: [\n      mk(1, 'HODIGITAL', 'hodigital.co.il', ['שיווק דיגיטלי 360', 'שיווק דיגיטלי לבעלי עסקים', 'קידום אתרים לעסקים קטנים', 'ניהול קמפיינים בגוגל']),\n      mk(2, 'מסעדת הגפן', 'hagefen.co.il', ['מסעדה כשרה בתל אביב', 'מסעדת שף בצפון']),\n    ], rankings: {} };\n    for (const c of demo.clients) for (const k of c.keywords) {\n      let p = 4 + ((k.id * 7) % 40);\n      demo.rankings[k.id] = Array.from({ length: 75 }, (_, d) => {\n        p = Math.max(1, Math.min(60, p + Math.round((Math.random() - 0.55) * 4)));\n        return { date: shiftDate(today, d - 74), position: p > 50 ? null : p, url: p > 50 ? null : `https://${c.domain}/${k.id % 2 ? 'services/' : ''}` };\n      });\n    }\n  }\n  let m;\n  if (path === '/api/clients' && method === 'GET') return structuredClone(demo.clients);\n  if (path === '/api/status') return { today: '', total: 6, done: 6, failed: 0, serperConfigured: true, maxDepth: 50 };\n  if ((m = path.match(/\\/api\\/clients\\/(\\d+)\\/rankings/))) {\n    const c = demo.clients.find((c) => c.id === Number(m[1]));\n    const keywords = {};\n    c.keywords.forEach((k) => { keywords[k.id] = demo.rankings[k.id] || []; });\n    return { updated: new Date().toISOString().slice(0, 10), keywords };\n  }\n  throw new Error('במצב הדגמה אי אפשר לשנות נתונים');\n}\n\ninit();\n</script>\n</body>\n</html>\n";

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
