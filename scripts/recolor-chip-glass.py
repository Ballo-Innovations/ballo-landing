# Recolours public/Assets/chip-glass-pill.png per backer brand, keeping its
# rim, speculars and shading (ADR 0002). Add a brand to `brands`, then run:
#   python3 scripts/recolor-chip-glass.py public/Assets/chip-glass-pill.png public/Assets
import sys
from PIL import Image
src, out_dir = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA"); w, h = im.size
px = im.load()
lum = lambda r,g,b: 0.2126*r+0.7152*g+0.0722*b
body = lum(*px[w//2, h//2][:3])  # the flat middle of the pill
brands = {"airtel": (228,0,0), "mtn": (255,203,5), "meta": (8,102,255), "zicta": (11,42,111)}
for name, (R,G,B) in brands.items():
    o = Image.new("RGBA", im.size); op = o.load()
    for y in range(h):
        for x in range(w):
            r,g,b,a = px[x,y]
            t = lum(r,g,b) / body
            if t <= 1:   # shade: darken the brand colour as the source darkens
                c = (R*t, G*t, B*t)
            else:        # highlight: blend toward white as the source brightens
                k = min(1, (t-1) / ((255/body) - 1))
                c = (R+(255-R)*k, G+(255-G)*k, B+(255-B)*k)
            op[x,y] = tuple(int(round(min(255,v))) for v in c) + (a,)
    o.save(f"{out_dir}/chip-glass-pill-{name}.png", optimize=True)
    print(name)
