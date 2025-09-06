# MCP Catalog v3 — публичный реестр MCP‑серверов
[![Publish Pages] https://mcp-accelerator.github.io/MCP-Model-Context-Protocol-catalog/

Каталог предоставляет:
- **registry/servers.index.json** — индекс серверов
- **servers/*/mcp-server.json** — манифесты MCP
- **schema/** — JSON Schema (строгая валидация)
- **docs/** — правила, онбординг, метаданные
- **site/** — простая витрина (GitHub Pages)


## Добавление сервера (PR)
См. **docs/ADD_SERVER.md**. Вкратце:
- создайте `servers/<name>/mcp-server.json` (по схеме), добавьте в `registry/servers.index.json`,
- заполните `meta` (category, homepage, repo, license, badges),
- CI проверит JSON (ajv), после мерджа сервер появится на Pages.

## Метаданные и верификация
См. **docs/METADATA.md** и **docs/POLICY.md**. Для бейджа `verified` — требуется подтверждение владения репозиторием и минимальный чек‑лист качества.

Лицензия: MIT (см. LICENSE).
