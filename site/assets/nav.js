(async function(){
  const resp = await fetch('config/nav.json', {cache:'no-store'});
  if(!resp.ok) return;
  const cfg = await resp.json();
  const path = location.pathname.split('/').pop() || 'index.html';

  const navEls = document.querySelectorAll('.nav[data-dynamic]');
  const html = ['<a class="brand" href="index.html" translate="no">'+(cfg.brand||'MCP')+'</a>']
    .concat((cfg.items||[]).filter(i=>i.enabled!==false).map(i=>{
      const active = i.href===path ? ' class="active"' : '';
      return `<a${active} href="${i.href}">${i.title}</a>`;
    })).join('');
  navEls.forEach(n => n.innerHTML = html);
})();
