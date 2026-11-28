#!/usr/bin/env python3
"""Build data/mindmap/tree.json for mindmap.html: a map of the resources of the original Swaminarayan Sampraday
(Shree NarNarayan Dev Gadi, Kalupur-Ahmedabad, and Shree LaxmiNarayan Dev Gadi, Vadtal).

Rules (project memory): diocese sources only (Kalupur swaminarayan.in, Vadtal Gadi, Bhuj swaminarayan.faith and this
site's own pages/books); never breakaway organisations. Every node carries the link to its source.
Book links are looked up in vachanamrut-concordance/data/ebooks.json (the Bhuj e-book catalogue) so URLs stay exact.
Run: python3 tools/mindmap_build.py
"""
import json, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
EB = json.load(open(ROOT / "vachanamrut-concordance/data/ebooks.json", encoding="utf-8"))["books"]

KAL = "https://swaminarayan.in"
BHUJ = "https://www.swaminarayan.faith"
VAD = "https://swaminarayanvadtalgadi.org"

# Source labels shown on each node's chip, and listed in the page's Sources section.
SRC = {
 "kal": ("Shree Swaminarayan Mandir Kalupur (NarNarayan Dev Gadi)", KAL + "/"),
 "bhuj": ("Shree Swaminarayan Mandir Bhuj (NarNarayan Dev diocese)", BHUJ + "/"),
 "vad": ("Shree LaxmiNarayan Dev Gadi, Vadtal", VAD + "/"),
 "vadm": ("Vadtal Mandir", "http://www.vadtalmandir.org/"),
 "site": ("This site", "./"),
 "eb": ("Bhuj e-book collection", BHUJ + "/scriptures/ebooks"),
}

def ebook(title, lang=None):
    for b in EB:
        if b["t"] == title and (lang is None or b["l"] == lang):
            return b["u"]
    sys.exit(f"e-book not found: {title} {lang}")

def N(en, url, src, gu=None, note=None, kind=None, kids=None, id=None):
    n = {"en": en, "url": url, "src": src}
    if gu: n["gu"] = gu
    if note: n["note"] = note
    if kind: n["kind"] = kind
    if id: n["id"] = id
    if kids: n["kids"] = kids
    return n

def site(en, path, gu=None, note=None):
    return N(en, path, "site", gu, note, kind="site")

def book(en, title, lang=None, gu=None, note=None):
    return N(en, ebook(title, lang), "eb", gu, note, kind="book")

def bt(slug, en, gu=None):  # temple page in the Bhuj temple directory
    return N(en, f"{BHUJ}/temples/{slug}", "bhuj", gu, kind="temple")

def fest(slug, en, gu=None):
    return N(en, f"{BHUJ}/festivals/{slug}", "bhuj", gu, kind="fest")

def santo(slug, en, gu):
    return N(en, f"{BHUJ}/articles/nand-santos/{slug}", "bhuj", gu, kind="saint")

GP = BHUJ + "/about/guru-parampara"
SIX = BHUJ + "/our-faith/about-swaminarayan-bhagwan/6-primary-temples"

