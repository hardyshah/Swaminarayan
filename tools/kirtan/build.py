#!/usr/bin/env python3
"""Build the kirtan + audio index pages (one per book) as HTML, ready for render.js to print to PDF.

Inputs (tools/kirtan/data/):
  books-kirtans.json  kirtan titles read from each book (G = Gujarati books, E = English books,
                      U = unique kirtans keyed by a normalised title, order = search order)
  picks.txt           "i:videoId,channel,singer,playlist;..."  i = line in search-titles.txt / U order
  channels.txt        "name¦channelId" (0-based, as used in picks)
  playlists.txt       "title¦playlistId" (0-based)
  singers.txt         singer names (index 0 = no singer named)
Output: build/<slug>.html  (+ build/index.json summary)

Usage: python3 tools/kirtan/build.py [OUTDIR]
"""
import html, json, os, re, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(HERE, 'data')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'build')
os.makedirs(OUT, exist_ok=True)

A = json.load(open(os.path.join(D, 'books-kirtans.json'), encoding='utf8'))
U, ORDER = A['U'], A['order']
CH = [l.split('¦') for l in open(os.path.join(D, 'channels.txt'), encoding='utf8').read().split('\n')[:550]]
PL = [l.split('¦') for l in open(os.path.join(D, 'playlists.txt'), encoding='utf8').read().rstrip('\n').split('\n')]
SG = open(os.path.join(D, 'singers.txt'), encoding='utf8').read().rstrip('\n').split('\n')

# ---- sources we leave out -------------------------------------------------------------
# Project rule: only the original Kalupur / Vadtal sampraday (and dioceses such as Bhuj);
# never BAPS, Maninagar or other breakaway groups, and nothing that is not a Swaminarayan kirtan.
EXCL_CH = re.compile(r"akshar|keshav|pragaji|prabodham|abjibap|brahm swami|anoopam|anupam|anirdesh|gunatit|"
                     r"sanatanam|prapti_no|pushti|pustimarg|vishwananda|sathya sai|sai aashirwad|jayakishori|"
                     r"rameshbhai oza|dwarkadhish|shrinathji|shree nathji|haryanvi|mahadev|navdurga|jay ambe|"
                     r"radhe radhe|krishna bhajan|ram krishna|ramkrushna|shyama shyam|gopal lal|jalaram|ramapir|"
                     r"ramji mandir|gurudev datt|gaming|news18|arun pandit|axar patel|papaa kehte|motivation|"
                     r"kan gopi|radhakrishna|krushna|કૃષ્ણ|ક્રિષ્ના|swamibapa|maninagar|willesden|"
                     r"iskcon|sonu nigam|anup jalota|shiv|mantra trance|pandav|radhika dhun", re.I)
EXCL_PL = re.compile(r"બ્રહ્મદર્શન|shrinathji|guru purnima|krishna|ક્રિષ્ના|શ્રીરામ|ras garba|chalo chalo saiyar|"
                     r"powerfull mantra|gunatitanand", re.I)
EXCL_SG = {'Anupam Swami', 'Anirdeshpowai', 'Pushtivrund'}
GROUP_SG = re.compile(r'vrund|gurukul|temple|santvrund|sansthan', re.I)

def topic_singer(ch):
    m = re.match(r'(.+?) - Topic$', ch)
    if m and not GROUP_SG.search(m.group(1)) and m.group(1) not in ('Release', 'Bhajan Studio'):
        return m.group(1)
    return None

