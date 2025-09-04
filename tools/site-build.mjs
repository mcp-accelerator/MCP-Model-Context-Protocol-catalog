import fs from "node:fs";
import path from "node:path";

// ---------- helpers ----------
const readJSON = p => JSON.parse(fs.readFileSync(p, "utf8"));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
const href = s => s ? String(s).replace(/"/g,"%22") : "";
const exists = p => { try { fs.accessSync(p); return true; } catch { return false; } };

function layout({ title, active, body, extraHead = "" }) {
  return `<!doctype html>
<html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="./assets/style.css">
${extraHead}
<body>
<header class="site-top">
  <a class="brand notranslate" translate="no" href="./index.html">MCP Catalog</a>
  <nav class="menu">
    <a class="${active==='home'?'active':''}" href="./index.html">Home</a>
    <a class="${active==='catalog'?'active':''}" href="./catalog.html">Catalog</a>
    <a class="${active==='prompts'?'active':''}" href="./prompts.html">Prompts</a>
    <a class="${active==='generator'?'active':''}" href="./generator.html">Generator</a>
    <a class="${active==='protocol'?'active':''}" href="./protocol.html">Protocol</a>
    <a class="${active==='sdk'?'active':''}" href="./sdk.html">SDK & Tools</a>
    <a class="${active==='faq'?'active':''}" href="./faq.html">FAQ</a>
  </nav>
  <div class="actions">
    <a href="https://github.com/mcp-accelerator/MCP-Model-Context-Protocol-catalog" target="_blank" rel="noopener">GitHub Repo</a>
  </div>
</header>
<main class="page">${body}</main>
<footer class="site-foot">© MCP Accelerator · Data: <code translate="no" class="notranslate">registry/servers.index.json</code></footer>
<script src="./assets/app.js"></script>
</body></html>`;
}

// ---------- load registry ----------
const reg = readJSON("registry/servers.index.json");
const servers = Array.isArray(reg.servers) ? reg.servers.slice() : [];

// ---------- build: Home ----------
const home = layout({
  title: "Home — MCP Catalog",
  active: "home",
  body: `
<section class="hero">
  <h1>Model Context Protocol — one catalog for tools & data</h1>
  <p>Connect assistants to your data and tools via a common protocol. This site offers a living catalog of MCP servers and a generator to bootstrap your own.</p>
  <div class="cta-row">
    <a class="btn" href="./catalog.html">Explore catalog</a>
    <a class="btn ghost" href="./generator.html">Build your server</a>
  </div>
</section>

<section>
  <h2>How to use this site</h2>
  <ol class="steps">
    <li>Pick a server in the <a href="./catalog.html">Catalog</a>.</li>
    <li>Open <strong>Endpoint/Manifest</strong>, copy <strong>Claude config</strong> or <strong>Inspector</strong> command.</li>
    <li>Fill secrets in <code class="notranslate" translate="no">.env</code> template locally (never share keys here).</li>
  </ol>
</section>

<section>
  <h2>What is MCP?</h2>
  <p>MCP is like <em>USB-C for AI</em>: a standard way clients connect to external tools and data. See <a href="./protocol.html">Protocol</a> for a quick intro.</p>
</section>
`
});

// ---------- build: Catalog ----------
servers.sort((a,b)=>(a.name||a.id||"").localeCompare(b.name||b.id||""));

function cardHTML(s){
  const isLocal = !!(s.manifest || (s.manifests?.length));
  const title = s.name || s.id;
  const transports = (s.transports||[]).join(" · ");
  const primitives = (s.primitives||[]).join(" · ");
  const status = s.status || "draft";
  const cat = s.meta?.category || (isLocal ? "local" : "hosted");
  const desc = s.meta?.description || "";

  // Manifest/Endpoint
  let manifestHref = "", endpointHref = "";
  if (isLocal && s.manifest) manifestHref = "./" + s.manifest; // will be copied into site/
  if (!isLocal) {
    endpointHref = s.connect?.endpoint_url || s.meta?.homepage || s.homepage || s.repo || "";
    // fallback for known hosted ids
    if (!endpointHref && s.id === "github-remote") endpointHref = "https://api.githubcopilot.com/mcp/";
    if (!endpointHref && s.id === "sentry-remote") endpointHref = "https://mcp.sentry.dev/mcp";
  }

  // Claude config (download)
  const claudeCfg = isLocal
    ? {
        mcpServers: {
          [s.id]: {
            command: "node",
            args: ["./servers/"+s.id+"/dist/index.js"],
            env: Object.fromEntries((s.meta?.env_vars || []).map(k => [k,""]))
          }
        }
      }
    : { mcpServers: { [s.id]: { url: endpointHref || "" } } };

  // .env template (optional)
  const envVars = s.meta?.env_vars || [];

  // Inspector quick command
  const inspectorCmd = isLocal
    ? `npx @modelcontextprotocol/inspector -- node ./servers/${s.id}/dist/index.js`
    : (endpointHref ? `npx @modelcontextprotocol/inspector --cli ${endpointHref} --transport http --method tools/list` : "");

  // files to write for downloads
  const cfgPath = `site/config/claude/${s.id}.json`;
  fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
  fs.writeFileSync(cfgPath, JSON.stringify(claudeCfg, null, 2));

  let envPath = "";
  if (envVars.length) {
    envPath = `site/config/env/${s.id}.env`;
    fs.mkdirSync(path.dirname(envPath), { recursive: true });
    fs.writeFileSync(envPath, envVars.map(v => `${v}=""`).join("\n")+"\n");
  }

  return `
  <article class="card">
    <header>
      <h3 class="card-title notranslate" translate="no">${esc(title)}</h3>
      <div class="meta">
        <span class="badge">${esc(cat)}</span>
        <span class="badge">${esc(status)}</span>
      </div>
    </header>
    <p class="desc">${esc(desc)}</p>
    <ul class="kv">
      <li><strong>Transports:</strong> ${esc(transports||"—")}</li>
      <li><strong>Primitives:</strong> ${esc(primitives||"—")}</li>
      <li><strong>Protocol:</strong> ${esc(s.protocol_min || "—")}</li>
    </ul>
    <nav class="links">
      ${manifestHref ? `<a class="btn" href="${href(manifestHref)}" target="_blank" rel="noopener">Open manifest</a>` : ``}
      ${endpointHref ? `<a class="btn" href="${href(endpointHref)}" target="_blank" rel="noopener" translate="no" class="notranslate">Open endpoint</a>` : ``}
      <a class="btn ghost" href="${href("./config/claude/"+s.id+".json")}" download translate="no" class="notranslate">Claude config</a>
      ${envPath ? `<a class="btn ghost" href="${href("./config/env/"+s.id+".env")}" download translate="no" class="notranslate">.env template</a>` : ``}
      ${inspectorCmd ? `<button class="btn copy notranslate" translate="no" data-copy="${esc(inspectorCmd)}">Inspector</button>` : ``}
    </nav>
  </article>`;
}

const catalog = layout({
  title: "Catalog — MCP Catalog",
  active: "catalog",
  body: `
<section>
  <h1>Catalog</h1>
  <div class="filters">
    <input id="q" type="search" placeholder="Search…" aria-label="Search">
    <select id="f-type" aria-label="Type">
      <option value="">All types</option>
      <option value="local">Local (STDIO)</option>
      <option value="hosted">Hosted (HTTP)</option>
    </select>
    <select id="f-prim" aria-label="Primitives">
      <option value="">All primitives</option>
      <option value="tools">tools</option>
      <option value="resources">resources</option>
      <option value="prompts">prompts</option>
    </select>
  </div>
  <div id="cards" class="grid">
    ${servers.map(cardHTML).join("\n")}
  </div>
</section>`
});

// ---------- build: Prompts (reads ./prompts/*) ----------
let promptsHTML = "";
const PDIR = "prompts";
if (exists(PDIR)) {
  const entries = fs.readdirSync(PDIR).filter(n => !n.startsWith("."));
  for (const name of entries) {
    const p = path.join(PDIR, name);
    if (fs.statSync(p).isFile()) {
      const raw = fs.readFileSync(p, "utf8");
      const short = raw.split(/\r?\n/).slice(0, 8).join("\n");
      const outPath = `site/prompts/${name}`;
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, raw);
      promptsHTML += `
      <article class="card">
        <header><h3 class="card-title notranslate" translate="no">${esc(name)}</h3></header>
        <pre class="snippet notranslate" translate="no"><code>${esc(short)}</code></pre>
        <nav class="links">
          <button class="btn copy notranslate" translate="no" data-copy="${esc(raw)}">Copy</button>
          <a class="btn ghost" href="./prompts/${href(name)}" download>Download</a>
        </nav>
      </article>`;
    }
  }
} else {
  promptsHTML = `<p class="muted">No prompts folder found. Create <code class="notranslate" translate="no">/prompts</code> with .md/.txt/.json files.</p>`;
}