tree = N("Swaminarayan Sampraday", BHUJ + "/our-faith/about-swaminarayan-bhagwan", "bhuj", "શ્રી સ્વામિનારાયણ સંપ્રદાય",
  "The sampraday as Bhagwan Swaminarayan himself established it: two gadis, NarNarayan Dev (Ahmedabad) and LaxmiNarayan Dev (Vadtal), each with an acharya, temples, saints and scriptures.",
  kind="root", id="root", kids=[

 N("Bhagwan Swaminarayan", BHUJ + "/our-faith/about-swaminarayan-bhagwan/his-life", "bhuj", "ભગવાન શ્રી સ્વામિનારાયણ",
   "His life, from Chhapaiya to Gadhada.", id="shriji", kids=[
   N("His life", BHUJ + "/our-faith/about-swaminarayan-bhagwan/his-life", "bhuj", "જીવન ચરિત્ર"),
   N("Ghanshyam Charitra", KAL + "/our-sampraday/swaminarayan-faith/ghanshyam-charitra", "kal", "ઘનશ્યામ ચરિત્ર", "Childhood in Chhapaiya and Ayodhya."),
   N("Vanvicharan (Nilkanth Varni)", KAL + "/our-sampraday/swaminarayan-faith/vanvicharan", "kal", "વનવિચરણ", "Seven years of pilgrimage across India as Nilkanth Varni."),
   N("Swaminarayan Charitra", KAL + "/our-sampraday/swaminarayan-faith/swaminarayan-charitra", "kal", "સ્વામિનારાયણ ચરિત્ર"),
   N("Guru: Ramanand Swami", BHUJ + "/articles/nand-santos/ramanand-swami", "bhuj", "ગુરુ રામાનંદ સ્વામી",
     "Ramanand Swami received Vaishnavi diksha from Ramanujacharya in a dream; Shreeji Maharaj is his disciple and successor (Guru Parampara page)."),
   N("Letter to Ramanand Swami", BHUJ + "/articles/letter-to-ramanand-swami", "bhuj", "રામાનંદ સ્વામીને પત્ર"),
   N("The five vows", BHUJ + "/our-faith/the-five-vows", "bhuj", "પાંચ વર્તમાન"),
   N("What we believe", BHUJ + "/our-faith/what-we-believe", "bhuj", "સિદ્ધાંત"),
   bt("chhapaiya-temple", "Chhapaiya, birthplace", "છપૈયા"),
   site("Vicharan map: every village he visited", "vicharan/", "વિચરણ નકશો"),
   site("Kaal Patrak: his life day by day", "kaal-patrak/", "કાળ પત્રક"),
   site("Logbook: all 273 Vachanamruts dated", "vachanamrut-concordance/timeline.html", "નોંધપોથી"),
   site("Murti 3D: Gopinathji, Ghanshyam, Harikrishna", "murti-3d/", "મૂર્તિ 3D"),
 ]),

 N("The two gadis", GP, "bhuj", "બે ગાદી",
   "Established at Vadtal on Kartik sud 11, VS 1882 (21 November 1825). Shreeji Maharaj adopted his nephews Ayodhyaprasadji and Raghuveerji as acharyas; the Desh Vibhag no Lekh divides the two dioceses and sets how acharyas are appointed. Shikshapatri shlokas 3 and 123–134 give the acharyas' niyams.",
   id="gadis", kids=[

   N("Shree NarNarayan Dev Gadi", KAL + "/", "kal", "શ્રી નરનારાયણ દેવ ગાદી",
     "Seat at Kalupur, Ahmedabad. Uttar Vibhag (northern diocese).", id="nnd", kids=[
     N("Kalupur mandir, Ahmedabad", KAL + "/mandirs/india/shree-swaminarayan-mandir-ahmedabad-kalupur", "kal", "કાલુપુર મંદિર",
       "The first temple of the sampraday. Shreeji Maharaj installed Shree NarNarayan Dev on Fagan sud 3, VS 1878 (24 February 1822); Anandanand Swami built it on land given by the British government.", kind="temple"),
     N("Acharyas", KAL + "/our-sampraday/acharya", "kal", "આચાર્ય પરંપરા", "The acharya parampara of the NarNarayan Dev Gadi.", kids=[
       N("Acharya Shri Ayodhyaprasadji Maharaj (first)", GP, "bhuj", "આ. શ્રી અયોધ્યાપ્રસાદજી મહારાજ", "Inaugural acharya, seated by Shreeji Maharaj on 21 November 1825."),
       N("Acharya Shri Tejendraprasadji Maharaj", KAL + "/our-mandir/isso", "kal", "આ. શ્રી તેજેન્દ્રપ્રસાદજી મહારાજ", "Founded ISSO in North America (Vijaya Dashmi 1978) and ISSO Europe (Guru Purnima 1989)."),
       N("Acharya Shri Koshalendraprasadji Maharaj", KAL + "/our-mandir/isso", "kal", "આ. શ્રી કોશલેન્દ્રપ્રસાદજી મહારાજ", "Present acharya. Founded NNDYM (1994) and the first Australasian mandir (Sydney, 2006)."),
       N("Dharmakul schedule", KAL + "/events/dharmakul-schedule", "kal", "ધર્મકુળ કાર્યક્રમ"),
     ]),
     N("Prime temples of the diocese", SIX, "bhuj", "મુખ્ય મંદિરો", kids=[
       N("Bhuj: Shree NarNarayan Dev", BHUJ + "/about/bhuj-temple-history", "bhuj", "ભુજ",
         "Shreeji Maharaj installed NarNarayan Dev at Bhuj on Vaishakh sud 5, VS 1879 (15 May 1823); built by Vaishnavanand Swami.", kind="temple"),
       bt("muli-temple", "Muli", "મૂળી"),
       bt("jetalpur-temple", "Jetalpur", "જેતલપુર"),
       bt("dholka-temple", "Dholka", "ધોળકા"),
     ]),
     N("Mandirs worldwide", KAL + "/mandirs/india", "kal", "દેશ-વિદેશનાં મંદિરો", kids=[
       N("India", KAL + "/mandirs/india", "kal", "ભારત"),
       N("USA", KAL + "/mandirs/usa", "kal", "અમેરિકા"),
       N("Canada", KAL + "/mandirs/canada", "kal", "કેનેડા"),
       N("Europe", KAL + "/mandirs/europe", "kal", "યુરોપ"),
       N("Africa", KAL + "/mandirs/africa", "kal", "આફ્રિકા"),
       N("Australasia", KAL + "/mandirs/australasia", "kal", "ઓસ્ટ્રેલેશિયા"),
       N("Find a temple (Bhuj directory)", BHUJ + "/temples", "bhuj", "મંદિર શોધો"),
     ]),
     N("Organisations", KAL + "/our-mandir/isso", "kal", "સંસ્થાઓ", kids=[
       N("ISSO: International Swaminarayan Satsang Organisation", KAL + "/our-mandir/isso", "kal", "આઈ.એસ.એસ.ઓ.", "Builds and runs mandirs outside India; founded 1978."),
       N("NNDYM: NarNarayan Dev Yuvak Mandal", KAL + "/our-mandir/nndym", "kal", "યુવક મંડળ", "Youth wing, founded 1994."),
       N("Shree Swaminarayan Mandir Bhuj", BHUJ + "/", "bhuj", "ભુજ મંદિર", "Diocese temple with its own saints, e-books, apps and magazines."),
       N("Bhuj saints: mandal tree", BHUJ + "/about/our-saints/mandal-tree", "bhuj", "સંત મંડળ"),
     ]),
     N("Kalupur online", KAL + "/", "kal", "કાલુપુર ઓનલાઈન", kind="media", kids=[
       N("Daily darshan, Kalupur", KAL + "/daily-darshan/kalupur-ahmedabad", "kal", "દૈનિક દર્શન", kind="media"),
       N("Daily darshan worldwide", KAL + "/daily-darshan/daily-darshan-worldwide", "kal", kind="media"),
       N("Events calendar", KAL + "/events/calendar", "kal", "કાર્યક્રમ", kind="media"),
       N("YouTube channel", "https://www.youtube.com/@swaminarayantemplekalupur", "kal", kind="media"),
       N("Music player", "https://music.swaminarayan.in", "kal", "કીર્તન", kind="media"),
       N("Picture gallery", KAL + "/media-gallery/picture-gallery", "kal", kind="media"),
       N("Facebook", "https://www.facebook.com/swaminarayantemplekalupur", "kal", kind="media"),
       N("Instagram", "https://www.instagram.com/swaminarayantemplekalupur/", "kal", kind="media"),
       N("WhatsApp channel", "https://whatsapp.com/channel/0029Va93VAb4SpkDfnWpdR3c", "kal", kind="media"),
       N("SoundCloud", "https://soundcloud.com/swaminarayantemplekalupur", "kal", kind="media"),
       N("Contact", KAL + "/contact-us", "kal", kind="media"),
     ]),
     N("Bhuj online", BHUJ + "/", "bhuj", "ભુજ ઓનલાઈન", kind="media", kids=[
       N("Daily darshan", BHUJ + "/prayer-and-worship/daily-darshan", "bhuj", "દૈનિક દર્શન", kind="media"),
       N("Calendar, nirnay and eclipses", BHUJ + "/news-and-events/calendar", "bhuj", "પંચાંગ", kind="media"),
       N("Bhakti Sound (kirtan)", BHUJ + "/bhaktisound", "bhuj", "ભક્તિ સાઉન્ડ", kind="media"),
       N("YouTube channel", "https://www.youtube.com/user/BhujMandir/", "bhuj", kind="media"),
       N("Android apps", "https://play.google.com/store/apps/dev?id=5078538341874319941", "bhuj", kind="media"),
       N("Apple apps", "https://apps.apple.com/us/developer/shree-swaminarayan-mandir-bhuj/id438069407?see-all=i-phonei-pad-apps", "bhuj", kind="media"),
       N("Vachanamrut eBook app", BHUJ + "/prayer-and-worship/apps/vachanamrut-ebook", "bhuj", kind="media"),
       N("Magazines", BHUJ + "/learning-resources/magazines", "bhuj", "સામયિક", kind="media"),
       N("Daily pooja", BHUJ + "/prayer-and-worship/daily-pooja", "bhuj", "નિત્ય પૂજા", kind="media"),
       N("Mantra lekhan", BHUJ + "/prayer-and-worship/mantra-lekhan", "bhuj", "મંત્રલેખન", kind="media"),
       N("SoundCloud", "https://soundcloud.com/bhujmandir", "bhuj", kind="media"),
       N("Facebook", "https://www.facebook.com/bhujmandir", "bhuj", kind="media"),
       N("Instagram", "https://www.instagram.com/bhujmandir", "bhuj", kind="media"),
     ]),
   ]),

   N("Shree LaxmiNarayan Dev Gadi", VAD + "/", "vad", "શ્રી લક્ષ્મીનારાયણ દેવ ગાદી",
     "Seat at Vadtal. Dakshin Vibhag (southern diocese).", id="lnd", kids=[
     N("Vadtal mandir", BHUJ + "/temples/vadtal-temple", "bhuj", "વડતાલ મંદિર",
       "Lotus-shaped temple with nine domes, built under Brahmanand Swami on land given by Joban Pagi. Shreeji Maharaj installed Shree LaxmiNarayan Dev on Kartik sud 12, VS 1881, with Ranchhodji, Dharmadev, Bhaktimata, Harikrishna Maharaj and RadhaKrishna Dev.", kind="temple"),
     N("Acharya parampara", VAD + "/", "vad", "આચાર્ય પરંપરા", "The acharyas of the LaxmiNarayan Dev Gadi, on the Vadtal Gadi site.", kids=[
       N("Acharya Shri Raghuveerji Maharaj (first)", GP, "bhuj", "આ. શ્રી રઘુવીરજી મહારાજ", "Inaugural acharya, seated by Shreeji Maharaj on 21 November 1825."),
     ]),
     N("Prime temples of the diocese", SIX, "bhuj", "મુખ્ય મંદિરો", kids=[
       N("Gadhada: Shree Gopinathji", SIX, "bhuj", "ગઢડા",
         "Shreeji Maharaj lived at Dada Khachar's darbar for about 25 years. He installed Gopinathji and Radhikaji on Aso sud 12, VS 1885 (9 October 1828); Narayanji Suthar carved the murti to his own measure.", kind="temple"),
       N("Junagadh: Shree RadhaRaman Dev", SIX, "bhuj", "જૂનાગઢ",
         "Built by Brahmanand Swami on land from Jinabhai Darbar of Panchala; installed Vaishakh sud 2, VS 1884 (1 May 1828).", kind="temple"),
       N("Dholera: Shree MadanMohan Dev", SIX, "bhuj", "ધોલેરા",
         "Built by Nishkulanand Swami and Adbhutanand Swami at the request of Punjaji Darbar; installed Vaishakh vad 13, VS 1882 (19 May 1826).", kind="temple"),
       bt("gadhada-temple", "Gadhada temple page", "ગઢડા મંદિર"),
       bt("junagadh-temple", "Junagadh temple page", "જૂનાગઢ મંદિર"),
       bt("dholera-temple", "Dholera temple page", "ધોલેરા મંદિર"),
     ]),
     N("Vadtal online", VAD + "/", "vad", "વડતાલ ઓનલાઈન", kind="media", kids=[
       N("Vadtal Gadi website", VAD + "/", "vad", kind="media"),
       N("Vadtal mandir website", "http://www.vadtalmandir.org/", "vadm", "વડતાલ મંદિર", "Listed as the temple's website on the Bhuj temple directory.", kind="media"),
     ]),
   ]),
 ]),

 N("Scriptures", BHUJ + "/scriptures/ebooks", "eb", "શાસ્ત્રો", "Free PDFs from the Bhuj e-book collection, and the readers on this site.", id="shastra", kids=[
   N("Vachanamrut", BHUJ + "/festivals/vachnamrut-jayanti", "bhuj", "વચનામૃત", "Shreeji Maharaj's discourses, compiled by five of his saints.", kind="book", kids=[
     site("Read and search (word index)", "vachanamrut-concordance/", "વાંચો અને શોધો"),
     site("Vachanamrut Nondh by Ashwin Babubhai Shah", "vachanamrut-concordance/index.html#nondh", "વચનામૃત નોંધ"),
     site("Logbook of all 273", "vachanamrut-concordance/timeline.html", "નોંધપોથી"),
     book("Gujarati PDF", "Vachanamrut", "Gujarati"),
     book("English PDF", "Vachanamrut", "English"),
     book("Gutko (pocket edition)", "Vachnamrut Gutko"),
   ]),
   N("Shikshapatri", ebook("Shikshapatri - Gujarati"), "eb", "શિક્ષાપત્રી", "Shreeji Maharaj's code of conduct for all followers.", kind="book", kids=[
     book("Gujarati", "Shikshapatri - Gujarati"),
     book("English", "Shikshapatri", "English"),
     book("Hindi", "Shikshapatri - Hindi"),
     book("Original manuscript (Sanskrit)", "Shikhapatri Mul Handwritten"),
     book("Pictorial Shikshapatri", "Pictorial Shikshapatri"),
     book("Shikshapatri Bhashya (Gujarati)", "Shree Shikshapatri Bhashya"),
     book("Arthadipika bhashya (English)", "Shikshapatri Bhashya - Arthadipika"),
   ]),
   N("Satsangi Jivan", ebook("Satsangi Jivan - Prakran 1", "Gujarati"), "eb", "સત્સંગિજીવન", "Shatanand Muni's Sanskrit life of Shreeji Maharaj, in five prakarans.", kind="book", kids=[
     *[book(f"Prakaran {i} (Gujarati)", f"Satsangi Jivan - Prakran {i}", "Gujarati") for i in range(1, 6)],
     book("English (one volume)", "Satsangi Jivan - English"),
     book("Manuscript, prakaran 1", "Satsangi Jivan Handwritten - Prakran 1"),
   ]),
   book("Bhaktachintamani", "Bhaktachintamani", gu="ભક્તચિંતામણિ", note="Nishkulanand Swami's life of Shreeji Maharaj and his bhakts, in 164 prakarans."),
   N("Nishkulanand Kavya", ebook("Niskulanand Kavya"), "eb", "નિષ્કુળાનંદ કાવ્ય", kind="book", kids=[
     book("Nishkulanand Kavya", "Niskulanand Kavya"),
     book("Purushottam Prakash", "Purushottam Prakash Amrutdhara"),
   ]),
   book("Harigita", "Hari Gita - Gujarati", gu="હરિગીતા"),
   book("Hari Sambhav (manuscript)", "Hari Sambhav - 01", gu="હરિસંભવ"),
   book("Kutch Leela", "Kutch Leela", gu="કચ્છ લીલા"),
   book("Ghanshyam Leelamrut Sagar", "Ghansyham Leela Mrut Sagar (Purvardh)", gu="ઘનશ્યામ લીલામૃત સાગર"),
   book("Parcha Prakaran", "Parcha Prakran", gu="પરચા પ્રકરણ"),
   N("Prayer books", ebook("Nitya Niyam"), "eb", "નિત્ય નિયમ", kind="book", kids=[
     book("Nitya Niyam", "Nitya Niyam", gu="નિત્ય નિયમ"),
     book("Janmangal Namavali", "Janamangal Namavali - Gujarati", gu="જનમંગલ નામાવલી"),
     book("Sarvamangal Namavali", "Sarvamangal Namavali", gu="સર્વમંગલ નામાવલી"),
     book("Kirtan Ratnavali", "Kirtan Ratnavali", "Gujarati", gu="કીર્તન રત્નાવલી"),
     book("Mahapooja", "Mahapooja", gu="મહાપૂજા"),
   ]),
   book("Life and Faith of Lord Swaminarayan", "Life And Faith Of Lord Swaminarayan", note="English life, Shree Swaminarayan Mandir Oldham."),
   N("Kalupur publications", KAL + "/library/publications", "kal", "પ્રકાશનો", kind="book"),
   N("All Bhuj e-books (195)", BHUJ + "/scriptures/ebooks", "eb", "બધાં ઈ-પુસ્તકો", kind="book"),
   site("E-books on this site, by subject", "vachanamrut-concordance/ebooks.html", "ઈ-પુસ્તકો"),
 ]),

 N("Saints", KAL + "/our-sampraday/holy-saints", "kal", "સંતો", "The paramhansas of Shreeji Maharaj's time.", id="santo", kids=[
   N("Nand santos", BHUJ + "/our-faith/about-swaminarayan-bhagwan/nand-santos", "bhuj", "નંદ સંતો", kind="saint", kids=[
     santo("muktanand-swami", "Muktanand Swami", "મુક્તાનંદ સ્વામી"),
     santo("gopalanand-swami", "Gopalanand Swami", "ગોપાળાનંદ સ્વામી"),
     santo("brahmanand-swami", "Brahmanand Swami", "બ્રહ્માનંદ સ્વામી"),
     santo("premanand-swami", "Premanand Swami", "પ્રેમાનંદ સ્વામી"),
     santo("nishkulanand-swami", "Nishkulanand Swami", "નિષ્કુળાનંદ સ્વામી"),
     santo("devanand-swami", "Devanand Swami", "દેવાનંદ સ્વામી"),
     santo("nityanand-swami", "Nityanand Swami", "નિત્યાનંદ સ્વામી"),
     santo("shukanand-swami", "Shukanand Swami", "શુકાનંદ સ્વામી"),
     santo("shatanand-swami", "Shatanand Swami", "શતાનંદ સ્વામી"),
     santo("gunatitanand-swami", "Gunatitanand Swami", "ગુણાતીતાનંદ સ્વામી"),
     santo("bhumanand-swami", "Bhumanand Swami", "ભૂમાનંદ સ્વામી"),
     santo("vasudevanand-brahmchari", "Vasudevanand Brahmachari", "વાસુદેવાનંદ બ્રહ્મચારી"),
   ]),
   N("Holy saints (Kalupur)", KAL + "/our-sampraday/holy-saints", "kal", "સંતો", kind="saint"),
   N("Bhuj saints today", BHUJ + "/about/our-saints", "bhuj", "ભુજના સંતો", kind="saint"),
   N("Female satsang", KAL + "/library/female-satsang", "kal", "બહેનોનો સત્સંગ"),
 ]),

 N("Festivals", BHUJ + "/learning-resources/festivals", "bhuj", "ઉત્સવો", id="utsav", kids=[
   fest("ram-navmi-swaminarayan-jayanti", "Ram Navmi and Swaminarayan Jayanti", "રામનવમી, સ્વામિનારાયણ જયંતી"),
   fest("narnarayan-dev-jayanti", "NarNarayan Dev Jayanti", "નરનારાયણ દેવ જયંતી"),
   fest("vachnamrut-jayanti", "Vachanamrut Jayanti", "વચનામૃત જયંતી"),
   fest("vasant-panchmi", "Vasant Panchami", "વસંત પંચમી"),
   fest("ekadashi", "Ekadashi", "એકાદશી"),
   fest("guru-purnima", "Guru Purnima", "ગુરુ પૂર્ણિમા"),
   fest("hindola", "Hindola", "હિંડોળા"),
   fest("diwali", "Diwali", "દિવાળી"),
   fest("annakut", "Annakut", "અન્નકૂટ"),
   fest("sharad-poonam", "Sharad Poonam", "શરદ પૂનમ"),
   fest("holi", "Holi and Fuldol", "હોળી"),
   fest("rath-yatra", "Rath Yatra", "રથયાત્રા"),
   fest("tulsi-vivah", "Tulsi Vivah", "તુલસી વિવાહ"),
   fest("chaturmaas", "Chaturmas", "ચાતુર્માસ"),
   fest("dhanurmas", "Dhanurmas", "ધનુર્માસ"),
   fest("saak-utsav", "Saak Utsav", "શાકોત્સવ"),
   N("Kalupur festivals library", KAL + "/library/festivals", "kal", "ઉત્સવ પુસ્તકાલય", kind="fest"),
   N("Ekadashi (Kalupur)", KAL + "/library/ekadashi", "kal", "એકાદશી", kind="fest"),
   site("Panchang on this site", "panchang.html", "પંચાંગ"),
 ]),

 N("On this site", "./", "site", "આ સાઇટ પર", "Pages of this site built from the sources above.", kind="site", id="here", kids=[
   site("Today: panchang and history", "./", "આજ"),
   site("Kaal Patrak calendar", "kaal-patrak/", "કાળ પત્રક"),
   site("Vicharan map", "vicharan/", "વિચરણ"),
   site("Vachanamrut reader", "vachanamrut-concordance/", "વચનામૃત"),
   site("Logbook", "vachanamrut-concordance/timeline.html", "નોંધપોથી"),
   N("Library", "vachanamrut-concordance/library.html", "site", "પુસ્તકાલય", "Books hosted on this site.", kind="site", kids=[
     site("Shrimad Bhagwat Mahapuran (Jetalpurdham)", "vachanamrut-concordance/books/shrimad-bhagwat-mahapuran.pdf", "શ્રીમદ્ ભાગવત"),
     site("Ashtako ane Kirtano", "vachanamrut-concordance/books/ashtako-ane-kirtano.pdf", "અષ્ટકો અને કીર્તનો"),
     site("Nimit Matra 1–4", "vachanamrut-concordance/library.html", "નિમિત્ત માત્ર"),
     site("Amrutvarsha 1–2", "vachanamrut-concordance/library.html", "અમૃતવર્ષા"),
     site("Satsang Prabha 1–4", "vachanamrut-concordance/library.html", "સત્સંગ પ્રભા"),
   ]),
   site("E-books by subject", "vachanamrut-concordance/ebooks.html", "ઈ-પુસ્તકો"),
   site("Live updates from Kalupur", "vachanamrut-concordance/live.html", "જીવંત"),
   site("Panchang", "panchang.html", "પંચાંગ"),
   site("Murti 3D", "murti-3d/", "મૂર્તિ 3D"),
   site("Shangaar", "shangaar.html", "શણગાર"),
 ]),
])

# ids, counts, checks
cnt = {"n": 0}
def walk(n, path):
    cnt["n"] += 1
    n.setdefault("id", path)
    assert n["src"] in SRC, n
    assert n["url"], n
    for i, k in enumerate(n.get("kids", [])):
        walk(k, f"{n['id']}.{i}")
walk(tree, "root")
out = {"built": "tools/mindmap_build.py", "sources": {k: {"t": t, "u": u} for k, (t, u) in SRC.items()}, "tree": tree}
p = ROOT / "data/mindmap/tree.json"
p.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(cnt["n"], "nodes →", p.relative_to(ROOT))
