import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDir = path.resolve("public/design/icons");

const glyphs = {
  arrow: '<path d="M10 32h38M36 17l15 15-15 15"/><circle cx="12" cy="32" r="3" fill="white" stroke="none"/>',
  trophy: '<path d="M19 10h26v11c0 12-7 20-13 20s-13-8-13-20V10Z"/><path d="M19 16H9v5c0 8 5 12 12 12M45 16h10v5c0 8-5 12-12 12M32 41v9M20 54h24"/>',
  bell: '<path d="M17 43h30l-4-7V25c0-8-5-14-11-14s-11 6-11 14v11l-4 7Z"/><path d="M27 50h10"/><circle cx="48" cy="14" r="4" fill="white" stroke="none"/>',
  book: '<path d="M10 13h17c4 0 5 3 5 7v33c0-4-2-7-6-7H10V13ZM54 13H37c-4 0-5 3-5 7v33c0-4 2-7 6-7h16V13Z"/><path d="M16 22h9M39 22h9"/>',
  brain: '<path d="M31 14c-7-8-17-1-14 7-8 2-8 13-1 16-3 8 7 15 14 9M33 14c7-8 17-1 14 7 8 2 8 13 1 16 3 8-7 15-14 9M32 13v38"/><path d="M20 25l7 4-6 6M44 25l-7 4 6 6"/>',
  calendar: '<path d="M11 17h42v37H11V17ZM11 27h42M20 9v15M44 9v15"/><path d="M20 36h5M31 36h5M42 36h5M20 45h5M31 45h5"/>',
  "calendar-check": '<path d="M11 17h42v37H11V17ZM11 27h42M20 9v15M44 9v15"/><path d="m21 41 7 7 16-16"/>',
  "calendar-x": '<path d="M11 17h42v37H11V17ZM11 27h42M20 9v15M44 9v15"/><path d="m23 35 18 16M41 35 23 51"/>',
  "calendar-clock": '<path d="M11 17h42v37H11V17ZM11 27h42M20 9v15M44 9v15"/><circle cx="34" cy="42" r="10"/><path d="M34 36v7l5 3"/>',
  check: '<path d="m11 33 13 13 29-31"/><circle cx="51" cy="15" r="3" fill="white" stroke="none"/>',
  "check-circle": '<path d="M52 29v3c0 12-8 21-20 21S11 44 11 32s9-21 21-21c5 0 9 1 12 4"/><path d="m19 32 9 9 24-25"/>',
  chevron: '<path d="m18 24 14 15 14-15"/>',
  "chevron-left": '<path d="m39 13-19 19 19 19"/><circle cx="47" cy="32" r="3" fill="white" stroke="none"/>',
  "chevron-right": '<path d="m25 13 19 19-19 19"/><circle cx="17" cy="32" r="3" fill="white" stroke="none"/>',
  circle: '<circle cx="32" cy="32" r="20"/>',
  "circle-dot": '<circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="6" fill="white" stroke="none"/>',
  user: '<circle cx="32" cy="21" r="10"/><path d="M13 53c2-12 9-18 19-18s17 6 19 18"/><path d="M18 53h28"/>',
  "user-cog": '<circle cx="26" cy="19" r="9"/><path d="M9 49c2-10 8-15 17-15 5 0 9 2 12 5"/><circle cx="47" cy="45" r="8"/><path d="M47 33v5M47 52v5M35 45h5M54 45h5"/>',
  users: '<circle cx="24" cy="22" r="8"/><circle cx="43" cy="25" r="7"/><path d="M8 51c2-10 7-16 16-16s15 6 17 16M38 38c8 0 13 5 15 13"/>',
  clipboard: '<path d="M16 14h32v41H16V14Z"/><path d="M24 14V9h16v9H24Z"/><path d="m23 36 6 6 13-15"/>',
  clock: '<circle cx="32" cy="32" r="21"/><path d="M32 18v15l11 7"/><circle cx="32" cy="32" r="3" fill="white" stroke="none"/>',
  dumbbell: '<path d="M10 25v14M17 20v24M47 20v24M54 25v14M17 32h30"/>',
  euro: '<path d="M47 15c-4-3-8-4-13-4-12 0-19 9-19 21s7 21 19 21c5 0 10-2 14-5M10 27h31M10 37h28"/>',
  external: '<path d="M28 13H12v39h39V36M35 12h17v17M52 12 27 37"/>',
  eye: '<path d="M7 32s9-15 25-15 25 15 25 15-9 15-25 15S7 32 7 32Z"/><circle cx="32" cy="32" r="7"/><circle cx="32" cy="32" r="2" fill="white" stroke="none"/>',
  flame: '<path d="M34 7c3 12-5 14-2 24 4-3 7-7 8-12 8 7 12 14 10 23-2 10-9 15-18 15S15 51 14 42c-1-8 4-15 10-20-1 8 2 10 5 12-1-10 1-18 5-27Z"/>',
  gavel: '<path d="m14 17 13-8 10 15-13 8-10-15ZM31 28l18 26M39 20l8-5 8 12-8 5M9 55h28"/>',
  cap: '<path d="m7 25 25-12 25 12-25 12L7 25Z"/><path d="M17 32v12c9 7 21 7 30 0V32M56 27v17"/>',
  heart: '<path d="M32 53 12 34C1 23 8 10 20 12c6 1 10 6 12 10 2-4 6-9 12-10 12-2 19 11 8 22L32 53Z"/>',
  history: '<path d="M13 20V9M13 20h11"/><path d="M14 19c4-6 10-9 18-9 12 0 22 10 22 22S44 54 32 54 10 44 10 32"/><path d="M32 20v13l9 6"/>',
  home: '<path d="m8 29 24-19 24 19M14 26v28h36V26"/><path d="M25 54V38h14v16"/><circle cx="48" cy="17" r="3" fill="white" stroke="none"/>',
  inbox: '<path d="M10 12h44v40H10V12Z"/><path d="M10 37h13l5 7h8l5-7h13"/><circle cx="48" cy="18" r="3" fill="white" stroke="none"/>',
  info: '<circle cx="32" cy="32" r="21"/><path d="M32 29v15M32 20v1"/>',
  dashboard: '<path d="M9 10h19v18H9V10ZM36 10h19v11H36V10ZM36 29h19v25H36V29ZM9 36h19v18H9V36Z"/>',
  list: '<path d="M20 15h35M20 32h35M20 49h35"/><circle cx="10" cy="15" r="3" fill="white" stroke="none"/><circle cx="10" cy="32" r="3" fill="white" stroke="none"/><circle cx="10" cy="49" r="3" fill="white" stroke="none"/>',
  rows: '<path d="M9 11h46v11H9V11ZM9 27h46v11H9V27ZM9 43h46v11H9V43Z"/>',
  bulb: '<path d="M20 28c0-8 5-16 12-16s12 8 12 16c0 7-5 10-7 15H27c-2-5-7-8-7-15Z"/><path d="M26 50h12M29 56h6"/><circle cx="49" cy="16" r="3" fill="white" stroke="none"/>',
  loader: '<path d="M32 8a24 24 0 1 1-17 7"/><path d="M9 9v13h13"/>',
  pin: '<path d="M32 57s18-17 18-31c0-10-8-18-18-18s-18 8-18 18c0 14 18 31 18 31Z"/><circle cx="32" cy="26" r="6"/>',
  message: '<path d="M9 11h46v34H29L16 55V45H9V11Z"/><path d="M18 23h27M18 33h18"/>',
  moon: '<path d="M46 48A23 23 0 0 1 25 8c-4 19 6 31 21 40Z"/><circle cx="49" cy="16" r="3" fill="white" stroke="none"/>',
  sun: '<circle cx="32" cy="32" r="11"/><path d="M32 6v9M32 49v9M6 32h9M49 32h9M14 14l7 7M43 43l7 7M50 14l-7 7M21 43l-7 7"/>',
  network: '<circle cx="13" cy="32" r="6"/><circle cx="49" cy="14" r="6"/><circle cx="49" cy="50" r="6"/><path d="m19 29 24-12M19 35l24 12M49 20v24"/>',
  package: '<path d="m10 20 22-11 22 11v27L32 58 10 47V20Z"/><path d="m10 20 22 12 22-12M32 32v26M21 15l23 12"/>',
  quote: '<path d="M10 18h18v18H18c0 8-3 13-9 17M36 18h18v18h-10c0 8-3 13-9 17"/>',
  search: '<circle cx="27" cy="27" r="17"/><path d="m40 40 15 15"/><circle cx="27" cy="27" r="3" fill="white" stroke="none"/>',
  send: '<path d="m7 10 50 22L7 54l8-18 27-4-27-4-8-18Z"/>',
  filters: '<path d="M9 15h46M9 32h46M9 49h46"/><circle cx="22" cy="15" r="5" fill="white" stroke="none"/><circle cx="43" cy="32" r="5" fill="white" stroke="none"/><circle cx="28" cy="49" r="5" fill="white" stroke="none"/>',
  sparkles: '<path d="m32 7 4 13 12 4-12 4-4 13-4-13-12-4 12-4 4-13ZM49 40l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z"/>',
  star: '<path d="m32 7 7 16 18 2-14 12 4 18-15-9-15 9 4-18L7 25l18-2 7-16Z"/>',
  swords: '<path d="M11 10 43 42M8 8l13 4-9 9-4-13ZM43 42l10 10M53 10 21 42M56 8l-13 4 9 9 4-13ZM21 42 11 52"/>',
  target: '<circle cx="32" cy="32" r="23"/><circle cx="32" cy="32" r="13"/><circle cx="32" cy="32" r="4" fill="white" stroke="none"/><path d="M32 4v8M60 32h-8"/>',
  trend: '<path d="m8 48 14-16 10 9 22-25M40 16h14v14"/>',
  warning: '<path d="M32 7 58 55H6L32 7Z"/><path d="M32 23v16M32 47v1"/>',
  triangle: '<path d="M32 8 57 54H7L32 8Z"/>',
  x: '<path d="M13 13 51 51M51 13 13 51"/><circle cx="52" cy="12" r="3" fill="white" stroke="none"/>',
};

function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <g fill="none" stroke="white" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter">${body}</g>
  </svg>`;
}

await mkdir(outputDir, { recursive: true });
await Promise.all(
  Object.entries(glyphs).map(([name, body]) =>
    sharp(Buffer.from(svg(body)))
      .resize(64, 64)
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(outputDir, `${name}.png`))
  )
);

console.log(`Generated ${Object.keys(glyphs).length} Paideio PNG icons in ${outputDir}`);
