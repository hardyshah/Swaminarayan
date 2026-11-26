/* SPScores: one shared score log for every game on the site, kept in this browser (localStorage "sp-scores").
   For the login / satsang-score work: listen for the "sp:score" event on window, or call SPScores.all().
   Record shape: {game:"kids-quiz", title:"Bal quiz", level:"kid"|"teen"|"adult", score:7, max:10, stars:0..3, at:ISO time, day:"YYYY-MM-DD"}
   A server-side account can later import SPScores.all() once and then post each new record from the event. */
(function(){
"use strict";
if(window.SPScores)return;
const KEY="sp-scores",cbs=[];
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(v)?v:[]}catch(e){return []}};
const write=a=>{try{localStorage.setItem(KEY,JSON.stringify(a.slice(-500)))}catch(e){}};
const day=d=>{const x=d||new Date();return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
function add(r){const rec=Object.assign({at:new Date().toISOString(),day:day()},r);
  rec.stars=rec.stars!=null?rec.stars:(rec.max?(rec.score/rec.max>=.9?3:rec.score/rec.max>=.6?2:rec.score>0?1:0):0);
  const a=read();a.push(rec);write(a);
  try{window.dispatchEvent(new CustomEvent("sp:score",{detail:rec}))}catch(e){}
  cbs.forEach(f=>{try{f(rec)}catch(e){}});
  // signed-in member (members area, window.SPC): add the points to their satsang score
  try{if(window.SPC&&rec.score>0)SPC.whenReady().then(S=>S.session().then(s=>s&&S.addActivity({kind:"quiz",qty:rec.score,note:rec.title||rec.game}))).catch(()=>{})}catch(e){}
  return rec}
function best(game){return read().filter(r=>r.game===game).reduce((m,r)=>Math.max(m,r.max?r.score/r.max:0),0)}
function streak(){const days=new Set(read().map(r=>r.day));let n=0;const d=new Date();
  if(!days.has(day(d)))d.setDate(d.getDate()-1);while(days.has(day(d))){n++;d.setDate(d.getDate()-1)}return n}
function stars(){return read().reduce((s,r)=>s+(r.stars||0),0)}
window.SPScores={add,all:read,best,streak,stars,day,on:f=>cbs.push(f),clear:()=>write([])};
})();
