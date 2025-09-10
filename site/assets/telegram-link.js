(() => {
  const TG = 'https://t.me/+4m2vc99t-RQwZjEy';
  function inject() {
    const nav = document.querySelector('.tabs'); if (!nav) return false;
    if (nav.querySelector('a.tg')) return true;
    const a = document.createElement('a');
    a.className = 'tg'; a.href = TG; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'Подпишись на канал';
    nav.appendChild(a);
    return true;
  }
  const tryInject = () => {
    if (inject()) return;
    const mo = new MutationObserver(() => { if (inject()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', tryInject); else tryInject();
})();
