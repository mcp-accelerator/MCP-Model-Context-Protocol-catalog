#!/usr/bin/env python3
import json, pathlib, sys

p = pathlib.Path("schema/mcp-server.schema.json")
data = json.loads(p.read_text(encoding="utf-8"))

defs = data.get("definitions") or data.get("$defs") or {}
# Унифицированные определения для i18n
defs["i18nString"] = {
  "oneOf": [
    {"type":"string"},
    {"type":"object", "additionalProperties":{"type":"string"}}
  ]
}
defs["i18nStringArray"] = {
  "oneOf": [
    {"type":"array","items":{"type":"string"}},
    {"type":"object","additionalProperties":{"type":"array","items":{"type":"string"}}}
  ]
}

# Сохраним обратно в definitions или $defs — куда изначально было
if "definitions" in data:
  data["definitions"] = defs
else:
  data["$defs"] = defs

# Дойдём до meta.* и расширим только нужные поля
meta = (((data.get("properties") or {}).get("meta") or {}).get("properties") or {})
if "title" in meta:
  meta["title"] = {"$ref": "#/definitions/i18nString"} if "definitions" in data else {"$ref": "#/$defs/i18nString"}
if "description" in meta:
  meta["description"] = {"$ref": "#/definitions/i18nString"} if "definitions" in data else {"$ref": "#/$defs/i18nString"}
if "keywords" in meta:
  meta["keywords"] = {"$ref": "#/definitions/i18nStringArray"} if "definitions" in data else {"$ref": "#/$defs/i18nStringArray"}

# Запись
p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print("Schema patched: title/description -> i18nString, keywords -> i18nStringArray.")
