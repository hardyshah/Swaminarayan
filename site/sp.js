/* Shared experience layer for the Swaminarayan site: sound (tanpura drone, temple bell), aura, reveal on scroll,
   animated mandala with orbiting words, diya sparks. Choices saved per viewer (sp-snd-drone, sp-snd-bell, sp-snd-vol). */
(function(){
"use strict";
const RM=matchMedia("(prefers-reduced-motion: reduce)");
const get=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
const put=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};

/* ---------------- sound ---------------- */
const S={drone:get("sp-snd-drone","0")==="1",bell:get("sp-snd-bell","1")==="1",vol:+get("sp-snd-vol","0.6"),ac:null,master:null,dr:null,timer:null};
function ctx(){if(!S.ac){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;S.ac=new AC();S.master=S.ac.createGain();S.master.gain.value=S.vol;
  const comp=S.ac.createDynamicsCompressor();S.master.connect(comp);comp.connect(S.ac.destination);
  // a short hall so the bell and tanpura bloom
  const len=S.ac.sampleRate*2.6,ir=S.ac.createBuffer(2,len,S.ac.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)}
  S.rev=S.ac.createConvolver();S.rev.buffer=ir;S.revG=S.ac.createGain();S.revG.gain.value=.28;S.rev.connect(S.revG);S.revG.connect(S.master);}
  if(S.ac.state==="suspended")S.ac.resume();return S.ac}
function out(node,wet){node.connect(S.master);if(wet&&S.rev){const g=S.ac.createGain();g.gain.value=wet;node.connect(g);g.connect(S.rev)}}
// one tanpura pluck: bright string through a slowly closing filter, with the buzzing jawari overtones
function pluck(f,t,amp){const a=S.ac,o1=a.createOscillator(),o2=a.createOscillator(),flt=a.createBiquadFilter(),g=a.createGain();
  o1.type="sawtooth";o2.type="sawtooth";o1.frequency.value=f;o2.frequency.value=f*1.0035;
  flt.type="lowpass";flt.Q.value=6;flt.frequency.setValueAtTime(f*14,t);flt.frequency.exponentialRampToValueAtTime(f*2.2,t+3.2);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp,t+.02);g.gain.exponentialRampToValueAtTime(amp*.35,t+1.2);g.gain.exponentialRampToValueAtTime(.0001,t+4.6);
  o1.connect(flt);o2.connect(flt);flt.connect(g);out(g,.5);o1.start(t);o2.start(t);o1.stop(t+4.8);o2.stop(t+4.8)}
const SA=130.81; // Sa = C3
function droneOn(){if(!ctx()||S.dr)return;const a=S.ac;
  // soft breath underneath
  const pad=a.createGain();pad.gain.value=0;pad.gain.linearRampToValueAtTime(.05,a.currentTime+3);
  const oscs=[SA/2,SA,SA*1.5].map((f,i)=>{const o=a.createOscillator();o.type="sine";o.frequency.value=f;const g=a.createGain();g.gain.value=[.5,.35,.18][i];o.connect(g);g.connect(pad);o.start();return o});
  out(pad,.4);
  // Pa, Sa', Sa', Sa — the classic cycle
  const seq=[SA*1.5,SA*2,SA*2,SA];let n=0;
  const step=()=>{const t=a.currentTime+.05;pluck(seq[n%4],t,n%4===3?.11:.08);n++};
  step();S.timer=setInterval(step,1150);S.dr={pad,oscs}}
function droneOff(){if(!S.dr)return;clearInterval(S.timer);const a=S.ac,{pad,oscs}=S.dr;pad.gain.cancelScheduledValues(a.currentTime);pad.gain.setValueAtTime(pad.gain.value,a.currentTime);pad.gain.linearRampToValueAtTime(0,a.currentTime+1.5);
  setTimeout(()=>oscs.forEach(o=>{try{o.stop()}catch(e){}}),1700);S.dr=null}
