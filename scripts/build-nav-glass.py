"""Cut the header's glass pills out of their source renders, darken them, and
pull their blues onto the header's own palette.

Builds every pill in SOURCES. They are separate renders with different
proportions -- the bar's three islands share one long pill, the sign-in button
uses a stubbier one whose caps are much rounder relative to its height -- but
they get the identical tone and colour treatment, so the header still reads as
one material.

Neither render can be used as shipped:

- `glass-pill.png` is opaque RGB. Its "transparency" checkerboard is baked in
  as real pixels, so using it directly would paint a grey checker around the
  pill.
- `nav-bg-3.png` does carry alpha, but its cutout is ragged: a noisy halo of
  semi-transparent grey fringing surrounds the pill and would show over the
  hero.

Either way the alpha is built here rather than trusted -- crop to the pill and
lay down a clean rounded-rect mask, inset a couple of px to clear whatever
fringe hugs the silhouette.

Then two passes, in order:

1. Tone. Darkening is gamma-based rather than a flat multiply: gamma pulls the
   midtones down hard while leaving the near-white rim and specular highlights
   almost untouched, which is what keeps a pill reading as glass instead of a
   flat navy slab. A CSS filter would not work here, because the image is
   painted via border-image and a filter on the element would darken the nav
   text too.

2. Colour. The renders' own blue is a pale, iridescent periwinkle, far lighter
   than the header's --glass-nav-sheen (#2765c0 / #0f2873 / #628ce1). So this
   maps luminance through a ramp built from the sheen's own stops, rather than
   rotating hue -- a hue rotation would move the whole image including the
   neutral speculars. RAMP's top stop is white so those speculars survive the
   map, and the result is blended back over the toned original at BLEND rather
   than replacing it, which keeps the warm chromatic fringes in the end caps.
   At BLEND = 1.0 a pill is exactly on-palette but those fringes are gone and
   it reads flatter.

The CSS consumes these as 9-slice border-images. It needs each source's height
and cap radius to pick its border-image-slice, and this prints both on every
run -- see the slice note in app/styles/components/header.css, which explains
why the slice must sit ABOVE the midline rather than exactly on it.

Usage: python3 scripts/build-nav-glass.py
"""

from PIL import Image, ImageDraw

# (source, output, crop box). The crop box is the pill's bounds in the source
# render, found by scanning for pixels that are neither grey nor near-white.
SOURCES = [
    # The bar's three islands: logo, centre nav, and (before the sign-in button
    # got its own render) everything else.
    (
        "public/Assets/nav-bg-3.png",
        "public/Assets/nav-glass-pill.png",
        (49, 264, 2126, 486),
    ),
    # Sign-in button: stubbier, with much rounder caps.
    (
        "public/Assets/glass-pill.png",
        "public/Assets/nav-glass-pill-signin.png",
        (246, 380, 1293, 645),
    ),
]

GAMMA, GAIN = 1.8, 0.9
BLEND = 0.85  # how far toward RAMP; see the note on chromatic fringes above
INSET = 2  # px trimmed off the silhouette, to drop the source's edge fringe
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


def ramp_at(t):
    for (a, ca), (b, cb) in zip(RAMP, RAMP[1:]):
        if a <= t <= b:
            f = (t - a) / (b - a)
            return tuple(round(ca[k] + (cb[k] - ca[k]) * f) for k in range(3))
    return RAMP[-1][1]


TABLE = [ramp_at(i / 255) for i in range(256)]
LUT = [min(255, round(255 * ((i / 255) ** GAMMA) * GAIN)) for i in range(256)]


def build(src_path, out_path, box):
    src = Image.open(src_path).convert("RGB").crop(box)
    w, h = src.size

    mask = Image.new("L", (w * SS, h * SS), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [INSET * SS, INSET * SS, w * SS - 1 - INSET * SS, h * SS - 1 - INSET * SS],
        radius=(h * SS) // 2,
        fill=255,
    )
    mask = mask.resize((w, h), Image.LANCZOS)

    toned = src.point(LUT * 3)
    lum = toned.convert("L")
    mapped = Image.merge(
        "RGB", [lum.point([TABLE[i][k] for i in range(256)]) for k in range(3)]
    )

    out = Image.blend(toned, mapped, BLEND)
    out.putalpha(mask)
    out.save(out_path)
    print(f"wrote {out_path} {w}x{h}, cap radius {h / 2:g}")


for spec in SOURCES:
    build(*spec)
