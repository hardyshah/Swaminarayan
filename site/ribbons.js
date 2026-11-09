/* English ⇄ Vedic, drawn: a day ribbon (clock hours vs ghadi, sunrise, choghadiya, prahar, tithi, date vs vaar),
   a year ribbon (English months vs Gujarati months, sud/vad, purnima/amas, festivals) and plain-language insight cards.
   SPRib.init({root, sun(dateObj)->[rise,set], tz()->zone|null, pan(dateObj)->{m,t,adh}|null, life:[{m,n,gu,t}]}) */
window.SPRib=(function(){
"use strict";
const GD="૦૧૨૩૪૫૬૭૮૯",gu=n=>String(n).replace(/\d/g,d=>GD[d]),pad=n=>String(n).padStart(2,"0");
const MON=["ચૈત્ર","વૈશાખ","જેઠ","અષાઢ","શ્રાવણ","ભાદરવો","આસો","કારતક","માગશર","પોષ","મહા","ફાગણ"];
const MON_EN=["Chaitra","Vaishakh","Jeth","Ashadh","Shravan","Bhadarvo","Aso","Kartak","Magshar","Posh","Maha","Fagan"];
const TI=["પડવો","બીજ","ત્રીજ","ચોથ","પાંચમ","છઠ","સાતમ","આઠમ","નોમ","દશમ","અગિયારસ","બારસ","તેરસ","ચૌદશ"];
const tname=t=>`${t<=15?"સુદ":"વદ"} ${t===15?"પૂનમ":t===30?"અમાસ":TI[(t-1)%15]}`;
const VAAR=["રવિવાર","સોમવાર","મંગળવાર","બુધવાર","ગુરુવાર","શુક્રવાર","શનિવાર"];
const VAAR_EN=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const CH=[["ઉદ્વેગ","b"],["ચલ","n"],["લાભ","g"],["અમૃત","g"],["કાળ","b"],["શુભ","g"],["રોગ","b"]];
const CH_DAY=[0,3,6,2,5,1,4],CH_NIGHT=[5,1,4,0,3,6,2];
const FEST=[[7,1,"બેસતું વર્ષ","New year"],[7,11,"પ્રબોધિની એકાદશી","Prabodhini"],[7,15,"દેવ દિવાળી","Dev Diwali"],[10,5,"વસંત પંચમી · શિક્ષાપત્રી","Vasant Panchami"],
  [11,15,"ફૂલદોલ (હોળી)","Fuldol"],[0,9,"શ્રીહરિ જયંતી · રામનવમી","Hari Jayanti"],[3,15,"ગુરુપૂર્ણિમા","Guru Purnima"],[4,23,"જન્માષ્ટમી","Janmashtami"],[5,11,"જળઝીલણી","Jal Jhilani"],[6,30,"દિવાળી","Diwali"]];
let O=null,ENDS=null,T0=0;
const CSS=`.rb{font-family:var(--f-ui)}
.rb svg{display:block;width:100%;height:auto;overflow:visible}
.rb .ax{fill:var(--ink-3);font-size:10px;text-anchor:middle}
.rb .lab{fill:var(--ink-2);font-size:10.5px;font-weight:600}
.rb .seg{font-size:10px;text-anchor:middle;dominant-baseline:central;fill:var(--ink)}
.rb .g{fill:color-mix(in srgb,#2f9e44 26%,var(--surface))}.rb .n{fill:color-mix(in srgb,var(--ink) 9%,var(--surface))}.rb .b{fill:color-mix(in srgb,#e03131 20%,var(--surface))}
.rb .now line{stroke:var(--saffron-strong);stroke-width:2}.rb .now text{fill:var(--saffron-strong);font-size:10.5px;font-weight:700;text-anchor:middle}
.rb .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.rb .key{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--ink-3);margin-top:6px}
.rb .key i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:4px}
.ins{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.ins .ic{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow)}
.ins .ic .k{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:600}
.ins .ic .v{font-family:var(--f-read);font-size:21px;font-weight:600;line-height:1.25;margin:4px 0 4px;color:var(--ink)}
.ins .ic .v small{font-family:var(--f-ui);font-size:13px;color:var(--ink-2);font-weight:500}
.ins .ic p{margin:0;font-size:14px;color:var(--ink-2);line-height:1.45}
.ins .ic .bar{height:8px;border-radius:99px;background:var(--sunk);overflow:hidden;margin-top:8px}.ins .ic .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--saffron),var(--peacock))}`;
function css(){if(!document.getElementById("rb-css")){const s=document.createElement("style");s.id="rb-css";s.textContent=CSS;document.head.appendChild(s)}}
/* time zone helpers */
function parts(d,tz){const o={year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",hourCycle:"h23"};if(tz)o.timeZone=tz;
  const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",o).formatToParts(d).map(x=>[x.type,+x.value||x.value]));return p}
function midnight(d,tz){if(!tz){const x=new Date(d);x.setHours(0,0,0,0);return x}
  const p=parts(d,tz),guess=Date.UTC(p.year,p.month-1,p.day),off=(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-d.getTime());return new Date(guess-off)}
const fmt=(d,tz)=>new Date(d).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit",timeZone:tz||undefined});
const dur=ms=>{const m=Math.round(ms/60000);return m<60?`${m} min`:`${Math.floor(m/60)} h ${pad(m%60)} min`};
/* tithi from precomputed end times */
function tithiAt(t){if(!ENDS)return null;let lo=0,hi=ENDS.length-1;if(t<ENDS[0]||t>=ENDS[hi])return null;
  while(lo<hi){const mid=(lo+hi)>>1;if(ENDS[mid]>t)hi=mid;else lo=mid+1}
  return {n:(T0+lo-1)%30+1,start:lo?ENDS[lo-1]:null,end:ENDS[lo],i:lo}}
const tnum=i=>(T0+i-1)%30+1;
/* Hindu day around a moment */
function hday(now){const tz=O.tz();let civ=midnight(now,tz),day=new Date(civ.getTime()+12*3600e3);
  const sd=x=>new Date(x.getFullYear?x.getFullYear():0,0,1);
  const local=dt=>{const p=parts(dt,tz);return new Date(p.year,p.month-1,p.day)};
  let D=local(now),[r,s]=O.sun(D);if(now<r){D.setDate(D.getDate()-1);[r,s]=O.sun(D)}
  const N=new Date(D);N.setDate(N.getDate()+1);const r2=O.sun(N)[0];return {D,rise:r,set:s,next:r2}}
/* ---------- day ribbon ---------- */
function day(el,compact){
  const now=new Date(),tz=O.tz(),m0=midnight(now,tz).getTime(),m1=m0+864e5,W=compact?420:1000,L=compact?62:96,R=W-8,X=t=>L+(Math.min(m1,Math.max(m0,t))-m0)/864e5*(R-L);
  const civD=(()=>{const p=parts(now,tz);return new Date(p.year,p.month-1,p.day)})();
  const prevD=new Date(civD);prevD.setDate(prevD.getDate()-1);const nextD=new Date(civD);nextD.setDate(nextD.getDate()+1);
  const [rP,sP]=O.sun(prevD).map(Number),[r,s]=O.sun(civD).map(Number),[rN]=O.sun(nextD).map(Number);
  const rows=compact?{ax:12,sky:22,gh:52,ch:78,ti:104,dv:130}:{ax:14,sky:24,gh:58,ch:88,pr:118,ti:148,dv:178};
  const H=compact?156:208,rh=compact?20:22;let s_=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Today on the clock and in Vedic time">`;
  const row=(y,label,gl)=>s_+=`<text class="lab" x="0" y="${y+rh/2+4}">${gl}</text>${compact?"":`<text class="ax" x="0" y="${y+rh/2+15}" style="text-anchor:start">${label}</text>`}`;
  // clock axis
  for(let h=0;h<=24;h+=compact?6:3){const x=X(m0+h*3600e3);s_+=`<line x1="${x}" x2="${x}" y1="${rows.ax+4}" y2="${H-4}" stroke="var(--line)" stroke-dasharray="2 3"/><text class="ax" x="${x}" y="${rows.ax}">${pad(h%24)}:00</text>`}
  // sky
  row(rows.sky,"sky","આકાશ");
  s_+=`<defs><linearGradient id="rbsky" x1="0" x2="1"><stop offset="0" stop-color="#1e2a4a"/><stop offset="${((r-m0)/864e5-.02).toFixed(3)}" stop-color="#2b3a66"/><stop offset="${((r-m0)/864e5+.02).toFixed(3)}" stop-color="#f6c177"/><stop offset="${((+r + +s)/2-m0)/864e5}" stop-color="#ffe9a8"/><stop offset="${((s-m0)/864e5-.02).toFixed(3)}" stop-color="#f4a261"/><stop offset="${((s-m0)/864e5+.02).toFixed(3)}" stop-color="#2b3a66"/><stop offset="1" stop-color="#1e2a4a"/></linearGradient></defs>`;
  s_+=`<rect x="${L}" y="${rows.sky}" width="${R-L}" height="${rh}" rx="5" fill="url(#rbsky)"/>`;
  s_+=`<text class="seg" x="${X(r)}" y="${rows.sky+rh/2}" style="font-size:9.5px;fill:#3b2a10">☀ ${fmt(r,tz)}</text><text class="seg" x="${X(s)}" y="${rows.sky+rh/2}" style="font-size:9.5px;fill:#fff">${fmt(s,tz)} ☾</text>`;
  // ghadi from sunrise
  row(rows.gh,"ghadi from sunrise","ઘડી");
  s_+=`<rect x="${L}" y="${rows.gh}" width="${X(r)-L}" height="${rh}" class="n" opacity=".6" rx="4"/><rect x="${X(r)}" y="${rows.gh}" width="${R-X(r)}" height="${rh}" fill="color-mix(in srgb,var(--saffron) 14%,var(--surface))" rx="4"/>`;
  const gPrev=(r-rP)/1440e3;for(let g=0;g<=60;g+=5){const tt=r+g*1440e3;if(tt>m1)break;const x=X(tt);s_+=`<line x1="${x}" x2="${x}" y1="${rows.gh}" y2="${rows.gh+rh}" stroke="var(--saffron)" stroke-width="${g%15?1:2}"/>${(compact&&g%15)?"":`<text class="seg" x="${x+(g===0?10:0)}" y="${rows.gh+rh/2}" style="font-size:9.5px">${gu(g)}</text>`}`}
  for(let g=Math.ceil((m0-rP)/1440e3/5)*5;g<gPrev;g+=5){const tt=rP+g*1440e3;if(tt<m0)continue;const x=X(tt);if(X(r)-x<(compact?14:22))continue;s_+=`<line x1="${x}" x2="${x}" y1="${rows.gh}" y2="${rows.gh+rh}" stroke="var(--ink-3)"/>${compact&&g%15?"":`<text class="seg" x="${x}" y="${rows.gh+rh/2}" style="font-size:9px;fill:var(--ink-3)">${gu(g)}</text>`}`}
  // choghadiya: previous night, today's day, tonight
  row(rows.ch,"choghadiya","ચોઘડિયું");
  const wd=civD.getDay(),pwd=(wd+6)%7;
  const segs=(a,b,n,lab,cls)=>{for(let i=0;i<n;i++){const t0=a+(b-a)*i/n,t1=a+(b-a)*(i+1)/n;if(t1<m0||t0>m1)continue;const x0=X(t0),x1=X(t1),c=lab(i);
    s_+=`<rect class="${cls?cls(i):c[1]}" x="${x0+.5}" y="${cls?rows.pr:rows.ch}" width="${Math.max(0,x1-x0-1)}" height="${rh}" rx="3"><title>${c[0]} ${fmt(new Date(t0),tz)}–${fmt(new Date(t1),tz)}</title></rect>${x1-x0>(compact?26:38)?`<text class="seg" x="${(x0+x1)/2}" y="${(cls?rows.pr:rows.ch)+rh/2}">${c[0]}</text>`:""}`}};
  segs(sP,r,8,i=>CH[(CH_NIGHT[pwd]+i*5)%7]);segs(r,s,8,i=>CH[(CH_DAY[wd]+i)%7]);segs(s,rN,8,i=>CH[(CH_NIGHT[wd]+i*5)%7]);
  if(!compact){row(rows.pr,"prahar","પ્રહર");const P=["૧","૨","૩","૪"];
    segs(sP,r,4,i=>[`રાત્રિ ${P[i]}`,"n"],()=>"n");segs(r,s,4,i=>[`દિવસ ${P[i]}`,""],i=>i%2?"g":"n");segs(s,rN,4,i=>[`રાત્રિ ${P[i]}`,""],()=>"n")}
  // tithi
  row(rows.ti,"tithi (lunar day)","તિથિ");
  let t=tithiAt(m0);
  while(t&&t.start!==null){const a=Math.max(m0,t.start),b=Math.min(m1,t.end),x0=X(a),x1=X(b);
    s_+=`<rect x="${x0+.5}" y="${rows.ti}" width="${Math.max(0,x1-x0-1)}" height="${rh}" rx="3" fill="color-mix(in srgb,var(--peacock) ${t.n<=15?14:30}%,var(--surface))"/>${x1-x0>50?`<text class="seg" x="${(x0+x1)/2}" y="${rows.ti+rh/2}">${tname(t.n)}</text>`:""}`;
    if(t.end<m1){const x=X(t.end);s_+=`<line x1="${x}" x2="${x}" y1="${rows.ti-3}" y2="${rows.ti+rh+3}" stroke="var(--peacock)" stroke-width="2"/>`}
    if(t.end>=m1)break;t=tithiAt(t.end+1)}
  // date vs vaar
  row(rows.dv,"date · vaar","તારીખ / વાર");
  s_+=`<rect x="${L}" y="${rows.dv}" width="${R-L}" height="${rh/2-1}" rx="3" fill="color-mix(in srgb,var(--ink) 12%,var(--surface))"/><text class="seg" x="${(L+R)/2}" y="${rows.dv+rh/4}" style="font-size:9px">${civD.toLocaleDateString("en-GB",{weekday:compact?"short":"long",day:"numeric",month:"short"})} · midnight to midnight</text>`;
  s_+=`<rect x="${L}" y="${rows.dv+rh/2+1}" width="${X(r)-L}" height="${rh/2-1}" rx="3" fill="color-mix(in srgb,var(--saffron) 12%,var(--surface))"/><rect x="${X(r)}" y="${rows.dv+rh/2+1}" width="${R-X(r)}" height="${rh/2-1}" rx="3" fill="color-mix(in srgb,var(--saffron) 30%,var(--surface))"/>`;
  s_+=`${X(r)-L>60?`<text class="seg" x="${(L+X(r))/2}" y="${rows.dv+rh*.75}" style="font-size:9px">${VAAR[pwd]}</text>`:""}<text class="seg" x="${(X(r)+R)/2}" y="${rows.dv+rh*.75}" style="font-size:9px">${VAAR[wd]} · sunrise to sunrise</text>`;
  // now
  const xn=X(now.getTime());s_+=`<g class="now"><line x1="${xn}" x2="${xn}" y1="${rows.sky-6}" y2="${H-2}"/><text x="${xn}" y="${rows.sky-8}">${compact?"":"now "}${fmt(now,tz)}</text></g>`;
  el.innerHTML=`<div class="rb">${compact?"":`<div class="scroll"><div style="min-width:720px">`}${s_}</svg>${compact?"":"</div></div>"}
   <div class="key"><span><i class="g" style="background:color-mix(in srgb,#2f9e44 26%,var(--surface))"></i>auspicious (amrut, shubh, labh)</span><span><i style="background:color-mix(in srgb,var(--ink) 9%,var(--surface))"></i>chal / neutral</span><span><i style="background:color-mix(in srgb,#e03131 20%,var(--surface))"></i>avoid (rog, kaal, udveg)</span></div></div>`}
/* ---------- year ribbon ---------- */
function year(el){
  if(!O.pan)return;const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  // find the Vikram year around today: last Kartak sud 1 on or before today, to the next one
  let a=new Date(today);for(let i=0;i<400;i++){const P=O.pan(a);if(P&&P.m===7&&P.t<=2&&!P.adh){const pv=O.pan(new Date(a.getTime()-864e5));if(!pv||pv.m!==7)break}a.setDate(a.getDate()-1)}
  let b=new Date(a);b.setDate(b.getDate()+300);for(let i=0;i<120;i++){const P=O.pan(b);if(P&&P.m===7&&!P.adh){const pv=O.pan(new Date(b.getTime()-864e5));if(pv&&pv.m!==7)break}b.setDate(b.getDate()+1)}
  const days=Math.round((b-a)/864e5),W=1100,L=96,R=W-8,X=i=>L+i/days*(R-L);
  const vs=(()=>{const y=a.getFullYear();return y+57})();
  let s=`<svg viewBox="0 0 ${W} 214" role="img" aria-label="This Vikram Samvat year against the English calendar">`;
  const lab=(y,gl,en)=>s+=`<text class="lab" x="0" y="${y+14}">${gl}</text><text class="ax" x="0" y="${y+26}" style="text-anchor:start">${en}</text>`;
  lab(14,"English","months");lab(56,"ગુજરાતી","amanta months");lab(98,"સુદ / વદ","bright / dark half");lab(130,"ઉત્સવ","festivals");
  // English months
  let cur=null,st=0;for(let i=0;i<=days;i++){const d=new Date(a.getTime()+i*864e5),k=d.getMonth();if(k!==cur||i===days){if(cur!==null){const x0=X(st),x1=X(i);s+=`<rect x="${x0+.5}" y="14" width="${x1-x0-1}" height="26" rx="4" fill="color-mix(in srgb,var(--ink) ${cur%2?7:12}%,var(--surface))"/>${x1-x0>30?`<text class="seg" x="${(x0+x1)/2}" y="27">${new Date(2000,cur,1).toLocaleDateString("en-GB",{month:"short"})}</text>`:""}`}cur=k;st=i}}
  // Gujarati months + sud/vad + festivals
  cur=null;st=0;let curAdh=false;const marks=[];
  for(let i=0;i<=days;i++){const d=new Date(a.getTime()+i*864e5),P=O.pan(d)||{m:-1,t:0,adh:false};
    if(P.m!==cur||P.adh!==curAdh||i===days){if(cur!==null&&cur>=0){const x0=X(st),x1=X(i);s+=`<rect x="${x0+.5}" y="56" width="${x1-x0-1}" height="26" rx="4" fill="color-mix(in srgb,var(--saffron) ${cur%2?14:24}%,var(--surface))"/><text class="seg" x="${(x0+x1)/2}" y="69">${curAdh?"અ. ":""}${MON[cur]}</text>`}cur=P.m;curAdh=P.adh;st=i}
    if(i<days){s+=`<rect x="${X(i)}" y="98" width="${X(i+1)-X(i)+.2}" height="18" fill="${P.t<=15?"color-mix(in srgb,#ffd43b 45%,var(--surface))":"color-mix(in srgb,#364fc7 30%,var(--surface))"}"/>`;
      if(P.t===15)s+=`<circle cx="${X(i+.5)}" cy="107" r="4" fill="#fff8db" stroke="#e8b923"/>`;if(P.t===30)s+=`<circle cx="${X(i+.5)}" cy="107" r="4" fill="#1b1f3b"/>`;
      for(const f of FEST)if(!P.adh&&f[0]===P.m&&f[1]===P.t)marks.push([i,f[2],f[3]]);
      for(const e of (O.life||[]))if(!P.adh&&e.m===P.m&&e.n===P.t&&!FEST.some(f=>f[0]===e.m&&f[1]===e.n)){if(!marks.some(x=>x[0]===i))marks.push([i,e.gu.split(" ").slice(0,3).join(" "),e.t])}}}
  const ends=[-1e9,-1e9,-1e9,-1e9,-1e9];marks.sort((a,b)=>a[0]-b[0]).forEach(([i,g,e])=>{const x=X(i+.5),w=g.length*6.2+10;let k=ends.findIndex(v=>v<x-w/2);if(k<0)k=ends.indexOf(Math.min(...ends));ends[k]=x+w/2;const y=136+k*15;
    s+=`<line x1="${x}" x2="${x}" y1="118" y2="${y-7}" stroke="var(--saffron)" stroke-width=".8" opacity=".7"/><circle cx="${x}" cy="118" r="3" fill="var(--saffron)"/><text class="seg" x="${x}" y="${y}" style="font-size:9.5px"><title>${e}</title>${g}</text>`});
  const ti=Math.round((today-a)/864e5),xn=X(ti+.5);s+=`<g class="now"><line x1="${xn}" x2="${xn}" y1="8" y2="122"/><text x="${xn}" y="6" style="text-anchor:${xn>W-60?"end":xn<L+40?"start":"middle"}">today</text></g>`;
  el.innerHTML=`<div class="rb"><div class="scroll"><div style="min-width:880px">${s}</svg></div></div>
   <div class="key"><span><i style="background:color-mix(in srgb,#ffd43b 45%,var(--surface))"></i>sud (waxing moon)</span><span><i style="background:color-mix(in srgb,#364fc7 30%,var(--surface))"></i>vad (waning moon)</span><span>○ purnima</span><span>● amas</span><span>Vikram Samvat ${gu(vs)}: ${a.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})} to ${new Date(b-864e5).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})} · ${days} days${days>370?" (with an adhik month)":""}</span></div></div>`}
/* ---------- insight cards ---------- */
function insights(el){
  const now=new Date(),tz=O.tz(),H=hday(now),dl=H.set-H.rise,t=tithiAt(now.getTime());
  const P=O.pan(H.D),c=[];
  const dg=dl/1440e3;c.push(["દિનમાન · Daylight",`${gu(dg.toFixed(1))} ઘડી <small>= ${dur(dl)}</small>`,
    `${dg<30?`${gu((30-dg).toFixed(1))} ghadi (${dur((30-dg)*1440e3)}) shorter`:`${gu((dg-30).toFixed(1))} ghadi (${dur((dg-30)*1440e3)}) longer`} than at the equinox, when day and night are 30 ghadi each.`,dg/60]);
  if(t){const nxt=t.n%30+1,mC=P?(t.n<P.t-2?(P.m+1)%12:P.m):null,mN=mC!=null?(t.n===30?(mC+1)%12:mC):null;
    c.push(["તિથિ · Lunar day",`${mC!=null?MON[mC]+" ":""}${tname(t.n)}`,`Began ${fmt(new Date(t.start),tz)}${new Date(t.start).getDate()!==now.getDate()?" yesterday":""}, ends ${fmt(new Date(t.end),tz)}${new Date(t.end).getDate()!==now.getDate()?" tomorrow":""}. It lasts ${dur(t.end-t.start)}; a clock day is always 24 h. Next: ${mN!=null?MON[mN]+" ":""}${tname(nxt)}.`,(now-t.start)/(t.end-t.start)])}
  const before=now<new Date(midnight(now,tz).getTime()+0)||false;
  const civ=parts(now,tz),civWd=new Date(civ.year,civ.month-1,civ.day).getDay(),hwd=H.D.getDay();
  c.push(["તારીખ અને વાર · Date and vaar",civWd===hwd?`${VAAR[hwd]} <small>= ${VAAR_EN[civWd]}</small>`:`${VAAR[hwd]} <small>but the clock says ${VAAR_EN[civWd]}</small>`,
    civWd===hwd?`The English date began at midnight; the vaar began at sunrise (${fmt(H.rise,tz)}), ${dur(H.rise-midnight(H.rise,tz))} later. Tonight after midnight the date changes, but the vaar stays ${VAAR[hwd]} until sunrise.`:
    `It is past midnight, so the English date has moved on, but the Vedic day is still ${VAAR[hwd]} until sunrise at ${fmt(H.next,tz)}.`,(now-H.rise)/(H.next-H.rise)]);
  // next purnima and amas
  if(t){const nx=k=>{for(let i=t.i;i<t.i+31;i++)if(tnum(i)===k)return ENDS[i-1];return null};
    const pu=nx(15),am=nx(30),f=d=>new Date(d).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:tz||undefined});
    const first=pu<am?["પૂનમ · Full moon",pu]:["અમાસ · New moon",am];
    c.push([first[0],`${f(first[1])}`,`Begins ${fmt(new Date(first[1]),tz)}, in ${Math.max(0,Math.round((first[1]-now)/864e5))} days. ${pu<am?`The next amas follows on ${f(am)}.`:`The next purnima follows on ${f(pu)}.`} A lunar month is about 29½ days.`,null])}
  // new samvat
  if(P){let d=new Date(H.D),n=0;for(;n<400;n++){d.setDate(d.getDate()+1);const Q=O.pan(d);if(Q&&Q.m===7&&!Q.adh){const pv=O.pan(new Date(d.getTime()-864e5));if(pv&&pv.m!==7)break}}
    const vsNow=P.m>=7?(H.D.getMonth()>=8?H.D.getFullYear()+57:H.D.getFullYear()+56):H.D.getFullYear()+56;
    c.push(["સંવત · Year",`વિ. સં. ${gu(vsNow)} <small>= ${H.D.getFullYear()} CE</small>`,`Vikram Samvat ${vsNow+1} begins ${n===0?"tomorrow":`in ${n+1} days`}, on ${d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})} (Bestu varas). The Gujarati year runs ${vsNow-H.D.getFullYear()} years ahead of CE.`,null])}
  c.push(["એક વિપળ · One vipal","૦.૪ s <small>≈ one blink</small>","60 vipal = 1 pal (24 s), 60 pal = 1 ghadi (24 min), 60 ghadi = 1 day. So 2½ ghadi make an hour, and a minute is 2½ pal.",null]);
  el.innerHTML=`<div class="ins">${c.map(([k,v,p,b])=>`<div class="ic"><div class="k">${k}</div><div class="v">${v}</div><p>${p}</p>${b!=null?`<div class="bar"><i style="width:${(Math.max(0,Math.min(1,b))*100).toFixed(1)}%"></i></div>`:""}</div>`).join("")}</div>`}
function init(o){css();O=o;
  return fetch(o.root+"data/home/tithi_ends.json").then(r=>r.json()).then(j=>{const base=Date.parse(j.base);let acc=0;ENDS=j.e.map(d=>base+(acc+=d)*60000);T0=j.t0})}
return {init,day,year,insights};})();
