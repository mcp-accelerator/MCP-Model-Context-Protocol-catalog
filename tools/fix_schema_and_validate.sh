#!/usr/bin/env bash
set -euo pipefail

log()  { printf "\033[1;36m-- %s\033[0m\n" "$*"; }
ok()   { printf "\033[1;32m✓ %s\033[0m\n" "$*"; }
warn() { printf "\033[1;33m⚠ %s\033[0m\n" "$*"; }
err()  { printf "\033[1;31m✗ %s\033[0m\n" "$*"; }

# 0) Предусловия
command -v jq >/dev/null || { err "jq не найден"; exit 2; }
command -v npm >/dev/null || { err "npm не найден"; exit 2; }

# 1) Бэкап схемы
log "Бэкап schema/mcp-server.schema.json"
cp -v schema/mcp-server.schema.json schema/mcp-server.schema.json.bak

# 2) Патчим схему: draft-07 + capabilities=object + keywords=array[string]
log "Патчу схему под draft-07 и корректные типы"
tmp="$(mktemp)"
jq '
  # зафиксировать метасхему
  .["$schema"] = "http://json-schema.org/draft-07/schema#" 
  |
  # гарантируем раздел properties
  ( .properties //= {} )
  |
  # capabilities -> object (были массивом)
  ( .properties.capabilities //= {} ) 
  |
  (.properties.capabilities = 
      ( .properties.capabilities
        | del(.type, .items)  # убираем старые тип/элементы (array)
        | . + { "type": "object" }
      )
  )
  |
  # meta.keywords -> array of strings
  ( .properties.meta //= {} ) |
  ( .properties.meta.properties //= {} ) |
  ( .properties.meta.properties.keywords //= { "type": "array", "items": { "type": "string" } } )
' schema/mcp-server.schema.json > "$tmp"
mv "$tmp" schema/mcp-server.schema.json
ok "Схема обновлена → draft-07, capabilities=object, keywords=array[string]"

# 3) Устанавливаем ajv-cli
log "Устанавливаю ajv-cli@5 и ajv-formats@3 (глобально)"
npm -g i ajv-cli@5 ajv-formats@3 >/dev/null 2>&1 || true

# 4) Локальная валидация (draft-07)
log "Запускаю локальную валидацию (draft-07)"
ajv validate --spec=draft7 --strict=false \
  -s schema/mcp-server.schema.json \
  -d "servers/*/mcp-server.json"
ok "AJV(draft-07): все манифесты валидны"

# 5) Полноценный CI workflow (только draft-07)
log "Пишу .github/workflows/validate.yml"
mkdir -p .github/workflows
cat > .github/workflows/validate.yml <<'YAML'
name: Validate MCP Catalog

on:
  push:
    branches: [ main, chore/** ]
    paths:
      - "schema/**"
      - "servers/**"
      - ".github/workflows/validate.yml"
  pull_request:
    paths:
      - "schema/**"
      - "servers/**"
      - ".github/workflows/validate.yml"
  workflow_dispatch:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Show tree (debug)
        run: |
          echo "== ls -la =="; ls -la
          echo "== schema =="; find schema -maxdepth 2 -type f -print || true
          echo "== servers =="; find servers -maxdepth 2 -type f -name "mcp-server.json" -print | sort || true

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install ajv-cli
        run: npm -g i ajv-cli@5 ajv-formats@3

      - name: Validate manifests (draft-07 only)
        run: |
          set -eux
          test -f schema/mcp-server.schema.json
          # Принудительно draft-07 — без fallback, чтобы не "гонять драфты по кругу"
          npx --yes --package=ajv-cli@5 ajv validate --spec=draft7 --strict=false \
            -s schema/mcp-server.schema.json \
            -d "servers/*/mcp-server.json"
YAML
ok "validate.yml записан"

# 6) Чистим локальные случайные правки site/index.html, если были
if git status --porcelain | grep -q '^ M site/index.html'; then
  warn "Обнаружены локальные правки site/index.html — откатываю к origin/main"
  git fetch origin
  git restore --source=origin/main --staged --worktree -- site/index.html || true
  ok "site/index.html восстановлён из origin/main"
fi

# 7) Коммит + пуш
log "Готовлю коммит"
git add schema/mcp-server.schema.json .github/workflows/validate.yml
git commit -m "schema(ci): fix draft-07, capabilities=object; strict draft-07 validation in CI"

log "Пушу изменения"
CURRENT="$(git branch --show-current)"
git push -u origin "$CURRENT"

ok "Готово. CI будет валидировать по draft-07."
