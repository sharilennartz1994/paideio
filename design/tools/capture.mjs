#!/usr/bin/env node
/**
 * Captures d'audit : pleine hauteur, desktop + mobile, sans aucune dépendance.
 * Pilote chrome-headless-shell (cache ms-playwright) par CDP, en Node natif (WebSocket global).
 *
 *   node capture.mjs --base http://localhost:8737/site --routes /,/a/,/b/ --out ./audits/screens
 *
 * Options :
 *   --base <url>        racine servie (obligatoire)
 *   --routes <a,b,c>    chemins relatifs, séparés par des virgules (défaut : /)
 *   --names <a,b,c>     noms de fichiers correspondants (défaut : déduits des routes)
 *   --out <dir>         dossier de sortie (défaut : ./screens)
 *   --desktop <WxH>     défaut 1600x1000  (0 pour désactiver)
 *   --mobile <WxH>      défaut 390x844    (0 pour désactiver)
 *   --steps <n>         nombre max de vues par page/viewport (défaut 9)
 *   --wait <ms>         attente après chargement (défaut 2600)
 *   --consent <js>      JS exécuté avant rechargement, pour neutraliser un bandeau
 *                       ex. --consent "localStorage.setItem('cookie_ok','1')"
 *   --motion <mode>     no-preference (défaut) | reduce  → force prefers-reduced-motion
 *   --shell <path>      binaire chrome-headless-shell si détection auto en échec
 *
 * DEUX BIAIS NEUTRALISÉS D'OFFICE (ils ont faussé des audits entiers) :
 *   1. le bandeau de consentement s'affiche sur TOUTES les vues (navigateur vierge) → --consent ;
 *   2. chrome-headless-shell annonce `prefers-reduced-motion: reduce`, donc les captures montrent
 *      la variante dégradée du site → forcé à `no-preference`.
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/* ---------- arguments ---------- */
const argv = process.argv.slice(2);
const arg = (k, d = null) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};

const BASE = (arg('base') || '').replace(/\/$/, '');
if (!BASE) {
  console.error('usage : node capture.mjs --base <url> [--routes /,/a/] [--out <dir>] …');
  process.exit(1);
}
const ROUTES = (arg('routes', '/') || '/').split(',').map(s => s.trim()).filter(Boolean);
const NAMES = (arg('names') || '').split(',').map(s => s.trim()).filter(Boolean);
const OUT = path.resolve(arg('out', './screens'));
const STEPS_MAX = parseInt(arg('steps', '9'), 10);
const WAIT = parseInt(arg('wait', '2600'), 10);
const CONSENT = arg('consent');
const MOTION = arg('motion', 'no-preference');
const PORT = 9222 + Math.floor(process.uptime() * 7) % 500;

const parseVp = (s) => {
  if (!s || s === '0') return null;
  const [w, h] = s.toLowerCase().split('x').map(Number);
  return Number.isFinite(w) && Number.isFinite(h) ? [w, h] : null;
};
const VIEWPORTS = [
  ['desktop', parseVp(arg('desktop', '1600x1000')), 1],
  ['mobile', parseVp(arg('mobile', '390x844')), 2],
].filter(v => v[1]);

const SHELL = arg('shell') || path.join(os.homedir(),
  'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell');

const slug = (r, i) => NAMES[i] || (r.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'index');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ---------- client CDP minimal ---------- */
class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id);
        this.pending.delete(m.id);
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout ' + method)); }
      }, 45000);
    });
  }
}

async function connect() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const { webSocketDebuggerUrl } = await res.json();
      const ws = new WebSocket(webSocketDebuggerUrl);
      await new Promise((ok, ko) => { ws.addEventListener('open', ok); ws.addEventListener('error', ko); });
      return new CDP(ws);
    } catch { await sleep(250); }
  }
  throw new Error('chrome injoignable');
}

/* ---------- capture ---------- */
async function run() {
  if (!existsSync(SHELL)) {
    console.error(`chrome-headless-shell introuvable :\n  ${SHELL}\n` +
      'Installe-le (npx playwright install chromium) ou passe --shell <chemin>.');
    process.exit(1);
  }
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const chrome = spawn(SHELL, [
    `--remote-debugging-port=${PORT}`, '--headless', '--hide-scrollbars', '--disable-gpu',
    '--no-first-run', '--force-color-profile=srgb', '--font-render-hinting=none',
    '--user-data-dir=' + path.join(os.tmpdir(), 'cap-' + process.pid), 'about:blank',
  ], { stdio: 'ignore' });

  const cdp = await connect();
  try {
    for (const [i, route] of ROUTES.entries()) {
      const name = slug(route, i);
      for (const [vp, [w, h], dsf] of VIEWPORTS) {
        const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

        await cdp.send('Page.enable', {}, sessionId);
        // biais n°2 : le shell annonce « reduce » → on capture le site en mouvement normal
        await cdp.send('Emulation.setEmulatedMedia',
          { features: [{ name: 'prefers-reduced-motion', value: MOTION }] }, sessionId);
        await cdp.send('Emulation.setDeviceMetricsOverride',
          { width: w, height: h, deviceScaleFactor: dsf, mobile: vp === 'mobile' }, sessionId);

        const url = BASE + (route.startsWith('/') ? route : '/' + route);
        await cdp.send('Page.navigate', { url }, sessionId);
        await sleep(1200);

        // biais n°1 : consentement pré-donné, on juge le site et non son bandeau de 1re visite
        if (CONSENT) {
          await cdp.send('Runtime.evaluate', { expression: CONSENT }, sessionId);
          await cdp.send('Page.reload', {}, sessionId);
        }
        await sleep(WAIT);

        const { result: hres } = await cdp.send('Runtime.evaluate',
          { expression: 'document.documentElement.scrollHeight', returnByValue: true }, sessionId);
        const total = hres.value || h;
        const steps = Math.min(STEPS_MAX, Math.max(2, Math.ceil(total / h)));

        for (let s = 0; s < steps; s++) {
          const y = Math.round((total - h) * (s / Math.max(1, steps - 1)));
          await cdp.send('Runtime.evaluate',
            { expression: `window.scrollTo({top:${y},behavior:'instant'})` }, sessionId);
          await sleep(950);
          const { data } = await cdp.send('Page.captureScreenshot',
            { format: 'png', captureBeyondViewport: false }, sessionId);
          await writeFile(path.join(OUT, `${name}-${vp}-${String(s + 1).padStart(2, '0')}.png`),
            Buffer.from(data, 'base64'));
        }
        await cdp.send('Target.closeTarget', { targetId });
        console.log(`${name} ${vp} : ${steps} vues (page ${total}px)`);
      }
    }
  } finally {
    chrome.kill();
  }
  const n = (await readdir(OUT)).length;
  console.log(`\n${n} captures dans ${OUT}`);
}

run().catch(e => { console.error('ÉCHEC :', e.message); process.exit(1); });
