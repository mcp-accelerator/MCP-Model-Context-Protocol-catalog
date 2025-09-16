import fs from 'node:fs/promises';

const LOCAL = 'registry/servers.index.json';
const EXTERNAL = process.env.EXTERNAL_INDEX_URL
  || 'https://mcp-accelerator.github.io/mcp-registry/servers.index.json';
const OUT = 'dist/registry/servers.index.json';

async function readJson(path) {
  try {
    const txt = await fs.readFile(path, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'mcp-catalog-build/1.0' } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.json();
}

function asArrayIndex(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.servers)) return data.servers;
  return [];
}

async function main() {
  const local = await readJson(LOCAL);
  let arr = asArrayIndex(local);
  let source = 'local';

  if (arr.length === 0) {
    const ext = await fetchJson(EXTERNAL);
    arr = asArrayIndex(ext);
    source = 'external';
  }
  if (arr.length === 0) throw new Error('Both local and external indexes are empty');

  const normalized = { servers: arr };
  await fs.mkdir('dist/registry', { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(normalized), 'utf8');
  console.log(`Wrote ${OUT} (source: ${source}, items: ${arr.length})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
