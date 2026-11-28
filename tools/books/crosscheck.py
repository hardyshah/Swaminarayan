"""Cross-check of the Satsang Library books against the site (Nov 2026).

Reads the dated passages found in the library PDFs (converted from their legacy
Gujarati fonts), compares each with Shri Swaminarayanam (the day-by-day granth
inside Kaal Patrak) and with Kaal Patrak's own day pages, then

  * writes vachanamrut-concordance/data/book-crosscheck.json for the library page
  * applies the agreed changes to kaal-patrak/index.html (idempotent)

Rule used: change or add only where the sources do not disagree. Where two
sources disagree the site is left as it is and the difference is listed.

Run:  python3 tools/books/crosscheck.py
"""
import json, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KP = os.path.join(ROOT, 'kaal-patrak', 'index.html')
OUT = os.path.join(ROOT, 'vachanamrut-concordance', 'data', 'book-crosscheck.json')

BOOK = {  # slug -> short label
    'satsang-prabha-1': 'Satsang Prabha 1', 'satsang-prabha-2': 'Satsang Prabha 2',
    'satsang-prabha-3': 'Satsang Prabha 3', 'satsang-prabha-4': 'Satsang Prabha 4',
    'nimit-matra-3': 'Nimit Matra 3', 'nimit-matra-4': 'Nimit Matra 4',
    'amrutvarsha-1': 'Amrutvarsha 1', 'ashtako-ane-kirtano': 'Ashtako ane Kirtano',
}

def cite(refs):
    """refs = [(slug, pdf_page), ...] -> list of dicts and a one-line text."""
    out = [{'book': s, 'label': BOOK[s], 'page': p,
            'url': f'books/{s}.pdf#page={p}'} for s, p in refs]
    txt = '; '.join(f"{BOOK[s]}, PDF p. {p}" for s, p in refs)
    return out, txt

SS = 'Shri Swaminarayanam'

