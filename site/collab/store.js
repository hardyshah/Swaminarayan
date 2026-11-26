/* SPC — the collaboration data layer for the Swaminarayan site.
   One API, two backends:
     live  → Supabase (real accounts, shared database, private file storage, row-level security)
     demo  → this browser only (localStorage + IndexedDB), so every page can be tried before Supabase is set up.
   Every page talks to window.SPC and never to the backend directly. */
(function(){
"use strict";
if(window.SPC)return;
const CFG=window.SPC_CONFIG||{};
const LIVE=!!(CFG.supabaseUrl&&CFG.supabaseAnonKey);
const BUCKET=CFG.storageBucket||"uploads";
const BASE=(function(){const s=document.currentScript&&document.currentScript.src||"";return s.replace(/site\/collab\/store\.js.*$/,"")})();

/* ---------- shared vocabulary ---------- */
const KINDS=[
  {k:"puja",       gu:"પૂજા",          en:"Nitya puja",       unit:"times",   step:1,  goal:1,  icon:"🪔"},
  {k:"mala",       gu:"માળા",          en:"Mala",             unit:"malas",   step:1,  goal:11, icon:"📿"},
  {k:"vachanamrut",gu:"વચનામૃત",       en:"Vachanamrut read", unit:"vachanamruts",step:1,goal:1,icon:"📖"},
  {k:"shikshapatri",gu:"શિક્ષાપત્રી",   en:"Shikshapatri",     unit:"shlokas", step:5,  goal:10, icon:"📜"},
  {k:"darshan",    gu:"મંદિર દર્શન",    en:"Mandir darshan",   unit:"visits",  step:1,  goal:1,  icon:"🛕"},
  {k:"sabha",      gu:"સભા / કથા",      en:"Sabha or katha",   unit:"sessions",step:1,  goal:1,  icon:"🎙️"},
  {k:"seva",       gu:"સેવા",          en:"Seva",             unit:"hours",   step:0.5,goal:1,  icon:"🙏"},
  {k:"dhyaan",     gu:"ધ્યાન",          en:"Dhyaan",           unit:"minutes", step:5,  goal:15, icon:"🧘"},
  {k:"kirtan",     gu:"કીર્તન / ધૂન",    en:"Kirtan or dhun",   unit:"kirtans", step:1,  goal:3,  icon:"🎶"},
  {k:"ekadashi",   gu:"એકાદશી વ્રત",    en:"Ekadashi vrat",    unit:"days",    step:1,  goal:0,  icon:"🌙"},
  {k:"quiz",       gu:"ક્વિઝ / રમત",     en:"Quiz or game",     unit:"points",  step:1,  goal:0,  icon:"🎯", auto:true}
];
const DEFAULT_SETTINGS={
  announcement:{on:false,text:"",tone:"info"},
  features:{comments:true,uploads:true,edits:true,tracker:true,gate:false,maintenance:false},
  uploads:{maxMB:50,types:["image/jpeg","image/png","image/webp","image/gif","application/pdf","audio/mpeg","audio/mp4","audio/x-m4a","audio/wav","video/mp4","text/plain"]},
  points:{puja:5,mala:1,vachanamrut:5,shikshapatri:0.5,darshan:5,sabha:5,seva:4,dhyaan:0.2,kirtan:2,ekadashi:10,quiz:1,upload:10,edit:10,comment:2,event:10},
  rate:{perHour:20}
};
const LEVELS=[[0,"બીજ","Seed"],[100,"અંકુર","Sprout"],[400,"છોડ","Sapling"],[1200,"વૃક્ષ","Tree"],[3000,"વટવૃક્ષ","Banyan"],[7000,"કલ્પવૃક્ષ","Kalpavruksh"]];

/* ---------- small utilities ---------- */
const listeners={};
function on(ev,fn){(listeners[ev]=listeners[ev]||[]).push(fn);return()=>{listeners[ev]=listeners[ev].filter(f=>f!==fn)}}
function emit(ev,d){(listeners[ev]||[]).forEach(f=>{try{f(d)}catch(e){console.error(e)}})}
const uid=()=>(crypto.randomUUID?crypto.randomUUID():"id-"+Date.now().toString(36)+Math.random().toString(36).slice(2));
const now=()=>new Date().toISOString();
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
function merge(a,b){const o=JSON.parse(JSON.stringify(a));for(const k in b||{}){o[k]=(b[k]&&typeof b[k]==="object"&&!Array.isArray(b[k])&&o[k]&&typeof o[k]==="object")?merge(o[k],b[k]):b[k]}return o}
function pageKey(href){const u=new URL(href||location.href);let p=u.pathname.replace(/\/index\.html$/,"/");const i=p.toLowerCase().indexOf("/swaminarayan/");if(i>=0)p=p.slice(i+13);return p||"/"}
function inviteCode(){const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";const r=crypto.getRandomValues(new Uint8Array(10));for(const x of r)s+=a[x%a.length];return s.slice(0,5)+"-"+s.slice(5)}
function normPhone(p){p=String(p||"").replace(/[\s\-().]/g,"");if(/^0\d{10}$/.test(p))p="+91"+p.slice(1);if(/^\d{10}$/.test(p))p="+91"+p;if(!/^\+[1-9]\d{7,14}$/.test(p))throw new Error("Please enter a full mobile number with country code, for example +91 98765 43210.");return p}
const verifiedOf=s=>!!(s&&s.verified&&s.verified.email&&s.verified.phone);
async function sha(s){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}

/* score: activity quantity × points, plus approved contributions */
function score(acts,contribs,points){
  const P=points||DEFAULT_SETTINGS.points;let total=0;const byKind={},byDay={};
  for(const a of acts||[]){const p=(+a.qty||0)*(+P[a.kind]||0);total+=p;byKind[a.kind]=(byKind[a.kind]||0)+p;byDay[a.day]=(byDay[a.day]||0)+p}
  for(const c of contribs||[]){if(c.status!=="approved")continue;const p=+P[c.kind]||0;total+=p;byKind["contrib"]=(byKind["contrib"]||0)+p;const d=(c.reviewed_at||c.created_at||"").slice(0,10);if(d)byDay[d]=(byDay[d]||0)+p}
  let lv=0;for(let i=0;i<LEVELS.length;i++)if(total>=LEVELS[i][0])lv=i;
  const next=LEVELS[lv+1];
  return{total:Math.round(total*10)/10,byKind,byDay,level:lv,levelGu:LEVELS[lv][1],levelEn:LEVELS[lv][2],nextAt:next?next[0]:null,nextEn:next?next[2]:null,from:LEVELS[lv][0]};
}
function streak(byDay){let s=0;const d=new Date();if(!byDay[fmt(d)])d.setDate(d.getDate()-1);while(byDay[fmt(d)]>0){s++;d.setDate(d.getDate()-1)}return s;function fmt(x){return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")}}

/* ---------- upload safety checks (run in the browser before anything is sent) ---------- */
const MAGIC=[["image/jpeg",[0xFF,0xD8,0xFF]],["image/png",[0x89,0x50,0x4E,0x47]],["image/gif",[0x47,0x49,0x46,0x38]],["application/pdf",[0x25,0x50,0x44,0x46]],
  ["image/webp",[0x52,0x49,0x46,0x46]],["audio/wav",[0x52,0x49,0x46,0x46]],["audio/mpeg",[0x49,0x44,0x33]],["audio/mpeg",[0xFF,0xFB]],["audio/mpeg",[0xFF,0xF3]]];
async function checkFile(file,settings){
  const S=(settings||DEFAULT_SETTINGS).uploads,issues=[];let out=file;
  if(file.size>S.maxMB*1048576)issues.push({bad:true,msg:`Too large: ${(file.size/1048576).toFixed(1)} MB (limit ${S.maxMB} MB).`});
  let type=file.type||"";if(type==="audio/x-m4a")type="audio/mp4";
  if(S.types.indexOf(file.type)<0&&S.types.indexOf(type)<0)issues.push({bad:true,msg:`File type "${file.type||"unknown"}" is not allowed.`});
  if(/\.(exe|bat|cmd|com|scr|js|vbs|ps1|sh|jar|msi|apk|dmg|html?|svg)$/i.test(file.name))issues.push({bad:true,msg:"Programs, scripts and web pages cannot be uploaded."});
  const head=new Uint8Array(await file.slice(0,16).arrayBuffer());
  const want=MAGIC.filter(m=>m[0]===type);
  if(want.length&&!want.some(m=>m[1].every((b,i)=>head[i]===b)))issues.push({bad:true,msg:"The file's contents do not match its type (possible disguised file)."});
  if(type==="application/pdf"){const t=await file.slice(0,Math.min(file.size,4194304)).text();if(/\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction|AA)\b/.test(t))issues.push({bad:true,msg:"This PDF contains scripts or auto-run actions and was blocked."})}
  if(type==="text/plain"){const t=await file.slice(0,262144).text();const pii=scanText(t);if(pii.length)issues.push({bad:false,msg:"Looks like it contains "+pii.join(", ")+". Please remove personal details."})}
  if(type==="image/jpeg"||type==="image/png"||type==="image/webp"){try{out=await stripExif(file);if(out!==file)issues.push({bad:false,ok:true,msg:"Location and camera details were removed from the photo."})}catch(e){}}
  return{ok:!issues.some(i=>i.bad),issues,file:out};
}
function scanText(t){const f=[];if(/\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/.test(t))f.push("an ID or card number");if(/[\w.+-]+@[\w-]+\.[\w.]+/.test(t))f.push("an email address");
  if(/(\+?\d[\d -]{9,}\d)/.test(t))f.push("a phone number");if(/(bit\.ly|tinyurl|login|verify your account|password)/i.test(t))f.push("a suspicious link or login request");return f}
function stripExif(file){return new Promise((res,rej)=>{const img=new Image(),u=URL.createObjectURL(file);img.onload=()=>{const max=4096,s=Math.min(1,max/Math.max(img.width,img.height));
  const c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);
  const t=file.type==="image/png"?"image/png":"image/jpeg";c.toBlob(b=>{if(!b)return rej();res(new File([b],file.name.replace(/\.\w+$/,"")+(t==="image/png"?".png":".jpg"),{type:t}))},t,.9)};img.onerror=()=>{URL.revokeObjectURL(u);rej()};img.src=u})}

/* =====================================================================
   DEMO backend: this browser only
   ===================================================================== */
function Demo(){
  const KEY="spc-demo-v1";
  let db=load();
  function load(){try{const j=JSON.parse(localStorage.getItem(KEY));if(j&&j.v===1)return j}catch(e){}return null}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){console.warn("demo store full",e)}}
  // files live in IndexedDB so photos and audio can be tried
  let idb=null;function store(){if(idb)return idb;idb=new Promise((res,rej)=>{const r=indexedDB.open("spc-demo-files",1);r.onupgradeneeded=()=>r.result.createObjectStore("f");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return idb}
  async function putFile(key,blob){const d=await store();return new Promise((res,rej)=>{const t=d.transaction("f","readwrite");t.objectStore("f").put(blob,key);t.oncomplete=res;t.onerror=()=>rej(t.error)})}
  async function getFile(key){const d=await store();return new Promise(res=>{const t=d.transaction("f");const r=t.objectStore("f").get(key);r.onsuccess=()=>res(r.result||null);r.onerror=()=>res(null)})}
  async function delFile(key){try{const d=await store();d.transaction("f","readwrite").objectStore("f").delete(key)}catch(e){}}

  async function seed(){
    const pw=await sha("jayswaminarayan");
    const V={email_ok:true,phone_ok:true};
    const A=Object.assign({id:uid(),email:"admin@demo.local",phone:"+919000000001",name:"Demo Admin",role:"admin",status:"active",pw,created_at:"2026-09-01T09:00:00Z",layout:null},V);
    const M=Object.assign({id:uid(),email:"member@demo.local",phone:"+919000000002",name:"Demo Member",role:"member",status:"active",pw,created_at:"2026-10-02T09:00:00Z",layout:null},V);
    const K=Object.assign({id:uid(),email:"kishore@demo.local",phone:"+919000000003",name:"Demo Kishore",role:"member",status:"active",pw,created_at:"2026-10-20T09:00:00Z",layout:null},V);
    db={v:1,users:[A,M,K],invites:[{code:"DEMO1-JAYSW",email:"",role:"member",note:"Demo invite",created_by:A.id,created_at:now(),expires_at:null,used_by:null,used_at:null,revoked:false}],
      contributions:[],activities:[],tokens:{},otp:null,settings:JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),audit:[],session:null};
    const C=(u,kind,page,title,body,status,daysAgo,extra)=>{const t=new Date(Date.now()-daysAgo*864e5).toISOString();
      db.contributions.push(Object.assign({id:uid(),user_id:u.id,kind,page,target:"",title,body,status,admin_note:"",file_path:null,file_name:null,file_type:null,file_size:null,created_at:t,updated_at:t,reviewed_at:status==="pending"?null:t,reviewed_by:status==="pending"?null:A.id},extra||{}))};
    C(M,"comment","vachanamrut-concordance/","Gadhada Pratham 1","A cross-reference to Shikshapatri shlok 116 would help here.","pending",0.2);
    C(M,"edit","kaal-patrak/","Date of Loj arrival","Shravan vad 6, V.S. 1856 (sample suggestion for the demo)","pending",1,{target:"Loj arrival",body:"Please check the date shown for this event against the book.\n\nSuggested: sample text only."});
    C(K,"upload","vicharan/","Photo of a village mandir (demo)","Demo upload without a file.","pending",0.5);
    C(K,"comment","index.html","Today page","The ghadi clock is lovely. Could it also show sunset?","approved",6);
    C(M,"comment","vedas.html","Rigveda reader","A bookmark button would be useful.","rejected",9,{admin_note:"Already planned, thanks."});
    C(M,"upload","bhajan","Dhun recording (demo)","Demo upload without a file.","approved",14);
    const kinds=["puja","mala","vachanamrut","darshan","dhyaan","kirtan","seva"];
    for(const u of [A,M,K])for(let d=70;d>=0;d--){if(Math.random()<(u===M?.25:.45))continue;const day=new Date(Date.now()-d*864e5);const ds=day.toISOString().slice(0,10);
      for(const k of kinds){if(Math.random()<.45)continue;const meta=KINDS.find(x=>x.k===k);db.activities.push({id:uid(),user_id:u.id,day:ds,kind:k,qty:Math.max(meta.step,Math.round(Math.random()*meta.goal*1.4/meta.step)*meta.step),note:"",created_at:now()})}}
    log(A.id,"seed","demo","Demo data created");save();
  }
  function log(actor,action,target,detail){db.audit.unshift({id:uid(),actor,action,target,detail:detail||"",at:now()});if(db.audit.length>800)db.audit.length=800}
  const me=()=>db&&db.session?db.users.find(u=>u.id===db.session):null;
  const isAdmin=()=>{const u=me();return!!u&&(u.role==="admin"||u.role==="moderator")};
  function needIn(){const u=me();if(!u)throw new Error("Please sign in first.");if(u.status!=="active")throw new Error("Your account is paused. Please contact the admin.");return u}
  function need(){const u=needIn();if(!u.email_ok||!u.phone_ok)throw new Error("Please verify your email and mobile number first.");return u}
  function needAdmin(){const u=need();if(!isAdmin())throw new Error("Admins only.");return u}
  const pub=u=>u&&({id:u.id,email:u.email,phone:u.phone||null,email_verified:!!u.email_ok,phone_verified:!!u.phone_ok,name:u.name,role:u.role,status:u.status,created_at:u.created_at,layout:u.layout,last_seen:u.last_seen||null});
  function rate(u){const hr=Date.now()-36e5;const n=db.contributions.filter(c=>c.user_id===u.id&&Date.parse(c.created_at)>hr).length;if(n>=(db.settings.rate.perHour||20)&&!isAdmin())throw new Error("You have sent many items in the last hour. Please try again later.")}

  return{
    mode:"demo",
    async ready(){if(!db)await seed();return this},
    async session(){const u=me();return u?{user:{id:u.id,email:u.email,phone:u.phone||u.phone_pending||""},profile:pub(u),verified:{email:!!u.email_ok,phone:!!u.phone_ok}}:null},
    async signIn(email,password){email=(email||"").trim().toLowerCase();const u=db.users.find(x=>x.email===email);
      if(!u||u.pw!==await sha(password))throw new Error("Email or password is not right.");if(!u.email_ok){const e=new Error("Please open the confirmation email we sent, then sign in.");e.code="email_unconfirmed";throw e}if(u.status!=="active")throw new Error("This account is paused. Please contact the admin.");
      db.session=u.id;u.last_seen=now();log(u.id,"sign-in",u.email);save();emit("auth",await this.session());return this.session()},
    async signUp(email,password,name,code,phone){email=(email||"").trim().toLowerCase();code=(code||"").trim().toUpperCase();phone=normPhone(phone);
      const inv=db.invites.find(i=>i.code===code);
      if(!inv||inv.used_by||inv.revoked||(inv.expires_at&&Date.parse(inv.expires_at)<Date.now()))throw new Error("This invite code is not valid or has already been used.");
      if(inv.email&&inv.email.toLowerCase()!==email)throw new Error("This invite is for a different email address.");
      if(db.users.some(u=>u.email===email))throw new Error("An account with this email already exists. Please sign in.");
      if((password||"").length<8)throw new Error("Please use at least 8 characters for the password.");
      if(db.users.some(u=>u.phone===phone))throw new Error("This mobile number is already used by another member.");
      const u={id:uid(),email,phone_pending:phone,email_ok:false,phone_ok:false,name:(name||"").trim()||email.split("@")[0],role:inv.role||"member",status:"active",pw:await sha(password),created_at:now(),layout:null};
      db.users.push(u);inv.used_by=u.id;inv.used_at=now();const tk=uid();db.tokens=db.tokens||{};db.tokens[tk]=u.id;log(u.id,"sign-up",email,"invite "+code);save();return{needsConfirm:true,demoToken:tk}},
    async resendConfirmation(email){const u=db.users.find(x=>x.email===(email||"").trim().toLowerCase());if(!u||u.email_ok)return{sent:true};const tk=uid();db.tokens[tk]=u.id;save();return{sent:true,demoToken:tk}},
    async confirmEmail(tk){const id=db.tokens&&db.tokens[tk];const u=id&&db.users.find(x=>x.id===id);if(!u)throw new Error("This confirmation link is not valid.");u.email_ok=true;delete db.tokens[tk];db.session=u.id;log(u.id,"email-verified",u.email);save();emit("auth",await this.session());return true},
    async sendPhoneCode(phone){const u=needIn();phone=normPhone(phone);if(db.users.some(x=>x.id!==u.id&&x.phone===phone))throw new Error("This mobile number is already used by another member.");
      if(db.otp&&db.otp.user===u.id&&Date.now()-db.otp.at<30000)throw new Error("Please wait 30 seconds before asking for another code.");
      const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,"0");db.otp={user:u.id,phone,code,at:Date.now(),tries:0};save();return{sent:true,demoCode:code}},
    async verifyPhoneCode(phone,code){const u=needIn();phone=normPhone(phone);const o=db.otp;if(!o||o.user!==u.id||o.phone!==phone||Date.now()-o.at>600000)throw new Error("The code has expired. Please ask for a new one.");
      if(++o.tries>5){db.otp=null;save();throw new Error("Too many wrong tries. Please ask for a new code.")}
      if(String(code).trim()!==o.code){save();throw new Error("That code is not right.")}u.phone=phone;u.phone_ok=true;delete u.phone_pending;db.otp=null;log(u.id,"phone-verified",phone.slice(0,-4).replace(/\d/g,"•")+phone.slice(-4));save();emit("auth",await this.session());return true},
    async signOut(){const u=me();db.session=null;if(u)log(u.id,"sign-out",u.email);save();emit("auth",null)},
    async resetPassword(email){return{sent:true,demo:true}},
    async updatePassword(pw){const u=needIn();if((pw||"").length<8)throw new Error("Please use at least 8 characters.");u.pw=await sha(pw);log(u.id,"password",u.email);save();return true},
    async saveProfile(p){const u=need();if(p.name!=null)u.name=String(p.name).slice(0,80);if(p.layout!==undefined)u.layout=p.layout;save();emit("profile",pub(u));return pub(u)},
    async getSettings(){return merge(DEFAULT_SETTINGS,db?db.settings:{})},
    async setSetting(key,val){const u=needAdmin();db.settings[key]=val;log(u.id,"settings",key,JSON.stringify(val).slice(0,200));save();emit("settings",await this.getSettings())},

    async createContribution(c){const u=need();rate(u);const s=await this.getSettings();
      if(c.kind==="comment"&&!s.features.comments||c.kind==="upload"&&!s.features.uploads||c.kind==="edit"&&!s.features.edits)throw new Error("This is switched off by the admin for now.");
      const row={id:uid(),user_id:u.id,kind:c.kind,page:c.page||pageKey(),target:(c.target||"").slice(0,300),title:(c.title||"").slice(0,200),body:(c.body||"").slice(0,20000),
        status:isAdmin()&&c.autoApprove?"approved":"pending",admin_note:"",file_path:null,file_name:null,file_type:null,file_size:null,created_at:now(),updated_at:now(),reviewed_at:null,reviewed_by:null};
      if(c.file){row.file_path=u.id+"/"+Date.now()+"-"+c.file.name.replace(/[^\w.\-]+/g,"_");row.file_name=c.file.name;row.file_type=c.file.type;row.file_size=c.file.size;await putFile(row.file_path,c.file)}
      db.contributions.unshift(row);log(u.id,"create-"+row.kind,row.page,row.title);save();emit("contrib",row);return row},
    async updateMine(id,patch){const u=need();const r=db.contributions.find(c=>c.id===id&&c.user_id===u.id);if(!r)throw new Error("Not found.");
      if(r.status==="approved")throw new Error("Approved items can no longer be edited. Send a new suggestion instead.");
      ["title","body","target"].forEach(k=>{if(patch[k]!=null)r[k]=String(patch[k])});r.status="pending";r.updated_at=now();log(u.id,"edit-own",r.page,r.title);save();emit("contrib",r);return r},
    async deleteMine(id){const u=need();const i=db.contributions.findIndex(c=>c.id===id&&(c.user_id===u.id||isAdmin()));if(i<0)throw new Error("Not found.");const r=db.contributions[i];
      if(r.file_path)delFile(r.file_path);db.contributions.splice(i,1);log(u.id,"delete",r.page,r.title);save();emit("contrib",null)},
    async listMine(){const u=need();return db.contributions.filter(c=>c.user_id===u.id)},
    async listForPage(page){const u=me();return db.contributions.filter(c=>c.page===page&&(c.status==="approved"||(u&&c.user_id===u.id))).map(c=>Object.assign({author:(db.users.find(x=>x.id===c.user_id)||{}).name||"Member"},c))},
    async fileUrl(path){const b=await getFile(path);return b?URL.createObjectURL(b):null},

    async listActivities(from,to,userId){const u=need();const id=userId&&isAdmin()?userId:u.id;return db.activities.filter(a=>a.user_id===id&&(!from||a.day>=from)&&(!to||a.day<=to))},
    async addActivity(a){const u=need();const row={id:uid(),user_id:u.id,day:a.day||today(),kind:a.kind,qty:+a.qty||0,note:(a.note||"").slice(0,300),created_at:now()};db.activities.push(row);save();emit("activity",row);return row},
    async setDayQty(day,kind,qty){const u=need();db.activities=db.activities.filter(a=>!(a.user_id===u.id&&a.day===day&&a.kind===kind));if(qty>0)db.activities.push({id:uid(),user_id:u.id,day,kind,qty:+qty,note:"",created_at:now()});save();emit("activity",null)},
    async deleteActivity(id){const u=need();db.activities=db.activities.filter(a=>!(a.id===id&&a.user_id===u.id));save();emit("activity",null)},

    /* admin */
    async adminContributions(f){needAdmin();f=f||{};return db.contributions.filter(c=>(!f.status||c.status===f.status)&&(!f.kind||c.kind===f.kind)&&(!f.user||c.user_id===f.user)).map(c=>Object.assign({author:(db.users.find(x=>x.id===c.user_id)||{}).name||"?",email:(db.users.find(x=>x.id===c.user_id)||{}).email||""},c))},
    async review(id,status,note){const a=needAdmin();const r=db.contributions.find(c=>c.id===id);if(!r)throw new Error("Not found.");r.status=status;r.admin_note=note||"";r.reviewed_by=a.id;r.reviewed_at=now();log(a.id,"review-"+status,r.page,r.title+(note?" · "+note:""));save();emit("contrib",r);return r},
    async adminUsers(){needAdmin();return db.users.map(pub)},
    async adminSetUser(id,patch){const a=needAdmin();const u=db.users.find(x=>x.id===id);if(!u)throw new Error("Not found.");
      if(patch.role&&a.role!=="admin")throw new Error("Only an admin can change roles.");if(id===a.id&&(patch.role&&patch.role!=="admin"||patch.status==="suspended"))throw new Error("You cannot remove your own admin access.");
      ["role","status","name"].forEach(k=>{if(patch[k]!=null)u[k]=patch[k]});log(a.id,"user",u.email,JSON.stringify(patch));save();return pub(u)},
    async adminActivities(from){needAdmin();return db.activities.filter(a=>!from||a.day>=from)},
    async adminInvites(){needAdmin();return db.invites.slice().reverse()},
    async createInvite(i){const a=needAdmin();const row={code:inviteCode(),email:(i.email||"").trim().toLowerCase(),role:i.role||"member",note:i.note||"",created_by:a.id,created_at:now(),expires_at:i.days?new Date(Date.now()+i.days*864e5).toISOString():null,used_by:null,used_at:null,revoked:false};
      db.invites.push(row);log(a.id,"invite",row.email||row.code,row.role);save();return row},
    async revokeInvite(code){const a=needAdmin();const r=db.invites.find(i=>i.code===code);if(r){r.revoked=true;log(a.id,"revoke-invite",code);save()}},
    async adminAudit(){needAdmin();return db.audit.slice(0,400)},
    async exportAll(){needAdmin();const o=JSON.parse(JSON.stringify(db));o.users.forEach(u=>delete u.pw);delete o.session;return o},
    async resetDemo(){localStorage.removeItem(KEY);db=null;await seed();emit("auth",null)}
  };
}

/* =====================================================================
   LIVE backend: Supabase
   ===================================================================== */
function Live(){
  let sb=null,cachedProfile=null,settingsCache=null;
  const loadLib=()=>window.supabase?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";s.onload=res;s.onerror=()=>rej(new Error("Could not load the sign-in library."));document.head.appendChild(s)});
  const ok=r=>{if(r.error){const m=r.error.message||String(r.error);throw new Error(nice(m))}return r.data};
  function nice(m){if(/Database error saving new user|invite/i.test(m))return"This invite code is not valid, has been used, or is for a different email.";
    if(/Invalid login credentials/i.test(m))return"Email or password is not right.";if(/Email not confirmed/i.test(m))return"Please open the confirmation email we sent, then sign in.";
    if(/row-level security|permission denied/i.test(m))return"You do not have permission to do that.";if(/rate limit/i.test(m))return"Too many tries. Please wait a little and try again.";return m}
  async function user(){const{data}=await sb.auth.getSession();return data.session?data.session.user:null}
  async function need(){const u=await user();if(!u)throw new Error("Please sign in first.");return u}
  async function profile(force){const u=await user();if(!u)return null;if(cachedProfile&&cachedProfile.id===u.id&&!force)return cachedProfile;
    cachedProfile=ok(await sb.from("profiles").select("*").eq("id",u.id).maybeSingle());return cachedProfile}
  const redirect=()=>BASE+"login.html";
  return{
    mode:"live",
    async ready(){await loadLib();if(!sb){sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      sb.auth.onAuthStateChange(async(ev,s)=>{cachedProfile=null;if(ev==="PASSWORD_RECOVERY")emit("recovery",true);emit("auth",s?await this.session():null)})}return this},
    client(){return sb},
    async session(){const u=await user();if(!u)return null;const p=await profile();
      return{user:{id:u.id,email:u.email,phone:u.phone?"+"+String(u.phone).replace(/^\+/,""):(u.user_metadata&&u.user_metadata.phone)||""},profile:p,verified:{email:!!u.email_confirmed_at,phone:!!u.phone_confirmed_at}}},
    async signIn(email,password){const r=await sb.auth.signInWithPassword({email:email.trim(),password});if(r.error&&/Email not confirmed/i.test(r.error.message)){const e=new Error(nice(r.error.message));e.code="email_unconfirmed";throw e}ok(r);const s=await this.session();
      if(s&&s.profile&&s.profile.status!=="active"){await sb.auth.signOut();throw new Error("This account is paused. Please contact the admin.")}
      sb.from("profiles").update({last_seen:now()}).eq("id",s.user.id).then(()=>{});return s},
    async signUp(email,password,name,code,phone){phone=normPhone(phone);const d=ok(await sb.auth.signUp({email:email.trim(),password,options:{data:{name:(name||"").trim(),invite:(code||"").trim().toUpperCase(),phone},emailRedirectTo:redirect()}}));return{needsConfirm:!d.session}},
    async resendConfirmation(email){ok(await sb.auth.resend({type:"signup",email:email.trim(),options:{emailRedirectTo:redirect()}}));return{sent:true}},
    async sendPhoneCode(phone){await need();phone=normPhone(phone);ok(await sb.auth.updateUser({phone}));return{sent:true}},
    async verifyPhoneCode(phone,code){phone=normPhone(phone);ok(await sb.auth.verifyOtp({phone,token:String(code).trim(),type:"phone_change"}));await sb.auth.refreshSession();cachedProfile=null;emit("auth",await this.session());return true},
    async signOut(){await sb.auth.signOut();cachedProfile=null},
    async resetPassword(email){ok(await sb.auth.resetPasswordForEmail(email.trim(),{redirectTo:redirect()+"#reset"}));return{sent:true}},
    async updatePassword(pw){ok(await sb.auth.updateUser({password:pw}));return true},
    async saveProfile(p){const u=await need();const patch={};if(p.name!=null)patch.name=String(p.name).slice(0,80);if(p.layout!==undefined)patch.layout=p.layout;
      cachedProfile=ok(await sb.from("profiles").update(patch).eq("id",u.id).select().single());emit("profile",cachedProfile);return cachedProfile},
    async getSettings(){if(settingsCache)return settingsCache;const rows=ok(await sb.from("settings").select("key,value"));const o={};rows.forEach(r=>o[r.key]=r.value);settingsCache=merge(DEFAULT_SETTINGS,o);return settingsCache},
    async setSetting(key,val){ok(await sb.from("settings").upsert({key,value:val}));settingsCache=null;emit("settings",await this.getSettings())},

    async createContribution(c){const u=await need();const row={user_id:u.id,kind:c.kind,page:c.page||pageKey(),target:(c.target||"").slice(0,300),title:(c.title||"").slice(0,200),body:(c.body||"").slice(0,20000)};
      if(c.file){const path=u.id+"/"+Date.now()+"-"+c.file.name.replace(/[^\w.\-]+/g,"_");ok(await sb.storage.from(BUCKET).upload(path,c.file,{contentType:c.file.type,upsert:false}));
        Object.assign(row,{file_path:path,file_name:c.file.name,file_type:c.file.type,file_size:c.file.size})}
      const r=ok(await sb.from("contributions").insert(row).select().single());emit("contrib",r);return r},
    async updateMine(id,patch){const p={status:"pending"};["title","body","target"].forEach(k=>{if(patch[k]!=null)p[k]=String(patch[k])});const r=ok(await sb.from("contributions").update(p).eq("id",id).select().single());emit("contrib",r);return r},
    async deleteMine(id){const r=ok(await sb.from("contributions").select("file_path").eq("id",id).maybeSingle());if(r&&r.file_path)await sb.storage.from(BUCKET).remove([r.file_path]);ok(await sb.from("contributions").delete().eq("id",id));emit("contrib",null)},
    async listMine(){const u=await need();return ok(await sb.from("contributions").select("*").eq("user_id",u.id).order("created_at",{ascending:false}))},
    async listForPage(page){const u=await user();if(!u)return[];const rows=ok(await sb.from("contributions").select("*").eq("page",page).order("created_at",{ascending:false}));
      const ids=[...new Set(rows.map(r=>r.user_id))];const names={};if(ids.length)ok(await sb.from("member_names").select("id,name").in("id",ids)).forEach(n=>names[n.id]=n.name);
      return rows.map(c=>Object.assign({author:names[c.user_id]||"Member"},c))},
    async fileUrl(path){const d=ok(await sb.storage.from(BUCKET).createSignedUrl(path,3600));return d.signedUrl},

    async listActivities(from,to,userId){const u=await need();let q=sb.from("activities").select("*").eq("user_id",userId||u.id);if(from)q=q.gte("day",from);if(to)q=q.lte("day",to);return ok(await q.order("day"))},
    async addActivity(a){const u=await need();const r=ok(await sb.from("activities").insert({user_id:u.id,day:a.day||today(),kind:a.kind,qty:+a.qty||0,note:(a.note||"").slice(0,300)}).select().single());emit("activity",r);return r},
    async setDayQty(day,kind,qty){const u=await need();ok(await sb.from("activities").delete().eq("user_id",u.id).eq("day",day).eq("kind",kind));if(qty>0)ok(await sb.from("activities").insert({user_id:u.id,day,kind,qty:+qty}));emit("activity",null)},
    async deleteActivity(id){ok(await sb.from("activities").delete().eq("id",id));emit("activity",null)},

    async adminContributions(f){f=f||{};let q=sb.from("contributions").select("*,profiles(name,email)").order("created_at",{ascending:false}).limit(1000);
      if(f.status)q=q.eq("status",f.status);if(f.kind)q=q.eq("kind",f.kind);if(f.user)q=q.eq("user_id",f.user);
      return ok(await q).map(c=>Object.assign({author:c.profiles&&c.profiles.name||"?",email:c.profiles&&c.profiles.email||""},c))},
    async review(id,status,note){const r=ok(await sb.from("contributions").update({status,admin_note:note||""}).eq("id",id).select().single());emit("contrib",r);return r},
    async adminUsers(){return ok(await sb.from("profiles").select("*").order("created_at"))},
    async adminSetUser(id,patch){const p={};["role","status","name"].forEach(k=>{if(patch[k]!=null)p[k]=patch[k]});return ok(await sb.from("profiles").update(p).eq("id",id).select().single())},
    async adminActivities(from){let q=sb.from("activities").select("*").limit(20000);if(from)q=q.gte("day",from);return ok(await q)},
    async adminInvites(){return ok(await sb.from("invites").select("*").order("created_at",{ascending:false}))},
    async createInvite(i){const u=await need();return ok(await sb.from("invites").insert({code:inviteCode(),email:(i.email||"").trim().toLowerCase()||null,role:i.role||"member",note:i.note||"",created_by:u.id,expires_at:i.days?new Date(Date.now()+i.days*864e5).toISOString():null}).select().single())},
    async revokeInvite(code){ok(await sb.from("invites").update({revoked:true}).eq("code",code))},
    async adminAudit(){return ok(await sb.from("audit").select("*").order("at",{ascending:false}).limit(400))},
    async exportAll(){const t=["profiles","contributions","activities","invites","settings","audit"],o={exported_at:now()};for(const n of t)o[n]=ok(await sb.from(n).select("*").limit(50000));return o}
  };
}

const impl=LIVE?Live():Demo();
const api=Object.assign(impl,{KINDS,LEVELS,DEFAULT_SETTINGS,BASE,on,emit,score,streak,checkFile,scanText,pageKey,today,
  normPhone,verified:verifiedOf,isAdmin:p=>!!p&&(p.role==="admin"||p.role==="moderator")});
let readyP=null;api.whenReady=()=>readyP||(readyP=impl.ready());
window.SPC=api;
})();
