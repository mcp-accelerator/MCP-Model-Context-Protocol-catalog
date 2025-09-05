(function(){
  const QS = new URLSearchParams(location.search);
  const STEP_MIN = 1, STEP_MAX = 5;
  const step = clamp(parseInt(QS.get('step')||'1',10));
  const serverId = QS.get('id') || '';
  const REG_URL = window.REGISTRY_URL
    || document.querySelector('meta[name="mcp-registry"]')?.content
    || 'https://mcp-accelerator.github.io/mcp-registry/servers.index.json';

  function clamp(n){ return Math.min(STEP_MAX, Math.max(STEP_MIN, isFinite(n)?n:1)); }
  function setStep(n){ QS.set('step', String(clamp(n))); history.replaceState(null,'','?'+QS.toString()); highlightStep(); showStep(); }
  function setServer(id){ QS.set('id', id); QS.set('step','1'); history.replaceState(null,'','?'+QS.toString()); render(); }
  function el(q,root=document){ return root.querySelector(q); }
  function els(q,root=document){ return [...root.querySelectorAll(q)]; }
  function h(tag, attrs={}, kids=[]){ const e=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>{ if(v==null)return; if(k==='class') e.className=v; else if(k==='html') e.innerHTML=v; else e.setAttribute(k,v); }); kids.forEach(k=>e.appendChild(k)); return e; }
  function copy(text){ navigator.clipboard?.writeText(text).then(()=>toast('Copied')).catch(()=>alert('Copy failed')); }
  function toast(msg){ const t=h('div',{class:'toast'},[document.createTextNode(msg)]); document.body.appendChild(t); setTimeout(()=>t.classList.add('show'),10); setTimeout(()=>{t.classList.remove('show'); setTimeout(()=>t.remove(),200);},1400); }

  const ui = {
    stage: el('#stage'),
    stepDots: els('[data-step]'),
    serverSelect: el('#serverSelect'),
    serverInfo: el('#serverInfo'),
    s1: el('#s1'), s2: el('#s2'), s3: el('#s3'), s4: el('#s4'), s5: el('#s5'),
    next: el('#nextBtn'), prev: el('#prevBtn'),
    bg: el('#bg-diagram'),
  };

  let REGISTRY = null;
  async function loadRegistry(){
    const resp = await fetch(REG_URL, {cache:'no-store'});
    if(!resp.ok) throw new Error('Registry fetch failed: '+resp.status);
    REGISTRY = await resp.json();
  }
  function findServer(id){ return (REGISTRY?.servers||[]).find(s => s.id === id) || null; }
  function populateServers(){
    const servers = (REGISTRY?.servers||[]).slice().sort((a,b)=> a.name.localeCompare(b.name));
    ui.serverSelect.innerHTML = '<option disabled '+(serverId?'':'selected')+'>Select a server…</option>';
    for(const s of servers){
      const opt = h('option', {value:s.id, 'translate':'no'}, [document.createTextNode(s.name)]);
      if(s.id===serverId) opt.selected = true;
      ui.serverSelect.appendChild(opt);
    }
  }
  function statusPill(txt){ return h('span',{class:'pill'},[document.createTextNode(txt)]); }
  function badge(txt){ return h('span',{class:'badge'},[document.createTextNode(txt)]); }

  function renderS1(s){
    ui.s1.innerHTML = '';
    const top = h('div',{class:'card'},[
      h('div',{class:'card-title', translate:'no'},[document.createTextNode(s.name)]),
      h('div',{class:'card-sub'},[
        statusPill((s.status||'').toUpperCase()),
        s.transports? badge(s.transports.join(', ')) : null,
        s.primitives? badge(s.primitives.join(', ')) : null
      ].filter(Boolean)),
      h('p',{},[document.createTextNode(s.meta?.description || '–')]),
      h('div',{class:'kv'},[
        h('div',{},[h('span',{class:'k'},[document.createTextNode('Category')]), h('span',{class:'v'},[document.createTextNode(s.meta?.category||'–')])]),
        h('div',{},[h('span',{class:'k'},[document.createTextNode('Protocol')]), h('span',{class:'v'},[document.createTextNode(s.protocol_min||'–')])]),
      ])
    ]);
    ui.s1.appendChild(top);
  }

  function renderS2(s){
    ui.s2.innerHTML = '';
    const tokenURL = s.auth?.token_guide_url;
    const envs = s.meta?.env_vars || [];
    const card = h('div',{class:'card'},[
      h('div',{class:'card-title'},[document.createTextNode('Get API keys')]),
      tokenURL ? h('p',{},[h('a',{href:tokenURL, target:'_blank', rel:'noopener', class:'btn'},[document.createTextNode('Open provider key page')])])
               : h('p',{class:'muted'},[document.createTextNode('No token page provided for this server.')]),
      envs.length ? h('div',{},[
        h('div',{class:'card-sub'},[document.createTextNode('Environment variables')]),
        h('pre',{class:'code', translate:'no'},[document.createTextNode(envs.map(k=>`${k}=...`).join('\n'))]),
        h('button',{class:'btn btn-secondary', onclick:()=>copy(envs.map(k=>`${k}=`).join('\n'))},[document.createTextNode('Copy template')])
      ]) : h('p',{class:'muted'},[document.createTextNode('No environment variables required.')])
    ]);
    ui.s2.appendChild(card);
  }

  function renderS3(s){
    ui.s3.innerHTML = '';
    const isLocal = !!s.manifest;
    const mUrl = s.manifest ? absoluteSiteURL(s.manifest) : null;
    const endp = s.connect?.endpoint_url || null;

    const card = h('div',{class:'card'},[
      h('div',{class:'card-title'},[document.createTextNode('Configure manifest / endpoint')]),
      isLocal
        ? h('p',{},[
            document.createTextNode('This server uses a local manifest. '),
            mUrl ? h('a',{href:mUrl, class:'btn', target:'_blank', rel:'noopener'},[document.createTextNode('Open manifest')]) : null,
            mUrl ? h('button',{class:'btn btn-secondary ml', onclick:()=>copy(mUrl)},[document.createTextNode('Copy manifest URL')]) : null
          ])
        : h('p',{},[
            document.createTextNode('This is a hosted server. '),
            endp ? h('a',{href:endp, class:'btn', target:'_blank', rel:'noopener'},[document.createTextNode('Open endpoint')])
                 : h('span',{class:'muted'},[document.createTextNode('No endpoint URL provided.')])
          ])
    ]);
    ui.s3.appendChild(card);
  }

  function renderS4(s){
    ui.s4.innerHTML = '';
    const envs = s.meta?.env_vars || [];
    const isLocal = !!s.manifest;
    const endp = s.connect?.endpoint_url || null;

    const claude = isLocal
      ? `{
  "mcpServers": {
    "${s.id}": { "command": "node", "args": ["${s.id}-server.js"] }
  }
}`
      : `{
  "mcpServers": {
    "${s.id}": { "url": "${endp||'https://your-hosted-endpoint.example'}" }
  }
}`;

    const openai = isLocal
      ? `{
  "mcp_servers": [
    {
      "name": "${s.id}",
      "command": "node",
      "args": ["${s.id}-server.js"]
    }
  ]
}`
      : `{
  "mcp_servers": [
    {
      "name": "${s.id}",
      "url": "${endp||'https://your-hosted-endpoint.example'}"
    }
  ]
}`;

    const card = h('div',{class:'card'},[
      h('div',{class:'card-title'},[document.createTextNode('Connect in your client')]),
      h('div',{class:'card-sub'},[document.createTextNode('Claude Desktop (claude_desktop_config.json)')]),
      h('pre',{class:'code', translate:'no'},[document.createTextNode(claude)]),
      h('button',{class:'btn btn-secondary', onclick:()=>copy(claude)},[document.createTextNode('Copy Claude config')]),
      h('hr'),
      h('div',{class:'card-sub'},[document.createTextNode('OpenAI (client config)')]),
      h('pre',{class:'code', translate:'no'},[document.createTextNode(openai)]),
      h('button',{class:'btn btn-secondary', onclick:()=>copy(openai)},[document.createTextNode('Copy OpenAI config')]),
      envs.length ? h('div',{},[
        h('hr'),
        h('div',{class:'card-sub'},[document.createTextNode('.env template')]),
        h('pre',{class:'code', translate:'no'},[document.createTextNode(envs.map(k=>`${k}=...`).join('\n'))]),
        h('button',{class:'btn btn-secondary', onclick:()=>copy(envs.map(k=>`${k}=`).join('\n'))},[document.createTextNode('Copy .env')])
      ]) : null
    ].filter(Boolean));
    ui.s4.appendChild(card);
  }

  function renderS5(s){
    ui.s5.innerHTML = '';
    const isLocal = !!s.manifest;
    const card = h('div',{class:'card'},[
      h('div',{class:'card-title'},[document.createTextNode('Test & verify')]),
      h('p',{},[document.createTextNode('After connecting, open your client and call a simple tool to verify.')]),
      h('pre',{class:'code', translate:'no'},[document.createTextNode(
        isLocal
        ? `# Example prompt in your client:
"Use the ${s.id} MCP server and call one of its tools."`
        : `# Quick HTTP probe (should return MCP handshake JSON)
curl -i ${s.connect?.endpoint_url || 'https://your-hosted-endpoint.example'}`
      )])
    ]);
    ui.s5.appendChild(card);
  }

  function absoluteSiteURL(rel){
    if(!rel) return null;
    let base = document.querySelector('base')?.href || location.origin + location.pathname;
    if(!base.endsWith('/')) base = base.replace(/[^/]+$/, '');
    return new URL(rel, base).href.replace(/\/index\.html?$/,'/');
  }

  function highlightStep(){
    ui.stepDots.forEach(d=>{
      const n = parseInt(d.dataset.step,10);
      d.classList.toggle('active', n===clamp(parseInt(QS.get('step')||'1',10)));
      d.classList.toggle('done', n < clamp(parseInt(QS.get('step')||'1',10)));
    });
    const n = clamp(parseInt(QS.get('step')||'1',10));
    document.getElementById('bg-diagram').style.setProperty('--step', n);
  }

  function showStep(){
    const n = clamp(parseInt(QS.get('step')||'1',10));
    els('.step-panel').forEach(p=>p.classList.toggle('hidden', p.id !== 's'+n));
    ui.prev.disabled = (n===STEP_MIN);
    ui.next.disabled = (n===STEP_MAX || !serverId);
  }

  async function render(){
    try{ if(!REGISTRY) await loadRegistry(); }
    catch(e){ ui.stage.innerHTML = '<div class="error">Failed to load registry: '+e.message+'</div>'; return; }
    populateServers();
    const s = serverId ? findServer(serverId) : null;
    ui.serverInfo.innerHTML = '';
    if(!s){
      ui.serverInfo.appendChild(h('div',{class:'muted'},[document.createTextNode('Pick a server to start the wizard.')] ));
      showStep(); highlightStep(); return;
    }
    renderS1(s); renderS2(s); renderS3(s); renderS4(s); renderS5(s);
    highlightStep(); showStep();
  }

  // events
  document.getElementById('serverSelect').addEventListener('change', e=> setServer(e.target.value));
  document.getElementById('prevBtn').addEventListener('click', ()=> setStep((parseInt(QS.get('step')||'1',10)-1)));
  document.getElementById('nextBtn').addEventListener('click', ()=> setStep((parseInt(QS.get('step')||'1',10)+1)));
  els('[data-step]').forEach(d=> d.addEventListener('click', ()=> setStep(parseInt(d.dataset.step,10)) ));

  render();
})();