// temple ghanti: inharmonic partials with long decay
function bell(soft){if(!S.bell||!ctx())return;const a=S.ac,t=a.currentTime+.01,f=soft?1046.5:784,amp=soft?.05:.11;
  [[1,1],[2.01,.55],[2.76,.42],[5.4,.22],[8.93,.12]].forEach(([m,v])=>{const o=a.createOscillator(),g=a.createGain();o.type="sine";o.frequency.value=f*m;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp*v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+(soft?1.6:3.4)/Math.sqrt(m));o.connect(g);out(g,.6);o.start(t);o.stop(t+3.6)})}
window.SP_SOUND={bell,droneOn,droneOff};window.SP_LANG={set:m=>setLang(m),get:()=>L.mode};
function setDrone(on){S.drone=on;put("sp-snd-drone",on?"1":"0");on?droneOn():droneOff();paintSnd()}
// browsers need a tap before any sound: resume a saved drone on the first interaction
addEventListener("pointerdown",function first(){if(S.drone&&!S.dr)droneOn();removeEventListener("pointerdown",first,true)},true);
// a soft bell when following a link or pressing a button
document.addEventListener("click",e=>{const el=e.target.closest("a[href],button,.chip,summary");if(!el||el.closest(".sp-tm,.sp-sb"))return;bell(true)},true);

/* sound button (above the theme button) and a Sound group inside the theme menu */
const SB=document.createElement("button");SB.type="button";SB.className="sp-sb";SB.title="Sound · ધ્વનિ (tanpura)";SB.setAttribute("aria-label","Tanpura sound on or off");
SB.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h3l5 4V6L7 10H4z"/><path class="wv" d="M16 9.5a3.5 3.5 0 0 1 0 5"/><path class="wv" d="M18.6 7a7 7 0 0 1 0 10"/></svg>';
SB.addEventListener("click",()=>setDrone(!S.drone));
function paintSnd(){SB.setAttribute("aria-pressed",S.drone);const m=document.querySelector(".sp-tm .snd");if(!m)return;
  m.querySelector("[data-snd=drone]").setAttribute("aria-pressed",S.drone);m.querySelector("[data-snd=bell]").setAttribute("aria-pressed",S.bell);m.querySelector("input").value=S.vol}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===1&&n.classList.contains("sp-tm")&&!n.querySelector(".snd")){
  const g=document.createElement("div");g.className="grp";g.innerHTML=`<h3>Sound · ધ્વનિ</h3><div class="snd">
   <button type="button" data-snd="drone"><span>Tanpura drone<small>તાનપુરો · Sa Pa, soft and slow</small></span><i class="sw"></i></button>
   <button type="button" data-snd="bell"><span>Temple bell on taps<small>ઘંટડી · a light chime</small></span><i class="sw"></i></button>
   <label>Volume <input type="range" min="0" max="1" step="0.05" aria-label="Volume"></label></div>`;
  n.insertBefore(g,n.firstChild);
  g.addEventListener("click",e=>{const b=e.target.closest("[data-snd]");if(!b)return;e.stopPropagation();if(b.dataset.snd==="drone")setDrone(!S.drone);else{S.bell=!S.bell;put("sp-snd-bell",S.bell?"1":"0");paintSnd();bell()}});
  g.querySelector("input").addEventListener("input",e=>{S.vol=+e.target.value;put("sp-snd-vol",S.vol);if(S.master)S.master.gain.value=S.vol});
  paintSnd()}}}).observe(document.documentElement,{childList:true,subtree:true});


/* ---------------- language: both (default), ગુજરાતી only, English only ----------------
   Works on any page: bilingual pairs ("ગુજ · English", a Gujarati span beside its English label) show only the chosen
   side, and common labels are swapped from a small dictionary. Text that exists in one language only stays as it is. */
