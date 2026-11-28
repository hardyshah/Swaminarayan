# Kirtans with audio (per-book PDF index)

One PDF per kirtan book on the e-books page, in `vachanamrut-concordance/books/kirtan-audio/`.
Each PDF lists every kirtan in the book in page order with: the Gujarati and romanised first line,
the poet, a link to its page in the book PDF, and up to three YouTube recordings captioned with the
singer, the playlist (when the video is in one) and the channel. A Sources page cites the book and
every channel used.

Rebuild:

```
# fonts (Noto Sans Gujarati / Latin / Devanagari) into tools/kirtan/fonts/ or point KIRTAN_FONTS at them
python3 tools/kirtan/build.py /tmp/kirtan-build
node tools/kirtan/render.js /tmp/kirtan-build vachanamrut-concordance/books/kirtan-audio
```

Data in `data/`:

- `books-kirtans.json`: kirtan titles read from each book PDF (legacy Gujarati fonts converted to Unicode).
- `search-titles.txt` (one level up): the 1,048 unique first lines that were searched on YouTube.
- `picks.txt`, `channels.txt`, `playlists.txt`, `singers.txt`: the chosen recordings (up to 3 per kirtan),
  matched word by word against the first line, preferring sampraday channels.
- `desc-singers-raw.txt`: singer names read from the "Singer:" line of video descriptions, used when
  the title names no singer.

Sources left out: BAPS, Maninagar and other groups, and non-Swaminarayan bhajans (see `EXCL_*` in build.py).
