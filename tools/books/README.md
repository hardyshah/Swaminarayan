# Books across the site

* `registry.py` lists every book the site cites, with the names that should link to it.
* `build.py` writes `site/books.js` (loaded by `site/sp.js` on every page: each book name becomes a link to its card in the Satsang Library), the new library cards (`vachanamrut-concordance/data/books.json`) and the "Cited on this site" index (`vachanamrut-concordance/data/book-refs.json`).
* `crosscheck.py` holds the cross-check of the library PDFs against Shri Swaminarayanam and Kaal Patrak, writes `vachanamrut-concordance/data/book-crosscheck.json` and applies the agreed changes to `kaal-patrak/index.html` (safe to re-run).
* `facts.py` is the list of dated passages found in the books, used while comparing.

Order after any change: `python3 tools/books/crosscheck.py`, then `python3 tools/books/build.py`.
Re-run `build.py` after adding a page or rebuilding Kaal Patrak, so the index stays current.

The library PDFs use legacy Gujarati fonts. Unicode text of the readable ones was made with
`directory/build/lmg.py` (Satsang Prabha, Bhagwat) and a variant mapping (Nimit Matra 3–4, Amrutvarsha,
Ashtako ane Kirtano); Nimit Matra 1–2 and the Smruti Ank are image scans.
