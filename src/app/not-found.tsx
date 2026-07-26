import { GameAsset, GameCta } from "@/components/design";

export default function NotFound() {
  return (
    <div className="hex-texture mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <GameAsset
        name="ball"
        decorative
        sizes="180px"
        className="max-h-44 w-auto"
      />
      <p className="mt-6 font-mono text-label-caps text-primary uppercase">Errore 404</p>
      <h1 className="mt-2 font-heading text-headline-lg-mobile text-on-surface">Fuori campo!</h1>
      <p className="mt-3 font-sans text-on-surface-variant">
        Questa pagina non esiste o è stata spostata — hai mandato la pallina fuori.
      </p>
      <GameCta href="/" tone="ball" showBall className="mt-6">
        Torna in campo
      </GameCta>
    </div>
  );
}
