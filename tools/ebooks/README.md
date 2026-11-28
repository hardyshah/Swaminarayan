# E-books page: books used across the site

`build_site_refs.py` writes `vachanamrut-concordance/data/site-books.json`, which `ebooks.html` loads next to
`data/ebooks.json` (the Bhuj catalogue). It holds:

- the books this site is built from or quotes that are not in the Bhuj catalogue (Satsang Library books,
  Shri Swaminarayanam, Harililamrut, the shastras the Vachanamrut cites, the Vedic and Jyotish texts of the
  science pages), each with publisher and link;
- `cites`: where each book (Bhuj ones too) is used on the site, shown on the book's card;
- `pages`: every page with its sources, shown under "Sources by page". Book links on a page point at the
  book's card; outside links are scanned from the page's HTML.

Run `python3 tools/ebooks/build_site_refs.py` from the repository root after a page gains or loses a source.
Sampraday sources only from the original NarNarayan Dev (Kalupur) and LaxmiNarayan Dev (Vadtal) dioceses;
`NOT_ORIGINAL` in the script keeps other groups' sites out of the index.