# status: confirmed = book agrees with the site; corrected = site date changed to
# the date all sources give; added = new day page; conflict = sources disagree,
# site unchanged.
ITEMS = [
 # ---------- corrected ----------
 dict(id='successor', status='corrected', date='1801-11-17', vs='Kartik sud 11, V.S. 1858',
      en='Ramanand Swami hands the dharma-dhura to Sahajanand Swami at Jetpur',
      gu='જેતપુરમાં રામાનંદ સ્વામીએ ધર્મધુરા સોંપી',
      refs=[('nimit-matra-3', 177), ('satsang-prabha-3', 385)],
      note=f'Kaal Patrak had 16 Nov 1801. {SS} and both books give Kartik sud 11 = 17 Nov 1801.',
      move=('1801-11-16', '1801-11-17')),
 dict(id='acharyas', status='corrected', date='1825-11-20', vs='Kartik sud 11, V.S. 1882',
      en='Two Acharyas appointed at Vadtal (Ayodhyaprasadji and Raghuvirji)',
      gu='વડતાલમાં બે આચાર્યોની સ્થાપના',
      refs=[('nimit-matra-3', 3), ('nimit-matra-3', 72), ('nimit-matra-3', 181)],
      note=f'Kaal Patrak had 10 Nov 1826 (V.S. 1883). Nimit Matra 3 gives Kartik sud 11, V.S. 1882 three times, and {SS} puts it on 20 Nov 1825, beside Vachanamrut Vartal-1.',
      move=('1826-11-10', '1825-11-20')),
 dict(id='gopinathji', status='corrected', date='1828-10-20', vs='Aso sud 12, V.S. 1885',
      en='Installs Shri Gopinathji at Gadhada', gu='ગઢડામાં શ્રી ગોપીનાથજીની પ્રતિષ્ઠા',
      refs=[('nimit-matra-3', 73), ('nimit-matra-4', 194)],
      note=f'Kaal Patrak had 9 Oct 1828, which is Aso sud 1. Aso sud 12 is 20 Oct 1828, the day {SS} gives.',
      move=('1828-10-09', '1828-10-20')),
 dict(id='malcolm', status='corrected', date='1830-02-26', vs='Fagan sud 3, V.S. 1886',
      en='Meets Governor Sir John Malcolm at Rajkot and gives him a copy of the Shikshapatri',
      gu='રાજકોટમાં ગવર્નર સર જોન માલ્કમ સાથે મુલાકાત',
      refs=[('satsang-prabha-2', 409), ('satsang-prabha-4', 250)],
      note=f'Date kept (26 Feb 1830, as in {SS} and Satsang Prabha 2 p. 409). Only the tithi label was wrong: it read "Falgun sud 1". Satsang Prabha 4 gives Fagan sud 4–5 and Satsang Prabha 2 p. 428 gives 28 Feb, so those are listed under differences.',
      relabel=('1830-02-26', 'Fagan sud 3, V.S. 1886'),
      addlog=[('Note', 'Satsang Prabha 4 (PDF pp. 247–250) prints the letters before the meeting: Shriji wrote from Gadhada on Maha vad 13 that ill health kept him from Rajkot, and the Governor\'s secretary Williamson wrote again on Fagan sud 2.')]),

 # ---------- added ----------
 dict(id='nilkanth-vadodara', status='added', date='1799-03-14', vs='Fagan sud 8, V.S. 1855', place='Vadodara',
      en='Nilkanth Varni visits Vadodara', gu='નીલકંઠ વર્ણી વડોદરામાં', refs=[('satsang-prabha-4', 342)],
      note=f'{SS} gives the same day (stays at Mandvi).'),
 dict(id='dharmadev', status='added', date='1792-06-08', vs='Jeth vad 4, V.S. 1848', place='Ayodhya',
      en='Dharmadev passes away', gu='ધર્મદેવનો દેહત્યાગ',
      refs=[('satsang-prabha-2', 71), ('satsang-prabha-4', 413)],
      note=f'{SS} gives the same day: the Bhagwat katha ends and Dharmadev leaves his body on the bank of the Saryu.'),
 dict(id='narayangita', status='added', date='1802-08-22', vs='Shravan vad 9, V.S. 1859', place='Mangrol',
      en='Narayan Gita: discourse under a banyan tree outside Mangrol, the day after Janmashtami',
      gu='માંગરોળમાં વડ નીચે નારાયણગીતા', refs=[('nimit-matra-3', 147), ('nimit-matra-3', 212)],
      note=f'{SS} has Shriji in Mangrol for Janmashtami the day before.'),
 dict(id='harijayanti', status='added', date='1804-04-18', vs='Chaitra sud 9, V.S. 1860', place='Bhuj',
      en='First Hari Jayanti: the Bhuj devotees celebrate Shriji\'s birthday for the first time',
      gu='ભુજના હરિભક્તોએ પહેલી હરિજયંતી ઊજવી', refs=[('satsang-prabha-1', 447), ('nimit-matra-3', 177)],
      note=f'{SS} gives the same day: Hari Jayanti and Ram Navami at Bhuj.'),
 dict(id='sardhar', status='added', date='1804-08-28', vs='Shravan vad 8, V.S. 1861', place='Sardhar',
      en='Janmashtami at Sardhar', gu='સરધારમાં જન્માષ્ટમી', refs=[('nimit-matra-3', 192)],
      note=f'{SS} gives the same day.'),
 dict(id='gadhada-first', status='added', date='1805-02-10', vs='Maha sud 11, V.S. 1861', place='Gadhada',
      en='First visit to Gadhada, at Ebhal Khachar\'s invitation', gu='ગઢડામાં પહેલી વાર પધાર્યા',
      refs=[('nimit-matra-3', 113)], note=f'{SS} gives the same day.'),
 dict(id='vasudev', status='added', date='1806-03-07', vs='Fagan vad 3, V.S. 1862', place='Gadhada',
      en='Installs Shri Vasudev Narayan in the Gadhada darbar', gu='ગઢડા દરબારમાં શ્રીવાસુદેવનારાયણની પ્રતિષ્ઠા',
      refs=[('nimit-matra-3', 114)], note=f'{SS} gives the same day.'),
 dict(id='sparsh', status='added', date='1806-11-14', vs='Kartik sud 4, V.S. 1863', place='Gadhada',
      en='Teaches the rules of touch and purity (sparshasparsh-vivek) in Dada Khachar\'s darbar',
      gu='ગઢડામાં સ્પર્શાસ્પર્શ વિવેકનો ઉપદેશ', refs=[('nimit-matra-3', 141)],
      note=f'{SS} has Shriji in Ebhal Khachar\'s darbar, Gadhada, that day.'),
 dict(id='siddhpur', status='added', date='1809-03-31', vs='Chaitra sud 15, V.S. 1865', place='Siddhpur',
      en='Comes to Siddhpur from Machhiyav on Chaitri Punam and keeps the tirth rites',
      gu='ચૈત્રી પૂનમે મછિયાવથી સિદ્ધપુર', refs=[('nimit-matra-3', 101)],
      note=f'{SS} has Shriji at Siddhpur on these days.'),
 dict(id='ebhal', status='added', date='1813-10-29', vs='Kartik sud 5, V.S. 1870', place='Gadhada',
      en='Ebhal Khachar passes away', gu='એભલ ખાચર અક્ષરવાસી થયા', refs=[('nimit-matra-3', 114)],
      note=f'Only Nimit Matra 3 gives the day. {SS} has Shriji at Gadhada, in the Akshar Ordi, these days and does not contradict it.'),
 dict(id='annakut1872', status='added', date='1815-11-02', vs='Kartik sud 1, V.S. 1872', place='Gadhada',
      en='Annakut in the Vasudev Narayan mandir, Gadhada', gu='ગઢડામાં અન્નકૂટ',
      refs=[('nimit-matra-3', 113), ('nimit-matra-3', 177)], note=f'{SS} gives the same day.'),
 dict(id='vadodara', status='added', date='1825-11-15', vs='Kartik sud 5, V.S. 1882', place='Vadodara',
      en='Visits Vadodara for three days at the request of Maharaja Sayajirao Gaekwad II',
      gu='સયાજીરાવ ગાયકવાડના આગ્રહથી ત્રણ દિવસ વડોદરા', refs=[('nimit-matra-3', 184), ('satsang-prabha-4', 342)],
      note=f'Both books agree. {SS} has no entry for these days.'),
 dict(id='deshvibhag', status='added', date='1826-12-14', vs='Magshar sud 15, V.S. 1883', place='Gadhada',
      en='Dictates the Desh Vibhag no Lekh to Shuk Muni at Gadhada', gu='ગઢડામાં દેશવિભાગનો લેખ',
      refs=[('nimit-matra-3', 26), ('satsang-prabha-2', 246), ('satsang-prabha-4', 208)],
      note=f'{SS} gives the same day.'),
 dict(id='junagadh', status='added', date='1828-05-01', vs='Vaishakh vad 2, V.S. 1884', place='Junagadh',
      en='Installs Ranchhodrai, Trikamji, Radharaman Dev and Siddheshwar Mahadev at Junagadh',
      gu='જૂનાગઢમાં શ્રીરાધારમણદેવની પ્રતિષ્ઠા', refs=[('nimit-matra-3', 73), ('nimit-matra-4', 194)],
      note=f'{SS} gives the same day.'),
 dict(id='arthdipika', status='added', date='1828-12-12', vs='Magshar sud 5, V.S. 1885', place='Gadhada',
      en='Shatanand Muni finishes the Arth-Dipika commentary on the Shikshapatri (begun Kartik sud 3)',
      gu='શતાનંદ મુનિએ શિક્ષાપત્રી અર્થદીપિકા પૂરી કરી', refs=[('satsang-prabha-3', 17)],
      note=f'{SS} has Shriji arriving at Gadhada the day before.'),
 dict(id='vaishnavvallabha', status='added', date='1829-12-02', vs='Magshar sud 6, V.S. 1886', place='Gadhada',
      en='Dinanath Bhatt completes the Vaishnav-Vallabha commentary on the Vasudev Mahatmya',
      gu='દીનાનાથ ભટ્ટની વાસુદેવ માહાત્મ્ય ઉપર વૈષ્ણવવલ્લભા ટીકા', refs=[('satsang-prabha-2', 415), ('ashtako-ane-kirtano', 35)],
      note=f'Both books agree. {SS} has Shriji at Gadhada (Champa Chhath).'),

 # ---------- confirmed ----------
 dict(id='birth', status='confirmed', date='1781-04-02', vs='Chaitra sud 9, V.S. 1837', en='Birth at Chhapaiya; Nimit Matra 3 adds Monday, 10:10 at night',
      refs=[('nimit-matra-3', 175), ('amrutvarsha-1', 29), ('satsang-prabha-4', 277)]),
 dict(id='bhaktimata', status='confirmed', date='1791-11-05', vs='Kartik sud 10, V.S. 1848', en='Bhaktimata passes away',
      refs=[('satsang-prabha-2', 71), ('satsang-prabha-4', 413)]),
 dict(id='grihatyag', status='confirmed', date='1792-06-29', vs='Ashadh sud 10, V.S. 1849', en='Leaves home at dawn on a Friday, aged 11 years 3 months 1 day',
      refs=[('nimit-matra-4', 9), ('satsang-prabha-2', 71), ('satsang-prabha-4', 496)]),
 dict(id='loj', status='confirmed', date='1799-08-21', vs='Shravan vad 6, V.S. 1856', en='Reaches Loj after 7 years 1 month 11 days of van-vicharan',
      refs=[('nimit-matra-3', 176), ('nimit-matra-4', 8), ('satsang-prabha-4', 407)]),
 dict(id='diksha', status='confirmed', date='1800-10-28', vs='Kartik sud 11, V.S. 1857', en='Diksha at Piplana: named Sahajanand Swami and Narayan Muni',
      refs=[('nimit-matra-3', 177)]),
 dict(id='bhugol', status='confirmed', date='1806-11-21', vs='Kartik sud 11, V.S. 1863', en='The Bhugol-Khagol letter (Vachanamrut Bhugol-Khagol)',
      refs=[('satsang-prabha-2', 161), ('satsang-prabha-2', 291), ('nimit-matra-3', 44)]),
 dict(id='dabhan', status='confirmed', date='1810-01-20', vs='Posh sud 15, V.S. 1866', en='Maha Vishnu Yag at Dabhan; Shatanand Muni joins',
      refs=[('nimit-matra-3', 169), ('satsang-prabha-2', 416)]),
 dict(id='gp1', status='confirmed', date='1819-11-21', vs='Magshar sud 4, V.S. 1876', en='First Vachanamrut (Gadhada I-1); the Vachanamruts run to Ashadh vad 10, V.S. 1886',
      refs=[('satsang-prabha-1', 469), ('satsang-prabha-4', 601)]),
 dict(id='ahmedabad', status='confirmed', date='1822-02-24', vs='Fagan sud 3, V.S. 1878', en='Installs Shri NarNarayan Dev at Ahmedabad',
      refs=[('nimit-matra-3', 43), ('nimit-matra-3', 73)]),
 dict(id='bhuj', status='confirmed', date='1823-05-15', vs='Vaishakh sud 5, V.S. 1879', en='Installs Shri NarNarayan Dev at Bhuj', refs=[('nimit-matra-3', 73)]),
 dict(id='vadtal', status='confirmed', date='1824-11-03', vs='Kartik sud 12, V.S. 1881', en='Installs Shri Lakshminarayan Dev and Harikrishna Maharaj at Vadtal',
      refs=[('nimit-matra-3', 25), ('nimit-matra-3', 73), ('satsang-prabha-3', 502)]),
 dict(id='shikshapatri', status='confirmed', date='1826-02-12', vs='Maha sud 5, V.S. 1882', en='Writes the Shikshapatri at Vadtal on Vasant Panchami',
      refs=[('nimit-matra-3', 211), ('satsang-prabha-3', 13), ('satsang-prabha-4', 412)]),
 dict(id='dholera', status='confirmed', date='1826-05-20', vs='Vaishakh sud 13, V.S. 1882', en='Installs Madan Mohan Dev at Dholera', refs=[('nimit-matra-3', 73)]),
 dict(id='lastvach', status='confirmed', date='1829-07-25', vs='Ashadh vad 10, V.S. 1886', en='Last Vachanamrut (Gadhada III-39)',
      refs=[('satsang-prabha-3', 183), ('satsang-prabha-4', 601)]),
 dict(id='antardhan', status='confirmed', date='1830-06-01', vs='Jeth sud 10, V.S. 1886', en='Antardhan at Gadhada',
      refs=[('satsang-prabha-1', 407), ('satsang-prabha-2', 438)]),

 # ---------- conflicts (site unchanged) ----------
 dict(id='faneni', status='conflict', date='1802-01-01', vs='Magshar vad 11–14, V.S. 1858',
      en='First dharma sabha at Faneni and the Swaminarayan mantra',
      refs=[('nimit-matra-3', 13), ('satsang-prabha-3', 415), ('satsang-prabha-4', 207)],
      note='Three readings: Nimit Matra 3 says Magshar vad 14, Sunday 3 Jan 1802; Satsang Prabha 3 says vad 12–13; Satsang Prabha 4 counts his rule from vad 11. Kaal Patrak keeps 1 Jan 1802 (vad 11).'),
 dict(id='surya', status='conflict', date='1792-10-26', vs='Kartik sud 11, V.S. 1849',
      en='Surya Narayan gives darshan at Pulhashram',
      refs=[('nimit-matra-3', 177), ('nimit-matra-4', 193), ('satsang-prabha-1', 559)],
      note=f'Three books give Kartik sud 11, V.S. 1849, and Nimit Matra 4 p. 9 says his tapas was complete on Kartik sud 1. {SS} has him at Badrinath for Annakut on Kartik sud 1 and at Joshimath after it, far from Pulhashram. Not added.'),
 dict(id='kashi', status='conflict', date='1790-10-18', vs='Aso sud 10, V.S. 1847',
      en='Ghanshyam wins over the pandits\' sabha at Kashi on Vijaya Dashami',
      refs=[('satsang-prabha-4', 497)],
      note=f'{SS} has him returning to Chhapaiya after his brother\'s army won, on that day. Not added.'),
 dict(id='vadtal-nilkanth', status='conflict', date='1800-03-08', vs='Fagan sud 12, V.S. 1856',
      en='Nilkanth Varni first enters Vadtal', refs=[('nimit-matra-3', 167)],
      note=f'{SS} has him serving in the Loj ashram (as Saryudas) through Fagan V.S. 1856. Not added.'),
 dict(id='mangrol2', status='conflict', date='1803-01-07', vs='Posh sud 15, V.S. 1859',
      en='Second visit to Mangrol on Poshi Punam', refs=[('nimit-matra-3', 148)],
      note=f'{SS} has him at Muli on that day. Not added.'),
 dict(id='vidurniti', status='conflict', date='1820-08-13', vs='Shravan sud 5–15, V.S. 1877',
      en='Purani Pragji Dave reads the Vidurniti katha at Gadhpur', refs=[('satsang-prabha-1', 316)],
      note=f'{SS} has him travelling to Sarangpur on Shravan sud 12–15. Not added.'),
 dict(id='shatanand-year', status='conflict', date='1810-01-20', vs='Posh, V.S. 1865 or 1866',
      en='When Shatanand Muni came into the sampradaya',
      refs=[('ashtako-ane-kirtano', 25), ('satsang-prabha-2', 416)],
      note=f'Ashtako ane Kirtano says the Dabhan yagna of Posh V.S. 1865; Satsang Prabha 2 and {SS} say Poshi Punam V.S. 1866 (20 Jan 1810). V.S. 1865 Posh was the Jetalpur yagna. Kaal Patrak keeps 1810.'),
 dict(id='bhugol-year', status='conflict', date='1806-11-21', vs='V.S. 1863 or 1876',
      en='Year of the Bhugol-Khagol letter', refs=[('satsang-prabha-1', 355)],
      note='Satsang Prabha 1 notes that older printings date the letter Bhadarva sud 11, V.S. 1876, and newer ones Kartik sud 1–11, V.S. 1863. The site uses V.S. 1863.'),
 dict(id='malcolm-day', status='conflict', date='1830-02-26', vs='Fagan sud 3–5, V.S. 1886',
      en='Exact day of the Malcolm meeting',
      refs=[('satsang-prabha-2', 409), ('satsang-prabha-2', 428), ('satsang-prabha-4', 250)],
      note=f'Satsang Prabha 2 gives 26 Feb 1830 on p. 409 and 28 Feb on p. 428; Satsang Prabha 4 says Fagan sud 4–5 (27–28 Feb). {SS} gives 26 Feb, which the site keeps.'),
 dict(id='misprints', status='conflict', date=None, vs=None,
      en='Misprints inside the books (site follows the majority reading)',
      refs=[('satsang-prabha-1', 315), ('satsang-prabha-2', 68), ('satsang-prabha-4', 544), ('nimit-matra-3', 149)],
      note='Satsang Prabha 1 p. 315 prints "Ashadh vad 10" for leaving home (all others: sud 10). Satsang Prabha 2 p. 68 and 4 p. 544 print "Shravan sud 6" for Loj (others: vad 6). Nimit Matra 3 p. 149 dates the Hari Gita to V.S. 1849, but it was the day before Bhaktimata\'s death, Kartik sud 9, V.S. 1848.'),
]

