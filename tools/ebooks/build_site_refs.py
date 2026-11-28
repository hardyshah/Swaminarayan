#!/usr/bin/env python3
"""Books and references used across the site, for the E-books page.

Writes vachanamrut-concordance/data/site-books.json, read by ebooks.html next to data/ebooks.json:

  books   extra books in the same shape as ebooks.json books (t, g, gu, l, c, u, hw) plus
          id, by, pub, yr, d (description), rd ([label, url] reading links), own (the book is
          hosted on this site), m (cover motif). Each one is a book the site cites or hosts that
          is not in the Bhuj e-book catalogue.
  cats    categories this file adds to the page's shelves.
  cites   series name (g) -> [[page label, href], ...]: where the site uses that book. Keys are
          the same for Bhuj books and the books above.
  pages   every page of the site with the sources it cites: [{t, gu, u, s: [[label, url, kind], ...]}].
          Book sources point at the book's card; outside links are scanned from each page.

Rule (Hardik): sampraday books and sites only from the original NarNarayan Dev (Kalupur) and
LaxmiNarayan Dev (Vadtal) dioceses. The Vedic and Jyotish texts are the classical sources of the
Vedas, Panchang, Vedic time and Solar system pages and keep the links those pages already use.

Run from the repository root:  python3 tools/ebooks/build_site_refs.py
Re-run after a page gains or loses a source.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VC = ROOT / "vachanamrut-concordance"
OUT = VC / "data" / "site-books.json"
BIB = {b["key"]: b for b in json.load(open(VC / "data" / "biblio.json", encoding="utf-8"))}
EB = json.load(open(VC / "data" / "ebooks.json", encoding="utf-8"))["books"]
EB_G = {b["g"] for b in EB}

# hrefs are relative to vachanamrut-concordance/ebooks.html
P = {
    "home": ("Home: Today in history", "આજનો દિવસ", "../index.html"),
    "kaal": ("Kaal Patrak", "કાળ પત્રક", "../kaal-patrak/"),
    "vicharan": ("Vicharan map", "વિચરણ નકશો", "../vicharan/"),
    "vach": ("Vachanamrut reader", "વચનામૃત", "index.html"),
    "bib": ("Scriptures cited in the Vachanamrut", "વચનામૃતમાં શાસ્ત્રો", "index.html#sources"),
    "nondh": ("Vachanamrut Nondh", "વચનામૃત નોંધ", "index.html#nondh"),
    "log": ("Logbook of the 273 Vachanamruts", "નોંધપોથી", "timeline.html"),
    "lib": ("Satsang Library", "ગ્રંથાલય", "library.html"),
    "live": ("Live darshan", "લાઇવ", "live.html"),
    "panchang": ("Panchang", "પંચાંગ", "../panchang.html"),
    "vtime": ("Vedic time", "વૈદિક સમય", "../vedic-time.html"),
    "solar": ("Solar system", "સૂર્યમંડળ", "../solar-system.html"),
    "vedas": ("Vedas", "વેદ", "../vedas.html"),
    "shangaar": ("Shangaar darshan", "શણગાર", "../shangaar.html"),
    "murti": ("Murti 3D", "મૂર્તિ 3D", "../murti-3d/"),
}


def at(*keys, n=None):
    """Page links for a book; n adds a count to the last one ("84 topics")."""
    out = [[P[k][0], P[k][2]] for k in keys]
    if n:
        out[-1][0] += f" ({n})"
    return out


def bib_n(key):
    b = BIB[key]
    return f"{b['count']} mentions in {b['vachanamruts']} Vachanamruts"


LIB = "Satsang Library"
NADIAD = "Shri Nathjibhai Shukla ane Shri Ishwarlal Pandya Ashram Jaher Trust, Nadiad"

BOOKS = [
    # ---- hosted on this site (Satsang Library) ----
    dict(id="vachanamrut-nondh", g="Vachanamrut Nondh", t="Vachanamrut Nondh", gu="વચનામૃત નોંધ", l="Gujarati", c="Vachanamrut",
         u="books/vachanamrut-nondh.pdf", own=True, m="nondh", by="Compiled by Ashwin Babubhai Shah",
         d="A topic-by-topic reference index of the Vachanamrut: 5,583 topics with references and quotations, 13 appendices and an index of parables. Each reference opens the passage on this site.",
         rd=[["Open the Nondh on this site", "index.html#nondh"]]),
    dict(id="vachanamrut-darshan", g="Vachanamrut Darshan", t="Vachanamrut Darshan", gu="વચનામૃત દર્શન", l="Gujarati", c="Vachanamrut",
         u=None, m="lotus", by="Rameshchandra L. Pandya",
         d="A study of the Vachanamrut by Rameshchandra L. Pandya, quoted in 7 topics of the Vachanamrut Nondh. Print book; no public copy online.",
         rd=[["Topics that cite it (Vachanamrut Nondh)", "index.html#sources"]]),
    dict(id="shrimad-bhagwat-mahapuran", g="Shrimad Bhagwat Mahapuran", t="Shrimad Bhagwat Mahapuran (complete)", gu="શ્રીમદ્ ભાગવત મહાપુરાણ",
         l="Gujarati", c="Bhagwat & Gita", u="books/shrimad-bhagwat-mahapuran.pdf", own=True, m="flute",
         by="Ved Vyas · original text, complete", pub="Shri Swaminarayan Mandir, Jetalpurdham", pages=984,
         d="The complete Bhagwat in Gujarati, the book Shriji Maharaj cites more than any other in the Vachanamrut (" + bib_n("bhagavat") + ")."),
    dict(id="ashtako-ane-kirtano", g="Ashtako ane Kirtano", t="Ashtako ane Kirtano · for daily worship", gu="અષ્ટકો અને કીર્તનો",
         l="Gujarati", c="Kirtan & prayer", u="books/ashtako-ane-kirtano.pdf", own=True, m="tanpura", ka="books/kirtan-audio/ashtako-ane-kirtano.pdf",
         by="Explained by Rameshchandra L. Pandya", pub="Shri Swaminarayan Satsang Seva Mandal, Nadiad", yr="2001 (reprint)", pages=152,
         d="The ashtaks and kirtans sung in daily worship, each with its meaning."),
    *[dict(id=f"nimit-matra-{i}", g="Nimit Matra", t=f"Nimit Matra · Part {i}", gu=f"નિમિત્ત માત્ર {'૧૨૩૪'[i-1]}", v=str(i), l="Gujarati",
           c="Teachings & commentary", u=f"books/nimit-matra-{i}.pdf", own=True, m="drop", by="Pu. Motabhai (Ishwarlal Labhshankar Pandya)",
           pub="A. Ni. Shri Shukla Nathjibhai Ichchharam Sarvajanik Trust, Nadiad", yr=yr, pages=pg,
           d="Writings of Pu. Motabhai on satsang and the Vachanamrut.")
      for i, yr, pg in [(1, "1980 (V.S. 2037)", 712), (2, "1984 (V.S. 2040)", 650), (3, "", 239), (4, "", 239)]],
    *[dict(id=f"amrutvarsha-{i}", g="Amrutvarsha", t=f"Amrutvarsha · Part {i}", gu=f"અમૃતવર્ષા {'૧૨'[i-1]}", v=str(i), l="Gujarati",
           c="Teachings & commentary", u=f"books/amrutvarsha-{i}.pdf", own=True, m="drop", by="From Pu. Motabhai's letters",
           pub=pub, yr=yr, pages=88, d="Pu. Motabhai's letters to satsangis, collected.")
      for i, pub, yr in [(1, "Shukla Nathjibhai Ichchharam Sarvajanik Trust, Nadiad", "1997 (V.S. 2053)"), (2, NADIAD, "")]],
    *[dict(id=f"satsang-prabha-{i}", g="Satsang Prabha", t=f"Satsang Prabha · Part {i}", gu=f"સત્સંગ પ્રભા {'૧૨૩૪'[i-1]}", v=str(i), l="Gujarati",
           c="Teachings & commentary", u=f"books/satsang-prabha-{i}.pdf", own=True, m="rays", by="Rameshchandra L. Pandya",
           pub=NADIAD, yr="2022", pages=pg, d="Talks on satsang by Rameshchandra L. Pandya.")
      for i, pg in [(1, 576), (2, 556), (3, 584), (4, 628)]],
    dict(id="smruti-ank-satsang-pradeep", g="Smruti Ank · Satsang Pradeep", t="Smruti Ank of Pu. Motabhai · Satsang Pradeep", gu="સ્મૃતિ અંક · સત્સંગ પ્રદીપ",
         l="Gujarati", c="Teachings & commentary", u="books/smruti-ank-satsang-pradeep.pdf", own=True, m="diya",
         pub="Shri Swaminarayan Satsang Seva Mandal (magazine Satsang Pradeep)", yr="Year 12, issues 9–10, Aug–Sep 1982", pages=133,
         d="The memorial issue of the magazine Satsang Pradeep for Jivanmukta Pu. Ishwarlal L. Pandya (Pu. Motabhai). The Vachanamrut Nondh quotes Satsang Pradeep in 3 topics."),

    # ---- sampraday granths the site is built from ----
    dict(id="shri-swaminarayanam", g="Shri Swaminarayanam", t="Shri Swaminarayanam", gu="શ્રી સ્વામિનારાયણમ્", l="Gujarati", c="Life & leela of Shriji",
         u="../kaal-patrak/", m="calendar", by="Ed. Shastri Swami Nirgundasji", pub="Shri Sahajanand Gurukul, Asarva, Ahmedabad", yr="2015",
         d="A day-by-day account of Shri Hari's life, April 1781 to June 1830, with the tithi of every day. It is the backbone of Kaal Patrak, the Vicharan map and Today in history. Print book, copyright Shri Sahajanand Gurukul; read its day entries in Kaal Patrak.",
         rd=[["Day by day in Kaal Patrak", "../kaal-patrak/"], ["Page scans on the Vicharan map", "../vicharan/"]]),
    dict(id="harililamrut", g="Shri Harililamrut", t="Shri Harililamrut", gu="શ્રી હરિલીલામૃત", l="Gujarati", c="Life & leela of Shriji",
         u=None, m="sun", by="Acharya Shri Viharilalji Maharaj (Vadtal)",
         d="A verse life of Shri Hari in kalashes and vishrams by the third Acharya of the LaxmiNarayan Dev gadi, Vadtal. The Vachanamrut Nondh quotes it in 84 topics (and 79 by vishram); Kaal Patrak uses it for life events. Print book; no official copy online.",
         rd=[["Topics that cite it (Vachanamrut Nondh)", "index.html#sources"]]),
    dict(id="desh-vibhag-lekh", g="Desh Vibhag no Lekh", t="Desh Vibhag no Lekh", gu="દેશવિભાગનો લેખ", l="Gujarati", c="Life & leela of Shriji",
         u=None, m="scroll", by="Bhagwan Shri Swaminarayan (written by Shuk Muni)", yr="Magshar sud 15, V.S. 1883 (1826)",
         d="The document by which Shri Hari divided the sampraday into the NarNarayan Dev (Ahmedabad) and LaxmiNarayan Dev (Vadtal) dioceses under the two Acharyas. Kaal Patrak cites it for the day of the division.",
         rd=[["The day in Kaal Patrak", "../kaal-patrak/"]]),
    dict(id="sksst-timeline", g="Lord Swaminarayan's Timeline", t="Lord Swaminarayan's Timeline", gu="ભગવાન સ્વામિનારાયણ સમયરેખા", l="English", c="Life & leela of Shriji",
         u="https://cdn.sksst.org/site/documents/bym/topics%20covered/lord_swaminarayans_timeline.pdf", m="path",
         pub="Shree Kutch Satsang Swaminarayan Temple, London (Bhuj, NarNarayan Dev diocese)",
         d="A year-by-year timeline of Shri Hari's life from the Bhuj diocese temple in London, used by Kaal Patrak for events no granth dates."),
    dict(id="ghanshyam-daily-ritual", g="Ghanshyam Maharaj's Daily Ritual", t="Ghanshyam Maharaj's Daily Ritual", gu="ઘનશ્યામ મહારાજની દૈનિક સેવા", l="English", c="Rites, vrat & seva",
         u="https://cdn.sksst.org/site/documents/bym/topics%20covered/ghanshyam_maharajs_daily_ritual.pdf", m="diya",
         pub="Shree Kutch Satsang Swaminarayan Temple, London (Bhuj, NarNarayan Dev diocese)",
         d="The daily seva of Ghanshyam Maharaj, from mangla to shayan, used on the Shangaar page for the darshan of each part of the day."),
    dict(id="samaj-sudharak-en", g="Samaj Sudharak", t="Social Reformer Lord Shree Swaminarayan", l="English", c="Teachings & commentary",
         u=None, m="book", by="Dr. Swami Satyaprasaddasji; tr. Ashish Raval", pub="Shree NarNarayan Dev Sahitya Series no. 42, Bhuj", yr="2010",
         d="The English edition of Samaj Sudharak. Its dates were cross-checked against Shri Swaminarayanam for the Dinacharya. Uploaded copy only; read the Gujarati edition from Bhuj."),
]

# ---- the shastras Shriji Maharaj names in the Vachanamrut (Shikshapatri 93–95 lists the eight sat-shastras) ----
SHASTRA = "Shastras cited in the Vachanamrut"
for key, g, m, extra in [
    ("veda", "The Vedas", "fire", "Rigveda in full, with recitations, is on the Vedas page."),
    ("upanishad", "Upanishads", "om", ""),
    ("vedanta", "Vedanta and the Vyas Sutras", "om", "The Shikshapatri names the Vyas Sutras with Ramanujacharya's bhashya among the sat-shastras."),
    ("sankhya", "Sankhya shastra", "chakra", ""),
    ("yoga", "Yoga shastra", "lotus", ""),
    ("purana", "The Puranas", "scroll", ""),
    ("skanda", "Skanda Purana", "conch", "The Vasudev Mahatmya, one of the eight sat-shastras, is part of its Vishnu khand."),
    ("padma", "Padma Purana", "lotus", ""),
    ("mahabharata", "Mahabharata", "chakra", "The Gita, Vidurniti and Vishnu Sahasranam, three of the eight sat-shastras, come from it."),
    ("ramayana", "Ramayana", "bow", ""),
    ("smriti", "Smritis and Dharmashastra", "scales", "The Shikshapatri names the Yajnavalkya Smriti among the eight sat-shastras."),
    ("pancharatra", "Pancharatra", "diya", ""),
]:
    b = BIB[key]
    BOOKS.append(dict(id="shastra-" + key, g=g, t=g, gu=b["gu"], l="Sanskrit", c=SHASTRA, u="index.html#sources", m=m,
                      d=f"{b['description']} {extra}".strip() + f" Cited in the Vachanamrut: {bib_n(key)}.",
                      rd=[["Every citation in context", "index.html#sources"]]))
for b in BOOKS:
    if b["id"] == "shastra-veda":
        b["rd"] = [["Rigveda reader and recitations", "../vedas.html"], ["Every citation in the Vachanamrut", "index.html#sources"]]

# ---- classical texts of the Vedas, Panchang, Vedic time and Solar system pages ----
JYOT = "Veda & Jyotish"
WP = "https://en.wikipedia.org/wiki/"
for id_, t, gu, by, yr, m, d, links in [
    ("samaveda", "Samaveda", "સામવેદ", "", "", "tanpura", "The Veda of chant; the Vedas page uses Griffith's translation.",
     [["Griffith's translation (Wikisource)", "https://en.wikisource.org/wiki/The_Sama_Veda"], ["On the Vedas page", "../vedas.html"]]),
    ("yajurveda", "White Yajurveda", "શુક્લ યજુર્વેદ", "", "", "fire", "The Vajasaneyi Samhita; the Vedas page quotes book 17 for the counting of large numbers.",
     [["Griffith's translation (sacred-texts)", "https://sacred-texts.com/hin/wyv/"], ["On the Vedas page", "../vedas.html"]]),
    ("atharvaveda", "Atharvaveda", "અથર્વવેદ", "", "", "leaf", "Quoted on the Vedas page, including the hymn to the Earth (12.1).",
     [["Griffith's translation (sacred-texts)", "https://sacred-texts.com/hin/av/"], ["On the Vedas page", "../vedas.html"]]),
    ("shatapatha-brahmana", "Shatapatha Brahmana", "શતપથ બ્રાહ્મણ", "", "", "fire", "Source of the Vedic units of time, from the muhurta down.",
     [["About", WP + "Shatapatha_Brahmana"]]),
    ("vedanga-jyotisha", "Vedanga Jyotisha", "વેદાંગ જ્યોતિષ", "Lagadha", "", "orbit", "The oldest Indian text on the calendar: the five-year yuga of sun and moon.",
     [["About", WP + "Vedanga_Jyotisha"]]),
    ("nirukta", "Nirukta", "નિરુક્ત", "Yaska", "", "book", "Yaska's study of Vedic words.", [["About", WP + "Nirukta"]]),
    ("chandahshastra", "Chandahshastra", "છંદઃશાસ્ત્ર", "Pingala", "", "beads", "Pingala's work on metre, with the earliest binary counting and the Meru prastara.",
     [["About Pingala", WP + "Pingala"]]),
    ("shulba-sutras", "Shulba Sutras", "શુલ્બ સૂત્ર", "", "", "kalash", "Geometry for building fire altars.",
     [["About", WP + "Shulba_Sutras"], ["MacTutor: the Indian Sulbasutras", "https://mathshistory.st-andrews.ac.uk/HistTopics/Indian_sulbasutras/"]]),
    ("surya-siddhanta", "Surya Siddhanta", "સૂર્ય સિદ્ધાંત", "", "c. 400–500 CE", "sun", "The astronomy behind the traditional panchang: tithi, nakshatra and the length of the year.",
     [["Burgess's 1860 translation (archive.org)", "https://archive.org/search?query=Surya+Siddhanta+Burgess"], ["About", WP + "Surya_Siddhanta"]]),
    ("aryabhatiya", "Aryabhatiya", "આર્યભટીય", "Aryabhata", "499 CE", "orbit", "Aryabhata's astronomy and mathematics, with the turning earth.",
     [["Clark's 1930 translation (archive.org)", "https://archive.org/search?query=Aryabhatiya+Clark"], ["About", WP + "Aryabhatiya"]]),
    ("siddhanta-shiromani", "Siddhanta Shiromani", "સિદ્ધાંત શિરોમણિ", "Bhaskaracharya", "1150 CE", "orbit", "Bhaskaracharya's astronomy, cited on the Vedic time page.",
     [["About", WP + "Siddh%C4%81nta_Shiroma%E1%B9%87i"]]),
    ("brihat-samhita", "Brihat Samhita", "બૃહત્ સંહિતા", "Varahamihira", "6th century", "stars", "Varahamihira's encyclopaedia of jyotish.",
     [["About", WP + "Brihat_Samhita"]]),
    ("brihat-parashara-hora-shastra", "Brihat Parashara Hora Shastra", "બૃહત્ પારાશર હોરાશાસ્ત્ર", "Parashara", "", "stars", "The main text of hora jyotish, source of the Vimshottari dasha on the Solar system page.",
     [["About", WP + "Brihat_Parashara_Hora_Shastra"]]),
]:
    BOOKS.append(dict(id=id_, g=t, t=t, gu=gu, l="Sanskrit", c=JYOT, u=links[0][1], m=m, by=by, yr=yr, d=d, rd=links))

for b in BOOKS:
    b.setdefault("hw", False)
    b.setdefault("v", None)
    b.setdefault("s", None)
    for k in ("by", "pub", "yr"):
        if not b.get(k):
            b.pop(k, None)
    assert not (b["g"] in EB_G and b["id"] not in ("samaj-sudharak-en",)), b["g"]

# ---- where the site uses each book (Bhuj books by their series name, ours by g) ----
CITES = {
    "Vachanamrut": at("vach", "log", "nondh") + at("kaal") + at("home"),
    "Vachnamrut Gutko": at("vach"),
    "Vachanamrut Nondh": at("nondh", "lib"),
    "Vachanamrut Darshan": at("nondh", n="7 topics"),
    "Bhakta Chintamani": at("kaal", "vicharan") + at("nondh", n="122 topics"),
    "Shikshapatri": at("kaal") + at("nondh", n="40 topics") + at("bib", n=bib_n("shikshapatri")),
    "Satsangi Jivan": at("nondh"),
    "Shreemad Bhagwad Gita": at("bib", n=bib_n("gita")) + at("nondh", n="58 topics"),
    "Bhagvad 10th Skand": at("bib", n=bib_n("bhagavat")),
    "Bhagvad 5th Skand": at("bib", n=bib_n("bhagavat")),
    "Shrimad Bhagwat Mahapuran": at("lib") + at("bib", n=bib_n("bhagavat")) + at("nondh", n="70 topics"),
    "Vasudev Mahatmya": at("kaal") + at("bib", n=bib_n("vasudevmahatmya")),
    "Vidur Niti": at("bib", n=bib_n("vidurniti")),
    "Vishnu Sahastranam (Stotra And Namavali)": at("bib", n=bib_n("vishnusahasranama")),
    "Kapil Gita Anuvad Handwritten": at("bib", n=bib_n("kapilagita")),
    "Sharirik Sutar Bhashya Handwritten": at("bib", n=bib_n("vedanta")),
    "Sarvamangal Namavali": at("nondh", n="177 topics"),
    "Nishkulanand Kavya": at("nondh", n="4 topics"),
    "Ashtako ane Kirtano": at("lib"),
    "Nimit Matra": at("lib"),
    "Amrutvarsha": at("lib"),
    "Satsang Prabha": at("lib"),
    "Smruti Ank · Satsang Pradeep": at("lib") + at("nondh", n="3 topics"),
    "Shri Swaminarayanam": at("kaal", "vicharan", "home"),
    "Shri Harililamrut": at("kaal") + at("nondh", n="84 topics"),
    "Desh Vibhag no Lekh": at("kaal"),
    "Lord Swaminarayan's Timeline": at("kaal"),
    "Ghanshyam Maharaj's Daily Ritual": at("shangaar"),
    "The Vedas": at("vedas", "vtime") + at("bib", n=bib_n("veda")),
    "Samaveda": at("vedas"), "White Yajurveda": at("vedas"), "Atharvaveda": at("vedas"),
    "Shatapatha Brahmana": at("vtime"),
    "Vedanga Jyotisha": at("vedas", "vtime", "solar"),
    "Nirukta": at("vedas"), "Chandahshastra": at("vedas"), "Shulba Sutras": at("vedas"),
    "Surya Siddhanta": at("panchang", "vtime", "solar", "vedas"),
    "Aryabhatiya": at("panchang", "vtime", "solar"),
    "Siddhanta Shiromani": at("vtime"),
    "Brihat Samhita": at("solar"), "Brihat Parashara Hora Shastra": at("solar"),
}
for key, g, *_ in [("upanishad", "Upanishads"), ("vedanta", "Vedanta and the Vyas Sutras"), ("sankhya", "Sankhya shastra"),
                   ("yoga", "Yoga shastra"), ("purana", "The Puranas"), ("skanda", "Skanda Purana"), ("padma", "Padma Purana"),
                   ("mahabharata", "Mahabharata"), ("ramayana", "Ramayana"), ("smriti", "Smritis and Dharmashastra"),
                   ("pancharatra", "Pancharatra")]:
    CITES[g] = at("bib", n=bib_n(key))
known_g = EB_G | {b["g"] for b in BOOKS}
for g in CITES:
    assert g in known_g, f"cites: unknown series {g}"

# ---- every page and its sources ----
BOOK_URL = {}  # outside or local url -> book id, so a page's book links point at the card
for b in BOOKS:
    for u in [b.get("u")] + [r[1] for r in b.get("rd", [])]:
        if u and u.startswith("http"):
            BOOK_URL.setdefault(u, b["id"])
for b in EB:
    BOOK_URL.setdefault(b["u"], b["g"])

SKIP = re.compile(r"fonts\.g|claude\.ai|claude\.com|anthropic\.com|google\.com/maps|earth\.google|\$\{|w3\.org|c2pa|"
                  r"creativecommons|drive\.google|threejs\.org|huggingface\.co/docs|youtube\.com/@|i\.ytimg")
# sources that are not original Kalupur/Vadtal sites are left out of this index on purpose
NOT_ORIGINAL = re.compile(r"swaminarayan\.nu|swaminarayanbhagwan\.org|baps|anirdesh|maninagar")


def kind(u):
    if re.search(r"swaminarayan\.(in|info|faith)|sksst\.org|vadtal|nnd\.media", u):
        return "sampraday"
    if "youtube" in u:
        return "video"
    if re.search(r"wikipedia|wikisource|sacred-texts|archive\.org", u):
        return "reference"
    return "science"


def scan(path):
    s = (ROOT / path).read_text(encoding="utf-8", errors="ignore")
    out, seen = [], set()
    for m in re.finditer(r'<a\b[^>]*href="(https?://[^"]+)"[^>]*>(.*?)</a>', s, re.S):
        u = html.unescape(m.group(1))
        t = html.unescape(re.sub(r"<[^>]+>|\s+", " ", m.group(2))).replace("📖", "").replace("↗", "").strip()
        if SKIP.search(u) or NOT_ORIGINAL.search(u) or u in seen or not t:
            continue
        seen.add(u)
        if t.lower() in ("archive.org", "github", "wikisource") or t.startswith("doi:") or t == u:
            continue
        out.append([RENAME.get(t, t), u, kind(u)])
    return out


def bk(*ids):
    by_id = {b["id"]: b for b in BOOKS}
    out = []
    for i in ids:
        g, t = (by_id[i]["g"], by_id[i]["g"]) if i in by_id else (i, i)  # ours by id, a Bhuj series by its name
        out.append([t, "#book=" + re.sub(r"[^a-z0-9]+", "-", g.lower()).strip("-"), "book"])
    return out


WIKI_N = len(set(re.findall(r'"src":"https://en\.wikipedia\.org/wiki/[^"]+"', (ROOT / "kaal-patrak/index.html").read_text(encoding="utf-8"))))
RENAME = {"this Pinterest pin": "Pinterest: Rangmahol Ghanshyam Maharaj darshan photo"}

SITE = [
    ("home", "index.html", bk("shri-swaminarayanam") + [["Shree Swaminarayan Mandir Bhuj: life of Shri Hari", "https://www.swaminarayan.faith/our-faith/about-swaminarayan-bhagwan/his-life", "sampraday"]] + bk("Vachanamrut")),
    ("kaal", "kaal-patrak/index.html", bk("shri-swaminarayanam", "Bhakta Chintamani", "harililamrut", "Vachanamrut", "desh-vibhag-lekh", "Vasudev Mahatmya", "Shikshapatri", "sksst-timeline")
     + [[f"Wikipedia: {WIKI_N} articles on world events beside Shri Hari's days", "https://en.wikipedia.org/", "reference"]]),
    ("vicharan", "vicharan/index.html", bk("shri-swaminarayanam", "Bhakta Chintamani") + [["Shree Swaminarayan Mandir Kalupur: daily darshan", "https://www.swaminarayan.in/", "sampraday"]]),
    ("vach", "vachanamrut-concordance/index.html", bk("Vachanamrut", "vachanamrut-nondh") + [["Kalupur daily darshan (NarNarayan Dev)", "https://dailydarshanserver.nnd.media/temple/dailydarshan", "sampraday"]]),
    ("bib", None, bk("Shrimad Bhagwat Mahapuran", "Shreemad Bhagwad Gita", "shastra-veda", "shastra-upanishad", "shastra-vedanta", "shastra-sankhya", "shastra-yoga",
                     "shastra-purana", "shastra-mahabharata", "shastra-smriti", "shastra-pancharatra", "shastra-ramayana", "shastra-skanda", "shastra-padma",
                     "Vasudev Mahatmya", "Vidur Niti", "Vishnu Sahastranam (Stotra And Namavali)", "Kapil Gita Anuvad Handwritten", "Shikshapatri")),
    ("nondh", None, bk("vachanamrut-nondh", "Bhakta Chintamani", "harililamrut", "Sarvamangal Namavali", "Shikshapatri", "Shrimad Bhagwat Mahapuran",
                       "Shreemad Bhagwad Gita", "vachanamrut-darshan", "smruti-ank-satsang-pradeep", "Nishkulanand Kavya", "Satsangi Jivan")),
    ("log", "vachanamrut-concordance/timeline.html", bk("Vachanamrut")),
    ("lib", "vachanamrut-concordance/library.html", bk("vachanamrut-nondh", "shrimad-bhagwat-mahapuran", "ashtako-ane-kirtano", "nimit-matra-1", "amrutvarsha-1",
                                                       "satsang-prabha-1", "smruti-ank-satsang-pradeep")),
    ("live", "vachanamrut-concordance/live.html", []),
    ("panchang", "panchang.html", bk("surya-siddhanta", "aryabhatiya")),
    ("vtime", "vedic-time.html", bk("shatapatha-brahmana", "vedanga-jyotisha", "surya-siddhanta", "aryabhatiya", "siddhanta-shiromani")),
    ("solar", "solar-system.html", bk("surya-siddhanta", "aryabhatiya", "vedanga-jyotisha", "brihat-samhita", "brihat-parashara-hora-shastra")),
    ("vedas", "vedas.html", bk("shastra-veda", "samaveda", "yajurveda", "atharvaveda", "vedanga-jyotisha", "nirukta", "chandahshastra", "shulba-sutras", "surya-siddhanta")),
    ("shangaar", "shangaar.html", bk("ghanshyam-daily-ritual")),
    ("murti", "murti-3d/index.html", []),
]
pages = []
for key, path, books in SITE:
    t, gu, u = P[key]
    srcs = list(books)
    have = {s[1] for s in srcs}
    if path:
        for s in scan(path):
            if s[1] in BOOK_URL:  # a book link: point at its card instead
                bid = BOOK_URL[s[1]]
                s = bk(bid)[0]
            if s[1] not in have:
                have.add(s[1])
                srcs.append(s)
    pages.append(dict(t=t, gu=gu, u=u, s=srcs))

out = dict(note="Built by tools/ebooks/build_site_refs.py. Books and references used across the site, for ebooks.html.",
           cats=[SHASTRA, JYOT], books=BOOKS, cites=CITES, pages=pages)
OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"{OUT.relative_to(ROOT)}: {len(BOOKS)} books, {len(CITES)} cited series, "
      f"{len(pages)} pages, {sum(len(p['s']) for p in pages)} sources")
