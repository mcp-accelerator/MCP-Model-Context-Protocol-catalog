import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';

const AJV = 'npx';
const AJV_ARGS = ['ajv', 'validate', '--spec=draft7', '--strict=false'];

const INDEX_IN  = 'registry/servers.index.json';
const INDEX_TMP = '.tmp.index.json';
const SCHEMA_INDEX = 'schema/servers.index.schema.json';   // <- верное имя
const SCHEMA_SERVER = 'schema/mcp-server.schema.json';

function sh(bin, args) {
  execFileSync(bin, args, { stdio: 'inherit' });
}

function main() {
  // 1) Подготовить плоский индекс: корень-массив
  const raw = JSON.parse(readFileSync(INDEX_IN, 'utf8'));
  const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.servers) ? raw.servers : []);
  if (!arr.length) {
    console.error('Index schema validation failed: /servers must NOT have fewer than 1 items');
    process.exit(1);
  }
  writeFileSync(INDEX_TMP, JSON.stringify(arr));

  // 2) Валидировать индекс и отдельные манифесты
  sh(AJV, [...AJV_ARGS, '-s', SCHEMA_INDEX, '-d', INDEX_TMP]);
  const hasServerSchema = existsSync(SCHEMA_SERVER);
  if (hasServerSchema) {
    sh(AJV, [...AJV_ARGS, '-s', SCHEMA_SERVER, '-d', 'servers/*/mcp-server.json']);
  }

  // 3) Уборка
  rmSync(INDEX_TMP, { force: true });
}
main();
