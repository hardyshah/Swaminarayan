/* Scroll motion for the Swaminarayan site, built on GSAP + ScrollTrigger and three.js.
   - headings rise out of a mask, cards and blocks fade up in staggered batches (ScrollTrigger.batch)
   - pictures drift inside their frames (scrubbed parallax), sections settle in, a progress line fills
   - a three.js "lotus of light" sits behind the page; scrolling opens its petals, tilts and turns it
   - smooth mouse-wheel scrolling on desktop
   Everything is set up inside gsap.matchMedia("(prefers-reduced-motion: no-preference)"), so it is reverted the
   moment a viewer asks for reduced motion. localStorage sp-motion = "off" (window.SPMotion.set(false)) also turns it off.
   Libraries: site/vendor/gsap.min.js + ScrollTrigger.min.js (GSAP 3.13), ../murti-3d/lib/three.module.min.js (r160).
   Loaded by vachanamrut-concordance/theme.js before sp.js; sp.js leaves scroll reveals to this file. */
(function(){
"use strict";
if(window.SPMotion||window.SP_LITE)return;
const ME=document.currentScript&&document.currentScript.src;
if(!ME)return;
const BASE=new URL("./",ME).href;
const RM=matchMedia("(prefers-reduced-motion:reduce)");
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const put=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const root=document.documentElement;
const off=()=>RM.matches||get("sp-motion")==="off";
root.dataset.motion=off()?"off":"on";

/* ---------- smooth wheel scrolling (desktop mouse wheels; trackpads, touch and inner scrollers untouched) ---------- */
const smooth={y:0,to:0,on:false,raf:0};
const scroller=()=>document.scrollingElement||root;
function canScroll(el,dy){
  for(;el&&el!==document.body&&el!==root;el=el.parentElement){
    if(el.nodeType!==1)continue;
    if(/^(CANVAS|IFRAME|SELECT|TEXTAREA)$/.test(el.tagName)||el.isContentEditable)return true;
    const oy=getComputedStyle(el).overflowY;
    if((oy==="auto"||oy==="scroll"||oy==="overlay")&&el.scrollHeight>el.clientHeight+1&&(dy<0?el.scrollTop>0:el.scrollTop+el.clientHeight<el.scrollHeight-1))return true}
  return false}
function frame(){const s=scroller();smooth.y+=(smooth.to-smooth.y)*.12;
  if(Math.abs(smooth.to-smooth.y)<.5){smooth.y=smooth.to;smooth.on=false}
  s.scrollTop=smooth.y;if(smooth.on)smooth.raf=requestAnimationFrame(frame)}
function wheel(e){
  if(off()||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  if(document.querySelector("dialog[open]"))return;
  if(e.deltaMode===0&&Math.abs(e.deltaY)<40&&!smooth.on)return; // trackpad: already smooth
  if(canScroll(e.target,e.deltaY))return;
  const s=scroller(),max=s.scrollHeight-innerHeight;if(max<=0)return;
  const dy=e.deltaMode===1?e.deltaY*36:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
  if(!smooth.on){smooth.y=smooth.to=s.scrollTop}
  smooth.to=Math.max(0,Math.min(max,smooth.to+dy));e.preventDefault();
  if(!smooth.on){smooth.on=true;smooth.raf=requestAnimationFrame(frame)}}
function stopSmooth(){if(smooth.on){cancelAnimationFrame(smooth.raf);smooth.on=false}}
if(matchMedia("(pointer:fine)").matches){
  addEventListener("wheel",wheel,{passive:false});
  ["keydown","mousedown","touchstart"].forEach(t=>addEventListener(t,stopSmooth,{passive:true}));
  addEventListener("scroll",()=>{if(!smooth.on)smooth.y=smooth.to=scroller().scrollTop},{passive:true});
}

/* ---------- loading ---------- */
function script(src){return new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.async=false;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
let libs=null;
function loadGsap(){
  libs=libs||(window.gsap&&window.ScrollTrigger?Promise.resolve():script(BASE+"vendor/gsap.min.js").then(()=>script(BASE+"vendor/ScrollTrigger.min.js")));
  return libs.then(()=>{gsap.registerPlugin(ScrollTrigger);return window.gsap})}

/* ---------- what moves ---------- */
const HEAD="main h1,main h2,main .h2";
const BLOCK=["main .card","main .cards>*","main .two>*","main .block","main .dc","main .item","main .next","main .stage",
  "main .pages>a","main figure","main .statrow>div","main .tile","main .panel","main article","main .sources li"].join(",");
const PIC="main .im>img,main .pic>img,main .yt>button>img,main .hero img,main [data-parallax]";
const SKIP=".sp-mandala,.sp-orbit,dialog,header.top,nav,[data-spm-skip]";
const clipped=el=>/hidden|clip/.test(getComputedStyle(el).overflow);

function scan(g){
  const ST=window.ScrollTrigger,vh=innerHeight;
  // headings: rise out of a mask (on load for those already in view)
  document.querySelectorAll(HEAD).forEach(h=>{
    if(h.dataset.spm||h.closest(SKIP))return;h.dataset.spm=1;
    if(!h.offsetParent)return;
    g.fromTo(h,{clipPath:"inset(0% 0% 100% 0%)",y:"0.45em"},{clipPath:"inset(-20% -4% -30% -4%)",y:0,duration:1.1,ease:"expo.out",clearProps:"clipPath,transform",
      scrollTrigger:{trigger:h,start:"top 92%",once:true}})});
  // blocks: hidden below the fold, then revealed in staggered batches
  const fresh=[];
  document.querySelectorAll(BLOCK).forEach(el=>{
    if(el.dataset.spm||el.closest(SKIP)||el.parentElement.closest("[data-spm-b]"))return;el.dataset.spm=1;
    const r=el.getBoundingClientRect();if(!r.width&&!r.height)return;
    if(r.top<vh*.92)return;              // already on screen: never flash it
    el.dataset.spmB=1;fresh.push(el)});
  if(fresh.length){
    g.set(fresh,{autoAlpha:0,y:42,filter:"blur(6px)"});
    ST.batch(fresh,{start:"top 92%",once:true,interval:.12,batchMax:6,
      onEnter:b=>g.to(b,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.9,ease:"power3.out",stagger:.09,overwrite:true,
        clearProps:"opacity,visibility,transform,filter",onComplete(){b.forEach(el=>delete el.dataset.spmB)}})})}
  // pictures drift inside the frames that clip them
  document.querySelectorAll(PIC).forEach(img=>{
    if(img.dataset.spmPx||img.closest(SKIP))return;img.dataset.spmPx=1;
    const own=img.matches("[data-parallax]"),f=own?img:img.parentElement;
    if(!own&&!clipped(f)&&!(f.parentElement&&clipped(f.parentElement)))return;
    g.fromTo(img,{yPercent:-7,scale:1.14},{yPercent:7,scale:1.14,ease:"none",
      scrollTrigger:{trigger:own?img:f,start:"top bottom",end:"bottom top",scrub:true}})});
  // sections settle in as they enter, unless they hold fixed or sticky pieces (a transform would move those)
  document.querySelectorAll("main>section,main>.sec").forEach(s=>{
    if(s.dataset.spmS)return;s.dataset.spmS=1;
    const kids=s.querySelectorAll("*");if(kids.length>500)return;
    for(const k of kids){const p=getComputedStyle(k).position;if(p==="fixed"||p==="sticky")return}
    if(s.getBoundingClientRect().top<vh)return;
    g.fromTo(s,{scale:.965,opacity:.35},{scale:1,opacity:1,ease:"none",clearProps:"transform,opacity",
      scrollTrigger:{trigger:s,start:"top bottom",end:"top 62%",scrub:.6}})});
}

/* ---------- three.js lotus of light ---------- */
function cssColor(name,fallback){const v=getComputedStyle(root).getPropertyValue(name).trim();return v||fallback}
function isDark(){const c=cssColor("--paper","#fff").replace("#","");if(c.length<6)return matchMedia("(prefers-color-scheme:dark)").matches;
  const n=parseInt(c.slice(0,6),16);return ((n>>16&255)*.299+(n>>8&255)*.587+(n&255)*.114)<128}
function want3d(){
  if(document.querySelector("[data-spm-no3d]")||/solar-system|murti-3d/.test(location.pathname))return false; // pages with their own WebGL
  if(navigator.connection&&navigator.connection.saveData)return false;
  // only on devices that can carry it: 4 GB+ memory and 4+ cores where the browser reports them (Rangdock3 efficiency rule)
  if((navigator.deviceMemory&&navigator.deviceMemory<4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<4))return false;
  if(root.getAttribute("data-rd-motion")==="paused"||root.getAttribute("data-rd-read")==="darshan")return false;
  try{const c=document.createElement("canvas");return !!(c.getContext("webgl2")||c.getContext("webgl"))}catch(e){return false}}
async function lotus(g){
  const THREE=await import(new URL("../murti-3d/lib/three.module.min.js",BASE).href);
  if(off())return ()=>{};
  const small=innerWidth<820,N=small?2600:5200,D=small?700:1600;
  const canvas=document.createElement("canvas");canvas.className="spm-3d";canvas.setAttribute("aria-hidden","true");document.body.prepend(canvas);
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight,false);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,50);cam.position.set(0,0,6.2);
  // petals: three layers of an 8-petal rose curve; each point keeps its angle, layer and a random offset
  const pa=new Float32Array(N*4);
  for(let i=0;i<N;i++){const L=i%3;pa.set([Math.random()*Math.PI*2,L,Math.random(),Math.random()],i*4)}
  const pg=new THREE.BufferGeometry();pg.setAttribute("aSeed",new THREE.BufferAttribute(pa,4));
  pg.setAttribute("position",new THREE.BufferAttribute(new Float32Array(N*3),3));
  const U={uOpen:{value:0},uTime:{value:0},uA:{value:new THREE.Color()},uB:{value:new THREE.Color()},uPx:{value:renderer.getPixelRatio()},uAlpha:{value:.8}};
  const petals=new THREE.Points(pg,new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,
    vertexShader:`attribute vec4 aSeed;uniform float uOpen,uTime,uPx;varying float vL;varying float vF;
      void main(){float th=aSeed.x,L=aSeed.y,R=1.55-L*.42,off=L==1.?.3927:0.;
        float rose=abs(cos(4.*(th+off)));float r=R*pow(rose,.55)*(.45+.55*uOpen)*(.86+.14*aSeed.z);
        float lift=(1.-pow(rose,.8))*.08+pow(r/R,2.)*(.95-.55*uOpen)*(.6+L*.35);
        vec3 p=vec3(cos(th)*r,sin(th)*r,lift+(aSeed.w-.5)*.05);
        p.z+=sin(uTime*.8+th*3.+L)*.025;
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
        gl_PointSize=(2.2+aSeed.z*2.6)*uPx*(6./-mv.z);vL=L/2.;vF=rose;}`,
    fragmentShader:`uniform vec3 uA,uB;uniform float uAlpha;varying float vL;varying float vF;
      void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=smoothstep(.5,.05,d)*uAlpha*(.45+.55*vF);
        gl_FragColor=vec4(mix(uA,uB,vL*.9),a);}`}));
  // drifting dust around it, like diya sparks
  const da=new Float32Array(D*3);for(let i=0;i<D;i++){const r=2.2+Math.random()*3.2,t=Math.random()*Math.PI*2,z=(Math.random()-.5)*3;da.set([Math.cos(t)*r,Math.sin(t)*r,z],i*3)}
  const dg=new THREE.BufferGeometry();dg.setAttribute("position",new THREE.BufferAttribute(da,3));
  const dust=new THREE.Points(dg,new THREE.PointsMaterial({size:.035,transparent:true,depthWrite:false,opacity:.55}));
  const group=new THREE.Group();group.add(petals,dust);scene.add(group);
  function paint(){const dark=isDark();U.uA.value.set(cssColor("--saffron","#b9560c"));U.uB.value.set(dark?"#f3d27a":cssColor("--peacock","#0e5a61"));
    dust.material.color.set(dark?"#f6c66d":cssColor("--saffron","#b9560c"));
    const blend=dark?THREE.AdditiveBlending:THREE.NormalBlending;petals.material.blending=blend;dust.material.blending=blend;
    U.uAlpha.value=dark?.85:.7;petals.material.needsUpdate=true;dust.material.needsUpdate=true}
  paint();
  // place it beside the text on wide screens, behind it on phones
  const S={open:0,tilt:1.05,spin:0,z:6.2,x:0};
  function place(){S.x=innerWidth>=1100?1.9:innerWidth>=820?1.2:0}place();
  // scroll story: the lotus opens and tilts toward the viewer over the first half, then turns and comes closer
  const tl=g.timeline({defaults:{ease:"none"},scrollTrigger:{trigger:root,start:0,end:"max",scrub:1.2}});
  tl.to(S,{open:1,tilt:.38,spin:Math.PI*.9,duration:.5}).to(S,{spin:Math.PI*1.8,z:4.6,tilt:.6,duration:.5});
  const t0=performance.now();
  function render(){if(document.hidden)return;const t=(performance.now()-t0)/1000;U.uTime.value=t;
    group.rotation.set(-S.tilt,0,S.spin+t*.03);group.position.x=S.x;cam.position.z=S.z;dust.rotation.z=-t*.012;
    renderer.render(scene,cam)}
  g.ticker.add(render);
  const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();place()};
  addEventListener("resize",resize);addEventListener("sp-theme",()=>setTimeout(paint,40));
  const mo=new MutationObserver(()=>paint());mo.observe(root,{attributes:true,attributeFilter:["data-theme","style","class"]});
  requestAnimationFrame(()=>canvas.classList.add("on"));
  return ()=>{g.ticker.remove(render);removeEventListener("resize",resize);mo.disconnect();tl.scrollTrigger&&tl.scrollTrigger.kill();tl.kill();
    pg.dispose();dg.dispose();petals.material.dispose();dust.material.dispose();renderer.dispose();canvas.remove()}}

