(async function(){
  const isProtocol = location.pathname.endsWith('protocol.html');
  const isSdk = location.pathname.endsWith('sdk.html');
  const src = isProtocol ? 'pages/protocol.md' : (isSdk ? 'pages/sdk.md' : null);
  if(!src) return;
  const [lib, md] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js'),
    fetch(src, {cache:'no-store'}).then(r=>r.ok?r.text():'# Not found')
  ]);
  const out = document.getElementById('md-content');
  if(out){ out.innerHTML = lib.marked.parse(md); }
})();
