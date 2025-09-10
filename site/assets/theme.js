(() => {
  const THEMES = ['light','dark','dim'];
  let theme = localStorage.getItem('mcp_theme') || 'light';
  const apply = (t) => {
    document.documentElement.classList.remove('theme-dark','theme-dim');
    if (t==='dark') document.documentElement.classList.add('theme-dark');
    if (t==='dim')  document.documentElement.classList.add('theme-dim');
    localStorage.setItem('mcp_theme', t);
    if (btn) btn.setAttribute('aria-label', 'Theme: '+t);
  };
  const btn = document.createElement('button');
  btn.id='theme-toggle'; btn.type='button'; btn.textContent='🌓'; btn.title='Switch theme';
  btn.style.cssText='position:fixed;top:14px;right:14px;z-index:999;border:1px solid var(--bd);' +
                    'background:var(--bg2);color:var(--fg);border-radius:10px;padding:6px 10px;' +
                    'cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.12)';
  btn.addEventListener('click', () => { let i = THEMES.indexOf(theme); theme = THEMES[(i+1)%THEMES.length]; apply(theme); });
  const mount = () => { if (!document.getElementById('theme-toggle')) document.body.appendChild(btn); apply(theme); };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
