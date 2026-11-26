"""Every book the site cites, in one list.

Used by tools/books/build.py to write
  * site/books.js            the shared linker: turns each book name on any page
                              into a link to its card in the Satsang Library
  * vachanamrut-concordance/data/books.json      the extra library cards
  * vachanamrut-concordance/data/book-refs.json  per book: where the site cites it

Fields
  id     anchor in the library (library.html#b-<id>)
  shelf  'library' = card already in library.html; 'sampradaya' / 'texts' = new card
  re     JavaScript regex source for the names that should link here
  read   [label, url] links for the new cards
"""

BOOKS = [
 # ---- already on the library shelves ----
 dict(id='vachanamrut', shelf='library', en='Vachanamrut', gu='વચનામૃત',
      re=r'Vachanamrut(?!\s+(?:Nondh|Concordance))|Vachnamrut|વચનામૃત(?!\s*નોંધ)'),
 dict(id='vachanamrut-nondh', shelf='library', en='Vachanamrut Nondh', gu='વચનામૃત નોંધ',
      re=r'Vachanamrut Nondh|વચનામૃત નોંધ'),
 dict(id='shrimad-bhagwat-mahapuran', shelf='library', en='Shrimad Bhagwat Mahapuran', gu='શ્રીમદ્ ભાગવત મહાપુરાણ',
      re=r'(?:Shrimad |Shreemad |Śrīmad )?Bh[aā]g[aā]?[wv]a?t(?:a)?(?: Mah[aā]pur[aā]n[aā]?| Pur[aā]ṇ?a)?(?! Shah)(?!\w)|(?:શ્રીમદ્\s?)?ભાગવત(?![ા-્])'),
 dict(id='ashtako-ane-kirtano', shelf='library', en='Ashtako ane Kirtano', gu='અષ્ટકો અને કીર્તનો',
      re=r'Ashtako ane Kirtano|અષ્ટકો અને કીર્તનો'),
 dict(id='nimit-matra', shelf='library', en='Nimit Matra', gu='નિમિત્ત માત્ર',
      re=r'Nimit Matra(?: \d)?|નિમિત્ત માત્ર(?:\s?[–-]?\s?[૧૨૩૪])?', parts=['nimit-matra-1','nimit-matra-2','nimit-matra-3','nimit-matra-4']),
 dict(id='amrutvarsha', shelf='library', en='Amrutvarsha', gu='અમૃતવર્ષા',
      re=r'Amrutvarsha(?: \d)?|અમૃતવર્ષા', parts=['amrutvarsha-1','amrutvarsha-2']),
 dict(id='satsang-prabha', shelf='library', en='Satsang Prabha', gu='સત્સંગ પ્રભા',
      re=r'Satsang Prabha(?: \d)?|સત્સંગ પ્રભા', parts=['satsang-prabha-1','satsang-prabha-2','satsang-prabha-3','satsang-prabha-4']),
 dict(id='smruti-ank-satsang-pradeep', shelf='library', en='Smruti Ank · Satsang Pradeep', gu='સ્મૃતિ અંક · સત્સંગ પ્રદીપ',
      re=r'Smruti Ank|Satsang Pradeep|સ્મૃતિ અંક|સત્સંગ પ્રદીપ'),

 # ---- granths of the sampradaya the site draws on ----
 dict(id='shri-swaminarayanam', shelf='sampradaya', en='Shri Swaminarayanam', gu='શ્રી સ્વામિનારાયણમ્',
      by='Ed. Shastri Swami Nirgundasji', pub='Shri Sahajanand Gurukul, Asarva, Ahmedabad', year='2015 (8 March)',
      desc='A day-by-day account of Shri Hari\'s life, 1781–1830, with the tithi of every day. It is the backbone of Kaal Patrak, the Vicharan map and Today in history; inside 1781–1830 its dates win on this site.',
      note='Print book, copyright Shri Sahajanand Gurukul. Not online; read its day entries in Kaal Patrak.',
      read=[['Day by day in Kaal Patrak', '../kaal-patrak/'], ['Page scans on the Vicharan map', '../vicharan/']],
      re=r'Shri Swaminarayanam|Shree Swaminarayanam|શ્રી સ્વામિનારાયણમ્'),
 dict(id='bhaktachintamani', shelf='sampradaya', en='Bhaktachintamani', gu='ભક્તચિંતામણિ',
      by='Sadguru Nishkulanand Swami', pub='Shree NarNarayan Dev, Bhuj (V.S. 2068 edition)', year='Completed V.S. 1887 (1830)',
      desc='Nishkulanand Swami\'s life of Shri Hari in 164 prakarans, finished in Gadhada in 1830. The site checked its dates (it counts the year from Ashadh) and added its events to Kaal Patrak and the Dinacharya.',
      read=[['Read (Bhuj e-book, PDF)', 'https://www.swaminarayan.faith/media/3902/bhakta-chintamni.pdf']],
      re=r'Bhakta ?[Cc]hintamani|Bhaktachintamni|ભક્તચિંતામણિ|ભક્તચિંતામણી'),
 dict(id='shikshapatri', shelf='sampradaya', en='Shikshapatri', gu='શિક્ષાપત્રી',
      by='Bhagwan Shri Swaminarayan', pub='Read: Shree Swaminarayan Temple, Bhuj', year='Maha sud 5, V.S. 1882 (12 Feb 1826)',
      desc='212 Sanskrit verses of conduct, written by Shri Hari himself at Vadtal on Vasant Panchami.',
      read=[['Gujarati (PDF)', 'https://www.swaminarayan.faith/media/3754/shikshapatri-gujarati.pdf'], ['English (PDF)', 'https://www.swaminarayan.faith/media/3751/shikshapatri-english.pdf']],
      re=r'Shikshapatri(?! Bhashya)|શિક્ષાપત્રી(?!\s*ભાષ્ય)'),
 dict(id='satsangi-jivan', shelf='sampradaya', en='Satsangi Jivan', gu='સત્સંગિજીવન',
      by='Shatanand Muni', pub='Read: Shree Swaminarayan Temple, Bhuj', year='Written V.S. 1885–86 (1829–30)',
      desc='Shatanand Muni\'s Sanskrit life of Shri Hari in five prakarans, written with his approval at Gadhada.',
      read=[['Gujarati, prakaran 1 (PDF)', 'https://www.swaminarayan.faith/media/3716/satsangi-jivan-1.pdf'], ['English (PDF)', 'https://www.swaminarayan.faith/media/3723/satsangi-jivan-english.pdf']],
      re=r'Satsangi ?[Jj]ivan|Satsangijivan|સત્સંગિજીવન|સત્સંગીજીવન'),
 dict(id='harililamrut', shelf='sampradaya', en='Shri Harililamrut', gu='શ્રી હરિલીલામૃત',
      by='Acharya Shri Viharilalji Maharaj', pub='', year='',
      desc='A verse life of Shri Hari, cited on this site as one of the "traditional accounts".',
      read=[], re=r'Harililamrut|Harilila ?[Aa]mrut|હરિલીલામૃત'),
 dict(id='desh-vibhag-lekh', shelf='sampradaya', en='Desh Vibhag no Lekh', gu='દેશવિભાગનો લેખ',
      by='Bhagwan Shri Swaminarayan (dictated to Shuk Muni)', pub='', year='Magshar sud 15, V.S. 1883 (14 Dec 1826)',
      desc='The document that divides the sampradaya into the NarNarayan Dev (Ahmedabad) and LaxmiNarayan Dev (Vadtal) dioceses under the two Acharyas.',
      read=[], re=r'Desh ?Vibhag(?: no)? Lekh|દેશવિભાગ(?:નો)? લેખ'),
 dict(id='kutch-lila', shelf='sampradaya', en='Kutch Lila', gu='કચ્છ લીલા',
      by='', pub='Shree Swaminarayan Temple, Bhuj', year='',
      desc='Shri Hari\'s leela in Kutch.', read=[['Read (Bhuj e-book, PDF)', 'https://www.swaminarayan.faith/media/3639/kutch-lila.pdf']],
      re=r'Kutch Leela|Kutch Lila|કચ્છ લીલા'),
 dict(id='life-and-faith', shelf='sampradaya', en='Life and Faith of Lord Swaminarayan', gu='',
      by='', pub='Shree Swaminarayan Temple, Bhuj', year='2002',
      desc='English life of Shri Hari and history of the sampradaya.',
      read=[['Read (Bhuj e-book, PDF)', 'https://www.swaminarayan.faith/media/3641/life-faith-of-lord-swaminarayan.pdf']],
      re=r'Life (?:and|&) Faith of Lord Swaminarayan'),
 dict(id='social-reformer', shelf='sampradaya', en='Social Reformer Lord Shree Swaminarayan', gu='',
      by='Dr. Swami Satyaprasaddasji; tr. Ashish Raval', pub='Shree NarNarayan Dev Sahitya Series no. 42, Bhuj', year='2010',
      desc='A short English life whose dates were cross-checked against Shri Swaminarayanam for the Dinacharya.',
      note='Uploaded copy only; no public link.', read=[], re=r'Social Reformer Lord Shree Swaminarayan|Social Reformer booklet'),
 dict(id='vasudev-mahatmya', shelf='sampradaya', en='Vasudev Mahatmya', gu='વાસુદેવ માહાત્મ્ય',
      by='Part of the Skanda Purana', pub='', year='',
      desc='Cited by the Vachanamrut and the Shikshapatri; Dinanath Bhatt wrote the Vaishnav-Vallabha commentary on it in V.S. 1886.',
      read=[], re=r'V[aā]sudeva? M[aā]h[aā]tmya|વાસુદેવ ?માહાત્મ્ય'),

 # ---- other texts the site quotes ----
 dict(id='bhagavad-gita', shelf='texts', en='Bhagavad Gita', gu='ભગવદ્ ગીતા',
      by='Ved Vyas (Mahabharata, Bhishma Parva)', pub='', year='',
      read=[['Gujarati (Bhuj, PDF)', 'https://www.swaminarayan.faith/media/3796/shree-mad-bhagwad-gita.pdf']],
      re=r'Bhagavad[ -]G[iī]t[aā]|Bhagwad Gita|ભગવદ્\s?ગીતા'),
 dict(id='rigveda', shelf='texts', en='Rigveda', gu='ઋગ્વેદ', by='', pub='', year='',
      desc='All 10,552 mantras are on the Vedas page.', read=[['Read on the Vedas page', '../vedas.html'], ['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Rigveda']],
      re=r'Rig[- ]?[Vv]eda|RigVeda|ઋગ્વેદ|ऋग्वेद'),
 dict(id='samaveda', shelf='texts', en='Samaveda', gu='સામવેદ', read=[['On the Vedas page', '../vedas.html#samaveda']], re=r'Samaveda|સામવેદ|सामवेद'),
 dict(id='yajurveda', shelf='texts', en='Yajurveda (Vajasaneyi Samhita)', gu='યજુર્વેદ', read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Yajurveda']], re=r'Yajurveda|Vajasaneyi Samhita|યજુર્વેદ|यजुर्वेद'),
 dict(id='atharvaveda', shelf='texts', en='Atharvaveda', gu='અથર્વવેદ', read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Atharvaveda']], re=r'Atharvaveda|અથર્વવેદ|अथर्ववेद'),
 dict(id='shatapatha-brahmana', shelf='texts', en='Shatapatha Brahmana', gu='શતપથ બ્રાહ્મણ', read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Shatapatha_Brahmana']], re=r'Shatapatha(?: Brahmana)?|શતપથ'),
 dict(id='vedanga-jyotisha', shelf='texts', en='Vedanga Jyotisha', gu='વેદાંગ જ્યોતિષ', by='Lagadha', read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Vedanga_Jyotisha']], re=r'Vedanga Jyotisha'),
 dict(id='surya-siddhanta', shelf='texts', en='Surya Siddhanta', gu='સૂર્ય સિદ્ધાંત', by='', year='c. 400–500 CE',
      read=[['Burgess\'s 1860 English translation (archive.org)', 'https://archive.org/search?query=Surya+Siddhanta+Burgess'], ['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Surya_Siddhanta']],
      re=r'S[uū]rya Siddh[aā]nta|સૂર્ય ?સિદ્ધાંત'),
 dict(id='aryabhatiya', shelf='texts', en='Aryabhatiya', gu='આર્યભટીય', by='Aryabhata', year='499 CE',
      read=[['Clark\'s 1930 translation (archive.org)', 'https://archive.org/search?query=Aryabhatiya+Clark'], ['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Aryabhatiya']],
      re=r'[AĀ]ryabhat[iī]ya'),
 dict(id='siddhanta-shiromani', shelf='texts', en='Siddhanta Shiromani', by='Bhaskaracharya', year='1150 CE',
      read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Siddh%C4%81nta_Shiroma%E1%B9%87i']], re=r'Siddhanta Shiromani'),
 dict(id='brihat-samhita', shelf='texts', en='Brihat Samhita', by='Varahamihira', read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Brihat_Samhita']], re=r'Brihat Samhita'),
 dict(id='brihat-parashara-hora-shastra', shelf='texts', en='Brihat Parashara Hora Shastra', read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Brihat_Parashara_Hora_Shastra']], re=r'Brihat Parashara Hora Shastra'),
 dict(id='vishnu-purana', shelf='texts', en='Vishnu Purana', gu='વિષ્ણુ પુરાણ', read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Vishnu_Purana']], re=r'Vishnu Purana|વિષ્ણુ ?પુરાણ'),
 dict(id='nirukta', shelf='texts', en='Nirukta', by='Yaska', read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Nirukta']], re=r'Nirukta'),
 dict(id='chandahshastra', shelf='texts', en='Chandahshastra', by='Pingala', read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Pingala']], re=r'Chandah[sś]h?[aā]stra'),
 dict(id='shulba-sutras', shelf='texts', en='Shulba Sutras', read=[['About (Wikipedia)', 'https://en.wikipedia.org/wiki/Shulba_Sutras']], re=r'S[hu]ulba ?[Ss]utras|Sulbasutras'),
]
