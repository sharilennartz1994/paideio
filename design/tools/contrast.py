#!/usr/bin/env python3
"""Matrice di contrasto WCAG della palette « Campo Centrale ».

I rapporti scritti in SYSTEM.md § 3 vengono da qui. Se un token cambia,
rilanciare e riscrivere i valori: mai stimarli a occhio.

    python3 design/tools/contrast.py
    python3 design/tools/contrast.py '#17685A' '#EAE3D6'   # coppia singola
"""

import sys

PALETTE = {
    "carta": "#0F2233",
    "carta-alta": "#16324B",
    "carta-bassa": "#0A1826",
    "calce": "#F2F4F3",
    "nebbia": "#9FB0BC",
    "vetro": "#5FC4AC",
    "ottico": "#D6E32B",
    "ruggine": "#EB7E61",
    "sabbia": "#EAE3D6",
}

FONDI = ["carta", "carta-alta", "carta-bassa", "sabbia", "ottico", "vetro"]


def _lin(c: float) -> float:
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hexc: str) -> float:
    h = hexc.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def ratio(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def tag(r: float) -> str:
    if r >= 7:
        return "AAA"
    if r >= 4.5:
        return "AA"
    if r >= 3:
        return "lg"
    return "·"


def main() -> None:
    if len(sys.argv) == 3:
        r = ratio(sys.argv[1], sys.argv[2])
        print(f"{sys.argv[1]} su {sys.argv[2]}: {r:.2f}:1  {tag(r)}")
        return

    print(f"{'inchiostro':14}" + "".join(f"{f:>13}" for f in FONDI))
    for name, hexc in PALETTE.items():
        row = f"{name:14}"
        for f in FONDI:
            if name == f:
                row += f"{'—':>13}"
                continue
            r = ratio(hexc, PALETTE[f])
            row += f"{r:>8.2f} {tag(r):<4}"
        print(row)
    print("\nAAA >=7  ·  AA >=4.5 (testo corrente)  ·  lg >=3 (testo grande / non testuale)")


if __name__ == "__main__":
    main()
