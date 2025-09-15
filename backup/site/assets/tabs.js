(function(){
  const map = {
    catalog: 'catalog.html',
    builder: 'builder.html',
    generator: 'generator.html',
    faq: 'faq.html'
  };
  const frame = document.getElementById('hub-frame');
  const tabbar = document.getElementById('hub-tabbar');

  function setActive(tab){
    [...tabbar.querySelectorAll('[data-tab]')].forEach(b=>{
      b.classList.toggle('active', b.dataset.tab===tab);
    });
  }
  function openTab(tab){
    const page = map[tab] || map.catalog;
    frame.src = page + (page.includes('?') ? '&' : '?') + 'embed=1';
    setActive(tab);
    const u = new URL(location.href);
    u.hash = 'tab=' + tab;
    history.replaceState(null,'',u.toString());
  }

  tabbar.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-tab]');
    if(!btn) return;
    openTab(btn.dataset.tab);
  });

  // начальная вкладка из hash или по умолчанию
  const hash = (location.hash || '').replace(/^#/, '');
  const initial = (hash.startsWith('tab=') ? hash.split('=')[1] : 'catalog');
  openTab(initial);
})();
