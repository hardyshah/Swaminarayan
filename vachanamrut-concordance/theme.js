/* Site theme: colour theme (data-palette) and light/dark mode (data-theme), shared by every page.
   Loaded in <head> so the saved choice applies before the page paints. Choices live in localStorage
   (vc-theme: system|light|dark, vc-palette: one of P below) and follow you across pages and tabs. */
(function(){
"use strict";
const r=document.documentElement;
// token sets per palette; "kesar" is the colours written into the pages, so it needs none
const P={
 mandir:{en:"Mandir",gu:"મંદિર",sw:["#a3341a","#d9a93a"],
  l:"--paper:#fbf6ec;--surface:#fffdf8;--sunk:#f3ead9;--ink:#2a1a12;--ink-2:#61493a;--ink-3:#7f6a58;--line:#e8dcc6;--saffron:#a3341a;--saffron-strong:#832612;--saffron-soft:#f8e0cc;--peacock:#7d5a0c;--peacock-soft:#f3e7c8;--mark:#fadcae;--mark-ink:#55240a;--grid:#efe5d3;--empty:#f1e8d8",
  d:"--paper:#140c0a;--surface:#1e1310;--sunk:#281a15;--ink:#f3e8da;--ink-2:#c9b6a2;--ink-3:#94806d;--line:#3b2a22;--saffron:#f2a65a;--saffron-strong:#ffc07c;--saffron-soft:#3f2614;--peacock:#e3c16f;--peacock-soft:#352a14;--mark:#6a3a14;--mark-ink:#ffe8cc;--grid:#2a1c16;--empty:#241712"},
 kesar:{en:"Saffron",gu:"કેસર",sw:["#b9560c","#0e5a61"]},
 chandan:{en:"Sandalwood",gu:"ચંદન",sw:["#a0521a","#6b4a1f"],
  l:"--paper:#f4ecdc;--surface:#fffaf0;--sunk:#ece2cd;--ink:#2b2014;--ink-2:#65553f;--ink-3:#8a7a62;--line:#dfd2b8;--saffron:#a0521a;--saffron-strong:#83400f;--saffron-soft:#f3dcc0;--peacock:#6b4a1f;--peacock-soft:#eadcc2;--mark:#f6d7a8;--mark-ink:#4d2a06;--grid:#e8dec9;--empty:#ebe2cf",
  d:"--paper:#17120c;--surface:#1f1810;--sunk:#281f15;--ink:#eee3d0;--ink-2:#b6a68d;--ink-3:#85765f;--line:#3a2f22;--saffron:#e9a25a;--saffron-strong:#f7ba78;--saffron-soft:#3c2a16;--peacock:#d6b47a;--peacock-soft:#34291a;--mark:#6a4513;--mark-ink:#ffe9c7;--grid:#2a2117;--empty:#241c13"},
 mor:{en:"Peacock",gu:"મોર",sw:["#1d5f9c","#0d6b63"],
  l:"--paper:#eef3f5;--surface:#ffffff;--sunk:#e1e9ec;--ink:#10202a;--ink-2:#4c5f69;--ink-3:#778891;--line:#d2dde2;--saffron:#1d5f9c;--saffron-strong:#164c7f;--saffron-soft:#d9e6f3;--peacock:#0d6b63;--peacock-soft:#d3e9e6;--mark:#cfe2f5;--mark-ink:#0d2f52;--grid:#e2eaed;--empty:#e5ecef",
  d:"--paper:#0b1320;--surface:#111b2b;--sunk:#172336;--ink:#e3e9f0;--ink-2:#9fb0c2;--ink-3:#6f8296;--line:#22324a;--saffron:#6aa9ec;--saffron-strong:#8cc0f5;--saffron-soft:#16294a;--peacock:#5fc4b8;--peacock-soft:#133536;--mark:#1e3d66;--mark-ink:#dcebff;--grid:#192638;--empty:#152133"},
 tulsi:{en:"Tulsi green",gu:"તુલસી",sw:["#2f7a3b","#6b5a12"],
  l:"--paper:#f0f4ec;--surface:#ffffff;--sunk:#e3eadb;--ink:#142216;--ink-2:#4f6151;--ink-3:#7a897c;--line:#d3ddcc;--saffron:#2f7a3b;--saffron-strong:#23602d;--saffron-soft:#dcefd9;--peacock:#6b5a12;--peacock-soft:#eee6c9;--mark:#d5ecc9;--mark-ink:#173d1c;--grid:#e4eadc;--empty:#e6ecdf",
  d:"--paper:#0c140e;--surface:#121d14;--sunk:#19261b;--ink:#e4ebe2;--ink-2:#a2b3a3;--ink-3:#718472;--line:#243527;--saffron:#7cc98a;--saffron-strong:#98dba4;--saffron-soft:#18331d;--peacock:#d9c16a;--peacock-soft:#2f2a14;--mark:#23502c;--mark-ink:#def5e0;--grid:#1a271c;--empty:#172319"},
 kumkum:{en:"Kumkum red",gu:"કુમકુમ",sw:["#b0262f","#7a4a10"],
  l:"--paper:#f7f0ee;--surface:#ffffff;--sunk:#efe3df;--ink:#261413;--ink-2:#6a4f4c;--ink-3:#927874;--line:#e6d4cf;--saffron:#b0262f;--saffron-strong:#8f1b23;--saffron-soft:#f7dcdc;--peacock:#7a4a10;--peacock-soft:#f1e2c9;--mark:#f9d4d2;--mark-ink:#5c0e13;--grid:#efe4e0;--empty:#f0e6e2",
  d:"--paper:#160d0d;--surface:#201313;--sunk:#2a1a1a;--ink:#f0e4e2;--ink-2:#c1a5a1;--ink-3:#8f7470;--line:#3d2524;--saffron:#f07a7f;--saffron-strong:#ff9da0;--saffron-soft:#3d1a1c;--peacock:#e7b468;--peacock-soft:#3a2a14;--mark:#5e1e22;--mark-ink:#ffe1e1;--grid:#2a1a1a;--empty:#251616"}};
const MODES=[["system","Auto","આપમેળે"],["light","Light","દિવસ"],["dark","Dark","રાત્રિ"]];
const get=(k,d)=>{try{return localStorage.getItem(k)||d}catch(e){return d}};
const put=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
let mode=get("vc-theme","system"),pal=get("vc-palette","mandir");
if(!MODES.some(m=>m[0]===mode))mode="system";
if(!P[pal])pal="mandir";
// html:root[...] outranks the pages' own :root rules, which come later in <head>
let css="";
for(const[k,p]of Object.entries(P)){if(!p.l)continue;const s=`html:root[data-palette="${k}"]`;
  css+=`${s}{${p.l}}@media (prefers-color-scheme:dark){${s}:not([data-theme="light"]){${p.d}}}${s}[data-theme="dark"]{${p.d}}`}
css+=`.vc-tm{position:fixed;z-index:90;width:min(300px,calc(100vw - 24px));background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:14px;
  box-shadow:0 18px 48px rgba(0,0,0,.22);padding:14px;font:14px/1.35 var(--f-ui,system-ui,sans-serif)}
.vc-tm h3{margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3)}
.vc-tm h3+div{margin-bottom:14px}.vc-tm div:last-child{margin-bottom:0}
.vc-tm .md{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:var(--sunk);border-radius:10px;padding:3px}
.vc-tm .md button{border:0;background:none;border-radius:8px;padding:7px 4px;cursor:pointer;color:var(--ink-2);font:inherit;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:2px}
.vc-tm .md button small{font-size:11px;color:var(--ink-3)}
.vc-tm .md button[aria-checked="true"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.15)}
.vc-tm .pl{display:grid;gap:4px}
.vc-tm .pl button{display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:10px;border:1px solid transparent;background:none;border-radius:10px;padding:6px 8px;cursor:pointer;color:var(--ink);font:inherit;text-align:left}
.vc-tm .pl button:hover{background:var(--sunk)}
.vc-tm .pl button[aria-checked="true"]{border-color:var(--saffron);background:var(--saffron-soft)}
.vc-tm .pl i{width:30px;height:30px;border-radius:50%;display:block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.vc-tm .pl small{color:var(--ink-3);font-size:12.5px}
.vc-tm .pl b{font-weight:600}
.vc-tm button:focus-visible{outline:2px solid var(--saffron);outline-offset:1px}
.vc-tm .ck{color:var(--saffron);visibility:hidden}.vc-tm [aria-checked="true"] .ck{visibility:visible}`;
const st=document.createElement("style");st.id="vc-theme-css";st.textContent=css;
(document.head||r).appendChild(st);
function apply(){
  if(mode==="system")r.removeAttribute("data-theme");else r.setAttribute("data-theme",mode);
  if(pal==="kesar")r.removeAttribute("data-palette");else r.setAttribute("data-palette",pal);
  if(menu)paint();
}
let menu=null,btn=null;
const ICON='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7.2" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/></svg>';
function paint(){
  menu.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-checked",b.dataset.m===mode));
  menu.querySelectorAll("[data-p]").forEach(b=>b.setAttribute("aria-checked",b.dataset.p===pal));
}
function place(){const b=btn.getBoundingClientRect(),w=menu.offsetWidth;
  menu.style.top=Math.round(b.bottom+8)+"px";menu.style.left=Math.round(Math.max(12,Math.min(innerWidth-w-12,b.right-w)))+"px"}
function open(){
  menu=document.createElement("div");menu.className="vc-tm";menu.setAttribute("role","dialog");menu.setAttribute("aria-label","Page theme");
  menu.innerHTML=`<h3>Appearance · દેખાવ</h3><div class="md" role="radiogroup" aria-label="Light or dark">${MODES.map(([k,en,gu])=>`<button role="radio" data-m="${k}">${en}<small>${gu}</small></button>`).join("")}</div>
    <h3>Colour theme · રંગ</h3><div class="pl" role="radiogroup" aria-label="Colour theme">${Object.entries(P).map(([k,p])=>`<button role="radio" data-p="${k}"><i style="background:linear-gradient(135deg,${p.sw[0]} 50%,${p.sw[1]} 50%)"></i><span><b>${p.en}</b> <small>${p.gu}</small></span><span class="ck">✓</span></button>`).join("")}</div>`;
  document.body.appendChild(menu);paint();place();
  btn.setAttribute("aria-expanded","true");
  menu.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.m){mode=b.dataset.m;put("vc-theme",mode)}else if(b.dataset.p){pal=b.dataset.p;put("vc-palette",pal)}apply()});
  // arrow keys move within each radio group
  menu.addEventListener("keydown",e=>{const g=e.target.closest("[role=radiogroup]");if(!g||!/Arrow/.test(e.key))return;e.preventDefault();
    const bs=[...g.children],i=bs.indexOf(e.target),n=/Right|Down/.test(e.key)?1:-1;bs[(i+n+bs.length)%bs.length].focus()});
  (menu.querySelector('[aria-checked="true"][data-p]')||menu.querySelector("button")).focus();
  setTimeout(()=>{document.addEventListener("pointerdown",outside,true);document.addEventListener("keydown",esc,true)});
  addEventListener("resize",place);
}
function close(refocus){if(!menu)return;menu.remove();menu=null;btn.setAttribute("aria-expanded","false");
  document.removeEventListener("pointerdown",outside,true);document.removeEventListener("keydown",esc,true);removeEventListener("resize",place);
  if(refocus)btn.focus()}
function outside(e){if(!menu.contains(e.target)&&!btn.contains(e.target))close(false)}
function esc(e){if(e.key==="Escape"){e.stopPropagation();close(true)}}
function wire(){
  const old=document.getElementById("theme");if(!old)return;
  btn=old.cloneNode(false);old.replaceWith(btn);  // a fresh button drops any older one-click toggle
  btn.innerHTML=ICON;btn.title="Theme · રંગ અને દેખાવ";btn.setAttribute("aria-label","Change theme");
  btn.setAttribute("aria-haspopup","dialog");btn.setAttribute("aria-expanded","false");
  btn.addEventListener("click",()=>menu?close(true):open());
}
apply();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wire);else wire();
// keep other open tabs in step
addEventListener("storage",e=>{if(e.key==="vc-theme"&&e.newValue)mode=e.newValue;else if(e.key==="vc-palette"&&e.newValue&&P[e.newValue])pal=e.newValue;else return;apply()});
})();