/* ---------- start ---------- */
let mm=null;
function start(){
  if(off()){root.dataset.motion="off";return}
  if(!document.querySelector("main"))return;
  loadGsap().then(g=>{
    mm=g.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)",()=>{
      if(get("sp-motion")==="off")return;
      root.dataset.motion="on";
      const bar=document.createElement("div");bar.className="spm-bar";bar.setAttribute("aria-hidden","true");document.body.appendChild(bar);
      g.to(bar,{scaleX:1,ease:"none",scrollTrigger:{trigger:root,start:0,end:"max",scrub:.3}});
      scan(g);
      // content drawn later (search results, feeds, the reader) is picked up and positions are refreshed
      let t=null;const mo=new MutationObserver(ms=>{
        if(ms.every(m=>[...m.addedNodes].every(n=>n.nodeType!==1||n.classList.contains("sp-spark"))))return;
        clearTimeout(t);t=setTimeout(()=>{scan(g);ScrollTrigger.refresh()},150)});
      mo.observe(document.querySelector("main"),{childList:true,subtree:true});
      addEventListener("load",()=>ScrollTrigger.refresh(),{once:true});
      let undo3d=null,dead=false;
      if(want3d())(window.requestIdleCallback||setTimeout)(()=>lotus(g).then(u=>{if(dead)u();else undo3d=u}).catch(e=>console.warn("motion: 3D skipped",e)),{timeout:1500});
      return ()=>{dead=true;mo.disconnect();clearTimeout(t);bar.remove();undo3d&&undo3d();
        document.querySelectorAll("[data-spm],[data-spm-px],[data-spm-s],[data-spm-b]").forEach(el=>{delete el.dataset.spm;delete el.dataset.spmPx;delete el.dataset.spmS;delete el.dataset.spmB});
        root.dataset.motion="off"}});
  }).catch(e=>{console.warn("motion: GSAP failed to load",e);root.dataset.motion="off"});
}
window.SPMotion={
  set(on){put("sp-motion",on?"on":"off");stopSmooth();if(window.gsap&&gsap.matchMediaRefresh)gsap.matchMediaRefresh();else if(on)start();
    root.dataset.motion=on&&!RM.matches?"on":"off"},
  get on(){return !off()}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