const GU=/[઀-૿]/,LA=/[A-Za-z]/;
const kind=t=>{const g=GU.test(t),l=LA.test(t);return g&&!l?"g":l&&!g?"l":g&&l?"m":"n"};
const DICT={"Today":"આજ","Home":"મુખ્ય પાનું","Vedic time":"વૈદિક સમય","Panchang":"પંચાંગ","Vedas":"વેદ","Kaal Patrak":"કાળ પત્રક","Vicharan":"વિચરણ","Vachanamrut":"વચનામૃત","Logbook":"નોંધપોથી","Library":"પુસ્તકાલય","Live":"જીવંત","● Live":"● જીવંત",
 "Search":"શોધો","Sources":"સંદર્ભ","Contents":"અનુક્રમ","Glossary":"શબ્દકોશ","Index":"સૂચિ","Timeline":"સમયરેખા","E-books":"ઈ-પુસ્તકો","Nondh":"નોંધ","List":"યાદી","Cloud":"શબ્દ-વાદળ","Table view":"કોષ્ટક","Clear":"સાફ કરો","Close":"બંધ","Cancel":"રદ","Delete":"કાઢી નાખો","Go":"જાઓ","Go to year":"વર્ષ પર જાઓ","Century":"સદી","Deep time":"ઊંડો સમય","Whole month":"આખો મહિનો","Whole year":"આખું વર્ષ",
 "Open this day":"આ દિવસ ખોલો","Next day ›":"આવતો દિવસ ›","‹ Previous day":"‹ ગયો દિવસ","Page ›":"પાનું ›","‹ Page":"‹ પાનું","← Back":"← પાછા","See all ›":"બધું જુઓ ›","Another one ↻":"બીજું ↻","All sections":"બધા વિભાગ","Clear highlight":"પ્રકાશ હટાવો","Show the full opening":"આખી શરૂઆત બતાવો",
 "Use my location":"મારું સ્થાન વાપરો","Back to Ahmedabad":"અમદાવાદ પાછા","▶ Play a month":"▶ એક માસ ચલાવો","Now":"હમણાં","All India":"આખું ભારત","Gujarat":"ગુજરાત","Saurashtra":"સૌરાષ્ટ્ર","Zoom here":"અહીં મોટું કરો","All days ↓":"બધા દિવસ ↓","Show all days ✕":"બધા દિવસ બતાવો ✕",
 "Save event":"પ્રસંગ સાચવો","+ Record an event":"+ પ્રસંગ નોંધો","+ Record on this day":"+ આ દિવસે નોંધો","Use theme colour":"થીમનો રંગ વાપરો","Sunday":"રવિવાર","Monday":"સોમવાર","Tuesday":"મંગળવાર","Wednesday":"બુધવાર","Thursday":"ગુરુવાર","Friday":"શુક્રવાર","Saturday":"શનિવાર",
 "Vedic vs clock time":"વૈદિક અને ઘડિયાળનો સમય","Panchang science":"પંચાંગ વિજ્ઞાન","Today in history ↓":"આજનો ઇતિહાસ ↓","Read it →":"વાંચો →","See every use →":"દરેક ઉપયોગ જુઓ →","All events →":"બધા પ્રસંગ →","compare with clock time →":"ઘડિયાળ સાથે સરખાવો →","since sunrise":"સૂર્યોદયથી","← Back to the home page":"← મુખ્ય પાને પાછા","All sources ↓":"બધા સંદર્ભ ↓","Videos this page draws on":"આ પાનાના વિડિયો","Texts":"ગ્રંથો","Texts and measured values":"ગ્રંથો અને માપેલાં મૂલ્યો","Calendar":"પંચાંગ","Day register":"નોંધપોથી",
 "Sound":"ધ્વનિ","Language":"ભાષા","Theme":"થીમ","Light":"પ્રકાશ","Dark":"અંધારું"};
