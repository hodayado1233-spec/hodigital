// Runs rank-check.mjs for every client in reports/data/clients.json that has
// a keywords.json. The demo client is skipped.
//
// Usage:
//   node rank-all.mjs <YYYY-MM> [--headed] [--mobile] [--pages=3]

import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const args = process.argv.slice(2);
const month = args.find(a => !a.startsWith('--'));
if (!/^\d{4}-\d{2}$/.test(month || '')) {
  console.error('Usage: node rank-all.mjs <YYYY-MM> [--headed] [--mobile] [--pages=3]');
  process.exit(1);
}
const flags = args.filter(a => a.startsWith('--'));

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, '..', 'reports', 'data');
const { clients } = JSON.parse(await readFile(path.join(dataDir, 'clients.json'), 'utf8'));

const failed = [];
for (const c of clients) {
  if (c.id === 'demo') continue;
  const hasKeywords = await access(path.join(dataDir, c.id, 'keywords.json')).then(() => true, () => false);
  if (!hasKeywords) { console.log(`\n# ${c.id}: no keywords.json, skipped`); continue; }
  console.log(`\n# ${c.id} (${c.domain})`);
  const r = spawnSync(process.execPath, [path.join(here, 'rank-check.mjs'), c.id, month, ...flags], { stdio: 'inherit' });
  if (r.status !== 0) failed.push(c.id);
}

if (failed.length) {
  console.error(`\nFailed: ${failed.join(', ')}`);
  process.exit(1);
}