const promptsPage = layout({
  title: "Prompts — MCP Catalog",
  active: "prompts",
  body: `
<section>
  <h1>System Prompts</h1>
  <p>Curated prompts stored in the repository. Copy or download to use in your projects.</p>
  <div class="grid">${promptsHTML}</div>
</section>`
});

// ---------- build: Generator (skeleton for now) ----------
const generator = layout({
  title: "Generator — MCP Catalog",
  active: "generator",
  body: `
<section class="hero">
  <h1>Bootstrap your MCP server</h1>
  <p>Generate a ready-to-run skeleton (Local or Hosted), manifests, configs and a CI smoke test — all in your browser.</p>
  <div class="cta-row"><a class="btn" href="#start">Start wizard</a></div>
</section>
<section id="start">
  <h2>Wizard (coming soon)</h2>
  <ol class="steps">
    <li>Choose Local (STDIO) or Hosted (HTTP)</li>
    <li>Define tools/resources</li>
    <li>Get manifests, configs, and ZIP</li>
  </ol>
  <p class="muted">We do not collect any keys. Secrets remain on your machine.</p>
</section>`
});

// ---------- build: Protocol ----------
const protocol = layout({
  title: "Protocol — MCP Catalog",
  active: "protocol",
  body: `
<section>
  <h1>Model Context Protocol (MCP)</h1>
  <p>MCP is a protocol that standardizes how AI clients connect to external tools and data sources. It supports transports like STDIO (local) and HTTP (hosted), and primitives such as tools, resources, and prompts.</p>
  <ul>
    <li>Use <strong>Local (STDIO)</strong> servers for private data on your machine.</li>
    <li>Use <strong>Hosted (HTTP)</strong> servers to connect to SaaS providers.</li>
  </ul>
</section>`
});

