/* Shangaar page: designer UI + darshan photo analyser UI */
(function(){
"use strict";
const F=window.SHANGAAR_FIG,D=window.SHANGAAR_DETECT,E=window.SHANGAAR_EYES;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const bell=()=>{try{window.SP&&SP.bell&&SP.bell()}catch(e){}};

/* ================= DESIGNER ================= */
let st=null;
function fromHash(){try{const m=location.hash.match(/^#s=(.+)/);if(m){const o=JSON.parse(decodeURIComponent(escape(atob(m[1]))));if(o&&o.murti)return o}}catch(e){}return null}
st=fromHash()||F.stateFor("gopinathji");

function murtiCards(){
 $("murtis").innerHTML=F.MURTIS.map(m=>{const s=F.stateFor(m.k);
  return`<button class="mcard" type="button" data-k="${m.k}" aria-pressed="${st.murti===m.k}">${F.svg(s)}<b>${m.gu}</b><small>${m.en}<br>${m.where}</small></button>`}).join("");
 $("murtis").onclick=e=>{const b=e.target.closest(".mcard");if(!b)return;st=F.stateFor(b.dataset.k);bell();renderAll()}}
function presets(){
 $("presets").innerHTML=Object.entries(F.PRESETS).map(([k,p])=>`<button class="chip" type="button" data-k="${k}" aria-pressed="${st.preset===k}">${p.gu} · ${p.en}</button>`).join("");
 $("presets").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;const keep={murti:st.murti,pose:st.pose,skin:st.skin};st=Object.assign(F.stateFor(st.murti,b.dataset.k),keep);bell();renderAll()}}

const TABS=[["head","મસ્તક","Head"],["vagha","વાઘા","Vagha"],["orn","અલંકાર","Ornaments"],["phool","ફૂલ","Flowers"],["back","પરિકર","Setting"]];
let tab="head";
function optRow(label,key,list){return`<div class="grp"><div class="lab">${label}</div><div class="opts">${list.map(o=>`<button class="opt" type="button" data-set="${key}" data-v="${o.k}" aria-pressed="${st[key]===o.k}">${o.gu}<span>${o.en}</span></button>`).join("")}</div></div>`}
function colorRow(label,key){return`<div class="crow"><b>${label}</b><div class="colors">${F.PAL.map(p=>`<button class="sw" type="button" title="${p[0]} · ${p[1]}" aria-label="${p[1]}" style="background:${p[2]}" data-col="${key}" data-v="${p[2]}" aria-pressed="${st.c[key].toLowerCase()===p[2]}"></button>`).join("")}<input type="color" data-colin="${key}" value="${st.c[key]}" aria-label="Any colour for ${label}"></div></div>`}
function panes(){
 const P={
  head:optRow("Pagh or mugat <small>પાઘ / મુગટ</small>","head",F.OPT.head)+colorRow("Pagh colour","head")+colorRow("Second colour","head2")+optRow("Kalgi <small>કલગી</small>","kalgi",F.OPT.kalgi)+optRow("Tora <small>તોરા</small>","tora",F.OPT.tora)+optRow("Kundal <small>કુંડળ</small>","kundal",F.OPT.kundal),
  vagha:optRow("Vagha <small>વાઘા</small>","vagha",F.OPT.vagha)+colorRow("Jama / upper","upper")+colorRow("Suruval / lower","lower")+colorRow("Zari border","zari")+optRow("Khes or shawl <small>ખેસ / શાલ</small>","khes",F.OPT.khes)+colorRow("Khes colour","khes")+
   optRow("Pose <small>મુદ્રા</small>","pose",[{k:"abhay",gu:"આશીર્વાદ",en:"Blessing hand"},{k:"bansuri",gu:"વાંસળી",en:"Playing the flute"}])+optRow("Murti colour <small>મૂર્તિનો વર્ણ</small>","skin",[{k:"dark",gu:"શ્યામ",en:"Dark stone"},{k:"fair",gu:"ગૌર",en:"Fair"},{k:"gold",gu:"સુવર્ણ",en:"Gold"}]),
  orn:`<div class="grp"><div class="lab">Ornaments <small>અલંકાર</small></div><div class="toggles">${F.ORN.filter(o=>o.k!=="chhatra"&&o.k!=="gajra").map(o=>`<label class="tg"><input type="checkbox" data-orn="${o.k}" ${st.orn[o.k]?"checked":""}><span>${o.gu}<small>${o.en}</small></span></label>`).join("")}</div></div>
   <div class="grp"><div class="lab">How many haar <small>હારની સેર</small></div><div class="num"><input type="range" min="0" max="4" step="1" value="${st.haarN}" data-num="haarN" aria-label="Number of haar"><b id="haarNv">${st.haarN}</b></div></div>`,
  phool:optRow("Garland flowers <small>ફૂલહાર</small>","garland",F.OPT.garland)+`<div class="grp"><div class="lab">How many garlands</div><div class="num"><input type="range" min="0" max="4" step="1" value="${st.garN}" data-num="garN" aria-label="Number of garlands"><b id="garNv">${st.garN}</b></div></div>
   <div class="grp"><div class="toggles"><label class="tg"><input type="checkbox" data-orn="gajra" ${st.orn.gajra?"checked":""}><span>ગજરા<small>Gajra (wrist flower bands)</small></span></label></div></div>`+optRow("In the left hand <small>હાથમાં</small>","hand",F.OPT.hand),
  back:optRow("Prabha / parikar","prabha",F.OPT.prabha)+`<div class="grp"><div class="toggles"><label class="tg"><input type="checkbox" data-orn="chhatra" ${st.orn.chhatra?"checked":""}><span>છત્ર<small>Chhatra (canopy)</small></span></label></div></div>`+colorRow("Background","bg")};
 $("tabs").innerHTML=TABS.map(t=>`<button class="tab" role="tab" type="button" data-t="${t[0]}" aria-selected="${tab===t[0]}">${t[1]} · ${t[2]}</button>`).join("");
 $("panes").innerHTML=P[tab];
}
function stage(){
 const m=F.MURTIS.find(x=>x.k===st.murti);
 $("stage").innerHTML=F.svg(st,{id:"fig",title:`${m.en}, ${F.PRESETS[st.preset]?F.PRESETS[st.preset].en:"custom"} shangaar`});
 const L=F.items(st),n=L.reduce((a,b)=>a+b.n,0);
 $("count").innerHTML=`<h4>This shangaar: ${n} pieces in ${L.length} kinds</h4><ol>${L.map(i=>`<li>${esc(i.gu)} <small>${esc(i.en)}${i.n>1?` × ${i.n}`:""}</small></li>`).join("")}</ol>`;
 try{history.replaceState(null,"","#s="+btoa(unescape(encodeURIComponent(JSON.stringify(st)))))}catch(e){}
}
function renderAll(){murtiCards();presets();panes();stage()}
document.addEventListener("click",e=>{
 const t=e.target.closest("[data-t]");if(t&&t.classList.contains("tab")){tab=t.dataset.t;panes();return}
 const o=e.target.closest("[data-set]");if(o){st[o.dataset.set]=o.dataset.v;st.preset="custom";if(o.dataset.set==="pose"&&o.dataset.v==="bansuri")st.hand="none";presets();panes();stage();return}
 const c=e.target.closest("[data-col]");if(c){st.c[c.dataset.col]=c.dataset.v;st.preset="custom";presets();panes();stage();return}
});
document.addEventListener("input",e=>{
 const t=e.target;
 if(t.dataset.colin){st.c[t.dataset.colin]=t.value;st.preset="custom";stage();return}
 if(t.dataset.num){st[t.dataset.num]=+t.value;const v=$(t.dataset.num+"v");if(v)v.textContent=t.value;st.preset="custom";stage();return}
 if(t.dataset.orn){st.orn[t.dataset.orn]=t.checked?1:0;st.preset="custom";stage()}
});
$("rand").onclick=()=>{const pick=a=>a[Math.floor(Math.random()*a.length)];const col=()=>pick(F.PAL)[2];
 Object.assign(st,{preset:"custom",head:pick(F.OPT.head).k,kalgi:pick(F.OPT.kalgi).k,tora:pick(F.OPT.tora).k,vagha:pick(F.OPT.vagha).k,khes:pick(F.OPT.khes).k,kundal:pick(F.OPT.kundal.slice(1)).k,garland:pick(F.OPT.garland).k,garN:1+Math.floor(Math.random()*3),haarN:1+Math.floor(Math.random()*3),prabha:pick(F.OPT.prabha).k});
 st.c={head:col(),head2:col(),upper:col(),lower:col(),zari:pick(["#e8b923","#d4a017","#cfd8dc"]),khes:col(),bg:pick(["#f6e7c8","#2b1a3d","#e8f5e9","#efe6d8","#fdf6e3","#1d2340"])};
 F.ORN.forEach(o=>{if(o.k!=="tilak"&&o.k!=="kanthi")st.orn[o.k]=Math.random()<.55?1:0});bell();presets();panes();stage()};
function svgToCanvas(scale){return new Promise((res,rej)=>{const s=new XMLSerializer().serializeToString($("fig"));const img=new Image();
 img.onload=()=>{const c=document.createElement("canvas");c.width=400*scale;c.height=650*scale;c.getContext("2d").drawImage(img,0,0,c.width,c.height);res(c)};img.onerror=rej;
 img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s)})}
$("dl").onclick=async()=>{const c=await svgToCanvas(3);const a=document.createElement("a");a.download=`shangaar-${st.murti}.png`;a.href=c.toDataURL("image/png");a.click()};
$("share").onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$("share").textContent="✓ Link copied"}catch(e){$("share").textContent="Copy the address bar"}setTimeout(()=>$("share").textContent="🔗 Copy link",1800)};
$("totest").onclick=async()=>{const c=await svgToCanvas(2);loadImage(c.toDataURL("image/png"));location.hash="";history.replaceState(null,"","#analyser");$("analyser").scrollIntoView({behavior:"smooth"});stage()};
renderAll();

/* ================= ANALYSER ================= */
let mode="local",marks=[],face=null,adding=false,imgW=0,imgH=0,pix=null,detector=null,nextId=1,hl=null;
const NAMES=D.ITEMS.map(i=>({k:i.k,gu:i.gu,en:i.en}));
document.querySelectorAll(".mode").forEach(b=>b.onclick=()=>{mode=b.dataset.m;document.querySelectorAll(".mode").forEach(x=>x.setAttribute("aria-pressed",x===b));$("keyrow").classList.toggle("on",mode==="claude");
 $("run").textContent=mode==="hand"?"☞ Start marking":"⌕ Find the shangaar"});
try{const k=sessionStorage.getItem("sp-anthropic-key");if(k){$("apikey").value=k;$("keep").checked=true}}catch(e){}
const status=(t,p)=>{$("status").innerHTML=t;const b=$("bar");if(p==null){b.classList.remove("on")}else{b.classList.add("on");b.firstElementChild.style.width=Math.round(p*100)+"%"}};
const drop=$("drop");
["dragover","dragenter"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("over")}));
["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("over")}));
drop.addEventListener("drop",e=>{const f=e.dataTransfer.files[0];if(f)readFile(f)});
drop.addEventListener("click",()=>$("file").click());drop.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();$("file").click()}});
$("file").onchange=e=>{const f=e.target.files[0];if(f)readFile(f)};
function readFile(f){if(f.type&&!/^image\//.test(f.type)){status("That file is not a picture.");return}if(f.size>25e6){status("That picture is over 25 MB. Please use a smaller one.");return}
 const r=new FileReader();r.onload=()=>loadImage(r.result);r.readAsDataURL(f)}
function loadImage(src){
 const im=$("img");im.onerror=()=>status("This picture could not be opened. Please try a JPG or PNG.");im.onload=()=>{imgW=im.naturalWidth;imgH=im.naturalHeight;
  // working copy, at most 1280 px on the long side
  const s=Math.min(1,1280/Math.max(imgW,imgH)),c=document.createElement("canvas");c.width=Math.round(imgW*s);c.height=Math.round(imgH*s);
  c.getContext("2d").drawImage(im,0,0,c.width,c.height);pix={c,s,data:c.getContext("2d").getImageData(0,0,c.width,c.height).data};
  marks=[];face=null;$("imgbox").classList.add("on");["run","add","face"].forEach(id=>$(id).disabled=false);draw();list();
  status("Photo ready. Press <b>"+($("run").textContent)+"</b>.")};
 im.src=src}

$("run").onclick=async()=>{if(!pix)return;
 if(mode==="hand"){startAdd();return}
 $("run").disabled=true;
 try{if(mode==="claude")await runClaude();else await runLocal()}catch(err){console.error(err);status("Something went wrong: "+esc(err.message||err)+". You can still mark items by hand.")}
 $("run").disabled=false};

async function runLocal(){
 const t0=performance.now();
 status("Looking for the murti's eyes…",.05);
 const e=E.findEyes(pix.data,pix.c.width,pix.c.height);
 let fbox=e?E.faceFromEyes(e):null;
 if(!detector){
  status("Downloading the detector (about 155 MB, only the first time; your browser keeps it)…",.08);
  const T=await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.5");
  T.env.allowLocalModels=false;
  const seen={};
  detector=await T.pipeline("zero-shot-object-detection","Xenova/owlv2-base-patch16-ensemble",{dtype:"q8",device:"wasm",
   progress_callback:p=>{if(p.status==="progress"&&p.total){seen[p.file]=p.loaded/p.total;const v=Object.values(seen);status(`Downloading the detector… ${Math.round(100*v.reduce((a,b)=>a+b,0)/v.length)}%`,.08+.6*v.reduce((a,b)=>a+b,0)/v.length)}}});
 }
 status("Looking at the photo (this takes 5 to 30 seconds on a phone)…",.75);
 await new Promise(r=>setTimeout(r,30));
 const raw=await detector(pix.c.toDataURL("image/jpeg",.92),D.prompts(),{threshold:.08,top_k:200});
 const W=pix.c.width,H=pix.c.height;
 const out=D.post(raw,W,H,{face:fbox,faceSrc:"eyes"});
 face=out.face?scaleBox(out.face,1/pix.s):null;
 marks=out.items.map(it=>({id:nextId++,k:it.k,gu:it.gu,en:it.en,score:it.score,box:scaleBox(it.box,1/pix.s),src:"auto",unsure:it.grp==="head"&&!it.sure}));
 draw();list();
 const sec=((performance.now()-t0)/1000).toFixed(0);
 status(`Found ${marks.length} marks in ${sec} s. ${face?(out.faceSrc==="eyes"?"Face found from the eyes.":"Face found by the detector."):"<b>Face not found</b>, so positions were not checked."} Please check each mark: tap a name to change it, ✕ to remove, or “Add a mark” for anything missed.`)}
const scaleBox=(b,k)=>({xmin:b.xmin*k,ymin:b.ymin*k,xmax:b.xmax*k,ymax:b.ymax*k});

async function runClaude(){
 const key=$("apikey").value.trim();if(!/^sk-ant-/.test(key)){status("Please paste your Anthropic API key (it starts with sk-ant-).");return}
 try{if($("keep").checked)sessionStorage.setItem("sp-anthropic-key",key);else sessionStorage.removeItem("sp-anthropic-key")}catch(e){}
 status("Sending the photo to Claude…",.2);
 const s=Math.min(1,1568/Math.max(imgW,imgH)),c=document.createElement("canvas");c.width=Math.round(imgW*s);c.height=Math.round(imgH*s);c.getContext("2d").drawImage($("img"),0,0,c.width,c.height);
 const b64=c.toDataURL("image/jpeg",.9).split(",")[1];
 const vocab=D.ITEMS.map(i=>`${i.k}: ${i.gu} / ${i.en}`).join("\n");
 const prompt=`This is a darshan photo of a murti in a Swaminarayan mandir, dressed in shangaar. List every separate shangaar item and ornament you can see on the murti (not on other murtis or the background, except the prabha or chhatra directly around it).
Use these keys where they fit:
${vocab}
If an item fits none of them, use key "other" and give its Gujarati and English name.
Count separate pieces: each kundal, each haar strand you can tell apart, each garland, each kada.
Reply with JSON only, no other text, in this shape:
{"murti":"name if you recognise it, else empty","items":[{"key":"pagh","gu":"પાઘ","en":"Pagh (turban)","detail":"short description such as colour and style","box":[x_min,y_min,x_max,y_max],"confidence":"high|medium|low"}]}
Box values are integers from 0 to 1000, relative to the image width and height.`;
 const {default:Anthropic}=await import("https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.3.0/+esm");
 const client=new Anthropic({apiKey:key,dangerouslyAllowBrowser:true});
 status("Claude is looking at the photo (20 to 60 seconds)…",.5);
 const msg=await client.beta.messages.create({model:$("model").value,max_tokens:16000,betas:["server-side-fallback-2026-07-01"],fallbacks:"default",output_config:{effort:"high"},
  messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},{type:"text",text:prompt}]}]});
 if(msg.stop_reason==="refusal"){status("Claude declined to analyse this photo. You can mark items by hand.");return}
 const text=msg.content.filter(b=>b.type==="text").map(b=>b.text).join("");
 const j=JSON.parse(text.slice(text.indexOf("{"),text.lastIndexOf("}")+1));
 marks=(j.items||[]).map(it=>{const known=D.ITEMS.find(i=>i.k===it.key),b=it.box||[0,0,0,0];
  return{id:nextId++,k:known?known.k:"other",gu:it.gu||(known&&known.gu)||"",en:(it.en||(known&&known.en)||"Item")+(it.detail?` · ${it.detail}`:""),score:{high:.9,medium:.6,low:.3}[it.confidence]||.5,
   box:{xmin:b[0]/1000*imgW,ymin:b[1]/1000*imgH,xmax:b[2]/1000*imgW,ymax:b[3]/1000*imgH},src:"claude"}});
 face=null;draw();list();
 status(`Claude found ${marks.length} items${j.murti?` on ${esc(j.murti)}`:""}. Boxes are approximate; please check each one.`)}

