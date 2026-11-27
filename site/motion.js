/* Scroll motion for the Swaminarayan site (style of scroll-driven template sites): smooth wheel scrolling,
   a scroll progress line, headings that rise out of a mask, staggered fade-up reveals, parallax pictures and
   sections that settle in. Plain JS, no libraries. Loaded by vachanamrut-concordance/theme.js.
   Off when the viewer asks for reduced motion, or with localStorage sp-motion = "off" (window.SPMotion.set(false)). */
(function(){
"use strict";
if(window.SPMotion||window.SP_LITE)return;
const RM=matchMedia("(prefers-reduced-motion:reduce)");
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const put=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const root=document.documentElement;
const off=()=>RM.matches||get("sp-motion")==="off";
root.dataset.motion=off()?"off":"on";
const CSS_TL=CSS.supports&&CSS.supports("animation-timeline:view()");

/* ---------- smooth wheel scrolling (desktop mouse wheels only) ---------- */
const smooth={y:0,to:0,on:false,raf:0};
function scroller(){return document.scrollingElement||root}
function canScroll(el,dy){
  for(;el&&el!==document.body&&el!==root;el=el.parentElement){
    if(el.nodeType!==1)continue;
    const cs=getComputedStyle(el),oy=cs.overflowY;
    if((oy==="auto"||oy==="scroll"||oy==="overlay")&&el.scrollHeight>el.clientHeight+1){
      if(dy<0?el.scrollTop>0:el.scrollTop+el.clientHeight<el.scrollHeight-1)return true}
    if(el.tagName==="CANVAS"||el.tagName==="IFRAME"||el.tagName==="SELECT"||el.tagName==="TEXTAREA"||el.isContentEditable)return true;
  }
  return false}
function frame(){
  const s=scroller();smooth.y+=(smooth.to-smooth.y)*.12;
  if(Math.abs(smooth.to-smooth.y)<.5){smooth.y=smooth.to;smooth.on=false}
  s.scrollTop=smooth.y;if(smooth.on)smooth.raf=requestAnimationFrame(frame)}
function wheel(e){
  if(off()||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.deltaX&&Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  if(document.querySelector("dialog[open]"))return;
  // trackpads send many small, pixel-mode deltas and already feel smooth: leave them alone
  if(e.deltaMode===0&&Math.abs(e.deltaY)<40&&!smooth.on)return;
  if(canScroll(e.target,e.deltaY))return;
  const s=scroller(),max=s.scrollHeight-innerHeight;if(max<=0)return;
  const dy=e.deltaMode===1?e.deltaY*36:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
  if(!smooth.on){smooth.y=s.scrollTop;smooth.to=s.scrollTop}
  smooth.to=Math.max(0,Math.min(max,smooth.to+dy));
  e.preventDefault();
  if(!smooth.on){smooth.on=true;smooth.raf=requestAnimationFrame(frame)}}
function stopSmooth(){if(smooth.on){cancelAnimationFrame(smooth.raf);smooth.on=false}}
if(matchMedia("(pointer:fine)").matches){
  addEventListener("wheel",wheel,{passive:false});
  ["keydown","mousedown","touchstart"].forEach(t=>addEventListener(t,stopSmooth,{passive:true}));
}

/* ---------- reveals ---------- */
const HEAD="main h1,main h2,main .h2,main .sech h2,main .head h1";
const BLOCK=["main .card","main .cards>*","main .two>*","main .block","main .dc","main .item",
  "main .next","main .stage","main .pages>a","main figure","main .statrow>div","main .tile","main .panel","main article"].join(",");
const PIC="main .im>img,main .pic>img,main .yt>button>img,main .hero img,main [data-parallax]";
let IO=null,PX=new Set();
function reveal(el,cls,delay){
  if(el.dataset.spm||el.closest("[data-spm-skip],.sp-mandala,.sp-orbit,dialog,.top,header.top,nav"))return;
  el.dataset.spm=1;
  if(el.classList.contains("sp-rv")||el.closest(".sp-rv"))return; // already revealed by sp.js
  const r=el.getBoundingClientRect();
  if(r.width===0&&r.height===0)return;           // hidden: leave alone
  if(r.top<innerHeight*.9&&cls!=="spm-h")return;  // already on screen at load: no flash
  el.classList.add(cls);if(delay)el.style.setProperty("--spm-d",delay+"s");IO.observe(el)}
function done(el){el.classList.add("spm-in");
  const end=()=>{el.classList.remove("spm-r","spm-h","spm-in");el.style.removeProperty("--spm-d")};
  setTimeout(end,1400)}
function scan(){
  if(off())return;
  IO=IO||new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){IO.unobserve(e.target);done(e.target)}}),{rootMargin:"0px 0px -10% 0px"});
  document.querySelectorAll(HEAD).forEach(h=>{if(h.closest(".sp-rv"))return;reveal(h,"spm-h",0)});
  // stagger siblings that arrive together
  const groups=new Map();
  document.querySelectorAll(BLOCK).forEach(el=>{if(el.dataset.spm)return;const p=el.parentElement;if(!groups.has(p))groups.set(p,[]);groups.get(p).push(el)});
  let n=0;
  groups.forEach(list=>list.forEach((el,i)=>{if(n++>600)return;reveal(el,"spm-r",Math.min(i%6,5)*.08)}));
  // parallax pictures, only where the frame clips them
  document.querySelectorAll(PIC).forEach(img=>{
    if(img.dataset.spmPx)return;img.dataset.spmPx=1;
    const f=img.parentElement;if(!f)return;const o=getComputedStyle(img.matches("[data-parallax]")?img:f).overflow;
    if(!img.matches("[data-parallax]")&&!/hidden|clip/.test(o)){
      const g=f.parentElement&&getComputedStyle(f.parentElement).overflow;if(!/hidden|clip/.test(g||""))return}
    if(CSS_TL)img.classList.add("spm-px");else{img.classList.add("spm-pxj");PX.add(img)}});
  // sections settle in, unless they hold fixed or sticky pieces (a transform would move those)
  document.querySelectorAll("main>section,main>.sec").forEach(s=>{
    if(s.dataset.spmS||!CSS_TL)return;s.dataset.spmS=1;
    const kids=s.querySelectorAll("*");if(kids.length>400)return;
    for(const k of kids){const p=getComputedStyle(k).position;if(p==="fixed"||p==="sticky")return}
    s.classList.add("spm-s")})}

