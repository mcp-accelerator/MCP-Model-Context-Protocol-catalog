# Как добавить MCP‑сервер

1) Создайте `servers/<name>/mcp-server.json` по схеме `schema/mcp-server.schema.json`.
2) Заполните `meta`: title, description, category, homepage, repo, license, badges, maintainers.
3) Добавьте запись в `registry/servers.index.json` (name, path, category, badges, homepage).
4) Откройте PR. CI (ajv) проверит JSON. После мерджа Pages обновятся автоматически.

Примечания:
- Секреты указывайте через `${env.VAR}`.
- Поддерживаемые категории: messaging, productivity, devtools, storage, ai, social, other.
- Бейджи: `verified` (прошёл минимальную проверку), `community` (от сообщества).