def kp_url(date):
    y, m, d = date.split('-')
    return f'../kaal-patrak/#d{int(y)}-{int(m)}-{int(d)}'


def build_json():
    out = []
    for it in ITEMS:
        refs, txt = cite(it['refs'])
        out.append({k: v for k, v in dict(
            id=it['id'], status=it['status'], date=it['date'], vs=it['vs'], en=it['en'], gu=it.get('gu'),
            refs=refs, note=it.get('note'), kaal=kp_url(it['date']) if it['date'] else None).items() if v is not None})
    order = {'corrected': 0, 'added': 1, 'conflict': 2, 'confirmed': 3}
    out.sort(key=lambda x: (order[x['status']], x.get('date') or '9'))
    meta = dict(
        made='2026-11-26',
        method='The library PDFs were converted from their legacy Gujarati fonts to Unicode. Every passage with a Vikram Samvat date between V.S. 1837 and 1887 (274 passages) was read; 53 dated events were turned into days with the Shri Swaminarayanam tithi table (Ashadhi year, as the books state) and compared with Shri Swaminarayanam and Kaal Patrak. A change was made only where no source disagrees.',
        books=list(BOOK))
    json.dump(dict(meta=meta, items=out), open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return out


def patch_kaal():
    s = open(KP, encoding='utf-8').read()
    m = re.search(r'(<script id="data"[^>]*>)(.*?)(</script>)', s, re.S)
    d = json.loads(m.group(2))
    dina = d['dina']
    changed = 0
    for it in ITEMS:
        refs, txt = cite(it['refs'])
        src_line = f"Satsang Library: {txt}"
        url = '../vachanamrut-concordance/' + refs[0]['url']
        if it['status'] == 'corrected' and 'move' in it:
            a, b = it['move']
            for x in dina:
                if x['date'] == a:
                    x['date'] = b; x['vs'] = it['vs']; x.pop('approx', None)
                    x['log'].append(['Note', it['note'] + ' Source: ' + txt + '.'])
                    x['src'] = (x.get('src', '') + '; ' + src_line).strip('; ')
                    changed += 1
            # scene picture key
            s = s.replace(f'"{a}": {{"en"', f'"{b}": {{"en"')
        if it['status'] == 'corrected' and 'relabel' in it:
            a, lab = it['relabel']
            for x in dina:
                if x['date'] == a and x['vs'] != lab:
                    x['vs'] = lab
                    x['log'].append(['Note', it['note']])
                    for t, l in it.get('addlog', []): x['log'].append([t, l])
                    x['src'] = (x.get('src', '') + '; ' + src_line).strip('; ')
                    changed += 1
        if it['status'] == 'added':
            if any(x['date'] == it['date'] and x.get('cid') == it['id'] for x in dina):
                continue
            dina.append(dict(date=it['date'], vs=it['vs'], place=it['place'], kind='event', title=it['en'],
                             subtitle='', log=[['Day', it['en'] + '.'], ['Note', it['note'] + ' Source: ' + txt + '.']],
                             src=src_line, url=url, cid=it['id']))
            changed += 1
    dina.sort(key=lambda x: x['date'])
    raw = json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    s = s[:m.start(2)] + raw + s[m.end(2):]
    open(KP, 'w', encoding='utf-8').write(s)
    return changed


if __name__ == '__main__':
    items = build_json()
    from collections import Counter
    print('cross-check items:', Counter(i['status'] for i in items))
    if '--no-kaal' not in sys.argv:
        print('kaal-patrak changes:', patch_kaal())
