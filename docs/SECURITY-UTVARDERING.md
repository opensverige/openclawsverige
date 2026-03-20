# Utvärdering: Vad vi åtgärdat och var problemen låg

## Två olika repon

| Repo | Innehåll |
|------|----------|
| **opensverige/openclawsverige** | Community-sajt: landningssida, blogg, manifest, Agent Radar. Det här repot vi jobbat i. |
| **opensverige/openscore** | Fristående app för idévalvering (OpenScore): Next 16, Supabase, OpenAI. Eget repo. |

Alla fel och säkerhetsåtgärder nedan gällde **openclawsverige** (community-sajten). Inget av det här kommer från koden i **openscore**-repot.

---

## Vad vi åtgärdat (i openclawsverige)

### 1. Dependabot / säkerhetsuppdateringar (package.json + lockfile)

- **Next.js** – Uppgradering 14.2.18 → 14.2.25 → 14.2.35, sedan **15.5.10** (CVE-2026-23864, middleware bypass, SSRF, DoS Server Components, Image Optimizer m.m.). **Orsak:** Gamla versioner av Next i vårt eget repo.
- **minimatch** – ReDoS (GLOBSTAR). **Orsak:** Transitiv dependency (eslint, eslint-config-next) i openclawsverige. Fix: `overrides` i package.json.
- **glob** – CLI command injection. **Orsak:** Samma, transitiv dependency. Fix: `overrides` i package.json.
- **React 19** – Krävdes för Next 15; vi uppgraderade och fixade typfel (pre-with-copy, steps, slugify).

Inget av detta orsakades av eller finns i **openscore**-repot.

### 2. Stored XSS (CodeQL #3) – blogg prev/next

- **Problem:** Lagrad data (prev/next title och slug från blogfrontmatter) användes i sidan utan synlig sanitering.
- **Åtgärd:** `sanitizePathSegment()` och `sanitizeForDisplay()` i `lib/slugify.ts`, används i `app/blogg/[slug]/page.tsx`.
- **Orsak:** Vår egen bloggkod i openclawsverige. Övriga sajter (t.ex. openscore) påverkas inte.

### 3. Vercel deploy – “hittar inget” / 404

- **Problem:** Bygget lyckades men deployment-sida 404 eller fel repo byggdes.
- **Orsak:** Vercel var kopplat till **fel repo** (t.ex. Baltsar/openclawsverige_public) eller gammal commit. Inte openscore.
- **Åtgärd:** Tydlig `vercel.json` (framework, buildCommand, installCommand), DEPLOY.md och README med steg för att koppla **opensverige/openclawsverige** och redeploya.

### 4. Killmyidea/OpenScore borttaget från openclawsverige

- **Vad:** Vi tog bort hela Killmyidea/OpenScore från **openclawsverige** (app/killmyidea, app/api/score, app/api/prompt, app/api/history, lib/openscore, Supabase/OpenAI-deps) så att community-sajten skulle bygga och deploya utan Supabase/OpenAI.
- **Varför:** För att förenkla deploy och undvika build-fel när env saknades. OpenScore-appen lever kvar i sitt **eget** repo: **opensverige/openscore**.

---

## Granskning av opensverige/openscore (malicious kod?)

Granskat innehåll från [opensverige/openscore](https://github.com/opensverige/openscore):

- **Struktur:** Next.js 16, React 19, Supabase, OpenAI. App Router, API-routes (score, history, prompt), lib (openscore, research, server-clients, supabase-browser), Supabase-migrationer.
- **app/lib/server-clients.ts** – Läser endast `process.env` (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY), skapar Supabase- och OpenAI-klienter. Ingen exfiltrering, ingen `eval`, inga anrop till okända URL:er.
- **app/lib/supabase-browser.ts** – Vanlig browser-klient med env. Inget misstänkt.
- **app/lib/research.ts** – Använder endast OpenAI-klienten (`openai.responses.create` / `stream` med `web_search_preview`). Inga egna `fetch` till externa domäner, ingen dynamisk kodkörning.
- **app/api/score/start/route.ts** – Auth med Bearer-token, validering av input, insert mot Supabase. Standardmönster.

**Slutsats:** Inga tecken på skadlig kod i openscore. Inga `eval`/`Function`, ingen exfiltrering av secrets, inga misstänkta fetch/WebSocket-URL:er. En vanlig Next.js-app som använder Supabase och OpenAI enligt README.

---

## Sammanfattning

| Fråga | Svar |
|-------|------|
| Vem orsakade Dependabot/säkerhetsproblemen? | **Openclawsverige** (gamla dependencies och egen kod). Inte openscore-repot. |
| Var ligger övriga buggar (XSS, deploy)? | I **openclawsverige** (blogg, Vercel-koppling). |
| Innehåller openscore-repot skadlig kod? | **Nej.** Granskningen hittade inget misstänkt; standard Next/Supabase/OpenAI-användning. |

Datum: 2026-03-10 (efter genomförda åtgärder).