# names to look for in playlist titles and channel names when the video title names no singer
NAMES = [n for n in SG if n and n not in EXCL_SG and not GROUP_SG.search(n) and n not in ('Rushi', 'Santvrund')]
ALIAS = {'Hashmukh Patadiya': 'Hasmukh Patadiya', 'Dinesh Vaghashiya': 'Dinesh Vaghasiya', 'Ghanshyam kapopra': 'Ghanshyam Kapopara',
         'Ghanshyam kapopara': 'Ghanshyam Kapopara', 'Gyanjivandasjiswami': 'Gyanjivandasji Swami - Kundaldham',
         'Gyanjivandasji Swami': 'Gyanjivandasji Swami - Kundaldham', 'Ruchita Prajapti': 'Ruchita Prajapati',
         'Harigundasji': 'Sadhu Harigundasji Swami', 'Sankirtandasji': 'Sadhu Sankirtandasji Swami', 'Arunaben': 'Arunaben',
         'Vasantben': 'Vasantben Nimavat', 'Dakshaben': 'Dakshaben', 'Prashant Akoliya': 'Prashant Akoliya',
         'akoliya prashant': 'Prashant Akoliya', 'Umesh K Chavda': 'Umesh Chavda', 'Chandubhai Rathod': 'Chandubhai Rathod',
         'Master Rana': 'Master Rana', 'Jay Vaghasiya': 'Jay Vaghasiya', 'Harikrishna Patel': 'Harikrishna Patel',
         'Janmangal Swami': 'Janmangal Swami', 'Bhajan swami': 'Bhajan Swami', 'BHAJAN SWAMI': 'Bhajan Swami',
         'Avinashbhagat': 'Avinash Bhagat', 'Hariswarup Swami': 'Hariswarup Swami', 'Nimavat Vasantben': 'Vasantben Nimavat',
         'Chandrikaben': 'Chandrikaben', 'Kanaiyalal Vaghela': 'Kanaiyalal Vaghela', 'Mayur Vaghasiya': 'Mayur Vaghasiya'}
def infer_singer(s):
    if not s: return None
    for a, n in ALIAS.items():
        if a.lower() in s.lower(): return n
    for n in sorted(NAMES, key=len, reverse=True):
        if n.lower() in s.lower(): return n
    return None

PICKS = {}
for line in open(os.path.join(D, 'picks.txt'), encoding='utf8').read().split('\n'):
    if not line.strip():
        continue
    i, rest = line.split(':', 1)
    out = []
    for p in rest.split(';'):
        vid, c, s, pl = p.split(',')
        cname, cid = CH[int(c)]
        cname = cname.replace(' ', ' ').strip()
        sname = SG[int(s)] if s else ''
        if sname == 'Dinesh Vaghashiya': sname = 'Dinesh Vaghasiya'
        if sname == 'Hasmukh Patadia': sname = 'Hasmukh Patadiya'
        if sname == 'Narayanswami': sname = 'Narayan Swami'
        plt, plid = (PL[int(pl)] if pl != '' else (None, None))
        if EXCL_CH.search(cname) or sname in EXCL_SG or (plt and EXCL_PL.search(plt)):
            continue
        if not sname:
            sname = topic_singer(cname) or infer_singer(plt) or infer_singer(cname) or ''
        out.append(dict(v=vid, ch=cname, cid=cid, sg=sname, pl=plt, plid=plid))
    if out:
        PICKS[int(i)] = out
KEYIDX = {k: n for n, k in enumerate(ORDER)}

