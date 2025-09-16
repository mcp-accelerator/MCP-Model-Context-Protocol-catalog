import fs from 'node:fs/promises';

const LOCAL = 'registry/servers.index.json';
const SCHEMA_PATH = 'schema/mcp-server-index.schema.json'; // <- проверьте имя/путь схемы индекса
const EXTERNAL = process.env.EXTERNAL_INDEX_URL
  || 'https://mcp-accelerator.github.io/mcp-registry/servers.index.json';

async function readJson(path) {
  try {
    const txt = await fs.readFile(path, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'mcp-catalog-ci/1.0' } });
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
  let idx = asArrayIndex(local);

  let source = 'local';
  if (idx.length === 0) {
    const ext = await fetchJson(EXTERNAL);
    idx = asArrayIndex(ext);
    source = 'external';
  }

  if (idx.length === 0) {
    console.error('Index schema validation failed: index is empty (local and external).');
    process.exit(1);
  }

  // Схема: валидируем через ajv-cli (она уже стоит в раннерах)
  // Выберем временный файл, чтобы нормализовать формат {servers:[...]}
  const normalized = { servers: idx };
  const tmp = '.tmp.index.json';
  await fs.writeFile(tmp, JSON.stringify(normalized), 'utf8');

  // ajv validate -s <schema> -d <data>
  const { spawn } = await import('node:child_process');
  await new Promise((resolve, reject) => {
    const p = spawn('ajv', ['validate', '-s', SCHEMA_PATH, '-d', tmp, '--strict=false'], { stdio: 'inherit' });
    p.on('exit', code => code === 0 ? resolve() : reject(new Error(`ajv exit ${code}`)));
  });

  console.log(`Index validation OK (source: ${source}, items: ${idx.length}).`);
}

main().catch(err => {
  console.error('Index schema validation failed:', err.message);
  process.exit(1);
});
