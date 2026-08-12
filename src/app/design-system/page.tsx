import type { Metadata } from "next";
import { CalendarDays, Check, Heart, MapPin, Search, X } from "@/components/icons/paideio-icons";
import { PAIDEIO_ICON_NAMES } from "@/components/icons/paideio-icon-names";
import { PaideioGlyph } from "@/components/icons/paideio-icons";
import {
  GAME_ASSETS,
  GameAsset,
  GameBadge,
  GameCta,
  GameDivider,
  GameEmptyState,
  GameLoader,
  GamePanel,
  GameSectionHeading,
  GameSkeleton,
  GameStat,
  type GameAssetName,
} from "@/components/design";

export const metadata: Metadata = {
  title: "Game Mode - Design system Paideio",
  description: "Componenti, token e asset del design system comic/cel-shaded di Paideio.",
};

const COLORS = [
  ["Ink", "game-ink", "#07131F"],
  ["Blue", "game-blue", "#185BFF"],
  ["Cyan", "game-cyan", "#24D4D1"],
  ["White", "game-white", "#F5F4ED"],
  ["Orange", "game-orange", "#FF6338"],
  ["Ball", "game-ball", "#DDF23A"],
] as const;

const ASSET_GROUPS: Array<{
  title: string;
  assets: GameAssetName[];
}> = [
  {
    title: "Segni fondamentali",
    assets: ["racket", "ball", "impact", "ballMicro"],
  },
  {
    title: "Architettura e gesto",
    assets: ["net", "glassCorner", "smashTrail", "bandejaTrail"],
  },
  {
    title: "Giocatori",
    assets: ["playerVolley", "playerSmash"],
  },
  {
    title: "Attrezzatura",
    assets: ["backpack", "shoes", "ballBasket", "pickupTube"],
  },
  {
    title: "Materiali",
    assets: ["grip", "meshModule", "perforationPattern"],
  },
  {
    title: "Composizioni",
    assets: ["crossedRackets"],
  },
  {
    title: "Academy",
    assets: [
      "splitStep",
      "markerCones",
      "resistanceBands",
      "changeDirectionPlayer",
      "waterBottle",
      "tacticsBoard",
      "racketShapes",
      "courtPositions",
    ],
  },
];

function SpecLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-semibold tracking-[0.08em] text-accent-cyan-ink uppercase">
      {children}
    </p>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="paper-grain min-h-screen">
      <div
        aria-hidden
        dangerouslySetInnerHTML={{
          __html:
            "<!-- THESIS: Game Mode trasforma oggetti e gesti reali del padel in primitive operative, senza gamificare i compiti. OWN-WORLD: superfici blu notte, contour comic, ciano vetro e giallo pallina. STORY: il team vede, confronta e riusa ogni componente. FIRST VIEWPORT: titolo, principi e player-smash come firma. FORM: catalogo operativo, estensione del sistema Paideio. -->",
        }}
      />

      <header className="overflow-hidden border-b border-nebbia/20 px-4 py-12 md:px-10 md:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="ui-kicker">Paideio · Game Mode 2026</p>
            <h1 className="mt-4 max-w-4xl font-heading text-[44px] leading-[0.98] text-calce md:text-[70px]">
              Un design system che parla davvero di padel.
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg text-nebbia">
              Componenti operativi, asset cel-shaded e regole condivise per
              costruire ogni superficie Paideio con una sola voce.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GameCta href="#componenti" showBall arrow tone="ball" size="large">
                Esplora i componenti
              </GameCta>
              <GameCta href="/" tone="outline" size="large">
                Torna al prodotto
              </GameCta>
            </div>
          </div>
          <div className="game-asset-stage hidden min-h-[440px] items-end justify-center lg:col-span-5 lg:flex">
            <GameAsset
              name="playerSmash"
              decorative
              preload
              sizes="420px"
              className="max-h-[500px] w-auto"
            />
          </div>
        </div>
      </header>

      <div id="componenti" className="mx-auto max-w-[1440px] space-y-28 px-4 py-16 md:px-10 md:py-24 lg:px-16">
        <section>
          <GameSectionHeading
            title="Fondamenta"
            description="I colori dell’asset system sono ruoli espressivi. I token prodotto restano la base delle superfici e dei contenuti."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {COLORS.map(([label, token, value]) => (
              <div key={token} className="border border-nebbia/25 bg-carta-alta p-3">
                <div
                  className="h-24 border border-white/8"
                  style={{ backgroundColor: value }}
                />
                <p className="mt-3 font-semibold text-calce">{label}</p>
                <p className="text-xs text-nebbia">--{token}</p>
                <p className="mt-1 text-xs text-nebbia">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <GamePanel className="p-7">
              <SpecLabel>Tipografia editoriale</SpecLabel>
              <p className="font-heading text-[48px] leading-none text-calce">
                Il punto giusto cambia tutto.
              </p>
              <p className="mt-4 max-w-xl text-nebbia">
                Oxanium guida i momenti narrativi, i nomi dei coach e i titoli
                di sezione con una voce sportiva e digitale.
              </p>
            </GamePanel>
            <GamePanel tone="quiet" className="p-7">
              <SpecLabel>Tipografia operativa</SpecLabel>
              <p className="text-body-lg font-semibold text-calce">
                Lezione singola · livello intermedio
              </p>
              <p className="mt-3 max-w-xl text-nebbia">
                Hanken Grotesk mantiene leggibili filtri, dati, prezzi, stati e
                azioni frequenti.
              </p>
            </GamePanel>
          </div>
        </section>

        <section>
          <GameSectionHeading
            title="Icone Paideio"
            description="Glifi originali raster, costruiti con la stessa geometria HUD del prodotto. I PNG trasparenti diventano maschere e assumono il colore del contesto."
          />
          <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden border border-nebbia/20 bg-nebbia/20 sm:grid-cols-5 lg:grid-cols-8">
            {PAIDEIO_ICON_NAMES.map((name) => (
              <div key={name} className="flex min-h-28 flex-col items-center justify-center gap-3 bg-carta-alta p-3 text-center text-vetro">
                <PaideioGlyph name={name} className="size-8" />
                <span className="font-heading text-[9px] font-bold text-nebbia uppercase">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <GameSectionHeading
            title="CTA"
            description="Una sola azione primaria per contesto. La pallina firma i momenti ad alto impatto, non ogni pulsante."
          />
          <div className="mt-8 space-y-8">
            <div>
              <SpecLabel>Varianti</SpecLabel>
              <div className="flex flex-wrap items-center gap-4">
                <GameCta showBall arrow tone="ball">Prenota ora</GameCta>
                <GameCta arrow>Trova un coach</GameCta>
                <GameCta tone="outline">Vedi disponibilità</GameCta>
                <GameCta tone="quiet">Annulla</GameCta>
                <GameCta tone="danger"><X /> Rifiuta</GameCta>
              </div>
            </div>
            <div>
              <SpecLabel>Dimensioni e stati</SpecLabel>
              <div className="flex flex-wrap items-center gap-4">
                <GameCta size="compact" showBall>Compatta</GameCta>
                <GameCta size="default" showBall>Standard</GameCta>
                <GameCta size="large" showBall arrow>Grande</GameCta>
                <GameCta disabled showBall>Disabilitata</GameCta>
              </div>
            </div>
          </div>
        </section>

        <section>
          <GameSectionHeading
            title="Stati e feedback"
            description="Lo stato resta sempre leggibile nel testo; colore e illustrazione aggiungono riconoscibilità senza sostituire il significato."
          />
          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <GamePanel className="p-7">
              <SpecLabel>Badge</SpecLabel>
              <div className="flex flex-wrap gap-3">
                <GameBadge>Neutro</GameBadge>
                <GameBadge tone="info">Informazione</GameBadge>
                <GameBadge tone="success">Confermata</GameBadge>
                <GameBadge tone="pending">In attesa</GameBadge>
                <GameBadge tone="danger">Rifiutata</GameBadge>
              </div>
            </GamePanel>
            <GamePanel className="p-7">
              <SpecLabel>Loader</SpecLabel>
              <div className="flex flex-wrap items-center gap-10">
                <GameLoader size="small" inline label="Aggiornamento" />
                <GameLoader inline label="Caricamento disponibilità" />
                <GameLoader size="large" />
              </div>
            </GamePanel>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <GameStat label="Richieste" value={4} detail="2 nuove oggi" />
            <GameStat label="Lezioni" value={12} detail="Questa settimana" accent="ball" />
            <GameStat label="Valutazione" value="4,9" detail="Su 28 recensioni" accent="orange" />
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <GameSkeleton lines={3} />
            <GameSkeleton lines={4} />
          </div>
        </section>

        <section>
          <GameSectionHeading
            title="Pannelli"
            description="I pannelli raccolgono informazioni correlate. Il bordo superiore segnala il tono senza trasformarsi in decorazione."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <GamePanel className="p-6">
              <CalendarDays className="size-5 text-vetro" />
              <h3 className="mt-5 text-headline-md text-calce">Standard</h3>
              <p className="mt-2 text-sm text-nebbia">Per contenuti e moduli quotidiani.</p>
            </GamePanel>
            <GamePanel tone="quiet" className="p-6">
              <Search className="size-5 text-nebbia" />
              <h3 className="mt-5 text-headline-md text-calce">Quiet</h3>
              <p className="mt-2 text-sm text-nebbia">Per informazioni secondarie.</p>
            </GamePanel>
            <GamePanel tone="cyan" className="p-6">
              <MapPin className="size-5 text-accent-cyan-ink" />
              <h3 className="mt-5 text-headline-md text-calce">Cyan</h3>
              <p className="mt-2 text-sm text-nebbia">Per orientamento e informazioni.</p>
            </GamePanel>
            <GamePanel tone="ball" className="p-6">
              <Check className="size-5 text-accent-ball-ink" />
              <h3 className="mt-5 text-headline-md text-calce">Ball</h3>
              <p className="mt-2 text-sm text-nebbia">Per selezione e conferma.</p>
            </GamePanel>
          </div>
        </section>

        <section>
          <GameSectionHeading
            title="Empty state"
            description="Ogni assenza ha un’immagine specifica e una via d’uscita immediata."
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <GameEmptyState
              asset="shoes"
              title="Allaccia le scarpe"
              description="Non hai ancora prenotato una lezione. Trova il coach giusto e porta il tuo gioco in campo."
              action={<GameCta showBall arrow tone="ball">Trova un coach</GameCta>}
            />
            <GameEmptyState
              asset="backpack"
              title="Lo zaino è ancora vuoto"
              description="Salva i coach che ti interessano per ritrovarli prima della prossima partita."
              action={<GameCta tone="outline"><Heart /> Esplora i coach</GameCta>}
            />
          </div>
        </section>

        <section>
          <GameSectionHeading
            title="Divider"
            description="Una linea modulare ispirata ai riferimenti del campo separa le macro-sezioni senza deformare o ripetere un asset."
          />
          <div className="mt-10 space-y-12">
            <div>
              <SpecLabel>Standard</SpecLabel>
              <GameDivider />
            </div>
            <div>
              <SpecLabel>Compatto</SpecLabel>
              <GameDivider compact />
            </div>
          </div>
        </section>

        <section>
          <GameSectionHeading
            title="Libreria asset"
            description="Tutti i PNG approvati e disponibili nel registry. I due campi non compaiono perché sono ancora bloccati dalla verifica geometrica."
            action={<GameCta href="/" tone="quiet" arrow>Vedi il prodotto</GameCta>}
          />
          <div className="mt-10 space-y-14">
            {ASSET_GROUPS.map((group) => (
              <div key={group.title}>
                <SpecLabel>{group.title}</SpecLabel>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {group.assets.map((assetName) => (
                    <GamePanel
                      key={assetName}
                      tone="quiet"
                      className="flex min-h-[280px] flex-col items-center justify-between p-5"
                    >
                      <GameAsset
                        name={assetName}
                        decorative
                        sizes="(max-width: 768px) 44vw, 260px"
                        className="max-h-52 w-auto"
                      />
                      <div className="mt-4 w-full border-t border-nebbia/20 pt-3">
                        <p className="font-semibold text-calce">{assetName}</p>
                        <p className="truncate text-xs text-nebbia">
                          {GAME_ASSETS[assetName].src}
                        </p>
                      </div>
                    </GamePanel>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-nebbia/20 pt-12">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="font-heading text-[40px] leading-none text-calce">
                Pronto per il prossimo scambio.
              </p>
              <p className="mt-3 max-w-xl text-nebbia">
                Queste primitive sono già disponibili per tutte le superfici Paideio.
              </p>
            </div>
            <GameCta href="/" showBall arrow tone="ball" size="large">
              Torna alla home
            </GameCta>
          </div>
        </section>
      </div>
    </div>
  );
}