/* ---- overlay + list ---- */
function draw(){
 const ov=$("ov");ov.setAttribute("viewBox",`0 0 ${imgW} ${imgH}`);const u=Math.max(imgW,imgH)/600;
 let h="";
 if(face)h+=`<rect x="${face.xmin}" y="${face.ymin}" width="${face.xmax-face.xmin}" height="${face.ymax-face.ymin}" fill="none" stroke="#4dd0e1" stroke-width="${1.5*u}" stroke-dasharray="${5*u} ${4*u}" class="facebox" style="display:none"/>`;
 marks.forEach((m,i)=>{const b=m.box,on=hl===m.id;const cx=(b.xmin+b.xmax)/2,cy=(b.ymin+b.ymax)/2;
  if(b.xmax-b.xmin>2)h+=`<rect x="${b.xmin}" y="${b.ymin}" width="${b.xmax-b.xmin}" height="${b.ymax-b.ymin}" rx="${4*u}" fill="${on?"rgba(255,152,0,.18)":"none"}" stroke="${on?"#ff9800":"#ffd54f"}" stroke-width="${(on?3:1.6)*u}" opacity="${on?1:.85}"/>`;
  const px=b.xmax-b.xmin>2?Math.max(10*u,Math.min(b.xmin+10*u,imgW-10*u)):cx,py=b.xmax-b.xmin>2?Math.max(10*u,b.ymin+10*u):cy;
  h+=`<g data-id="${m.id}" style="cursor:pointer"><circle cx="${px}" cy="${py}" r="${10*u}" fill="${m.unsure?"#a86b00":"#b9560c"}" stroke="#fff" stroke-width="${2*u}"/><text x="${px}" y="${py+4*u}" text-anchor="middle" font-size="${11.5*u}" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${i+1}</text></g>`});
 ov.innerHTML=h}
