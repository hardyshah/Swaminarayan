#!/usr/bin/env python3
# Build data/audio/bhaktisound.json from BhaktiSound, the audio library of Shree Swaminarayan Mandir Bhuj
# (Nar Narayan Dev Gadi). Tracks are linked, not copied. Run weekly by .github/workflows/audio.yml.
# Output: {"src","built","base","artists":{id:name},"albums":[{id,n,y,img,ar:[artist ids],t:[[name,seconds,url-after-base]]}]}
import json,os,sys,time,urllib.parse,urllib.request
SITE='https://www.swaminarayan.faith/bhaktisound/'
API=SITE+'secure'
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','data','audio','bhaktisound.json')
UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json'}
def get(p):
    err=None
    for k in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(API+p,headers=UA),timeout=30) as r:return json.load(r)
        except Exception as e:
            err=e;time.sleep(2+k*3)
    raise err
def pages(path):
    n=1
    while True:
        d=get(f'{path}?per_page=100&page={n}')['pagination']
        yield from d['data']
        if n>=d['last_page']:return
        n+=1
full=lambda u:urllib.parse.urljoin(SITE,u) if u else ''
A=[];artists={}
for a in pages('/albums'):
    d=get(f"/albums/{a['id']}?with=tracks")['album'];time.sleep(.15)
    T=[[t['name'].strip(),round((t.get('duration') or 0)/1000),full(t['url'])] for t in d.get('tracks') or [] if t.get('url')]
    if not T:continue
    ar=[]
    for x in a.get('artists') or []:
        artists[x['id']]=x['name'];ar.append(x['id'])
    A.append({'id':a['id'],'n':a['name'].strip(),'y':(a.get('release_date') or '')[:4],'img':full(a.get('image')),'ar':ar,'t':T})
urls=[t[2] for a in A for t in a['t']]
print(len(A),'albums',len(urls),'tracks',len(artists),'artists')
if len(A)<50:sys.exit('too few albums, keeping the old file')
# Store the shared URL prefix once to keep the file small.
base=os.path.commonprefix(urls);base=base[:base.rfind('/')+1]
for a in A:
    for t in a['t']:t[2]=t[2][len(base):]
# Check that a sample of track links really play before saving.
bad=0
for u in urls[::max(1,len(urls)//8)][:8]:
    try:
        with urllib.request.urlopen(urllib.request.Request(u,headers={**UA,'Range':'bytes=0-1023','Accept':'*/*'}),timeout=30) as r:
            ok=r.status in (200,206) and ('audio' in r.headers.get('Content-Type','') or 'octet' in r.headers.get('Content-Type',''))
    except Exception as e:ok=False;print('link check failed',u,e)
    bad+=not ok
if bad>2:sys.exit(f'{bad} of 8 sample track links did not return audio, keeping the old file')
os.makedirs(os.path.dirname(OUT),exist_ok=True)
json.dump({'src':SITE,'built':time.strftime('%Y-%m-%d'),'base':base,'artists':{str(k):v for k,v in artists.items()},'albums':A},
          open(OUT,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('wrote',OUT,os.path.getsize(OUT),'bytes; base',base)
