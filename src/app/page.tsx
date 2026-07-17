import Link from "next/link";
import { MapPin, GraduationCap, TrendingUp, Star, ArrowRight, Wrench, LineChart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoachAvatar } from "@/components/coach-avatar";
import { searchCoaches } from "@/lib/queries";

const FEATURES = [
  {
    icon: Wrench,
    title: "Tecnica Pura",
    description: "Perfezioniamo ogni vibora e bandeja con analisi video.",
  },
  {
    icon: LineChart,
    title: "Strategia Avanzata",
    description: "Impara a leggere il campo e anticipare le mosse degli avversari.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connettiti con partner di gioco al tuo esatto livello.",
  },
];

export default async function Home() {
  const featured = (await searchCoaches({ sort: "rating" })).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[720px] items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(115deg, #111316 0%, #111316 42%, #0c2a70 78%, #0057ff 130%)",
          }}
        />
        <div className="hex-texture absolute inset-0 z-0 opacity-60" />
        <div className="relative z-10 max-w-4xl px-4 py-24 md:px-16">
          <h1 className="mb-6 font-heading text-headline-lg-mobile leading-tight text-on-background md:text-display-hero">
            Paideio: il tuo percorso verso il{" "}
            <span className="text-secondary-fixed">Master del Padel</span>
          </h1>
          <p className="mb-12 max-w-2xl border-l-4 border-secondary-fixed pl-6 font-sans text-body-lg text-on-surface-variant italic">
            Ispirati dal concetto greco di <span className="text-primary not-italic">Paideia</span>, non ci
            limitiamo a insegnare uno sport. Coltiviamo il carattere, la strategia e la comunità attraverso
            l&apos;eccellenza sul campo da Padel.
          </p>
          <form
            action="/cerca"
            className="flex max-w-3xl flex-col items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container/90 p-4 shadow-2xl backdrop-blur-xl md:flex-row md:rounded-full md:p-1"
          >
            <div className="flex w-full items-center border-b border-outline-variant/30 px-4 py-3 md:w-1/3 md:border-r md:border-b-0">
              <MapPin className="mr-3 size-5 text-outline" />
              <input
                name="city"
                type="text"
                placeholder="Città"
                className="w-full bg-transparent font-sans text-body-md text-on-surface placeholder:text-outline focus:outline-none"
              />
            </div>
            <div className="flex w-full items-center border-b border-outline-variant/30 px-4 py-3 md:w-1/3 md:border-r md:border-b-0">
              <GraduationCap className="mr-3 size-5 text-outline" />
              <select
                name="type"
                className="w-full appearance-none bg-transparent font-sans text-body-md text-on-surface focus:outline-none"
              >
                <option value="">Tipo Lezione</option>
                <option value="singolo">Singola</option>
                <option value="gruppo">Gruppo</option>
              </select>
            </div>
            <div className="flex w-full items-center px-4 py-3 md:w-1/4">
              <TrendingUp className="mr-3 size-5 text-outline" />
              <select
                name="level"
                className="w-full appearance-none bg-transparent font-sans text-body-md text-on-surface focus:outline-none"
              >
                <option value="">Livello</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzato">Avanzato</option>
              </select>
            </div>
            <button
              type="submit"
              className="neon-glow-secondary w-full rounded-xl bg-secondary-container px-8 py-4 font-mono text-label-caps text-on-secondary-container uppercase transition-transform hover:scale-105 active:scale-95 md:w-auto md:rounded-full md:py-3"
            >
              Cerca
            </button>
          </form>
        </div>
      </section>

      {/* Featured Coaches */}
      <section className="relative overflow-hidden bg-surface-container-lowest px-4 py-24 md:px-16">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <h2 className="mb-2 font-heading text-headline-lg-mobile text-primary uppercase italic md:text-headline-lg">
              I Nostri Coach Elite
            </h2>
            <p className="font-sans text-body-md text-on-surface-variant">
              Professionisti certificati pronti a trasformare il tuo gioco.
            </p>
          </div>
          <Link
            href="/cerca"
            className="hidden items-center gap-1 font-mono text-label-caps text-secondary-fixed underline-offset-8 hover:underline md:flex"
          >
            Vedi tutti <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featured.map(({ coach, profile, rating }) => (
            <div
              key={coach.id}
              className="hex-texture card-clip group relative border border-outline-variant/20 bg-surface-container-high transition-all duration-300 hover:border-primary/50"
            >
              {profile.pricePerLesson != null && (
                <div className="absolute top-0 right-0 z-10 bg-secondary-fixed px-6 py-2 font-mono text-label-caps text-on-secondary-fixed">
                  €{profile.pricePerLesson}/ora
                </div>
              )}
              <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-container to-surface-container-lowest">
                <CoachAvatar name={coach.name} src={profile.avatarUrl} className="size-24 text-3xl" />
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-headline-md text-on-surface">{coach.name}</h3>
                    <p className="text-[10px] font-mono text-primary">COACH PAIDEIO</p>
                  </div>
                  <div className="flex items-center gap-1 text-secondary-fixed">
                    <Star className="size-4 fill-current" />
                    <span className="font-mono text-label-caps">
                      {rating.average != null ? rating.average.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>
                <p className="mb-6 line-clamp-2 font-sans text-body-md text-on-surface-variant">{profile.bio}</p>
                <Button
                  nativeButton={false}
                  render={<Link href={`/coach/${coach.id}`} />}
                  className="w-full rounded-none border border-primary bg-transparent py-3 font-mono text-label-caps text-primary uppercase hover:bg-primary hover:text-on-primary"
                >
                  Prenota Ora
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Perché Paideio */}
      <section className="relative overflow-hidden py-24">
        <div className="slanted-divider absolute top-0 left-0 -z-10 h-full w-full origin-bottom-right bg-secondary-fixed" />
        <div className="un-skew grid items-center gap-20 px-4 md:grid-cols-2 md:px-16">
          <div>
            <h2 className="mb-8 font-heading text-headline-lg-mobile text-surface uppercase italic md:text-headline-lg">
              Perché Paideio?
            </h2>
            <p className="mb-12 max-w-lg font-sans text-body-lg text-surface-container-highest">
              Abbiamo decostruito l&apos;allenamento tradizionale per creare un ecosistema dove la crescita
              atletica non si ferma alla tecnica, ma abbraccia l&apos;intelligenza di gioco e la forza del
              gruppo.
            </p>
            <div className="space-y-6">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="group flex items-center gap-6">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest shadow-xl transition-transform group-hover:rotate-12">
                    <feature.icon className="size-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading text-headline-md text-surface uppercase">{feature.title}</h4>
                    <p className="font-sans text-body-md text-surface-container-highest">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-12 -left-12 size-64 animate-pulse rounded-full border-4 border-surface opacity-20" />
            <div
              className="relative z-10 h-[450px] rounded-2xl bg-surface-container-lowest p-4"
              style={{ boxShadow: "30px 30px 0 rgba(18,19,22,1)" }}
            >
              <div className="hex-texture flex size-full items-center justify-center rounded-xl bg-gradient-to-br from-court to-primary-container/40">
                <span className="font-heading text-8xl text-primary/20 italic">παιδεία</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 text-center md:px-16">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-primary-container p-12 md:p-20">
          <div className="hex-texture absolute inset-0 opacity-30" />
          <div className="relative z-10">
            <h2 className="mb-6 font-heading text-headline-lg-mobile text-white uppercase md:text-headline-lg">
              Sei un Coach?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl font-sans text-body-lg text-on-primary-container/80">
              Unisciti alla piattaforma più avanzata per l&apos;insegnamento del Padel. Gestisci i tuoi
              allievi, espandi il tuo business e diventa parte dell&apos;Elite Paideio.
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/diventa-coach" />}
              className="rounded-none bg-secondary-fixed px-12 py-6 font-mono text-lg text-on-secondary-fixed uppercase hover:-translate-y-1 hover:translate-x-1 hover:bg-secondary-fixed"
            >
              Diventa Coach Ora
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
