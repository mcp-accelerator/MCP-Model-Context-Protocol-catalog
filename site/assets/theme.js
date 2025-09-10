(() => {
  const THEMES = ['light','dark'];
  const btn = document.createElement('button');
  btn.id='theme-toggle'; btn.type='button'; btn.title='Switch theme'; btn.textContent='🌓';

  const apply = (t) => {
    document.documentElement.classList.toggle('theme-dark', t==='dark');
    localStorage.setItem('mcp_theme', t);
    btn.setAttribute('aria-label','Theme: '+t);
  };

  let theme = localStorage.getItem('mcp_theme')
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  apply(theme);

  btn.addEventListener('click', () => {
    theme = theme==='dark' ? 'light' : 'dark';
    apply(theme);
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(btn);
  });
})();
