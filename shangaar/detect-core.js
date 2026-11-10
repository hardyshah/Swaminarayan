/* Shangaar photo analyser: label set + post-processing for OWLv2 zero-shot boxes.
   Shared by the page (browser) and the test harness (node). No DOM use here. */
(function(root){
const ITEMS=[
 // key, Gujarati, English name, detector prompts, min score, zone, max count
 {k:"pagh",gu:"પાઘ",en:"Pagh (turban)",q:["turban","cloth turban with folds"],min:.16,zone:"head",max:1,grp:"head"},
 {k:"mugat",gu:"મુગટ",en:"Mugat (crown)",q:["golden crown","jeweled crown"],min:.16,zone:"head",max:1,grp:"head"},
 {k:"topi",gu:"ટોપી",en:"Topi (cap)",q:["cap"],min:.16,zone:"head",max:1,grp:"head"},
 {k:"kalgi",gu:"કલગી",en:"Kalgi / sirpech (turban plume)",q:["feather plume","turban ornament brooch"],min:.17,zone:"headtop",max:3},
 {k:"morpankh",gu:"મોરપીંછ",en:"Mor-pankh (peacock feather)",q:["peacock feather"],min:.22,zone:"any",max:4},
 {k:"tora",gu:"તોરા",en:"Tora (hanging strings by the face)",q:["strings of pearls hanging","hanging jasmine flower strands"],min:.17,zone:"faceside",max:2},
 {k:"kundal",gu:"કુંડળ",en:"Kundal (earring)",q:["earring"],min:.12,zone:"ear",max:2},
 {k:"tilak",gu:"તિલક ચાંદલો",en:"Tilak-chandlo",q:["red dot on forehead","tilak mark"],min:.14,zone:"forehead",max:1},
 {k:"haar",gu:"હાર",en:"Haar (jewelled necklace)",q:["gold necklace","necklace"],min:.18,zone:"chest",max:4},
 {k:"motimala",gu:"મોતીની માળા",en:"Moti mala (pearl strand)",q:["pearl necklace"],min:.2,zone:"chest",max:3},
 {k:"phoolhaar",gu:"ફૂલહાર",en:"Phool haar (flower garland)",q:["flower garland","marigold garland","rose garland"],min:.16,zone:"body",max:4},
 {k:"gajra",gu:"ગજરો",en:"Gajra (jasmine strand)",q:["white jasmine garland"],min:.2,zone:"body",max:3},
 {k:"gulab",gu:"ગુલાબ",en:"Gulab (rose)",q:["rose flower"],min:.24,zone:"any",max:8},
 {k:"bajubandh",gu:"બાજુબંધ",en:"Bajubandh (armlet)",q:["armlet","arm band jewelry"],min:.17,zone:"body",max:2},
 {k:"kada",gu:"કડાં",en:"Kada (bangle / wrist ornament)",q:["bracelet","bangle"],min:.22,zone:"body",max:4},
 {k:"veenti",gu:"વીંટી",en:"Veenti (ring)",q:["finger ring"],min:.22,zone:"body",max:4},
 {k:"bansuri",gu:"વાંસળી",en:"Bansuri (flute)",q:["flute"],min:.2,zone:"any",max:1},
 {k:"khes",gu:"ખેસ / શાલ",en:"Khes / shawl",q:["shawl","stole draped over shoulder"],min:.22,zone:"body",max:1},
 {k:"jama",gu:"જામો",en:"Jama / angarkhu (upper garment)",q:["embroidered coat","tunic"],min:.2,zone:"body",max:1},
 {k:"ghero",gu:"ઘેરો",en:"Ghero (flared skirt of the vagha)",q:["flared skirt"],min:.22,zone:"lower",max:1},
 {k:"zanzar",gu:"ઝાંઝર",en:"Zanzar / nupur (anklet)",q:["anklet"],min:.2,zone:"lower",max:2},
 {k:"prabha",gu:"પ્રભા",en:"Prabha (halo behind the murti)",q:["halo","golden sunburst halo"],min:.2,zone:"behind",max:1},
 {k:"chhatra",gu:"છત્ર",en:"Chhatra (canopy umbrella)",q:["small umbrella canopy"],min:.22,zone:"any",max:2},
];
const FACE_Q=["face of a statue","face"];
function prompts(){const p=[...FACE_Q];ITEMS.forEach(it=>it.q.forEach(q=>p.push(q)));return p}
const iou=(a,b)=>{const x1=Math.max(a.xmin,b.xmin),y1=Math.max(a.ymin,b.ymin),x2=Math.min(a.xmax,b.xmax),y2=Math.min(a.ymax,b.ymax);
 const i=Math.max(0,x2-x1)*Math.max(0,y2-y1),u=(a.xmax-a.xmin)*(a.ymax-a.ymin)+(b.xmax-b.xmin)*(b.ymax-b.ymin)-i;return u>0?i/u:0};
const inside=(a,b)=>{const x1=Math.max(a.xmin,b.xmin),y1=Math.max(a.ymin,b.ymin),x2=Math.min(a.xmax,b.xmax),y2=Math.min(a.ymax,b.ymax);
 const i=Math.max(0,x2-x1)*Math.max(0,y2-y1);return i/Math.max(1,(a.xmax-a.xmin)*(a.ymax-a.ymin))};
/* zone test relative to the face box f (x0,y0,x1,y1, width w, height h) */
function zoneOK(z,b,f,W,H){
 if(!f||z==="any")return true;
 const w=f.xmax-f.xmin,h=f.ymax-f.ymin,cx=(b.xmin+b.xmax)/2,cy=(b.ymin+b.ymax)/2,fcx=(f.xmin+f.xmax)/2;
 const bw=b.xmax-b.xmin,bh=b.ymax-b.ymin;
 switch(z){
  case"head":return cy<f.ymin+h*.45&&b.ymin<f.ymin+h*.2&&cx>f.xmin-w*.6&&cx<f.xmax+w*.6&&bw>w*.5&&bw<w*3.5;
  case"headtop":return cy<f.ymin+h*.25&&cy>f.ymin-h*2.2&&cx>f.xmin-w*1.2&&cx<f.xmax+w*1.2&&bw<w*.9;
  case"faceside":return cy>f.ymin-h*.2&&cy<f.ymax+h*.6&&(cx<f.xmin+w*.15||cx>f.xmax-w*.15)&&Math.abs(cx-fcx)<w*1.5&&bw<w*1.1;
  case"ear":return cy>f.ymin+h*.25&&cy<f.ymax+h*.45&&Math.abs(cx-fcx)>w*.28&&Math.abs(cx-fcx)<w*1.0&&bw<w*.6;
  case"forehead":return cy>f.ymin-h*.1&&cy<f.ymin+h*.45&&Math.abs(cx-fcx)<w*.25&&bw<w*.5;
  case"chest":return cy>f.ymax-h*.1&&cy<f.ymax+h*3.2&&Math.abs(cx-fcx)<w*1.6&&bw<w*3.5;
  case"body":return cy>f.ymax-h*.3;
  case"lower":return cy>f.ymax+h*2.2||cy>H*.6;
  case"behind":return bw>w*1.4&&b.ymin<f.ymin&&b.ymax>f.ymin;
 }return true}
function nms(list,thr){list.sort((a,b)=>b.score-a.score);const out=[];for(const d of list){if(out.every(o=>iou(o.box,d.box)<thr))out.push(d)}return out}
/* raw: [{label(prompt),score,box}] from the detector. Returns {face, items:[{k,gu,en,score,box}]} */
function post(raw,W,H,opts={}){
 const faces=raw.filter(r=>FACE_Q.includes(r.label)).sort((a,b)=>b.score-a.score);
 let face=opts.face||null,faceSrc=face?(opts.faceSrc||"eyes"):null;
 if(!face){const f=faces.find(r=>{const b=r.box,bw=b.xmax-b.xmin,bh=b.ymax-b.ymin;return r.score>.1&&bw<W*.55&&bh<H*.5&&bw/bh>.55&&bw/bh<1.7});if(f){face=f.box;faceSrc="detector"}}
 const byPrompt=new Map();ITEMS.forEach(it=>it.q.forEach(q=>byPrompt.set(q,it)));
 let cands=[];
 for(const r of raw){const it=byPrompt.get(r.label);if(!it)continue;
  const b={xmin:Math.max(0,r.box.xmin),ymin:Math.max(0,r.box.ymin),xmax:Math.min(W,r.box.xmax),ymax:Math.min(H,r.box.ymax)};
  if(r.score<it.min*(opts.sens||1))continue;
  const area=(b.xmax-b.xmin)*(b.ymax-b.ymin);if(area>W*H*.6&&it.k!=="prabha"&&it.k!=="ghero"&&it.k!=="jama")continue;
  if(face&&!zoneOK(it.zone,b,face,W,H))continue;
  if(face&&it.k!=="prabha"&&it.k!=="tilak"&&inside(face,b)>.8&&(b.xmax-b.xmin)<(face.xmax-face.xmin)*1.3&&["haar","kundal","kada","veenti","gulab"].includes(it.k))continue;
  cands.push({k:it.k,gu:it.gu,en:it.en,score:r.score,box:b,grp:it.grp||it.k})}
 // within one item kind: NMS
 const kinds={};cands.forEach(c=>(kinds[c.k]=kinds[c.k]||[]).push(c));
 let kept=[];for(const k in kinds){const it=ITEMS.find(i=>i.k===k);kept.push(...nms(kinds[k],.35).slice(0,it.max))}
 // one head-dress: every murti in darshan wears one, so when the face is known we always look in the region above it.
 kept=kept.filter(c=>c.grp!=="head");
 if(face){const w=face.xmax-face.xmin,h=face.ymax-face.ymin,fcx=(face.xmin+face.xmax)/2;
  const R={xmin:Math.max(0,fcx-w*1.2),xmax:Math.min(W,fcx+w*1.2),ymin:Math.max(0,face.ymin-h*1.7),ymax:face.ymin+h*.3};
  const vote={pagh:0,mugat:0,topi:0};let box=null,bs=0;
  for(const r of raw){const it=byPrompt.get(r.label);if(!it||(it.grp!=="head"&&it.k!=="kalgi"))continue;
   const b=r.box,bw=b.xmax-b.xmin;if(bw<w*.55||bw>w*3.2)continue;
   const ia=Math.max(0,Math.min(b.xmax,R.xmax)-Math.max(b.xmin,R.xmin))*Math.max(0,Math.min(b.ymax,R.ymax)-Math.max(b.ymin,R.ymin));
   if(ia/((b.xmax-b.xmin)*(b.ymax-b.ymin))<.55)continue;
   if(it.grp==="head")vote[it.k]=Math.max(vote[it.k],r.score);
   if(r.score>bs){bs=r.score;box={xmin:Math.max(0,b.xmin),ymin:Math.max(0,b.ymin),xmax:Math.min(W,b.xmax),ymax:Math.min(H,b.ymax)}}}
  if(!box||R.ymax-R.ymin<h*.3){box=box||{xmin:fcx-w*.7,xmax:fcx+w*.7,ymin:Math.max(0,face.ymin-h*.9),ymax:face.ymin+h*.25};bs=bs||.1}
  let k=Object.keys(vote).sort((a,b)=>vote[b]-vote[a])[0];if(!vote[k])k="pagh";
  // colour check: a mugat is mostly gold or silver metal, a pagh is mostly cloth
  let metal=null;if(opts.metal){metal=opts.metal(box);if(k!=="topi"){if(metal>.42)k="mugat";else if(metal<.22)k="pagh"}}
  const it=ITEMS.find(i=>i.k===k);
  kept.push({k,gu:it.gu,en:it.en,score:Math.max(bs,vote[k]),box,grp:"head",sure:vote[k]>.15&&(metal==null||metal>.5||metal<.15),metal});
  // a kalgi box that is really the whole head-dress is dropped
  kept=kept.filter(c=>c.k!=="kalgi"||iou(c.box,box)<.45)}
 // cross-kind: same region claimed twice -> keep the higher score
 kept.sort((a,b)=>b.score-a.score);const fin=[];
 kept.sort((a,b)=>(b.grp==="head")-(a.grp==="head"));
 for(const c of kept){if(c.grp==="head"||fin.every(o=>iou(o.box,c.box)<.6))fin.push(c)}
 fin.sort((a,b)=>(a.box.ymin-b.box.ymin));return {face,faceSrc,items:fin}
}
/* fraction of gold / silver looking pixels inside a box; px = RGBA array of an image W x H */
function metalFrac(px,W,H,b){let n=0,m=0;const st=Math.max(1,Math.round(Math.sqrt((b.xmax-b.xmin)*(b.ymax-b.ymin)/4000)));
 for(let y=Math.max(0,b.ymin|0);y<Math.min(H,b.ymax);y+=st)for(let x=Math.max(0,b.xmin|0);x<Math.min(W,b.xmax);x+=st){const i=((y|0)*W+(x|0))*4,r=px[i]/255,g=px[i+1]/255,bl=px[i+2]/255;
  const mx=Math.max(r,g,bl),mn=Math.min(r,g,bl),d=mx-mn,s=mx?d/mx:0;let hu=0;if(d){if(mx===r)hu=((g-bl)/d+6)%6;else if(mx===g)hu=(bl-r)/d+2;else hu=(r-g)/d+4;hu*=60}
  n++;let tex=0;const j=i+4*st*(W+1);if(j<px.length-3){tex=Math.abs((px[j]+px[j+1]+px[j+2])-(px[i]+px[i+1]+px[i+2]))/765}
  if((hu>=30&&hu<=56&&s>.35&&mx>.45&&tex>.06)||(s<.12&&mx>.6&&tex>.16))m++}
 return n?m/n:0}
root.SHANGAAR_DETECT={metalFrac,ITEMS,FACE_Q,prompts,post,iou};
})(typeof window!=="undefined"?window:globalThis);
