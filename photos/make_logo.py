"""Render the NITER Smart Campus shield logo to photos/niter_logo.jpg (512x512)."""
from PIL import Image, ImageDraw, ImageFont
import os

S = 512
img = Image.new("RGB", (S, S), "#0b1a38")
d = ImageDraw.Draw(img)

# Rounded background tile (slightly lighter than the page navy so it reads as a tile)
d.rounded_rectangle([8, 8, S - 8, S - 8], radius=100, fill="#12264d")

# Blue shield
d.polygon(
    [
        (S * 0.5, S * 0.16),
        (S * 0.80, S * 0.27),
        (S * 0.80, S * 0.47),
        (S * 0.50, S * 0.83),
        (S * 0.20, S * 0.47),
        (S * 0.20, S * 0.27),
    ],
    fill="#2563eb",
)

# White N strokes
def line(p1, p2, w):
    d.line([p1, p2], fill="#ffffff", width=w)

line((S * 0.42, S * 0.34), (S * 0.42, S * 0.66), 22)
line((S * 0.42, S * 0.34), (S * 0.58, S * 0.66), 22)
line((S * 0.58, S * 0.34), (S * 0.58, S * 0.66), 22)

# Book / graduation arc across the base of the shield
d.arc([S * 0.30, S * 0.60, S * 0.70, S * 1.02], 20, 160, fill="#c9a227", width=14)

out = os.path.join(os.path.dirname(__file__), "niter_logo.jpg")
img.save(out, "JPEG", quality=92)
print("wrote", out, os.path.getsize(out), "bytes")
