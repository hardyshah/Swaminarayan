"""Build the site-wide book links and the per-book "cited on this site" index.

  python3 tools/books/build.py

Writes
  site/books.js                                   (registry + linker, loaded by site/sp.js)
  vachanamrut-concordance/data/books.json         (cards for the library's new shelves)
  vachanamrut-concordance/data/book-refs.json     (index: where each book is cited)

Run tools/books/crosscheck.py first when the cross-check changes.
"""
import html, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from registry import BOOKS

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = lambda *p: os.path.join(ROOT, *p)
GUD = str.maketrans('૧૨૩૪', '1234')

PAGES = [  # path, title shown in the index
    ('index.html', 'Home'),
    ('panchang.html', 'Panchang'),
    ('vedic-time.html', 'Vedic time'),
    ('vedas.html', 'The Vedas'),
    ('solar-system.html', 'Solar system and Jyotish'),
    ('shangaar.html', 'Shangaar'),
    ('murti-3d/index.html', 'Murti 3D'),
    ('kaal-patrak/index.html', 'Kaal Patrak'),
    ('vicharan/index.html', 'Vicharan map'),
    ('vachanamrut-concordance/index.html', 'Vachanamrut concordance'),
    ('vachanamrut-concordance/timeline.html', 'Shriji Maharaj logbook'),
    ('vachanamrut-concordance/live.html', 'Live darshan'),
    ('vachanamrut-concordance/ebooks.html', 'E-books'),
]

def py_re(src):
    # JS and Python regex agree for everything the registry uses
    return re.compile(src)

REGS = [(b, py_re(b['re'])) for b in BOOKS]

def target(b, matched):
    """Which library card a matched name points to (parts: Satsang Prabha 2 -> satsang-prabha-2)."""
    if b.get('parts'):
        m = re.search(r'(\d)\s*$', matched.translate(GUD))
        n = int(m.group(1)) if m else 1
        n = min(max(n, 1), len(b['parts']))
        return b['parts'][n - 1]
    return b['id']

def find_books(text):
    hits = []
    for b, rx in REGS:
        for m in rx.finditer(text):
            hits.append((m.start(), m.end(), target(b, m.group(0))))
    # drop overlaps, keep the longest
    hits.sort(key=lambda h: (h[0], -(h[1] - h[0])))
    out, end = [], -1
    for h in hits:
        if h[0] >= end:
            out.append(h); end = h[1]
    return out

def snippet(t, a, b, w=70):
    s = t[max(0, a - w):min(len(t), b + w)].strip()
    return ('…' if a > w else '') + s + ('…' if b + w < len(t) else '')

TAG = re.compile(r'<(/?)([a-zA-Z0-9]+)([^>]*)>', re.S)

def scan_static(path, title):
    """Visible text of a page (scripts, styles, nav and header left out), with the nearest heading and id."""
    s = open(J(path), encoding='utf-8').read()
    s = re.sub(r'<!--.*?-->', ' ', s, flags=re.S)
    s = re.sub(r'<(script|style|svg|template)\b.*?</\1>', ' ', s, flags=re.S | re.I)
    s = re.sub(r'<(nav|header)\b.*?</\1>', ' ', s, flags=re.S | re.I)
    head, anchor, inhead, headbuf = '', '', False, []
    refs = {}
    pos = 0
    def text_chunk(raw):
        nonlocal headbuf
        t = re.sub(r'\s+', ' ', html.unescape(raw))
        if inhead: headbuf.append(t)
        for a, b, tid in find_books(t):
            k = (tid, anchor, head)
            e = refs.setdefault(k, dict(p=title, u=path + (('#' + anchor) if anchor else ''), s=head, x=snippet(t, a, b), n=0))
            e['n'] += 1
    for m in TAG.finditer(s):
        text_chunk(s[pos:m.start()])
        pos = m.end()
        close, name, attrs = m.group(1), m.group(2).lower(), m.group(3)
        idm = re.search(r'\sid="([^"]+)"', attrs)
        if name in ('h1', 'h2', 'h3'):
            if not close:
                inhead = True; headbuf = []
                if idm: anchor = idm.group(1)
            else:
                inhead = False; head = re.sub(r'\s+', ' ', ' '.join(headbuf)).strip()[:90]
        elif idm and not close and name in ('section', 'article', 'div', 'details', 'aside', 'footer', 'main'):
            anchor = idm.group(1)
    text_chunk(s[pos:])
    out = {}
    for (tid, _, _), e in refs.items():
        out.setdefault(tid, []).append(e)
    return out

def add(idx, tid, e):
    idx.setdefault(tid, []).append(e)

def scan_kaal(idx):
    s = open(J('kaal-patrak/index.html'), encoding='utf-8').read()
    d = json.loads(re.search(r'<script id="data"[^>]*>(.*?)</script>', s, re.S).group(1))
    vach = 0
    for x in d['dina']:
        y, m, dd = x['date'].split('-')
        url = f'kaal-patrak/#d{int(y)}-{int(m)}-{int(dd)}'
        if x.get('kind') == 'vachanamrut':
            vach += 1; continue
        text = ' '.join([x.get('src', '')] + [l[1] for l in x.get('log', []) if len(l) > 1])
        seen = set()
        for a, b, tid in find_books(text):
            if tid in seen: continue
            seen.add(tid)
            add(idx, tid, dict(p='Kaal Patrak', u=url, s=f"{x['date']} · {x['title']}", x=snippet(text, a, b, 60), n=1, d=x['date']))
    days = sum(1 for r in d['book'] if r[5])
    add(idx, 'shri-swaminarayanam', dict(p='Kaal Patrak', u='kaal-patrak/', s='Day-by-day text of the granth, 1781–1830',
        x=f'{days:,} days carry the granth\'s own words, with its tithi and page number.', n=days, top=1))
    add(idx, 'vachanamrut', dict(p='Kaal Patrak', u='kaal-patrak/', s='A day page for every dated Vachanamrut',
        x=f'{vach} days, each linking to the Vachanamrut in the concordance.', n=vach, top=1))