SITE = 'https://hardyshah.github.io/Swaminarayan/vachanamrut-concordance/'
BOOKS = [
    # slug, data group, source key, title, gujarati title, book PDF url, page field
    ('kirtan-ratnavali-gujarati', 'G', 'kirtan-ratnavali', 'Kirtan Ratnavali (Gujarati)', 'કીર્તન રત્નાવલી',
     'https://www.swaminarayan.faith/media/3637/kirtan-ratnavali-gujarati.pdf'),
    ('kirtan-ratnavali-english-lipi', 'G', 'kirtan-ratnavali', 'Kirtan Ratnavali (English lipi)', 'કીર્તન રત્નાવલી',
     'https://www.swaminarayan.faith/media/3636/kirtan-ratnavali-english-lipi.pdf'),
    ('hajari-kirtanavali', 'G', 'hajari-kirtanavali', 'Hajari Kirtanavali', 'હજારી કીર્તનાવલી',
     'https://www.swaminarayan.faith/media/3565/hajari-kirtanavali.pdf'),
    ('ekadashi-jagran-na-kirtano', 'G', 'ekadashi-jagran', 'Ekadashi Jagran Na Kirtano', 'એકાદશી જાગરણના કીર્તનો',
     'https://www.swaminarayan.faith/media/3922/ekadashi-jagran-na-kirtano.pdf'),
    ('badrinathdasji-krut-kirtanavli', 'G', 'badrinathdasji-kirtanavali', 'Badrinathdasji Krut Kirtanavli', 'બદ્રીનાથદાસજી કૃત કીર્તનાવલી',
     'https://www.swaminarayan.faith/media/3881/badrinathdasji-krut-kirtanavli.pdf'),
    ('nitya-niyam', 'G', 'nitya-niyam', 'Nitya Niyam', 'નિત્ય નિયમ',
     'https://www.swaminarayan.faith/media/3667/nitya-niyam.pdf'),
    ('kirtan-bhakti', 'E', 'kirtan-bhakti', 'Kirtan Bhakti (English)', 'કીર્તન ભક્તિ',
     'https://www.swaminarayan.faith/media/3632/kirtan20bhakti-1.pdf'),
    ('kirtan-leela-arth-amrutdhara', 'E', 'kirtan-leelaarth-amrutdhaara', 'Kirtan Leela Arth Amrutdhara', 'કીર્તન લીલાર્થ અમૃતધારા',
     'https://www.swaminarayan.faith/media/3634/kirtan-leelaarth-amrutdhaara.pdf'),
    ('ashtako-ane-kirtano', 'G', 'ashtako-ane-kirtano', 'Ashtako ane Kirtano', 'અષ્ટકો અને કીર્તનો',
     SITE + 'books/ashtako-ane-kirtano.pdf'),
]

def esc(s):
    return html.escape(s or '', quote=True)

def entries(group, src):
    xs = A[group][src]
    out, seen = [], {}
    for x in xs:
        t = re.sub(r'\s+', ' ', x['t']).strip()
        k = x.get('key')
        if src == 'nitya-niyam':
            # the reader matched both a short and a long form of some first lines; keep the longer
            if out and out[-1]['pdf'] == x.get('pdf') and (t.startswith(out[-1]['t']) or out[-1]['t'].startswith(t)):
                if len(t) > len(out[-1]['t']):
                    out[-1]['t'] = t
                continue
        if k in seen and src == 'nitya-niyam':
            continue
        seen[k] = 1
        out.append(dict(t=t, key=k, p=x.get('p'), pdf=x.get('pdf'), poet=x.get('poet_en'), sec=x.get('sec'),
                        part=x.get('part'), found=x.get('found', True)))
    if src != 'nitya-niyam':
        out.sort(key=lambda e: (e['pdf'] or 0, e['p'] or 0))
    return out

def caption(p):
    bits = [('Singer: ' + p['sg']) if p['sg'] else 'Singer not named on the video']
    if p['pl']:
        bits.append('Playlist: ' + p['pl'])
    bits.append('Channel: ' + p['ch'])
    return bits

