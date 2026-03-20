import type { Metadata } from "next";
import { SiteNav } from "@/components/landing/site-nav";
import { buildPageMetadata } from "@/lib/seo";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const DISCORD_URL = "https://discord.gg/CSphbTk8En";

export const metadata: Metadata = buildPageMetadata({
  title: "Manifestet",
  description: "Öppet för alla. Ägt av ingen. Bygg AI-agenter. Tillsammans.",
  path: "/manifest",
});

export default function ManifestPage() {
  const url = absoluteUrl("/manifest");
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Manifestet — opensverige",
    description:
      "Öppet för alla. Ägt av ingen. Bygg AI-agenter. Tillsammans.",
    url,
    datePublished: "2026-01-01",
    dateModified: new Date().toISOString().slice(0, 10),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Starta en nod — så kör du opensverige i din stad",
    description:
      "Hitta en plats, sätt ett datum, och kör formatet: Fika, bygg och show & tell.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Hitta en plats",
        text: "Café, coworking, park eller bibliotek — vad som helst som funkar.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Sätt ett datum",
        text: "Lägg upp datumet i Discord under din stads kanal.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Dyk upp (även om ni är tre)",
        text: "Det räcker att ni är tre första gången — sen kör vi formatet.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Kör formatet",
        text: "Fika, bygg, show & tell. Halvfärdigt är standard. Trasigt är välkommet.",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Upprepa",
        text: "När ni kört klart: kör igen och bygg momentum lokalt.",
      },
    ],
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, item: { "@id": absoluteUrl("/"), name: "Hem" } },
      { "@type": "ListItem", position: 2, item: { "@id": url, name: "Manifest" } },
    ],
  };

  return (
    <main className="min-h-screen">
      <div className="page">
        <SiteNav />

        <article className="manifest-doc">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(breadcrumbsSchema),
            }}
          />
          <header className="manifest-masthead">
            <div className="manifest-domain">opensverige.se</div>
            <h1>Manifest</h1>
          </header>

          <p>Vi är en öppen community för folk som bygger med AI i Sverige.</p>
          <p style={{ color: "var(--text-secondary)" }}>
            English: opensverige is an open community for people building AI agents in Sweden.
            We share progress openly and meet offline to build together.
          </p>
          <p>Inga titlar. Inga sponsorpitchar. Inga slides med företagsloggor.</p>
          <p>Bara människor som vill sitta ner, bygga saker, och dela med sig av vad de lär sig.</p>

          <section>
            <h2>Vad vi tror på</h2>
            <div className="manifest-principle">
              <strong>Öppenhet framför exklusivitet.</strong>
              Allt vi gör är öppet. Koden, samtalen, kunskapen. Du behöver inte jobba på ett techbolag eller ha en CS-examen. Har du en idé och en laptop? Välkommen.
            </div>
            <div className="manifest-principle">
              <strong>Builders, inte talkers.</strong>
              Vi värderar folk som skickar, testar, misslyckas och itererar. En halvfärdig prototyp säger mer än en perfekt pitch deck.
            </div>
            <div className="manifest-principle">
              <strong>Transparens som default.</strong>
              Vi delar våra projekt öppet — inklusive det som inte funkar. Ingen fejkar att de har allt under kontroll. Vi lär oss snabbare när vi är ärliga.
            </div>
            <div className="manifest-principle">
              <strong>Människor först.</strong>
              AI gör oss mer produktiva. Men det gör oss också mer isolerade. Hela poängen med att ses IRL är att motverka det. Fika &gt; Slack. Ögonkontakt &gt; emoji-reaktioner.
            </div>
            <div className="manifest-principle">
              <strong>Anti-corporate, pro-community.</strong>
              Vi har inget emot företag. Men vi är inte ett företags community. Ingen äger det här. Ingen säljer något. Vi dyker upp för att vi vill, inte för att någon betalar oss.
            </div>
          </section>

          <section>
            <h2>Vad opensverige ÄR</h2>
            <ul>
              <li>Ett ställe att sitta och jobba på sina AI-projekt, ihop med andra</li>
              <li>En community där du kan visa vad du bygger utan att det behöver vara klart</li>
              <li>Meetups som känns som fika, inte som konferenser</li>
              <li>Öppet för alla nivåer — från &quot;jag promptade min första app igår&quot; till &quot;jag tränar modeller&quot;</li>
              <li>Ett nätverk som faktiskt hjälper varandra, inte bara samlar LinkedIn-kontakter</li>
            </ul>
          </section>

          <section>
            <h2>Vad opensverige INTE är</h2>
            <ul>
              <li>En startup-pitch-arena</li>
              <li>En rekryteringskanal</li>
              <li>Ännu en meetup med en sponsor som vill ha 20 min på scenen</li>
              <li>Corporate innovation theater</li>
              <li>Exklusivt</li>
            </ul>
          </section>

          <section>
            <h2>Två ben</h2>
            <p>opensverige lever på två ställen: online och IRL. Båda behövs. Discord för det dagliga. Fysiska träffar för det som skärmar inte kan ge dig.</p>
            <h3>🟢 Discord — alltid på</h3>
            <p>Det asynkrona hemmet. Här delar du vad du bygger, ställer frågor, hittar folk att samarbeta med. Inga regler om att vara aktiv — dyk in när du behöver, försvinn när du bygger.</p>
            <p>Kanaler som #vad-bygger-du, #show-and-tell, #hjälp, och lokala kanaler för städer som vill starta egna träffar.</p>
            <h3>🟠 IRL-sessioner — bygg ihop</h3>
            <p>Det här är kärnan. Vi ses, vi sitter ner, vi bygger. Inga föreläsningar, bara fokuserad arbetstid tillsammans med demos på slutet.</p>
            <p><strong>Formatet:</strong></p>
            <ol className="manifest-format">
              <li><strong>Fika &amp; intros</strong> (15 min) — Säg hej. Berätta vad du ska jobba på idag. En mening räcker.</li>
              <li><strong>Byggsession 1</strong> (50 min) — Fokuserad arbetstid. Headphones in, huvudet ner.</li>
              <li><strong>Paus</strong> (10 min) — Sträck på dig. Snacka. Byt idéer.</li>
              <li><strong>Byggsession 2</strong> (50 min) — Fortsätt. Fråga grannen om du kör fast.</li>
              <li><strong>Show &amp; tell</strong> (20 min) — Visa vad du gjort. 30 sekunder till 3 minuter. Halvfärdigt är standard. Trasigt är välkommet. Ingen PowerPoint.</li>
            </ol>
            <p>Totalt: ~2,5 timmar. Tillräckligt för att få något gjort. Kort nog att det inte äter hela dagen.</p>
            <p>Vem som helst kan starta en nod i sin stad. Vi delar formatet öppet. Allt du behöver är en plats, en tid, och ett par personer som dyker upp.</p>
          </section>

          <section>
            <h2>Lokaler — eller inga lokaler alls</h2>
            <p>Vi äger ingen lokal. Vi behöver ingen.</p>
            <h3>Inomhus</h3>
            <p>Coworking-spaces, caféer, bibliotek, universitetslokaler, företagskontor som står tomma på kvällar. Många coworking-spaces erbjuder gratis utrymme till communities i utbyte mot att visa upp sin lokal. Det är inte sponsring, det är samarbete. De får besökare, vi får ett rum med wifi och stolar.</p>
            <h3>Utomhus</h3>
            <p>En Starlink, ett batteri, en park. Det är allt som krävs. En Starlink-router klarar 128 enheter — vi är 15–20 pers, matten funkar med råge. En portabel powerstation på 256 Wh driver Starlink i över 3 timmar. Har du en större? Då räcker det hela dagen.</p>
            <p>Vibecodea i gräset med solen i ansiktet och en kaffe i handen. Ingen lokal i världen slår det.</p>
            <p>Det här är poängen: opensverige är inte bundet till en plats. Det är bundet till människorna. En Starlink, ett batteri, och en Discord-länk — då kan vi köra var som helst i Sverige.</p>
          </section>

          <section>
            <h2>Starta en nod</h2>
            <p>Du behöver inte fråga om lov. Om du vill köra opensverige i din stad — gör det.</p>
            <p><strong>Så här:</strong></p>
            <ol className="manifest-format">
              <li>Hitta en plats. Café, coworking, park, bibliotek — vad som helst.</li>
              <li>Sätt ett datum. Lägg upp det i Discord under din stads kanal.</li>
              <li>Dyk upp. Även om det bara är tre personer första gången — det räcker.</li>
              <li>Kör formatet. Fika, bygg, show &amp; tell.</li>
              <li>Upprepa.</li>
            </ol>
            <p>Ingen behöver godkänna det. Ingen central organisation bestämmer. Du är opensverige i din stad.</p>
            <p style={{ marginTop: "var(--sp-6)" }}>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn btn-nordic">Läs guiden i Discord →</a>
            </p>
          </section>

          <section>
            <h2>Principer för hur vi kör</h2>
            <ol className="manifest-format">
              <li><strong>Alla bidrar, ingen konsumerar.</strong> Du behöver inte presentera. Men du bör vara redo att svara om någon frågar vad du håller på med.</li>
              <li><strong>Default open.</strong> Projekt, kod, lärdomar — vi delar öppet om vi kan. Respekt för de som inte kan dela allt, men kulturen är öppen.</li>
              <li><strong>Håll det enkelt.</strong> Få regler. Ingen byråkrati. Om något behöver göras, gör det. Om det behöver ändras, säg till.</li>
              <li><strong>Respekt.</strong> Vi är vuxna människor. Var schysst. Lyssna. Ge plats.</li>
              <li><strong>Alla är värdar.</strong> Det här är ingen konferens med arrangörer och publik. Alla ansvarar för stämningen. Ser du någon ny? Säg hej. Ser du någon som kört fast? Erbjud hjälp.</li>
            </ol>
          </section>

          <section>
            <h2>Varför nu</h2>
            <p>AI förändrar allt — hur vi jobbar, bygger, tänker. Sverige har massa duktiga folk men communityn är splittrad mellan corporate-event, akademiska konferenser och LinkedIn-poster.</p>
            <p>Det saknas ett ställe där vanliga builders bara kan ses och bygga ihop. Inte för att nätverka. Inte för att bli rekryterade. Utan för att det är roligare att bygga tillsammans än ensam framför skärmen.</p>
            <p>Det är opensverige.</p>
          </section>

          <p className="manifest-signoff">Öppet för alla. Ägt av ingen. Byggt av oss.</p>
          <p style={{ color: "var(--text-secondary)", marginTop: 6, fontSize: 14 }}>
            Skapad av opensverige community.
          </p>
          <div className="manifest-signoff-cta">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: "var(--sp-2) var(--sp-5)", fontSize: "13px" }}>Gå med i Discord →</a>
          </div>
          <div className="manifest-domain-end">opensverige.se</div>
        </article>

        <div className="site-footer-bar">
          © {new Date().getFullYear()} opensverige. Öppet för alla. Ägt av ingen. Byggt av oss.
        </div>
      </div>
    </main>
  );
}
