/* Floating "Fact of the day" (bottom centre; the Contribute pill sits bottom-left, sound/language bottom-right) for every page of the site (loaded by site/sp.js).
   Three tabs: On this day (1781–1830, from Shri Swaminarayanam, the Vachanamrut and the Bhuj mandir life events),
   Did you know (a sourced fact that changes daily) and News (next utsav + latest from the Kalupur mandir feed).
   Data: data/play/facts.json, data/play/utsav.json (tools/play_build.py) and vachanamrut-concordance/data/live.json (tools/live_build.py).
   A page can opt out with window.SP_NO_DAILY=true. Choices saved per viewer: sp-daily-seen (last day the peek showed), sp-daily-tab. */
(function(){
"use strict";
if(window.SP_NO_DAILY||document.querySelector(".spd-btn"))return;
const me=document.currentScript&&document.currentScript.src;if(!me)return;
const ROOT=new URL("../",me).href;
const get=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
const put=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const lang=()=>(window.SP_LANG&&SP_LANG.get())||document.documentElement.getAttribute("data-sp-lang")||get("sp-lang","both");
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
// T(en, gu): one or both languages, following the site language switch
function T(en,gu,inline){const m=lang();if(!gu)return esc(en);if(!en)return esc(gu);
  if(m==="gu")return esc(gu);if(m==="en")return esc(en);return inline?`${esc(gu)} · ${esc(en)}`:`${esc(gu)}<small>${esc(en)}</small>`}
const url=u=>/^https?:/.test(u)?u:ROOT+u;
const GUD=n=>String(n).replace(/\d/g,d=>"૦૧૨૩૪૫૬૭૮૯"[d]);
const now=new Date(),MD=String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
const DOY=Math.floor((now-new Date(now.getFullYear(),0,0))/864e5);
const TODAY=now.getFullYear()+"-"+MD;
const enDate=now.toLocaleDateString("en-GB",{day:"numeric",month:"long"});
const GUM=["જાન્યુઆરી","ફેબ્રુઆરી","માર્ચ","એપ્રિલ","મે","જૂન","જુલાઈ","ઑગસ્ટ","સપ્ટેમ્બર","ઑક્ટોબર","નવેમ્બર","ડિસેમ્બર"];
const guDate=GUD(now.getDate())+" "+GUM[now.getMonth()];

const CSS=`.spd-btn{position:fixed;left:50%;translate:-50% 0;bottom:max(14px,env(safe-area-inset-bottom,0px));z-index:93;display:flex;align-items:center;gap:8px;
  height:48px;padding:0 16px 0 6px;border-radius:999px;border:1px solid var(--sp-line,rgba(0,0,0,.14));background:var(--sp-card,#fff);color:var(--sp-ink,#222);cursor:pointer;
  box-shadow:0 8px 26px rgba(40,30,70,.2);font:600 13.5px/1.15 "Anek Gujarati",system-ui,sans-serif;max-width:calc(100vw - 230px);text-align:left}
.spd-btn .spd-ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#ffe7a8,#f59e0b 60%,#c2410c);box-shadow:0 0 0 0 rgba(245,158,11,.5);animation:spdGlow 2.8s ease-in-out infinite}
.spd-btn .spd-ic svg{width:22px;height:22px}
.spd-btn .spd-t{display:flex;flex-direction:column;min-width:0}.spd-btn .spd-t small{font-weight:500;font-size:11.5px;opacity:.7}
.spd-btn .spd-dot{position:absolute;top:4px;left:36px;width:10px;height:10px;border-radius:50%;background:#e11d48;border:2px solid var(--sp-card,#fff)}
@keyframes spdGlow{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.45)}50%{box-shadow:0 0 0 8px rgba(245,158,11,0)}}
@media (max-width:640px){.spd-btn{padding:0 6px;width:48px;justify-content:center}.spd-btn .spd-t{display:none}}
@media (prefers-reduced-motion:reduce){.spd-btn .spd-ic{animation:none}}
.spd-peek{position:fixed;left:50%;translate:-50% 0;bottom:calc(max(14px,env(safe-area-inset-bottom,0px)) + 58px);z-index:93;width:max-content;max-width:min(340px,calc(100vw - 40px));
  background:var(--sp-card,#fff);color:var(--sp-ink,#222);border:1px solid var(--sp-line,rgba(0,0,0,.14));border-radius:14px;padding:10px 12px;font:500 13.5px/1.4 "Anek Gujarati",system-ui,sans-serif;
  box-shadow:0 10px 30px rgba(40,30,70,.2);cursor:pointer;animation:spdIn .45s cubic-bezier(.2,.8,.2,1)}
.spd-peek b{color:var(--sp-acc,#c2410c)}
@media (max-width:640px){.spd-peek{display:none}}
@keyframes spdIn{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
.spd-pan{position:fixed;left:50%;translate:-50% 0;bottom:calc(max(14px,env(safe-area-inset-bottom,0px)) + 58px);z-index:97;width:min(400px,calc(100vw - 28px));
  max-height:min(640px,calc(100vh - 96px));display:flex;flex-direction:column;background:var(--sp-card,#fff);color:var(--sp-ink,#222);border:1px solid var(--sp-line,rgba(0,0,0,.14));
  border-radius:18px;box-shadow:0 18px 50px rgba(40,30,70,.28);font:15px/1.5 "Anek Gujarati",system-ui,sans-serif;overflow:hidden;animation:spdIn .3s cubic-bezier(.2,.8,.2,1)}
.spd-pan[hidden]{display:none}
.spd-hd{position:relative;padding:14px 46px 12px 16px;color:#fff;background:linear-gradient(135deg,#9a3412,#c2410c 45%,#b45309);overflow:hidden}
.spd-hd::after{content:"";position:absolute;right:-30px;top:-30px;width:130px;height:130px;border-radius:50%;background:radial-gradient(circle,rgba(255,231,168,.55),transparent 65%)}
.spd-hd .k{font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;opacity:.85;font-weight:600}
.spd-hd h2{margin:2px 0 0;font:400 22px/1.15 "Shrikhand","Anek Gujarati",serif;letter-spacing:.01em}
.spd-hd h2 small{display:block;font:500 13px/1.3 "Anek Gujarati",system-ui,sans-serif;opacity:.9;margin-top:2px}
.spd-x{position:absolute;right:10px;top:10px;z-index:1;width:30px;height:30px;border-radius:50%;border:0;background:rgba(255,255,255,.18);color:#fff;cursor:pointer;font-size:18px;line-height:1}
.spd-tabs{display:flex;gap:4px;padding:8px 10px 0;border-bottom:1px solid var(--sp-line,rgba(0,0,0,.12))}
.spd-tabs button{flex:1;border:0;background:none;color:inherit;opacity:.7;padding:8px 4px 9px;font:600 13px/1.2 inherit;cursor:pointer;border-bottom:2.5px solid transparent;font-family:inherit}
.spd-tabs button small{display:block;font-weight:500;font-size:11px;opacity:.75}
.spd-tabs button[aria-selected="true"]{opacity:1;border-bottom-color:var(--sp-acc,#c2410c);color:var(--sp-acc,#c2410c)}
.spd-bd{overflow:auto;padding:12px 14px 6px;flex:1}
.spd-it{display:grid;grid-template-columns:auto 1fr;gap:10px;padding:10px 0;border-bottom:1px dashed var(--sp-line,rgba(0,0,0,.12))}
.spd-it:last-child{border-bottom:0}
.spd-y{font:700 12.5px/1 system-ui,sans-serif;background:color-mix(in srgb,var(--sp-acc,#c2410c) 14%,transparent);color:var(--sp-acc,#c2410c);border-radius:999px;padding:5px 8px;height:max-content}
.spd-it p{margin:0;font-size:14.5px}.spd-it p small,.spd-fact small,.spd-news small{display:block;opacity:.72;font-size:13px;margin-top:2px}
.spd-it a,.spd-src a,.spd-news a{color:var(--sp-acc,#c2410c);font-weight:600;text-decoration:none}.spd-it a:hover,.spd-news a:hover{text-decoration:underline}
.spd-meta{font-size:12px;opacity:.7;margin-top:3px}
.spd-pic{grid-column:1/-1;border-radius:12px;overflow:hidden;background:color-mix(in srgb,var(--sp-acc,#c2410c) 8%,transparent);aspect-ratio:16/9}
.spd-pic img{width:100%;height:100%;object-fit:cover;display:block}
.spd-fact{position:relative;padding:16px 14px 12px;border-radius:14px;background:linear-gradient(160deg,color-mix(in srgb,var(--sp-acc,#c2410c) 12%,transparent),transparent 75%);border:1px solid var(--sp-line,rgba(0,0,0,.1))}
.spd-fact .em{font-size:34px;line-height:1;display:block;margin-bottom:8px}
.spd-fact p{margin:0;font-size:16px;font-weight:500}
.spd-src{font-size:12px;opacity:.85;margin-top:10px}
.spd-nav{display:flex;justify-content:space-between;align-items:center;margin:10px 2px 4px;font-size:12.5px;opacity:.8}
.spd-nav button{border:1px solid var(--sp-line,rgba(0,0,0,.14));background:none;color:inherit;border-radius:999px;width:34px;height:34px;cursor:pointer;font-size:16px}
.spd-cd{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;background:linear-gradient(135deg,#0e5a61,#0f766e);color:#fff;margin-bottom:10px}
.spd-cd .n{font:700 28px/1 system-ui,sans-serif;min-width:52px;text-align:center}.spd-cd .n small{display:block;font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.85}
.spd-cd p{margin:0;font-weight:600}.spd-cd p small{display:block;font-weight:500;opacity:.85;font-size:12.5px}
.spd-news{display:grid;grid-template-columns:76px 1fr;gap:10px;padding:8px 0;border-bottom:1px dashed var(--sp-line,rgba(0,0,0,.12));align-items:center}
.spd-news img{width:76px;height:54px;object-fit:cover;border-radius:8px;background:rgba(127,127,127,.15)}
.spd-news p{margin:0;font-size:14px;font-weight:500;line-height:1.3}
.spd-ft{display:flex;gap:8px;padding:10px 14px 12px;border-top:1px solid var(--sp-line,rgba(0,0,0,.12))}
.spd-ft a{flex:1;text-align:center;text-decoration:none;border-radius:12px;padding:9px 6px;font-weight:600;font-size:13.5px;border:1px solid var(--sp-line,rgba(0,0,0,.14));color:inherit}
.spd-ft a.p{background:var(--sp-acc,#c2410c);border-color:var(--sp-acc,#c2410c);color:#fff}
.spd-empty{opacity:.7;font-size:14px;padding:8px 0}
@media print{.spd-btn,.spd-pan,.spd-peek{display:none!important}}`;
// Kaal Patrak keeps its Calendar / Day register switch at the bottom of the screen: sit above it there
const LIFT=/\/kaal-patrak\//i.test(location.pathname)?62:0;
const st=document.createElement("style");st.textContent=LIFT?CSS.replace(/max\(14px,env\(safe-area-inset-bottom,0px\)\)/g,`calc(max(14px,env(safe-area-inset-bottom,0px)) + ${LIFT}px)`):CSS;document.head.appendChild(st);

const DIYA='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c1.6 2.2 2.4 3.9 2.4 5.2a2.4 2.4 0 0 1-4.8 0c0-1.3.8-3 2.4-5.2z" fill="#fff7d6"/><path d="M12 5.2c.7 1 1 1.8 1 2.4a1 1 0 0 1-2 0c0-.6.3-1.4 1-2.4z" fill="#f97316"/><path d="M3 13h18c-.6 4-4.4 6.5-9 6.5S3.6 17 3 13z" fill="#7c2d12"/><path d="M5 13h14" stroke="#fde68a" stroke-width="1.4" stroke-linecap="round"/></svg>';
const btn=document.createElement("button");btn.type="button";btn.className="spd-btn sp-lang-keep";btn.setAttribute("aria-haspopup","dialog");btn.setAttribute("aria-expanded","false");
const pan=document.createElement("section");pan.className="spd-pan sp-lang-keep";pan.hidden=true;pan.setAttribute("role","dialog");pan.setAttribute("aria-label","Fact of the day");
document.body.appendChild(btn);document.body.appendChild(pan);

let F=null,U=null,N=null,tab=get("sp-daily-tab","day"),k=DOY;
function paintBtn(){const seen=get("sp-daily-open","")===TODAY;
  btn.innerHTML=`<span class="spd-ic">${DIYA}</span>${seen?"":'<span class="spd-dot" aria-hidden="true"></span>'}<span class="spd-t">${T("Fact of the day","આજની વાત",true)}<small>${T(enDate,guDate,true)}</small></span>`;
  btn.title=lang()==="en"?"Fact of the day":"આજની વાત · Fact of the day"}
function dayItems(){return (F&&F.days[MD])||[]}
function itemHtml(it){
  const y=`<span class="spd-y">${it.y}</span>`;const ago=now.getFullYear()-it.y;
  const txt=it.e?T(it.e,it.g):esc(it.g);
  const link=it.k?`<a href="${esc(url(it.k))}">${it.v?T("Read this Vachanamrut","વચનામૃત વાંચો",true):T("Open in Kaal Patrak","કાળ પત્રકમાં જુઓ",true)} →</a>`:"";
  const src=it.p===3?T("Shri Swaminarayanam book","શ્રી સ્વામિનારાયણમ્ ગ્રંથ",true):it.s?`<a href="${esc(url(it.s[1]))}" target="_blank" rel="noopener">${esc(it.s[0])}</a>`:"";
  return `<div class="spd-it">${it.img?`<div class="spd-pic"><img src="${esc(url(it.img))}" alt="" loading="lazy"></div>`:""}${y}<div><p>${txt}</p>
    <div class="spd-meta">${T(ago+" years ago",GUD(ago)+" વર્ષ પહેલાં",true)}${src?" · "+src:""}</div><div class="spd-meta">${link}</div></div></div>`}
function body(){
  if(!F)return `<p class="spd-empty">${T("Loading…","લાવી રહ્યા છીએ…",true)}</p>`;
  if(tab==="day"){const its=dayItems().slice(0,6);
    return its.length?`<div class="spd-meta" style="margin-bottom:4px">${T("What happened on "+enDate+", in the years 1781–1830","૧૭૮૧–૧૮૩૦નાં વર્ષોમાં "+guDate+"ના દિવસે",true)}</div>`+its.map(itemHtml).join("")
      :`<p class="spd-empty">${T("Nothing recorded for this date. See Did you know.","આ તારીખ માટે નોંધ નથી. જાણવા જેવું જુઓ.",true)}</p>`}
  if(tab==="know"){const P=F.pool,f=P[((k%P.length)+P.length)%P.length];
    return `<div class="spd-fact"><span class="em" aria-hidden="true">${f.i||"🪔"}</span><p>${T(f.e,f.g)}</p>
      <div class="spd-src">${T("Source","સ્રોત",true)}: <a href="${esc(url(f.s[1]))}" target="_blank" rel="noopener">${esc(f.s[0])}</a></div></div>
      <div class="spd-nav"><button type="button" data-k="-1" aria-label="Previous fact">‹</button><span>${(((k%P.length)+P.length)%P.length)+1} / ${P.length}</span><button type="button" data-k="1" aria-label="Next fact">›</button></div>`}
  // news
  let h="";const nx=U&&U.u.find(x=>x[0]>=TODAY&&x[3]==="f"),ne=U&&U.u.find(x=>x[0]>=TODAY&&x[3]==="e");
  for(const x of [nx,ne]){if(!x)continue;const d=Math.round((new Date(x[0]+"T00:00:00")-new Date(TODAY+"T00:00:00"))/864e5);
    const dd=new Date(x[0]+"T00:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
    h+=`<div class="spd-cd"${x[3]==="e"?' style="background:linear-gradient(135deg,#3f6212,#4d7c0f)"':""}><div class="n">${d===0?"🎉":d}<small>${d===0?T("today","આજે",true):T("days","દિવસ",true)}</small></div><p>${T(x[1],x[2])}<small>${esc(dd)}</small></p></div>`}
  const items=[];if(N){(N.events||[]).filter(e=>e.end>=TODAY).slice(0,2).forEach(e=>items.push({t:e.t,img:e.img,u:e.u,d:e.when}));
    (N.galleries||[]).slice(0,4).forEach(g=>items.push({t:g.t,img:g.img,u:g.u,d:g.date}))}
  h+=items.length?items.slice(0,5).map(n=>`<div class="spd-news">${n.img?`<img src="${esc(n.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`:"<span></span>"}<div><p><a href="${esc(n.u)}" target="_blank" rel="noopener">${esc(n.t)}</a></p><small>${esc(n.d||"")}</small></div></div>`).join("")
    :`<p class="spd-empty">${T("News could not be loaded right now.","અત્યારે સમાચાર મળી શક્યા નથી.",true)}</p>`;
  return h+`<div class="spd-src">${T("From the official Kalupur mandir site","કાલુપુર મંદિરની સત્તાવાર સાઇટ પરથી",true)} · <a href="https://www.swaminarayan.info" target="_blank" rel="noopener">swaminarayan.info</a></div>`}
function paint(){
  const tabs=[["day","On this day","આ દિવસે"],["know","Did you know","જાણવા જેવું"],["news","News","સમાચાર"]];
  pan.innerHTML=`<div class="spd-hd"><div class="k">${T("Swaminarayan sampraday","સ્વામિનારાયણ સંપ્રદાય",true)}</div><h2>${T("Fact of the day","આજની વાત")}</h2><button class="spd-x" type="button" aria-label="Close">×</button></div>
   <div class="spd-tabs" role="tablist">${tabs.map(([id,en,gu])=>`<button type="button" role="tab" data-tab="${id}" aria-selected="${tab===id}">${lang()==="en"?esc(en):lang()==="gu"?esc(gu):`${esc(gu)}<small>${esc(en)}</small>`}</button>`).join("")}</div>
   <div class="spd-bd">${body()}</div>
   <div class="spd-ft"><a class="p" href="${ROOT}play/">${T("Play a quiz","ક્વિઝ રમો",true)}</a><a href="${ROOT}news.html">${T("All news","બધા સમાચાર",true)}</a></div>`}
pan.addEventListener("click",e=>{const t=e.target.closest("[data-tab]");if(t){tab=t.dataset.tab;put("sp-daily-tab",tab);paint();return}
  const n=e.target.closest("[data-k]");if(n){k+=+n.dataset.k;paint();return}
  if(e.target.closest(".spd-x"))toggle(false)});
function toggle(o){pan.hidden=!o;btn.setAttribute("aria-expanded",o);if(o){put("sp-daily-open",TODAY);paint();paintBtn();peekOff();const b=pan.querySelector(".spd-x");b&&b.focus({preventScroll:true})}}
btn.addEventListener("click",()=>toggle(pan.hidden));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!pan.hidden){toggle(false);btn.focus()}});
document.addEventListener("click",e=>{if(!pan.hidden&&!e.composedPath().includes(pan)&&!e.composedPath().includes(btn))toggle(false)});
let peek=null;function peekOff(){if(peek){peek.remove();peek=null}}
function maybePeek(){if(get("sp-daily-seen","")===TODAY||get("sp-daily-open","")===TODAY)return;put("sp-daily-seen",TODAY);
  const its=dayItems(),it=its.find(x=>x.e)||its[0],f=F.pool[DOY%F.pool.length];
  const line=it?(it.y+": "+(lang()==="en"&&it.e?it.e:(it.g||it.e))):(lang()==="en"?f.e:f.g);
  peek=document.createElement("div");peek.className="spd-peek sp-lang-keep";peek.innerHTML=`<b>${T("Today in "+(it?it.y:"history"),"આજના દિવસે",true)}</b><br>${esc(line.length>120?line.slice(0,118)+"…":line)}`;
  peek.addEventListener("click",()=>toggle(true));document.body.appendChild(peek);setTimeout(peekOff,9000)}
paintBtn();
new MutationObserver(()=>{paintBtn();if(!pan.hidden)paint()}).observe(document.documentElement,{attributes:true,attributeFilter:["data-sp-lang"]});
const j=u=>fetch(ROOT+u).then(r=>r.ok?r.json():null).catch(()=>null);
j("data/play/facts.json").then(d=>{F=d;if(!F)return;if(!pan.hidden)paint();setTimeout(maybePeek,2500)});
j("data/play/utsav.json").then(d=>{U=d;if(!pan.hidden)paint()});
j("vachanamrut-concordance/data/live.json").then(d=>{N=d;if(!pan.hidden)paint()});
})();
