#!/usr/bin/env python3
# Build the data behind play/ (quizzes and games), news.html (upcoming utsavs) and site/daily.js (fact of the day).
#   in : tools/play_data.py, data/home/history.json, data/home/panchang.json, vachanamrut-concordance/data/text.json
#   out: data/play/bank.json, data/play/facts.json, data/play/utsav.json
# Run from anywhere:  python3 tools/play_build.py
import datetime, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import play_data as D

H = json.load(open(os.path.join(ROOT, 'data/home/history.json'), encoding='utf-8'))
P = json.load(open(os.path.join(ROOT, 'data/home/panchang.json'), encoding='utf-8'))
T = json.load(open(os.path.join(ROOT, 'vachanamrut-concordance/data/text.json'), encoding='utf-8'))
OUT = os.path.join(ROOT, 'data/play'); os.makedirs(OUT, exist_ok=True)
SEC = {s['k']: (s['en'], s['gu']) for s in T['sections']}
MON_EN = 'Chaitra Vaishakh Jeth Ashadh Shravan Bhadarvo Aso Kartak Magshar Posh Maha Fagan'.split()
MON_GU = 'ચૈત્ર વૈશાખ જેઠ અષાઢ શ્રાવણ ભાદરવો આસો કારતક માગશર પોષ મહા ફાગણ'.split()
GUD = str.maketrans('0123456789', '૦૧૨૩૪૫૬૭૮૯')

def kaal(ymd):
    y, m, d = ymd.split('-'); return f'kaal-patrak/#d{int(y)}-{int(m)}-{int(d)}'
def src(key):
    if key.startswith('ns:'):
        slug = key[3:]; name = slug.replace('-', ' ').title()
        return ['Bhuj mandir · ' + name, D.NSU + slug]
    if key.startswith('kp:'):
        return ['Shri Swaminarayanam (Gurukul Asarva) · Kaal Patrak ' + key[3:], kaal(key[3:])]
    if key.startswith('vc:'):
        return ['Vachanamrut ' + key[3:], 'vachanamrut-concordance/#v-' + key[3:]]
    l, u = D.SRC[key]; return [l, u]

def tithi_name(t, gu):
    half = ('સુદ' if gu else 'sud') if t <= 15 else ('વદ' if gu else 'vad'); n = t if t <= 15 else t - 15
    s = f'{half} {n}'; return s.translate(GUD) if gu else s

# ---------------------------------------------------------------- quiz bank
bank = {'q': [], 'who': [], 'pairs': {}, 'words': [], 'scenes': [], 'timeline': [], 'vach': []}
for i, (lvl, cat, qe, qg, opts, we, wg, sk, emo) in enumerate(D.Q):
    bank['q'].append({'id': f'q{i}', 'l': lvl, 'c': cat, 'q': [qe, qg], 'o': [list(o) for o in opts], 'w': [we, wg], 's': src(sk), 'i': emo})
# generated: "where did this happen" from the 12 life events (teens) and "in which samvat year" (adults)
life = H['life']; places = sorted({e['place'] for e in life})
PGU = {'Chhapaiya': 'છપૈયા', 'Ayodhya': 'અયોધ્યા', 'Loj': 'લોજ', 'Piplana': 'પીપલાણા', 'Jetpur': 'જેતપુર', 'Ahmedabad': 'અમદાવાદ',
       'Bhuj': 'ભુજ', 'Vadtal': 'વડતાલ', 'Dholera': 'ધોલેરા', 'Junagadh': 'જૂનાગઢ', 'Gadhada': 'ગઢડા'}
