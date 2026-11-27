/* Reader additions for the Vachanamrut Concordance (index.html):
   1. remembers the exact place you stopped reading in every Vachanamrut (this browser only, localStorage),
   2. reads the text aloud with the voices this device has (Gujarati as written, Hindi via Devanagari, others via a romanized form),
   3. shows the matching reading from two YouTube playlists (data/videos.json, built by tools/vachanamrut/build_videos.py).
   Uses globals of the main script: T, VBYID, SEC, MAIN, vlabel, esc, go, state. */
"use strict";
const RP=(()=>{
  const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
            set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
  const K_POS="vc-read-pos",K_LAST="vc-read-last",K_VOICE="vc-tts-voice",K_RATE="vc-tts-rate",K_AUTO="vc-tts-auto";
  let VID=null;               // data/videos.json
  let restoring=0, curId=null, saveT=0;
  const ic={
    play:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    prev:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6h2v12H6zM9.5 12 18 18V6z"/></svg>',
    next:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>',
    stop:'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6h12v12H6z"/></svg>',
    close:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    spk:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    yt:'<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" fill="#e62117"/><path d="M10 9v6l5-3z" fill="#fff"/></svg>'};

  /* ---------- reading position ---------- */
  const topEdge=()=>{const h=document.querySelector("header.top");return (h?h.getBoundingClientRect().bottom:0)+8};
  const paras=()=>[...document.querySelectorAll("#rtext p[data-pi]")];
  function measure(){
    const ps=paras();if(!ps.length)return null;const top=topEdge();
    let pi=ps.length-1,f=1;
    for(let i=0;i<ps.length;i++){const r=ps[i].getBoundingClientRect();if(r.bottom>top){pi=i;f=Math.max(0,Math.min(1,(top-r.top)/Math.max(1,r.height)));break}}
    const d=document.documentElement,atEnd=d.scrollTop+innerHeight>=d.scrollHeight-60;
    const pct=atEnd?1:(pi+f)/ps.length;
    return {pi,f:+f.toFixed(3),p:+pct.toFixed(3)};
  }
  function save(force){
    if(!curId||restoring>Date.now())return;
    const m=measure();if(!m)return;
    const all=LS.get(K_POS,{}),old=all[curId]||{};
    all[curId]={pi:m.pi,f:m.f,p:Math.max(m.p,old.done?1:0),done:old.done||m.p>=.98,t:Date.now()};
    if(m.p>=.98)all[curId].done=true;
    LS.set(K_POS,all);LS.set(K_LAST,{id:curId,t:Date.now()});
  }
  function scrollToPara(pi,f,smooth){
    const ps=paras(),el=ps[Math.min(pi,ps.length-1)];if(!el)return;
    const r=el.getBoundingClientRect();
    restoring=Date.now()+900;
    scrollTo({top:Math.max(0,scrollY+r.top+(f||0)*r.height-topEdge()+8),behavior:smooth?"smooth":"auto"});
  }
  addEventListener("scroll",()=>{if(!curId)return;clearTimeout(saveT);saveT=setTimeout(save,350)},{passive:true});
  addEventListener("pagehide",()=>save());
  document.addEventListener("visibilitychange",()=>{if(document.hidden)save()});
  const posOf=id=>LS.get(K_POS,{})[id];

  /* ---------- text preparation for speech ---------- */
  const cleanSpeech=s=>s.replace(/〔[^〕]*〕|[⟦⟧]/g,"").replace(/\s+/g," ").trim();
  const gu2dev=s=>s.replace(/[ઁ-૯]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x180));
  const CONS={"ક":"k","ખ":"kh","ગ":"g","ઘ":"gh","ઙ":"n","ચ":"ch","છ":"chh","જ":"j","ઝ":"jh","ઞ":"n","ટ":"t","ઠ":"th","ડ":"d","ઢ":"dh","ણ":"n","ત":"t","થ":"th","દ":"d","ધ":"dh","ન":"n","પ":"p","ફ":"f","બ":"b","ભ":"bh","મ":"m","ય":"y","ર":"r","લ":"l","વ":"v","શ":"sh","ષ":"sh","સ":"s","હ":"h","ળ":"l"};
  const VOW={"અ":"a","આ":"aa","ઇ":"i","ઈ":"ee","ઉ":"u","ઊ":"oo","ઋ":"ru","એ":"e","ઐ":"ai","ઓ":"o","ઔ":"au","ઍ":"e","ઑ":"o"};
  const MAT={"ા":"aa","િ":"i","ી":"ee","ુ":"u","ૂ":"oo","ૃ":"ru","ે":"e","ૈ":"ai","ો":"o","ૌ":"au","ૅ":"e","ૉ":"o"};
  function gu2lat(s){
    s=s.replace(/[ँ-९]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x180)).replace(/[।॥]/g,".");
    return s.replace(/[ઁ-૯]+/g,w=>{
      let out="",pend=false,vowels=0;
      for(const ch of w){
        if(CONS[ch]){if(pend){out+="a";vowels++}out+=CONS[ch];pend=true}
        else if(MAT[ch]){out+=MAT[ch];pend=false;vowels++}
        else if(ch==="્"){pend=false}
        else if(VOW[ch]){if(pend){out+="a";vowels++}out+=VOW[ch];pend=false;vowels++}
        else if(ch==="ં"||ch==="ઁ"){if(pend){out+="a";vowels++;pend=false}out+="n"}
        else if(ch==="ઃ"){if(pend){out+="a";pend=false}out+="h"}
        else if(ch>="૦"&&ch<="૯"){if(pend){out+="a";pend=false}out+=String(ch.charCodeAt(0)-0x0AE6)}
      }
      if(pend&&!vowels)out+="a";        // one-syllable words keep their vowel; longer words drop the final schwa, as spoken
      return out;
    });
  }
  function chunks(text){
    const out=[];
    const parts=text.replace(/([.?!।॥”"])\s+/g,"$1\u0001").split("\u0001");
    for(const s of parts){
      let t=s.trim();
      while(t.length>180){let cut=t.lastIndexOf(", ",180);if(cut<60)cut=t.lastIndexOf(" ",180);if(cut<40)cut=180;out.push(t.slice(0,cut+1).trim());t=t.slice(cut+1).trim()}
      if(t)out.push(t);
    }
    return out;
  }

  /* ---------- voices ---------- */
  const synth=window.speechSynthesis;
  const kindOf=v=>{const l=(v.lang||"").toLowerCase();return l.startsWith("gu")?"gu":/^(hi|mr|sa|ne|kok|mai|bho)/.test(l)?"dev":"lat"};
  function voices(){
    if(!synth)return [];
    const vs=synth.getVoices().slice();
    const rank=v=>({gu:0,dev:1,lat:2}[kindOf(v)])*10+((v.lang||"").toLowerCase().startsWith("en-in")?0:(v.lang||"").toLowerCase().startsWith("en")?1:3);
    return vs.sort((a,b)=>rank(a)-rank(b)||a.name.localeCompare(b.name));
  }
  function pickVoice(){
    const vs=voices(),name=LS.get(K_VOICE,null);
    return vs.find(v=>v.name===name)||vs.find(v=>kindOf(v)==="gu")||vs.find(v=>kindOf(v)==="dev")||vs.find(v=>/^en-IN/i.test(v.lang))||vs[0]||null;
  }
  function textFor(raw,v){const t=cleanSpeech(raw);if(!v)return t;const k=kindOf(v);return k==="gu"?t:k==="dev"?gu2dev(t):gu2lat(t)}

  /* ---------- player ---------- */
  const P={on:false,playing:false,vid:null,pi:0,ci:0,list:[],auto:LS.get(K_AUTO,true),utter:null,gen:0};
  let bar=null;
  function ensureBar(){
    if(bar)return bar;
    bar=document.createElement("div");bar.className="rp-player";bar.setAttribute("role","region");bar.setAttribute("aria-label","Read aloud");
    bar.innerHTML=`<div class="row">
        <button class="ctl" data-a="prev" aria-label="Previous paragraph" title="Previous paragraph">${ic.prev}</button>
        <button class="ctl play" data-a="toggle" aria-label="Play">${ic.play}</button>
        <button class="ctl" data-a="next" aria-label="Next paragraph" title="Next paragraph">${ic.next}</button>
        <button class="ctl" data-a="stop" aria-label="Stop and go back to the start" title="Stop">${ic.stop}</button>
        <div class="now" aria-live="polite"></div>
        <button class="ctl x" data-a="close" aria-label="Close the player" title="Close">${ic.close}</button></div>
      <div class="row">
        <select aria-label="Voice"></select>
        <label>Speed <input type="range" min="0.5" max="1.8" step="0.05" aria-label="Reading speed"><b class="rate num"></b></label>
        <label><input type="checkbox" class="auto"> Go on to the next Vachanamrut</label></div>
      <details><summary>About the voices</summary><div class="note"></div></details>`;
    document.body.appendChild(bar);
    bar.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="toggle")P.playing?pause():play();
      else if(a==="prev"){jump(-1)}else if(a==="next"){jump(1)}
      else if(a==="stop"){stop();P.pi=0;P.ci=0;hl();status()}
      else if(a==="close")closePlayer()});
    const sel=bar.querySelector("select"),rng=bar.querySelector("input[type=range]"),auto=bar.querySelector(".auto");
    sel.onchange=()=>{LS.set(K_VOICE,sel.value);const was=P.playing;if(was){halt();P.ci=Math.max(0,P.ci);play()}note()};
    rng.value=LS.get(K_RATE,0.95);bar.querySelector(".rate").textContent=(+rng.value).toFixed(2)+"×";
    rng.oninput=()=>{LS.set(K_RATE,+rng.value);bar.querySelector(".rate").textContent=(+rng.value).toFixed(2)+"×"};
    rng.onchange=()=>{if(P.playing){halt();play()}};
    auto.checked=P.auto;auto.onchange=()=>{P.auto=auto.checked;LS.set(K_AUTO,P.auto)};
    fillVoices();
    if(synth&&"onvoiceschanged" in synth)synth.addEventListener("voiceschanged",fillVoices);
    return bar;
  }
  function fillVoices(){
    if(!bar)return;const sel=bar.querySelector("select"),vs=voices(),cur=pickVoice();
    if(!synth){sel.innerHTML=`<option>Read-aloud is not supported in this browser</option>`;sel.disabled=true;note();return}
    if(!vs.length){sel.innerHTML=`<option>Loading voices…</option>`;note();return}
    const grp={gu:[],dev:[],lat:[]};vs.forEach(v=>grp[kindOf(v)].push(v));
    const lab={gu:"Gujarati · ગુજરાતી (reads the text as printed)",dev:"Hindi and other Devanagari voices (same words in Devanagari script)",lat:"English and other voices (romanized, approximate)"};
    sel.innerHTML=Object.keys(grp).filter(k=>grp[k].length).map(k=>`<optgroup label="${esc(lab[k])}">${grp[k].map(v=>`<option value="${esc(v.name)}"${cur&&v.name===cur.name?" selected":""}>${esc(v.name)} · ${esc(v.lang)}${v.localService?"":" · online"}</option>`).join("")}</optgroup>`).join("");
    note();
  }
  function note(){
    if(!bar)return;const n=bar.querySelector(".note"),vs=voices(),v=pickVoice();
    if(!synth){n.textContent="This browser has no speech engine. Try Chrome, Edge or Safari.";return}
    const hasGu=vs.some(x=>kindOf(x)==="gu");
    let s=`The voices listed are the ones this device has (${vs.length}). `;
    if(!hasGu)s+="No Gujarati voice was found, so a Hindi voice reading the same words in Devanagari sounds closest. To add a Gujarati voice: on Android install “Speech Recognition & Synthesis by Google” and pick Gujarati; on Windows use Microsoft Edge (Dhwani, Niranjan); on iPhone, iPad and Mac choose a Hindi voice such as Lekha. ";
    if(v&&kindOf(v)==="lat")s+="This voice reads a romanized form of the Gujarati, so pronunciation is approximate. ";
    s+="Your choice of voice and speed is remembered.";n.textContent=s;
  }
  function status(){
    if(!bar)return;const v=VBYID[P.vid];
    const tb=bar.querySelector("[data-a=toggle]");tb.innerHTML=P.playing?ic.pause:ic.play;tb.setAttribute("aria-label",P.playing?"Pause":"Play");
    bar.querySelector(".now").innerHTML=v?`<b>${esc(vlabel(v))}</b> · paragraph ${Math.min(P.pi+1,v.paras.length)} of ${v.paras.length}`:"";
  }
  function hl(){
    document.querySelectorAll("#rtext p.rp-speak").forEach(p=>p.classList.remove("rp-speak"));
    if(P.vid!==curId||!P.on)return;
    const el=document.querySelector(`#rtext p[data-pi="${P.pi}"]`);if(!el)return;el.classList.add("rp-speak");
    if(P.playing){const r=el.getBoundingClientRect(),top=topEdge();if(r.top<top||r.top>innerHeight*.6){restoring=0;scrollTo({top:scrollY+r.top-top-12,behavior:"smooth"})}}
  }
  function halt(){P.gen++;if(synth)synth.cancel()}
  function speakNext(){
    const v=VBYID[P.vid];if(!v||!P.playing)return;
    if(P.list&&P.ci>=P.list.length){P.pi++;P.ci=0;P.list=null}
    if(P.pi>=v.paras.length){ // end of this Vachanamrut
      P.playing=false;status();
      const nx=T.v[v.i+1];
      if(P.auto&&nx){P.pending=nx.id;P.vid=nx.id;P.pi=0;P.ci=0;go("v-"+nx.id)}
      return;
    }
    const voice=pickVoice();
    if(!P.list){P.list=chunks(textFor(v.paras[P.pi][1],voice));if(!P.list.length){P.pi++;P.ci=0;P.list=null;return speakNext()}hl();status()}
    const u=new SpeechSynthesisUtterance(P.list[P.ci]);const g=P.gen;
    if(voice){u.voice=voice;u.lang=voice.lang}else u.lang="gu-IN";
    u.rate=LS.get(K_RATE,0.95);
    u.onend=()=>{if(g!==P.gen)return;P.ci++;speakNext()};
    u.onerror=e=>{if(g!==P.gen||/interrupted|canceled/.test(e.error))return;P.ci++;setTimeout(speakNext,50)};
    P.utter=u;synth.speak(u);
  }
  function play(){
    if(!synth){ensureBar();note();return}
    stopVideos();
    halt();P.on=true;P.playing=true;if(!P.list||P.vid!==curId){P.list=null}
    if(P.vid!==curId){P.vid=curId;const pos=posOf(curId);P.pi=pos&&!pos.done?pos.pi:0;P.ci=0;P.list=null}
    document.body.classList.add("rp-playing");status();
    if(synth.paused)synth.resume();
    speakNext();
  }
  function pause(){halt();P.playing=false;status()}  // cancel+restart is more reliable than pause() on Android and Chrome
  function stop(){halt();P.playing=false;P.ci=0;P.list=null;status()}
  function jump(d){const v=VBYID[P.vid||curId];if(!v)return;const was=P.playing;halt();P.vid=v.id;P.pi=Math.max(0,Math.min(v.paras.length-1,P.pi+d));P.ci=0;P.list=null;hl();status();if(was){P.playing=true;speakNext()}else{const el=document.querySelector(`#rtext p[data-pi="${P.pi}"]`);el&&scrollToPara(P.pi,0,true)}}
  function openPlayer(){ensureBar();bar.hidden=false;document.body.classList.add("rp-playing");fillVoices();status();play()}
  function closePlayer(){stop();P.on=false;hl();if(bar)bar.hidden=true;document.body.classList.remove("rp-playing");syncBtn()}
  function syncBtn(){const b=document.querySelector("#rp-listen");if(b)b.classList.toggle("on",!!(P.on&&bar&&!bar.hidden))}

  /* ---------- videos ---------- */
  function stopVideos(){document.querySelectorAll(".rp-video").forEach(x=>x.remove());document.querySelectorAll(".rp-tools .rp-btn[data-pl]").forEach(b=>b.classList.remove("on"))}
  function showVideo(btn,pl,vidId){
    const open=btn.classList.contains("on");stopVideos();if(open)return;
    if(P.playing)pause();
    btn.classList.add("on");
    const box=document.createElement("div");box.className="rp-video";
    const watch=`https://www.youtube.com/watch?v=${vidId}&list=${pl.list}`;
    box.innerHTML=`<div class="frame"><iframe src="https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1&rel=0&modestbranding=1" title="${esc(pl.en)} reading" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
      <div class="cap">Source: <a href="${watch}" target="_blank" rel="noopener">this video on YouTube ↗</a>, from the playlist <a href="https://www.youtube.com/playlist?list=${pl.list}" target="_blank" rel="noopener">${esc(pl.title)}</a> by <b>${esc(pl.en)}</b> (<span class="gu">${esc(pl.gu)}</span>). Matched to this Vachanamrut by its title.</div>`;
    btn.closest(".rp-tools").after(box);
  }

  /* ---------- hooks called by index.html ---------- */
  function onReader(v){
    clearTimeout(saveT);restoring=Date.now()+700;curId=v.id;
    if(P.on&&P.vid!==v.id&&P.pending!==v.id){stop();P.vid=null}
    const head=document.querySelector(".rhead");
    if(head){
      const tools=document.createElement("div");tools.className="rp-tools";
      const vids=(VID&&VID.playlists||[]).map(pl=>pl.v[v.id]?`<button class="rp-btn" data-pl="${pl.key}" title="Play the reading by ${esc(pl.en)}">${ic.yt}<span>${esc(pl.key==="rajkot"?"Gurukul Rajkot":"Gyanjivandasji Swami")}</span></button>`:"").join("");
      tools.innerHTML=`<button class="rp-btn primary" id="rp-listen" title="Read this Vachanamrut aloud">${ic.spk}<span>સાંભળો · Listen</span></button>${vids||(VID?`<span class="rp-novideo">No reading of this one in the two YouTube playlists yet.</span>`:"")}`;
      head.appendChild(tools);
      tools.querySelector("#rp-listen").onclick=()=>{if(P.on&&bar&&!bar.hidden&&P.vid===curId){P.playing?pause():play()}else openPlayer();syncBtn()};
      tools.querySelectorAll("[data-pl]").forEach(b=>{const pl=VID.playlists.find(p=>p.key===b.dataset.pl);b.onclick=()=>showVideo(b,pl,pl.v[v.id])});
    }
    const pos=posOf(v.id),jumping=state.hl&&(state.hl.target||state.hl.para!=null||(state.hl.forms&&state.hl.forms.size));
    if(P.pending===v.id){P.pending=null;P.on=true;P.playing=true;P.vid=v.id;P.pi=0;P.ci=0;P.list=null;ensureBar();bar.hidden=false;document.body.classList.add("rp-playing");requestAnimationFrame(()=>{scrollTo(0,0);speakNext()});syncBtn();return}
    if(P.on&&P.vid===v.id){requestAnimationFrame(()=>{hl();scrollToPara(P.pi,0)});syncBtn();return}
    syncBtn();
    if(!jumping&&pos&&!pos.done&&(pos.pi>0||pos.f>.02)){
      const go2=()=>scrollToPara(pos.pi,pos.f);
      requestAnimationFrame(()=>requestAnimationFrame(go2));
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>setTimeout(go2,60));
      const note=document.createElement("div");note.className="rp-resume";note.setAttribute("role","status");
      note.innerHTML=`<span>Opened where you stopped reading, paragraph ${pos.pi+1} of ${v.paras.length} (${Math.round(pos.p*100)}% read).</span><button type="button" data-a="top">Start from the top</button>`;
      const txt=document.querySelector("#rtext");txt&&txt.before(note);
      note.querySelector("[data-a=top]").onclick=()=>{restoring=0;scrollTo({top:0});const all=LS.get(K_POS,{});delete all[v.id];LS.set(K_POS,all);note.remove()};
    }else{LS.set(K_LAST,{id:v.id,t:Date.now()})}
  }
  function onLeave(h){clearTimeout(saveT);save();if(!/^v-/.test(h)){curId=null;if(P.on&&!P.pending){stop()}}}
  function resume(){const last=LS.get(K_LAST,null);const id=last&&VBYID[last.id]?last.id:"INTRO";state.hl=null;go("v-"+id)}
  function onHome(){
    const main=document.querySelector("#main");if(!main)return;
    const last=LS.get(K_LAST,null),v=last&&VBYID[last.id],pos=v&&posOf(v.id);
    const card=document.createElement("section");card.className="rp-cont";
    if(v){
      const p=pos?Math.round((pos.done?1:pos.p)*100):0,nx=pos&&pos.done?T.v[v.i+1]:null;
      card.innerHTML=`<div class="eyebrow">${nx?"Next to read":"Continue reading"}</div>
        <div><h2>${esc(vlabel(nx||v))} · ${esc((nx||v).title)}</h2><div class="meta">${nx?`You finished ${esc(vlabel(v))}.`:`${p}% read · paragraph ${(pos?pos.pi:0)+1} of ${v.paras.length}`} Your place is kept on this device.</div></div>
        <div class="acts"><a class="rp-btn primary" href="#v-${(nx||v).id}">${ic.play}<span>${nx?"Read next":"Resume"}</span></a><a class="rp-btn" href="#contents">All Vachanamruts</a></div>
        <div class="bar"><i style="width:${nx?0:p}%"></i></div>`;
    }else{
      card.innerHTML=`<div class="eyebrow">Read the Vachanamrut</div>
        <div><h2>The complete Gujarati text, ${T.v.filter(x=>MAIN.includes(x.sec)).length} Vachanamruts</h2><div class="meta">Read here, listen to it read aloud, or watch the readings by Gurukul Rajkot and Pu. Gyanjivandasji Swami (Kundaldham). The page remembers where you stop.</div></div>
        <div class="acts"><a class="rp-btn primary" href="#v-GP-1">${ic.play}<span>Start reading</span></a><a class="rp-btn" href="#v-INTRO">Partharo</a></div>`;
    }
    main.prepend(card);
  }
  function onContents(){
    const all=LS.get(K_POS,{});
    document.querySelectorAll("#main .tocrow[href^='#v-']").forEach(a=>{const id=decodeURIComponent(a.getAttribute("href").slice(3)),p=all[id];if(!p)return;
      a.classList.add("rp-has");a.style.setProperty("--rp",p.done?1:p.p);a.title=p.done?"Read":`${Math.round(p.p*100)}% read`;
      if(p.done){const b=a.querySelector("b");b&&b.insertAdjacentHTML("beforeend",`<span class="rp-done" aria-label="read">✓</span>`)}});
  }
  async function loadVideos(){try{const r=await fetch("data/videos.json");if(r.ok)VID=await r.json()}catch(e){}return VID}
  function sourcesHTML(){
    if(!VID)return "";
    const ids=T.v.filter(v=>!VID.playlists.every(p=>p.v[v.id])).map(v=>vlabel(v));
    return `<section class="block"><header><h2>Readings on YouTube</h2><span class="muted">Linked from each Vachanamrut in the reader</span></header>
      <p class="note">Each video was matched to a Vachanamrut by the section name and number in its title (checked ${esc(VID.checked)}). The text on this site is the printed Gujarati edition listed below; the videos are linked, not copied, and stay on YouTube.</p>
      <div class="toc">${VID.playlists.map(p=>`<a class="tocrow" href="https://www.youtube.com/playlist?list=${p.list}" target="_blank" rel="noopener"><b>${Object.keys(p.v).length}</b><span class="t">${esc(p.title)} · <span class="gu">${esc(p.gu)}</span> · ${esc(p.kind)}</span><span class="p">YouTube ↗</span></a>`).join("")}</div>
      <p class="note">Not in either playlist: ${ids.map(esc).join(", ")}.</p>
      <p class="note">Read-aloud uses your browser's own speech voices (the Web Speech API); nothing is sent to this site. Hindi voices read the same Gujarati words converted letter for letter to Devanagari.</p></section>`;
  }
  return {onReader,onLeave,onHome,onContents,resume,loadVideos,sourcesHTML,save};
})();
window.RP=RP;
