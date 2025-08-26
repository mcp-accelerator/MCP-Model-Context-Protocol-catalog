# Примеры использования каталога

## Подключение в клиенте
Скачайте `registry/servers.index.json`, затем подгрузите соответствующие `servers/*/mcp-server.json`.

## Пример: Telegram post_message
- Манифест: `servers/telegram/mcp-server.json`
- Требуется `TELEGRAM_BOT_TOKEN`
- Инструмент: `telegram_mcp.post_message` (POST /sendMessage)

## Пример: GitHub create_issue
- Требуется `GITHUB_TOKEN`
- Инструмент: `github_mcp.create_issue` (POST /repos/{owner}/{repo}/issues`)
