/* Rangdock3 layer for the Swaminarayan site (2027): one frosted control dock, seeing and reading modes, text size, high contrast,
   pause motion, Hindi interface, Ctrl+K command bar, continue-where-you-left-off, read aloud, one icon set, labels for screen readers,
   and calm micro-interactions. Loaded by vachanamrut-concordance/theme.js (full pages) or site/sp.js (SP_LITE pages); styles in rd3.css.
   Choices are saved per viewer in localStorage: rd-size, rd-contrast, rd-read, rd-motion, rd-ui, rd-recent, rd-rate. */
(function(){
"use strict";
if(window.SPRD3)return;
const R=document.documentElement,FULL=R.classList.contains("rd-full");
const ME=(document.currentScript&&document.currentScript.src)||"";
const BASE=ME?new URL("./",ME).href:"";              // …/site/
const SITE=ME?new URL("../",ME).href:"/";            // site root
const get=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
const put=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};
const MAP=window.SP_THEME_MAP||{bg:"--paper",card:"--surface",ink:"--ink",muted:"--ink-2",line:"--line",acc:"--saffron",accS:"--saffron-soft",acc2:"--peacock",acc2S:"--peacock-soft",c1:"--sunk",warn:"--saffron-strong"};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const RM=matchMedia("(prefers-reduced-motion: reduce)"),HCQ=matchMedia("(prefers-contrast: more)"),DARKQ=matchMedia("(prefers-color-scheme: dark)");
let dock=null;
const motionOK=()=>!RM.matches&&S.motion!=="paused";

/* ---------------- one icon set (24px grid, 1.8 stroke, round caps) ---------------- */
const I={
 search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
 listen:'<path d="M3 13.5v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="13" width="4.5" height="7" rx="2"/><rect x="16.5" y="13" width="4.5" height="7" rx="2"/>',
 lang:'<path d="M4 5h9M8.5 3v2M6 5c.6 3.6 3 6.4 6 8"/><path d="M11 5c-.8 4-3.6 7.2-7 9"/><path d="m13 21 4-10 4 10M14.4 17.5h5.2"/>',
 sound:'<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z"/><path class="wv" d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/><path class="wv" d="M18.2 7a7 7 0 0 1 0 10"/>',
 display:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/>',
 play:'<path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.4-7.2a.8.8 0 0 0 0-1.4L8.2 4.1A.8.8 0 0 0 7 4.8z"/>',
 pause:'<rect x="6" y="4.5" width="4" height="15" rx="1.2"/><rect x="14" y="4.5" width="4" height="15" rx="1.2"/>',
 stop:'<rect x="5.5" y="5.5" width="13" height="13" rx="2.5"/>',
 close:'<path d="M6 6l12 12M18 6 6 18"/>',
 left:'<path d="m14.5 6-6 6 6 6"/>',right:'<path d="m9.5 6 6 6-6 6"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>',down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
 back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',fwd:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
 refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
 download:'<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',print:'<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/>',
 book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>',
 comment:'<path d="M5 18.5V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 2.5z"/>',
 page:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
 scroll:'<path d="M7 4h11a2 2 0 0 1 2 2v1h-4"/><path d="M16 7v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10"/><path d="M7 4a2 2 0 0 0-2 2v11M9 9h4M9 13h4"/>',
 music:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
 word:'<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
 calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 heading:'<path d="M6 4v16M18 4v16M6 12h12"/>',
 contrast:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
 sepia:'<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z"/><path d="M9 9h6M9 13h6"/>',
 diya:'<path d="M12 3c2 2.2 2.6 4 2.6 5.2a2.6 2.6 0 0 1-5.2 0C9.4 7 10 5.2 12 3z"/><path d="M3.5 13.5h17c-.8 3.6-4.2 6-8.5 6s-7.7-2.4-8.5-6z"/>',
 motion:'<path d="M4 12c2.5-5 5.5-5 8 0s5.5 5 8 0"/>',
 history:'<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 4v4.5H8M12 7.5V12l3 2"/>',
 globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5S9.6 6.1 12 3.5z"/>',
 graph:'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="10" cy="18" r="2.5"/><path d="M8.3 7 15.6 7.6M7 8.3l2.2 7.3M16.4 10 11.8 16"/>',
 planet:'<circle cx="12" cy="12" r="5.5"/><path d="M4.3 15.8c-1.6 1.8-2 3.2-1.3 3.9 1.4 1.4 6.8-1.2 11.9-6.3s7.7-10.5 6.3-11.9c-.7-.7-2.1-.3-3.9 1.3"/>',
 heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
 check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 more:'<circle cx="5.5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18.5" cy="12" r="1.3" fill="currentColor"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 text:'<path d="M3 19 8 6l5 13M4.8 14.5h6.4"/><path d="M14.5 19l3.2-8.5L21 19M15.6 16.3h4.3"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 help:'<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
 flask:'<path d="M9.5 3.5h5M10.5 3.5v5.2L5 18.5A1.6 1.6 0 0 0 6.4 21h11.2a1.6 1.6 0 0 0 1.4-2.5l-5.5-9.8V3.5"/><path d="M7.5 15h9"/>'
};
const svg=(n,cls)=>`<svg class="rd-i${cls?" "+cls:""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${I[n]||""}</svg>`;

/* ---------------- interface words in English, Gujarati and Hindi ---------------- */
const W={
 search:["Search","શોધો","खोजें"],listen:["Listen","સાંભળો","सुनें"],lang:["Language","ભાષા","भाषा"],sound:["Sound","ધ્વનિ","ध्वनि"],display:["Display","દેખાવ","प्रदर्शन"],
 cmdPh:["Search Vachanamrut, kirtans, words, pages or a date…","વચનામૃત, કીર્તન, શબ્દ, પાનું કે તારીખ શોધો…","वचनामृत, कीर्तन, शब्द, पृष्ठ या तिथि खोजें…"],
 recent:["Continue","ફરી ચાલુ કરો","जारी रखें"],pages:["Pages","પાનાં","पृष्ठ"],vach:["Vachanamrut","વચનામૃત","वचनामृत"],kirtan:["Kirtans","કીર્તનો","कीर्तन"],
 words:["Words in the Vachanamrut","વચનામૃતના શબ્દો","वचनामृत के शब्द"],books:["Books","પુસ્તકો","पुस्तकें"],date:["Date","તારીખ","तिथि"],onPage:["On this page","આ પાને","इस पृष्ठ पर"],
 actions:["Settings","સેટિંગ","सेटिंग"],none:["Nothing found. Try a Vachanamrut like “GP 12”, a kirtan, or a date like 28 Nov 1800.","કંઈ મળ્યું નહીં. “ગ.પ્ર. ૧૨”, કોઈ કીર્તન કે તારીખ લખી જુઓ.","कुछ नहीं मिला। “GP 12”, कोई कीर्तन या तिथि लिखकर देखें।"],
 keys:["↑ ↓ move · Enter open · Esc close","↑ ↓ ખસો · Enter ખોલો · Esc બંધ","↑ ↓ चलें · Enter खोलें · Esc बंद"],
 cont:["Continue where you left off","જ્યાંથી છોડ્યું ત્યાંથી ચાલુ કરો","जहाँ छोड़ा था वहीं से जारी रखें"],
 seeing:["Seeing and reading","જોવું અને વાંચવું","देखना और पढ़ना"],size:["Text size","અક્ષરનું કદ","अक्षर का आकार"],contrast:["High contrast","ઘાટો કોન્ટ્રાસ્ટ","उच्च कंट्रास्ट"],
 contrastS:["Stronger text and borders for low vision","ઓછી દૃષ્ટિ માટે ઘાટા અક્ષર","कम दृष्टि के लिए गहरे अक्षर"],
 read:["Reading mode","વાંચન","पठन"],normal:["Normal","સામાન્ય","सामान्य"],sepia:["Sepia","સેપિયા","सेपिया"],darshan:["Darshan","દર્શન","दर्शन"],
 motion:["Pause motion","ગતિ રોકો","गति रोकें"],motionS:["Stops animation and the 3D lotus","એનિમેશન અને ૩D કમળ બંધ","एनिमेशन और 3D कमल बंद"],
 hindi:["Hindi interface","હિન્દી ઇન્ટરફેસ","हिन्दी इंटरफ़ेस"],hindiS:["Menus and buttons in हिन्दी","મેનુ અને બટન હિન્દીમાં","मेनू और बटन हिन्दी में"],
 sayTitle:["Read aloud","મોટેથી વાંચો","ज़ोर से पढ़ें"],sayNoGu:["This device has no Gujarati voice, so Gujarati passages are skipped. Android and ChromeOS include one.","આ ઉપકરણમાં ગુજરાતી અવાજ નથી, તેથી ગુજરાતી ભાગ છોડાય છે.","इस डिवाइस में गुजराती आवाज़ नहीं है, इसलिए गुजराती अंश छोड़े जाते हैं।"],
 sayNone:["Nothing to read on this page.","આ પાને વાંચવા જેવું કંઈ નથી.","इस पृष्ठ पर पढ़ने को कुछ नहीं।"],sayNo:["Read aloud is not supported in this browser.","આ બ્રાઉઝરમાં મોટેથી વાંચન નથી.","इस ब्राउज़र में ज़ोर से पढ़ना उपलब्ध नहीं।"],
 noMedia:["No murti photo or video on this page, so darshan mode only dims the page.","આ પાને મૂર્તિનો ફોટો કે વિડિયો નથી.","इस पृष्ठ पर मूर्ति की फ़ोटो या वीडियो नहीं है।"],
 openTheme:["Colours and themes","રંગ અને થીમ","रंग और थीम"],sources:["Sources","સંદર્ભ","स्रोत"],ago:["ago","પહેલાં","पहले"],read2:["read","વાંચ્યું","पढ़ा"]
};
const HI_NAV={"Today":"आज","Home":"मुख्य पृष्ठ","Vedic time":"वैदिक समय","Panchang":"पंचांग","Solar system":"सौरमंडल","Vedas":"वेद","Kaal Patrak":"काल पत्रक","Vicharan":"विचरण","Murti 3D":"मूर्ति 3D",
 "Shangaar":"श्रृंगार","Vachanamrut":"वचनामृत","Logbook":"लॉगबुक","Library":"पुस्तकालय","Live":"लाइव दर्शन","Index":"सूची","Contents":"अनुक्रम","Glossary":"शब्दकोश","Sources":"स्रोत","Nondh":"नोंध",
 "E-books":"ई-पुस्तकें","Timeline":"समयरेखा","Concordance":"शब्दानुक्रमणिका","Search":"खोजें","Contribute":"योगदान","Sign in":"प्रवेश"};
const langMode=()=>R.getAttribute("data-sp-lang")||get("sp-lang","both");
function t(k){const w=W[k];if(!w)return k;if(S.ui==="hi")return w[2];const m=langMode();return m==="gu"?w[1]:m==="en"?w[0]:`${w[0]} · ${w[1]}`}
function t1(k){const w=W[k];if(!w)return k;return S.ui==="hi"?w[2]:langMode()==="gu"?w[1]:w[0]}

/* ---------------- state ---------------- */
const S={size:+get("rd-size","1")||1,contrast:get("rd-contrast","auto"),read:get("rd-read","normal"),motion:get("rd-motion","auto"),ui:get("rd-ui","")};
if(!["auto","more","off"].includes(S.contrast))S.contrast="auto";if(!["normal","sepia","darshan"].includes(S.read))S.read="normal";

/* mode colours, written against this page's own variable names (MAP) so they win over any palette */
const MODES={
 hcL:{bg:"#FFFFFF",card:"#FFFFFF",ink:"#000000",muted:"#1F1F1F",line:"#000000",acc:"#9A3412",accS:"#FFE6D5",acc2:"#1E1B8F",acc2S:"#E6E6FF",c1:"#FFFFFF",c2:"#FFFFFF",c3:"#FFFFFF",c4:"#FFFFFF",warn:"#6B1F0A",warnS:"#FFE6D5"},
 hcD:{bg:"#000000",card:"#0A0A0A",ink:"#FFFFFF",muted:"#EDEDED",line:"#FFFFFF",acc:"#FFB070",accS:"#3A2210",acc2:"#C9CEFF",acc2S:"#1C1D40",c1:"#000000",c2:"#000000",c3:"#000000",c4:"#000000",warn:"#FFD2A8",warnS:"#3A2210"},
 seL:{bg:"#F3EAD7",card:"#FAF4E6",ink:"#3A2E1F",muted:"#6B5A44",line:"#E0D2B4",acc:"#9C3D0C",accS:"#F3DEC6",acc2:"#5A3F8C",acc2S:"#EAE2F0",c1:"#F1E4CC",c2:"#EFE6D6",c3:"#F6EBCB",c4:"#E9E3D5",warn:"#6E2A10",warnS:"#F3DEC6"},
 seD:{bg:"#1E1912",card:"#27211A",ink:"#E9DCC3",muted:"#BCA98A",line:"#3D3326",acc:"#F0A060",accS:"#3A2716",acc2:"#C8B5F0",acc2S:"#2C2638",c1:"#2A231A",c2:"#28221B",c3:"#2E2717",c4:"#25211C",warn:"#F5C79A",warnS:"#3A2716"},
 da:{bg:"#060403",card:"#0E0A07",ink:"#EADFCF",muted:"#ADA088",line:"#2A2019",acc:"#F5A04A",accS:"#2E1D0E",acc2:"#C9B8F5",acc2S:"#1F1A2C",c1:"#120C08",c2:"#110C09",c3:"#15100A",c4:"#100D0B",warn:"#F7C48C",warnS:"#2E1D0E"}
};
function modeCss(){
  const decl=o=>Object.entries(o).filter(([k])=>MAP[k]).map(([k,v])=>`${MAP[k]}:${v}!important`).join(";");
  const extra=o=>FULL?`;--ink-3:color-mix(in srgb,${o.muted} 78%,${o.bg})!important;--sunk:color-mix(in srgb,${o.line} 45%,${o.bg})!important`:"";
  const H='html:root';
  return `${H}[data-rd-hc="1"][data-rd-dark="0"]{${decl(MODES.hcL)}${extra(MODES.hcL)};--rd-maroon:#000}`+
   `${H}[data-rd-hc="1"][data-rd-dark="1"]{${decl(MODES.hcD)}${extra(MODES.hcD)};--rd-maroon:#fff}`+
   `${H}[data-rd-read="sepia"][data-rd-dark="0"]:not([data-rd-hc="1"]){${decl(MODES.seL)}${extra(MODES.seL)};color-scheme:light}`+
   `${H}[data-rd-read="sepia"][data-rd-dark="1"]:not([data-rd-hc="1"]){${decl(MODES.seD)}${extra(MODES.seD)};color-scheme:dark}`+
   `${H}[data-rd-read="darshan"]:not([data-rd-hc="1"]){${decl(MODES.da)}${extra(MODES.da)};color-scheme:dark}`+
   /* point the Rangdock3 roles at this page's variables */
   `:root{${["bg","card","ink","muted","line","acc","acc2"].filter(k=>MAP[k]).map(k=>`--rd-${k}:var(${MAP[k]})`).join(";")}${MAP.warn?`;--rd-maroon:var(${MAP.warn})`:""}}`}
const st=document.createElement("style");st.id="rd3-modes";st.textContent=modeCss();document.head.appendChild(st);

function bgDark(){// read the palette's background (before any mode override) to know which face of a mode to use
  const prev=R.getAttribute("data-rd-hc"),pr=R.getAttribute("data-rd-read");R.removeAttribute("data-rd-hc");R.removeAttribute("data-rd-read");
  const c=getComputedStyle(R).getPropertyValue(MAP.bg||"--paper").trim()||getComputedStyle(document.body||R).backgroundColor;
  if(prev!=null)R.setAttribute("data-rd-hc",prev);if(pr!=null)R.setAttribute("data-rd-read",pr);
  const m=c.match(/^#([0-9a-f]{6})/i);let r,g,b;
  if(m){const n=parseInt(m[1],16);r=n>>16&255;g=n>>8&255;b=n&255}else{const p=c.match(/[\d.]+/g);if(!p)return DARKQ.matches;[r,g,b]=p.map(Number)}
  return r*.299+g*.587+b*.114<128}
function apply(){
  R.setAttribute("data-rd-dark",bgDark()?"1":"0");
  const hc=S.contrast==="more"||(S.contrast==="auto"&&HCQ.matches);
  hc?R.setAttribute("data-rd-hc","1"):R.removeAttribute("data-rd-hc");
  S.read==="normal"?R.removeAttribute("data-rd-read"):R.setAttribute("data-rd-read",S.read);
  R.style.setProperty("--rd-scale",String(S.size));
  S.motion==="paused"?R.setAttribute("data-rd-motion","paused"):R.removeAttribute("data-rd-motion");
  S.ui==="hi"?R.setAttribute("data-rd-ui","hi"):R.removeAttribute("data-rd-ui");
  if(S.read==="darshan"){const m=document.querySelector("main");const has=m&&m.querySelector("img,video,iframe,canvas,picture");has?R.removeAttribute("data-rd-nomedia"):R.setAttribute("data-rd-nomedia","")}
  paintPanel();paintDock();
}
apply();
addEventListener("sp-theme",()=>setTimeout(apply,0));
[HCQ,DARKQ].forEach(q=>q.addEventListener&&q.addEventListener("change",apply));

/* ---------------- helpers ---------------- */
function toast(msg,ms){const el=document.createElement("div");el.className="rd-toast";el.setAttribute("role","status");el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),ms||4200)}
const clickHidden=sel=>{const b=document.querySelector(sel);if(b){b.click();return true}return false};
function setSpLang(target){// sp.js owns the language; its button cycles both → gu → en
  for(let i=0;i<3&&langMode()!==target;i++)if(!clickHidden(".sp-lb"))break}

