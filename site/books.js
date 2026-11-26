/* Book links: every book name on the site links to its card in the Satsang Library.
   Built by tools/books/build.py from tools/books/registry.py. Do not edit by hand. */
(function(){
"use strict";
var B=[{"id":"vachanamrut","en":"Vachanamrut","gu":"વચનામૃત","re":"Vachanamrut(?!\\s+(?:Nondh|Concordance))|Vachnamrut|વચનામૃત(?!\\s*નોંધ)"},{"id":"vachanamrut-nondh","en":"Vachanamrut Nondh","gu":"વચનામૃત નોંધ","re":"Vachanamrut Nondh|વચનામૃત નોંધ"},{"id":"shrimad-bhagwat-mahapuran","en":"Shrimad Bhagwat Mahapuran","gu":"શ્રીમદ્ ભાગવત મહાપુરાણ","re":"(?:Shrimad |Shreemad |Śrīmad )?Bh[aā]g[aā]?[wv]a?t(?:a)?(?: Mah[aā]pur[aā]n[aā]?| Pur[aā]ṇ?a)?(?! Shah)(?!\\w)|(?:શ્રીમદ્\\s?)?ભાગવત(?![ા-્])"},{"id":"ashtako-ane-kirtano","en":"Ashtako ane Kirtano","gu":"અષ્ટકો અને કીર્તનો","re":"Ashtako ane Kirtano|અષ્ટકો અને કીર્તનો"},{"id":"nimit-matra","en":"Nimit Matra","gu":"નિમિત્ત માત્ર","re":"Nimit Matra(?: \\d)?|નિમિત્ત માત્ર(?:\\s?[–-]?\\s?[૧૨૩૪])?","parts":["nimit-matra-1","nimit-matra-2","nimit-matra-3","nimit-matra-4"]},{"id":"amrutvarsha","en":"Amrutvarsha","gu":"અમૃતવર્ષા","re":"Amrutvarsha(?: \\d)?|અમૃતવર્ષા","parts":["amrutvarsha-1","amrutvarsha-2"]},{"id":"satsang-prabha","en":"Satsang Prabha","gu":"સત્સંગ પ્રભા","re":"Satsang Prabha(?: \\d)?|સત્સંગ પ્રભા","parts":["satsang-prabha-1","satsang-prabha-2","satsang-prabha-3","satsang-prabha-4"]},{"id":"smruti-ank-satsang-pradeep","en":"Smruti Ank · Satsang Pradeep","gu":"સ્મૃતિ અંક · સત્સંગ પ્રદીપ","re":"Smruti Ank|Satsang Pradeep|સ્મૃતિ અંક|સત્સંગ પ્રદીપ"},{"id":"shri-swaminarayanam","en":"Shri Swaminarayanam","gu":"શ્રી સ્વામિનારાયણમ્","re":"Shri Swaminarayanam|Shree Swaminarayanam|શ્રી સ્વામિનારાયણમ્"},{"id":"bhaktachintamani","en":"Bhaktachintamani","gu":"ભક્તચિંતામણિ","re":"Bhakta ?[Cc]hintamani|Bhaktachintamni|ભક્તચિંતામણિ|ભક્તચિંતામણી"},{"id":"shikshapatri","en":"Shikshapatri","gu":"શિક્ષાપત્રી","re":"Shikshapatri(?! Bhashya)|શિક્ષાપત્રી(?!\\s*ભાષ્ય)"},{"id":"satsangi-jivan","en":"Satsangi Jivan","gu":"સત્સંગિજીવન","re":"Satsangi ?[Jj]ivan|Satsangijivan|સત્સંગિજીવન|સત્સંગીજીવન"},{"id":"harililamrut","en":"Shri Harililamrut","gu":"શ્રી હરિલીલામૃત","re":"Harililamrut|Harilila ?[Aa]mrut|હરિલીલામૃત"},{"id":"desh-vibhag-lekh","en":"Desh Vibhag no Lekh","gu":"દેશવિભાગનો લેખ","re":"Desh ?Vibhag(?: no)? Lekh|દેશવિભાગ(?:નો)? લેખ"},{"id":"kutch-lila","en":"Kutch Lila","gu":"કચ્છ લીલા","re":"Kutch Leela|Kutch Lila|કચ્છ લીલા"},{"id":"life-and-faith","en":"Life and Faith of Lord Swaminarayan","re":"Life (?:and|&) Faith of Lord Swaminarayan"},{"id":"social-reformer","en":"Social Reformer Lord Shree Swaminarayan","re":"Social Reformer Lord Shree Swaminarayan|Social Reformer booklet"},{"id":"vasudev-mahatmya","en":"Vasudev Mahatmya","gu":"વાસુદેવ માહાત્મ્ય","re":"V[aā]sudeva? M[aā]h[aā]tmya|વાસુદેવ ?માહાત્મ્ય"},{"id":"bhagavad-gita","en":"Bhagavad Gita","gu":"ભગવદ્ ગીતા","re":"Bhagavad[ -]G[iī]t[aā]|Bhagwad Gita|ભગવદ્\\s?ગીતા"},{"id":"rigveda","en":"Rigveda","gu":"ઋગ્વેદ","re":"Rig[- ]?[Vv]eda|RigVeda|ઋગ્વેદ|ऋग्वेद"},{"id":"samaveda","en":"Samaveda","gu":"સામવેદ","re":"Samaveda|સામવેદ|सामवेद"},{"id":"yajurveda","en":"Yajurveda (Vajasaneyi Samhita)","gu":"યજુર્વેદ","re":"Yajurveda|Vajasaneyi Samhita|યજુર્વેદ|यजुर्वेद"},{"id":"atharvaveda","en":"Atharvaveda","gu":"અથર્વવેદ","re":"Atharvaveda|અથર્વવેદ|अथर्ववेद"},{"id":"shatapatha-brahmana","en":"Shatapatha Brahmana","gu":"શતપથ બ્રાહ્મણ","re":"Shatapatha(?: Brahmana)?|શતપથ"},{"id":"vedanga-jyotisha","en":"Vedanga Jyotisha","gu":"વેદાંગ જ્યોતિષ","re":"Vedanga Jyotisha"},{"id":"surya-siddhanta","en":"Surya Siddhanta","gu":"સૂર્ય સિદ્ધાંત","re":"S[uū]rya Siddh[aā]nta|સૂર્ય ?સિદ્ધાંત"},{"id":"aryabhatiya","en":"Aryabhatiya","gu":"આર્યભટીય","re":"[AĀ]ryabhat[iī]ya"},{"id":"siddhanta-shiromani","en":"Siddhanta Shiromani","re":"Siddhanta Shiromani"},{"id":"brihat-samhita","en":"Brihat Samhita","re":"Brihat Samhita"},{"id":"brihat-parashara-hora-shastra","en":"Brihat Parashara Hora Shastra","re":"Brihat Parashara Hora Shastra"},{"id":"vishnu-purana","en":"Vishnu Purana","gu":"વિષ્ણુ પુરાણ","re":"Vishnu Purana|વિષ્ણુ ?પુરાણ"},{"id":"nirukta","en":"Nirukta","re":"Nirukta"},{"id":"chandahshastra","en":"Chandahshastra","re":"Chandah[sś]h?[aā]stra"},{"id":"shulba-sutras","en":"Shulba Sutras","re":"S[hu]ulba ?[Ss]utras|Sulbasutras"}];
var me=document.currentScript&&document.currentScript.src;
var LIB=me?new URL("../vachanamrut-concordance/library.html",me).href:"/Swaminarayan/vachanamrut-concordance/library.html";
var here=location.href.split("#")[0];
var onLib=here.replace(/\/$/,"")===LIB.replace(/\/$/,"");
var src=B.map(function(b,i){return "(?<g"+i+">"+b.re+")"}).join("|");
var RX;try{RX=new RegExp(src,"g")}catch(e){return}
var SKIP=/^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|CODE|PRE|BUTTON|SVG|NAV|TITLE|NOSCRIPT|CANVAS)$/;
var BLOCK=/^(P|LI|TD|TH|DD|DT|H1|H2|H3|H4|H5|H6|FIGCAPTION|BLOCKQUOTE|SUMMARY|DIV|SECTION|ARTICLE|FOOTER|ASIDE|LABEL|SPAN)$/;
var done=new WeakMap();
var GUD={"૧":"1","૨":"2","૩":"3","૪":"4"};
function tid(i,t){var b=B[i];if(!b.parts)return b.id;var m=t.replace(/[૧-૪]/g,function(c){return GUD[c]}).match(/(\d)\s*$/);var n=m?+m[1]:1;n=Math.min(Math.max(n,1),b.parts.length);return b.parts[n-1]}
function href(id){return onLib?"#b-"+id:LIB+"#b-"+id}
function blockOf(n){for(var e=n.parentElement;e;e=e.parentElement){if(/^(P|LI|TD|TH|DD|H1|H2|H3|H4|H5|H6|FIGCAPTION|BLOCKQUOTE|SUMMARY|ARTICLE|SECTION|FOOTER|ASIDE)$/.test(e.tagName))return e;if(e.tagName==="DIV"&&e.childElementCount<8)return e}return document.body}
function skip(n){for(var e=n.parentElement;e;e=e.parentElement){if(SKIP.test(e.tagName))return true;if(e.classList&&(e.classList.contains("bk-ref")||e.classList.contains("bk-mark")))return true;if(e.hasAttribute&&e.hasAttribute("data-no-books"))return true;if(e.id==="theme-menu"||e.getAttribute&&e.getAttribute("role")==="dialog"&&e.classList.contains("sp-menu"))return true;if(e.tagName==="HEADER"&&e.classList.contains("top"))return true}return false}
function linkAncestor(n){for(var e=n.parentElement;e;e=e.parentElement){if(e.tagName==="A")return e}return null}
function walk(root){
  if(!root||root.nodeType!==1&&root.nodeType!==3)return;
  var list=[];
  if(root.nodeType===3){list.push(root)}else{
    if(SKIP.test(root.tagName))return;
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);var t;while(t=w.nextNode())list.push(t)}
  for(var k=0;k<list.length;k++)one(list[k]);
}
function one(t){
  var s=t.nodeValue;if(!s||s.length<4)return;
  RX.lastIndex=0;if(!RX.test(s))return;
  if(!t.parentElement||skip(t))return;
  var blk=blockOf(t),got=done.get(blk);if(!got){got={};done.set(blk,got)}
  var a=linkAncestor(t);
  RX.lastIndex=0;var m,last=0,frag=null,marks=[];
  while(m=RX.exec(s)){
    var gi=-1;for(var g in m.groups){if(m.groups[g]!==undefined){gi=+g.slice(1);break}}
    if(gi<0)continue;var id=tid(gi,m[0]);
    if(got[id])continue;got[id]=1;
    if(t.parentElement.closest&&t.parentElement.closest("#b-"+id))continue;
    if(a){if(a.classList.contains("bk-ref"))continue;if(!(a.href||"").includes("library.html#b-"))marks.push(id);continue}
    if(!frag)frag=document.createDocumentFragment();
    frag.appendChild(document.createTextNode(s.slice(last,m.index)));
    var l=document.createElement("a");l.className="bk-ref";l.href=href(id);l.textContent=m[0];
    l.title="Satsang Library: "+(B[gi].en)+(B[gi].gu?" · "+B[gi].gu:"");frag.appendChild(l);last=m.index+m[0].length;
  }
  if(frag){frag.appendChild(document.createTextNode(s.slice(last)));t.parentNode.replaceChild(frag,t)}
  if(a&&marks.length){var at=a;marks.forEach(function(id){var x=document.createElement("a");x.className="bk-mark";x.href=href(id);x.textContent="📚";x.title="In the Satsang Library";x.setAttribute("aria-label","Book entry in the Satsang Library");at.after(x);at=x})}
}
var css=document.createElement("style");
css.textContent=".bk-ref{color:inherit;text-decoration:underline dotted;text-decoration-thickness:1px;text-underline-offset:3px}.bk-ref:hover{text-decoration-style:solid}.bk-mark{font-size:.8em;margin-left:2px;text-decoration:none!important;vertical-align:super;opacity:.75}.bk-mark:hover{opacity:1}";
document.head.appendChild(css);
var q=[],busy=false;
function flush(){busy=false;var n=q.splice(0);obs.disconnect();for(var i=0;i<n.length;i++)if(n[i].isConnected)walk(n[i]);obs.observe(document.body,{childList:true,subtree:true,characterData:true})}
var obs=new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var r=ms[i];if(r.type==="characterData")q.push(r.target);else for(var j=0;j<r.addedNodes.length;j++)q.push(r.addedNodes[j])}if(!busy){busy=true;setTimeout(flush,250)}});
function start(){walk(document.body);obs.observe(document.body,{childList:true,subtree:true,characterData:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
window.SPBooks={books:B,library:LIB,relink:function(){walk(document.body)}};
})();
