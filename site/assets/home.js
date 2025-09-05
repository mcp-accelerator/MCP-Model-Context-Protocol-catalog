(async function(){
  const wrap = document.getElementById('home-hero');
  if(!wrap) return;
  try{
    const cfg = await fetch('config/home.json',{cache:'no-store'}).then(r=>r.json());
    const btns = (cfg.cta||[]).map(b=>`<a class="btn" href="${b.href}">${b.label}</a>`).join(' ');
    const video = cfg.video_url ? `<div class="video"><iframe src="${cfg.video_url.replace('watch?v=','embed/')}" frameborder="0" allowfullscreen></iframe></div>` : '';
    wrap.innerHTML = `
      <h1>${cfg.hero_title||''}</h1>
      <p class="lead">${cfg.hero_text||''}</p>
      <div class="cta">${btns}</div>
      ${video}
    `;
  }catch(e){ /* noop */ }
})();