/* ---------------- motion ---------------- */
function setMotion(paused){S.motion=paused?"paused":"auto";put("rd-motion",paused?"paused":null);
  try{window.SPMotion&&window.SPMotion.set(!paused)}catch(e){}if(!window.SPMotion)put("sp-motion",paused?"off":"on");
  apply()}

/* ---------------- Hindi interface (menus, buttons and page navigation) ---------------- */
const hiOrig=new WeakMap();
function applyHindi(){
  document.querySelectorAll(".top a,.top button,nav a,.sp-collab-fab,[class*='collab'] button").forEach(el=>{
    const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){
      if(S.ui==="hi"){const o=hiOrig.has(n)?hiOrig.get(n):n.nodeValue,k=o.trim();if(HI_NAV[k]){hiOrig.set(n,o);n.nodeValue=o.replace(k,HI_NAV[k])}}
      else if(hiOrig.has(n)){n.nodeValue=hiOrig.get(n);hiOrig.delete(n)}}});
}
function setUi(v){S.ui=v;put("rd-ui",v||null);if(v==="hi")setSpLang("en");apply();applyHindi();relabel()}

/* ---------------- the dock ---------------- */
const ACTS=[["search","search"],["listen","listen"],["lang","lang"],["sound","sound"],["display","display"]];
function buildDock(){
  dock=document.createElement("div");dock.className="rd-dock rd-glass";dock.setAttribute("role","toolbar");dock.setAttribute("aria-label","Site controls");
  dock.innerHTML=ACTS.map(([a,ic],i)=>`${i===2?'<span class="rd-sep" aria-hidden="true"></span>':""}<button type="button" data-act="${a}">${svg(ic)}${a==="lang"?'<span class="rd-badge" aria-hidden="true"></span>':""}</button>`).join("");
  document.body.appendChild(dock);
  if(!document.querySelector(".sp-sb"))dock.querySelector('[data-act="sound"]').hidden=true;
  let wasOpen=false;
  addEventListener("pointerdown",e=>{if(e.target.closest&&e.target.closest('.rd-dock [data-act="display"]'))wasOpen=!!document.querySelector(".sp-tm")},true);
  dock.addEventListener("click",e=>{const b=e.target.closest("button[data-act]");if(!b)return;const a=b.dataset.act;
    if(a==="search")openCmd();
    else if(a==="listen")toggleSay();
    else if(a==="lang"){const order=["both","gu","en","hi"];const cur=S.ui==="hi"?"hi":langMode();const nx=order[(order.indexOf(cur)+1)%4];
      if(nx==="hi")setUi("hi");else{if(S.ui==="hi")setUi("");setSpLang(nx)}paintDock();relabel()}
    else if(a==="sound"){clickHidden(".sp-sb");setTimeout(paintDock,30)}
    else if(a==="display"){if(wasOpen&&!document.querySelector(".sp-tm")){wasOpen=false;paintDock();return}
      if(document.querySelector(".sp-tm")){document.querySelector(".sp-tm").remove()}else clickHidden(".sp-tb");setTimeout(paintDock,30)}});
  relabel();paintDock();
  // keep the dock in step with the menu (opened, closed with Esc) and give focus back to it
  new MutationObserver(ms=>{let gone=false;for(const m of ms){m.removedNodes.forEach(n=>{if(n.nodeType===1&&n.classList.contains("sp-tm"))gone=true})}
    if(gone){paintDock();if(document.activeElement===document.body||!document.activeElement)dock.querySelector('[data-act="display"]').focus()}}).observe(document.body,{childList:true});
  const sb=document.querySelector(".sp-sb");if(sb)new MutationObserver(paintDock).observe(sb,{attributes:true,attributeFilter:["aria-pressed"]});
  new MutationObserver(()=>{paintDock();relabel()}).observe(R,{attributes:true,attributeFilter:["data-sp-lang"]});
}
function relabel(){if(!dock)return;dock.querySelectorAll("button[data-act]").forEach(b=>{const k=b.dataset.act;const lbl=t1(k)+(k==="search"?" (Ctrl+K)":"");b.setAttribute("aria-label",lbl);b.dataset.tip=lbl})}
function paintDock(){if(!dock)return;
  const sb=document.querySelector(".sp-sb");const snd=dock.querySelector('[data-act="sound"]');if(sb)snd.setAttribute("aria-pressed",sb.getAttribute("aria-pressed")==="true");
  dock.querySelector('[data-act="display"]').setAttribute("aria-expanded",!!document.querySelector(".sp-tm"));
  dock.querySelector('[data-act="listen"]').setAttribute("aria-pressed",!!(SAY.on));
  const badge=dock.querySelector(".rd-badge");badge.textContent=S.ui==="hi"?"हि":{both:"ગુ+En",gu:"ગુ",en:"EN"}[langMode()]||"ગુ+En"}

