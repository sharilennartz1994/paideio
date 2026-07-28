import type { Metadata } from "next";
import Link from "next/link";
import {
  Da,
  LegalDraftBanner,
  LegalHighlight,
  LegalIndex,
  LegalList,
  LegalPage,
  LegalSection,
} from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Termini di servizio — Paideio",
  description:
    "Le condizioni che regolano l’uso di Paideio per giocatori e coach: ruolo della piattaforma, obblighi, prenotazioni e responsabilità.",
};

const UPDATED_AT = "27 luglio 2026";

const INDEX = [
  { id: "chi-siamo", label: "Chi gestisce Paideio" },
  { id: "cosa-e", label: "Che cosa è (e non è) Paideio" },
  { id: "account", label: "Account e requisiti" },
  { id: "coach", label: "Obblighi di chi si iscrive come coach" },
  { id: "non-verifichiamo", label: "Cosa Paideio non verifica" },
  { id: "giocatori", label: "Obblighi di chi prenota" },
  { id: "prenotazioni", label: "Come funziona una prenotazione" },
  { id: "annullamenti", label: "Annullamenti" },
  { id: "recensioni", label: "Recensioni e contenuti" },
  { id: "responsabilita", label: "Responsabilità" },
  { id: "sospensione", label: "Sospensione e chiusura" },
  { id: "modifiche", label: "Modifiche ai termini" },
  { id: "legge", label: "Legge applicabile e foro" },
  { id: "contatti", label: "Contatti" },
];

