import fs from "node:fs";
const index = JSON.parse(fs.readFileSync("registry/servers.index.json","utf8"));
const q = new URLSearchParams(process.env.PAGE_QUERY || "");
const sort = q.get("sort") || "name";

const esc = (s)=>String(s??"").replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
const href = (s)=>s && s.replace(/"/g,"%22");

const servers = [...index.servers];
servers.sort((a,b)=>{
  if (sort==="name") return (a.name||"").localeCompare(b.name||"");
  if (sort==="status") return (a.status||"").localeCompare(b.status||"");
  return (a.name||"").localeCompare(b.name||"");
});

const card = (s)=>{
  const home = s.meta?.homepage || s.homepage;
  const repo = s.meta?.repo || s.repo;
  const man  = s.manifest || (s.manifests?.[0]?.path || s.manifests?.[0]?.uri);
  const titleHref = home || repo || man || "#";
  const transports = (s.transports||[]).join(" · ");
  const primitives = (s.primitives||[]).join(" · ");
  const cat = s.meta?.category || "unknown";
  const verified = s.meta?.verified ? `<span class="badge ok">verified</span>` : "";
  const status = s.status || "unknown";
  return `
  <article class="card">
    <header>
      <a class="title" href="${href(titleHref)}" target="_blank" rel="noopener noreferrer">${esc(s.name||s.id)}</a>
    </header>
    <div class="meta">
      <span class="badge">${esc(cat)}</span>
      <span class="badge">${esc(status)}</span>
      ${verified}
    </div>
    <p class="desc">${esc(s.meta?.description || "")}</p>
    <ul class="kv">
      <li><strong>Transports:</strong> ${esc(transports||"—")}</li>
      <li><strong>Primitives:</strong> ${esc(primitives||"—")}</li>
      <li><strong>Protocol:</strong> ${esc(s.protocol_min || "—")}</li>
    </ul>
    <nav class="links">
      ${home ? `<a href="${href(home)}" target="_blank" rel="noopener">Docs</a>` : ``}
      ${repo ? `<a href="${href(repo)}" target="_blank" rel="noopener">Repo</a>` : ``}
      ${man  ? `<a href="${href(man)}"  target="_blank" rel="noopener">Manifest</a>` : ``}
    </nav>
  </article>`;
};

const html = `<!doctype html>
<html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MCP Catalog — Servers</title>
<link rel="stylesheet" href="./style.css">
<body>
  <header class="top">
    <h1>MCP Catalog — Servers</h1>
    <div class="actions">
      <a href="https://github.com/mcp-accelerator/MCP-Model-Context-Protocol-catalog" target="_blank" rel="noopener">GitHub Repo</a>
      <a href="https://modelcontextprotocol.io/docs/getting-started/intro" target="_blank" rel="noopener">MCP Intro</a>
    </div>
    <p class="hint">Источник данных: <code>registry/servers.index.json</code>. Показаны локальные и hosted/reference.</p>
  </header>
  <main class="grid">
    ${servers.map(card).join("\n")}
  </main>
  <footer class="foot">© MCP Accelerator</footer>
</body></html>`;
fs.mkdirSync("site",{recursive:true});
fs.writeFileSync("site/index.html", html);
console.log("Wrote site/index.html with", servers.length, "cards");
