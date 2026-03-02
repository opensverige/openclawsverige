import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/landing/site-nav";
import { buildPageMetadata } from "@/lib/seo";

const DISCORD_URL = "https://discord.gg/CSphbTk8En";

export const metadata: Metadata = buildPageMetadata({
  title: "Manifestet",
  description: "Oppet for alla. Agt av ingen. Bygg AI-agenter. Tillsammans.",
  path: "/manifest",
});

export default function ManifestPage() {
  return (
    <main className="min-h-screen">
      <div className="page">
        <SiteNav />

        <article className="manifest-doc">
          <header className="manifest-masthead">
            <div className="manifest-domain">opensverige.se</div>
            <h1>Manifest</h1>
          </header>

          <p>Vi Ã¤r en Ã¶ppen community fÃ¶r folk som bygger med AI i Sverige.</p>
          <p>Inga titlar. Inga sponsorpitchar. Inga slides med fÃ¶retagsloggor.</p>
          <p>Bara mÃ¤nniskor som vill sitta ner, bygga saker, och dela med sig av vad de lÃ¤r sig.</p>

          <section>
            <h2>Vad vi tror pÃ¥</h2>
            <div className="manifest-principle">
              <strong>Ã–ppenhet framfÃ¶r exklusivitet.</strong>
              Allt vi gÃ¶r Ã¤r Ã¶ppet. Koden, samtalen, kunskapen. Du behÃ¶ver inte jobba pÃ¥ ett techbolag eller ha en CS-examen. Har du en idÃ© och en laptop? VÃ¤lkommen.
            </div>
            <div className="manifest-principle">
              <strong>Builders, inte talkers.</strong>
              Vi vÃ¤rderar folk som skickar, testar, misslyckas och itererar. En halvfÃ¤rdig prototyp sÃ¤ger mer Ã¤n en perfekt pitch deck.
            </div>
            <div className="manifest-principle">
              <strong>Transparens som default.</strong>
              Vi delar vÃ¥ra projekt Ã¶ppet â€” inklusive det som inte funkar. Ingen fejkar att de har allt under kontroll. Vi lÃ¤r oss snabbare nÃ¤r vi Ã¤r Ã¤rliga.
            </div>
            <div className="manifest-principle">
              <strong>MÃ¤nniskor fÃ¶rst.</strong>
              AI gÃ¶r oss mer produktiva. Men det gÃ¶r oss ocksÃ¥ mer isolerade. Hela poÃ¤ngen med att ses IRL Ã¤r att motverka det. Fika &gt; Slack. Ã–gonkontakt &gt; emoji-reaktioner.
            </div>
            <div className="manifest-principle">
              <strong>Anti-corporate, pro-community.</strong>
              Vi har inget emot fÃ¶retag. Men vi Ã¤r inte ett fÃ¶retags community. Ingen Ã¤ger det hÃ¤r. Ingen sÃ¤ljer nÃ¥got. Vi dyker upp fÃ¶r att vi vill, inte fÃ¶r att nÃ¥gon betalar oss.
            </div>
          </section>

          <section>
            <h2>Vad opensverige Ã„R</h2>
            <ul>
              <li>Ett stÃ¤lle att sitta och jobba pÃ¥ sina AI-projekt, ihop med andra</li>
              <li>En community dÃ¤r du kan visa vad du bygger utan att det behÃ¶ver vara klart</li>
              <li>Meetups som kÃ¤nns som fika, inte som konferenser</li>
              <li>Ã–ppet fÃ¶r alla nivÃ¥er â€” frÃ¥n &quot;jag promptade min fÃ¶rsta app igÃ¥r&quot; till &quot;jag trÃ¤nar modeller&quot;</li>
              <li>Ett nÃ¤tverk som faktiskt hjÃ¤lper varandra, inte bara samlar LinkedIn-kontakter</li>
            </ul>
          </section>

          <section>
            <h2>Vad opensverige INTE Ã¤r</h2>
            <ul>
              <li>En startup-pitch-arena</li>
              <li>En rekryteringskanal</li>
              <li>Ã„nnu en meetup med en sponsor som vill ha 20 min pÃ¥ scenen</li>
              <li>Corporate innovation theater</li>
              <li>Exklusivt</li>
            </ul>
          </section>

          <section>
            <h2>TvÃ¥ ben</h2>
            <p>opensverige lever pÃ¥ tvÃ¥ stÃ¤llen: online och IRL. BÃ¥da behÃ¶vs. Discord fÃ¶r det dagliga. Fysiska trÃ¤ffar fÃ¶r det som skÃ¤rmar inte kan ge dig.</p>
            <h3>ðŸŸ¢ Discord â€” alltid pÃ¥</h3>
            <p>Det asynkrona hemmet. HÃ¤r delar du vad du bygger, stÃ¤ller frÃ¥gor, hittar folk att samarbeta med. Inga regler om att vara aktiv â€” dyk in nÃ¤r du behÃ¶ver, fÃ¶rsvinn nÃ¤r du bygger.</p>
            <p>Kanaler som #vad-bygger-du, #show-and-tell, #hjÃ¤lp, och lokala kanaler fÃ¶r stÃ¤der som vill starta egna trÃ¤ffar.</p>
            <h3>ðŸŸ  IRL-sessioner â€” bygg ihop</h3>
            <p>Det hÃ¤r Ã¤r kÃ¤rnan. Vi ses, vi sitter ner, vi bygger. Inga fÃ¶relÃ¤sningar, bara fokuserad arbetstid tillsammans med demos pÃ¥ slutet.</p>
            <p><strong>Formatet:</strong></p>
            <ol className="manifest-format">
              <li><strong>Fika &amp; intros</strong> (15 min) â€” SÃ¤g hej. BerÃ¤tta vad du ska jobba pÃ¥ idag. En mening rÃ¤cker.</li>
              <li><strong>Byggsession 1</strong> (50 min) â€” Fokuserad arbetstid. Headphones in, huvudet ner.</li>
              <li><strong>Paus</strong> (10 min) â€” StrÃ¤ck pÃ¥ dig. Snacka. Byt idÃ©er.</li>
              <li><strong>Byggsession 2</strong> (50 min) â€” FortsÃ¤tt. FrÃ¥ga grannen om du kÃ¶r fast.</li>
              <li><strong>Show &amp; tell</strong> (20 min) â€” Visa vad du gjort. 30 sekunder till 3 minuter. HalvfÃ¤rdigt Ã¤r standard. Trasigt Ã¤r vÃ¤lkommet. Ingen PowerPoint.</li>
            </ol>
            <p>Totalt: ~2,5 timmar. TillrÃ¤ckligt fÃ¶r att fÃ¥ nÃ¥got gjort. Kort nog att det inte Ã¤ter hela dagen.</p>
            <p>Vem som helst kan starta en nod i sin stad. Vi delar formatet Ã¶ppet. Allt du behÃ¶ver Ã¤r en plats, en tid, och ett par personer som dyker upp.</p>
          </section>

          <section>
            <h2>Lokaler â€” eller inga lokaler alls</h2>
            <p>Vi Ã¤ger ingen lokal. Vi behÃ¶ver ingen.</p>
            <h3>Inomhus</h3>
            <p>Coworking-spaces, cafÃ©er, bibliotek, universitetslokaler, fÃ¶retagskontor som stÃ¥r tomma pÃ¥ kvÃ¤llar. MÃ¥nga coworking-spaces erbjuder gratis utrymme till communities i utbyte mot att visa upp sin lokal. Det Ã¤r inte sponsring, det Ã¤r samarbete. De fÃ¥r besÃ¶kare, vi fÃ¥r ett rum med wifi och stolar.</p>
            <h3>Utomhus</h3>
            <p>En Starlink, ett batteri, en park. Det Ã¤r allt som krÃ¤vs. En Starlink-router klarar 128 enheter â€” vi Ã¤r 15â€“20 pers, matten funkar med rÃ¥ge. En portabel powerstation pÃ¥ 256 Wh driver Starlink i Ã¶ver 3 timmar. Har du en stÃ¶rre? DÃ¥ rÃ¤cker det hela dagen.</p>
            <p>Vibecodea i grÃ¤set med solen i ansiktet och en kaffe i handen. Ingen lokal i vÃ¤rlden slÃ¥r det.</p>
            <p>Det hÃ¤r Ã¤r poÃ¤ngen: opensverige Ã¤r inte bundet till en plats. Det Ã¤r bundet till mÃ¤nniskorna. En Starlink, ett batteri, och en Discord-lÃ¤nk â€” dÃ¥ kan vi kÃ¶ra var som helst i Sverige.</p>
          </section>

          <section>
            <h2>Starta en nod</h2>
            <p>Du behÃ¶ver inte frÃ¥ga om lov. Om du vill kÃ¶ra opensverige i din stad â€” gÃ¶r det.</p>
            <p><strong>SÃ¥ hÃ¤r:</strong></p>
            <ol className="manifest-format">
              <li>Hitta en plats. CafÃ©, coworking, park, bibliotek â€” vad som helst.</li>
              <li>SÃ¤tt ett datum. LÃ¤gg upp det i Discord under din stads kanal.</li>
              <li>Dyk upp. Ã„ven om det bara Ã¤r tre personer fÃ¶rsta gÃ¥ngen â€” det rÃ¤cker.</li>
              <li>KÃ¶r formatet. Fika, bygg, show &amp; tell.</li>
              <li>Upprepa.</li>
            </ol>
            <p>Ingen behÃ¶ver godkÃ¤nna det. Ingen central organisation bestÃ¤mmer. Du Ã¤r opensverige i din stad.</p>
            <p style={{ marginTop: "var(--sp-6)" }}>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn btn-nordic">LÃ¤s guiden i Discord â†’</a>
            </p>
          </section>

          <section>
            <h2>Principer fÃ¶r hur vi kÃ¶r</h2>
            <ol className="manifest-format">
              <li><strong>Alla bidrar, ingen konsumerar.</strong> Du behÃ¶ver inte presentera. Men du bÃ¶r vara redo att svara om nÃ¥gon frÃ¥gar vad du hÃ¥ller pÃ¥ med.</li>
              <li><strong>Default open.</strong> Projekt, kod, lÃ¤rdomar â€” vi delar Ã¶ppet om vi kan. Respekt fÃ¶r de som inte kan dela allt, men kulturen Ã¤r Ã¶ppen.</li>
              <li><strong>HÃ¥ll det enkelt.</strong> FÃ¥ regler. Ingen byrÃ¥krati. Om nÃ¥got behÃ¶ver gÃ¶ras, gÃ¶r det. Om det behÃ¶ver Ã¤ndras, sÃ¤g till.</li>
              <li><strong>Respekt.</strong> Vi Ã¤r vuxna mÃ¤nniskor. Var schysst. Lyssna. Ge plats.</li>
              <li><strong>Alla Ã¤r vÃ¤rdar.</strong> Det hÃ¤r Ã¤r ingen konferens med arrangÃ¶rer och publik. Alla ansvarar fÃ¶r stÃ¤mningen. Ser du nÃ¥gon ny? SÃ¤g hej. Ser du nÃ¥gon som kÃ¶rt fast? Erbjud hjÃ¤lp.</li>
            </ol>
          </section>

          <section>
            <h2>VarfÃ¶r nu</h2>
            <p>AI fÃ¶rÃ¤ndrar allt â€” hur vi jobbar, bygger, tÃ¤nker. Sverige har massa duktiga folk men communityn Ã¤r splittrad mellan corporate-event, akademiska konferenser och LinkedIn-poster.</p>
            <p>Det saknas ett stÃ¤lle dÃ¤r vanliga builders bara kan ses och bygga ihop. Inte fÃ¶r att nÃ¤tverka. Inte fÃ¶r att bli rekryterade. Utan fÃ¶r att det Ã¤r roligare att bygga tillsammans Ã¤n ensam framfÃ¶r skÃ¤rmen.</p>
            <p>Det Ã¤r opensverige.</p>
          </section>

          <p className="manifest-signoff">Ã–ppet fÃ¶r alla. Ã„gt av ingen. Byggt av oss.</p>
          <div className="manifest-signoff-cta">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: "var(--sp-2) var(--sp-5)", fontSize: "13px" }}>GÃ¥ med i Discord â†’</a>
          </div>
          <div className="manifest-domain-end">opensverige.se</div>
        </article>

        <div className="site-footer-bar">
          Â© {new Date().getFullYear()} opensverige. Ã–ppet fÃ¶r alla. Ã„gt av ingen. Byggt av oss.
        </div>
      </div>
    </main>
  );
}




