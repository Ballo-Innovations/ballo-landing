"""Cut the chip glass pill out of its render, rebuild its alpha, and tone it
down for small type.

Sibling of build-nav-glass.py, and the same problem: `public/Assets/glass-pill.png`
is an RGB render with its transparency baked in as a checkerboard, so there is
no alpha to use and the one that matters has to be drawn here.

Two differences from the nav pill, both because a chip is small and carries
text on top of it:

1. It is darkened harder (gamma 2.3 against the nav's 1.8). At full strength
   the render is a bright cyan slab; white label text on it fails to separate,
   and a row of them reads as a row of buttons rather than as chips in a
   section. The rim and the speculars survive the gamma, which is the point of
   a gamma rather than a multiply -- it pulls the midtones down and leaves the
   near-white edges alone.

2. Its chromatic fringes are kept. The nav pill blends most of the way onto the
   header palette because it is a large flat surface where stray warm edges
   read as a colour cast; at chip size those same fringes are the only thing
   saying "glass" rather than "blue capsule".

Usage: python3 scripts/build-chip-glass.py
"""
from PIL import Image, ImageDraw

SRC = "public/Assets/glass-pill.png"
OUT = "public/Assets/chip-glass-pill.png"
# The pill's bounds in the source, found by looking for saturated pixels: the
# checkerboard behind it is neutral, the pill is not.
BOX = (246, 380, 1293, 645)
GAMMA, GAIN = 2.3, 0.82
INSET = 3  # drops the checkerboard fringe hugging the silhouette
SS = 4  # mask supersampling, for a clean antialiased cap edge

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

out = toned.convert("RGBA")
out.putalpha(mask)
out.save(OUT)
print(f"{OUT}  {w}x{h}  cap radius {h // 2}")