def scan_vicharan(idx):
    s = open(J('vicharan/index.html'), encoding='utf-8').read()
    m = re.search(r'<script id="data"[^>]*>(.*?)</script>', s, re.S)
    n = len(re.findall(r'"\d{4}-\d{2}-\d{2}"', m.group(1))) if m else 0
    add(idx, 'shri-swaminarayanam', dict(p='Vicharan map', u='vicharan/', s='Every village Shri Hari visited, dated from the granth',
        x='Each place lists its days in Shri Swaminarayanam, with the page scan.', n=max(n, 1), top=1))

def scan_home(idx):
    h = json.load(open(J('data/home/history.json'), encoding='utf-8'))
    add(idx, 'shri-swaminarayanam', dict(p='Home', u='index.html', s='Today in history',
        x=f"{len(h['b']):,} runs of days from the granth, shown by tithi and by date.", n=len(h['b']), top=1))
    add(idx, 'vachanamrut', dict(p='Home', u='index.html', s='Today in history',
        x=f"{len(h['vach'])} dated Vachanamruts, shown on their day.", n=len(h['vach']), top=1))

BIB = {'bhagavat': 'shrimad-bhagwat-mahapuran', 'gita': 'bhagavad-gita', 'shikshapatri': 'shikshapatri',
       'vasudevmahatmya': 'vasudev-mahatmya'}

def scan_biblio(idx):
    for b in json.load(open(J('vachanamrut-concordance/data/biblio.json'), encoding='utf-8')):
        if b['key'] in BIB:
            add(idx, BIB[b['key']], dict(p='Vachanamrut concordance', u='vachanamrut-concordance/index.html#sources',
                s='Scriptures the Vachanamrut cites', x=f"Named {b['count']} times in {b['vachanamruts']} Vachanamruts, each mention listed.", n=b['count'], top=1))
    nd = json.load(open(J('vachanamrut-concordance/data/nondh.json'), encoding='utf-8'))
    nt = len(nd.get('topics', []))
    add(idx, 'vachanamrut-nondh', dict(p='Vachanamrut concordance', u='vachanamrut-concordance/index.html#nondh',
        s='The Nondh, searchable', x=f'{nt:,} topics, each reference opening the passage in the Vachanamrut.', n=nt, top=1))
    add(idx, 'vachanamrut', dict(p='Vachanamrut concordance', u='vachanamrut-concordance/index.html#contents',
        s='Read and search the Vachanamrut', x='All 273 Vachanamruts, word index and glossary.', n=273, top=1))
    add(idx, 'vachanamrut', dict(p='Shriji Maharaj logbook', u='vachanamrut-concordance/timeline.html',
        s='All 273 Vachanamruts by date', x='Dated 21 Nov 1819 – 25 Jul 1829.', n=273, top=1))

def scan_crosscheck(idx):
    p = J('vachanamrut-concordance/data/book-crosscheck.json')
    if not os.path.exists(p): return
    for it in json.load(open(p, encoding='utf-8'))['items']:
        for r in it['refs']:
            add(idx, r['book'], dict(p='Library cross-check', u=f"vachanamrut-concordance/library.html#xc-{it['id']}",
                s=(it['date'] + ' · ' if it.get('date') else '') + it['en'], x=f"PDF p. {r['page']} · {it['status']}", n=1,
                pdf=f"vachanamrut-concordance/{r['url']}", d=it.get('date') or ''))

def build_index():
    idx = {}
    for path, title in PAGES:
        for tid, es in scan_static(path, title).items():
            for e in es: add(idx, tid, e)
    scan_kaal(idx); scan_vicharan(idx); scan_home(idx); scan_biblio(idx); scan_crosscheck(idx)
    # sort: summary rows first, then by page, then date
    order = {t: i for i, (_, t) in enumerate(PAGES)}
    for tid in idx:
        idx[tid].sort(key=lambda e: (-e.get('top', 0), order.get(e['p'], 99), e.get('d', ''), e['s']))
    return idx

LINKER = r"""
/* Book links: every book name on the site links to its card in the Satsang Library.
   Built by tools/books/build.py from tools/books/registry.py. Do not edit by hand. */
(function(){
"use strict";
var B=__BOOKS__;
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
"""

def main():
    reg = [{k: b[k] for k in ('id', 'en', 'gu', 're', 'parts') if b.get(k)} for b in BOOKS]
    js = LINKER.replace('__BOOKS__', json.dumps(reg, ensure_ascii=False, separators=(',', ':')))
    open(J('site/books.js'), 'w', encoding='utf-8').write(js.lstrip())
    cards = [{k: v for k, v in b.items() if k not in ('re',)} for b in BOOKS if b['shelf'] != 'library']
    json.dump(cards, open(J('vachanamrut-concordance/data/books.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    idx = build_index()
    json.dump(idx, open(J('vachanamrut-concordance/data/book-refs.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    for tid in sorted(idx, key=lambda t: -len(idx[t])):
        print(f'{tid:34s} {len(idx[tid]):4d} entries  pages: {sorted(set(e["p"] for e in idx[tid]))}')
    known = {b['id'] for b in BOOKS} | {p for b in BOOKS for p in b.get('parts', [])}
    unknown = set(idx) - known
    if unknown: print('UNKNOWN ids', unknown)

if __name__ == '__main__':
    main()