for i, e in enumerate(life):
    wrong = [p for p in places if p != e['place']]
    k = i % len(wrong); w2 = [wrong[k], wrong[(k + 3) % len(wrong)]]
    if w2[0] == w2[1]: w2[1] = wrong[(k + 1) % len(wrong)]
    bank['q'].append({'id': f'lp{i}', 'l': 'teen', 'c': 'life', 'q': [f'Where did this happen? “{e["t"]}”', f'આ ક્યાં બન્યું? “{e["gu"]}”'],
                      'o': [[e['place'], PGU.get(e['place'], e['place'])]] + [[p, PGU.get(p, p)] for p in w2],
                      'w': [e['d'], f'{MON_GU[e["m"]]} {tithi_name(e["n"], True)}, સં. {str(e["vs"]).translate(GUD)}'], 's': [ 'Bhuj mandir', e['src']], 'i': '📍'})
    vs = e['vs']; ws = [vs + d for d in ((-3, 4) if i % 2 else (2, -5))]
    bank['q'].append({'id': f'ly{i}', 'l': 'adult', 'c': 'life', 'q': [f'In which Vikram Samvat year: “{e["t"]}”?', f'કયા વિક્રમ સંવતમાં: “{e["gu"]}”?'],
                      'o': [[f'VS {vs}', f'સં. {str(vs).translate(GUD)}']] + [[f'VS {y}', f'સં. {str(y).translate(GUD)}'] for y in ws],
                      'w': [f'{MON_EN[e["m"]]} {tithi_name(e["n"], False)}, VS {vs}' + (f' ({e["ad"]})' if e.get('ad') else '') + '. ' + e['d'],
                            f'{MON_GU[e["m"]]} {tithi_name(e["n"], True)}, સં. {str(vs).translate(GUD)}'], 's': ['Bhuj mandir', e['src']], 'i': '📅'})
for a_en, a_gu, slug, ce, cg in D.WHO:
    bank['who'].append({'a': [a_en, a_gu], 'c': [ce, cg], 's': src('ns:' + slug)})
bank['pairs'] = {k: [[list(a), list(b)] for a, b in v] for k, v in D.PAIRS.items()}
bank['words'] = [{'w': w, 'h': [he, hg], 's': src(sk)} for w, he, hg, sk in D.WORDS]
for d, v in sorted(H['scenes'].items()):
    bank['scenes'].append({'d': d, 'en': v['en'], 'gu': v['gu'].split(' · ')[0], 'y': int(d[:4]), 'img': f'img/scenes/{d}.svg', 'k': kaal(d)})
# timeline: scenes (exact dates) plus life events that are not already a scene
tl = [{'y': s['y'], 'd': s['d'], 'en': s['en'], 'gu': s['gu'], 'k': s['k']} for s in bank['scenes']]
for e in life:
    y = int(e['ad'][-4:]) if e.get('ad') else e['vs'] - 57  # the Bhuj VS years without a CE date all fit VS-57 (checked against Kaal Patrak scene dates)
    dup = any(abs(int(d[:4]) - y) <= 1 and (PGU.get(e['place'], '#') in v['gu'] or ('diksha' in e['t'].lower() and 'diksha' in v['en'].lower()))
              for d, v in H['scenes'].items())
    if not dup: tl.append({'y': y, 'd': None, 'en': e['t'], 'gu': e['gu'], 'k': None})
bank['timeline'] = sorted(tl, key=lambda t: (t['y'], t['d'] or ''))
VDATE = {v[0]: v for v in H['vach']}
for v in T['v']:
    if v['sec'] in ('IN', 'EP', 'BK'): continue
    hv = VDATE.get(v['id'])
    bank['vach'].append({'id': v['id'], 'sec': v['sec'], 'n': v['n'], 't': v['title'], 'topic': hv[5] if hv else None, 'date': hv[3] if hv else None})