function conf(m){if(m.src==="hand")return`<span class="conf h">by you</span>`;const s=m.score;return s>=.35?`<span class="conf h">likely</span>`:s>=.2?`<span class="conf m">maybe</span>`:`<span class="conf l">check</span>`}
function list(){
 const opts=k=>NAMES.map(n=>`<option value="${n.k}" ${n.k===k?"selected":""}>${n.gu} · ${n.en}</option>`).join("")+(k==="other"?`<option value="other" selected>Other</option>`:"");
 $("marks").innerHTML=marks.map((m,i)=>`<li data-id="${m.id}" class="${hl===m.id?"hl":""}"><span class="pin" style="${m.unsure?"background:#a86b00":""}">${i+1}</span><span>${m.src==="claude"||m.k==="other"?`<b>${esc(m.gu)}</b> ${esc(m.en)} `:`<select data-ren="${m.id}" aria-label="Name of mark ${i+1}">${opts(m.k)}</select> `}${conf(m)}${m.unsure?` <small style="color:var(--warn)">pagh or mugat? pick one</small>`:""}</span><button class="x" type="button" data-del="${m.id}" aria-label="Remove mark ${i+1}">✕</button></li>`).join("");
 const T={};marks.forEach(m=>{const key=m.k==="other"?m.en:m.k;(T[key]=T[key]||{gu:m.gu,en:m.k==="other"?m.en:(NAMES.find(n=>n.k===m.k)||{en:m.en}).en,n:0}).n++});
 const kinds=Object.keys(T).length,total=marks.length;
 $("total").innerHTML=total?`<b>${total}</b> shangaar items in <b style="font-size:20px">${kinds}</b> kinds`:"Nothing yet.";
 $("tally").innerHTML=Object.values(T).sort((a,b)=>b.n-a.n).map(t=>`<tr><td>${esc(t.gu)} <small style="color:var(--ink-3)">${esc(t.en)}</small></td><td>${t.n}</td></tr>`).join("");
 ["dlan","copy","clear"].forEach(id=>$(id).disabled=!total)}
