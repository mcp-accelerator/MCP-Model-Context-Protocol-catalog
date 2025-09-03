# MCP Catalog v3 — публичный реестр MCP‑серверов

[![Validate MCP Catalog](https://github.com/BogdanAIP/MCP-Model-Context-Protocol-catalog/actions/workflows/validate.yml/badge.svg)](https://github.com/BogdanAIP/MCP-Model-Context-Protocol-catalog/actions/workflows/validate.yml)
[![Publish Pages](https://github.com/BogdanAIP/MCP-Model-Context-Protocol-catalog/actions/workflows/pages.yml/badge.svg)](https://github.com/BogdanAIP/MCP-Model-Context-Protocol-catalog/actions/workflows/pages.yml)

Каталог предоставляет:
- **registry/servers.index.json** — индекс серверов
- **servers/*/mcp-server.json** — манифесты MCP
- **schema/** — JSON Schema (строгая валидация)
- **docs/** — правила, онбординг, метаданные
- **site/** — простая витрина (GitHub Pages)

## Быстрый старт
1. Включите GitHub Pages (Settings → Pages → GitHub Actions).
2. Push в `main`: каталожные JSON публикуются и доступны по адресу:
   `https://mcp-accelerator.github.io/MCP-Model-Context-Protocol-catalog/site/
3. Простая витрина: `https://mcp-accelerator.github.io/MCP-Model-Context-Protocol-catalog/site/

## Добавление сервера (PR)
См. **docs/ADD_SERVER.md**. Вкратце:
- создайте `servers/<name>/mcp-server.json` (по схеме), добавьте в `registry/servers.index.json`,
- заполните `meta` (category, homepage, repo, license, badges),
- CI проверит JSON (ajv), после мерджа сервер появится на Pages.

## Метаданные и верификация
См. **docs/METADATA.md** и **docs/POLICY.md**. Для бейджа `verified` — требуется подтверждение владения репозиторием и минимальный чек‑лист качества.

Лицензия: MIT (см. LICENSE).
