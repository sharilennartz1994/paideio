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
  LegalTable,
} from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Informativa privacy — Paideio",
  description:
    "Quali dati personali tratta Paideio, per quali finalità, con quali fornitori e quali diritti puoi esercitare.",
};

const UPDATED_AT = "28 luglio 2026";

const INDEX = [
  { id: "titolare", label: "Titolare del trattamento" },
  { id: "dati", label: "Quali dati trattiamo e perché" },
  { id: "posizione", label: "Posizione geografica" },
  { id: "fornitori", label: "Fornitori che trattano i dati" },
  { id: "estero", label: "Dove sono conservati i tuoi dati" },
  { id: "conservazione", label: "Per quanto tempo li conserviamo" },
  { id: "cookie", label: "Cookie e memoria del browser" },
  { id: "diritti", label: "I tuoi diritti" },
  { id: "minori", label: "Minori" },
  { id: "modifiche", label: "Modifiche all’informativa" },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Documenti · Paideio"
      title="Informativa privacy"
      intro="Come Paideio tratta i tuoi dati personali, ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679."
      updatedAt={UPDATED_AT}
    >
      <LegalDraftBanner />
      <LegalIndex items={INDEX} />

      <LegalSection id="titolare" number="01" title="Titolare del trattamento">
        <p>
          Titolare del trattamento è Shari Lennartz, persona fisica, con domicilio in Via
          Reggio Emilia 5, 09028 Sestu (CA).
        </p>
        <p>
          Per esercitare i tuoi diritti o per qualsiasi domanda sul trattamento puoi scrivere
          a{" "}
          <a
            href="mailto:info@playpaideio.com"
            className="text-accent-cyan-ink underline underline-offset-4"
          >
            info@playpaideio.com
          </a>
          . Non è stato designato un Responsabile della protezione dei dati: il trattamento
          non rientra nei casi in cui l’articolo 37 del GDPR lo rende obbligatorio.
        </p>
      </LegalSection>

      <LegalSection id="dati" number="02" title="Quali dati trattiamo e perché">
        <p>
          Trattiamo solo i dati necessari a far funzionare il servizio. Non facciamo
          profilazione pubblicitaria e non vendiamo dati a terzi.
        </p>
        <LegalTable
          caption="Categorie di dati, finalità, base giuridica"
          head={["Dati", "Finalità", "Base giuridica"]}
          rows={[
            [
              "Nome, indirizzo email, credenziali",
              "Creazione e gestione dell’account, autenticazione",
              "Esecuzione del contratto (art. 6.1.b)",
            ],
            [
              "Ruolo (giocatore o coach)",
              "Determinare le funzioni disponibili",
              "Esecuzione del contratto (art. 6.1.b)",
            ],
            [
              "Profilo coach: biografia, livelli, tipo di allenamento, prezzo, posti per lezione di gruppo, foto",
              "Pubblicazione dell’annuncio consultabile dai giocatori",
              "Esecuzione del contratto (art. 6.1.b)",
            ],
            [
              "Campi di allenamento: nome, indirizzo, città, coordinate",
              "Mostrare dove si svolgono le lezioni e permettere la ricerca per zona",
              "Esecuzione del contratto (art. 6.1.b)",
            ],
            [
              "Prenotazioni: data, orario, campo, tipo di lezione, livello, note",
              "Gestire richieste, conferme e annullamenti",
              "Esecuzione del contratto (art. 6.1.b)",
            ],
            [
              "Recensioni e valutazioni",
              "Permettere ai giocatori di condividere l’esperienza",
              "Esecuzione del contratto (art. 6.1.b)",
            ],
            [
              "Coach preferiti",
              "Ritrovare rapidamente i coach salvati",
              "Esecuzione del contratto (art. 6.1.b)",
            ],
            [
              "Notifiche in-app",
              "Informare su nuove richieste, conferme e annullamenti",
              "Esecuzione del contratto (art. 6.1.b)",
            ],
            [
              "Segnalazioni e proposte: nome, email, categoria, messaggio",
              "Rispondere alla segnalazione e migliorare il servizio",
              "Legittimo interesse al miglioramento del prodotto (art. 6.1.f)",
            ],
          ]}
        />
        <p>
          Il campo note di una prenotazione e il testo di una segnalazione sono a compilazione
          libera: ti chiediamo di non inserirvi dati sanitari o altre informazioni delicate.
          Se ritieni rilevante una condizione di salute per l’allenamento, parlane
          direttamente con il coach.
        </p>
      </LegalSection>

      <LegalSection id="posizione" number="03" title="Posizione geografica">
        <p>
          La ricerca «vicino a me» usa la posizione fornita dal browser, solo su tua richiesta
          esplicita e previo consenso del browser stesso. La posizione serve a ordinare i
          risultati per distanza e non viene salvata nei nostri archivi né associata al tuo
          account.
        </p>
        <LegalHighlight>
          La posizione è arrotondata a circa un chilometro prima di essere usata, non compare
          mai nell’indirizzo della pagina e resta in un cookie tecnico di sessione, che il
          browser elimina alla chiusura. Puoi disattivarla in qualsiasi momento dal pulsante
          nella pagina di ricerca.
        </LegalHighlight>
        <p>
          L’arrotondamento è voluto: la ricerca lavora su un raggio di decine di chilometri,
          quindi una precisione maggiore non servirebbe e permetterebbe di risalire a un
          indirizzo preciso.
        </p>
        <p>
          Le coordinate dei campi di allenamento sono invece inserite dai coach e riferite a
          strutture sportive, non a persone.
        </p>
      </LegalSection>

      <LegalSection id="fornitori" number="04" title="Fornitori che trattano i dati">
        <p>
          Ci avvaliamo di fornitori che trattano dati per nostro conto in qualità di
          responsabili del trattamento, vincolati da accordi ai sensi dell’art. 28 GDPR.
        </p>
        <LegalTable
          caption="Fornitori e ruolo"
          head={["Fornitore", "Cosa tratta", "Ruolo"]}
          rows={[
            ["Clerk", "Registrazione, accesso, credenziali", "Autenticazione"],
            ["Neon", "Database del servizio", "Archiviazione dati"],
            ["Vercel", "Hosting dell’applicazione e archiviazione delle foto profilo", "Infrastruttura"],
            ["Resend", "Invio delle email di segnalazione, se attivo", "Posta elettronica"],
          ]}
        />
        <p>
          I dati possono inoltre essere comunicati a consulenti o autorità quando previsto
          dalla legge. Fuori da questi casi non sono ceduti a terzi.
        </p>
        <p>
          <Da>
            Verificare che sia stato sottoscritto un accordo sul trattamento dei dati con
            ciascun fornitore e allinearne l’elenco prima della pubblicazione.
          </Da>
        </p>
      </LegalSection>

      <LegalSection id="estero" number="05" title="Dove sono conservati i tuoi dati">
        <LegalHighlight>
          Il database che contiene account, profili, prenotazioni e recensioni è ospitato
          nell’Unione europea, in Germania (Francoforte).
        </LegalHighlight>
        <p>
          Alcuni fornitori indicati sopra hanno però sede negli Stati Uniti: per le funzioni
          che svolgono — autenticazione, hosting dell’applicazione, invio delle email — un
          trasferimento di dati fuori dallo Spazio economico europeo può comunque avvenire.
        </p>
        <p>
          Un trasferimento del genere è lecito solo in presenza di adeguate garanzie: adesione
          del fornitore al quadro di protezione dei dati UE-USA, oppure clausole contrattuali
          standard approvate dalla Commissione europea.
        </p>
        <p>
          <Da>
            Da completare prima della pubblicazione: verificare per Clerk, Vercel e Resend
            quale garanzia sia in essere e indicarla qui.
          </Da>
        </p>
      </LegalSection>

      <LegalSection id="conservazione" number="06" title="Per quanto tempo li conserviamo">
        <p>
          Conserviamo ogni dato solo per il tempo necessario alla finalità per cui è stato
          raccolto, come richiede il principio di limitazione della conservazione (art. 5.1.e
          del GDPR).
        </p>
        <LegalTable
          caption="Tempi di conservazione per categoria di dato"
          head={["Dato", "Per quanto", "Perché"]}
          rows={[
            [
              "Account e profilo coach",
              "Finché l’account è attivo",
              "Servono a erogare il servizio: senza, l’account non esiste",
            ],
            [
              "Prenotazioni",
              "Finché l’account è attivo, poi in forma anonima",
              "Sono lo storico del rapporto tra giocatore e coach; una volta anonime non sono più dati personali",
            ],
            [
              "Recensioni",
              "Finché l’account è attivo, poi in forma anonima",
              "Rimuoverle altererebbe la valutazione complessiva del coach recensito",
            ],
            [
              "Coach preferiti",
              "Finché non li rimuovi o chiudi l’account",
              "Sono una tua preferenza, revocabile in ogni momento",
            ],
            [
              "Notifiche",
              "12 mesi",
              "Hanno valore operativo e non storico: dopo un anno non servono più",
            ],
            [
              "Segnalazioni e proposte",
              "24 mesi dall’invio",
              "È l’orizzonte entro cui una proposta viene valutata o scartata",
            ],
          ]}
        />
        <p>
          Alla chiusura dell’account i dati collegati sono cancellati entro 30 giorni. Il
          margine serve a propagare la cancellazione anche alle copie di sicurezza, che
          ruotano periodicamente.
        </p>
        <LegalHighlight>
          Fa eccezione ciò che dobbiamo conservare più a lungo per un obbligo di legge o per
          difendere un diritto in giudizio: in quel caso il dato è conservato solo per quella
          finalità, e non è più usato per il funzionamento del servizio.
        </LegalHighlight>
      </LegalSection>

      <LegalSection id="cookie" number="07" title="Cookie e memoria del browser">
        <p>
          Paideio non usa cookie di profilazione né strumenti pubblicitari o di analisi di
          terze parti.
        </p>
        <LegalList
          items={[
            "Cookie tecnici di sessione, necessari a mantenerti autenticato: senza di essi il servizio non può funzionare e non richiedono consenso.",
            "Un cookie tecnico di sessione con la posizione approssimata, creato solo se attivi la ricerca «vicino a me» e cancellabile in ogni momento dalla pagina di ricerca.",
            "Una preferenza salvata nella memoria locale del browser per ricordare se usi il tema chiaro o scuro. Non è un identificativo e non lascia il tuo dispositivo.",
          ]}
        />
      </LegalSection>

      <LegalSection id="diritti" number="08" title="I tuoi diritti">
        <p>
          In qualsiasi momento puoi esercitare i diritti previsti dagli articoli 15-22 del
          GDPR.
        </p>
        <LegalList
          items={[
            "Accedere ai tuoi dati e ottenerne copia.",
            "Chiederne la rettifica se inesatti o incompleti.",
            "Chiederne la cancellazione.",
            "Chiedere la limitazione del trattamento.",
            "Ricevere i dati in formato strutturato e trasferirli a un altro titolare.",
            "Opporti ai trattamenti fondati sul legittimo interesse.",
          ]}
        />
        <p>
          Per esercitarli scrivi a{" "}
          <a
            href="mailto:info@playpaideio.com"
            className="text-accent-cyan-ink underline underline-offset-4"
          >
            info@playpaideio.com
          </a>
          . Ti risponderemo entro un mese. Se ritieni che il trattamento violi la normativa
          puoi proporre reclamo al Garante per la protezione dei dati personali.
        </p>
      </LegalSection>

      <LegalSection id="minori" number="09" title="Minori">
        <p>
          Il servizio è rivolto a persone maggiorenni. Non raccogliamo consapevolmente dati di
          minori di 18 anni: se ne venissimo a conoscenza, provvederemmo alla cancellazione.
        </p>
      </LegalSection>

      <LegalSection id="modifiche" number="10" title="Modifiche all’informativa">
        <p>
          Questa informativa può essere aggiornata quando cambiano il servizio, i fornitori o
          la normativa. La data in cima alla pagina indica sempre l’ultima versione; le
          modifiche rilevanti sono comunicate con ragionevole preavviso.
        </p>
        <p>
          Le condizioni d’uso del servizio sono nei{" "}
          <Link
            href="/termini"
            className="text-accent-cyan-ink underline underline-offset-4"
          >
            Termini di servizio
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