CSS = """
@page{size:A4;margin:16mm 14mm 16mm 14mm}
*{box-sizing:border-box}
body{font-family:'NSG','NS','NSD',sans-serif;color:#2a1a0a;font-size:10pt;line-height:1.38;margin:0}
a{color:#8a3b00;text-decoration:none}
.cover{border-bottom:3px solid #b06208;padding-bottom:10px;margin-bottom:12px}
.cover .gu{font-size:20pt;font-weight:700;color:#562c00;margin:0}
.cover h1{font-size:17pt;margin:2px 0 4px;color:#562c00}
.cover p{margin:4px 0;font-size:9.4pt}
.stats{display:flex;gap:14px;margin:8px 0 2px;font-size:9pt}
.stats b{font-size:12pt;color:#b06208}
.howto{background:#fff6ea;border:1px solid #f0d6b4;border-radius:6px;padding:7px 10px;font-size:8.8pt;margin:8px 0}
.sec{font-weight:700;color:#b06208;border-bottom:1px solid #f0d6b4;margin:12px 0 4px;padding-bottom:2px;font-size:10.5pt;break-after:avoid}
.k{break-inside:avoid;padding:5px 0 6px;border-bottom:1px dotted #e6cfae}
.k .h{display:flex;gap:8px;align-items:baseline}
.k .n{color:#9a7a55;font-size:8.5pt;min-width:26px;text-align:right}
.k .t{font-weight:700;font-size:10.6pt}
.k .r{color:#5a4632;font-style:italic;font-size:9pt}
.k .m{font-size:8.6pt;color:#6a5440;margin-left:34px}
.k ul{margin:2px 0 0 34px;padding:0;list-style:none}
.k li{font-size:8.7pt;margin:1px 0}
.k li a.play{font-weight:700}
.k li .c{color:#4a3826}
.k .none{margin-left:34px;font-size:8.6pt;color:#9a7a55}
.src{break-before:page}
.src h2{color:#562c00;font-size:13pt;margin:0 0 6px}
.src h3{color:#b06208;font-size:10.5pt;margin:12px 0 4px}
.src p,.src li{font-size:8.8pt}
.src ul{columns:2;column-gap:18px;padding-left:16px;margin:4px 0}
"""

def font_css(fontdir):
    f = lambda n: 'file://' + os.path.join(fontdir, n)
    return (f"@font-face{{font-family:NSG;src:url('{f('NotoSansGujarati-Regular.ttf')}')}}"
            f"@font-face{{font-family:NSG;font-weight:700;src:url('{f('NotoSansGujarati-Bold.ttf')}')}}"
            f"@font-face{{font-family:NS;src:url('{f('NotoSans-Regular.ttf')}')}}"
            f"@font-face{{font-family:NS;font-weight:700;src:url('{f('NotoSans-Bold.ttf')}')}}"
            f"@font-face{{font-family:NSD;src:url('{f('NotoSansDevanagari-Regular.ttf')}')}}")

