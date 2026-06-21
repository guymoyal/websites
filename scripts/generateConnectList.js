const fs = require('fs');
const path = require('path');
const { connectUrl } = require('./lib/connectUrl.js');

const ROOT = path.join(__dirname, '..');
const IN = path.join(ROOT, 'content', 'relevant-merchants.json');
const MD = path.join(ROOT, 'content', 'connect-list.md');
const CSV = path.join(ROOT, 'content', 'connect-list.csv');

const merchants = JSON.parse(fs.readFileSync(IN, 'utf8'));
const pending = merchants.filter((m) => m.connectionStatus !== 'active');

let md = `# Admitad connect-list (${pending.length} programs to join)\n\n` +
  `Connect these in the Admitad store, then run \`yarn partners:fetch\` to refresh status.\n\n`;
let csv = 'category,name,status,connectUrl\n';
let lastCat = '';
for (const m of merchants.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))) {
  if (m.category !== lastCat) { md += `\n## ${m.category}\n\n`; lastCat = m.category; }
  const url = connectUrl(m) || '(id unknown — search in store)';
  const status = m.connectionStatus === 'active' ? '✅ connected' : '⬜ join';
  md += `- ${status} **${m.name}** — ${url}\n`;
  csv += `${JSON.stringify(m.category)},${JSON.stringify(m.name)},${m.connectionStatus || 'none'},${JSON.stringify(url)}\n`;
}
fs.writeFileSync(MD, md);
fs.writeFileSync(CSV, csv);
console.log(`[connect-list] wrote ${merchants.length} merchants (${pending.length} pending) to connect-list.md/.csv`);