export default function TerminiPage() {
  return (
    <LegalPage
      kicker="Documenti · Paideio"
      title="Termini di servizio"
      intro="Le condizioni che regolano l’uso di Paideio. Usando il servizio le accetti: se non sei d’accordo, non utilizzare la piattaforma."
      updatedAt={UPDATED_AT}
    >
      <LegalDraftBanner />
      <LegalIndex items={INDEX} />

      <LegalSection id="chi-siamo" number="01" title="Chi gestisce Paideio">
        <p>
          Paideio è un servizio online accessibile all’indirizzo playpaideio.com, gestito da
          Shari Lennartz (di seguito «Paideio», «noi»), con domicilio in Via Reggio Emilia 5,
          09028 Sestu (CA).
        </p>
        <p>
          Il servizio è attualmente offerto a titolo gratuito e non è svolto in forma di
          impresa: non è quindi presente una partita IVA. Questi termini saranno aggiornati
          quando l’attività assumerà forma imprenditoriale, in particolare con l’introduzione
          dei pagamenti.
        </p>
        <p>
          Per qualsiasi comunicazione relativa a questi termini puoi scrivere a{" "}
          <a
            href="mailto:info@playpaideio.com"
            className="text-accent-cyan-ink underline underline-offset-4"
          >
            info@playpaideio.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="cosa-e" number="02" title="Che cosa è (e non è) Paideio">
        <LegalHighlight>
          Paideio è uno spazio di incontro tra giocatori e coach di padel. Non organizziamo,
          non eroghiamo e non supervisioniamo le lezioni: il rapporto per la lezione si
          instaura direttamente tra il giocatore e il coach.
        </LegalHighlight>
        <p>Concretamente, Paideio si limita a:</p>
        <LegalList
          items={[
            "ospitare i profili pubblicati dai coach e le disponibilità che dichiarano;",
            "permettere a un giocatore di inviare una richiesta di prenotazione;",
            "notificare le parti e tenere traccia dello stato della richiesta.",
          ]}
        />
        <p>
          Paideio non è parte del contratto di insegnamento, non stabilisce i prezzi, non
          definisce i contenuti didattici e non è presente durante le lezioni. Non riceve
          pagamenti per conto dei coach: il corrispettivo della lezione, se dovuto, è regolato
          direttamente tra le parti fuori dalla piattaforma.
        </p>
      </LegalSection>

      <LegalSection id="account" number="03" title="Account e requisiti">
        <p>
          Per usare le funzioni di prenotazione serve un account, creato tramite il nostro
          fornitore di autenticazione. Devi avere almeno 18 anni e fornire dati veri e
          aggiornati. Sei responsabile delle credenziali e di ciò che avviene tramite il tuo
          account.
        </p>
        <p>
          Un account nasce come giocatore e può essere convertito in account coach. La
          conversione è un’azione volontaria che comporta l’accettazione degli obblighi
          dell’articolo seguente.
        </p>
      </LegalSection>

      <LegalSection id="coach" number="04" title="Obblighi di chi si iscrive come coach">
        <p>
          Iscrivendoti come coach dichiari, sotto la tua responsabilità, e ti impegni a
          mantenere vero per tutta la durata dell’uso del servizio, quanto segue.
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-calce">Requisiti per l’attività.</strong> Sei in regola
              con ogni requisito previsto per svolgere l’attività che offri, inclusi quelli
              federali e delle strutture in cui operi.
            </>,
            <>
              <strong className="text-calce">Veridicità del profilo.</strong> Le informazioni
              che pubblichi — biografia, qualifiche eventualmente indicate, livelli, tipo di
              allenamento, campi, prezzo — sono vere e verificabili. Non attribuirti titoli,
              abilitazioni o affiliazioni che non possiedi.
            </>,
            <>
              <strong className="text-calce">Obblighi fiscali e contributivi.</strong> Adempi
              autonomamente agli obblighi fiscali, contributivi e assicurativi previsti per la
              tua posizione. Paideio non è tuo datore di lavoro, non è tuo committente e non
              opera alcuna ritenuta.
            </>,
            <>
              <strong className="text-calce">Copertura assicurativa.</strong> Ti impegni a
              valutare e mantenere una copertura adeguata per i danni che possano derivare
              dall’attività, inclusi gli infortuni degli allievi.
            </>,
            <>
              <strong className="text-calce">Disponibilità reali.</strong> Pubblichi solo
              orari e campi di cui disponi effettivamente, e gestisci con tempestività le
              richieste ricevute.
            </>,
          ]}
        />
        <p>
          Ti impegni inoltre a manlevare Paideio da pretese di terzi che derivino dalla
          violazione di questi impegni o dallo svolgimento della tua attività.
        </p>
      </LegalSection>

      <LegalSection id="non-verifichiamo" number="05" title="Cosa Paideio non verifica">
        <LegalHighlight>
          Paideio non verifica le qualifiche, i titoli, le abilitazioni, le coperture
          assicurative o la posizione fiscale dei coach. Le informazioni sui profili sono
          dichiarate dai coach stessi e pubblicate senza controllo preventivo.
        </LegalHighlight>
        <p>
          Gli elementi mostrati sul profilo pubblico — come l’anzianità sulla piattaforma, il
          numero di lezioni svolte tramite Paideio o le valutazioni ricevute — descrivono
          l’attività registrata sulla piattaforma. Non sono un giudizio sulla competenza, né
          una certificazione o un accreditamento da parte nostra.
        </p>
        <p>
          Prima di prenotare, ti invitiamo a chiedere direttamente al coach le informazioni
          che ritieni rilevanti e a verificarle in autonomia.
        </p>
      </LegalSection>

      <LegalSection id="giocatori" number="06" title="Obblighi di chi prenota">
        <LegalList
          items={[
            "Fornisci informazioni veritiere su livello ed esigenze, così che il coach possa valutare l’allenamento adatto.",
            "Valuti autonomamente la propria idoneità fisica all’attività sportiva e rispetti gli obblighi di certificazione medica eventualmente richiesti dalla struttura.",
            "Rispetti gli impegni presi: se non puoi presentarti, annulla con congruo anticipo.",
            "Usi la piattaforma in buona fede, senza inviare richieste fittizie.",
          ]}
        />
      </LegalSection>

      <LegalSection id="prenotazioni" number="07" title="Come funziona una prenotazione">
        <p>
          L’invio di una richiesta tramite Paideio non è una prenotazione confermata né un
          acquisto. La richiesta resta in attesa finché il coach non la accetta o la rifiuta;
          l’accettazione da parte del coach perfeziona l’accordo tra voi due, non con Paideio.
        </p>
        <p>
          Uno stesso orario può ospitare una lezione singola in esclusiva oppure una lezione
          di gruppo condivisa fino al numero di posti stabilito dal coach. Quando i posti si
          esauriscono, l’orario non è più prenotabile.
        </p>
        <p>
          Nessun pagamento avviene attraverso Paideio. Modalità, importo e tempi del pagamento
          sono concordati direttamente con il coach.
        </p>
      </LegalSection>

      <LegalSection id="annullamenti" number="08" title="Annullamenti">
        <p>
          Il giocatore può annullare una richiesta o una lezione confermata dalla propria area
          prenotazioni. Il coach può rifiutare una richiesta o annullare una lezione già
          confermata. In entrambi i casi la controparte riceve una notifica.
        </p>
        <p>
          Eventuali conseguenze economiche di un annullamento tardivo riguardano il rapporto
          diretto tra giocatore e coach: Paideio non applica penali, non trattiene importi e
          non arbitra tra le parti.
        </p>
      </LegalSection>

      <LegalSection id="recensioni" number="09" title="Recensioni e contenuti">
        <p>
          Un giocatore può recensire una lezione confermata e già svolta. Le recensioni devono
          riferirsi a un’esperienza reale ed essere pertinenti. Non sono ammessi contenuti
          diffamatori, discriminatori, ingannevoli o lesivi della riservatezza altrui.
        </p>
        <p>
          Resti titolare dei contenuti che pubblichi e ci concedi una licenza non esclusiva e
          gratuita per mostrarli nell’ambito del servizio. Possiamo rimuovere contenuti che
          violino questi termini o la legge, informandone l’autore.
        </p>
      </LegalSection>

      <LegalSection id="responsabilita" number="10" title="Responsabilità">
        <p>
          Ogni coach risponde della propria attività, delle informazioni che pubblica e dei
          danni che ne derivino. Paideio non risponde della qualità, sicurezza o legittimità
          delle lezioni, né di danni, infortuni o inadempimenti verificatisi nel rapporto tra
          giocatore e coach.
        </p>
        <p>
          Ci impegniamo a mantenere il servizio funzionante ma non ne garantiamo la
          disponibilità ininterrotta né l’assenza di errori. Possiamo sospenderlo per
          manutenzione o ragioni tecniche.
        </p>
        <LegalHighlight>
          Nessuna clausola di questi termini esclude o limita la responsabilità che, secondo
          la legge applicabile, non può essere esclusa o limitata — in particolare nei
          confronti dei consumatori e nei casi di dolo o colpa grave.
        </LegalHighlight>
      </LegalSection>

      <LegalSection id="sospensione" number="11" title="Sospensione e chiusura">
        <p>
          Puoi chiudere il tuo account in qualsiasi momento. Possiamo sospendere o chiudere un
          account in caso di violazione di questi termini, di dichiarazioni false o di
          condotte che mettano a rischio altri utenti, dandone comunicazione all’interessato.
        </p>
      </LegalSection>

      <LegalSection id="modifiche" number="12" title="Modifiche ai termini">
        <p>
          Possiamo aggiornare questi termini per ragioni normative, tecniche o di evoluzione
          del servizio. Le modifiche rilevanti sono comunicate con ragionevole preavviso; la
          data in cima alla pagina indica sempre l’ultima versione. Continuare a usare Paideio
          dopo l’entrata in vigore vale come accettazione.
        </p>
      </LegalSection>

      <LegalSection id="legge" number="13" title="Legge applicabile e foro">
        <p>
          Questi termini sono regolati dalla legge italiana. Se sei un consumatore, per le
          controversie è competente il giudice del luogo in cui risiedi o hai eletto
          domicilio, come previsto dal Codice del Consumo. Negli altri casi è competente il
          foro del luogo di domicilio del titolare del servizio.
        </p>
        <p>
          Se sei un consumatore puoi ricorrere alla piattaforma europea di risoluzione delle
          controversie online, oltre ai normali mezzi di tutela.
        </p>
      </LegalSection>

      <LegalSection id="contatti" number="14" title="Contatti">
        <p>
          Per domande su questi termini scrivi a{" "}
          <a
            href="mailto:info@playpaideio.com"
            className="text-accent-cyan-ink underline underline-offset-4"
          >
            info@playpaideio.com
          </a>
          . Il trattamento dei dati personali è descritto nella{" "}
          <Link
            href="/privacy"
            className="text-accent-cyan-ink underline underline-offset-4"
          >
            informativa privacy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
