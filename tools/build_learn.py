#!/usr/bin/env python3
# Build data/learn/*.json for learn.html from data already on the site, so every quiz question, film scene and
# flashcard keeps its source. Run again whenever kaal-patrak/index.html or the concordance data changes.
#   life.json   - day rows of Shri Swaminarayanam that have text, the year summaries, the dated life events
#   scenes.json - the animated scene pictures from Kaal Patrak, for the life film
import json,os,re
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
OUT=os.path.join(ROOT,'data','learn');os.makedirs(OUT,exist_ok=True)
s=open(os.path.join(ROOT,'kaal-patrak','index.html'),encoding='utf8').read()
blk=lambda i:json.loads(re.search(r'<script id="%s"[^>]*>(.*?)</script>'%i,s,re.S).group(1))
d=blk('data');sc=blk('scenes')
# [date, masa, paksha, tithi, text, book page] for every day the book has words for
rows=[[r[1],r[2],r[3],r[4],r[5].strip(),r[6]] for r in d['book'] if r[5].strip()]
events=[{k:e.get(k) for k in('date','vs','place','title','subtitle','src')}|{'log':[l[1] for l in e.get('log',[])][:4]}
        for e in d['dina'] if e.get('kind')=='event']
life={'source':{'book':'શ્રી સ્વામિનારાયણમ્ (Shri Swaminarayanam), ed. Shastri Swami Nirgundasji, Shri Sahajanand Gurukul, Asarva, 2015',
                'note':'Text as printed in the book, transcribed for Kaal Patrak. Page numbers are the PDF page; the printed page is shown beside it.'},
      'rows':rows,'years':d['years'],'events':events,
      'scenes':[{'date':k,'en':v.get('en'),'gu':v.get('gu')} for k,v in sorted(sc.items())]}
json.dump(life,open(os.path.join(OUT,'life.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
json.dump({k:v['svg'] for k,v in sc.items()},open(os.path.join(OUT,'scenes.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print(len(rows),'rows',len(events),'events',len(sc),'scenes')