def build(book, fontdir, today):
    slug, group, src, title, gu, url = book
    es = entries(group, src)
    eng_book = group == 'E' or slug.endswith('english-lipi')
    rows, nmatch, chans, singers = [], 0, {}, set()
    cur_sec = None
    for n, e in enumerate(es, 1):
        u = U.get(e['key']) or {}
        picks = PICKS.get(KEYIDX.get(e['key'], -1), [])
        if picks: nmatch += 1
        for p in picks:
            chans[p['ch']] = p['cid']
            if p['sg']: singers.add(p['sg'])
        poet = e['poet'] or u.get('poet')
        page = e['pdf']
        link = f"{url}#page={page}" if page else url
        sec = e.get('sec')
        if sec and sec != cur_sec:
            cur_sec = sec
            rows.append(f'<div class="sec">{esc((e.get("part") or "").title() + " · " if e.get("part") else "")}{esc(sec)}</div>')
        if group == 'E':
            t_main, t_sub = e['t'], (u.get('gu') or '')
        elif eng_book:
            t_main, t_sub = ((u.get('en_titles') or [None])[0] or u.get('en') or e['t']), e['t']
        else:
            t_main, t_sub = e['t'], ((u.get('en_titles') or [None])[0] or u.get('en') or '')
        meta = []
        if poet: meta.append('Poet: ' + poet)
        pg = e['p'] if e['p'] else None
        meta.append(f'<a href="{esc(link)}">Book {"page " + str(pg) if pg else "PDF page " + str(page)} ↗</a>' if page else f'<a href="{esc(url)}">Book PDF ↗</a>')
        li = ''.join(
            f'<li><a class="play" href="https://www.youtube.com/watch?v={esc(p["v"])}">▶ Listen</a> '
            f'<span class="c">{" · ".join(esc(b) for b in caption(p)[:1])}'
            + (f' · Playlist: <a href="https://www.youtube.com/playlist?list={esc(p["plid"])}">{esc(p["pl"])}</a>' if p['pl'] else '')
            + (f' · Channel: <a href="https://www.youtube.com/channel/{esc(p["cid"])}">{esc(p["ch"])}</a>' if p['cid'] else f' · Channel: {esc(p["ch"])}')
            + '</span></li>' for p in picks)
        rows.append(f'<div class="k"><div class="h"><span class="n">{n}</span><div><span class="t">{esc(t_main)}</span>'
                    + (f' <span class="r">{esc(t_sub)}</span>' if t_sub and t_sub != t_main else '')
                    + f'</div></div><div class="m">{" · ".join(meta)}</div>'
                    + (f'<ul>{li}</ul>' if li else '<div class="none">No recording found yet on sampraday channels.</div>') + '</div>')
    chan_list = ''.join(f'<li><a href="https://www.youtube.com/channel/{esc(c)}">{esc(n)}</a></li>' if c else f'<li>{esc(n)}</li>'
                        for n, c in sorted(chans.items(), key=lambda x: x[0].lower()))
    doc = f"""<!doctype html><html lang="gu"><head><meta charset="utf-8"><title>{esc(title)} · Kirtans with audio</title>
<style>{font_css(fontdir)}{CSS}</style></head><body>
<div class="cover"><p class="gu">{esc(gu)}</p><h1>{esc(title)} · Kirtans with audio and video links</h1>
<p>Every kirtan read from the book <a href="{esc(url)}">{esc(title)}</a>, in page order, with a link to its page in the book PDF
and up to three recordings on YouTube. Each recording names the singer and the playlist it belongs to, where the video gives them.</p>
<div class="stats"><span><b>{len(es)}</b> kirtans</span><span><b>{nmatch}</b> with recordings</span><span><b>{len(singers)}</b> singers named</span><span><b>{len(chans)}</b> channels</span></div>
<div class="howto">Tap <b>▶ Listen</b> to open the recording, or <b>Book page</b> to open the kirtan in the book. Recordings were matched to the first line of each kirtan
automatically, so please check the words before relying on a link. Only recordings from the original Swaminarayan sampraday (Kalupur and Vadtal dioceses and their temples,
gurukuls, saints and singers) are listed; channels of BAPS, Maninagar and other groups are left out. Made {today}.</div></div>
{''.join(rows)}
<div class="src"><h2>Sources</h2>
<h3>Book</h3><p><a href="{esc(url)}">{esc(title)}</a> ({esc(url)}). Book PDFs on swaminarayan.faith are published by Shree Swaminarayan Temple Bhuj and
the sampraday, who hold all rights; this index only points to them. Listed on the
<a href="{SITE}ebooks.html">Swaminarayan e-books page</a>.</p>
<h3>Recordings</h3><p>All audio and video belong to the channels below; each link opens on YouTube (youtube.com). Singer and playlist names are taken from the video title,
the channel or the playlist the video is in.</p>
<ul>{chan_list}</ul>
<h3>How this index was made</h3><p>The kirtan titles were read from the book PDF (legacy Gujarati fonts converted to Unicode), then each first line was searched on YouTube
and matched word by word. Build files: <a href="https://github.com/hardyshah/Swaminarayan/tree/main/tools/kirtan">tools/kirtan</a> in the site repository.</p>
</div></body></html>"""
    open(os.path.join(OUT, slug + '.html'), 'w', encoding='utf8').write(doc)
    return dict(slug=slug, title=title, url=url, kirtans=len(es), with_audio=nmatch, singers=len(singers), channels=len(chans))

if __name__ == '__main__':
    fontdir = os.environ.get('KIRTAN_FONTS', os.path.join(HERE, 'fonts'))
    today = datetime.date.today().strftime('%d %B %Y').lstrip('0')
    summ = [build(b, fontdir, today) for b in BOOKS]
    json.dump(summ, open(os.path.join(OUT, 'index.json'), 'w'), indent=1)
    for s in summ: print(s)