// ---------- build: SDK & Tools ----------
const sdk = layout({
  title: "SDK & Tools — MCP Catalog",
  active: "sdk",
  body: `
<section>
  <h1>SDK & Tools</h1>
  <ul>
    <li><span class="notranslate" translate="no">MCP Inspector</span> — UI/CLI to explore any MCP server.</li>
    <li>Clients: <span class="notranslate" translate="no">Claude Desktop</span>, <span class="notranslate" translate="no">GitHub Copilot Chat</span>.</li>
  </ul>
</section>`
});

// ---------- build: FAQ ----------
const faq = layout({
  title: "FAQ — MCP Catalog",
  active: "faq",
  body: `
<section>
  <h1>FAQ</h1>
  <details><summary>What is the difference between Local and Hosted?</summary>
  <p>Local (STDIO) runs on your machine; Hosted (HTTP) is a remote endpoint. Both expose the same MCP primitives.</p></details>
  <details><summary>Where do I put API keys?</summary>
  <p>Never on this site. Put them in your local <code class="notranslate" translate="no">.env</code> or OS keychain, and pass via environment variables.</p></details>
</section>`
});

// ---------- write out pages ----------
fs.mkdirSync("site", { recursive: true });
fs.writeFileSync("site/index.html", home);
fs.writeFileSync("site/catalog.html", catalog);
fs.writeFileSync("site/prompts.html", promptsPage);
fs.writeFileSync("site/generator.html", generator);
fs.writeFileSync("site/protocol.html", protocol);
fs.writeFileSync("site/sdk.html", sdk);
fs.writeFileSync("site/faq.html", faq);

console.log("Built pages:", ["index","catalog","prompts","generator","protocol","sdk","faq"].join(", "));
