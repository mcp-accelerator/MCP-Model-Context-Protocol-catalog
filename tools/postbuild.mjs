import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'site';

function listHTML(dir=ROOT){
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(dir, f));
}

function replaceAll(str, pairs){
  let out = str;
  for (const [from,to] of pairs) out = out.replaceAll(from, to);
  return out;
}

function ensureScripts(html){
  if (html.includes('assets/theme.js') && html.includes('assets/logo-fix.js')) return html;
  return html.replace(
    /<\/head>/i,
    `  <script defer src="assets/theme.js"></script>\n  <script defer src="assets/logo-fix.js"></script>\n</head>`
  );
}

let changed = 0;

for (const file of listHTML()){
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  // Prompts → Builder в ссылках и тексте вкладки
  src = replaceAll(src, [
    ['href="./prompts.html"', 'href="./builder.html"'],
    ['>Prompts<', '>Builder<']
  ]);

  // Подключения скриптов темы/логотипов
  src = ensureScripts(src);

  if (src !== before){
    fs.writeFileSync(file, src);
    changed++;
    console.log('patched:', path.basename(file));
  }
}

// sitemap
const sm = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sm)){
  const a = fs.readFileSync(sm,'utf8');
  const b = a.replaceAll('/prompts.html','/builder.html');
  if (a !== b){ fs.writeFileSync(sm,b); console.log('patched:', 'sitemap.xml'); }
}

console.log(`Postbuild done. Files changed: ${changed}`);
