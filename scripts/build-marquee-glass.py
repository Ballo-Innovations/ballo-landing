"""Rebuild real alpha for the pre-rendered glass band and trim it to the type.

`public/Assets/glass-marque-text.png` is the hero band's line set in glass, but
it is an RGB export with its transparency faked as a light checkerboard --
there is no alpha channel to composite with, and laid over the navy hero as-is
it would arrive as a white rectangle.

The checkerboard is two greys about 4% apart (244 and 254) on a ~22px grid.
That difference is small enough to treat as one flat background rather than
detecting the grid's phase: the residual shows up as a couple of percent of
alpha in the glow, which is invisible under a band that paints at well under
half opacity. Modelling the grid would buy nothing and can be wrong about the
phase, which would be worse than being uniformly a little off.

Coverage cannot come from darkness alone. The letters carry near-white
speculars, and a white highlight on a white background is invisible to any
"how much darker is this than the page" test -- keying on darkness punched the
highlights straight out of the glyphs and what came back was flat blue type
with no glass in it. So coverage is the greater of two signals, how dark the
pixel is and how coloured it is, and then the glyph interiors are closed: a
hole small enough to be a highlight, surrounded by ink, is ink.

Inside that closed body the pixel is kept exactly as rendered, speculars and
all. Only the soft glow outside it is un-mixed (P = a*C + (1-a)*BG, solved for
C), which keeps the halo as real partial alpha rather than a hard edge.

Usage: python3 scripts/build-marquee-glass.py
"""
from PIL import Image, ImageFilter

SRC = "public/Assets/glass-marque-text.png"
OUT = "public/Assets/marquee-glass-text.png"
BG = 249 / 255  # midpoint of the checkerboard's two greys
# Below this the pixel is background, not glow.
#
# Well above the checkerboard residual, and deliberately: the render has a soft
# horizontal glare across the middle of the line, which is invisible on the
# white it was exported against and arrives as a pale strip running through and
# between the letters once the background is navy. It is all low-alpha, so a
# floor removes it and costs only the outermost edge of the halo.
FLOOR = 0.16
BODY = 0.22  # coverage at or above this counts as the glyph itself
# The gate that removes the render's horizontal glare.
#
# It carries a soft light bar across the whole line -- invisible on the white it
# was exported against, a pale strip through and between the letters once the
# background is navy. Alpha cannot separate it: it is as strong as the halo it
# sits in. It is neutral and bright, where everything belonging to the glass is
# either coloured or dark, so a pixel that is neither is background.
#
# Applied before the body mask, not after. Gating only the halo left the bar
# bridging one letter to the next, and the hole-closing then swallowed the
# bridge and made it part of the glyphs.
MIN_CHROMA = 0.34
MIN_DARK = 0.35
CLOSE = 9  # hole-closing radius, in px: bigger than any specular, smaller than a counter
# The crop keeps a margin of half the letter height on every side, so the
# letters are a known fraction of the file (see LETTER_FRACTION in
# GlassBandMarquee.tsx) and the component can size the line by the type rather
# than by the canvas. Trimming to the glow's own bounds instead left the
# letters at a seventh of the image height, which made every size in the
# caller a magic number.
MARGIN = 0.5

src = Image.open(SRC).convert("RGB")
w, h = src.size
sp = src.load()

# Coverage: darkness or chroma, whichever says more. Chroma is what finds the
# blue that is lighter than the page; darkness is what finds the shadowed edges.
cover = Image.new("L", (w, h))
cp = cover.load()
for y in range(h):
    for x in range(w):
        r, g, b = (v / 255 for v in sp[x, y])
        hi, lo = max(r, g, b), min(r, g, b)
        chroma = (hi - lo) / hi if hi else 0
        dark = 1 - lo / BG
        cp[x, y] = 0 if (chroma < MIN_CHROMA and dark < MIN_DARK) else round(
            255 * min(1.0, max(dark, chroma))
        )

# Close the glyph bodies so the speculars inside them stop reading as holes.
body = cover.point(lambda v: 255 if v >= BODY * 255 else 0)
body = body.filter(ImageFilter.MaxFilter(CLOSE)).filter(ImageFilter.MinFilter(CLOSE))

out = Image.new("RGBA", (w, h))
op, bp = out.load(), body.load()
for y in range(h):
    for x in range(w):
        a = cp[x, y] / 255
        if bp[x, y]:
            # Inside the letter: keep the render exactly as it is.
            op[x, y] = (*sp[x, y], 255)
        elif a > FLOOR:
            # Outside it: the halo, un-mixed off the background it was baked on.
            r, g, b = (v / 255 for v in sp[x, y])
            c = tuple(
                min(255, max(0, round(((v - (1 - a) * BG) / a) * 255))) for v in (r, g, b)
            )
            op[x, y] = (*c, round(a * 255))
        else:
            op[x, y] = (0, 0, 0, 0)

# The letters themselves, ignoring the halo: the rows and columns the closed
# body covers.
bx = body.getbbox()
if bx:
    l, t, r2, b2 = bx
    m = round((b2 - t) * MARGIN)
    out = out.crop((max(0, l - m), max(0, t - m), min(w, r2 + m), min(h, b2 + m)))
out.save(OUT)
lw, lh = out.size
print(f"{OUT}  {lw}x{lh}  letters {(b2 - t) / lh:.3f} of height")
