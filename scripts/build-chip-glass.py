"""Cut the chip glass pill out of its render, rebuild its alpha, and put it on
the header's palette.

Sibling of build-nav-glass.py, and the same problem: `public/Assets/glass-pill.png`
is an RGB render with its transparency baked in as a checkerboard, so there is
no alpha to use and the one that matters has to be drawn here.

The tone and colour passes are the nav's, value for value, so a chip is the
same blue as the header's islands and sign-in button (which is cut from this
same render). An earlier version darkened harder (gamma 2.3) and skipped the
colour ramp to keep the chromatic fringes; that left the chips a brighter,
cyan-leaning blue with orange caps that did not match the nav. See
build-nav-glass.py for why each pass works the way it does, and keep GAMMA,
GAIN, BLEND and RAMP in step with it.

Usage: python3 scripts/build-chip-glass.py
"""
from PIL import Image, ImageDraw

SRC = "public/Assets/glass-pill.png"
OUT = "public/Assets/chip-glass-pill.png"
# The pill's bounds in the source, found by looking for saturated pixels: the
# checkerboard behind it is neutral, the pill is not.
BOX = (246, 380, 1293, 645)
GAMMA, GAIN = 1.8, 0.9
BLEND = 0.85
INSET = 3  # drops the checkerboard fringe hugging the silhouette
SS = 4  # mask supersampling, for a clean antialiased cap edge

# Same stops as build-nav-glass.py, lifted from --glass-nav-sheen.
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


src = Image.open(SRC).convert("RGB").crop(BOX)
w, h = src.size

mask = Image.new("L", (w * SS, h * SS), 0)
ImageDraw.Draw(mask).rounded_rectangle(
    [INSET * SS, INSET * SS, w * SS - 1 - INSET * SS, h * SS - 1 - INSET * SS],
    radius=(h * SS) // 2,
    fill=255,
)
mask = mask.resize((w, h), Image.LANCZOS)

lut = [min(255, round(((i / 255) ** GAMMA) * GAIN * 255)) for i in range(256)]
toned = src.point(lut * 3)

table = [ramp_at(i / 255) for i in range(256)]
lum = toned.convert("L")
mapped = Image.merge(
    "RGB", [lum.point([table[i][k] for i in range(256)]) for k in range(3)]
)

out = Image.blend(toned, mapped, BLEND)
out.putalpha(mask)
out.save(OUT)
print(f"{OUT}  {w}x{h}  cap radius {h // 2}")