/* ---------------- Seeing and reading group inside the theme menu ---------------- */
function panelHtml(){
  return `<h3>${esc(t("seeing"))}</h3><div class="rd-set">
   <div><div class="rd-row" style="margin-bottom:6px"><span><b>${esc(t1("size"))}</b></span></div>
     <div class="rd-size"><button type="button" data-rd="size-" aria-label="Smaller text">A−</button><output aria-live="polite"></output><button type="button" data-rd="size+" aria-label="Larger text">A+</button>
     <input type="range" min="0.9" max="1.6" step="0.05" aria-label="${esc(t1("size"))}"></div></div>
   <div><div style="margin-bottom:6px"><b>${esc(t1("read"))}</b></div><div class="rd-seg" role="radiogroup" aria-label="${esc(t1("read"))}">
     ${[["normal","sun"],["sepia","sepia"],["darshan","diya"]].map(([k,ic])=>`<button type="button" role="radio" data-read="${k}">${svg(ic)}<span>${esc(t1(k))}</span></button>`).join("")}</div></div>
   <div class="rd-row"><span><b>${esc(t1("contrast"))}</b><small>${esc(t1("contrastS"))}</small></span><button type="button" role="switch" class="rd-sw" data-rd="hc" aria-label="${esc(t1("contrast"))}"></button></div>
   <div class="rd-row"><span><b>${esc(t1("motion"))}</b><small>${esc(t1("motionS"))}</small></span><button type="button" role="switch" class="rd-sw" data-rd="motion" aria-label="${esc(t1("motion"))}"></button></div>
   <div class="rd-row"><span><b>${esc(W.hindi[0])} · हिन्दी</b><small>${esc(t1("hindiS"))}</small></span><button type="button" role="switch" class="rd-sw" data-rd="hi" aria-label="Hindi interface"></button></div>
  </div>`}
