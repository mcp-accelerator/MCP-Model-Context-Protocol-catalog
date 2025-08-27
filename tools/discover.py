#!/usr/bin/env python3
import os, json, re, pathlib, urllib.request, urllib.error
from urllib.parse import urlparse, quote

ROOT = pathlib.Path(__file__).resolve().parents[1]
SERVERS = ROOT / "servers"
REGISTRY = ROOT / "registry" / "servers.index.json"
SOURCES = ROOT / "sources.txt"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")

SERVERS.mkdir(parents=True, exist_ok=True)
REGISTRY.parent.mkdir(parents=True, exist_ok=True)

def _req(url, headers=None):
    h = {"Accept":"application/vnd.github+json"}
    if headers: h.update(headers)
    if GITHUB_TOKEN and "Authorization" not in h:
        h["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    r = urllib.request.Request(url, headers=h)
    return urllib.request.urlopen(r, timeout=30)

def gh_api(url):
    with _req(url) as r:
        return json.loads(r.read().decode("utf-8"))

def gh_raw(owner, repo, ref, path):
    url = f"https://raw.githubusercontent.com/{owner}/{repo}/{quote(ref)}/{path}"
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read()

def list_repos_in_org_or_user(owner):
    # определяем тип (Org/User), потом пагинируем
    try:
        kind = gh_api(f"https://api.github.com/users/{owner}").get("type","User")
    except urllib.error.HTTPError:
        kind = "User"
    base = f"https://api.github.com/orgs/{owner}/repos" if kind=="Organization" else f"https://api.github.com/users/{owner}/repos"
    repos, page = [], 1
    while True:
        data = gh_api(f"{base}?per_page=100&page={page}&type=public")
        if not data: break
        for x in data:
            if x.get("archived"): continue
            repos.append((owner, x["name"], x.get("default_branch","main")))
        page += 1
    return repos

def code_search_paths(owner, repo):
    # Используем Code Search API, чтобы найти только mcp-server.json
    # Документация: GET /search/code?q=filename:mcp-server.json repo:owner/repo
    # Важно: квери URL-энкодим.
    q = quote(f"filename:mcp-server.json repo:{owner}/{repo}")
    url = f"https://api.github.com/search/code?q={q}&per_page=100"
    try:
        data = gh_api(url)
        for item in data.get("items", []):
            path = item.get("path")
            if path and path.endswith("mcp-server.json"):
                yield path
    except urllib.error.HTTPError as e:
        # Часто 422/404 на пустых/форках — тихо пропускаем
        return

def safe_name(s):
    s = re.sub(r"[^a-zA-Z0-9_-]+","-", s.strip().lower()).strip("-")
    return s or "server"

def save_manifest(name, content):
    target = SERVERS / safe_name(name) / "mcp-server.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "wb") as f:
        f.write(content)

def try_repo(owner, repo, ref):
    found = 0
    for p in code_search_paths(owner, repo):
        try:
            raw = gh_raw(owner, repo, ref, p)
            data = json.loads(raw.decode("utf-8"))
            sub = pathlib.Path(p).parent.name or "root"
            name = f"{owner}-{repo}-{sub}"
            save_manifest(name, raw)
            found += 1
        except Exception:
            continue
    return found

def try_url(url):
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            raw = r.read()
        data = json.loads(raw.decode("utf-8"))
        meta = data.get("meta", {})
        title = meta.get("title")
        if isinstance(title, dict):
            title = title.get("en") or title.get("ru")
        if not title:
            title = pathlib.Path(urlparse(url).path).parent.name or "server"
        save_manifest(title, raw)
        return 1
    except Exception:
        return 0

def read_sources():
    for line in SOURCES.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"): continue
        yield line

def build_index():
    items = []
    for d in sorted(SERVERS.iterdir()):
        mf = d / "mcp-server.json"
        if not mf.exists(): continue
        try:
            data = json.loads(mf.read_text(encoding="utf-8"))
            meta = data.get("meta", {})
            items.append({
                "name": d.name,
                "path": f"servers/{d.name}/mcp-server.json",
                "category": meta.get("category","other"),
                "homepage": meta.get("homepage",""),
                "badges": meta.get("badges",[])
            })
        except Exception:
            continue
    REGISTRY.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"registry updated: {REGISTRY} ({len(items)} items)")

def main():
    total = 0
    for src in read_sources():
        if src.startswith("org:"):
            owner = src.split(":",1)[1].strip()
            for ow, rp, ref in list_repos_in_org_or_user(owner):
                total += try_repo(ow, rp, ref)
        elif src.startswith("repo:"):
            full = src.split(":",1)[1].strip()
            if "/" not in full: 
                print(f"skip malformed repo source: {full}")
                continue
            ow, rp = full.split("/",1)
            try:
                info = gh_api(f"https://api.github.com/repos/{ow}/{rp}")
                ref = info.get("default_branch","main")
            except urllib.error.HTTPError:
                ref = "main"
            total += try_repo(ow, rp, ref)
        elif src.startswith("url:"):
            url = src.split(":",1)[1].strip()
            total += try_url(url)
        else:
            print(f"skip unknown source: {src}")
    build_index()
    print(f"done, manifests fetched: {total}")

if __name__ == "__main__":
    main()
