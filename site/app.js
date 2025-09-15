(() => {
  const BASE = "/MCP-Model-Context-Protocol-catalog";
  const PATH_JSON = `${BASE}/registry/servers.index.json`;
  const els = { nav: document.getElementById("nav"), app: document.getElementById("app") };

  const NAV = `
    <a href="${BASE}/#/">Главная</a>
    <a href="${BASE}/#/catalog">Каталог</a>
    <a href="${BASE}/#/protocol">Протокол</a>
    <a href="${BASE}/#/sdk">SDK</a>
    <a href="${BASE}/#/faq">FAQ</a>
    <a href="https://t.me/mcpcatalog" target="_blank" rel="noopener">Telegram</a>
    <a href="https://github.com/mcp-accelerator/MCP-Model-Context-Protocol-catalog" target="_blank" rel="noopener">GitHub</a>
    <a href="${BASE}/#/generator">Генератор</a>
    <a href="${BASE}/#/builder">Builder</a>
  `;
  if (els.nav) els.nav.innerHTML = NAV;

  let state = { servers: [], ready: false };

  async function loadIndex() {
    if (state.ready) return;
    try {
      const r = await fetch(PATH_JSON, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const arr = Array.isArray(data) ? data : (data.servers || []);
      // Нормализуем поля карточек
      state.servers = arr.map((s, i) => ({
        id: s.id || s.slug || `srv-${i}`,
        name: s.name || s.title || s.id || `Server #${i+1}`,
        description: s.description || s.desc || "",
        repo: s.repo || s.repository || s.github || "",
        homepage: s.homepage || s.url || "",
        tags: s.tags || s.categories || [],
      }));
      state.ready = true;
    } catch (e) {
      console.error("Index load failed:", e);
    }
  }

  // Views
  function viewHome() {
    els.app.className = "cards";
    els.app.innerHTML = `
      <article class="card"><h2>Каталог</h2><p><a href="${BASE}/#/catalog">Открыть витрину</a></p></article>
      <article class="card"><h2>Протокол</h2><p><a href="${BASE}/#/protocol">Документы и ссылки</a></p></article>
      <article class="card"><h2>SDK</h2><p><a href="${BASE}/#/sdk">Инструменты для разработки</a></p></article>
      <article class="card"><h2>Builder</h2><p><a href="${BASE}/#/builder">Открыть Builder</a></p></article>
    `;
  }

  function pill(tag) {
    return `<span class="muted" style="border:1px solid var(--border);border-radius:999px;padding:.15rem .5rem;margin-right:.35rem;display:inline-block">${tag}</span>`;
  }

  function card(s) {
    const links = [
      s.homepage ? `<a href="${s.homepage}" target="_blank" rel="noopener">Сайт</a>` : "",
      s.repo ? `<a href="${s.repo}" target="_blank" rel="noopener">Repo</a>` : "",
    ].filter(Boolean).join(" · ");
    const tags = (s.tags || []).map(pill).join(" ");
    return `
      <article class="card">
        <h2>${s.name}</h2>
        <p>${s.description || ""}</p>
        <p class="muted">${links || "—"}</p>
        ${tags ? `<p>${tags}</p>` : ""}
      </article>
    `;
  }

  function viewCatalog() {
    els.app.className = "cards";
    if (!state.ready) {
      els.app.innerHTML = `<article class="card"><h2>Загрузка каталога…</h2></article>`;
      return;
    }
    if (!state.servers.length) {
      els.app.innerHTML = `<article class="card"><h2>Пусто</h2><p>Добавьте записи в <code>registry/servers.index.json</code>.</p></article>`;
      return;
    }
    // Простая строка поиска
    const q = new URLSearchParams(location.hash.split("?")[1] || "").get("q") || "";
    const filtered = state.servers.filter(s => {
      const hay = `${s.name} ${s.description} ${s.tags.join(" ")} ${s.repo} ${s.homepage}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
    els.app.innerHTML = `
      <article class="card" style="grid-column:1/-1">
        <input id="q" placeholder="Поиск по названию/описанию/тегам…" value="${q.replace(/"/g,"&quot;")}" style="width:100%;padding:.6rem;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text)"/>
      </article>
      ${filtered.map(card).join("")}
    `;
    const input = document.getElementById("q");
    input?.addEventListener("input", (e) => {
      const v = e.target.value || "";
      const base = `${BASE}/#/catalog`;
      const hash = v ? `${base}?q=${encodeURIComponent(v)}` : base;
      if (location.hash !== hash) location.hash = hash;
      else viewCatalog();
    });
  }

  function viewProtocol() {
    els.app.className = "cards";
    els.app.innerHTML = `
      <article class="card"><h2>Официальный сайт</h2><p><a href="https://modelcontextprotocol.io" target="_blank" rel="noopener">modelcontextprotocol.io</a></p></article>
      <article class="card"><h2>GitHub MCP</h2><p><a href="https://github.com/modelcontextprotocol" target="_blank" rel="noopener">github.com/modelcontextprotocol</a></p></article>
    `;
  }

  function viewSDK() {
    els.app.className = "cards";
    els.app.innerHTML = `
      <article class="card"><h2>TypeScript SDK</h2><p>Скоро</p></article>
      <article class="card"><h2>Python SDK</h2><p>Скоро</p></article>
    `;
  }

  function viewFAQ() {
    els.app.className = "cards";
    els.app.innerHTML = `
      <article class="card"><h2>Как добавить сервер?</h2>
      <p>Создайте PR с записью в <code>registry/servers.index.json</code>. CI проверит схему и линки.</p></article>
    `;
  }

  function viewGenerator() {
    els.app.className = "cards";
    els.app.innerHTML = `
      <article class="card"><h2>Генератор</h2><p>Раздел в разработке.</p></article>
    `;
  }

  function viewBuilder() {
    els.app.className = "";
    // Встраиваем восстановлённую страницу билда
    els.app.innerHTML = `
      <div style="height:calc(100vh - 160px);">
        <iframe src="${BASE}/site/builder.html" style="width:100%;height:100%;border:1px solid var(--border);border-radius:12px;background:var(--surface)"></iframe>
      </div>
    `;
  }

  function router() {
    const h = (location.hash || "#/").replace(/^#/, "");
    if (h === "/" || h === "") return viewHome();
    if (h.startsWith("/catalog")) return viewCatalog();
    if (h.startsWith("/protocol")) return viewProtocol();
    if (h.startsWith("/sdk")) return viewSDK();
    if (h.startsWith("/faq")) return viewFAQ();
    if (h.startsWith("/generator")) return viewGenerator();
    if (h.startsWith("/builder")) return viewBuilder();
    viewHome();
  }

  window.addEventListener("hashchange", router);
  loadIndex().then(router);
})();