const RDICT={};for(const k in DICT)RDICT[DICT[k]]=k;
const L={mode:get("sp-lang","both"),orig:new WeakMap(),hidden:new Set(),busy:false};
const SKIP="script,style,textarea,input,select,code,pre,svg,.sp-lang-keep,.brand,.jay,[contenteditable]";
function setText(n,v){if(!L.orig.has(n))L.orig.set(n,n.nodeValue);if(n.nodeValue!==v)n.nodeValue=v}
function hide(el){el.classList.add("sp-lh");L.hidden.add(el)}
function nodeKind(n){const t=(n.nodeType===3?n.nodeValue:n.textContent)||"";return t.trim()?kind(t):"n"}
function applyText(n){const o=L.orig.has(n)?L.orig.get(n):n.nodeValue;if(!o||!o.trim())return;
  if(L.mode==="both"){if(L.orig.has(n)&&n.nodeValue!==o)n.nodeValue=o;return}
  const lead=o.match(/^\s*/)[0],trail=o.match(/\s*$/)[0],core=o.trim();
  const d=L.mode==="gu"?DICT[core]:RDICT[core];if(d){const pe=n.parentElement;if(pe&&pe.tagName==="SMALL"&&pe.parentElement&&[...pe.parentElement.childNodes].some(c=>c!==pe&&(L.orig.get(c)||c.textContent||"").trim()===core)){setText(n,"");return}setText(n,lead+d+trail);return}
  // "ગુજ · English" or "English / ગુજ" inside one text node
  const parts=core.split(/\s+[·|\/]\s+/);if(parts.length>1){const ks=parts.map(kind);if(ks.includes("g")&&ks.includes("l")&&!ks.includes("m")){
    const keep=parts.filter((p,i)=>ks[i]===(L.mode==="gu"?"g":"l")||ks[i]==="n");setText(n,lead+keep.join(" · ")+trail);return}}
  if(L.orig.has(n)&&n.nodeValue!==o)n.nodeValue=o}
function applyPairs(el){// an element holding a short Gujarati label and its short English twin, side by side
  const kids=[...el.childNodes].filter(n=>!(n.nodeType===3&&!n.nodeValue.trim())&&!(n.nodeType===1&&n.matches("br,i:empty")));
  if(kids.length<2||kids.length>4)return;const ks=kids.map(nodeKind);if(!ks.includes("g")||!ks.includes("l")||ks.includes("m"))return;
  const len=k=>kids.filter((n,i)=>ks[i]===k).reduce((a,n)=>a+(n.textContent||"").trim().length,0),lg=len("g"),ll=len("l");
  if(lg>140||ll>160||ll>lg*4+24||lg>ll*4+24)return;
  const drop=L.mode==="gu"?"l":"g";kids.forEach((n,i)=>{if(ks[i]!==drop)return;if(n.nodeType===1)hide(n);else setText(n,"")})}
function applyLang(root){if(L.busy)return;L.busy=true;
  try{document.documentElement.setAttribute("data-sp-lang",L.mode);document.documentElement.lang=L.mode==="en"?"en":"gu";
    if(root===document.body){L.hidden.forEach(el=>el.classList.remove("sp-lh"));L.hidden.clear()}
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&n.parentElement.closest(SKIP)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    const texts=[];while(w.nextNode())texts.push(w.currentNode);
    // restore the original wording first, so pairs are judged on what the page wrote
    texts.forEach(n=>{if(L.orig.has(n)&&n.nodeValue!==L.orig.get(n))n.nodeValue=L.orig.get(n)});
    if(L.mode!=="both"){const els=root.querySelectorAll?[root,...root.querySelectorAll("*")]:[];els.forEach(el=>{if(el.nodeType===1&&!el.closest(SKIP))applyPairs(el)})}
    texts.forEach(n=>{if(n.nodeValue!=="")applyText(n)});
  }finally{L.busy=false}}
