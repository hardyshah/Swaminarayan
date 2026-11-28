#!/usr/bin/env python3
"""Rangdock3 colour themes, all from one OKLCH formula.

Each theme is a neutral hue (nh) and chroma (nc) for paper/card/lines, an accent hue (ah) and a secondary hue (sh).
Lightness is fixed per role and then nudged until the WCAG contrast targets are met:
  ink, muted text and links >= 4.5:1 on both paper and card; white text on the accent >= 4.5:1 (light mode).
Run:  python3 tools/rd3/palettes.py            -> prints the JS object pasted into vachanamrut-concordance/theme.js (RD3)
      python3 tools/rd3/palettes.py --report   -> contrast table
"""
import json, math, sys

def oklch_to_srgb(L, C, h):
    a, b = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return r, g, bb

def in_gamut(rgb): return all(-1e-4 <= c <= 1 + 1e-4 for c in rgb)

def to_hex(L, C, h):
    # reduce chroma until the colour fits sRGB (keeps hue and lightness)
    while C > 0 and not in_gamut(oklch_to_srgb(L, C, h)): C -= 0.002
    rgb = oklch_to_srgb(L, max(C, 0), h)
    def enc(c):
        c = min(max(c, 0), 1)
        c = 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
        return round(c * 255)
    return "#%02X%02X%02X" % tuple(enc(c) for c in rgb)

def lum(hx):
    v = [int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    v = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in v]
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]

def cr(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

def fit(L, C, h, against, target, step):
    """move lightness by step until the colour reaches target contrast against every colour in `against`"""
    for _ in range(80):
        hx = to_hex(L, C, h)
        if all(cr(hx, x) >= target for x in against): return hx
        L += step
    return to_hex(L, C, h)

def theme(nh, nc, ah, ac, sh, sc, dark_first=False):
    o = {}
    bg = to_hex(.972, nc, nh); card = to_hex(.995, nc * .3, nh)
    acc = fit(.56, ac, ah, [bg, card, "#FFFFFF"], 4.6, -.01)
    L = dict(bg=bg, card=card,
             ink=fit(.24, .025, nh, [bg, card], 12, -.01),
             muted=fit(.52, .035, nh, [bg, card], 4.8, -.01),
             line=to_hex(.905, nc * 1.4, nh),
             acc=acc, accS=to_hex(.94, ac * .28, ah),
             acc2=fit(.48, sc, sh, [bg, card], 5, -.01), acc2S=to_hex(.94, sc * .25, sh),
             c1=to_hex(.95, .035, ah), c2=to_hex(.955, .03, (ah + 40) % 360), c3=to_hex(.965, .05, 90), c4=to_hex(.955, .03, sh),
             warn=fit(.42, ac * .9, ah, [bg, card], 7, -.01), warnS=to_hex(.94, .045, ah))
    dbg = to_hex(.17, min(nc * 1.6, .02), nh); dcard = to_hex(.215, min(nc * 1.6, .022), nh)
    D = dict(bg=dbg, card=dcard,
             ink=fit(.93, .02, nh, [dbg, dcard], 12, .005),
             muted=fit(.75, .03, nh, [dbg, dcard], 5, .01),
             line=to_hex(.33, .025, nh),
             acc=fit(.76, ac * .85, ah, [dbg, dcard], 6, .01), accS=to_hex(.29, ac * .35, ah),
             acc2=fit(.8, sc * .7, sh, [dbg, dcard], 6, .01), acc2S=to_hex(.29, sc * .3, sh),
             c1=to_hex(.25, .03, ah), c2=to_hex(.24, .025, (ah + 40) % 360), c3=to_hex(.26, .035, 90), c4=to_hex(.24, .025, sh),
             warn=fit(.8, ac * .7, ah, [dbg, dcard], 7, .01), warnS=to_hex(.27, .05, ah))
    if dark_first:  # a dark theme: its "light" face is the dark one too
        return {"l": D, "d": D, "dark": True}
    return {"l": L, "d": D}

# The house theme keeps the exact Rangdock3 tokens (see the rangdock3 skill); the rest come from the formula.
RANGDOCK3 = {"l": dict(bg="#FAF6EF", card="#FFFFFF", ink="#22180F", muted="#6E6050", line="#EADFCF", acc="#C2410C", accS="#FDEBDD",
                       acc2="#3730A3", acc2S="#E7E6FA", c1="#FBF0E3", c2="#F6EEE6", c3="#FFF6DE", c4="#EEEDFA", warn="#7C2D12", warnS="#FFEDD5"),
             "d": dict(bg="#15100C", card="#1F1813", ink="#F4EADC", muted="#B5A38E", line="#3A2E24", acc="#FB923C", accS="#3B2414",
                       acc2="#A5B4FC", acc2S="#24264A", c1="#2A2118", c2="#261F1A", c3="#2D2615", c4="#22223A", warn="#FDBA74", warnS="#3A2418")}

THEMES = [
    ("rangdock3", "Rangdock3", "રંગડોક", RANGDOCK3),
    ("sandhya", "Sandhya aarti", "સંધ્યા આરતી", theme(40, .012, 28, .19, 305, .16)),
    ("yamuna", "Yamuna", "યમુના", theme(215, .01, 200, .12, 55, .16)),
    ("kamal", "Kamal lotus", "કમળ", theme(350, .012, 355, .17, 150, .12)),
    ("mor", "Mor peacock", "મોર", theme(240, .01, 255, .16, 85, .14)),
    ("akshar", "Akshar white", "અક્ષર", theme(60, .003, 38, .19, 270, .14)),
    ("aarti-gold", "Aarti gold night", "આરતી સુવર્ણ", theme(60, .012, 80, .15, 30, .16, dark_first=True)),
    ("chandrika", "Chandrika moonlight", "ચંદ્રિકા", theme(265, .02, 85, .14, 250, .12, dark_first=True)),
]

if __name__ == "__main__":
    if "--report" in sys.argv:
        for k, en, gu, t in THEMES:
            for face in ("l", "d"):
                p = t[face]
                print(f"{k:12} {face} ink {cr(p['ink'],p['bg']):5.1f}  muted {cr(p['muted'],p['bg']):4.1f}/{cr(p['muted'],p['card']):4.1f}  "
                      f"acc {cr(p['acc'],p['bg']):4.1f}  white-on-acc {cr('#FFFFFF',p['acc']):4.1f}  acc2 {cr(p['acc2'],p['bg']):4.1f}  {p['bg']} {p['acc']} {p['acc2']}")
        sys.exit()
    out = {}
    for k, en, gu, t in THEMES:
        e = {"en": en, "gu": gu, "grp": "rd3", "l": t["l"], "d": t["d"]}
        if t.get("dark"): e["dark"] = True
        out[k] = e
    print(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
