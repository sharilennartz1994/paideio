"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Barra sottile in cima: copre la finestra fra il click e il primo byte.
 *
 * I `loading.tsx` coprono il tempo *dopo* che la rotta è stata impegnata. Se
 * il prefetch non è ancora arrivato (rete lenta, link appena comparso), fra il
 * click e quel momento non succede niente sullo schermo: è lì che l'utente
 * pensa che l'app sia bloccata.
 *
 * La via idiomatica sarebbe `useLinkStatus` di `next/link`, ma va montato
 * *dentro* ogni `<Link>` e i link di navigazione vivono in `sidebar-nav.tsx`,
 * `mobile-nav.tsx` e `site-footer.tsx`, fuori dal perimetro di questo lavoro.
 * Questa è la versione globale equivalente: un listener delegato sui click di
 * ancora, azzerato quando la rotta cambia davvero.
 *
 * Non lampeggia sulle navigazioni istantanee perché la comparsa è ritardata di
 * 140ms in CSS (`.route-progress`), non in JS.
 */
function RouteProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentKey = `${pathname}?${search}`;

  // Teniamo la chiave della pagina che stiamo lasciando, non un booleano: la
  // barra è accesa finché siamo ancora lì. Azzerarla in un `useEffect` sarebbe
  // un setState sincrono dentro un effetto (render a cascata, e il linter lo
  // blocca); l'aggiustamento in fase di render è il pattern consigliato da
  // React. In più evita il falso positivo del tasto Indietro: con un booleano
  // e un confronto sull'uguaglianza la barra si riaccendeva tornando sulla
  // pagina di partenza.
  const [leavingFrom, setLeavingFrom] = useState<string | null>(null);
  if (leavingFrom !== null && leavingFrom !== currentKey) {
    setLeavingFrom(null);
  }
  const pending = leavingFrom !== null;

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Solo l'hash che cambia: nessuna richiesta, nessuna attesa.
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      setLeavingFrom(`${window.location.pathname}?${window.location.search.replace(/^\?/, "")}`);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Rete di sicurezza: una navigazione annullata non deve lasciare la barra accesa.
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setLeavingFrom(null), 6000);
    return () => window.clearTimeout(timer);
  }, [pending]);

  if (!pending) return null;

  return (
    <div className="route-progress" role="presentation">
      <span />
    </div>
  );
}

/**
 * Il boundary sta qui e non in `layout.tsx` per due motivi: `useSearchParams()`
 * sospende in prerendering e va isolato con un fallback banale (stessa lezione
 * di `RouteScrollReset` in `game-route-stage.tsx`), e così il layout resta una
 * riga sola.
 */
export function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <RouteProgressBarInner />
    </Suspense>
  );
}
