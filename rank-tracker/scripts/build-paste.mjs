// בונה קובץ אחד (dist/worker.js) להדבקה בעורך של Cloudflare, עם הדשבורד מוטמע בתוכו
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const src = await readFile(new URL('../src/index.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../src/dashboard.html', import.meta.url), 'utf8');
const importLine = "import dashboard from './dashboard.html';";
if (!src.includes(importLine)) throw new Error('import line not found');
const icons = (await readFile(new URL('../src/icons.js', import.meta.url), 'utf8')).replace(/^export /gm, '');
const iconsImport = "import { ICON_180, ICON_192, ICON_512 } from './icons.js';";
if (!src.includes(iconsImport)) throw new Error('icons import not found');
const out = src.replace(importLine, `const dashboard = ${JSON.stringify(html)};`).replace(iconsImport, icons);
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/worker.js', import.meta.url), out);
console.log('dist/worker.js', out.length, 'chars');