function paintPanel(){const g=document.querySelector(".sp-tm .rd-grp");if(!g)return;
  g.querySelector("output").textContent=Math.round(S.size*100)+"%";g.querySelector('input[type=range]').value=S.size;
  g.querySelectorAll("[data-read]").forEach(b=>b.setAttribute("aria-checked",b.dataset.read===S.read));
  g.querySelector('[data-rd="hc"]').setAttribute("aria-checked",R.getAttribute("data-rd-hc")==="1");
  g.querySelector('[data-rd="motion"]').setAttribute("aria-checked",S.motion==="paused");
  g.querySelector('[data-rd="hi"]').setAttribute("aria-checked",S.ui==="hi")}
function setSize(v){S.size=Math.min(1.6,Math.max(.9,Math.round(v*20)/20));put("rd-size",S.size===1?null:String(S.size));apply()}
function setRead(v){S.read=v;put("rd-read",v==="normal"?null:v);apply();
  if(v==="darshan"&&R.hasAttribute("data-rd-nomedia"))toast(t1("noMedia"))}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1||!n.classList.contains("sp-tm")||n.querySelector(".rd-grp"))continue;
  const g=document.createElement("div");g.className="grp rd-grp sp-lang-keep";g.innerHTML=panelHtml();n.insertBefore(g,n.firstChild);
  // order: Rangdock3 themes, light or dark, seeing and reading, then language, sound and the other theme groups
  const grps=[...n.children].filter(x=>x.classList.contains("grp"));const rdT=grps.find(x=>x.querySelector('[data-p="rangdock3"]'));const md=grps.find(x=>x.querySelector(".md"));
  [md,rdT].forEach(x=>{if(x)n.insertBefore(x,n.firstChild)});if(md&&g)n.insertBefore(g,md.nextSibling);
  g.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;e.stopPropagation();
    const k=b.dataset.rd;if(k==="size-")setSize(S.size-.1);else if(k==="size+")setSize(S.size+.1);
    else if(k==="hc"){const on=R.getAttribute("data-rd-hc")==="1";S.contrast=on?(HCQ.matches?"off":"auto"):"more";put("rd-contrast",S.contrast==="auto"?null:S.contrast);apply()}
    else if(k==="motion")setMotion(S.motion!=="paused");
    else if(k==="hi")setUi(S.ui==="hi"?"":"hi");
    else if(b.dataset.read)setRead(b.dataset.read)});
  g.querySelector("input[type=range]").addEventListener("input",e=>setSize(+e.target.value));
  paintPanel();paintDock()}}).observe(document.documentElement,{childList:true,subtree:true});

/* ---------------- recent pages: continue where you left off ---------------- */
const REC_KEY="rd-recent";
function recent(){try{return JSON.parse(get(REC_KEY,"[]"))||[]}catch(e){return []}}
function here(){const p=location.pathname.replace(/index\.html$/,"");const h=/^#(v-|w-|n-|appx-|d\d)/.test(location.hash)?location.hash:"";return p+h}
function pageTitle(){const h=document.querySelector("main h1");const ht=h&&h.textContent.trim().replace(/\s+/g," ");
  const dt=document.title.replace(/\s*[·|–-]\s*Shri Swaminarayan.*$/,"").trim();return (location.hash&&ht?ht:dt||ht||location.pathname).slice(0,90)}
function remember(){if(/login|admin/.test(location.pathname))return;
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),f=Math.min(1,scrollY/max);
  const L=recent().filter(r=>r.u!==here());L.unshift({u:here(),t:pageTitle(),f:Math.round(f*100)/100,at:Date.now(),y:Math.round(scrollY)});put(REC_KEY,JSON.stringify(L.slice(0,12)))}
