/* Shangaar designer: draws a layered, flat murti figure as SVG from a state object.
   viewBox 0 0 400 600. Murti faces the viewer; "murti's right" is the viewer's left. */
(function(root){
"use strict";
const MURTIS=[
 {k:"ghanshyam",gu:"શ્રી ઘનશ્યામ મહારાજ",en:"Shri Ghanshyam Maharaj",where:"Rangmahol, Kalupur mandir, Ahmedabad",skin:"fair",pose:"abhay",preset:"rangmahol"},
 {k:"gopinathji",gu:"શ્રી ગોપીનાથજી મહારાજ",en:"Shri Gopinathji Maharaj",where:"Gadhada (Gadhpur)",skin:"dark",pose:"bansuri",preset:"nitya"},
 {k:"harikrishna",gu:"શ્રી હરિકૃષ્ણ મહારાજ",en:"Shri Harikrishna Maharaj",where:"Vadtal",skin:"dark",pose:"abhay",preset:"utsav"},
 {k:"radhakrishna",gu:"શ્રી રાધાકૃષ્ણ દેવ",en:"Shri Radha Krishna Dev",where:"Kalupur, Vadtal, Bhuj and others",skin:"dark",pose:"bansuri",preset:"phool"},
 {k:"madanmohan",gu:"શ્રી મદનમોહનજી",en:"Shri Madan Mohanji",where:"Dholera",skin:"dark",pose:"bansuri",preset:"shiyala"},
 {k:"bal",gu:"બાળ સ્વરૂપ ઘનશ્યામ",en:"Bal swaroop Ghanshyam",where:"child form, as in Chhapaiya pictures",skin:"fair",pose:"abhay",preset:"chandan",child:true},
];
const SKIN={dark:{b:"#1a1a20",h:"#3b3b46",line:"#000"},fair:{b:"#e7b48a",h:"#f6cfae",line:"#a8714a"},gold:{b:"#cf9a3a",h:"#f3cf72",line:"#8a6216"}};
/* Every option the designer offers. n = name used in the item list / analyser vocabulary. */
const OPT={
 head:[
  {k:"pankho",gu:"પંખા પાઘ",en:"Pankho pagh (fan pagh)"},
  {k:"cross",gu:"ચોકડી પાઘ",en:"Cross-band pagh (Rangmahol style)"},
  {k:"zari",gu:"જરીની પાઘ",en:"Zari pagh with turra"},
  {k:"safo",gu:"સફેદ સાફો",en:"White safo"},
  {k:"mor",gu:"મોર પાઘ",en:"Pagh with peacock crest"},
  {k:"mugat",gu:"સોનાનો મુગટ",en:"Gold mugat"},
  {k:"mugatS",gu:"ચાંદીનો મુગટ",en:"Silver mugat"},
  {k:"phoolmugat",gu:"ફૂલનો મુગટ",en:"Phool mugat (flower crown)"},
  {k:"topi",gu:"ટોપી",en:"Topi (night cap)"}],
 kalgi:[{k:"none",gu:"નહિ",en:"None"},{k:"plume",gu:"કલગી",en:"Kalgi plume"},{k:"peacock",gu:"મોરપીંછ",en:"Peacock feather"},{k:"sirpech",gu:"સિરપેચ",en:"Jewel sirpech"}],
 tora:[{k:"none",gu:"નહિ",en:"None"},{k:"moti",gu:"મોતીના તોરા",en:"Pearl tora"},{k:"mogra",gu:"મોગરાના તોરા",en:"Jasmine tora"},{k:"genda",gu:"ગલગોટાના તોરા",en:"Marigold tora"}],
 vagha:[{k:"jama",gu:"જામો ને સુરવાળ",en:"Jama and suruval"},{k:"ghero",gu:"ઘેરદાર વાઘા",en:"Gherdar vagha (flared)"},{k:"dhoti",gu:"ધોતી ને ઉપરણું",en:"Dhoti and uparnu"},{k:"angarkhu",gu:"અંગરખું",en:"Angarkhu (wrap coat)"}],
 khes:[{k:"none",gu:"નહિ",en:"None"},{k:"khes",gu:"ખેસ",en:"Khes over the shoulder"},{k:"shaal",gu:"શાલ",en:"Shaal (winter shawl)"},{k:"chandan",gu:"ચંદન",en:"Chandan (sandal paste)"}],
 kundal:[{k:"none",gu:"નહિ",en:"None"},{k:"makar",gu:"મકરાકૃતિ કુંડળ",en:"Makar kundal"},{k:"mor",gu:"મોર કુંડળ",en:"Peacock kundal"},{k:"gol",gu:"ગોળ કુંડળ",en:"Round kundal"}],
 garland:[{k:"genda",gu:"ગલગોટા",en:"Marigold"},{k:"gulab",gu:"ગુલાબ",en:"Rose"},{k:"mogra",gu:"મોગરો",en:"Jasmine"},{k:"mix",gu:"મિશ્ર",en:"Mixed"},{k:"tulsi",gu:"તુલસી",en:"Tulsi"}],
 prabha:[{k:"none",gu:"નહિ",en:"None"},{k:"surya",gu:"સૂર્ય પ્રભા",en:"Sunburst prabha"},{k:"arch",gu:"પરિકર",en:"Arched parikar"}],
 hand:[{k:"none",gu:"નહિ",en:"Nothing"},{k:"rumal",gu:"રૂમાલ",en:"Rumal"},{k:"kamal",gu:"કમળ",en:"Lotus"},{k:"gulab",gu:"ગુલાબ",en:"Rose"}],
};
const ORN=[ // toggles with Gujarati names; c = how many pieces it counts as
 {k:"tilak",gu:"તિલક ચાંદલો",en:"Tilak-chandlo",c:1},
 {k:"kanthi",gu:"કંઠી",en:"Kanthi (tulsi bead collar)",c:1},
 {k:"haar",gu:"હાર",en:"Haar (jewelled necklace)",c:"haarN"},
 {k:"moti",gu:"મોતીની માળા",en:"Moti mala (long pearl strand)",c:1},
 {k:"bajubandh",gu:"બાજુબંધ",en:"Bajubandh (armlets)",c:2},
 {k:"kada",gu:"કડાં",en:"Kada (wrist bangles)",c:2},
 {k:"veenti",gu:"વીંટી",en:"Veenti (ring)",c:1},
 {k:"kandoro",gu:"કંદોરો",en:"Kandoro (waist chain)",c:1},
 {k:"zanzar",gu:"ઝાંઝર",en:"Zanzar (anklets)",c:2},
 {k:"gajra",gu:"ગજરા",en:"Gajra (wrist flower bands)",c:2},
 {k:"chhatra",gu:"છત્ર",en:"Chhatra (canopy)",c:1},
];
const PRESETS={
 nitya:{gu:"નિત્ય શણગાર",en:"Daily (nitya)",s:{head:"pankho",kalgi:"sirpech",tora:"moti",vagha:"jama",khes:"khes",kundal:"makar",garland:"genda",garN:1,haarN:2,prabha:"arch",hand:"none",
  c:{head:"#c2185b",head2:"#f4c430",upper:"#c2185b",lower:"#f8e1ec",zari:"#e8b923",khes:"#f4c430",bg:"#f6e7c8"},orn:{tilak:1,kanthi:1,haar:1,moti:0,bajubandh:1,kada:1,veenti:0,kandoro:1,zanzar:1,gajra:0,chhatra:0}}},
 rangmahol:{gu:"રંગમહોલ દર્શન",en:"Rangmahol style",s:{head:"cross",kalgi:"plume",tora:"mogra",vagha:"ghero",khes:"none",kundal:"gol",garland:"gulab",garN:2,haarN:3,prabha:"none",hand:"rumal",
  c:{head:"#d32f2f",head2:"#ffffff",upper:"#ffffff",lower:"#ffffff",zari:"#d4a017",khes:"#d32f2f",bg:"#f3d27a"},orn:{tilak:1,kanthi:1,haar:1,moti:1,bajubandh:1,kada:1,veenti:1,kandoro:1,zanzar:1,gajra:0,chhatra:1}}},
 utsav:{gu:"ઉત્સવ (મુગટ)",en:"Utsav (festival mugat)",s:{head:"mugat",kalgi:"peacock",tora:"moti",vagha:"angarkhu",khes:"khes",kundal:"mor",garland:"mix",garN:2,haarN:4,prabha:"surya",hand:"kamal",
  c:{head:"#e0a526",head2:"#c62828",upper:"#6a1b9a",lower:"#fff3c4",zari:"#e8b923",khes:"#ff8f00",bg:"#2b1a3d"},orn:{tilak:1,kanthi:1,haar:1,moti:1,bajubandh:1,kada:1,veenti:1,kandoro:1,zanzar:1,gajra:0,chhatra:1}}},
 phool:{gu:"ફૂલ શણગાર",en:"Phool shangaar (flowers)",s:{head:"phoolmugat",kalgi:"none",tora:"mogra",vagha:"jama",khes:"none",kundal:"gol",garland:"mix",garN:4,haarN:1,prabha:"arch",hand:"gulab",
  c:{head:"#f06292",head2:"#ffffff",upper:"#fce4ec",lower:"#fff8e1",zari:"#f48fb1",khes:"#ffffff",bg:"#e8f5e9"},orn:{tilak:1,kanthi:1,haar:1,moti:0,bajubandh:0,kada:0,veenti:0,kandoro:0,zanzar:1,gajra:1,chhatra:0}}},
 chandan:{gu:"ચંદનના વાઘા",en:"Chandan vagha (summer)",s:{head:"safo",kalgi:"none",tora:"mogra",vagha:"dhoti",khes:"chandan",kundal:"gol",garland:"mogra",garN:2,haarN:1,prabha:"none",hand:"kamal",
  c:{head:"#fffaf0",head2:"#e6c79c",upper:"#f3dcb6",lower:"#fffaf0",zari:"#d9b26f",khes:"#e6c79c",bg:"#fdf6e3"},orn:{tilak:1,kanthi:1,haar:0,moti:1,bajubandh:0,kada:0,veenti:0,kandoro:0,zanzar:0,gajra:1,chhatra:0}}},
 shiyala:{gu:"શિયાળાના વાઘા",en:"Winter (shiyala)",s:{head:"zari",kalgi:"plume",tora:"none",vagha:"angarkhu",khes:"shaal",kundal:"makar",garland:"genda",garN:1,haarN:2,prabha:"arch",hand:"none",
  c:{head:"#1a237e",head2:"#e8b923",upper:"#283593",lower:"#c5cae9",zari:"#e8b923",khes:"#8e0000",bg:"#efe6d8"},orn:{tilak:1,kanthi:1,haar:1,moti:0,bajubandh:1,kada:1,veenti:1,kandoro:1,zanzar:1,gajra:0,chhatra:0}}},
 ratri:{gu:"રાત્રિના વાઘા",en:"Night (shayan)",s:{head:"topi",kalgi:"none",tora:"none",vagha:"dhoti",khes:"shaal",kundal:"none",garland:"tulsi",garN:0,haarN:0,prabha:"none",hand:"none",
  c:{head:"#7e57c2",head2:"#ffffff",upper:"#ede7f6",lower:"#ffffff",zari:"#b39ddb",khes:"#5e35b1",bg:"#1d2340"},orn:{tilak:1,kanthi:1,haar:0,moti:0,bajubandh:0,kada:0,veenti:0,kandoro:0,zanzar:0,gajra:0,chhatra:0}}},
};
const PAL=[["કેસરી","Kesari","#f57c00"],["લાલ","Lal","#c62828"],["ગુલાબી","Gulabi","#e91e63"],["રાણી","Rani","#c2185b"],["પીળો","Pilo","#f4c430"],["સોનેરી","Soneri","#d4a017"],
 ["લીલો","Lilo","#2e7d32"],["પોપટી","Popti","#7cb342"],["આસમાની","Aasmani","#4fc3f7"],["મોરપીંછ","Morpichh","#00838f"],["વાદળી","Vadli","#1a237e"],["જાંબલી","Jambli","#6a1b9a"],
 ["લવંડર","Lavender","#b39ddb"],["સફેદ","Safed","#ffffff"],["ચંદન","Chandan","#e6c79c"],["કાળો","Kalo","#212121"]];

const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function shade(hex,f){ // f<0 darker, f>0 lighter
 const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;
 if(f<0){r*=1+f;g*=1+f;b*=1+f}else{r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f}
 return"#"+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0")).join("")}
const lum=hex=>{const n=parseInt(hex.slice(1),16);return((n>>16)*.3+((n>>8)&255)*.59+(n&255)*.11)/255};
const GOLD="#e2ad2b",GOLD2="#a8770f",PEARL="#fbf6ea",RUBY="#c2185b",EMER="#1b8a5a";

function beads(path,step,r,fill,stroke){ // dotted beads along an SVG path using dash trick
 return`<path d="${path}" fill="none" stroke="${stroke||shade(fill,-.35)}" stroke-width="${r*2+1.2}" stroke-linecap="round" stroke-dasharray="0 ${step}"/>`+
 `<path d="${path}" fill="none" stroke="${fill}" stroke-width="${r*2}" stroke-linecap="round" stroke-dasharray="0 ${step}"/>`}
function flowerRope(path,kind,width){ // a thick garland
 const w=width||13;
 const col={genda:["#f57c00","#ffb300"],gulab:["#b71c1c","#e53935"],mogra:["#ffffff","#f1efe6"],tulsi:["#2e7d32","#558b2f"],mix:["#f57c00","#ffffff"]}[kind]||["#f57c00","#ffb300"];
 let s=`<path d="${path}" fill="none" stroke="${shade(col[0],-.3)}" stroke-width="${w+2}" stroke-linecap="round"/>`+
 `<path d="${path}" fill="none" stroke="${col[0]}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="0 ${w*.62}"/>`+
 `<path d="${path}" fill="none" stroke="${col[1]}" stroke-width="${w*.62}" stroke-linecap="round" stroke-dasharray="0 ${w*.62}" stroke-dashoffset="${w*.31}"/>`;
 if(kind==="mix")s+=`<path d="${path}" fill="none" stroke="#c2185b" stroke-width="${w*.55}" stroke-linecap="round" stroke-dasharray="0 ${w*1.86}" stroke-dashoffset="${w*.6}"/>`;
 if(kind==="tulsi")s=`<path d="${path}" fill="none" stroke="#1b5e20" stroke-width="${w*.4}"/>`+beads(path,w*.5,w*.22,"#6d4c41");
 return s}

/* ---------- body ---------- */
function body(st,sk,ch){
 const S=SKIN[sk];const s=[];
 // neck
 s.push(`<path d="M186 176 L186 204 L214 204 L214 176Z" fill="${S.b}"/>`);
 // arms (skin) depend on pose
 if(st.pose==="abhay"){
  s.push(`<path d="M128 214 Q104 250 112 284 L134 286 Q132 256 150 232Z" fill="${S.b}"/>`); // right forearm up
  s.push(`<path d="M104 236 Q96 214 104 196 Q110 186 118 192 L122 214 Q130 200 136 206 L132 238 Q122 252 108 246Z" fill="${S.b}" stroke="${S.line}" stroke-width=".8"/>`); // raised palm
  s.push(`<path d="M272 226 Q296 276 290 326 L270 326 Q272 282 256 240Z" fill="${S.b}"/>`); // left arm down
  s.push(`<path d="M270 322 Q268 344 280 350 Q296 348 296 330 L290 318Z" fill="${S.b}" stroke="${S.line}" stroke-width=".8"/>`); // left hand
 }else{ // bansuri: both hands to the murti's right holding the flute
  s.push(`<path d="M132 214 Q112 238 120 262 Q140 266 168 246 L160 230 Q146 238 142 236 Q150 226 152 220Z" fill="${S.b}"/>`);
  s.push(`<path d="M268 222 Q262 250 230 262 Q206 266 196 258 L202 242 Q222 244 246 232Z" fill="${S.b}"/>`);
 }
 // feet
 s.push(`<path d="M168 532 Q160 548 178 552 L196 552 L196 532Z" fill="${S.b}"/><path d="M232 532 Q240 548 222 552 L204 552 L204 532Z" fill="${S.b}"/>`);
 return s.join("")}
function face(st,sk){
 const S=SKIN[sk],s=[];
 s.push(`<ellipse cx="158" cy="140" rx="8" ry="14" fill="${S.b}"/><ellipse cx="242" cy="140" rx="8" ry="14" fill="${S.b}"/>`);
 s.push(`<path d="M200 82 C232 82 246 104 246 138 C246 172 226 192 200 192 C174 192 154 172 154 138 C154 104 168 82 200 82Z" fill="${S.b}"/>`);
 s.push(`<path d="M168 104 Q182 92 200 92" fill="none" stroke="${S.h}" stroke-width="5" stroke-linecap="round" opacity=".55"/>`);
 // brows and big almond murti eyes
 const brow=sk==="dark"?"#000":"#3e2416";
 s.push(`<path d="M166 118 Q180 110 193 117" fill="none" stroke="${brow}" stroke-width="3" stroke-linecap="round"/><path d="M207 117 Q220 110 234 118" fill="none" stroke="${brow}" stroke-width="3" stroke-linecap="round"/>`);
 for(const x of[180,220]){s.push(`<path d="M${x-16} 132 Q${x} 118 ${x+16} 132 Q${x} 144 ${x-16} 132Z" fill="#fff" stroke="${sk==="dark"?"#000":"#5d3a24"}" stroke-width="1.6"/><circle cx="${x}" cy="131.5" r="6.4" fill="#111"/><circle cx="${x+2}" cy="129.5" r="1.8" fill="#fff"/>`)}
 // nose, lips
 s.push(`<path d="M200 136 Q196 154 192 158 Q200 162 208 158 Q204 154 200 136" fill="${sk==="dark"?"#0d0d10":shade(S.b,-.12)}"/>`);
 s.push(`<path d="M186 170 Q200 164 214 170 Q200 182 186 170Z" fill="#e53935" stroke="#8e0000" stroke-width=".8"/>`);
 if(st.orn.tilak){s.push(`<path d="M193 92 L196 118 Q200 122 204 118 L207 92" fill="none" stroke="${sk==="dark"?"#f6e7c8":"#fff3e0"}" stroke-width="3.2" stroke-linecap="round"/><circle cx="200" cy="111" r="3.6" fill="#d50000"/>`)}
 return s.join("")}

/* ---------- vagha (garments) ---------- */
function vagha(st){
 const c=st.c,s=[],up=c.upper,lo=c.lower,z=c.zari,dk=shade(up,-.25);
 const abhay=st.pose==="abhay";
 // sleeves
 const sleeveR=abhay?`M150 208 Q118 214 112 252 L136 258 Q140 236 158 228Z`:`M150 208 Q120 214 118 250 L146 252 Q148 236 160 228Z`;
 const sleeveL=abhay?`M250 208 Q282 214 288 290 L264 292 Q262 250 244 230Z`:`M250 208 Q276 216 262 246 L236 248 Q246 236 240 228Z`;
 if(st.vagha==="ghero"){
  s.push(`<path d="M150 312 Q112 400 96 470 Q200 494 304 470 Q288 400 250 312Z" fill="${lo}" stroke="${shade(lo,-.3)}" stroke-width="1.5"/>`);
  for(let i=0;i<9;i++){const x=150+i*12.5,xb=104+i*24;s.push(`<path d="M${x} 314 L${xb} 474" stroke="${shade(lo,-.18)}" stroke-width="1.2" fill="none"/>`)}
  s.push(`<path d="M96 470 Q200 494 304 470" fill="none" stroke="${z}" stroke-width="7"/><path d="M106 446 Q200 468 294 446" fill="none" stroke="${z}" stroke-width="2.5" stroke-dasharray="4 4"/>`);
  s.push(`<path d="M172 474 L170 534 L196 534 L198 478Z M228 474 L230 534 L204 534 L202 478Z" fill="${lo}" stroke="${shade(lo,-.3)}"/>`); // suruval below
  s.push(`<path d="M168 520 L198 520 M202 520 L232 520" stroke="${z}" stroke-width="4"/>`);
 }else if(st.vagha==="dhoti"){
  s.push(`<path d="M150 312 Q144 420 162 534 L198 534 L200 360 L202 534 L238 534 Q256 420 250 312Z" fill="${lo}" stroke="${shade(lo,-.3)}" stroke-width="1.5"/>`);
  s.push(`<path d="M186 330 Q196 420 190 520 M214 330 Q204 420 210 520" stroke="${shade(lo,-.15)}" fill="none" stroke-width="1.5"/>`);
  s.push(`<path d="M162 528 L198 528 M202 528 L238 528" stroke="${z}" stroke-width="5"/>`);
 }else{ // jama / angarkhu: long coat to the shin, suruval below
  s.push(`<path d="M150 312 Q138 400 140 478 L260 478 Q262 400 250 312Z" fill="${up}" stroke="${dk}" stroke-width="1.5"/>`);
  s.push(`<path d="M140 470 L260 470" stroke="${z}" stroke-width="7"/>`);
  s.push(`<path d="M168 478 L166 534 L196 534 L198 480Z M232 478 L234 534 L204 534 L202 480Z" fill="${lo}" stroke="${shade(lo,-.3)}"/>`);
  s.push(`<path d="M164 524 L198 524 M202 524 L236 524" stroke="${z}" stroke-width="4"/>`);
 }
 // torso
 const torsoCol=st.vagha==="dhoti"?(st.khes==="chandan"?c.khes:up):up;
 s.push(`<path d="M152 200 Q200 192 248 200 Q262 206 258 230 Q252 270 252 316 L148 316 Q148 270 142 230 Q138 206 152 200Z" fill="${torsoCol}" stroke="${shade(torsoCol,-.25)}" stroke-width="1.5"/>`);
 if(st.vagha==="angarkhu")s.push(`<path d="M186 204 Q228 252 240 316" fill="none" stroke="${z}" stroke-width="5"/><path d="M186 204 Q228 252 240 316" fill="none" stroke="${shade(z,.4)}" stroke-width="1.2" stroke-dasharray="3 3"/>`);
 else s.push(`<path d="M186 202 Q200 214 214 202" fill="none" stroke="${z}" stroke-width="5"/>`);
 s.push(`<path d="${sleeveR}" fill="${up}" stroke="${dk}" stroke-width="1.3"/><path d="${sleeveL}" fill="${up}" stroke="${dk}" stroke-width="1.3"/>`);
 // zari cuffs
 if(abhay)s.push(`<path d="M112 250 L137 256" stroke="${z}" stroke-width="5"/><path d="M264 290 L288 288" stroke="${z}" stroke-width="5"/>`);
 else s.push(`<path d="M118 248 L146 250" stroke="${z}" stroke-width="5"/><path d="M236 246 L262 244" stroke="${z}" stroke-width="5"/>`);
 // waist sash (kamar patto)
 s.push(`<path d="M146 306 Q200 318 254 306 L254 322 Q200 334 146 322Z" fill="${z}" stroke="${GOLD2}"/>`);
 s.push(`<path d="M200 326 L192 372 L208 372Z" fill="${z}" stroke="${GOLD2}"/>`);
 return s.join("")}
function khes(st){
 const c=st.c.khes;
 if(st.khes==="khes")return`<path d="M150 202 Q138 218 142 260 L132 340 L152 342 L160 262 Q166 228 190 206Z" fill="${c}" stroke="${shade(c,-.3)}" stroke-width="1.3"/><path d="M134 334 L152 336" stroke="${st.c.zari}" stroke-width="5"/><path d="M250 202 Q262 218 258 260 L268 340 L248 342 L240 262 Q234 228 210 206Z" fill="${c}" stroke="${shade(c,-.3)}" stroke-width="1.3"/><path d="M266 334 L248 336" stroke="${st.c.zari}" stroke-width="5"/>`;
 if(st.khes==="shaal")return`<path d="M146 200 Q200 186 254 200 Q274 220 270 300 Q232 270 200 268 Q168 270 130 300 Q126 220 146 200Z" fill="${c}" stroke="${shade(c,-.35)}" stroke-width="1.5"/><path d="M130 300 Q168 270 200 268 Q232 270 270 300" fill="none" stroke="${st.c.zari}" stroke-width="5"/><path d="M134 290 Q168 262 200 260 Q232 262 266 290" fill="none" stroke="${shade(c,.35)}" stroke-width="1.2" stroke-dasharray="2 4"/>`;
 if(st.khes==="chandan")return`<g opacity=".9"><path d="M168 220 Q200 232 232 220 M160 250 Q200 262 240 250 M164 280 Q200 290 236 280" fill="none" stroke="${shade(c,-.15)}" stroke-width="2.2" stroke-dasharray="1 6" stroke-linecap="round"/></g>`;
 return""}

/* ---------- head-dress ---------- */
function headdress(st){
 const a=st.c.head,b=st.c.head2,s=[];
 const band=(y,col)=>`<path d="M156 ${y} Q200 ${y-14} 244 ${y} L246 ${y+14} Q200 ${y}  154 ${y+14}Z" fill="${col}" stroke="${shade(col,-.35)}" stroke-width="1.2"/>`;
 switch(st.head){
  case"pankho":
   s.push(`<path d="M142 66 Q200 -30 258 66 Z" fill="${b}" stroke="${shade(b,-.35)}" stroke-width="1.5"/>`);
   for(let i=0;i<=10;i++){const t=Math.PI*(i/10),x=200-Math.cos(t)*56,y=66-Math.sin(t)*62;s.push(`<path d="M200 66 L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${shade(b,-.2)}" stroke-width="1.2"/>`)}
   s.push(`<path d="M142 66 Q200 -30 258 66" fill="none" stroke="${a}" stroke-width="5"/>`);
   s.push(`<path d="M150 104 Q148 70 200 60 Q252 70 250 104 Q200 90 150 104Z" fill="${a}" stroke="${shade(a,-.35)}" stroke-width="1.5"/>`);
   for(const y of[72,82,92])s.push(`<path d="M156 ${y+8} Q200 ${y-4} 244 ${y+8}" fill="none" stroke="${shade(a,-.25)}" stroke-width="1.4"/>`);
   s.push(band(98,st.c.zari));break;
  case"cross":
   s.push(`<path d="M150 104 Q140 40 200 30 Q260 40 250 104 Q200 90 150 104Z" fill="${b}" stroke="${shade(b,-.4)}" stroke-width="1.5"/>`);
   s.push(`<path d="M152 92 L238 40 M248 92 L162 40" stroke="${a}" stroke-width="12"/><path d="M152 92 L238 40 M248 92 L162 40" stroke="${shade(a,.35)}" stroke-width="2" stroke-dasharray="3 5"/>`);
   s.push(`<path d="M150 70 Q200 56 250 70" stroke="${a}" stroke-width="9" fill="none"/>`);
   s.push(band(98,st.c.zari));break;
  case"zari":
   s.push(`<path d="M150 104 Q136 52 196 40 Q262 34 256 100 Q200 88 150 104Z" fill="${a}" stroke="${shade(a,-.4)}" stroke-width="1.5"/>`);
   for(let i=0;i<6;i++)s.push(`<path d="M${154+i*6} ${100-i*2} Q${200} ${60-i*3} ${252-i*2} ${58+i*7}" fill="none" stroke="${b}" stroke-width="2.4" opacity=".9"/>`);
   s.push(`<path d="M252 66 Q286 70 280 120 Q272 98 256 88Z" fill="${a}" stroke="${shade(a,-.4)}"/><path d="M262 76 Q280 84 278 110" fill="none" stroke="${b}" stroke-width="2"/>`);
   s.push(band(98,b));break;
  case"safo":
   s.push(`<path d="M148 104 Q132 70 164 52 Q182 30 214 38 Q252 36 256 72 Q262 92 252 104 Q200 90 148 104Z" fill="${a}" stroke="${shade(a,-.3)}" stroke-width="1.5"/>`);
   s.push(`<path d="M160 90 Q176 60 214 54 M168 98 Q196 72 246 70 M180 50 Q206 66 248 84" fill="none" stroke="${shade(a,-.18)}" stroke-width="2"/>`);
   s.push(`<path d="M246 70 Q276 76 270 112 Q260 92 250 88Z" fill="${a}" stroke="${shade(a,-.3)}"/><path d="M252 82 L268 96" stroke="${b}" stroke-width="3"/>`);break;
  case"mor":
   s.push(`<path d="M150 104 Q144 54 200 46 Q256 54 250 104 Q200 90 150 104Z" fill="${a}" stroke="${shade(a,-.35)}" stroke-width="1.5"/>`);
   for(const y of[66,78,90])s.push(`<path d="M154 ${y+8} Q200 ${y-6} 246 ${y+8}" fill="none" stroke="${b}" stroke-width="2"/>`);
   for(let i=-3;i<=3;i++){const x=200+i*15,ty=4+Math.abs(i)*7;s.push(`<path d="M200 54 Q${x-4} ${(54+ty)/2} ${x} ${ty}" stroke="#2e7d32" stroke-width="2" fill="none"/><ellipse cx="${x}" cy="${ty}" rx="6" ry="8" fill="#00838f"/><ellipse cx="${x}" cy="${ty+1}" rx="3.2" ry="4.3" fill="#1a237e"/><circle cx="${x}" cy="${ty+1}" r="1.6" fill="#ffd54f"/>`)}
   s.push(band(98,st.c.zari));break;
  case"mugat":case"mugatS":{
   const g=st.head==="mugat"?GOLD:"#cfd8dc",g2=st.head==="mugat"?GOLD2:"#78909c";
   s.push(`<path d="M150 106 L146 54 L164 70 L172 30 L188 58 L200 12 L212 58 L228 30 L236 70 L254 54 L250 106 Q200 92 150 106Z" fill="${g}" stroke="${g2}" stroke-width="1.6"/>`);
   s.push(`<path d="M152 88 Q200 74 248 88" fill="none" stroke="${g2}" stroke-width="2"/>`);
   for(const [x,y,col] of[[200,50,b],[172,62,EMER],[228,62,EMER],[200,80,b],[162,92,RUBY],[238,92,RUBY]])s.push(`<circle cx="${x}" cy="${y}" r="${x===200?6:4}" fill="${col}" stroke="${g2}" stroke-width="1"/>`);
   s.push(beads("M152 100 Q200 86 248 100",6,2,PEARL,"#bfb59f"));break}
  case"phoolmugat":
   s.push(`<path d="M150 106 Q140 40 200 26 Q260 40 250 106 Q200 92 150 106Z" fill="#2e7d32"/>`);
   for(let r=0;r<4;r++)for(let i=0;i<7-r;i++){const x=158+r*8+i*14,y=96-r*18;s.push(`<circle cx="${x}" cy="${y}" r="7.5" fill="${(i+r)%2?a:b}" stroke="${shade((i+r)%2?a:b,-.3)}"/><circle cx="${x}" cy="${y}" r="2.6" fill="#ffd54f"/>`)}
   s.push(`<circle cx="200" cy="30" r="9" fill="${a}" stroke="${shade(a,-.3)}"/><circle cx="200" cy="30" r="3" fill="#ffd54f"/>`);break;
  case"topi":
   s.push(`<path d="M154 106 Q150 60 200 54 Q250 60 246 106 Q200 94 154 106Z" fill="${a}" stroke="${shade(a,-.35)}" stroke-width="1.5"/><path d="M200 56 L200 98" stroke="${shade(a,-.2)}" stroke-width="1.5"/><path d="M156 100 Q200 88 244 100" stroke="${b}" stroke-width="3" fill="none"/>`);break;
 }
 return s.join("")}
function kalgi(st){
 const top={pankho:56,cross:34,zari:44,safo:42,mor:48,mugat:20,mugatS:20,phoolmugat:28,topi:58}[st.head]||40;
 const x=st.head==="zari"||st.head==="safo"?236:214;
 switch(st.kalgi){
  case"plume":return`<path d="M${x} ${top+40} Q${x+6} ${top} ${x+34} ${top-30} Q${x+18} ${top+6} ${x+14} ${top+40}Z" fill="${st.c.head2==="#ffffff"?"#f8bbd0":st.c.head2}" stroke="${shade(st.c.head2,-.4)}" stroke-width="1"/><path d="M${x+6} ${top+36} Q${x+12} ${top} ${x+32} ${top-26}" fill="none" stroke="#fff" stroke-width="1" opacity=".7"/><circle cx="${x+6}" cy="${top+40}" r="5" fill="${RUBY}" stroke="${GOLD2}"/>`;
  case"peacock":return`<path d="M${x} ${top+40} Q${x+4} ${top+6} ${x+16} ${top-26}" stroke="#33691e" stroke-width="2" fill="none"/><ellipse cx="${x+17}" cy="${top-30}" rx="10" ry="14" fill="#00838f" transform="rotate(20 ${x+17} ${top-30})"/><ellipse cx="${x+17}" cy="${top-29}" rx="5.5" ry="8" fill="#1a237e" transform="rotate(20 ${x+17} ${top-29})"/><circle cx="${x+17}" cy="${top-28}" r="2.6" fill="#ffd54f"/>`;
  case"sirpech":return`<path d="M200 ${top+52} Q190 ${top+30} 200 ${top+10} Q210 ${top+30} 200 ${top+52}Z" fill="${GOLD}" stroke="${GOLD2}" stroke-width="1.2"/><circle cx="200" cy="${top+34}" r="5" fill="${RUBY}"/>${beads(`M200 ${top+10} L200 ${top-6}`,5,2,PEARL,"#bfb59f")}<circle cx="200" cy="${top-10}" r="4" fill="${EMER}" stroke="${GOLD2}"/>`;
 }return""}
function tora(st){
 if(st.tora==="none")return"";
 const kind=st.tora,s=[];
 for(const x of[156,244]){
  const p=`M${x} 102 Q${x+(x<200?-14:14)} 150 ${x+(x<200?-8:8)} 196`;
  if(kind==="moti")s.push(beads(p,6,2.6,PEARL,"#bfb59f"),beads(`M${x+(x<200?6:-6)} 104 Q${x+(x<200?-6:6)} 146 ${x} 184`,6,2.2,PEARL,"#bfb59f"));
  else s.push(flowerRope(p,kind==="mogra"?"mogra":"genda",8));
 }
 return s.join("")}
function kundal(st){
 if(st.kundal==="none")return"";const s=[];
 for(const x of[158,242]){const f=x<200?-1:1;
  if(st.kundal==="makar")s.push(`<path d="M${x} 150 q${8*f} 6 ${10*f} 16 q${-4*f} 10 ${-12*f} 6 q${6*f} -4 ${4*f} -10 q${-2*f} -6 ${-2*f} -12Z" fill="${GOLD}" stroke="${GOLD2}" stroke-width="1"/><circle cx="${x+5*f}" cy="${164}" r="2.4" fill="${RUBY}"/><circle cx="${x+2*f}" cy="${178}" r="2.2" fill="${PEARL}"/>`);
  else if(st.kundal==="mor")s.push(`<path d="M${x} 148 q${16*f} -4 ${18*f} 14 q${-2*f} 14 ${-16*f} 12 q${8*f} -8 ${2*f} -14Z" fill="#00838f" stroke="${GOLD2}" stroke-width="1"/><circle cx="${x+9*f}" cy="158" r="3" fill="#1a237e"/><path d="M${x+4*f} 172 l0 8" stroke="${GOLD}" stroke-width="2"/><circle cx="${x+4*f}" cy="182" r="2.4" fill="${PEARL}"/>`);
  else s.push(`<circle cx="${x}" cy="160" r="7" fill="none" stroke="${GOLD}" stroke-width="3"/><circle cx="${x}" cy="171" r="3" fill="${RUBY}"/>`);
 }return s.join("")}
function necklaces(st){
 const s=[],o=st.orn;
 if(o.kanthi)s.push(beads("M186 200 Q200 214 214 200",3.6,1.6,"#8d6e63"));
 const n=o.haar?st.haarN:0;
 for(let i=0;i<n;i++){const d=14+i*13;
  s.push(`<path d="M${182-i*6} 204 Q200 ${210+d} ${218+i*6} 204" fill="none" stroke="${GOLD2}" stroke-width="4.6"/><path d="M${182-i*6} 204 Q200 ${210+d} ${218+i*6} 204" fill="none" stroke="${GOLD}" stroke-width="3" stroke-dasharray="${i%2?"3 2":"6 2"}"/>`);
  const py=207+d*.98;s.push(i===n-1?`<path d="M200 ${py-2} l9 6 l-9 14 l-9 -14Z" fill="${GOLD}" stroke="${GOLD2}"/><circle cx="200" cy="${py+7}" r="3.6" fill="${i%2?EMER:RUBY}"/>`:`<circle cx="200" cy="${py+2}" r="3.4" fill="${i%2?EMER:RUBY}" stroke="${GOLD2}"/>`)}
 if(o.moti)s.push(beads("M178 204 Q172 300 200 340 Q228 300 222 204",5.4,2.2,PEARL,"#bfb59f"));
 return s.join("")}
function garlands(st){
 const s=[];for(let i=0;i<st.garN;i++){const y=380+i*28,sp=i*7;
  s.push(flowerRope(`M${166-sp} 204 Q${144-sp} ${y-60} ${178-sp*.4} ${y} Q200 ${y+18} ${222+sp*.4} ${y} Q${256+sp} ${y-60} ${234+sp} 204`,st.garland,i===0?12:10))}
 return s.join("")}
function armOrn(st){
 const s=[],o=st.orn,ab=st.pose==="abhay";
 const bj=ab?[[146,224],[256,236]]:[[146,222],[252,228]];
 const kd=ab?[[124,254,-20],[276,296,0]]:[[132,252,-8],[248,246,10]];
 if(o.bajubandh)for(const[x,y]of bj)s.push(`<ellipse cx="${x}" cy="${y}" rx="10" ry="5" fill="${GOLD}" stroke="${GOLD2}"/><circle cx="${x}" cy="${y}" r="3" fill="${RUBY}"/>`);
 if(o.kada)for(const[x,y,r]of kd)s.push(`<ellipse cx="${x}" cy="${y}" rx="12" ry="4.4" fill="none" stroke="${GOLD2}" stroke-width="5" transform="rotate(${r} ${x} ${y})"/><ellipse cx="${x}" cy="${y}" rx="12" ry="4.4" fill="none" stroke="${GOLD}" stroke-width="3" transform="rotate(${r} ${x} ${y})"/>`);
 if(o.gajra)for(const[x,y,r]of kd)s.push(`<g transform="rotate(${r} ${x} ${y+6})">${beads(`M${x-12} ${y+7} L${x+12} ${y+7}`,4.2,2.6,"#ffffff","#c8c4b4")}</g>`);
 if(o.veenti)s.push(ab?`<circle cx="115" cy="214" r="3.2" fill="none" stroke="${GOLD}" stroke-width="2.2"/><circle cx="115" cy="211" r="1.8" fill="${RUBY}"/>`:`<circle cx="150" cy="238" r="3.2" fill="none" stroke="${GOLD}" stroke-width="2.2"/><circle cx="150" cy="235" r="1.8" fill="${RUBY}"/>`);
 if(o.kandoro)s.push(`<path d="M146 328 Q200 342 254 328" fill="none" stroke="${GOLD2}" stroke-width="4"/><path d="M146 328 Q200 342 254 328" fill="none" stroke="${GOLD}" stroke-width="2.6" stroke-dasharray="4 2"/>`+[160,180,200,220,240].map(x=>`<circle cx="${x}" cy="${334+(x===200?3:1)}" r="2" fill="${GOLD}"/>`).join(""));
 if(o.zanzar)s.push(beads("M168 534 L196 534",3.6,1.8,"#cfd8dc","#78909c")+beads("M204 534 L232 534",3.6,1.8,"#cfd8dc","#78909c"));
 return s.join("")}
function handItem(st){
 if(st.pose==="bansuri")return`<path d="M86 248 L248 196" stroke="#8d5524" stroke-width="7" stroke-linecap="round"/><path d="M86 248 L248 196" stroke="${GOLD}" stroke-width="7" stroke-dasharray="3 22" /><circle cx="214" cy="207" r="1.6" fill="#3e2416"/><circle cx="200" cy="211.5" r="1.6" fill="#3e2416"/><circle cx="130" cy="234" r="1.6" fill="#3e2416"/><path d="M96 246 l-10 18 M100 244 l-4 20" stroke="${RUBY}" stroke-width="2"/>`;
 switch(st.hand){
  case"rumal":return`<path d="M276 344 Q262 380 272 410 Q284 394 296 412 Q300 378 290 344Z" fill="#fff" stroke="#bdbdbd"/><path d="M276 404 Q284 396 294 406" stroke="${RUBY}" stroke-width="2" fill="none"/>`;
  case"kamal":return`<path d="M283 348 L283 300" stroke="#2e7d32" stroke-width="3"/><path d="M283 302 Q270 290 276 276 Q283 286 283 302 Q283 280 290 270 Q298 290 283 302 Q296 288 302 280 Q300 298 283 302Z" fill="#f48fb1" stroke="#ad1457" stroke-width="1"/>`;
  case"gulab":return`<path d="M283 348 L283 306" stroke="#2e7d32" stroke-width="3"/><circle cx="283" cy="300" r="9" fill="#c62828"/><path d="M277 300 Q283 292 289 300 Q283 306 277 300" fill="none" stroke="#8e0000" stroke-width="1.4"/><path d="M283 322 q8 -6 12 0 q-6 6 -12 0" fill="#43a047"/>`;
 }return""}
function backdrop(st){
 const bg=st.c.bg,s=[`<rect x="0" y="-50" width="400" height="650" fill="${bg}"/>`];
 if(st.prabha==="surya"){for(let i=0;i<32;i++){const t=i/32*Math.PI*2,r1=62,r2=i%2?104:120;s.push(`<path d="M${200+Math.cos(t)*r1} ${120+Math.sin(t)*r1} L${200+Math.cos(t+.07)*r2} ${120+Math.sin(t+.07)*r2} L${200+Math.cos(t+.14)*r1} ${120+Math.sin(t+.14)*r1}Z" fill="${i%2?"#ffca28":GOLD}"/>`)}s.push(`<circle cx="200" cy="120" r="66" fill="#ffe082" stroke="${GOLD2}" stroke-width="2"/>`)}
 if(st.prabha==="arch")s.push(`<path d="M86 560 L86 150 A114 114 0 0 1 314 150 L314 560" fill="none" stroke="${GOLD2}" stroke-width="18"/><path d="M86 560 L86 150 A114 114 0 0 1 314 150 L314 560" fill="none" stroke="${GOLD}" stroke-width="12"/><path d="M86 560 L86 150 A114 114 0 0 1 314 150 L314 560" fill="none" stroke="#fff3c4" stroke-width="2" stroke-dasharray="2 7"/>`);
 if(st.orn.chhatra)s.push(`<path d="M150 16 Q200 -14 250 16 Z" fill="${st.c.zari}" stroke="${GOLD2}" stroke-width="1.5"/>${beads("M150 18 Q200 30 250 18",6,2,PEARL,"#bfb59f")}<path d="M200 -4 L200 -14" stroke="${GOLD2}" stroke-width="3"/>`);
 // simhasan
 s.push(`<path d="M120 552 L280 552 L296 590 L104 590Z" fill="${GOLD}" stroke="${GOLD2}" stroke-width="2"/><path d="M112 572 L288 572" stroke="${GOLD2}" stroke-width="2" stroke-dasharray="6 4"/><rect x="138" y="546" width="124" height="10" rx="3" fill="#c62828" stroke="#7f0000"/>`);
 return s.join("")}

function svg(st,opts={}){
 const m=MURTIS.find(x=>x.k===st.murti)||MURTIS[0];
 const sk=st.skin||m.skin,child=!!m.child;
 const g=[backdrop(st),
  `<g ${child?'transform="translate(40 108) scale(.8)"':""}>`,
  body(st,sk),vagha(st),khes(st),garlands(st),necklaces(st),armOrn(st),face(st,sk),kundal(st),headdress(st),kalgi(st),tora(st),handItem(st),
  `</g>`].join("");
 const title=opts.title?`<title>${esc(opts.title)}</title>`:"";
 return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -50 400 650" role="img" ${opts.id?`id="${opts.id}"`:""}>${title}${g}</svg>`}

/* items list for counting: [{gu,en,n}] */
function items(st){
 const L=[],f=(arr,k)=>arr.find(o=>o.k===k);
 const add=(gu,en,n=1)=>L.push({gu,en,n});
 const h=f(OPT.head,st.head);add(h.gu,h.en);
 if(st.kalgi!=="none"){const o=f(OPT.kalgi,st.kalgi);add(o.gu,o.en)}
 if(st.tora!=="none"){const o=f(OPT.tora,st.tora);add(o.gu,o.en,2)}
 const v=f(OPT.vagha,st.vagha);add(v.gu,v.en);
 add("કમરપટો","Kamar patto (waist sash)");
 if(st.khes!=="none"){const o=f(OPT.khes,st.khes);add(o.gu,o.en)}
 if(st.kundal!=="none"){const o=f(OPT.kundal,st.kundal);add(o.gu,o.en,2)}
 for(const o of ORN){if(!st.orn[o.k])continue;if(o.k==="haar"){if(st.haarN)add(o.gu,o.en,st.haarN);continue}add(o.gu,o.en,o.c)}
 if(st.garN){const g=f(OPT.garland,st.garland);add(`${g.gu}નો હાર`,`${g.en} garland`,st.garN)}
 if(st.pose==="bansuri")add("વાંસળી","Bansuri (flute)");
 else if(st.hand!=="none"){const o=f(OPT.hand,st.hand);add(o.gu,o.en+" in the left hand")}
 if(st.prabha!=="none"){const o=f(OPT.prabha,st.prabha);add(o.gu,o.en)}
 return L}

function stateFor(murtiKey,presetKey){
 const m=MURTIS.find(x=>x.k===murtiKey)||MURTIS[0],p=PRESETS[presetKey||m.preset];
 return JSON.parse(JSON.stringify(Object.assign({murti:m.k,preset:presetKey||m.preset,pose:m.pose,skin:m.skin},p.s)))}

root.SHANGAAR_FIG={MURTIS,OPT,ORN,PRESETS,PAL,svg,items,stateFor,shade,lum};
})(typeof window!=="undefined"?window:globalThis);
