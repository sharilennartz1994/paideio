#!/usr/bin/env python3
"""Détourage par chroma-key d'un fond uni + nettoyage des franges (unpremultiply).

Usage :
  python3 key_bg.py <src.png> <out.png> [R,G,B]

Sans couleur fournie, le fond est estimé (couleur la plus fréquente des bords).
Alpha : 0 si distance au fond < T0, 255 si > T1, rampe entre les deux.
Les pixels semi-transparents sont « démélangés » : C = (P - (1-a)·BG) / a.
"""
import sys
from collections import Counter
from PIL import Image

T0, T1 = 12, 70


def main():
    src, out = sys.argv[1], sys.argv[2]
    im = Image.open(src).convert('RGB')
    w, h = im.size
    data = list(im.getdata())

    if len(sys.argv) > 3:
        bg = tuple(int(v) for v in sys.argv[3].split(','))
    else:
        edge = [data[y * w + x] for y in range(h) for x in (0, 1, w - 2, w - 1)]
        edge += [data[y * w + x] for x in range(w) for y in (0, 1, h - 2, h - 1)]
        bg = Counter(edge).most_common(1)[0][0]

    outdata = []
    for p in data:
        d = max(abs(p[0] - bg[0]), abs(p[1] - bg[1]), abs(p[2] - bg[2]))
        if d <= T0:
            outdata.append((0, 0, 0, 0))
        elif d >= T1:
            outdata.append((p[0], p[1], p[2], 255))
        else:
            a = (d - T0) / (T1 - T0)
            c = tuple(min(255, max(0, int((p[i] - (1 - a) * bg[i]) / a))) for i in range(3))
            outdata.append((c[0], c[1], c[2], int(a * 255)))

    res = Image.new('RGBA', (w, h))
    res.putdata(outdata)
    res.save(out)
    transp = sum(1 for p in outdata if p[3] < 128) / len(outdata) * 100
    print(f'{out}: fond détecté {bg}, {transp:.1f}% transparent')


if __name__ == '__main__':
    main()
