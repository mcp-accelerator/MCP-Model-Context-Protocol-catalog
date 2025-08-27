#!/usr/bin/env python3
import os, json, re, pathlib, urllib.request, urllib.error
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[1]
SERVERS = ROOT / "servers"
REGISTRY = ROOT / "registry" / "servers.index.json"
SOURCES = ROOT / "sources.txt"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")

SERVERS.mkdir(parents=True, exist_ok=True)
REGISTRY.parent.mkdir(parents=True, exist_ok=True)

def gh_api(url):
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json"})
    if GITHUB_TOKEN:
        req.add_header("Authorization", f"Bearer {GITHUB_TOKEN}")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))

def gh_raw(owner, repo, ref, path):
    url = f"https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{path}"
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read()

def list_repos_in_org_or_user(owner):
    # попробуем как org, затем как user
    try:
        kind = gh_api(f"https://api.github.com/users/{owner}").get("type","User")
    except urllib.error.HTTPError:
        kind = "User"
    repos = []
    page = 1
    base = f"https://api.github.com/orgs/{owner}/repos" if kind=="Organization" else f"https://api.github.com/users/{owner}/repos"
    while True:
        data = gh_api(f"{base}?per_page=100&page={page}&type=public")
        if not data: break
        for x in data:
            if x.get("archived"): continue
            repos.append((owner, x["name"], x.get("default_branch","main")))
        page += 1
    return repos

def tree_paths(owner, repo, ref):
    data = gh_api(f"https://api.github.com/repos/{owner}/{repo}/git/trees/{ref}?recursive=1")
    for item in data.get("tree", []):
        p = item.get("path","")
        if p: yield p

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
    for p in tree_paths(owner, repo, ref):
        if p.endswith("mcp-server.json"):
            try:
                raw = gh_raw(owner, repo, ref, p)
                _ = json.loads(raw.decode("utf-8"))
                # имя по owner/repo/подкаталогу
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
            # возьмём кусочек пути
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
            ow, rp = full.split("/",1)
            info = gh_api(f"https://api.github.com/repos/{ow}/{rp}")
            ref = info.get("default_branch","main")
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
