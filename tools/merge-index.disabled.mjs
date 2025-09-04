import fs from "node:fs";
import path from "node:path";

const readJson = p => JSON.parse(fs.readFileSync(p, "utf8"));
const exists = p => { try { fs.accessSync(p); return true; } catch { return false; } };

const root = process.cwd();
const serversDir = path.join(root, "servers");
const registryPath = path.join(root, "registry/servers.index.json");
const refPath = path.join(root, "tools/reference-servers.json");

const now = new Date().toISOString();

const ref = exists(refPath) ? readJson(refPath) : [];

const locals = [];
if (exists(serversDir)) {
  for (const id of fs.readdirSync(serversDir)) {
    const manifestPath = path.join(serversDir, id, "mcp-server.json");
    if (!exists(manifestPath)) continue;
    const m = readJson(manifestPath);

    const name = m.title || m.name || id;
    const meta = {
      category: m.category || m.meta?.category,
      license: m.license || m.meta?.license,
      verified: !!(m.badges || []).includes("verified") || !!m.meta?.verified,
      description: m.description || m.meta?.description,
      badges: m.badges || m.meta?.badges,
      homepage: m.homepage || m.meta?.homepage,
      repo: m.repo || m.repository || m.meta?.repo
    };

    locals.push({
      id,
      name,
      manifest: `servers/${id}/mcp-server.json`,
      protocol_min: "2025-06-18",
      // минимальные безопасные значения (можно уточнить позже)
      transports: ["streamable_http"],
      primitives: ["tools"],
      status: "draft",
      repo: meta.repo,
      homepage: meta.homepage,
      meta
    });
  }
}

const byId = new Map();
for (const s of [...locals, ...ref]) {
  if (!byId.has(s.id)) byId.set(s.id, s);
}

const merged = { updated_at: now, servers: [...byId.values()].sort((a,b)=>a.name.localeCompare(b.name)) };

fs.mkdirSync(path.dirname(registryPath), { recursive: true });
fs.writeFileSync(registryPath, JSON.stringify(merged, null, 2));
console.log("Wrote", registryPath, "with", merged.servers.length, "servers");
