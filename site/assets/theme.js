(() => {
  const THEMES = ['light','dark','dim'];
  const btn = document.createElement('button');
  btn.id='theme-toggle'; btn.type='button'; btn.title='Switch theme'; btn.textContent='🌓';
  btn.style.cssText='position:fixed;right:14px;bottom:14px;z-index:999;border:1px solid var(--bd);background:var(--bg2);color:var(--fg);border-radius:10px;padding:6px 10px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.12)';
  const apply = (t) => {
    document.documentElement.classList.remove('theme-dark','theme-dim');
    if (t==='dark') document.documentElement.classList.add('theme-dark');
    else if (t==='dim') document.documentElement.classList.add('theme-dim');
    localStorage.setItem('mcp_theme', t);
    btn.setAttribute('aria-label','Theme: '+t);
  };
  let theme = localStorage.getItem('mcp_theme') || 'light';
  apply(theme);
  btn.addEventListener('click', () => { let i = THEMES.indexOf(theme); theme = THEMES[(i+1)%THEMES.length]; apply(theme); });
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(btn));
})();
