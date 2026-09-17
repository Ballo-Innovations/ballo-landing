"""Cut the nav glass pill out of the source render, darken it, and pull its
blues onto the header's own palette.

`public/Assets/nav-bg-3.png` does carry alpha, but its cutout is ragged: a
noisy halo of semi-transparent grey fringing surrounds the pill and would be
visible over the hero. So its alpha channel is discarded and rebuilt here --
crop to the pill (2077x222 at a 111px cap radius) and lay down a clean
rounded-rect mask, inset 2px to clear the fringe that hugs the silhouette.
Then recolour the result.

Two passes, in order:

1. Tone. Darkening is gamma-based rather than a flat multiply: gamma pulls the
   midtones down hard while leaving the near-white rim and specular highlights
   almost untouched, which is what keeps the pill reading as glass instead of a
   flat navy slab. A CSS filter would not work here, because the image is
   painted via border-image and a filter on the element would darken the nav
   text too.

2. Colour. The render's own blue is a cooler, more electric cyan-blue than the
   header's --glass-nav-sheen (#2765c0 / #0f2873 / #628ce1). Its *hue* is
   already close (~214 vs 216-225); what differs is that the render runs its
   highlights toward cyan while the sheen stays indigo. So this maps luminance
   through a ramp built from the sheen's own stops, rather than rotating hue --
   a hue rotation would move the whole image including the neutral speculars.
   RAMP's top stop is white so those speculars survive the map, and the result
   is blended back over the toned original at BLEND rather than replacing it,
   which keeps the warm chromatic fringes in the end caps. At BLEND = 1.0 the
   pill is exactly on-palette but those fringes are gone and it reads flatter.

Usage: python3 scripts/build-nav-glass.py
"""
from PIL import Image, ImageDraw

SRC = "public/Assets/nav-bg-3.png"
OUT = "public/Assets/nav-glass-pill.png"
BOX = (49, 264, 2126, 486)  # pill bounds in the source render (2077x222)
GAMMA, GAIN = 1.8, 0.9
BLEND = 0.85  # how far toward RAMP; see the note on chromatic fringes above
SS = 4  # mask supersampling, for a clean antialiased cap edge

# Stops lifted from --glass-nav-sheen in app/styles/components/header.css, with
# a deeper shadow below them and white on top for the speculars. Keep these in
# sync if that gradient is ever retuned.
RAMP = [
    (0.00, (0x05, 0x0F, 0x28)),
    (0.32, (0x0F, 0x28, 0x73)),
    (0.62, (0x27, 0x65, 0xC0)),
    (0.86, (0x62, 0x8C, 0xE1)),
    (1.00, (0xFF, 0xFF, 0xFF)),
]

src = Image.open(SRC).convert("RGB").crop(BOX)
w, h = src.size

mask = Image.new("L", (w * SS, h * SS), 0)
# 1px inset drops the checkerboard fringe at the silhouette edge.
ImageDraw.Draw(mask).rounded_rectangle(
    [2 * SS, 2 * SS, w * SS - 1 - 2 * SS, h * SS - 1 - 2 * SS],
    radius=(h * SS) // 2,
    fill=255,
)
mask = mask.resize((w, h), Image.LANCZOS)

lut = [min(255, round(255 * ((i / 255) ** GAMMA) * GAIN)) for i in range(256)]
toned = src.point(lut * 3)


def ramp_at(t):
    for (a, ca), (b, cb) in zip(RAMP, RAMP[1:]):
        if a <= t <= b:
            f = (t - a) / (b - a)
            return tuple(round(ca[k] + (cb[k] - ca[k]) * f) for k in range(3))
    return RAMP[-1][1]


table = [ramp_at(i / 255) for i in range(256)]
lum = toned.convert("L")
mapped = Image.merge(
    "RGB", [lum.point([table[i][k] for i in range(256)]) for k in range(3)]
)

out = Image.blend(toned, mapped, BLEND)
out.putalpha(mask)
out.save(OUT)
print(f"wrote {OUT} {out.size}")
