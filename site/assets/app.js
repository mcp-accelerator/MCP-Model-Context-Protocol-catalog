(function(){
  // Copy buttons
  addEventListener("click", e=>{
    const b = e.target.closest(".copy");
    if (!b) return;
    const val = b.getAttribute("data-copy") || "";
    navigator.clipboard.writeText(val).then(()=>{
      const old = b.textContent;
      b.textContent = "Copied!";
      setTimeout(()=>b.textContent = old || "Copy", 1200);
    });
  });

  // Simple client-side filters on Catalog
  const q = document.getElementById("q");
  const fType = document.getElementById("f-type");
  const fPrim = document.getElementById("f-prim");
  const cards = document.getElementById("cards");
  if (q && fType && fPrim && cards) {
    const all = Array.from(cards.children);
    function apply(){
      const text = (q.value || "").toLowerCase();
      const type = fType.value;
      const prim = fPrim.value;
      all.forEach(card=>{
        const title = card.querySelector(".card-title")?.textContent.toLowerCase() || "";
        const meta = card.querySelector(".meta")?.textContent.toLowerCase() || "";
        const okText = !text || title.includes(text) || meta.includes(text);
        const okType = !type || meta.includes(type);
        const okPrim = !prim || card.innerHTML.includes(`<strong>Primitives:</strong> ${prim}`) || card.innerHTML.includes(`· ${prim}`);
        card.style.display = (okText && okType && okPrim) ? "" : "none";
      });
    }
    [q, fType, fPrim].forEach(el=>el.addEventListener("input", apply));
    apply();
  }
})();
