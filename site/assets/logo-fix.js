(() => {
  function addCardLogos() {
    const anchors = Array.from(document.querySelectorAll('a[href*="server.html"]'));
    anchors.forEach(a => {
      let href = a.getAttribute('href') || '';
      try { href = new URL(href, location.href).href; } catch (_) {}
      let id = '';
      try { id = new URL(href).searchParams.get('id') || ''; } catch (_) {}
      if (!id) return;
      const card = a.closest('.card') || a.parentElement;
      if (!card || card.querySelector('img.card-logo')) return;
      const img = new Image();
      img.className = 'card-logo';
      img.alt = id + ' logo';
      img.src = `assets/logos/${id}.svg`;
      img.onerror = () => { img.src='assets/logos/_default.svg'; };
      card.insertBefore(img, card.firstChild);
    });
  }
  function addServerLogo() {
    const id = new URLSearchParams(location.search).get('id'); if(!id) return;
    const h1 = document.querySelector('h1'); if (!h1 || h1.querySelector('img.server-logo')) return;
    const img = new Image();
    img.className='server-logo'; img.alt=id+' logo'; img.style.cssText='width:28px;height:28px;margin-left:8px;vertical-align:middle';
    img.src=`assets/logos/${id}.svg`; img.onerror=()=>{ img.src='assets/logos/_default.svg'; };
    h1 && h1.appendChild(img);
  }
  document.addEventListener('DOMContentLoaded', () => { addCardLogos(); addServerLogo(); });
})();