let remT=null;addEventListener("scroll",()=>{clearTimeout(remT);remT=setTimeout(remember,900)},{passive:true});
addEventListener("pagehide",remember);addEventListener("hashchange",()=>setTimeout(remember,600));
setTimeout(remember,2500);
function ago(ms){const m=Math.round(ms/60000);if(m<60)return m+" min";const h=Math.round(m/60);if(h<48)return h+" h";return Math.round(h/24)+" d"}
function iconFor(u){return /#v-/.test(u)?"scroll":/kaal-patrak|#d\d/.test(u)?"calendar":/panchang|vedic-time/.test(u)?"clock":/live/.test(u)?"diya":/library|ebooks/.test(u)?"book":/#w-/.test(u)?"word":"page"}
function abs(u){return u.startsWith("/")?new URL(u,location.origin).href:new URL(u,SITE).href}
function contStrip(){
  const isHome=FULL&&(/\/(index\.html)?$/.test(location.pathname))&&(!location.hash||location.hash==="#home");if(!isHome)return;
  const main=document.querySelector("main");if(!main)return;
  const L=recent().filter(r=>r.u!==here()).slice(0,6);if(!L.length){const old=main.querySelector(".rd-cont");old&&old.remove();return}
  if(main.querySelector(".rd-cont"))return;
  const sec=document.createElement("section");sec.className="rd-cont";sec.setAttribute("aria-label",t1("cont"));
  sec.innerHTML=`<h2>${svg("history")}${esc(t("cont"))}</h2><div class="rail">${L.map(r=>`<a href="${esc(abs(r.u))}" data-y="${r.y||0}"><span class="ico">${svg(iconFor(r.u))}</span><span class="tx"><b>${esc(r.t)}</b><small>${ago(Date.now()-r.at)} ${esc(t1("ago"))} · ${Math.round((r.f||0)*100)}% ${esc(t1("read2"))}</small><span class="bar"><i style="width:${Math.max(4,Math.round((r.f||0)*100))}%"></i></span></span></a>`).join("")}</div>`;
  const first=main.querySelector(".loading")?null:main.firstElementChild;main.insertBefore(sec,first&&first.matches("h1,header,.hero")?first.nextSibling:first);
  sec.addEventListener("click",e=>{const a=e.target.closest("a[data-y]");if(a)try{sessionStorage.setItem("rd-jump",JSON.stringify({u:a.href,y:+a.dataset.y}))}catch(x){}});
}
function restoreJump(){try{const j=JSON.parse(sessionStorage.getItem("rd-jump")||"null");if(!j)return;sessionStorage.removeItem("rd-jump");
  if(j.u.split("#")[0]===location.href.split("#")[0]&&j.y>200)setTimeout(()=>scrollTo({top:j.y,behavior:motionOK()?"smooth":"auto"}),700)}catch(e){}}

/* ---------------- command bar ---------------- */
let CMD=null,DATA=null,cmdEl=null,sel=0,items=[];
const norm=s=>String(s||"").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[૦-૯]/g,d=>"0123456789"["૦૧૨૩૪૫૬૭૮૯".indexOf(d)]);
const SEC_ALIAS={gp:"GP",gm:"GM",ga:"GA",gpr:"GP",s:"S",sar:"S",k:"K",kar:"K",l:"L",lo:"L",loya:"L",p:"P",pan:"P",v:"V",vad:"V",vadtal:"V",am:"A",ahm:"A",j:"J",jet:"J",
  "ગ.પ્ર":"GP","ગપ્ર":"GP","ગ.મ":"GM","ગમ":"GM","ગ.અં":"GA","ગઅં":"GA","સા":"S","કા":"K","લો":"L","પં":"P","વ":"V","અ":"A","જે":"J","pratham":"GP","madhya":"GM","antya":"GA","sarangpur":"S","kariyani":"K","panchala":"P","ahmedabad":"A","amdavad":"A","vartal":"V","ashlali":"AS",as:"AS","jetalpur":"J","gadhada":"GP","loya":"L"};
const MON={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
function loadData(){if(DATA)return Promise.resolve(DATA);if(!BASE)return Promise.resolve(DATA={pages:[],v:[],w:[],k:[],b:[]});
  return fetch(BASE+"rd3/cmd.json").then(r=>r.json()).then(d=>{d.v.forEach(x=>x.n=norm(x[0]+" "+x[1]+" "+x[2]));d.k.forEach(x=>x.n=norm(x[0]+" "+x[1]+" "+x[2]));
    d.w.forEach(x=>x.n=norm(x[1]+" "+x[2]));d.b.forEach(x=>x.n=norm(x[0]+" "+x[1]+" "+x[2]));d.pages.forEach(x=>x.n=norm(x.join(" ")));return DATA=d}).catch(()=>DATA={pages:[],v:[],w:[],k:[],b:[]})}
function parseDate(q){const s=norm(q).trim();let m;
  if((m=s.match(/^(\d{3,4})-(\d{1,2})-(\d{1,2})$/)))return[+m[1],+m[2],+m[3]];
  if((m=s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{3,4})$/)))return[+m[3],+m[2],+m[1]];
  if((m=s.match(/^(\d{1,2})\s+([a-z]{3})[a-z]*\.?\s+(\d{3,4})$/))&&MON[m[2]])return[+m[3],MON[m[2]],+m[1]];
  if((m=s.match(/^([a-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{3,4})$/))&&MON[m[1]])return[+m[3],MON[m[1]],+m[2]];
  if(s==="today"||s==="aaj"||q.trim()==="આજ"){const d=new Date();return[d.getFullYear(),d.getMonth()+1,d.getDate()]}
  return null}
function vachId(q){const s=norm(q).replace(/[^a-z0-9઀-૿.\s-]/g," ").trim();const m=s.match(/^([a-z઀-૿.]+)[\s.-]*(\d{1,3})$/);if(!m)return null;
  const sec=SEC_ALIAS[m[1].replace(/\.$/,"")]||SEC_ALIAS[m[1]]||m[1].toUpperCase();return sec+"-"+(+m[2])}
