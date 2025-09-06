(() => {
  function catalogLogos(){
    const anchors = document.querySelectorAll('a[href*="server.html?id="]');
    anchors.forEach(a=>{
      try{
        const url = new URL(a.getAttribute('href'), location.href);
        const id = url.searchParams.get('id'); if(!id) return;
        const card = a.closest('.card') || a.parentElement; if (!card || card.querySelector('img.card-logo')) return;
        const img = document.createElement('img'); img.className='card-logo'; img.alt=id+' logo';
        img.src = `assets/logos/${id}.svg`; img.onerror = () => img.remove();
        card.insertBefore(img, card.firstChild);
      }catch(_){}
    });
  }
  function serverLogo(){
    const id = new URLSearchParams(location.search).get('id'); if(!id) return;
    const h1 = document.querySelector('h1'); if (!h1 || h1.querySelector('img.server-logo')) return;
    const img = document.createElement('img');
    img.className='server-logo'; img.alt=id+' logo'; img.src=`assets/logos/${id}.svg`;
    img.style.cssText='width:48px;height:48px;object-fit:contain;vertical-align:middle;margin-left:8px';
    img.onerror = () => img.remove();
    h1.appendChild(img);
  }
  document.addEventListener('DOMContentLoaded', () => { catalogLogos(); serverLogo(); });
})();
