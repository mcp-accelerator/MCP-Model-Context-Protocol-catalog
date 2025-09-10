import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'site';
let changed = 0;
for (const file of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  const fp = path.join(ROOT, file);
  let s = fs.readFileSync(fp, 'utf8');
  let before = s;

  function ensure(scriptPath){
    if (s.includes(scriptPath)) return;
    let tag = `  <script defer src="${scriptPath}"></script>\n`;
    if (s.includes('</head>'))       s = s.replace('</head>', tag + '</head>');
    else if (s.includes('</body>'))  s = s.replace('</body>', tag + '</body>');
    else                             s += '\n' + tag;
  }
  ensure('assets/theme.js');
  ensure('assets/telegram-link.js');

  if (s !== before) { fs.writeFileSync(fp, s); console.log('patched:', file); changed++; }
}
console.log('Postbuild done. Files changed:', changed);
