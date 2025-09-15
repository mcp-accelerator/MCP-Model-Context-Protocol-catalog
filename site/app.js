(() => {
  const BASE = "/MCP-Model-Context-Protocol-catalog";
  const PATH_JSON = `${BASE}/registry/servers.index.json`;
  const els = {
    nav: document.getElementById("nav"),
    app: document.getElementById("app"),
  };
  const NAV = `
    <a href="${BASE}/#/">Главная</a>
    <a href="${BASE}/#/catalog">Каталог</a>
    <a href="${BASE}/#/protocol">Протокол</a>
    <a href="${BASE}/#/sdk">SDK</a>
    <a href="${BASE}/#/faq">FAQ</a>
    <a href="https://t.me/mcpcatalog" target="_blank" rel="noopener">Telegram</a>
    <a href="https://github.com/mcp-accelerator/MCP-Model-Context-Protocol-catalog" target="_blank" rel="noopener">GitHub</a>
    <a href="${BASE}/#/generator">Генератор</a>
  `;
  if (els.nav) els.nav.innerHTML = NAV;

  let state = { servers: [], ready: false };

  async function loadIndex() {
    if (state.ready) return;
    try {
      const r = await fetch(PATH_JSON, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      // ожидаем форму { servers: [ { id, name, description, repo, homepage, tags } ] } или массив
      const arr = Array.isArray(data) ? data : (data.servers || []);
      state.servers = arr;
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
    `;
  }

  function viewCatalog() {
    els.app.className = "cards";
    if (!state.ready) {
      els.app.innerHTML = `<article class="card"><h2>Загрузка…</h2></article>`;
      return;
    }
    if (!state.servers.length) {
      els.app.innerHTML = `<article class="card"><h2>Пусто</h2><p>Добавьте записи в registry/servers.index.json</p></article>`;
      return;
    }
    els.app.innerHTML = state.servers.map(s => {
      const name = s.name || s.id || "Server";
      const desc = s.description || "";
      const repo = s.repo || s.repository || s.github || null;
      const home = s.homepage || s.url || null;
      const links = [
        home ? `<a href="${home}" target="_blank" rel="noopener">Сайт</a>` : "",
        repo ? `<a href="${repo}" target="_blank" rel="noopener">Repo</a>` : "",
      ].filter(Boolean).join(" · ");
      return `
        <article class="card">
          <h2>${name}</h2>
          <p>${desc}</p>
          <p class="muted">${links || "—"}</p>
        </article>
      `;
    }).join("");
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
      <article class="card"><h2>Как добавить сервер?</h2><p>Создайте PR с записью в <code>registry/servers.index.json</code>.</p></article>
    `;
  }
  function viewGenerator() {
    els.app.className = "cards";
    els.app.innerHTML = `
      <article class="card"><h2>Генератор</h2><p>Раздел в разработке.</p></article>
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
    viewHome();
  }

  window.addEventListener("hashchange", router);
  loadIndex().then(router);
})();
