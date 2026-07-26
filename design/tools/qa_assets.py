#!/usr/bin/env python3
"""QA des assets générés (PIL uniquement, pas de numpy).

Usage :
  python3 qa_assets.py tile <pattern.png> <sortie_2x2.png>   # composite 2x2 + score de raccord
  python3 qa_assets.py alpha <asset.png>                     # contrôle transparence/détourage
"""
import sys
from PIL import Image

PARCHMENT = (244, 234, 213)


def edge_mismatch(im):
    """Écart moyen (0-255) entre bords opposés — 0 = tuilage parfait."""
    rgb = im.convert('RGB')
    w, h = rgb.size
    px = rgb.load()

    def diff(a, b):
        return sum(abs(x - y) for x, y in zip(a, b)) / 3

    lr = sum(diff(px[0, y], px[w - 1, y]) for y in range(h)) / h
    tb = sum(diff(px[x, 0], px[x, h - 1]) for x in range(w)) / w
    return lr, tb


def cmd_tile(src, out):
    im = Image.open(src)
    w, h = im.size
    canvas = Image.new('RGB', (w * 2, h * 2), PARCHMENT)
    rgba = im.convert('RGBA')
    for dx in (0, w):
        for dy in (0, h):
            canvas.paste(rgba, (dx, dy), rgba)
    canvas.thumbnail((1400, 1400))
    canvas.save(out)
    lr, tb = edge_mismatch(im)
    verdict = 'OK' if max(lr, tb) < 12 else ('LIMITE' if max(lr, tb) < 25 else 'RACCORD RATE')
    print(f'{src}: raccord gauche/droite={lr:.1f} haut/bas={tb:.1f} (0=parfait) -> {verdict}')
    print(f'composite 2x2 : {out}')


def cmd_alpha(src):
    im = Image.open(src).convert('RGBA')
    w, h = im.size
    a = im.getchannel('A')
    hist = a.histogram()
    transp = sum(hist[:128]) / (w * h) * 100
    corners = [im.getpixel(p)[3] for p in [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]]
    print(f'{src}: {w}x{h}, {transp:.1f}% transparent, alpha coins={corners}',
          '-> OK' if all(c < 10 for c in corners) and transp > 5 else '-> A VERIFIER (fond non détouré ?)')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    if sys.argv[1] == 'tile':
        cmd_tile(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == 'alpha':
        cmd_alpha(sys.argv[2])
    else:
        sys.exit(__doc__)