let LT=null,LQ=new Set();
function langObserve(){new MutationObserver(ms=>{if(L.busy||L.mode==="both")return;for(const m of ms){if(m.target.closest&&m.target.closest(".sp-tm,.sp-aura,.sp-spark,.sp-mandala"))continue;
    if(m.type==="characterData"){if(!L.orig.has(m.target))LQ.add(m.target.parentElement);else continue}else m.addedNodes.forEach(n=>{if(n.nodeType===1)LQ.add(n);else if(n.nodeType===3&&n.parentElement)LQ.add(n.parentElement)})}
  if(!LQ.size)return;clearTimeout(LT);LT=setTimeout(()=>{const q=[...LQ].filter(e=>e&&e.isConnected);LQ.clear();q.forEach(e=>applyLang(e.parentElement||e))},60)}).observe(document.body,{childList:true,subtree:true,characterData:true})}
function setLang(m){L.mode=m;put("sp-lang",m);applyLang(document.body);paintLang()}
const LB=document.createElement("button");LB.type="button";LB.className="sp-lb";LB.title="Language · ભાષા";LB.setAttribute("aria-label","Language: both, Gujarati or English");
const LABEL={both:"ગુ+En",gu:"ગુજ",en:"EN"};
LB.addEventListener("click",()=>setLang(L.mode==="both"?"gu":L.mode==="gu"?"en":"both"));
function paintLang(){LB.textContent=LABEL[L.mode];document.querySelectorAll(".sp-tm .lng [data-lng]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lng===L.mode))}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===1&&n.classList.contains("sp-tm")&&!n.querySelector(".lng")){
  const g=document.createElement("div");g.className="grp";g.innerHTML=`<h3 class="sp-lang-keep">Language · ભાષા</h3><div class="lng sp-lang-keep">
   <button type="button" data-lng="both">ગુજરાતી + English</button><button type="button" data-lng="gu">ગુજરાતી</button><button type="button" data-lng="en">English</button></div>`;
  n.insertBefore(g,n.firstChild);g.addEventListener("click",e=>{const b=e.target.closest("[data-lng]");if(!b)return;e.stopPropagation();setLang(b.dataset.lng)});paintLang()}}}).observe(document.documentElement,{childList:true,subtree:true});

/* controls CSS, injected so pages without sp.css (Kaal Patrak, Vicharan) get it too */
const CTRL_CSS=`.sp-lh{display:none!important}
.sp-tm .snd,.sp-tm .lng{display:grid;gap:6px}.sp-tm .lng{grid-template-columns:1fr 1fr 1fr;gap:4px}
.sp-tm .lng button{border:1px solid var(--sp-line,rgba(0,0,0,.14));background:none;border-radius:10px;padding:7px 4px;cursor:pointer;font:inherit;font-size:12.5px;color:inherit}
.sp-tm .lng button[aria-pressed="true"]{background:var(--sp-acc,#c2410c);border-color:var(--sp-acc,#c2410c);color:#fff}
.sp-tm .snd button{display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid transparent;background:none;border-radius:10px;padding:7px 8px;cursor:pointer;font:inherit;color:inherit;text-align:left}
.sp-tm .snd button:hover{background:rgba(127,127,127,.1)}.sp-tm .snd button small{display:block;font-size:11.5px;opacity:.7}
.sp-tm .snd .sw{flex:none;width:34px;height:20px;border-radius:999px;background:rgba(127,127,127,.35);position:relative;transition:background .25s}
.sp-tm .snd .sw::after{content:"";position:absolute;left:2px;top:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .25s}
.sp-tm .snd [aria-pressed="true"] .sw{background:var(--sp-acc,#c2410c)}.sp-tm .snd [aria-pressed="true"] .sw::after{transform:translateX(14px)}
.sp-tm .snd label{display:flex;align-items:center;gap:10px;font-size:13px;padding:2px 8px}.sp-tm .snd input[type=range]{flex:1;accent-color:var(--sp-acc,#c2410c)}
.sp-sb,.sp-lb{position:fixed;right:max(14px,env(safe-area-inset-right,0px));z-index:94;width:44px;height:44px;border-radius:50%;border:1px solid var(--sp-line,rgba(0,0,0,.14));background:var(--sp-card,#fff);color:var(--sp-ink,#222);display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 20px rgba(40,30,70,.18);font:600 12px/1 system-ui,sans-serif;padding:0}
.sp-sb{bottom:calc(max(14px,env(safe-area-inset-bottom,0px)) + 54px)}.sp-lb{bottom:calc(max(14px,env(safe-area-inset-bottom,0px)) + 108px)}
.sp-sb[aria-pressed="true"]{color:var(--sp-acc,#c2410c);border-color:var(--sp-acc,#c2410c);box-shadow:0 0 0 4px color-mix(in srgb,var(--sp-acc,#c2410c) 18%,transparent),0 6px 20px rgba(40,30,70,.18)}
.sp-sb[aria-pressed="true"] svg .wv{animation:spWave 1.6s ease-in-out infinite}@keyframes spWave{0%,100%{opacity:.35}50%{opacity:1}}
@media print{.sp-sb,.sp-lb{display:none}}`;
function ctrlCss(){if(document.getElementById("sp-ctrl-css"))return;const st=document.createElement("style");st.id="sp-ctrl-css";
  const M=window.SP_THEME_MAP||{};const v=k=>M[k]?`var(${M[k]})`:"";
  st.textContent=`:root{${M.acc?`--sp-acc:${v("acc")};`:""}${M.line?`--sp-line:${v("line")};`:""}${M.card?`--sp-card:${v("card")};`:""}${M.ink?`--sp-ink:${v("ink")};`:""}}`+CTRL_CSS;document.head.appendChild(st)}

