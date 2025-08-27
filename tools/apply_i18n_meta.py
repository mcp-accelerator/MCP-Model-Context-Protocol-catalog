#!/usr/bin/env python3
import json, pathlib

# Переводы для 8 серверов
T = {
  "telegram": {
    "title": {"en":"Telegram","ru":"Telegram"},
    "description": {"en":"Send messages in Telegram","ru":"Отправка сообщений в Telegram"},
    "keywords": {"en":["telegram","bot","messages"], "ru":["telegram","бот","сообщения"]}
  },
  "slack": {
    "title": {"en":"Slack","ru":"Slack"},
    "description": {"en":"Post messages to Slack","ru":"Публикация сообщений"},
    "keywords": {"en":["slack","messages","chat"], "ru":["slack","сообщения","чат"]}
  },
  "notion": {
    "title": {"en":"Notion","ru":"Notion"},
    "description": {"en":"Create pages and databases","ru":"Создание страниц и базы данных"},
    "keywords": {"en":["notion","pages","databases"], "ru":["notion","страницы","базы данных"]}
  },
  "github": {
    "title": {"en":"GitHub","ru":"GitHub"},
    "description": {"en":"Issues, PRs, repositories","ru":"Issues, PRs, репозитории"},
    "keywords": {"en":["github","issues","pull requests","repos"], "ru":["github","issues","pull requests","репозитории"]}
  },
  "openai": {
    "title": {"en":"OpenAI","ru":"OpenAI"},
    "description": {"en":"LLM requests (compatible API)","ru":"LLM-запросы (совместимый API)"},
    "keywords": {"en":["openai","llm","api"], "ru":["openai","llm","api"]}
  },
  "echo": {
    "title": {"en":"Echo","ru":"Echo"},
    "description": {"en":"Demo httpbin endpoints","ru":"Демо эндпоинты httpbin"},
    "keywords": {"en":["demo","httpbin","echo"], "ru":["демо","httpbin","echo"]}
  },
  "airtable": {
    "title": {"en":"Airtable","ru":"Airtable"},
    "description": {"en":"Read and write Airtable tables/records","ru":"Чтение и запись таблиц/записей Airtable"},
    "keywords": {"en":["airtable","tables","records"], "ru":["airtable","таблицы","записи"]}
  },
  "trello": {
    "title": {"en":"Trello","ru":"Trello"},
    "description": {"en":"Create and move cards on Trello boards","ru":"Создание и перемещение карточек на досках Trello"},
    "keywords": {"en":["trello","boards","cards"], "ru":["trello","доски","карточки"]}
  }
}

ROOT = pathlib.Path("servers")
changed = 0

for name, tx in T.items():
    mf = ROOT / name / "mcp-server.json"
    if not mf.exists():
        print(f"skip: {mf} (not found)")
        continue
    data = json.loads(mf.read_text(encoding="utf-8"))
    meta = data.setdefault("meta", {})
    def upd(field, val):
        cur = meta.get(field)
        if cur != val:
            meta[field] = val
            return True
        return False
    ch = 0
    ch += upd("title", tx["title"])
    ch += upd("description", tx["description"])
    ch += upd("keywords", tx["keywords"])
    if ch:
        mf.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"updated: {mf} (+i18n)")
        changed += 1

print(f"done. manifests touched: {changed}")
