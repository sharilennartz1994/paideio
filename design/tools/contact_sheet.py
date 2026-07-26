#!/usr/bin/env python3
"""Planche contact de la bibliothèque d'assets, sur fond parchemin, avec étiquettes.

Usage :
  python3 contact_sheet.py <sortie.png> <dossier_assets> [famille1 famille2 ...]
Sans familles : motifs, patterns, dividers, rails, icons.
Les fichiers _raw/ et *-cool sont ignorés.
Couleurs de planche surchargeables : CS_BG / CS_INK / CS_LABEL (env, format R,G,B).
"""
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw


def _rgb(name, default):
    v = os.environ.get(name)
    return tuple(int(x) for x in v.split(',')) if v else default


BASE = Path('.')
PARCH = _rgb('CS_BG', (244, 234, 213))
INK = _rgb('CS_INK', (43, 37, 33))
GRAN = _rgb('CS_LABEL', (122, 115, 107))
CELL_W, CELL_H, PAD, LABEL_H = 300, 240, 24, 34


def collect(folders):
    files = []
    for d in folders:
        p = BASE / d
        if not p.is_dir():
            continue
        for f in sorted(p.glob('*.png')):
            if '_raw' in f.parts or f.stem.endswith('-cool'):
                continue
            files.append((d, f))
    return files


def main():
    global BASE
    if len(sys.argv) < 3:
        sys.exit('usage : contact_sheet.py <sortie.png> <dossier_assets> [familles...]')
    out = sys.argv[1]
    BASE = Path(sys.argv[2]).resolve()
    folders = sys.argv[3:] or ['motifs', 'patterns', 'dividers', 'rails', 'icons']
    files = collect(folders)
    if not files:
        sys.exit('aucun asset')
    cols = min(4, len(files))
    rows = (len(files) + cols - 1) // cols
    W = cols * (CELL_W + PAD) + PAD
    H = rows * (CELL_H + LABEL_H + PAD) + PAD
    canvas = Image.new('RGB', (W, H), PARCH)
    draw = ImageDraw.Draw(canvas)
    for i, (d, f) in enumerate(files):
        cx = PAD + (i % cols) * (CELL_W + PAD)
        cy = PAD + (i // cols) * (CELL_H + LABEL_H + PAD)
        im = Image.open(f).convert('RGBA')
        im.thumbnail((CELL_W, CELL_H))
        px = cx + (CELL_W - im.width) // 2
        py = cy + (CELL_H - im.height) // 2
        canvas.paste(im, (px, py), im)
        draw.rectangle([cx - 6, cy - 6, cx + CELL_W + 6, cy + CELL_H + 6], outline=(201, 168, 124), width=1)
        draw.text((cx + 2, cy + CELL_H + 10), f'{d}/{f.stem}', fill=INK)
    draw.text((PAD, H - 20), f'{len(files)} assets', fill=GRAN)
    canvas.save(out)
    print(f'{out}: {len(files)} assets, {W}x{H}')


if __name__ == '__main__':
    main()
