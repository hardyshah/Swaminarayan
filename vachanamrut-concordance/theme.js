/* Site theme for the Vachanamrut concordance and the Swaminarayan home pages: the same colour themes, light/dark and
   accent picker as Kaal Patrak (choices shared across the whole site through localStorage sp-mode / sp-palette / sp-accent),
   plus the shared look-and-sound layer in ../site/sp.js and sp.css. Loaded in <head> so the theme applies before paint. */
window.SP_THEME_MAP={bg:"--paper",card:"--surface",ink:"--ink",muted:"--ink-2",line:"--line",acc:"--saffron",accS:"--saffron-soft",acc2:"--peacock",acc2S:"--peacock-soft",c1:"--sunk",warn:"--saffron-strong"};
(function(){const me=document.currentScript&&document.currentScript.src;if(!me)return;const base=new URL("../site/",me).href;
  const l=document.createElement("link");l.rel="stylesheet";l.href=base+"sp.css?v=2";document.head.appendChild(l);
  const s=document.createElement("script");s.src=base+"sp.js?v=2";s.defer=true;document.head.appendChild(s);})();
/* Theme menu for Kaal Patrak and Satsang Parichay: pastel colour themes, light/dark, and a custom accent colour.
   Default: light + Lavender. Choices are saved per viewer in localStorage (sp-mode, sp-palette, sp-accent). */