function hl(text,q){if(!q)return esc(text);const i=norm(text).indexOf(q);if(i<0||norm(text).length!==text.length)return esc(text);return esc(text.slice(0,i))+"<mark>"+esc(text.slice(i,i+q.length))+"</mark>"+esc(text.slice(i+q.length))}
function search(q){
  const out=[],nq=norm(q).trim(),words=nq.split(/\s+/).filter(Boolean),D=DATA||{pages:[],v:[],w:[],k:[],b:[]};
  const hit=n=>words.every(w=>n.includes(w));const score=(n,raw)=>(n.startsWith(nq)?0:1)+(raw&&norm(raw).startsWith(nq)?-0.5:0);
  const C="vachanamrut-concordance/";
  if(!nq){
    const L=recent().filter(r=>r.u!==here()).slice(0,5);if(L.length)out.push({g:t("recent"),list:L.map(r=>({ic:iconFor(r.u),b:r.t,s:ago(Date.now()-r.at)+" "+t1("ago"),href:abs(r.u)}))});
    out.push({g:t("pages"),list:D.pages.slice(0,8).map(p=>({ic:"page",b:p[1],s:p[2],href:SITE+p[0]}))});
    out.push({g:t("actions"),list:actions()});return out}
  const dt=parseDate(q);if(dt)out.push({g:t("date"),list:[{ic:"calendar",b:new Date(Date.UTC(dt[0],dt[1]-1,dt[2])).toUTCString().slice(0,16),s:"Kaal Patrak · કાળ પત્રક",href:SITE+`kaal-patrak/#d${dt[0]}-${dt[1]}-${dt[2]}`}]});
  const id=vachId(q);const exact=id&&D.v.find(v=>v[0]===id);
  const V=D.v.filter(v=>v!==exact&&hit(v.n)).sort((a,b)=>score(a.n,a[0])-score(b.n,b[0])).slice(0,6);if(exact)V.unshift(exact);
  if(V.length)out.push({g:t("vach"),list:V.map(v=>({ic:"scroll",b:`${v[0]} · ${v[1]}`,s:v[2],href:SITE+C+"#v-"+v[0],q:nq}))});
  const K=D.k.filter(k=>hit(k.n)).sort((a,b)=>score(a.n,a[0])-score(b.n,b[0])).slice(0,7);
  if(K.length)out.push({g:t("kirtan"),list:K.map(k=>({ic:"music",b:k[0],s:[k[1],k[2]].filter(Boolean).join(" · "),href:/^https?:/.test(k[3])?k[3]:SITE+k[3],ext:true,q:nq}))});
  const P=D.pages.filter(p=>hit(p.n)).slice(0,5);if(P.length)out.push({g:t("pages"),list:P.map(p=>({ic:"page",b:p[1],s:p[2],href:SITE+p[0],q:nq}))});
  const H=[...document.querySelectorAll("main h2,main h3")].filter(h=>h.offsetParent&&hit(norm(h.textContent))).slice(0,5);
  if(H.length)out.push({g:t("onPage"),list:H.map(h=>({ic:"heading",b:h.textContent.trim().replace(/\s+/g," ").slice(0,90),s:document.title,el:h,q:nq}))});
  const Wd=D.w.filter(w=>hit(w.n)).sort((a,b)=>score(a.n,a[1])-score(b.n,b[1])).slice(0,5);if(Wd.length)out.push({g:t("words"),list:Wd.map(w=>({ic:"word",b:w[1],s:w[2],href:SITE+C+"#w-"+w[0],q:nq}))});
  const B=D.b.filter(b=>hit(b.n)).slice(0,5);if(B.length)out.push({g:t("books"),list:B.map(b=>({ic:"book",b:b[0],s:[b[1],b[2]].filter(Boolean).join(" · "),href:b[3],ext:true,q:nq}))});
  const A=actions().filter(a=>hit(norm(a.b+" "+a.s)));if(A.length)out.push({g:t("actions"),list:A});
  return out}
function actions(){return[
  {ic:"display",b:t1("openTheme"),s:t1("display"),run:()=>{closeCmd();setTimeout(()=>clickHidden(".sp-tb"),60)}},
  {ic:"contrast",b:t1("contrast"),s:R.getAttribute("data-rd-hc")==="1"?"on":"off",run:()=>{S.contrast=R.getAttribute("data-rd-hc")==="1"?(HCQ.matches?"off":"auto"):"more";put("rd-contrast",S.contrast==="auto"?null:S.contrast);apply();closeCmd()}},
  {ic:"sepia",b:t1("sepia"),s:t1("read"),run:()=>{setRead(S.read==="sepia"?"normal":"sepia");closeCmd()}},
  {ic:"diya",b:t1("darshan"),s:t1("read"),run:()=>{setRead(S.read==="darshan"?"normal":"darshan");closeCmd()}},
  {ic:"listen",b:t1("sayTitle"),s:t1("listen"),run:()=>{closeCmd();toggleSay()}},
  {ic:"motion",b:t1("motion"),s:S.motion==="paused"?"on":"off",run:()=>{setMotion(S.motion!=="paused");closeCmd()}},
  {ic:"text",b:t1("size")+" +",s:Math.round(S.size*100)+"%",run:()=>{setSize(S.size+.1)}},
  {ic:"globe",b:W.hindi[0]+" · हिन्दी",s:S.ui==="hi"?"on":"off",run:()=>{setUi(S.ui==="hi"?"":"hi");closeCmd()}}]}
function renderCmd(){const q=cmdEl.querySelector("input").value;const groups=search(q);items=[];
  const res=cmdEl.querySelector(".res");
  res.innerHTML=groups.length?groups.map(g=>`<div class="grp" role="presentation">${esc(g.g)}</div>`+g.list.map(it=>{const i=items.push(it)-1;
    const tag=it.href?`a href="${esc(it.href)}"${it.ext?' target="_blank" rel="noopener"':""}`:'div';
    return `<${tag} class="it" role="option" id="rd-o${i}" data-i="${i}" aria-selected="false"><span class="ico">${svg(it.ic)}</span><span class="tx"><b>${hl(it.b,it.q)}</b>${it.s?`<small>${esc(it.s)}</small>`:""}</span></${tag.split(" ")[0]}>`}).join("")).join("")
   :`<div class="empty">${esc(t1("none"))}</div>`;
  sel=0;mark()}
function mark(){cmdEl.querySelectorAll(".it").forEach(e=>e.setAttribute("aria-selected",+e.dataset.i===sel));const cur=cmdEl.querySelector(`#rd-o${sel}`);
  cmdEl.querySelector("input").setAttribute("aria-activedescendant",cur?cur.id:"");cur&&cur.scrollIntoView({block:"nearest"})}
function choose(i,ev){const it=items[i];if(!it)return;
  if(it.run){it.run();if(cmdEl)renderCmd();return}
  if(it.el){closeCmd();it.el.scrollIntoView({behavior:motionOK()?"smooth":"auto",block:"start"});it.el.setAttribute("tabindex","-1");it.el.focus({preventScroll:true});return}
  if(ev&&ev.type==="click")return closeCmd(); // the link itself navigates
  closeCmd();if(it.ext)window.open(it.href,"_blank","noopener");else location.href=it.href}
let lastFocus=null;
function openCmd(){if(cmdEl)return;lastFocus=document.activeElement;
  cmdEl=document.createElement("div");cmdEl.className="rd-cmd";cmdEl.setAttribute("role","dialog");cmdEl.setAttribute("aria-modal","true");cmdEl.setAttribute("aria-label",t1("search"));
  cmdEl.innerHTML=`<div class="box rd-glass"><div class="in">${svg("search")}<input type="text" role="combobox" aria-expanded="true" aria-controls="rd-res" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="${esc(t1("cmdPh"))}" aria-label="${esc(t1("cmdPh"))}"><kbd>Esc</kbd></div>
   <div class="res" id="rd-res" role="listbox"></div>
   <div class="ft"><span class="keys">${esc(t1("keys"))}</span><span>${esc(t1("sources"))}: <a href="${esc(SITE)}vachanamrut-concordance/#sources">Vachanamrut text</a> · <a href="https://www.swaminarayan.faith/" target="_blank" rel="noopener">swaminarayan.faith</a> (Shree Swaminarayan Temple Bhuj)</span></div></div>`;
  document.body.appendChild(cmdEl);const inp=cmdEl.querySelector("input");inp.focus();renderCmd();
  loadData().then(()=>{if(cmdEl)renderCmd()});
  let tm=null;inp.addEventListener("input",()=>{clearTimeout(tm);tm=setTimeout(renderCmd,60)});
  inp.addEventListener("keydown",e=>{if(e.key==="ArrowDown"){e.preventDefault();sel=Math.min(items.length-1,sel+1);mark()}else if(e.key==="ArrowUp"){e.preventDefault();sel=Math.max(0,sel-1);mark()}
    else if(e.key==="Enter"){e.preventDefault();choose(sel)}else if(e.key==="Escape"){e.preventDefault();closeCmd()}else if(e.key==="Tab"){e.preventDefault()}});
  cmdEl.addEventListener("click",e=>{const it=e.target.closest(".it");if(it){if(items[+it.dataset.i]&&!items[+it.dataset.i].href)e.preventDefault();choose(+it.dataset.i,e);return}if(!e.target.closest(".box"))closeCmd()});
  cmdEl.addEventListener("mousemove",e=>{const it=e.target.closest(".it");if(it&&+it.dataset.i!==sel){sel=+it.dataset.i;mark()}});
}
function closeCmd(){if(!cmdEl)return;cmdEl.remove();cmdEl=null;if(lastFocus&&lastFocus.focus)lastFocus.focus()}
addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&(e.key==="k"||e.key==="K")){e.preventDefault();cmdEl?closeCmd():openCmd();return}
  if(e.key==="/"&&!cmdEl&&!e.target.closest("input,textarea,select,[contenteditable]")&&!document.querySelector("#q")){e.preventDefault();openCmd()}});

