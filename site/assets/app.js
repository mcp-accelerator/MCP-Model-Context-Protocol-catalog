(function(){
  document.addEventListener('DOMContentLoaded', () => {
    // Copy buttons
    document.querySelectorAll('button.copy').forEach(btn => {
      const original = btn.textContent;
      btn.addEventListener('click', async () => {
        const text = btn.getAttribute('data-copy') || '';
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied';
          setTimeout(()=>btn.textContent = original, 1500);
        } catch(e) {
          console.error('Clipboard failed', e);
        }
      });
    });

    // Catalog filters
    const cards = document.querySelector('#cards');
    const q = document.querySelector('#q');
    const fType = document.querySelector('#f-type');
    const fPrim = document.querySelector('#f-prim');
    function applyFilters(){
      if(!cards) return;
      const query = (q?.value || '').toLowerCase().trim();
      const type = fType?.value || '';
      const prim = fPrim?.value || '';
      cards.querySelectorAll('.card').forEach(card => {
        const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('.desc')?.textContent || '').toLowerCase();
        const hasQuery = !query || title.includes(query) || desc.includes(query);
        const hasType = !type || (card.getAttribute('data-type') === type);
        const prims = (card.getAttribute('data-prims') || '').split(',').filter(Boolean);
        const hasPrim = !prim || prims.includes(prim);
        card.style.display = (hasQuery && hasType && hasPrim) ? '' : 'none';
      });
    }
    [q,fType,fPrim].forEach(el => el && el.addEventListener('input', applyFilters));
    applyFilters();

    // Server detail page
    const detailH1 = document.getElementById('sv-title');
    if (detailH1) {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      fetch('./https://mcp-accelerator.github.io/mcp-registry/servers.index.json')
        .then(r => r.json())
        .then(data => {
          const s = (data.servers || []).find(x => x.id === id) || null;
          if (!s) {
            detailH1.textContent = 'Not found';
            return;
          }
          const isLocal = !!(s.manifest || (s.manifests && s.manifests.length));
          detailH1.textContent = s.name || s.id;
          document.title = (s.name || s.id) + ' — MCP Catalog';

          const meta = document.getElementById('sv-meta');
          meta.innerHTML = `<span class="badge">${isLocal ? 'local' : 'hosted'}</span><span class="badge">${s.status || 'draft'}</span>`;

          document.getElementById('sv-desc').textContent = s.meta?.description || '';

          const endpointHref = !isLocal ? (s.connect?.endpoint_url || '') : '';
          const manifestHref = isLocal && s.manifest ? './' + s.manifest : '';

          const actions = document.getElementById('sv-actions');
          const links = [];
          if (s.auth?.type === 'token' && s.auth?.token_guide_url) {
            links.push(`<a class="btn" href="${s.auth.token_guide_url}" target="_blank" rel="noopener">Get keys</a>`);
            const stepKeys = document.getElementById('sv-step-keys');
            const keysA = document.getElementById('sv-keys');
            if (stepKeys && keysA) {
              stepKeys.classList.remove('hidden');
              keysA.href = s.auth.token_guide_url;
              keysA.textContent = s.auth.token_guide_url;
            }
          }
          if (manifestHref) links.push(`<a class="btn" href="${manifestHref}" target="_blank" rel="noopener">Open manifest</a>`);
          if (endpointHref) links.push(`<a class="btn" href="${endpointHref}" target="_blank" rel="noopener">Open endpoint</a>`);

          // downloads prepared by builder
          const claudeHref = `./config/claude/${s.id}.json`;
          links.push(`<a class="btn ghost" href="${claudeHref}" download translate="no" class="notranslate">Claude config</a>`);
          document.getElementById('sv-claude').href = claudeHref;

          if ((s.meta?.env_vars || []).length) {
            const envHref = `./config/env/${s.id}.env`;
            links.push(`<a class="btn ghost" href="${envHref}" download translate="no" class="notranslate">.env template</a>`);
            const wrap = document.getElementById('sv-env-wrap');
            const envA = document.getElementById('sv-env');
            if (wrap && envA) {
              wrap.classList.remove('hidden');
              envA.href = envHref;
            }
          }

          // inspector
          let inspectorCmd = '';
          if (isLocal) {
            inspectorCmd = `npx @modelcontextprotocol/inspector -- node ./servers/${s.id}/dist/index.js`;
          } else if (endpointHref) {
            inspectorCmd = `npx @modelcontextprotocol/inspector --cli ${endpointHref} --transport http --method tools/list`;
          }
          if (inspectorCmd) {
            links.push(`<button class="btn copy notranslate" translate="no" data-copy="${inspectorCmd}">Inspector</button>`);
            const btn = document.getElementById('sv-inspector-btn');
            if (btn) btn.setAttribute('data-copy', inspectorCmd);
          }

          actions.innerHTML = links.join(' ');

          // meta info
          document.getElementById('sv-transports').textContent = (s.transports||[]).join(', ') || '—';
          document.getElementById('sv-primitives').textContent = (s.primitives||[]).join(', ') || '—';
          document.getElementById('sv-proto').textContent = s.protocol_min || '—';

          // raw
          const raw = document.getElementById('sv-raw');
          raw.textContent = JSON.stringify(s, null, 2);
        })
        .catch(e => {
          console.error(e);
          detailH1.textContent = 'Error loading server';
        });
    }
  });
})();
