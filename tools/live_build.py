#!/usr/bin/env python3
# Build data/live.json from the official sites of the Nar Narayan Dev Gadi (Kalupur) only.
# Run on a schedule by .github/workflows/live.yml. A source that fails keeps its last good data.
import datetime,html,json,os,re,sys,urllib.parse,urllib.request
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','vachanamrut-concordance','data','live.json')
SITE='https://www.swaminarayan.info'
CHANNEL='UCSOO8aliEwUKxIVkk5Igz-A'      # youtube.com/@swaminarayantemplekalupur
KALUPUR='63d045f0d9918f9bc9dea12f'      # Kalupur's id on the darshan server
DARSHAN=f'https://dailydarshanserver.nnd.media/api/iframe/temple?mode=dark&id={KALUPUR}'
# nothing is published unless it comes from these hosts...
HOSTS=('swaminarayan.info','swaminarayan.in','swaminarayan.faith','staticflickr.com','youtube.com','ytimg.com')
# ...and nothing naming another organisation gets through, whatever the host
BLOCK=re.compile(r'\bbaps\b|bochasan|akshar[\s-]*purushottam|pramukh\s*swami|mahant\s*swami\s*maharaj|akshardham',re.I)
UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'en'}
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30) as r:
        return r.read().decode('utf-8','replace')
def ok(*vals):
    for v in vals:
        if BLOCK.search(v or ''):return False
    return True
def allowed(u):
    h=urllib.parse.urlparse(u).hostname or ''
    return any(h==d or h.endswith('.'+d) for d in HOSTS)
def text(s):return html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',s))).strip()
MONTHS='January February March April May June July August September October November December'.split()
def dates(s):
    out=[]
    for d,m,y in re.findall(r'(\d{1,2})(?:st|nd|rd|th)\s+([A-Z][a-z]+)\s+(\d{4})',s):
        if m in MONTHS:out.append(f'{y}-{MONTHS.index(m)+1:02d}-{int(d):02d}')
    return out
def events(page):
    E=[]
    for b in re.split(r'(?=<div class="eb-category-)',page)[1:]:
        a=re.search(r'class="eb-event-title" href="([^"]+)">(.*?)</a>',b,re.S)
        w=re.search(r'eb-event-date-time">.*?</i>(.*?)</div>',b,re.S)
        if not a or not w:continue
        u=urllib.parse.urljoin(SITE,a.group(1));t=text(a.group(2));when=text(w.group(1));ds=dates(when)
        i=re.search(r'class="eb-event-thumb-link">\s*<img[^>]*?src="([^"]+)"',b,re.S)
        img=urllib.parse.urljoin(SITE,i.group(1)) if i else None
        p=re.search(r'eb-event-location">.*?<a[^>]*>(.*?)</a>',b,re.S)
        d=re.search(r'eb-event-short-description[^>]*>(.*?)</div>',b,re.S)
        place=text(p.group(1)) if p else '';desc=text(d.group(1)) if d else ''
        if ds and allowed(u) and (not img or allowed(img)) and ok(t,u,place,desc):
            E.append({'t':t,'when':when,'start':ds[0],'end':ds[-1],'place':place,'desc':desc,'img':img,'u':u})
    return sorted(E,key=lambda e:e['start'])
def galleries(page):
    G=[]
    for u,img,t,d in re.findall(r'<a class="fea-card" href="([^"]+)">.*?<img\s+src="([^"]+)".*?fea-title">(.*?)</div>\s*<div class="fea-date">(.*?)</div>',page,re.S):
        t=text(t);ds=dates(text(d))
        if allowed(u) and allowed(img) and ok(t,u):
            G.append({'t':t,'date':ds[0] if ds else None,'img':re.sub(r'_b\.jpg$','_z.jpg',img),'u':u})
    return G
def videos():
    x=get(f'https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL}');V=[]
    for e in re.findall(r'<entry>(.*?)</entry>',x,re.S):
        i=re.search(r'<yt:videoId>(.*?)<',e);t=re.search(r'<title>(.*?)</title>',e);p=re.search(r'<published>(.*?)<',e)
        if i and t and ok(t.group(1)):
            title=html.unescape(t.group(1));V.append({'id':i.group(1),'t':title,'date':p.group(1)[:10] if p else None,'live':'🔴' in title or 'LIVE' in title})
    return V[:12]
def streams():
    ids=list(dict.fromkeys(re.findall(r'youtube\.com/embed/([\w-]{11})',get(DARSHAN))));S=[]
    for i in ids[:4]:
        o=json.loads(get('https://www.youtube.com/oembed?format=json&url='+urllib.parse.quote(f'https://www.youtube.com/watch?v={i}')))
        if o.get('author_name')=='Kalupur Mandir' and ok(o.get('title')):S.append({'id':i,'t':o['title']})
    return S
def main():
    try:old=json.load(open(OUT,encoding='utf-8'))
    except Exception:old={}
    new={};failed=[]
    def take(key,fn):
        try:
            v=fn()
            if not v:raise ValueError('empty')
            new[key]=v
        except Exception as e:
            failed.append(key);print('FAILED',key,repr(e)[:160],file=sys.stderr);new[key]=old.get(key,[])
    home={}
    def page():
        home['s']=home.get('s') or get(SITE+'/');return home['s']
    take('events',lambda:events(page()));take('galleries',lambda:galleries(page()));take('videos',videos);take('streams',streams)
    print({k:len(v) for k,v in new.items()},'failed:',failed)
    if len(failed)==len(new):sys.exit('every source failed')
    if all(new[k]==old.get(k) for k in new):print('no change');return
    new['updated']=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%MZ')
    json.dump(new,open(OUT,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
main()
