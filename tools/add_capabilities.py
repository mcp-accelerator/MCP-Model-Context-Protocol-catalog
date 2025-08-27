#!/usr/bin/env python3
import json, pathlib
caps = {
  "telegram":["REST API","Webhooks"],
  "slack":["REST API","Webhooks","OAuth"],
  "notion":["REST API","OAuth"],
  "github":["REST API","Webhooks","OAuth","SDK Support"],
  "openai":["REST API","SDK Support"],
  "echo":["REST API"],
  "airtable":["REST API","SDK Support","OAuth"],
  "trello":["REST API","Webhooks","OAuth"],
}
root = pathlib.Path("servers")
changed=0
for name, arr in caps.items():
    p = root/name/"mcp-server.json"
    if not p.exists(): continue
    data = json.loads(p.read_text(encoding="utf-8"))
    meta = data.setdefault("meta",{})
    if not meta.get("capabilities"):
        meta["capabilities"] = arr
        p.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
        print("updated", p)
        changed+=1
print("done", changed)