bank['sec'] = {k: list(v) for k, v in SEC.items()}
json.dump(bank, open(os.path.join(OUT, 'bank.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

# ---------------------------------------------------------------- fact of the day
facts = {'pool': [{'e': e, 'g': g, 's': src(sk), 'i': emo} for e, g, sk, emo in D.FACTS], 'days': {}}
def add(md, item):
    facts['days'].setdefault(md, []).append(item)
for d, v in sorted(H['scenes'].items()):
    add(d[5:], {'y': int(d[:4]), 'e': v['en'], 'g': v['gu'], 'k': kaal(d), 'img': f'img/scenes/{d}.svg', 'p': 0})
for e in life:
    if e.get('ad'):
        dt = datetime.datetime.strptime(e['ad'], '%d %B %Y'); md = dt.strftime('%m-%d')
        if not any(x.get('y') == dt.year and x['p'] == 0 for x in facts['days'].get(md, [])):
            add(md, {'y': dt.year, 'e': e['t'] + '. ' + e['d'], 'g': e['gu'], 'k': kaal(dt.strftime('%Y-%m-%d')), 'p': 1, 's': ['Bhuj mandir', e['src']]})
for vid, _m, _t, date, place, topic, vs in H['vach']:
    en, gu = SEC.get(vid.split('-')[0], (vid, vid)); n = vid.split('-')[1]
    add(date[5:], {'y': int(date[:4]), 'e': f'Shri Hari spoke Vachanamrut {en} {n}.',
                   'g': f'વચનામૃત {gu} {str(n).translate(GUD)}: {topic}', 'k': 'vachanamrut-concordance/#v-' + vid, 'p': 2, 'v': vid})
D0 = datetime.date(1781, 4, 1); best = {}
for b in H['b']:
    dt = D0 + datetime.timedelta(days=b[0]); md = dt.strftime('%m-%d'); txt = H['texts'][b[1]]
    if txt.startswith('-') or len(txt) < 28: continue
    score = len(txt) + (40 if 'શ્રીહરિ' in txt or 'મહારાજ' in txt else 0)
    if md not in best or score > best[md][0]: best[md] = (score, dt, txt)
for md, (_, dt, txt) in best.items():
    add(md, {'y': dt.year, 'e': None, 'g': txt, 'k': kaal(dt.isoformat()), 'p': 3})
for md in facts['days']: facts['days'][md].sort(key=lambda x: (x['p'], x['y']))
facts['srcbook'] = ['Shri Swaminarayanam (ed. Shastri Swami Nirgundasji, Shri Sahajanand Gurukul Asarva, 2015) · Kaal Patrak', 'kaal-patrak/']
json.dump(facts, open(os.path.join(OUT, 'facts.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

# ---------------------------------------------------------------- upcoming utsavs (from the home panchang, Ahmedabad sunrise)
FEST = [(7, 1, 'બેસતું વર્ષ · અન્નકૂટ', 'New year · Annakut'), (7, 11, 'પ્રબોધિની એકાદશી · શ્રીહરિ દીક્ષા દિન', 'Prabodhini Ekadashi · Shri Hari\'s diksha day'),
        (7, 15, 'દેવ દિવાળી', 'Dev Diwali'), (10, 5, 'વસંત પંચમી · શિક્ષાપત્રી જયંતી', 'Vasant Panchami · Shikshapatri day'),
        (11, 15, 'ફૂલદોલ (હોળી)', 'Fuldol (Holi)'), (0, 9, 'શ્રીહરિ જયંતી · રામનવમી', 'Shri Hari Jayanti · Ramnavmi'),
        (3, 15, 'ગુરુપૂર્ણિમા', 'Guru Purnima'), (4, 23, 'જન્માષ્ટમી', 'Janmashtami'), (5, 11, 'જળઝીલણી એકાદશી', 'Jal Jhilani Ekadashi'),
        (6, 30, 'દિવાળી', 'Diwali'), (11, 3, 'શ્રી નરનારાયણદેવ પાટોત્સવ (કાલુપુર)', 'Nar Narayan Dev patotsav (Kalupur)'),
        (2, 10, 'શ્રીહરિ અંતર્ધાન દિન', 'Shri Hari antardhan day')]
start = datetime.date.fromisoformat(P['start']); ut = []
for i, code in enumerate(P['d']):
    dt = start + datetime.timedelta(days=i)
    if dt < datetime.date(2026, 1, 1): continue
    if dt > datetime.date(2030, 12, 31): break
    base = code % 10000
    if base >= 5000: continue  # adhik month: no festivals
    m, t = base // 100, base % 100; ts = {t} | ({t + 1} if code >= 10000 else set())
    for fm, ft, gu, en in FEST:
        if fm == m and ft in ts: ut.append([dt.isoformat(), en, gu, 'f'])
    for e in (11, 26):
        if e in ts and not any(fm == m and ft == e for fm, ft, _, _ in FEST):
            ut.append([dt.isoformat(), f'Ekadashi · {MON_EN[m]} {tithi_name(e, False)}', f'એકાદશી · {MON_GU[m]} {tithi_name(e, True)}', 'e'])
dd = []
for x in ut:
    if dd and dd[-1][1] == x[1] and (datetime.date.fromisoformat(x[0]) - datetime.date.fromisoformat(dd[-1][0])).days <= 2: continue
    dd.append(x)
ut = dd
json.dump({'from': 'data/home/panchang.json (Ahmedabad sunrise)', 'u': ut}, open(os.path.join(OUT, 'utsav.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

print('questions', len(bank['q']), 'who', len(bank['who']), 'words', len(bank['words']), 'scenes', len(bank['scenes']),
      'timeline', len(bank['timeline']), 'vach', len(bank['vach']), '| fact days', len(facts['days']), 'pool', len(facts['pool']), '| utsav', len(ut))
