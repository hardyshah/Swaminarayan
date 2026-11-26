/* Site-wide collaboration layer: the floating "Contribute" button and panel (comment, suggest an edit, upload),
   the admin's announcement banner, the members-only gate and maintenance mode.
   Loaded on every page by site/sp.js. Pages that are part of the collab area (login, me, admin) set window.SPC_PAGE. */
(function(){
"use strict";
if(window.__spcWidget)return;window.__spcWidget=true;
const me=document.currentScript&&document.currentScript.src||"";
const BASE=me.replace(/site\/collab\/collab\.js.*$/,"");
const load=src=>new Promise((res,rej)=>{if(document.querySelector(`script[data-spc="${src}"]`))return res();const s=document.createElement("script");s.src=BASE+src;s.dataset.spc=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const STATUS={open:["Open, waiting for the team","ખુલ્લી"],acknowledged:["Seen, action in progress","સ્વીકારી"],pending:["Waiting for review","સમીક્ષા બાકી"],approved:["Approved","મંજૂર"],rejected:["Not accepted","નામંજૂર"],changes:["Changes asked","ફેરફાર માગ્યા"]};
const KIND={comment:"Comment",edit:"Edit suggestion",upload:"Upload",event:"Event"};
let S=null,SESSION=null,SETTINGS=null,lastSel="",curAnchor=null,PAGE_ROWS=[];

const CSS=`
.spc-fab{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:max(14px,env(safe-area-inset-bottom,0px));z-index:95;display:flex;align-items:center;gap:8px;height:44px;padding:0 16px 0 6px;border-radius:999px;border:1px solid var(--sp-line,rgba(0,0,0,.14));background:var(--sp-card,#fff);color:var(--sp-ink,#222);box-shadow:0 6px 20px rgba(40,30,70,.18);cursor:pointer;font:600 14px/1 system-ui,-apple-system,"Segoe UI",sans-serif}
.spc-fab .av{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--sp-acc,#c2410c);color:#fff;font-size:14px}
.spc-fab .bd{min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#b3261e;color:#fff;font-size:11px;display:grid;place-items:center}
.spc-fab:hover{transform:translateY(-1px)}
.spc-veil{position:fixed;inset:0;z-index:98;background:rgba(10,12,20,.35);backdrop-filter:blur(2px);opacity:0;transition:opacity .2s}
.spc-veil.on{opacity:1}
.spc-sheet{position:fixed;z-index:99;left:0;top:0;bottom:0;width:min(440px,100vw);background:var(--sp-card,#fff);color:var(--sp-ink,#222);box-shadow:8px 0 40px rgba(0,0,0,.2);display:flex;flex-direction:column;transform:translateX(-102%);transition:transform .25s ease;font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
.spc-sheet.on{transform:none}
.spc-sheet header{padding:16px 18px 10px;border-bottom:1px solid var(--sp-line,rgba(0,0,0,.12));display:flex;gap:10px;align-items:flex-start}
.spc-sheet header h2{margin:0;font-size:18px;line-height:1.25;flex:1}.spc-sheet header h2 small{display:block;font-size:12.5px;font-weight:500;opacity:.7;margin-top:2px}
.spc-x{border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:inherit;padding:4px 8px;border-radius:8px}
.spc-body{overflow:auto;padding:14px 18px 24px;flex:1}
.spc-tabs{display:flex;gap:4px;background:rgba(127,127,127,.12);padding:4px;border-radius:12px;margin-bottom:12px}
.spc-tabs button{flex:1;border:0;background:none;padding:8px 4px;border-radius:9px;cursor:pointer;font:inherit;font-size:13.5px;color:inherit}
.spc-tabs button[aria-selected=true]{background:var(--sp-card,#fff);box-shadow:0 1px 3px rgba(0,0,0,.15);font-weight:600}
.spc-f{display:grid;gap:10px}.spc-f label{display:grid;gap:4px;font-size:13px;font-weight:600}
.spc-f input[type=text],.spc-f textarea,.spc-f input[type=file]{font:inherit;font-weight:400;font-size:14.5px;padding:9px 11px;border:1px solid var(--sp-line,rgba(0,0,0,.18));border-radius:10px;background:transparent;color:inherit;width:100%;box-sizing:border-box}
.spc-f textarea{min-height:96px;resize:vertical}
.spc-q{border-left:3px solid var(--sp-acc,#c2410c);padding:6px 10px;background:rgba(127,127,127,.08);border-radius:0 8px 8px 0;font-size:13.5px;white-space:pre-wrap;max-height:120px;overflow:auto}
.spc-btn{border:0;border-radius:10px;padding:10px 16px;font:inherit;font-weight:600;cursor:pointer;background:var(--sp-acc,#c2410c);color:#fff}
.spc-btn.ghost{background:none;border:1px solid var(--sp-line,rgba(0,0,0,.18));color:inherit}
.spc-btn:disabled{opacity:.5;cursor:default}
.spc-msg{font-size:13.5px;padding:8px 10px;border-radius:10px;background:rgba(127,127,127,.1)}.spc-msg.bad{background:rgba(179,38,30,.12);color:#b3261e}.spc-msg.ok{background:rgba(47,125,50,.12);color:#2f7d32}
.spc-chk{list-style:none;margin:0;padding:0;display:grid;gap:4px;font-size:13px}.spc-chk li::before{content:"✓ ";color:#2f7d32}.spc-chk li.bad::before{content:"✕ ";color:#b3261e}.spc-chk li.warn::before{content:"! ";color:#b26b00}
.spc-h3{font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.65;margin:20px 0 8px;font-weight:700}
.spc-item{border:1px solid var(--sp-line,rgba(0,0,0,.12));border-radius:12px;padding:10px 12px;margin-bottom:8px;font-size:14px}
.spc-item .meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:12px;opacity:.85;margin-bottom:4px}
.spc-chip{display:inline-block;border-radius:999px;padding:1px 8px;font-size:11.5px;font-weight:600;background:rgba(127,127,127,.15)}
.spc-chip.pending{background:#fff1d6;color:#8a5300}.spc-chip.approved{background:#dff3e0;color:#1f6a24}.spc-chip.rejected{background:#fde2df;color:#9b1c14}.spc-chip.changes{background:#e3ecff;color:#2446a8}
.spc-item p{margin:4px 0 0;white-space:pre-wrap}.spc-item img,.spc-item video{max-width:100%;border-radius:8px;margin-top:6px}.spc-item audio{width:100%;margin-top:6px}
.spc-note{font-size:12.5px;margin-top:6px;padding:6px 8px;border-radius:8px;background:rgba(127,127,127,.1)}
.spc-who{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:12px;background:rgba(127,127,127,.08);margin-bottom:12px;font-size:14px;flex-wrap:wrap}
.spc-who a{color:var(--sp-acc,#c2410c);font-weight:600}
.spc-ban{position:relative;z-index:30;padding:9px 44px 9px 16px;text-align:center;font:500 14px/1.4 system-ui,sans-serif;background:#0e5a61;color:#fff}
.spc-ban.warn{background:#9a4507}.spc-ban.good{background:#2f7d32}.spc-ban button{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:none;color:inherit;font-size:20px;cursor:pointer}
.spc-wall{position:fixed;inset:0;z-index:200;background:var(--sp-card,#fff);color:var(--sp-ink,#222);display:grid;place-items:center;text-align:center;padding:24px;font:16px/1.5 system-ui,sans-serif}
.spc-wall h1{font-size:24px;margin:0 0 8px}
.spc-demo{font-size:12px;padding:6px 10px;border-radius:8px;background:#fff1d6;color:#8a5300;margin-bottom:12px}
@media (prefers-color-scheme:dark){.spc-chip.pending{background:#4a3410;color:#ffd58a}.spc-chip.approved{background:#173a1b;color:#9fe0a4}.spc-chip.rejected{background:#4a1a16;color:#ffb3ab}.spc-chip.changes{background:#1c2b52;color:#aac0ff}.spc-demo{background:#4a3410;color:#ffd58a}}
.spc-chip.open{background:#fff1d6;color:#8a5300}.spc-chip.acknowledged{background:#e3ecff;color:#2446a8}
.spc-pin{display:inline-flex;gap:4px;align-items:center;margin-left:6px;vertical-align:middle;opacity:.55;transition:opacity .15s;white-space:nowrap;font:500 11.5px/1 system-ui,-apple-system,"Segoe UI",sans-serif}
.spc-pin a,.spc-pin button{display:inline-flex!important;align-items:center;gap:3px;height:22px!important;padding:0 8px!important;margin:0!important;border-radius:999px!important;border:1px solid var(--sp-line,rgba(0,0,0,.18))!important;background:var(--sp-card,#fff)!important;color:var(--sp-ink,#333)!important;cursor:pointer;text-decoration:none!important;font:500 11.5px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;box-shadow:none!important;width:auto!important;min-width:0!important}
.spc-pin a:hover,.spc-pin button:hover{border-color:var(--sp-acc,#c2410c)!important;color:var(--sp-acc,#c2410c)!important}
.spc-pin .has{border-color:var(--sp-acc,#c2410c)!important;color:var(--sp-acc,#c2410c)!important;font-weight:700!important}.spc-pin .nos{border-style:dashed;opacity:.8}
.spc-anc:hover>.spc-pin,.spc-anc:focus-within>.spc-pin,.spc-pin:hover,.spc-pin.lit{opacity:1}
td>.spc-pin{float:right}
.spc-hl{outline:3px solid var(--sp-acc,#c2410c)!important;outline-offset:3px;border-radius:6px;animation:spcGlow 1.4s ease-in-out 3}
@keyframes spcGlow{50%{outline-color:transparent}}
body.spc-picking *{cursor:crosshair!important}.spc-pickhov{outline:2px dashed var(--sp-acc,#c2410c)!important;outline-offset:2px;background:color-mix(in srgb,var(--sp-acc,#c2410c) 8%,transparent)!important}
.spc-pickbar{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:120;background:var(--sp-ink,#222);color:var(--sp-card,#fff);padding:10px 16px;border-radius:12px;font:600 14px system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.3);display:flex;gap:12px;align-items:center}
.spc-pickbar button{border:0;background:rgba(255,255,255,.2);color:inherit;border-radius:8px;padding:5px 10px;cursor:pointer;font:inherit}
.spc-anc-q{display:flex;gap:8px;align-items:flex-start}.spc-anc-q .spc-q{flex:1}
.spc-od{background:#b3261e!important;color:#fff!important;animation:spcFlash 1s steps(2,start) infinite}
@keyframes spcFlash{to{visibility:hidden}}
.spc-due{font-size:11.5px;font-weight:700;padding:1px 7px;border-radius:999px;background:rgba(127,127,127,.15)}.spc-due.late{background:#b3261e;color:#fff;animation:spcBlink 1.2s ease-in-out infinite}
@keyframes spcBlink{50%{opacity:.35}}
.spc-count{font-size:12.5px;opacity:.8}
@media (prefers-reduced-motion:reduce){.spc-od,.spc-due.late,.spc-hl{animation:none}}
@media print{.spc-fab,.spc-ban,.spc-pin{display:none}}
@media (prefers-reduced-motion:reduce){.spc-sheet,.spc-veil{transition:none}}`;

function css(){if(document.getElementById("spcollab-css"))return;const s=document.createElement("style");s.id="spcollab-css";s.textContent=CSS;document.head.appendChild(s)}

async function boot(){
  try{if(!window.SPC_CONFIG)await load("site/collab/config.js");if(!window.SPC)await load("site/collab/store.js");S=window.SPC;await S.whenReady()}catch(e){console.warn("collab layer unavailable",e);return}
  css();SETTINGS=await S.getSettings().catch(()=>S.DEFAULT_SETTINGS);SESSION=await S.session().catch(()=>null);
  const page=window.SPC_PAGE||"";
  // members-only gate (soft: hides pages from visitors who are not signed in) and maintenance mode
  if(page!=="login"){
    if(SETTINGS.features.gate&&!S.verified(SESSION)){location.replace(BASE+"login.html?next="+encodeURIComponent(location.href));return}
    if(SETTINGS.features.maintenance&&!(SESSION&&S.isAdmin(SESSION.profile))){const w=document.createElement("div");w.className="spc-wall";w.innerHTML=`<div><h1>થોડી વારમાં પાછા આવીએ છીએ</h1><p>The site is being updated and will be back soon. Jay Swaminarayan.</p><p><a href="${BASE}login.html">Admin sign in</a></p></div>`;document.body.appendChild(w);return}
  }
  banner();
  if(!page||page==="me")fab();
  document.addEventListener("selectionchange",()=>{const s=String(getSelection()||"").trim();if(s&&!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest(".spc-sheet")))lastSel=s.slice(0,1200)});
  S.on("auth",async s=>{SESSION=s;paintFab();pins()});S.on("contrib",()=>{paintFab();pins();if(sheet&&sheet.classList.contains("on"))renderList()});
  if(!page){pins();let pt=null;new MutationObserver(ms=>{if(ms.every(m=>m.target.closest&&m.target.closest(".spc-sheet,.spc-pin,.spc-fab,.sp-aura,.sp-spark,.sp-mandala,.sp-orbit")))return;clearTimeout(pt);pt=setTimeout(pins,600)}).observe(document.body,{childList:true,subtree:true});
    deepLink();addEventListener("hashchange",deepLink)}
  S.on("settings",s=>{SETTINGS=s;banner()});
}

function banner(){const old=document.querySelector(".spc-ban");if(old)old.remove();const a=SETTINGS.announcement||{};if(!a.on||!a.text)return;
  let k="spc-ban-x";try{if(sessionStorage.getItem(k)===a.text)return}catch(e){}
  const b=document.createElement("div");b.className="spc-ban "+(a.tone||"info");b.setAttribute("role","status");b.innerHTML=esc(a.text)+'<button aria-label="Hide announcement">×</button>';
  b.querySelector("button").onclick=()=>{b.remove();try{sessionStorage.setItem(k,a.text)}catch(e){}};document.body.prepend(b)}

/* ---------- floating button ---------- */
let fabEl=null,sheet=null,veil=null,tab="comment";
function fab(){fabEl=document.createElement("button");fabEl.type="button";fabEl.className="spc-fab";fabEl.setAttribute("aria-haspopup","dialog");fabEl.onclick=open;document.body.appendChild(fabEl);paintFab()}
async function paintFab(){if(!fabEl)return;const p=SESSION&&SESSION.profile;let badge="";
  if(p&&S.verified(SESSION)){try{const mine=await S.listMine();const n=mine.filter(c=>c.status==="changes").length;if(n)badge=`<span class="bd" title="Items that need your attention">${n}</span>`}catch(e){}
    if(S.isResolver(p)){try{const cs=await S.adminComments();const od=cs.filter(S.isOverdue).length;if(od)badge+=`<span class="bd spc-od" title="${od} comments older than 24 hours">⚠ ${od}</span>`;else if(cs.length)badge+=`<span class="bd" style="background:#2446a8" title="Open comments">💬 ${cs.length}</span>`}catch(e){}}}
  fabEl.innerHTML=`<span class="av" aria-hidden="true">${p?esc((p.name||p.email||"?").trim()[0].toUpperCase()):"✎"}</span><span>યોગદાન · Contribute</span>${badge}`;
  fabEl.setAttribute("aria-label",p?`Contribute, signed in as ${p.name||p.email}`:"Contribute (sign in needed)")}

function open(){if(!sheet)build();veil.hidden=false;requestAnimationFrame(()=>{veil.classList.add("on");sheet.classList.add("on")});render();setTimeout(()=>{const f=sheet.querySelector("textarea,input,a,button.spc-x");f&&f.focus()},250);document.addEventListener("keydown",keyClose)}
function close(){sheet.classList.remove("on");veil.classList.remove("on");setTimeout(()=>{veil.hidden=true},220);document.removeEventListener("keydown",keyClose);fabEl&&fabEl.focus()}
function keyClose(e){if(e.key==="Escape")close()}
function build(){veil=document.createElement("div");veil.className="spc-veil";veil.hidden=true;veil.onclick=close;
  sheet=document.createElement("aside");sheet.className="spc-sheet";sheet.setAttribute("role","dialog");sheet.setAttribute("aria-modal","true");sheet.setAttribute("aria-labelledby","spc-t");
  sheet.innerHTML=`<header><h2 id="spc-t">યોગદાન · Contribute<small>${esc(document.title||"This page")}</small></h2><button class="spc-x" aria-label="Close">×</button></header><div class="spc-body"></div>`;
  sheet.querySelector(".spc-x").onclick=close;document.body.append(veil,sheet)}

function render(){const b=sheet.querySelector(".spc-body"),p=SESSION&&SESSION.profile;
  const demo=S.mode==="demo"?`<div class="spc-demo">Demo mode: everything stays in this browser until the site is connected to its database.</div>`:"";
  if(p&&!S.verified(SESSION)){b.innerHTML=demo+`<p>Please finish verifying your email and mobile number to comment, suggest edits or upload.</p><p><a class="spc-btn" style="display:inline-block;text-decoration:none" href="${BASE}login.html?next=${encodeURIComponent(location.href)}">Verify now</a></p><div class="spc-h3">On this page</div><div id="spc-list"></div>`;renderList();return}
  if(!p){b.innerHTML=demo+`<p>Comments, edit suggestions and uploads are open to invited members only.</p><p>આમંત્રિત સભ્યો જ યોગદાન આપી શકે છે.</p>
    <p><a class="spc-btn" style="display:inline-block;text-decoration:none" href="${BASE}login.html?next=${encodeURIComponent(location.href)}">Sign in · પ્રવેશ</a></p><div class="spc-h3">On this page</div><div id="spc-list"></div>`;renderList();return}
  const F=SETTINGS.features;
  b.innerHTML=demo+`<div class="spc-who"><span>🙏 ${esc(p.name||p.email)}</span><a href="${BASE}me.html">My Satsang</a>${S.isAdmin(p)?`<a href="${BASE}admin.html">Admin</a>`:S.isResolver(p)?`<a href="${BASE}admin.html#comments">Comment queue</a>`:""}<a href="#" data-out>Sign out</a></div>
  <div class="spc-tabs" role="tablist">
    <button role="tab" data-t="comment" aria-selected="${tab==="comment"}" ${F.comments?"":"disabled"}>💬 Comment</button>
    <button role="tab" data-t="edit" aria-selected="${tab==="edit"}" ${F.edits?"":"disabled"}>✎ Suggest edit</button>
    <button role="tab" data-t="upload" aria-selected="${tab==="upload"}" ${F.uploads?"":"disabled"}>⬆ Upload</button></div>
  <form class="spc-f" id="spc-form"></form><div class="spc-h3">On this page</div><div id="spc-list"></div>`;
  b.querySelector("[data-out]").onclick=async e=>{e.preventDefault();await S.signOut();SESSION=null;render()};
  b.querySelectorAll("[data-t]").forEach(x=>x.onclick=()=>{tab=x.dataset.t;render()});
  form();renderList()}

function form(){const f=sheet.querySelector("#spc-form");
  if(tab==="comment")f.innerHTML=`<div class="spc-anc-q">${curAnchor?`<div class="spc-q" aria-label="Commenting on">${esc(curAnchor.label)}</div><button type="button" class="spc-btn ghost" data-clr title="Comment on the whole page instead" style="padding:6px 10px">×</button>`:`<span style="font-size:13.5px;flex:1">Commenting on the whole page.</span>`}</div>
    ${curAnchor&&curAnchor.src?`<div style="font-size:13px">Source given on the page: <a href="${esc(curAnchor.src)}" target="_blank" rel="noopener">${esc(curAnchor.srcText||curAnchor.src)}</a></div>`:curAnchor?`<div style="font-size:13px;opacity:.8">No source link next to this yet. If you know one, add it to your comment.</div>`:""}
    <button type="button" class="spc-btn ghost" data-pick>📍 Pick a spot on the page</button>
    <label>Your comment · ટિપ્પણી<textarea name="body" required maxlength="4000" placeholder="Share a thought, a correction or a reference…"></textarea></label><span class="spc-count" id="spc-cnt"></span><button class="spc-btn">Send for review</button><div id="spc-out"></div>`;
  if(tab==="edit")f.innerHTML=`<p style="margin:0;font-size:13.5px">Select the words on the page you want changed, then open this panel. They appear below.</p>
    ${lastSel?`<div class="spc-q" aria-label="Selected text">${esc(lastSel)}</div>`:`<label>What should change? (part of the page)<input type="text" name="target" maxlength="300" placeholder="e.g. the date of the Loj event"></label>`}
    <label>Suggested wording or correction<textarea name="body" required maxlength="8000"></textarea></label><label>Source (book, page, link) · સંદર્ભ<input type="text" name="title" maxlength="200" placeholder="e.g. Shri Swaminarayanam, page 112"></label>
    <button class="spc-btn">Send suggestion</button><div id="spc-out"></div>`;
  if(tab==="upload")f.innerHTML=`<label>File (photo, PDF, audio, video, text; up to ${SETTINGS.uploads.maxMB} MB)<input type="file" name="file" required></label><ul class="spc-chk" id="spc-chk"></ul>
    <label>Title<input type="text" name="title" required maxlength="200" placeholder="What is it?"></label><label>Details and source<textarea name="body" maxlength="4000" placeholder="Where it came from, who made it, permission to share…"></textarea></label>
    <button class="spc-btn">Upload for review</button><div id="spc-out"></div>`;
  const pk=f.querySelector("[data-pick]");if(pk)pk.onclick=pick;const cl=f.querySelector("[data-clr]");if(cl)cl.onclick=()=>{curAnchor=null;form();renderList()};
  const cnt=f.querySelector("#spc-cnt");if(cnt)S.listMine().then(m=>{const n=m.filter(S.isOpenComment).length;cnt.textContent=`${n} of ${S.COMMENT_LIMIT} unresolved comments used. The team answers within 24 hours.`}).catch(()=>{});
  let checked=null;
  const fi=f.querySelector("input[type=file]");if(fi)fi.onchange=async()=>{checked=null;const ul=f.querySelector("#spc-chk");ul.innerHTML="<li>Checking…</li>";if(!fi.files[0]){ul.innerHTML="";return}
    const r=await S.checkFile(fi.files[0],SETTINGS);checked=r;ul.innerHTML=(r.issues.length?r.issues:[{msg:"File looks safe to send."}]).map(i=>`<li class="${i.bad?"bad":i.ok?"":i.msg.startsWith("Looks like")?"warn":""}">${esc(i.msg)}</li>`).join("")};
  f.onsubmit=async e=>{e.preventDefault();const out=f.querySelector("#spc-out"),btn=f.querySelector(".spc-btn");const d=new FormData(f);btn.disabled=true;out.innerHTML="";
    try{const body=String(d.get("body")||"");const pii=S.scanText(body);
      const c={kind:tab,page:S.pageKey(),title:String(d.get("title")||""),body,target:tab==="edit"?(lastSel||String(d.get("target")||"")):""};
      if(tab==="comment"){c.title=(document.title||"").slice(0,120);if(curAnchor){c.anchor=curAnchor.anchor;c.anchor_label=curAnchor.label;c.source_url=curAnchor.src||""}}
      if(tab==="upload"){if(!checked)checked=await S.checkFile(fi.files[0],SETTINGS);if(!checked.ok)throw new Error("The file did not pass the safety checks.");c.file=checked.file}
      await S.createContribution(c);f.reset();lastSel="";out.innerHTML=`<div class="spc-msg ok">${tab==="comment"?"Sent to the team. They acknowledge and act on it within 24 hours; you can follow it below and on":"Sent. You can see it below and on"} <a href="${BASE}me.html">My Satsang</a>${tab==="comment"?"":" while it waits for review"}.${pii.length?" Note: it may contain "+esc(pii.join(", "))+".":""}</div>`;if(tab==="edit")form()}
    catch(err){out.innerHTML=`<div class="spc-msg bad">${esc(err.message)}</div>`}btn.disabled=false}}

async function renderList(){const el=sheet&&sheet.querySelector("#spc-list");if(!el)return;el.innerHTML='<div class="spc-msg">Loading…</div>';
  try{let rows=await S.listForPage(S.pageKey());const myId=SESSION&&SESSION.user.id;PAGE_ROWS=rows;
    if(curAnchor){const here=rows.filter(r=>r.anchor===curAnchor.anchor);el.previousElementSibling&&(el.previousElementSibling.textContent=`On this spot (${here.length})`);rows=here}else if(el.previousElementSibling)el.previousElementSibling.textContent="On this page";
    if(!rows.length){el.innerHTML='<div class="spc-msg">Nothing here yet. Be the first to add something.</div>';return}
    el.innerHTML=rows.map(r=>`<div class="spc-item" data-id="${r.id}"><div class="meta"><b>${esc(r.user_id===myId?"You":r.author)}</b><span>· ${KIND[r.kind]||r.kind}</span>${r.user_id===myId?`<span class="spc-chip ${r.status}">${STATUS[r.status][0]}</span>`:""}<span>· ${new Date(r.created_at).toLocaleDateString()}</span>${S.isOpenComment(r)?due(r):""}</div>${r.anchor_label&&!curAnchor?`<a href="#spc=${r.id}" style="font-size:12.5px">📍 ${esc(r.anchor_label.slice(0,80))}</a>`:""}
      ${r.target?`<div class="spc-q">${esc(r.target)}</div>`:""}${r.kind!=="comment"&&r.title?`<b>${esc(r.title)}</b>`:""}${r.body?`<p>${esc(r.body)}</p>`:""}<div class="fv"></div>
      ${r.admin_note&&r.user_id===myId?`<div class="spc-note"><b>Admin:</b> ${esc(r.admin_note)}</div>`:""}</div>`).join("");
    rows.filter(r=>r.file_path).forEach(async r=>{const box=el.querySelector(`[data-id="${r.id}"] .fv`);try{const u=await S.fileUrl(r.file_path);if(!u)return;box.innerHTML=preview(u,r.file_type,r.file_name)}catch(e){}})}
  catch(e){el.innerHTML=`<div class="spc-msg bad">${esc(e.message)}</div>`}}
function preview(u,t,n){t=t||"";if(t.startsWith("image/"))return`<img src="${u}" alt="${esc(n)}" loading="lazy">`;if(t.startsWith("audio/"))return`<audio controls src="${u}"></audio>`;if(t.startsWith("video/"))return`<video controls src="${u}"></video>`;return`<a href="${u}" target="_blank" rel="noopener">Open ${esc(n||"file")}</a>`}
window.SPCPreview=preview;
function due(r){const ms=Date.parse(r.created_at)+S.DUE_MS-Date.now(),h=Math.floor(Math.abs(ms)/36e5),m=Math.floor(Math.abs(ms)%36e5/6e4);
  return ms<0?`<span class="spc-due late">Overdue ${h}h ${m}m</span>`:`<span class="spc-due">Due in ${h}h ${m}m</span>`}
window.SPCDue=r=>{if(!S)return"";return due(r)};

/* ---------- anchors: every event / data row gets a source chip and a comment pin ---------- */
const ANCHOR_SEL='[data-spc-anchor],[data-ev],[data-ref],.ev,.event,.evt,.item,article,dd,tbody tr,ol>li,ul.list>li,.list>li,.timeline li,.tl li,.card li';
function textOf(el){return(el.innerText||el.textContent||"").replace(/\s+/g," ").trim()}
function hash(t){let h=5381;for(let i=0;i<t.length;i++)h=(h*33^t.charCodeAt(i))>>>0;return h.toString(36)}
function pathOf(el){if(el.id)return"#"+window.CSS.escape(el.id);const parts=[];let n=el;while(n&&n!==document.body&&parts.length<12){if(n.id){parts.unshift("#"+window.CSS.escape(n.id));break}
  const t=n.tagName.toLowerCase();let i=1,x=n;while((x=x.previousElementSibling))if(x.tagName===n.tagName)i++;parts.unshift(t+":nth-of-type("+i+")");n=n.parentElement}return parts.join(">")}
function keyOf(el){return pathOf(el)+"|"+hash(labelOf(el))}
function labelOf(el){return textOf(el).replace(/💬\s*\d*|🔗 Source|⚠ No source/g,"").trim().slice(0,160)}
function sourceOf(el){const as=[...el.querySelectorAll("a[href]")].filter(a=>!a.closest(".spc-pin")&&!/^#/.test(a.getAttribute("href")||"")&&!/^javascript:/i.test(a.href));
  const pref=as.find(a=>/library|pdf|books|archive|wikisource|\.pdf|anirdesh|swaminarayan|youtube|youtu\.be/i.test(a.href))||as[0];
  const ds=el.getAttribute("data-src")||el.getAttribute("data-source");if(ds)return{href:ds,text:"Source"};return pref?{href:pref.href,text:textOf(pref).slice(0,60)||"Source"}:null}
function findAnchor(key,label){if(!key)return null;const [path,h]=key.split("|");let el=null;try{el=document.querySelector(path)}catch(e){}
  if(el&&(!h||hash(labelOf(el))===h||labelOf(el).startsWith((label||"").slice(0,30))))return el;
  if(label){const want=label.slice(0,40);return[...document.querySelectorAll(ANCHOR_SEL)].find(x=>labelOf(x).startsWith(want))||null}return el}
let pinBusy=false;
async function pins(){if(pinBusy||window.SPC_PAGE)return;pinBusy=true;try{
  const signed=S.verified(SESSION);let rows=[];if(signed){try{rows=(await S.listForPage(S.pageKey())).filter(r=>r.kind==="comment")}catch(e){}}
  const byKey={};rows.forEach(r=>{if(r.anchor)(byKey[r.anchor]=byKey[r.anchor]||[]).push(r)});
  const els=[...document.querySelectorAll(ANCHOR_SEL)].filter(el=>!el.closest("header,nav,footer,.spc-sheet,.sp-tm,.top,[aria-hidden=true]")&&(!el.querySelector(ANCHOR_SEL)||el.matches("tbody tr")));
  let n=0;for(const el of els){if(n>800)break;const t=textOf(el);if(t.length<12||t.length>1500)continue;n++;
    el.classList.add("spc-anc");const k=keyOf(el);let pin=el.querySelector(":scope>.spc-pin,:scope>td:last-child>.spc-pin");
    const src=sourceOf(el),cnt=(byKey[k]||[]).length;const sig=(src?"s":"")+cnt+(signed?"m":"");if(pin&&pin.dataset.sig===sig)continue;
    if(!pin){pin=document.createElement("span");pin.className="spc-pin";(el.tagName==="TR"?el.lastElementChild||el:el).appendChild(pin)}
    pin.dataset.sig=sig;pin.dataset.k=k;
    pin.innerHTML=(src?`<a href="${esc(src.href)}" target="_blank" rel="noopener" title="Check the source: ${esc(src.text)}">🔗 Source</a>`:"")+`<button type="button" class="${cnt?"has":""}" title="${cnt?cnt+" comment"+(cnt>1?"s":""):"Comment on this"}" aria-label="Comment on this">💬${cnt?" "+cnt:""}</button>`;
    pin.querySelector("button").onclick=e=>{e.preventDefault();e.stopPropagation();setAnchor(el);tab="comment";open()}}
  // comments whose spot was not found as an event still get a pin on their element
  for(const k in byKey){if(document.querySelector(`.spc-pin[data-k="${window.CSS.escape(k)}"]`))continue;const el=findAnchor(k,byKey[k][0].anchor_label);if(!el||el.closest(".spc-sheet"))continue;
    let pin=el.querySelector(":scope>.spc-pin");if(!pin){pin=document.createElement("span");pin.className="spc-pin";el.appendChild(pin);el.classList.add("spc-anc")}pin.dataset.k=k;
    pin.innerHTML=`<button type="button" class="has" aria-label="Comments on this">💬 ${byKey[k].length}</button>`;pin.querySelector("button").onclick=e=>{e.preventDefault();e.stopPropagation();curAnchor={anchor:k,label:byKey[k][0].anchor_label,src:byKey[k][0].source_url};tab="comment";open()}}
}finally{pinBusy=false}}
function setAnchor(el){const s=sourceOf(el);curAnchor={anchor:keyOf(el),label:labelOf(el),src:s&&s.href,srcText:s&&s.text}}
function pick(){close();document.body.classList.add("spc-picking");const bar=document.createElement("div");bar.className="spc-pickbar";bar.innerHTML='📍 Click the part of the page you want to comment on <button type="button">Cancel</button>';document.body.appendChild(bar);
  let hov=null;const ok=el=>el&&el!==document.body&&!el.closest(".spc-pickbar,.spc-fab,.spc-sheet,.spc-veil,.sp-tm,.sp-sb,.sp-lb")&&textOf(el).length>=2;
  const blk=el=>{while(el&&el!==document.body){if(/^(P|LI|TR|TD|TH|H1|H2|H3|H4|H5|FIGURE|IMG|SVG|DD|DT|BLOCKQUOTE|ARTICLE|SECTION|PRE|LABEL)$/.test(el.tagName)||el.classList.contains("card")||el.matches(ANCHOR_SEL))return el;el=el.parentElement}return null};
  const mv=e=>{const el=blk(e.target);if(hov)hov.classList.remove("spc-pickhov");hov=ok(el)?el:null;if(hov)hov.classList.add("spc-pickhov")};
  const done=()=>{document.body.classList.remove("spc-picking");if(hov)hov.classList.remove("spc-pickhov");bar.remove();document.removeEventListener("mouseover",mv,true);document.removeEventListener("click",ck,true);document.removeEventListener("keydown",esc2,true)};
  const ck=e=>{if(e.target.closest(".spc-pickbar")){done();open();return}e.preventDefault();e.stopPropagation();const el=blk(e.target);if(!ok(el))return;done();setAnchor(el);tab="comment";open()};
  const esc2=e=>{if(e.key==="Escape"){done();open()}};
  document.addEventListener("mouseover",mv,true);document.addEventListener("click",ck,true);document.addEventListener("keydown",esc2,true)}
async function deepLink(){const m=/^#spc=([\w-]+)/.exec(location.hash);if(!m||!S.verified(SESSION))return;let rows=[];try{rows=await S.listForPage(S.pageKey())}catch(e){}const r=rows.find(x=>x.id===m[1]);if(!r)return;
  const el=r.anchor&&findAnchor(r.anchor,r.anchor_label);if(el){el.scrollIntoView({behavior:"smooth",block:"center"});el.classList.add("spc-hl");setTimeout(()=>el.classList.remove("spc-hl"),4500)}
  curAnchor=r.anchor?{anchor:r.anchor,label:r.anchor_label,src:r.source_url}:null;tab="comment";setTimeout(open,el?700:0)}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