$("marks").addEventListener("change",e=>{const id=+e.target.dataset.ren;if(!id)return;const m=marks.find(x=>x.id===id),n=NAMES.find(x=>x.k===e.target.value);Object.assign(m,{k:n.k,gu:n.gu,en:n.en,unsure:false,src:m.src==="auto"?"hand":m.src,score:1});draw();list()});
$("marks").addEventListener("click",e=>{const d=e.target.closest("[data-del]");if(d){marks=marks.filter(m=>m.id!==+d.dataset.del);draw();list();return}
 const li=e.target.closest("li");if(li&&e.target.tagName!=="SELECT"){hl=+li.dataset.id===hl?null:+li.dataset.id;draw();list()}});
$("ov").addEventListener("click",e=>{if(adding)return;const g=e.target.closest("[data-id]");if(!g)return;hl=+g.dataset.id;draw();list();const li=document.querySelector(`#marks li[data-id="${hl}"]`);if(li)li.scrollIntoView({block:"nearest",behavior:"smooth"})});
function startAdd(){adding=!adding;$("imgbox").classList.toggle("adding",adding);$("add").textContent=adding?"✓ Done adding":"＋ Add a mark";
 status(adding?"Tap the photo on each item to add a mark. Then choose its name in the list.":"Marks saved.")}