/* ---------------- read aloud ---------------- */
const SAY={on:false,paused:false,q:[],i:0,el:null,box:null,rate:+get("rd-rate","1")||1,voices:[]};
function voices(){try{SAY.voices=speechSynthesis.getVoices()||[]}catch(e){SAY.voices=[]}return SAY.voices}
if(window.speechSynthesis){voices();speechSynthesis.addEventListener&&speechSynthesis.addEventListener("voiceschanged",voices)}
const pick=lang=>SAY.voices.find(v=>v.lang&&v.lang.toLowerCase().replace("_","-").startsWith(lang));
function scriptOf(s){const g=(s.match(/[઀-૿]/g)||[]).length,d=(s.match(/[ऀ-ॿ]/g)||[]).length,l=(s.match(/[A-Za-z]/g)||[]).length;return g>=d&&g>=l&&g?"gu":d>=l&&d?"hi":"en"}
function blocks(){const m=document.querySelector("main")||document.body;
  return [...m.querySelectorAll("h1,h2,h3,p,li,blockquote,dd,figcaption")].filter(el=>el.offsetParent&&!el.closest("nav,.rd-cont,.rd-dock,.sp-tm,.sp-lh,[aria-hidden='true'],script,style")&&
    !(el.matches("li")&&el.querySelector("p"))&&el.textContent.trim().length>1)}
function sayBox(){if(SAY.box)return;const b=document.createElement("div");b.className="rd-say rd-glass";b.setAttribute("role","region");b.setAttribute("aria-label",t1("sayTitle"));
  b.innerHTML=`<div class="hd"><b>${svg("listen")} ${esc(t1("sayTitle"))}</b><button type="button" class="x" data-s="close" aria-label="Close" style="border:0;background:none;color:inherit;cursor:pointer;width:44px;height:44px">${svg("close")}</button></div>
   <div class="ctl"><button type="button" data-s="prev" aria-label="Previous paragraph">${svg("left")}</button><button type="button" class="main" data-s="play" aria-label="Pause">${svg("pause")}</button>
   <button type="button" data-s="next" aria-label="Next paragraph">${svg("right")}</button><button type="button" data-s="stop" aria-label="Stop">${svg("stop")}</button>
   <select aria-label="Speed">${[.75,.9,1,1.15,1.3,1.5].map(r=>`<option value="${r}"${r===SAY.rate?" selected":""}>${r}×</option>`).join("")}</select></div><div class="now" aria-live="off"></div>`;
  document.body.appendChild(b);SAY.box=b;
  b.addEventListener("click",e=>{const x=e.target.closest("[data-s]");if(!x)return;const a=x.dataset.s;
    if(a==="play"){if(SAY.paused){speechSynthesis.resume();SAY.paused=false}else{speechSynthesis.pause();SAY.paused=true}paintSay()}
    else if(a==="next"){SAY.i=Math.min(SAY.q.length-1,SAY.i+1);speakAt()}else if(a==="prev"){SAY.i=Math.max(0,SAY.i-1);speakAt()}
    else stopSay()});
  b.querySelector("select").addEventListener("change",e=>{SAY.rate=+e.target.value;put("rd-rate",SAY.rate);speakAt()})}
function paintSay(){if(!SAY.box)return;const p=SAY.box.querySelector('[data-s="play"]');p.innerHTML=svg(SAY.paused?"play":"pause");p.setAttribute("aria-label",SAY.paused?"Play":"Pause")}
function speakAt(){speechSynthesis.cancel();if(SAY.el)SAY.el.classList.remove("rd-saying");
  const item=SAY.q[SAY.i];if(!item){stopSay();return}
  SAY.el=item.el;item.el.classList.add("rd-saying");item.el.scrollIntoView({behavior:motionOK()?"smooth":"auto",block:"center"});
  SAY.box&&(SAY.box.querySelector(".now").textContent=item.text.slice(0,160));
  const u=new SpeechSynthesisUtterance(item.text);u.lang=item.lang==="gu"?"gu-IN":item.lang==="hi"?"hi-IN":"en-IN";const v=pick(item.lang==="en"?"en-in":item.lang)||(item.lang==="en"?pick("en"):null);if(v)u.voice=v;
  u.rate=SAY.rate;u.onend=()=>{if(!SAY.on||SAY.paused)return;SAY.i++;if(SAY.i<SAY.q.length)speakAt();else stopSay()};
  SAY.paused=false;paintSay();speechSynthesis.speak(u)}
function toggleSay(){if(SAY.on){stopSay();return}
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){toast(t1("sayNo"));return}
  voices();const hasGu=!!pick("gu"),hasHi=!!pick("hi");
  let q=blocks().map(el=>{const text=el.innerText.replace(/\s+/g," ").trim();return{el,text,lang:scriptOf(text)}});
  const skipped=q.some(x=>x.lang==="gu")&&!hasGu;q=q.filter(x=>(x.lang!=="gu"||hasGu)&&(x.lang!=="hi"||hasHi||true));
  if(!q.length){toast(skipped?t1("sayNoGu"):t1("sayNone"),6000);return}
  if(skipped)toast(t1("sayNoGu"),6000);
  // start from the first paragraph on screen
  let start=q.findIndex(x=>x.el.getBoundingClientRect().bottom>80);if(start<0)start=0;
  SAY.q=q;SAY.i=start;SAY.on=true;sayBox();speakAt();paintDock()}
function stopSay(){SAY.on=false;SAY.paused=false;try{speechSynthesis.cancel()}catch(e){}if(SAY.el)SAY.el.classList.remove("rd-saying");SAY.el=null;if(SAY.box){SAY.box.remove();SAY.box=null}paintDock()}
addEventListener("pagehide",()=>{try{speechSynthesis.cancel()}catch(e){}});