(function(){
"use strict";
const r=document.documentElement;
const MAP=window.SP_THEME_MAP; // generic key -> this page's CSS variable
// generic keys: bg card ink muted line acc accS acc2 acc2S c1 c2 c3 c4 warn warnS
const NIGHT={bg:"#1A1922",card:"#23222E",ink:"#EEEAF6",muted:"#ABA6BF",line:"#363445",c1:"#2A2640",c2:"#3A2733",c3:"#38331F",c4:"#1F3532",warn:"#F5A27A",warnS:"#3A2218"};
const REC={
 ivory:{en:"Mandir ivory",gu:"હાથીદાંત",grp:"rec",l:{bg:"#FAF7F2",card:"#FFFFFF",ink:"#1F1B16",muted:"#6B6257",line:"#ECE4D8",acc:"#C2410C",accS:"#FDEBDD",acc2:"#7C2D12",acc2S:"#F7E6DC",c1:"#FBF1E3",c2:"#F4EEE6",c3:"#FFF7E0",c4:"#EEF4EE",warn:"#9A3412",warnS:"#FFEDD5"},d:{bg:"#17130F",card:"#211C17",ink:"#F4ECDF",muted:"#B5A897",line:"#3A3128",acc:"#FB923C",accS:"#3B2414",acc2:"#FDBA74",acc2S:"#3A2618",c1:"#2A2219",c2:"#26201A",c3:"#2E2716",c4:"#1E2A22"}},
 kesar:{en:"Kesar dawn",gu:"કેસર",grp:"rec",l:{bg:"#FFF8EF",card:"#FFFFFF",ink:"#231A12",muted:"#715F4E",line:"#F2E3CF",acc:"#D9480F",accS:"#FFE8D9",acc2:"#0F766E",acc2S:"#DDF3EF",c1:"#FFEFD9",c2:"#FDF3E7",c3:"#FFF6D6",c4:"#E3F4F0",warn:"#9A3412",warnS:"#FFEDD5"},d:{acc:"#FF8A4C",accS:"#3D2416",acc2:"#5EEAD4",acc2S:"#12332F"}},
 tulsi:{en:"Tulsi green",gu:"તુલસી",grp:"rec",l:{bg:"#F5F8F3",card:"#FFFFFF",ink:"#18231B",muted:"#5B6B5E",line:"#DFE8DC",acc:"#2F6B3A",accS:"#E1EFE2",acc2:"#A16207",acc2S:"#FBF0D9",c1:"#E8F2E6",c2:"#F3F6EC",c3:"#FDF5DE",c4:"#E6F1F2",warn:"#9A3412",warnS:"#FFEDD5"},d:{acc:"#86D49A",accS:"#183224",acc2:"#FACC15",acc2S:"#33290F"}},
 neel:{en:"Neel indigo",gu:"નીલ",grp:"rec",l:{bg:"#F6F7FB",card:"#FFFFFF",ink:"#1B1E2E",muted:"#5D6280",line:"#E2E5F0",acc:"#C2410C",accS:"#FDEBDD",acc2:"#3730A3",acc2S:"#E5E4FA",c1:"#E9EBFA",c2:"#F7EDF2",c3:"#FFF6E0",c4:"#E5F3F0",warn:"#9A3412",warnS:"#FFEDD5"},d:{acc:"#FB923C",accS:"#3B2414",acc2:"#A5B4FC",acc2S:"#25284A"}},
 chandan:{en:"Chandan night",gu:"ચંદન રાત્રિ",grp:"rec",dark:true,l:{bg:"#16130F",card:"#201B16",ink:"#F3EBDD",muted:"#B3A693",line:"#372E25",acc:"#F59E0B",accS:"#3A2A0E",acc2:"#FCA5A5",acc2S:"#3A2020",c1:"#28211A",c2:"#2A1F20",c3:"#2D2614",c4:"#1C2722",warn:"#FDBA74",warnS:"#3A2418"},d:{bg:"#16130F",card:"#201B16",ink:"#F3EBDD",muted:"#B3A693",line:"#372E25",acc:"#F59E0B",accS:"#3A2A0E",acc2:"#FCA5A5",acc2S:"#3A2020",c1:"#28211A",c2:"#2A1F20",c3:"#2D2614",c4:"#1C2722"}}
};
const P0={
 lavender:{en:"Lavender",gu:"લવંડર",l:{bg:"#F7F4FB",card:"#FFFFFF",ink:"#2A2838",muted:"#6B6880",line:"#E7E2F0",acc:"#B4533A",accS:"#FDE6DD",acc2:"#4F55B8",acc2S:"#E8E9FB",c1:"#ECE6FA",c2:"#FCE6EF",c3:"#FFF3D6",c4:"#E2F3EF",warn:"#A14A2A",warnS:"#FFEDE3"},d:{acc:"#F5A88C",accS:"#3D2A27",acc2:"#B4B8FF",acc2S:"#2B2D4D"}},
 mint:{en:"Mint",gu:"ફુદીનો",l:{bg:"#F1F8F4",card:"#FFFFFF",ink:"#1F2E2A",muted:"#5E716B",line:"#D9EAE2",acc:"#2E7D62",accS:"#DCF1E7",acc2:"#3A6EA5",acc2S:"#E3EEF8",c1:"#E1F2EA",c2:"#E6F0FA",c3:"#FFF5DC",c4:"#F1EAF7",warn:"#9A4A2A",warnS:"#FCEDE4"},d:{acc:"#7FD3B2",accS:"#183A2F",acc2:"#9CC3F0",acc2S:"#1D2E44"}},
 peach:{en:"Peach",gu:"પીચ",l:{bg:"#FFF6F1",card:"#FFFFFF",ink:"#33241F",muted:"#7A6259",line:"#F1E0D6",acc:"#C2562F",accS:"#FFE3D6",acc2:"#8A4FA0",acc2S:"#F1E6F6",c1:"#FFE9DE",c2:"#FDE8EE",c3:"#FFF4D2",c4:"#E6F2EC",warn:"#A3402A",warnS:"#FFEDE3"},d:{acc:"#FFB08F",accS:"#3F2A22",acc2:"#D9A9EA",acc2S:"#35263D"}},
 sky:{en:"Sky",gu:"આકાશ",l:{bg:"#F2F7FC",card:"#FFFFFF",ink:"#1E2A3A",muted:"#5D6B80",line:"#DCE6F2",acc:"#2F6DB5",accS:"#DDE9F8",acc2:"#B4533A",acc2S:"#FDE6DD",c1:"#E3ECF9",c2:"#F0E6F8",c3:"#FFF4D9",c4:"#E1F3EF",warn:"#A14A2A",warnS:"#FFEDE3"},d:{acc:"#8EC0F5",accS:"#1C2D47",acc2:"#F5A88C",acc2S:"#3D2A27"}},
 rose:{en:"Rose",gu:"ગુલાબ",l:{bg:"#FCF4F7",card:"#FFFFFF",ink:"#34222B",muted:"#7A6070",line:"#EFDDE5",acc:"#B23A6A",accS:"#FBE0EB",acc2:"#5B5BB0",acc2S:"#E9E8FA",c1:"#F9E3EC",c2:"#EDE6FA",c3:"#FFF2D9",c4:"#E2F2EE",warn:"#A3402A",warnS:"#FFEDE3"},d:{acc:"#F59BBF",accS:"#40232F",acc2:"#B9B8FF",acc2S:"#2B2B4D"}},
 lemon:{en:"Lemon",gu:"લીંબુ",l:{bg:"#FBFAEF",card:"#FFFFFF",ink:"#2C2A1C",muted:"#6C6A55",line:"#ECE8CF",acc:"#8A6A00",accS:"#FAF0C6",acc2:"#2F7A6B",acc2S:"#DFF1EC",c1:"#F6F0D2",c2:"#FBE9E3",c3:"#FFF6CF",c4:"#E3F2EC",warn:"#9A4A2A",warnS:"#FCEDE4"},d:{acc:"#EBCB62",accS:"#3A3218",acc2:"#86D3C2",acc2S:"#173A33"}},
 orchid:{en:"Orchid",sw:["#E7B0DE","#400849","#FF5A0A"],gu:"ઓર્કિડ",l:{bg:"#E7B0DE",card:"#FBEFF8",ink:"#400849",muted:"#6E3F72",line:"#D69BCB",acc:"#FF5A0A",accS:"#FFE1D2",acc2:"#400849",acc2S:"#F1D3EC",c1:"#F4D7EE",c2:"#FFE6D9",c3:"#FAF0F7",c4:"#EBC6E4",warn:"#B23A0A",warnS:"#FFE6D9"},d:{acc:"#FF7A33",accS:"#3F2214",acc2:"#E7B0DE",acc2S:"#3A1F38"}},
 electric:{en:"Electric",sw:["#030407","#1558C8","#D4FF24"],gu:"વીજળી",l:{bg:"#030407",card:"#0E1118",ink:"#F2F4F8",muted:"#9AA3B5",line:"#1F2534",acc:"#D4FF24",accS:"#262E0C",acc2:"#5C8FEA",acc2S:"#0F1E3D",c1:"#0F1730",c2:"#141A26",c3:"#1A2210",c4:"#0B1A2E",warn:"#FF9A6B",warnS:"#2E1A12"},d:{bg:"#030407",card:"#0E1118",ink:"#F2F4F8",muted:"#9AA3B5",line:"#1F2534",acc:"#D4FF24",accS:"#262E0C",acc2:"#5C8FEA",acc2S:"#0F1E3D",c1:"#0F1730",c2:"#141A26",c3:"#1A2210",c4:"#0B1A2E"},dark:true},
 sage:{en:"Sage and sand",sw:["#A5A79B","#E8D2B5","#590907"],gu:"સેજ",l:{bg:"#A5A79B",card:"#F3E7D6",ink:"#2B1C14",muted:"#5E5246",line:"#CDB89B",acc:"#590907",accS:"#EBD3C6",acc2:"#4A5240",acc2S:"#DCDDD2",c1:"#E8D2B5",c2:"#EFDCC3",c3:"#F5EADB",c4:"#D7D8CC",warn:"#7A1E10",warnS:"#F1D9CD"},d:{acc:"#E6A79B",accS:"#3A1D1A",acc2:"#C9CDB5",acc2S:"#2C2F27"}},
 cocoa:{en:"Cocoa",sw:["#5B4632","#F4D9A0","#C8792C"],gu:"કોકો",l:{"bg":"#5B4632","card":"#6A5440","ink":"#F4D9A0","muted":"#D2BC8E","line":"#7E6649","acc":"#F0A65A","accS":"#7A4E25","acc2":"#F4D9A0","acc2S":"#4A3828","c1":"#66503B","c2":"#6E5338","c3":"#735C40","c4":"#5F4C37","warn":"#FFB27A","warnS":"#6E3E22"},d:{"bg":"#5B4632","card":"#6A5440","ink":"#F4D9A0","muted":"#D2BC8E","line":"#7E6649","acc":"#F0A65A","accS":"#7A4E25","acc2":"#F4D9A0","acc2S":"#4A3828","c1":"#66503B","c2":"#6E5338","c3":"#735C40","c4":"#5F4C37","warn":"#FFB27A","warnS":"#6E3E22"},dark:true},
 highlighter:{en:"Highlighter",sw:["#FFF21A","#171717","#A66BFF"],gu:"પીળો",l:{"bg":"#FFF21A","card":"#FFFBC4","ink":"#171717","muted":"#4A4630","line":"#E3D500","acc":"#6E2FD6","accS":"#EBDDFF","acc2":"#171717","acc2S":"#F5EE8A","c1":"#FFF7A0","c2":"#F1E6FF","c3":"#FFFCD6","c4":"#FFF36B","warn":"#9A2A10","warnS":"#FFE3C2"},d:{acc:"#C49BFF",accS:"#33264A",acc2:"#FFF21A",acc2S:"#3A3714"}},
 mist:{en:"Mist",gu:"ધુમ્મસ",sw:["#DEE3E8","#3A0F34","#EAAA00"],l:{"bg":"#DEE3E8","card":"#F6F8FA","ink":"#3A0F34","muted":"#5E4A5C","line":"#C9D0D8","acc":"#8A5F00","accS":"#FCEFC7","acc2":"#3A0F34","acc2S":"#E9DDE7","c1":"#E8ECF0","c2":"#F1E7EF","c3":"#FFF4D1","c4":"#E3EAF1","warn":"#9A3412","warnS":"#FDEBDD"},d:{acc:"#EAAA00",accS:"#3A2E12",acc2:"#E7C8E2",acc2S:"#3A2236"}},
 blaze:{en:"Blaze",gu:"જ્વાળા",sw:["#F04400","#FFD91A","#D0F030"],l:{"bg":"#F04400","card":"#FFD91A","ink":"#000000","muted":"#3A2A00","line":"#E0A800","acc":"#A82E00","accS":"#D0F030","acc2":"#000000","acc2S":"#FFEE8A","c1":"#FFE45C","c2":"#FFEE8A","c3":"#E4F77A","c4":"#FFF4B8","warn":"#7A1F00","warnS":"#FFEE8A"},d:{acc:"#FF7A3D",accS:"#3A4A0C",acc2:"#FFD91A",acc2S:"#3A3310"}},
 sunflower:{en:"Sunflower",gu:"સૂરજમુખી",sw:["#FFC900","#F5F3EF","#08090B"],l:{"bg":"#FFC900","card":"#F5F3EF","ink":"#08090B","muted":"#4A4740","line":"#E2D9C4","acc":"#7A4E00","accS":"#FFE680","acc2":"#08090B","acc2S":"#ECE8E0","c1":"#FFF1B3","c2":"#FBF9F5","c3":"#FFE680","c4":"#ECE8E0","warn":"#8A2A00","warnS":"#FFE3C2"},d:{acc:"#FFC900",accS:"#3A3010",acc2:"#F5F3EF",acc2S:"#2E2D2A"}},
 saffron:{en:"Saffron (original)",gu:"કેસર",l:{bg:"#F4F5F1",card:"#FFFFFF",ink:"#1F2330",muted:"#5E6373",line:"#D8DBD2",acc:"#B85A00",accS:"#FBE7CC",acc2:"#2B3A8C",acc2S:"#E3E6F6",c1:"#E6E3F2",c2:"#F5E2E9",c3:"#F6EFCC",c4:"#E1EDF4",warn:"#9A3412",warnS:"#FDEBDD"},d:{acc:"#F2A541",accS:"#3A2A14",acc2:"#A9B4F5",acc2S:"#232A4D"}}};
const BOLD=["orchid","electric","sage","cocoa","highlighter","mist","blaze","sunflower"];
const P=Object.assign({},REC,P0);for(const k in P)if(!P[k].grp)P[k].grp=BOLD.includes(k)?"bold":"pastel";
const MODES=[["light","Light","દિવસ"],["dark","Dark","રાત્રિ"],["system","Auto","આપમેળે"]];
const get=(k,d)=>{try{return localStorage.getItem(k)||d}catch(e){return d}};
const put=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};
let mode=get("sp-mode","light"),pal=get("sp-palette","ivory"),accent=get("sp-accent","");
if(!MODES.some(m=>m[0]===mode))mode="light";if(!P[pal])pal="ivory";
const decl=o=>Object.entries(o).filter(([k])=>MAP[k]).map(([k,v])=>`${MAP[k]}:${v}`).join(";");
let css="";
for(const[k,p]of Object.entries(P)){const s=`html:root[data-palette="${k}"]`,L=decl(p.l),D=decl({...p.l,...NIGHT,...p.d})+";color-scheme:dark";
  css+=`${s}{${L};color-scheme:${p.dark?"dark":"light"}}${s}[data-mode="dark"]{${D}}@media (prefers-color-scheme:dark){${s}[data-mode="system"]{${D}}}`}
css+=`.sp-tb{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:max(14px,env(safe-area-inset-bottom,0px));z-index:95;width:44px;height:44px;border-radius:50%;border:1px solid ${"var("+MAP.line+")"};background:${"var("+MAP.card+")"};color:${"var("+MAP.ink+")"};display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 20px rgba(40,30,70,.18)}
.sp-tm{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(max(14px,env(safe-area-inset-bottom,0px)) + 54px);z-index:96;width:min(300px,calc(100vw - 28px));max-height:calc(100vh - 90px);overflow:auto;background:var(${MAP.card});color:var(${MAP.ink});border:1px solid var(${MAP.line});border-radius:14px;box-shadow:0 18px 48px rgba(30,20,60,.22);padding:14px;font:14px/1.35 system-ui,sans-serif}
.sp-tm h3{margin:0 0 8px;font-size:11.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(${MAP.muted})}
.sp-tm .grp{margin-bottom:14px}.sp-tm .grp:last-child{margin-bottom:0}
.sp-tm .md{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:var(${MAP.bg});border-radius:10px;padding:3px}
.sp-tm .md button{border:0;background:none;border-radius:8px;padding:7px 4px;cursor:pointer;color:var(${MAP.muted});font:inherit;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:2px}
.sp-tm .md button[aria-checked="true"]{background:var(${MAP.card});color:var(${MAP.ink});box-shadow:0 1px 3px rgba(0,0,0,.15)}
.sp-tm .md small,.sp-tm .pl small{font-size:11.5px;color:var(${MAP.muted})}
.sp-tm .pl{display:grid;gap:3px}
.sp-tm .pl button{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:10px;border:1px solid transparent;background:none;border-radius:10px;padding:5px 8px;cursor:pointer;color:var(${MAP.ink});font:inherit;text-align:left}
.sp-tm .pl button:hover{background:var(${MAP.bg})}
.sp-tm .pl button[aria-checked="true"]{border-color:var(${MAP.acc});background:var(${MAP.accS})}
.sp-tm .pl i{width:28px;height:28px;border-radius:50%;display:block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.sp-tm .ck{color:var(${MAP.acc});visibility:hidden}.sp-tm [aria-checked="true"] .ck{visibility:visible}
.sp-tm .ac{display:flex;align-items:center;gap:10px}.sp-tm input[type=color]{width:44px;height:32px;border:1px solid var(${MAP.line});border-radius:8px;background:none;padding:2px;cursor:pointer}
.sp-tm .ac button{font:inherit;font-size:13px;border:1px solid var(${MAP.line});background:none;color:var(${MAP.ink});border-radius:8px;padding:5px 10px;cursor:pointer}
.sp-tb:focus-visible,.sp-tm button:focus-visible,.sp-tm input:focus-visible{outline:2px solid var(${MAP.acc});outline-offset:2px}
@media print{.sp-tb,.sp-tm{display:none}}`;
const st=document.createElement("style");st.textContent=css;(document.head||r).appendChild(st);
function apply(){
  r.setAttribute("data-palette",pal);r.setAttribute("data-mode",mode);
  if(accent){r.style.setProperty(MAP.acc,accent);r.style.setProperty(MAP.accS,`color-mix(in srgb, ${accent} 16%, var(${MAP.card}))`);}
  else{r.style.removeProperty(MAP.acc);r.style.removeProperty(MAP.accS);}
  if(menu)paint();
  try{window.dispatchEvent(new Event("sp-theme"))}catch(e){}
}
let menu=null;
const btn=document.createElement("button");btn.type="button";btn.className="sp-tb";btn.title="Theme and colours · રંગ";btn.setAttribute("aria-label","Change theme and colours");btn.setAttribute("aria-haspopup","dialog");btn.setAttribute("aria-expanded","false");
btn.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7.2" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/></svg>';
function paint(){menu.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-checked",b.dataset.m===mode));
  menu.querySelectorAll("[data-p]").forEach(b=>b.setAttribute("aria-checked",b.dataset.p===pal));
  const c=menu.querySelector("input[type=color]");c.value=accent||P[pal].l.acc;}
function open(){
  menu=document.createElement("div");menu.className="sp-tm";menu.setAttribute("role","dialog");menu.setAttribute("aria-label","Theme and colours");
  menu.innerHTML=`${[["rec","Recommended · ભલામણ"],["pastel","Pastel · હળવા"],["bold","Bold · ઘાટા"]].map(([G,T])=>`<div class="grp"><h3>${T}</h3><div class="pl" role="radiogroup" aria-label="${T}">${Object.entries(P).filter(([k,p])=>p.grp===G).map(([k,p])=>`<button type="button" role="radio" data-p="${k}"><i style="background:linear-gradient(135deg,${(p.sw||[p.l.c1,p.l.acc,p.l.acc2])[0]} 0 33%,${(p.sw||[p.l.c1,p.l.acc,p.l.acc2])[1]} 33% 66%,${(p.sw||[p.l.c1,p.l.acc,p.l.acc2])[2]} 66%)"></i><span><b>${p.en}</b> <small>${p.gu}</small></span><span class="ck">✓</span></button>`).join("")}</div></div>`).join("")}
   <div class="grp"><h3>Accent colour · મુખ્ય રંગ</h3><div class="ac"><input type="color" aria-label="Pick an accent colour"><button type="button" data-reset>Use theme colour</button></div></div>
   <div class="grp"><h3>Light or dark · દેખાવ</h3><div class="md" role="radiogroup" aria-label="Light or dark">${MODES.map(([k,en,gu])=>`<button type="button" role="radio" data-m="${k}">${en}<small>${gu}</small></button>`).join("")}</div></div>`;
  document.body.appendChild(menu);paint();btn.setAttribute("aria-expanded","true");
  menu.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.m){if(b.dataset.m===mode)return;mode=b.dataset.m;put("sp-mode",mode)}else if(b.dataset.p){if(b.dataset.p===pal&&!accent)return;pal=b.dataset.p;put("sp-palette",pal);accent="";put("sp-accent",null)}else if("reset" in b.dataset){accent="";put("sp-accent",null)}apply()});
  menu.querySelector("input[type=color]").addEventListener("input",e=>{accent=e.target.value;put("sp-accent",accent);apply()});
  (menu.querySelector('[aria-checked="true"][data-p]')||menu.querySelector("button")).focus();
  setTimeout(()=>{document.addEventListener("pointerdown",outside,true);document.addEventListener("keydown",esc,true)});
}
function close(refocus){if(!menu)return;menu.remove();menu=null;btn.setAttribute("aria-expanded","false");
  document.removeEventListener("pointerdown",outside,true);document.removeEventListener("keydown",esc,true);if(refocus)btn.focus()}
function outside(e){if(!menu.contains(e.target)&&!btn.contains(e.target))close(false)}
function esc(e){if(e.key==="Escape"){e.stopPropagation();close(true)}}
btn.addEventListener("click",()=>menu?close(true):open());
apply();
const add=()=>document.body.appendChild(btn);
if(document.body)add();else document.addEventListener("DOMContentLoaded",add);
})();