$("add").onclick=startAdd;
$("imgbox").addEventListener("click",e=>{if(!adding)return;const r=$("img").getBoundingClientRect(),x=(e.clientX-r.left)/r.width*imgW,y=(e.clientY-r.top)/r.height*imgH;
 const guess=guessName(x,y),n=NAMES.find(q=>q.k===guess)||NAMES[0];const id=nextId++;
 marks.push({id,k:n.k,gu:n.gu,en:n.en,score:1,box:{xmin:x,ymin:y,xmax:x,ymax:y},src:"hand"});hl=id;draw();list()});
function guessName(x,y){if(!face)return"haar";const w=face.xmax-face.xmin,h=face.ymax-face.ymin,cx=(face.xmin+face.xmax)/2;
 if(y<face.ymin)return Math.abs(x-cx)<w*.4&&y<face.ymin-h*.6?"kalgi":"pagh";if(y<face.ymax){return Math.abs(x-cx)>w*.35?"kundal":"tilak"}if(y<face.ymax+h*1.5)return"haar";return"phoolhaar"}
$("face").onclick=()=>{const r=document.querySelector(".facebox");if(!r){status(face?"":"No face was found yet. Run the analyser first, or mark items by hand.");return}r.style.display=r.style.display==="none"?"":"none"};
$("clear").onclick=()=>{marks=[];hl=null;draw();list()};
$("copy").onclick=async()=>{const t=marks.map((m,i)=>`${i+1}. ${m.gu} – ${m.en}`).join("\n")+`\n\nTotal: ${marks.length}`;try{await navigator.clipboard.writeText(t);$("copy").textContent="✓ Copied"}catch(e){}setTimeout(()=>$("copy").textContent="⧉ Copy the list",1600)};
$("dlan").onclick=()=>{const s=Math.min(1,2000/Math.max(imgW,imgH)),c=document.createElement("canvas");c.width=imgW*s;c.height=imgH*s;const x=c.getContext("2d");x.drawImage($("img"),0,0,c.width,c.height);
 const u=Math.max(c.width,c.height)/600;x.font=`700 ${12*u}px system-ui,sans-serif`;x.textAlign="center";
 marks.forEach((m,i)=>{const b=scaleBox(m.box,s);if(b.xmax-b.xmin>2){x.strokeStyle="#ffd54f";x.lineWidth=1.6*u;x.strokeRect(b.xmin,b.ymin,b.xmax-b.xmin,b.ymax-b.ymin)}
  const px=b.xmax-b.xmin>2?Math.max(10*u,b.xmin+10*u):(b.xmin),py=b.xmax-b.xmin>2?Math.max(10*u,b.ymin+10*u):b.ymin;
  x.fillStyle="#b9560c";x.beginPath();x.arc(px,py,10*u,0,7);x.fill();x.strokeStyle="#fff";x.lineWidth=2*u;x.stroke();x.fillStyle="#fff";x.fillText(i+1,px,py+4*u)});
 const a=document.createElement("a");a.download="darshan-shangaar-marked.png";a.href=c.toDataURL("image/png");a.click()};
})();
