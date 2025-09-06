import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'site';
const HTML = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).map(f => path.join(ROOT,f));

function patchNavAndLinks(src) {
  // Prompts → Builder
  src = src.replaceAll('href="./prompts.html"', 'href="./builder.html"')
           .replaceAll('>Prompts<', '>Builder<');

  // Главная кнопка «Build your server» → Builder
  src = src.replaceAll('href="./generator.html">Build your server<',
                       'href="./builder.html">Build your server<');
  return src;
}

function ensureScripts(src) {
  const hasTheme = src.includes('assets/theme.js');
  const hasLogo  = src.includes('assets/logo-fix.js');
  if (hasTheme && hasLogo) return src;

  // Вставляем перед </head>, безопасно и идемпотентно
  return src.replace(/<\/head>/i,
`  <script defer src="assets/theme.js"></script>
  <script defer src="assets/logo-fix.js"></script>
</head>`);
}

let changed = 0;
for (const file of HTML) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  after = patchNavAndLinks(after);
  after = ensureScripts(after);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    console.log('patched:', path.basename(file));
  }
}

// sitemap: prompts → builder
const sm = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sm)) {
  const a = fs.readFileSync(sm, 'utf8');
  const b = a.replaceAll('/prompts.html', '/builder.html');
  if (a !== b) {
    fs.writeFileSync(sm, b);
    console.log('patched:', 'sitemap.xml');
  }
}

console.log(`Postbuild done. Files changed: ${changed}`);
