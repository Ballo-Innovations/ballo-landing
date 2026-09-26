"""Crop the dropdown panels' square glass render, darken it, and put it on the
header's palette.

Sibling of build-nav-glass.py and build-chip-glass.py. Unlike those two
sources, `public/Assets/square glass bg.png` ships a real alpha channel, so it
is kept rather than rebuilt -- only cleaned at both ends: the near-zero noise
across its transparent margin is cleared, and the interior, which the render
left at 252-254 rather than 255, is made solid. At 253 the glass is about 1%
see-through, enough for white page text behind the Ask Brutus panel to ghost
through its header. What it cannot be used as is its colour: it is a pale sky
blue, and the dropdown's labels are white. So it gets the nav pills' exact
tone and colour passes (see build-nav-glass.py for why each works the way it
does), which makes the panels the same material as the bar they hang off.
Keep GAMMA, GAIN, BLEND and RAMP in step with that script.

The Ask Brutus panel wears the same glass, darker: it carries paragraphs and
de-emphasised grey text rather than a short list of white labels, and at the
nav's tone its 50-60% white fine print fell to ~3:1. CHAT_GAMMA/CHAT_GAIN take
white text from 6.7:1 to 10.6:1 against the glass's centre, and since the
darkening is still gamma-based the rim and speculars stay bright.

It is also cropped to the glass and halved. The panel paints it as a 9-slice
whose corners render at ~28 CSS px, so even at 2x the full-size render's
220px corners are several times more than the screen can show.

The CSS slice (header.css, `.header__dropdown`) is written against the size
and corner this prints.

Usage: python3 scripts/build-dropdown-glass.py
"""
from PIL import Image

SRC = "public/Assets/square glass bg.png"
OUT = "public/Assets/dropdown-glass.png"
CHAT_OUT = "public/Assets/brutus-chat-glass.png"
# The glass's bounds in the source: its alpha above the noise floor.
BOX = (96, 98, 1158, 1157)
SCALE = 0.5
NOISE = 8  # alpha at or below this is cleared, not kept as a faint haze
SOLID = 250  # alpha at or above this is made fully opaque
GAMMA, GAIN = 1.8, 0.9
CHAT_GAMMA, CHAT_GAIN = 2.5, 0.78
BLEND = 0.85

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


src = Image.open(SRC).convert("RGBA").crop(BOX)
alpha = src.getchannel("A").point(
    lambda v: 0 if v <= NOISE else 255 if v >= SOLID else v
)
rgb = src.convert("RGB")
table = [ramp_at(i / 255) for i in range(256)]


def build(out_path, gamma, gain):
    lut = [min(255, round(((i / 255) ** gamma) * gain * 255)) for i in range(256)]
    toned = rgb.point(lut * 3)
    lum = toned.convert("L")
    mapped = Image.merge(
        "RGB", [lum.point([table[i][k] for i in range(256)]) for k in range(3)]
    )

    out = Image.blend(toned, mapped, BLEND).convert("RGBA")
    out.putalpha(alpha)
    w, h = out.size
    out = out.resize((round(w * SCALE), round(h * SCALE)), Image.LANCZOS)

    # Where the straight edge starts along the top: the corner radius, near
    # enough.
    a = out.getchannel("A")
    corner = next(x for x in range(out.width) if a.getpixel((x, 2)) > 128)
    out.save(out_path, optimize=True)
    print(f"{out_path}  {out.width}x{out.height}  corner ~{corner}px")


build(OUT, GAMMA, GAIN)
build(CHAT_OUT, CHAT_GAMMA, CHAT_GAIN)
