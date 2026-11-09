/* Two analog clocks side by side: Vedic time (60 ghadi from sunrise; ghadi, pal and vipal hands) and clock time (12 hours).
   SPClocks.mount(el, getDay, tz) — getDay() returns {rise,set,next} Dates for the current Hindu day; tz is an IANA zone or null. */
window.SPClocks=(function(){
"use strict";
const GD="૦૧૨૩૪૫૬૭૮૯",gu=n=>String(n).replace(/\d/g,d=>GD[d]),pad=n=>String(n).padStart(2,"0");
const C=100,pt=(deg,r)=>{const a=(deg-90)*Math.PI/180;return [C+r*Math.cos(a),C+r*Math.sin(a)]};
const f=n=>n.toFixed(2);
function arc(d0,d1,r){const [x0,y0]=pt(d0,r),[x1,y1]=pt(d1,r);return `M${f(x0)} ${f(y0)}A${r} ${r} 0 ${d1-d0>180?1:0} 1 ${f(x1)} ${f(y1)}`}
function hand(cls,len,w,tail,cap){return `<g class="h ${cls}"><line x1="${C}" y1="${C+tail}" x2="${C}" y2="${C-len}" stroke-width="${w}" stroke-linecap="round"/>${cap||""}</g>`}
const CSS=`.spc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:start}
.spc figure{margin:0;text-align:center}
.spc svg{width:100%;max-width:260px;height:auto;display:block;margin:0 auto;overflow:visible}
.spc figcaption{margin-top:6px;font-size:13px;color:var(--ink-2);line-height:1.35}
.spc figcaption b{display:block;font-family:var(--f-read);font-size:17px;color:var(--ink)}
.spc .rd{font-family:var(--f-read);font-weight:600;font-size:20px;font-variant-numeric:tabular-nums;color:var(--ink);margin-top:2px}
.spc .lg{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--ink-3);margin-top:4px}
.spc .lg i{display:inline-block;width:14px;height:3px;border-radius:2px;vertical-align:middle;margin-right:4px}
.spc .h line{stroke:var(--ink)} .spc .h.v line,.spc .h.s line{stroke:var(--saffron)} .spc .h.p line,.spc .h.mm line{stroke:var(--spc-blue)} .spc{--spc-blue:color-mix(in srgb,#1971c2 72%,var(--ink))}
.spc .face{fill:var(--surface);stroke:var(--line)} .spc .tk{stroke:var(--ink-3)} .spc .tk.b{stroke:var(--ink-2)}
.spc .num{fill:var(--ink-2);font-family:var(--f-ui);font-size:12px;text-anchor:middle;dominant-baseline:central}
.spc .num.b{fill:var(--ink);font-weight:600;font-size:14px}
.spc .day{stroke:var(--saffron)} .spc .night{stroke:var(--peacock)}
@media (max-width:420px){.spc{gap:10px}.spc .rd{font-size:16px}.spc figcaption b{font-size:15px}}`;
function vedicFace(){let s=`<circle class="face" cx="${C}" cy="${C}" r="96"/><path class="day" id="vc-day" fill="none" stroke-width="5" stroke-linecap="round"/><path class="night" id="vc-night" fill="none" stroke-width="5" stroke-linecap="round" opacity=".7"/>`;
  for(let i=0;i<60;i++){const big=i%5===0,[x0,y0]=pt(i*6,84),[x1,y1]=pt(i*6,big?75:80);s+=`<line class="tk${big?" b":""}" x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}" stroke-width="${big?1.8:.8}"/>`}
  for(let i=0;i<60;i+=5){const [x,y]=pt(i*6,65);s+=`<text class="num${i%15===0?" b":""}" x="${f(x)}" y="${f(y)}">${gu(i)}</text>`}
  // sunrise and sunset markers
  s+=`<g id="vc-rise"></g><g id="vc-set"></g>`;
  s+=`<text class="num" x="${C}" y="${C+30}" style="font-size:10px">ઘડી · ghadi</text>`;
  s+=hand("g",44,5,8)+hand("p",68,3,12)+hand("v",80,1.4,16,`<circle cx="${C}" cy="${C-80}" r="2.6" fill="var(--saffron)"/>`);
  s+=`<circle cx="${C}" cy="${C}" r="7" fill="var(--saffron)"/><circle cx="${C}" cy="${C}" r="3" fill="var(--surface)"/>`;return s}
function clockFace(){let s=`<circle class="face" cx="${C}" cy="${C}" r="96"/><path class="day" id="sc-day" fill="none" stroke-width="5" stroke-linecap="round" opacity=".5"/>`;
  for(let i=0;i<60;i++){const big=i%5===0,[x0,y0]=pt(i*6,84),[x1,y1]=pt(i*6,big?75:80);s+=`<line class="tk${big?" b":""}" x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}" stroke-width="${big?1.8:.8}"/>`}
  for(let i=1;i<=12;i++){const [x,y]=pt(i*30,65);s+=`<text class="num${i%3===0?" b":""}" x="${f(x)}" y="${f(y)}">${i}</text>`}
  s+=`<text class="num" id="sc-ap" x="${C}" y="${C+30}" style="font-size:10px"></text>`;
  s+=hand("hh",44,5,8)+hand("mm",68,3,12)+hand("s",80,1.4,16,`<circle cx="${C}" cy="${C-80}" r="2.6" fill="var(--saffron)"/>`);
  s+=`<circle cx="${C}" cy="${C}" r="7" fill="var(--ink)"/><circle cx="${C}" cy="${C}" r="3" fill="var(--surface)"/>`;return s}
const sunMark=(deg,txt)=>{const [x,y]=pt(deg,96);const [tx,ty]=pt(deg,108);return `<circle cx="${f(x)}" cy="${f(y)}" r="4.5" fill="var(--saffron)" stroke="var(--surface)" stroke-width="1.5"/><text class="num" x="${f(tx)}" y="${f(ty)}" style="font-size:9.5px">${txt}</text>`};
function partsIn(d,tz){const o={hour:"numeric",minute:"numeric",second:"numeric",hourCycle:"h23"};if(tz)o.timeZone=tz;
  const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",o).formatToParts(d).map(x=>[x.type,x.value]));return {h:+p.hour,m:+p.minute,s:+p.second}}
function mount(el,getDay,getTz){
  if(!document.getElementById("spc-css")){const st=document.createElement("style");st.id="spc-css";st.textContent=CSS;document.head.appendChild(st)}
  el.classList.add("spc");
  el.innerHTML=`<figure><svg viewBox="-12 -12 224 224" role="img" aria-label="Vedic clock">${vedicFace()}</svg>
    <figcaption><b>વૈદિક ઘડિયાળ · Vedic clock</b><div class="rd" data-v></div><div class="lg"><span><i style="background:var(--ink)"></i>ghadi</span><span><i style="background:var(--spc-blue)"></i>pal</span><span><i style="background:var(--saffron)"></i>vipal</span></div><div>૦ = sunrise · one turn = ૬૦ ઘડી = one day</div></figcaption></figure>
   <figure><svg viewBox="-12 -12 224 224" role="img" aria-label="Clock time">${clockFace()}</svg>
    <figcaption><b>ઘડિયાળ · Clock time</b><div class="rd" data-s></div><div class="lg"><span><i style="background:var(--ink)"></i>hour</span><span><i style="background:var(--spc-blue)"></i>minute</span><span><i style="background:var(--saffron)"></i>second</span></div><div data-z>12 = noon and midnight</div></figcaption></figure>`;
  const [V,S]=el.querySelectorAll("svg"),q=(r,s)=>r.querySelector(s);
  const rot=(g,deg)=>g.setAttribute("transform",`rotate(${f(deg)} ${C} ${C})`);
  let key="";
  // the Vedic hands are a different color from the clock's: ghadi ink, pal peacock, vipal saffron
  
  function frame(){
    const now=new Date(),H=getDay(now),tz=getTz();
    const el_s=(now-H.rise)/1000,total=(H.next-H.rise)/1000,dayDeg=(H.set-H.rise)/1000/1440*6;
    if(key!==+H.rise+String(tz)){key=+H.rise+String(tz);
      q(V,"#vc-day").setAttribute("d",arc(0,dayDeg,92));q(V,"#vc-night").setAttribute("d",arc(dayDeg,Math.min(359.5,total/1440*6),92));
      q(V,"#vc-rise").innerHTML=sunMark(0,"ઉદય");q(V,"#vc-set").innerHTML=sunMark(dayDeg,"અસ્ત");
      const r=partsIn(H.rise,tz),st=partsIn(H.set,tz),toD=p=>((p.h%12)*30+p.m*.5);
      let a0=toD(r),a1=toD(st);if(a1<a0)a1+=360;q(S,"#sc-day").setAttribute("d",arc(a0,a1,92));}
    const g=el_s/1440,p=(el_s%1440)/24,v=(el_s%24)/.4;
    rot(q(V,".h.g"),g*6);rot(q(V,".h.p"),p*6);rot(q(V,".h.v"),v*6);
    q(el,"[data-v]").textContent=`${gu(pad(Math.floor(g)))} : ${gu(pad(Math.floor(p)))} : ${gu(pad(Math.floor(v)))}`;
    const t=partsIn(now,tz),ms=now.getMilliseconds()/1000,sec=t.s+ms;
    rot(q(S,".h.hh"),(t.h%12)*30+t.m*.5+sec/120);rot(q(S,".h.mm"),t.m*6+sec*.1);rot(q(S,".h.s"),sec*6);
    q(el,"[data-s]").textContent=`${pad(t.h)}:${pad(t.m)}:${pad(t.s)}`;q(S,"#sc-ap").textContent=t.h<12?"AM · સવાર":"PM · બપોર/સાંજ";
    q(el,"[data-z]").textContent=tz==="Asia/Kolkata"?"Indian Standard Time · saffron arc = daylight":"Your local time · saffron arc = daylight";
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame)}
return {mount};})();
