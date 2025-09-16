const STATE = { all: [], view: [], page: 1, perPage: 12, query: "", category: "", sort: "name", fuse: null };

const els = {
  list: document.getElementById("list"),
  pager: document.getElementById("pager"),
  skeleton: document.getElementById("skeleton"),
  q: document.getElementById("search"),
  cat: document.getElementById("category"),
  sort: document.getElementById("sort")
};

function showSkeleton(n = 12) { els.skeleton.innerHTML = ""; for (let i=0;i<n;i++){ const d=document.createElement("div"); d.className="skeleton"; els.skeleton.appendChild(d);} }
function hideSkeleton(){ els.skeleton.innerHTML = ""; }

function parseHash(){
  const h = new URLSearchParams(location.hash.replace(/^#\??/, ""));
  STATE.query = h.get("q") || "";
  STATE.category = h.get("cat") || "";
  STATE.sort = h.get("sort") || "name";
  STATE.page = parseInt(h.get("p") || "1", 10);
  els.q.value = STATE.query; els.cat.value = STATE.category; els.sort.value = STATE.sort;
}
function setHash(){
  const p = new URLSearchParams();
  if (STATE.query) p.set("q", STATE.query);
  if (STATE.category) p.set("cat", STATE.category);
  if (STATE.sort) p.set("sort", STATE.sort);
  if (STATE.page > 1) p.set("p", String(STATE.page));
  location.hash = "?" + p.toString();
}

function sortBy(arr, key){
  const A = [...arr];
  if (key === "stars") return A.sort((a,b)=>(b.meta?.github?.stars||0)-(a.meta?.github?.stars||0));
  if (key === "updated") return A.sort((a,b)=> new Date(b.meta?.updated||0) - new Date(a.meta?.updated||0));
  return A.sort((a,b)=> (a.name||"").localeCompare(b.name||""));
}

function applyFilters(){
  let data = [...STATE.all];
  if (STATE.category) data = data.filter(s => (s.meta?.category||"") === STATE.category);
  if (STATE.query){
    const res = STATE.fuse.search(STATE.query, { limit: 200 });
    data = res.map(r => r.item);
  }
  STATE.view = sortBy(data, STATE.sort);
}

function cardHTML(s){
  const desc = s.meta?.description || "Без описания";
  const hp = s.meta?.homepage || s.meta?.repo || "#";
  const badges = [s.meta?.category, s.meta?.license, (s.meta?.verified ? "verified" : "")]
    .filter(Boolean).map(x=> `<span class="badge">${x}</span>`).join("");
  const stars = s.meta?.github?.stars ? `★ ${s.meta.github.stars}` : "";
  const updated = s.meta?.updated ? new Date(s.meta.updated).toISOString().slice(0,10) : "";
  return `<article class="card" aria-label="${s.name}">
      <h2>${s.name}</h2>
      <p>${desc}</p>
      <div class="badges">${badges}</div>
      <p class="meta">${stars} ${updated ? " · обновлено: "+updated : ""}</p>
      <p><a href="${hp}" target="_blank" rel="noopener">Открыть</a></p>
    </article>`;
}

function renderList(){
  const start = (STATE.page - 1) * STATE.perPage;
  const pageItems = STATE.view.slice(start, start + STATE.perPage);
  els.list.innerHTML = pageItems.map(cardHTML).join("");
  const pages = Math.max(1, Math.ceil(STATE.view.length / STATE.perPage));
  const btn = i => `<button class="pill" ${i===STATE.page?'aria-current="page"':''} onclick="gotoPage(${i})">${i}</button>`;
  let around = [1, STATE.page-1, STATE.page, STATE.page+1, pages].filter((v,i,a)=> v>=1 && v<=pages && a.indexOf(v)===i).sort((a,b)=>a-b);
  els.pager.innerHTML = around.map(btn).join("");
  if (!pageItems.length){ els.list.innerHTML = `<div class="card"><h2>Пусто</h2><p>Измените фильтры или запрос.</p></div>`; els.pager.innerHTML=""; }
}

function gotoPage(p){ STATE.page = p; setHash(); renderList(); }

async function main(){
  parseHash(); showSkeleton();
  const res = await fetch("../registry/servers.index.json", { cache: "no-cache" });
  const json = await res.json();
  STATE.all = Array.isArray(json.servers) ? json.servers : [];
  STATE.fuse = new Fuse(STATE.all, { threshold: 0.35, minMatchCharLength: 2, keys: ["name","meta.description","meta.tags"] });
  applyFilters(); hideSkeleton(); renderList();
}

function debounce(fn, ms=250){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms)}; }
els.q.addEventListener("input", debounce(e=>{ STATE.query=e.target.value.trim(); STATE.page=1; setHash(); applyFilters(); renderList(); }));
els.cat.addEventListener("change", e=>{ STATE.category=e.target.value; STATE.page=1; setHash(); applyFilters(); renderList(); });
els.sort.addEventListener("change", e=>{ STATE.sort=e.target.value; setHash(); applyFilters(); renderList(); });
window.addEventListener("hashchange", ()=>{ parseHash(); applyFilters(); renderList(); });

main().catch(err=>{
  console.error("Init error:", err);
  hideSkeleton();
  els.list.innerHTML = `<div class="card"><h2>Ошибка загрузки</h2><p>Проверьте <code>registry/servers.index.json</code>.</p></div>`;
});


function normalizeIndex(data){
  const arr = Array.isArray(data) ? data : Array.isArray(data?.servers) ? data.servers : [];
  // берём только «реальные» карточки: есть имя и либо repo/homepage/manifest
  return arr.filter(x => typeof x === 'object' && x && (x.repo || x.homepage || x.manifest) && x.name);
}
