(() => {
  const addLogoToCard = (a) => {
    let href = a.getAttribute('href')||'';
    try { href = new URL(href, location.href).href; } catch(_){}
    let id=''; try { id = new URL(href).searchParams.get('id')||''; } catch(_){}
    if(!id) return;
    const card = a.closest('.card') || a.parentElement;
    if(!card || card.querySelector('img.card-logo')) return;

    const img = new Image();
    img.className='card-logo';
    img.alt = id+' logo';
    img.src = `assets/logos/${id}.svg`;
    img.onerror = () => img.remove();
    img.style.cssText='width:36px;height:36px;object-fit:contain;float:right;margin:-4px -4px 0 8px;opacity:.9';
    card.insertBefore(img, card.firstChild);
  };

  const scan = () => document.querySelectorAll('a[href*="server.html?id="]').forEach(addLogoToCard);
  const mo = new MutationObserver(scan);
  document.addEventListener('DOMContentLoaded', () => { scan(); mo.observe(document.body,{childList:true,subtree:true}); });
})();
