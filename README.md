# OpenSverige

Grassroots-community för svenska AI-builders.

[opensverige.se](https://opensverige.se) · [Discord](https://discord.gg/CSphbTk8En)

---

## Vad det här är

OpenSverige är där svenska utvecklare bygger med AI – agenter, multi-agent-system, self-hosted modeller, MCP-servrar. Tool-agnostisk. Ägd av ingen.

Det etablerade Sverige har AI Sweden. Grassroots-Sverige har oss.

~350 medlemmar på Discord. 5-20 aktiva varje vecka. Fler builders än talare.

## Fokus

- **AI-agenter och multi-agent-system** – CrewAI, AutoGen, LangGraph, MCP, egna ramverk.
- **Svenska integrationer** – Fortnox, BankID, Skatteverket, Swish, SIE, ISO 20022.
- **Self-hosted och open source** – Inga vendor lock-ins, inga black boxes.
- **Praktiskt > teoretiskt** – Vi shippar. Sen skriver vi om det.

## Vad som händer

- **Onsdagar kl 20** – Podcast. Live-recording, öppet för alla.
- **Söndagar** – IRL-hack i Stockholm. Ta med laptop.
- **Löpande** – Rapporter och experiment på [opensverige.se/lab](https://opensverige.se/lab).

## Pågående projekt

- **[agent.opensverige.se](https://agent.opensverige.se)** – AI agent readiness scanner för svenska bolag.
- **Gollum-testet** – Diagnostik: hoardar du eller shippar du?
- **NäckenGuard** – PII-maskering för Fortnox via MCP.
- **SideDoor** – MCP för dolda jobbmöjligheter på svenska arbetsmarknaden.
- **OpenSverige Lab** – Delade API-nycklar för builders som behöver testa.

## /lab

[opensverige.se/lab](https://opensverige.se/lab) är community-experimentsidan. Den visar vad vi faktiskt bygger, inte vad vi planerar att bygga.

**Vad som kvalificerar:**
- Fungerande repo (eller deployad app)
- En kort, ärlig beskrivning av vad det gör och varför
- Öppen källkod (eller tydlig förklaring till varför inte)

**Hur du lägger till ett projekt:**
1. Öppna ett issue på [opensverige/openclawsverige](https://github.com/opensverige/openclawsverige) med title `[lab] Projektnamn`
2. Fyll i: slug, status (live/wip/idé), tagline, tags, stackbeskrivning, länk till repo/live
3. En maintainer granskar och lägger till det

Eller pinga direkt i `#lab` på Discord.

## Principer

Bygga > snacka. Öppet > gated. Svenska villkor > generiska lösningar. Grassroots > topdown.

## Kom igång

Joina Discorden. Säg hej. Berätta vad du bygger.

[discord.gg/CSphbTk8En](https://discord.gg/CSphbTk8En)

---

## Utveckling

```bash
npm install
npm run dev
```

### Deploy (Vercel)

1. Repo: `opensverige/openclawsverige`
2. Root directory: lämna tomt
3. Deployments → Redeploy → "Clear cache and redeploy"
4. Använd produktions-URL, inte deployment-länk

Om deployment-sidan visar 404 men bygget gick igenom – öppna produktions-URL direkt.

### Databas

Nya tabeller prefixas `opensverige_`.

## Licens

MIT.
