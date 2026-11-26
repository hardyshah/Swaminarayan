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
const STATUS={pending:["Waiting for review","સમીક્ષા બાકી"],approved:["Approved","મંજૂર"],rejected:["Not accepted","નામંજૂર"],changes:["Changes asked","ફેરફાર માગ્યા"]};
const KIND={comment:"Comment",edit:"Edit suggestion",upload:"Upload",event:"Event"};
let S=null,SESSION=null,SETTINGS=null,lastSel="";

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
@media print{.spc-fab,.spc-ban{display:none}}
@media (prefers-reduced-motion:reduce){.spc-sheet,.spc-veil{transition:none}}`;

function css(){if(document.getElementById("spc-css"))return;const s=document.createElement("style");s.id="spc-css";s.textContent=CSS;document.head.appendChild(s)}

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
  S.on("auth",async s=>{SESSION=s;paintFab()});S.on("contrib",()=>{paintFab();if(sheet&&sheet.classList.contains("on"))renderList()});
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
  if(p&&S.verified(SESSION)){try{const mine=await S.listMine();const n=mine.filter(c=>c.status==="changes").length;if(n)badge=`<span class="bd" title="Items that need your attention">${n}</span>`}catch(e){}}
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
  b.innerHTML=demo+`<div class="spc-who"><span>🙏 ${esc(p.name||p.email)}</span><a href="${BASE}me.html">My Satsang</a>${S.isAdmin(p)?`<a href="${BASE}admin.html">Admin</a>`:""}<a href="#" data-out>Sign out</a></div>
  <div class="spc-tabs" role="tablist">
    <button role="tab" data-t="comment" aria-selected="${tab==="comment"}" ${F.comments?"":"disabled"}>💬 Comment</button>
    <button role="tab" data-t="edit" aria-selected="${tab==="edit"}" ${F.edits?"":"disabled"}>✎ Suggest edit</button>
    <button role="tab" data-t="upload" aria-selected="${tab==="upload"}" ${F.uploads?"":"disabled"}>⬆ Upload</button></div>
  <form class="spc-f" id="spc-form"></form><div class="spc-h3">On this page</div><div id="spc-list"></div>`;
  b.querySelector("[data-out]").onclick=async e=>{e.preventDefault();await S.signOut();SESSION=null;render()};
  b.querySelectorAll("[data-t]").forEach(x=>x.onclick=()=>{tab=x.dataset.t;render()});
  form();renderList()}

function form(){const f=sheet.querySelector("#spc-form");
  if(tab==="comment")f.innerHTML=`<label>Your comment · ટિપ્પણી<textarea name="body" required maxlength="4000" placeholder="Share a thought, a correction or a reference…"></textarea></label><button class="spc-btn">Send for review</button><div id="spc-out"></div>`;
  if(tab==="edit")f.innerHTML=`<p style="margin:0;font-size:13.5px">Select the words on the page you want changed, then open this panel. They appear below.</p>
    ${lastSel?`<div class="spc-q" aria-label="Selected text">${esc(lastSel)}</div>`:`<label>What should change? (part of the page)<input type="text" name="target" maxlength="300" placeholder="e.g. the date of the Loj event"></label>`}
    <label>Suggested wording or correction<textarea name="body" required maxlength="8000"></textarea></label><label>Source (book, page, link) · સંદર્ભ<input type="text" name="title" maxlength="200" placeholder="e.g. Shri Swaminarayanam, page 112"></label>
    <button class="spc-btn">Send suggestion</button><div id="spc-out"></div>`;
  if(tab==="upload")f.innerHTML=`<label>File (photo, PDF, audio, video, text; up to ${SETTINGS.uploads.maxMB} MB)<input type="file" name="file" required></label><ul class="spc-chk" id="spc-chk"></ul>
    <label>Title<input type="text" name="title" required maxlength="200" placeholder="What is it?"></label><label>Details and source<textarea name="body" maxlength="4000" placeholder="Where it came from, who made it, permission to share…"></textarea></label>
    <button class="spc-btn">Upload for review</button><div id="spc-out"></div>`;
  let checked=null;
  const fi=f.querySelector("input[type=file]");if(fi)fi.onchange=async()=>{checked=null;const ul=f.querySelector("#spc-chk");ul.innerHTML="<li>Checking…</li>";if(!fi.files[0]){ul.innerHTML="";return}
    const r=await S.checkFile(fi.files[0],SETTINGS);checked=r;ul.innerHTML=(r.issues.length?r.issues:[{msg:"File looks safe to send."}]).map(i=>`<li class="${i.bad?"bad":i.ok?"":i.msg.startsWith("Looks like")?"warn":""}">${esc(i.msg)}</li>`).join("")};
  f.onsubmit=async e=>{e.preventDefault();const out=f.querySelector("#spc-out"),btn=f.querySelector(".spc-btn");const d=new FormData(f);btn.disabled=true;out.innerHTML="";
    try{const body=String(d.get("body")||"");const pii=S.scanText(body);
      const c={kind:tab,page:S.pageKey(),title:String(d.get("title")||""),body,target:tab==="edit"?(lastSel||String(d.get("target")||"")):""};
      if(tab==="comment")c.title=(document.title||"").slice(0,120);
      if(tab==="upload"){if(!checked)checked=await S.checkFile(fi.files[0],SETTINGS);if(!checked.ok)throw new Error("The file did not pass the safety checks.");c.file=checked.file}
      await S.createContribution(c);f.reset();lastSel="";out.innerHTML=`<div class="spc-msg ok">Sent. You can see it below and on <a href="${BASE}me.html">My Satsang</a> while it waits for review.${pii.length?" Note: it may contain "+esc(pii.join(", "))+".":""}</div>`;if(tab==="edit")form()}
    catch(err){out.innerHTML=`<div class="spc-msg bad">${esc(err.message)}</div>`}btn.disabled=false}}

async function renderList(){const el=sheet&&sheet.querySelector("#spc-list");if(!el)return;el.innerHTML='<div class="spc-msg">Loading…</div>';
  try{const rows=await S.listForPage(S.pageKey());const myId=SESSION&&SESSION.user.id;
    if(!rows.length){el.innerHTML='<div class="spc-msg">Nothing here yet. Be the first to add something.</div>';return}
    el.innerHTML=rows.map(r=>`<div class="spc-item" data-id="${r.id}"><div class="meta"><b>${esc(r.user_id===myId?"You":r.author)}</b><span>· ${KIND[r.kind]||r.kind}</span>${r.user_id===myId?`<span class="spc-chip ${r.status}">${STATUS[r.status][0]}</span>`:""}<span>· ${new Date(r.created_at).toLocaleDateString()}</span></div>
      ${r.target?`<div class="spc-q">${esc(r.target)}</div>`:""}${r.kind!=="comment"&&r.title?`<b>${esc(r.title)}</b>`:""}${r.body?`<p>${esc(r.body)}</p>`:""}<div class="fv"></div>
      ${r.admin_note&&r.user_id===myId?`<div class="spc-note"><b>Admin:</b> ${esc(r.admin_note)}</div>`:""}</div>`).join("");
    rows.filter(r=>r.file_path).forEach(async r=>{const box=el.querySelector(`[data-id="${r.id}"] .fv`);try{const u=await S.fileUrl(r.file_path);if(!u)return;box.innerHTML=preview(u,r.file_type,r.file_name)}catch(e){}})}
  catch(e){el.innerHTML=`<div class="spc-msg bad">${esc(e.message)}</div>`}}
function preview(u,t,n){t=t||"";if(t.startsWith("image/"))return`<img src="${u}" alt="${esc(n)}" loading="lazy">`;if(t.startsWith("audio/"))return`<audio controls src="${u}"></audio>`;if(t.startsWith("video/"))return`<video controls src="${u}"></video>`;return`<a href="${u}" target="_blank" rel="noopener">Open ${esc(n||"file")}</a>`}
window.SPCPreview=preview;

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
