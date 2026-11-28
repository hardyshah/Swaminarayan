#!/usr/bin/env python3
"""Builds site/rd3/cmd.json, the small index behind the Ctrl+K command bar (site/rd3.js).

  pages  : every page of the site
  v      : the 274 Vachanamruts (+ Partharo) -> vachanamrut-concordance/#v-ID
  w      : the 800 most used words of the concordance index -> #w-N
  k      : kirtans in the kirtan books (title, poet, book, PDF page), from tools/kirtan/data/books-kirtans.json (PR #9);
           when that file is not in this checkout it is read from the kirtan-audio-pdfs branch with git show.
  b      : e-books -> their PDF on swaminarayan.faith (Shree Swaminarayan Temple Bhuj)
Paths in the file are relative to the site root. Run from the repo root:  python3 tools/rd3/cmd_build.py
"""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
C = os.path.join(ROOT, "vachanamrut-concordance", "data")

PAGES = [  # (path, English, Gujarati, keywords)
    ("index.html", "Today · home", "આજ", "home tithi ghadi choghadiya history"),
    ("vedic-time.html", "Vedic time", "વૈદિક સમય", "ghadi pal vipal clock yuga"),
    ("panchang.html", "Panchang", "પંચાંગ", "tithi nakshatra yoga karana"),
    ("solar-system.html", "Solar system", "સૂર્યમંડળ", "planets jyotish 3d sky"),
    ("vedas.html", "Vedas", "વેદ", "rigveda recitation"),
    ("kaal-patrak/", "Kaal Patrak calendar", "કાળ પત્રક", "calendar date year"),
    ("vicharan/", "Vicharan map", "વિચરણ", "map villages travel"),
    ("murti-3d/", "Murti 3D", "મૂર્તિ ૩D", "gopinathji ghanshyam harikrishna model"),
    ("shangaar.html", "Shangaar", "શણગાર", "darshan photos"),
    ("vachanamrut-concordance/", "Vachanamrut concordance", "વચનામૃત", "concordance read search"),
    ("vachanamrut-concordance/#index", "Word index", "સૂચિ", "words concordance"),
    ("vachanamrut-concordance/#contents", "Vachanamrut contents", "અનુક્રમ", "list sections"),
    ("vachanamrut-concordance/#glossary", "Glossary", "શબ્દકોશ", "terms meaning"),
    ("vachanamrut-concordance/#nondh", "Nondh", "નોંધ", "notes"),
    ("vachanamrut-concordance/timeline.html", "Logbook · timeline", "સમયરેખા", "events history"),
    ("vachanamrut-concordance/library.html", "Library", "પુસ્તકાલય", "books"),
    ("vachanamrut-concordance/ebooks.html", "E-books", "ઈ-પુસ્તકો", "pdf books kirtan"),
    ("vachanamrut-concordance/live.html", "Live darshan", "જીવંત દર્શન", "live vadtal kalupur video"),
    ("me.html", "My Satsang", "મારો સત્સંગ", "member score"),
    ("login.html", "Sign in", "પ્રવેશ", "login member"),
]

def kirtan_data():
    p = os.path.join(ROOT, "tools", "kirtan", "data", "books-kirtans.json")
    if os.path.exists(p): return json.load(open(p, encoding="utf-8"))
    try:
        out = subprocess.check_output(["git", "-C", ROOT, "show", "origin/kirtan-audio-pdfs:tools/kirtan/data/books-kirtans.json"])
        return json.loads(out)
    except Exception:
        return {}

# book slug -> (English title, Gujarati title, PDF) — same list as tools/kirtan/build.py BOOKS
KBOOKS = {
    "kirtan-ratnavali": ("Kirtan Ratnavali", "કીર્તન રત્નાવલી", "https://www.swaminarayan.faith/media/3637/kirtan-ratnavali-gujarati.pdf"),
    "hajari-kirtanavali": ("Hajari Kirtanavali", "હજારી કીર્તનાવલી", "https://www.swaminarayan.faith/media/3565/hajari-kirtanavali.pdf"),
    "ekadashi-jagran": ("Ekadashi Jagran na Kirtano", "એકાદશી જાગરણનાં કીર્તનો", "https://www.swaminarayan.faith/media/3922/ekadashi-jagran-na-kirtano.pdf"),
    "badrinathdasji-kirtanavali": ("Badrinathdasji Krut Kirtanavli", "બદરીનાથદાસજી કૃત કીર્તનાવલી", "https://www.swaminarayan.faith/media/3881/badrinathdasji-krut-kirtanavli.pdf"),
    "ashtako-ane-kirtano": ("Ashtako ane Kirtano", "અષ્ટકો અને કીર્તનો", "vachanamrut-concordance/books/ashtako-ane-kirtano.pdf"),
    "nitya-niyam": ("Nitya Niyam", "નિત્ય નિયમ", "https://www.swaminarayan.faith/media/3667/nitya-niyam.pdf"),
    "kirtan-bhakti": ("Kirtan Bhakti", "કીર્તન ભક્તિ", "https://www.swaminarayan.faith/media/3632/kirtan20bhakti-1.pdf"),
    "kirtan-leelaarth-amrutdhaara": ("Kirtan Leelarth Amrutdhara", "કીર્તન લીલાર્થ અમૃતધારા", "https://www.swaminarayan.faith/media/3634/kirtan-leelaarth-amrutdhaara.pdf"),
}

def main():
    T = json.load(open(os.path.join(C, "text.json"), encoding="utf-8"))
    sec = {s["k"]: (s["en"], s["gu"]) for s in T["sections"]}
    V = [[v["id"], v["title"], sec.get(v["sec"], ("", ""))[0], v["n"]] for v in T["v"]]
    I = json.load(open(os.path.join(C, "index.json"), encoding="utf-8"))
    W = sorted(([i, e["h"], e.get("r", ""), e.get("c", 0)] for i, e in enumerate(I)), key=lambda x: -x[3])[:800]
    W = [w[:3] for w in W]
    K, seen = [], set()
    for lang, books in kirtan_data().items():
        if lang not in ("G", "E"): continue
        for slug, items in books.items():
            b = KBOOKS.get(slug)
            if not b: continue
            for it in items:
                key = (it["t"], slug)
                if key in seen: continue
                seen.add(key)
                K.append([it["t"], it.get("poet_en") or it.get("poet") or "", b[0], b[2] + (f"#page={it['pdf']}" if it.get("pdf") else "")])
    E = json.load(open(os.path.join(C, "ebooks.json"), encoding="utf-8"))
    B = [[b["t"], b.get("gu") or "", b.get("c") or "", b["u"]] for b in E["books"] if b.get("u")]
    out = {"pages": PAGES, "v": V, "w": W, "k": K, "b": B,
           "src": {"v": "Vachanamrut text: vachanamrut-concordance/data/text.json",
                   "k": "Kirtan books and PDFs: swaminarayan.faith (Shree Swaminarayan Temple Bhuj)",
                   "b": "E-books: vachanamrut-concordance/data/ebooks.json"}}
    p = os.path.join(ROOT, "site", "rd3", "cmd.json")
    json.dump(out, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(p, os.path.getsize(p), "bytes;", len(V), "vachanamruts,", len(W), "words,", len(K), "kirtans,", len(B), "books")

if __name__ == "__main__":
    main()
