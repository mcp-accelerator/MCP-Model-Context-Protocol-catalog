#!/usr/bin/env bash
set -Eeuo pipefail
URL="https://mcp-accelerator.github.io/mcp-registry/servers.index.json"
curl -fsSL "$URL" -o .tmp.index.json
# индекс в mcp-registry — массив карточек; иногда может быть объектом c .servers
LEN=$(jq 'if type=="array" then length elif type=="object" and has("servers") then (.servers|length) else 0 end' .tmp.index.json)
test "$LEN" -gt 0 || { echo "Index is empty or invalid (len=$LEN)"; exit 1; }
echo "OK: external index length=$LEN"
rm -f .tmp.index.json