/* ---------------- visuals ---------------- */
// a small lotus motif, tinted by the theme, for the aura texture
function motif(){const c=getComputedStyle(document.documentElement).getPropertyValue("--saffron").trim()||"#b9560c";
  const p=[0,45,90,135,180,225,270,315].map(a=>`<path d="M90 90 C80 70 82 52 90 40 C98 52 100 70 90 90Z" transform="rotate(${a} 90 90)"/>`).join("");
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><g fill="none" stroke="${c}" stroke-width="1.2">${p}<circle cx="90" cy="90" r="6"/></g></svg>`;
  document.documentElement.style.setProperty("--sp-motif",`url("data:image/svg+xml,${encodeURIComponent(svg)}")`)}
function mandala(){const ring=(n,r,len,w,cls,shape)=>{let s=`<g class="${cls}">`;for(let i=0;i<n;i++){const a=360/n*i;
      s+=shape==="dot"?`<circle cx="300" cy="${300-r}" r="${w}" transform="rotate(${a} 300 300)"/>`:
        `<path d="M300 ${300-r} C${300-w} ${300-r-len*.45} ${300-w*.6} ${300-r-len*.85} 300 ${300-r-len} C${300+w*.6} ${300-r-len*.85} ${300+w} ${300-r-len*.45} 300 ${300-r}Z" transform="rotate(${a} 300 300)"/>`}return s+"</g>"};
  return `<svg viewBox="0 0 600 600" aria-hidden="true"><defs><radialGradient id="spg"><stop offset="0" stop-color="currentColor" stop-opacity=".5"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient></defs>
   <circle cx="300" cy="300" r="290" fill="url(#spg)" opacity=".35"/>
   <g fill="none" stroke="currentColor" stroke-width="1.1">
    ${ring(48,250,36,7,"r4")}<circle cx="300" cy="300" r="250" opacity=".5"/>
    ${ring(24,190,58,16,"r1")}<circle cx="300" cy="300" r="186" opacity=".45"/>
    ${ring(16,120,66,20,"r2")}
    <g class="r3" fill="currentColor" stroke="none" opacity=".6">${ring(32,214,0,2.4,"","dot")}</g>
    ${ring(8,48,70,22,"r3")}<circle cx="300" cy="300" r="44" opacity=".6"/></g>
   <circle class="bindu" cx="300" cy="300" r="12" fill="currentColor"/></svg>`}
function addMandala(host,size,pos){if(!host||host.querySelector(".sp-mandala"))return;host.classList.add("sp-host");
  const m=document.createElement("div");m.className="sp-mandala";m.style.cssText=`width:${size}px;height:${size}px;${pos}`;m.innerHTML=mandala();host.prepend(m);return m}
function addOrbit(host,size,pos){const words=[...document.querySelectorAll(".topwords a.tw")].slice(0,12);if(!words.length||host.querySelector(".sp-orbit"))return;
  const o=document.createElement("div");o.className="sp-orbit";o.style.cssText=`width:${size}px;height:${size}px;${pos}`;const r=size/2-10;
  o.innerHTML=`<div class="ring">${words.map((a,i)=>{const t=i/words.length*Math.PI*2,x=Math.cos(t)*r,y=Math.sin(t)*r,fs=13+((12-i)/12)*7;
    return `<a href="${a.getAttribute("href")}" style="transform:translate(calc(-50% + ${x.toFixed(1)}px),calc(-50% + ${y.toFixed(1)}px));font-size:${fs.toFixed(1)}px"><span>${a.querySelector(".w").firstChild.textContent}</span></a>`}).join("")}</div>`;
  host.appendChild(o)}
function decorate(){
  const h2=document.getElementById("hero2");
  if(h2&&!h2.querySelector(".sp-mandala")){const s=Math.min(560,Math.max(380,h2.offsetWidth*.5));
    addMandala(h2,s,`right:${-s*.12}px;top:50%;margin-top:${-s/2}px;opacity:.4`);addOrbit(h2,s*.8,`right:${-s*.02}px;top:50%;margin-top:${-s*.4}px`)}
  const pan=document.querySelector(".live .pan");if(pan)addMandala(pan,320,"right:-90px;bottom:-110px;opacity:.28");
  const hd=document.querySelector(".ttl");if(hd&&hd.parentElement&&!document.querySelector(".sp-mandala"))addMandala(hd.parentElement,300,"right:-60px;top:20px;opacity:.22");
  reveal()}
let IO=null;
function reveal(){if(RM.matches||!("IntersectionObserver" in window))return;
  IO=IO||new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("sp-in");IO.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});
  document.querySelectorAll("main .block,main .card,main .dc,main .item,main .statrow>div,main .sech,main .h2,main .pages>a").forEach(el=>{
    if(el.dataset.spr)return;el.dataset.spr=1;const r=el.getBoundingClientRect();if(r.top<innerHeight*.92)return;el.classList.add("sp-rv");IO.observe(el)})}
function sparks(){if(RM.matches)return;if(!document.getElementById("hero2")&&!document.querySelector(".live"))return;
  if(document.querySelectorAll(".sp-spark").length>7||document.hidden)return;
  const s=document.createElement("i");s.className="sp-spark";const sz=3+Math.random()*5;
  s.style.cssText=`left:${Math.random()*100}vw;width:${sz}px;height:${sz}px;--dx:${(Math.random()*16-8).toFixed(1)}vw;animation-duration:${14+Math.random()*12}s`;
  document.body.appendChild(s);s.addEventListener("animationend",()=>s.remove())}
function start(){ctrlCss();document.body.appendChild(SB);document.body.appendChild(LB);paintSnd();paintLang();
  if(L.mode!=="both")applyLang(document.body);langObserve();
  if(window.SP_LITE)return; // Kaal Patrak and Vicharan keep their own look: sound, language and theme only
  const a=document.createElement("div");a.className="sp-aura";a.setAttribute("aria-hidden","true");document.body.prepend(a);
  motif();decorate();
  let t=null;new MutationObserver(ms=>{if(!ms.some(m=>!(m.target.closest&&m.target.closest('.live,.vt,.sched,.spc,.sp-mandala,.sp-orbit'))&&![...m.addedNodes].every(n=>n.classList&&n.classList.contains('sp-spark'))))return;clearTimeout(t);t=setTimeout(decorate,80)}).observe(document.body,{childList:true,subtree:true});
  setInterval(sparks,2600);addEventListener("sp-theme",()=>setTimeout(motif,30))}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