/* ---------- progress line and JS parallax fallback ---------- */
let bar=null,tick=false;
function onScroll(){if(tick)return;tick=true;requestAnimationFrame(()=>{tick=false;
  if(!smooth.on){smooth.y=smooth.to=scroller().scrollTop}
  if(bar&&!CSS_TL){const m=scroller().scrollHeight-innerHeight;bar.style.setProperty("--spm-p",m>0?(scroller().scrollTop/m).toFixed(4):0)}
  if(PX.size){const h=innerHeight;PX.forEach(img=>{if(!img.isConnected){PX.delete(img);return}
    const r=img.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>h)return;
    const t=((r.top+r.height/2)-h/2)/(h/2+r.height/2);img.style.setProperty("--spm-y",(-t*7).toFixed(2)+"%")})}})}

function start(){
  if(off()){root.dataset.motion="off";return}
  root.dataset.motion="on";
  if(!document.querySelector(".spm-bar")&&document.querySelector("main")){bar=document.createElement("div");bar.className="spm-bar";bar.setAttribute("aria-hidden","true");document.body.appendChild(bar)}
  scan();onScroll();
  addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",onScroll,{passive:true});
  // pages that draw their content later (search results, feeds) get scanned again
  let t=null;new MutationObserver(ms=>{if(ms.every(m=>[...m.addedNodes].every(n=>n.nodeType!==1||n.classList.contains("sp-spark"))))return;clearTimeout(t);t=setTimeout(scan,120)})
    .observe(document.querySelector("main")||document.body,{childList:true,subtree:true});
}
RM.addEventListener&&RM.addEventListener("change",()=>{root.dataset.motion=off()?"off":"on"});
window.SPMotion={set(on){put("sp-motion",on?"on":"off");root.dataset.motion=on&&!RM.matches?"on":"off";if(on&&!IO)start();if(!on){stopSmooth();document.querySelectorAll(".spm-h,.spm-r").forEach(el=>el.classList.add("spm-in"))}},get on(){return !off()}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