/* ---------------- labels, alt text and icons ---------------- */
const GLYPH={"▶":["play","Play"],"►":["play","Play"],"⏸":["pause","Pause"],"‹":["left","Previous"],"›":["right","Next"],"←":["back","Back"],"→":["fwd","Next"],"↑":["up","Up"],"↓":["down","Down"],
 "✕":["close","Close"],"×":["close","Close"],"✖":["close","Close"],"↻":["refresh","Another"],"⟳":["refresh","Refresh"],"−":["minus","Less"],"–":["minus","Less"],"+":["plus","More"],"💬":["comment","Comment"],
 "☰":["menu","Menu"],"🔍":["search","Search"],"⬇":["download","Download"],"🖨":["print","Print"],"📖":["book","Book"],"🪐":["planet","3D model"],"🕸":["graph","Graph"],"…":["more","More"],"⋯":["more","More"],"✓":["check","Done"],"🔎":["search","Search"],"🔗":["link","Link"],"❓":["help","Help"],"🎵":["music","Music"],"🔬":["flask","Science"],"🎧":["listen","Listen"],"📅":["calendar","Calendar"]};
const LEAD=/^(🖨|⬇|📖|🪐|🕸|🔎|🔍|🔗|❓|🎵|🔬|🎧|📅)️?\s+/;
function nameOf(src){try{return decodeURIComponent(src.split("/").pop().split("?")[0]).replace(/\.[a-z0-9]+$/i,"").replace(/[-_]+/g," ").replace(/\b\d{3,}\b/g,"").trim()}catch(e){return ""}}
function a11y(root){
  (root.querySelectorAll?root:document).querySelectorAll("img:not([alt])").forEach(img=>{const f=img.closest("figure");const cap=f&&f.querySelector("figcaption");
    img.alt=(img.title||img.getAttribute("aria-label")||(cap&&cap.textContent.trim())||(img.closest("a[title]")&&img.closest("a[title]").title)||nameOf(img.currentSrc||img.src)||"").slice(0,140)});
  root.querySelectorAll("iframe:not([title])").forEach(f=>f.title=/youtube|youtu\.be/.test(f.src)?"Video":"Embedded content");
  root.querySelectorAll("button,a[href],[role=button]").forEach(b=>{
    if(b.closest(".rd-dock,.rd-cmd,.rd-say,.sp-tm,svg"))return;
    const raw=(b.textContent||"").trim();const g=GLYPH[raw];
    if(g&&!b.querySelector("svg,img")&&b.children.length===0){b.dataset.rdGlyph=raw;b.innerHTML=svg(g[0]);b.classList.add("rd-ic-btn");if(!b.getAttribute("aria-label"))b.setAttribute("aria-label",b.title||g[1])}
    else if(LEAD.test(raw)&&b.firstChild&&b.firstChild.nodeType===3){const m=b.firstChild.nodeValue.match(LEAD);if(m){b.firstChild.nodeValue=b.firstChild.nodeValue.slice(m[0].length);b.insertAdjacentHTML("afterbegin",svg(GLYPH[m[1]][0]));b.classList.add("rd-ic-btn")}}
    if(!b.getAttribute("aria-label")&&!(b.textContent||"").trim()&&!b.querySelector("img[alt]:not([alt=''])")){const tt=b.title||b.dataset.rdGlyph;if(tt)b.setAttribute("aria-label",tt)}
  })}
let aT=null;const aQ=new Set();
function watchA11y(){a11y(document);new MutationObserver(ms=>{for(const m of ms){if(m.target.closest&&m.target.closest(".rd-dock,.rd-cmd,.rd-say,.sp-tm"))continue;
    m.addedNodes.forEach(n=>{if(n.nodeType===1)aQ.add(n);else if(n.parentElement)aQ.add(n.parentElement)});if(m.type==="characterData"&&m.target.parentElement)aQ.add(m.target.parentElement)}
  clearTimeout(aT);aT=setTimeout(()=>{aQ.forEach(n=>{if(n.isConnected)a11y(n.closest("button,a")||n)});aQ.clear();if(S.ui==="hi")applyHindi()},120)}).observe(document.body,{childList:true,subtree:true,characterData:true})}

/* ---------------- micro-interactions ---------------- */
function ripples(){document.addEventListener("pointerdown",e=>{if(!motionOK())return;const b=e.target.closest("button,.chip,.btn,.rd-cont a");if(!b||b.closest(".rd-dock,.sp-tm,.rd-cmd")||b.disabled)return;
  const cs=getComputedStyle(b);if(cs.position==="static")b.style.position="relative";if(cs.overflow!=="hidden")b.style.overflow="hidden";
  const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2.2,s=document.createElement("span");s.className="rd-ripple";
  s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;b.appendChild(s);setTimeout(()=>s.remove(),650)},{passive:true})}
function spotlight(){if(!matchMedia("(hover:hover) and (pointer:fine)").matches||!FULL)return;
  const mark=()=>document.querySelectorAll("main .card,main .block,main article").forEach(c=>c.classList.add("rd-spot"));mark();setTimeout(mark,1500);
  document.addEventListener("pointermove",e=>{const c=e.target.closest&&e.target.closest(".rd-spot");if(!c)return;const r=c.getBoundingClientRect();
    c.style.setProperty("--mx",(e.clientX-r.left)+"px");c.style.setProperty("--my",(e.clientY-r.top)+"px")},{passive:true})}
function entrance(){// header and navigation settle in once per visit, with GSAP when the motion layer has loaded it
  if(!motionOK()||!FULL)return;const go=()=>{const g=window.gsap;if(!g)return;const links=document.querySelectorAll(".top .brand,.top .nav a");if(!links.length)return;
    g.from(links,{y:-10,opacity:0,duration:.6,ease:"power3.out",stagger:.035,clearProps:"transform,opacity"});
    // the dock buttons lean toward the pointer a little
    if(matchMedia("(pointer:fine)").matches&&dock)dock.querySelectorAll("button").forEach(b=>{
      b.addEventListener("pointermove",e=>{if(!motionOK())return;const r=b.getBoundingClientRect();g.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.25,duration:.3,ease:"power2.out"})});
      b.addEventListener("pointerleave",()=>g.to(b,{x:0,y:0,duration:.5,ease:"elastic.out(1,.4)"}))})};
  let n=0;const w=setInterval(()=>{if(window.gsap||++n>20){clearInterval(w);go()}},100)}

/* ---------------- start ---------------- */
function start(){buildDock();watchA11y();ripples();spotlight();entrance();if(S.ui==="hi")applyHindi();
  contStrip();restoreJump();
  const main=document.querySelector("main");if(main&&FULL){let ct=null;new MutationObserver(()=>{clearTimeout(ct);ct=setTimeout(contStrip,250)}).observe(main,{childList:true})}
  addEventListener("hashchange",()=>setTimeout(contStrip,300));apply()}
window.SPRD3={open:openCmd,close:closeCmd,say:toggleSay,set(k,v){if(k==="size")setSize(v);else if(k==="read")setRead(v);else if(k==="motion")setMotion(v==="paused");else if(k==="ui")setUi(v);else if(k==="contrast"){S.contrast=v;put("rd-contrast",v==="auto"?null:v);apply()}},state:S,icons:I,svg};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
