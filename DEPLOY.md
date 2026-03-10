# Deploy till Vercel – steg för steg

Projektet bygger med Next.js 15. Det här repot är **opensverige/openclawsverige**. För att Vercel ska hitta och deploya rätt sak måste projektet i Vercel peka hit.

## 1. Koppla rätt GitHub-repo

- Gå till [Vercel Dashboard](https://vercel.com/dashboard) → välj projektet (t.ex. openclawsverige).
- **Settings** → **Git**.
- Under **Connected Git Repository** ska det stå: **opensverige/openclawsverige**.
- Om det står något annat (t.ex. Baltsar/openclawsverige_public):
  - Klicka **Disconnect**.
  - **Connect Git Repository** → välj **opensverige/openclawsverige** (branch `main`).

## 2. Projektinställningar

- **Root Directory:** tom (lämna tomt).
- **Framework Preset:** Next.js (Vercel sätter ofta detta automatiskt).
- **Build Command:** `npm run build` (kan sättas i vercel.json; då används det här).
- **Install Command:** `npm install`.
- **Environment Variables:** inga krävs för att bygget ska lyckas (inga API-nycklar i bygget).

## 3. Deploya

- **Deployments** → **Redeploy** på senaste deployment.
- Välj gärna **Redeploy** med **Clear cache and redeploy**.
- Vänta tills status är **Ready**.

## 4. Öppna sajten

- Använd **Visit**-knappen på den deployment som är **Production** (grön), **eller**
- Öppna din produktions-URL direkt, t.ex. `https://openclawsverige.vercel.app` eller din egen domän.

**OBS:** Om en enskild deployment-sida i Vercel (t.ex. `/4K2LTQNDY`) visar 404: NOT_FOUND är det ofta ett Vercel-gränssnittsproblem. Sajten kan fortfarande fungera – testa alltid **Visit** eller produktions-URL:en.

## Felsökning

- **Bygget failar:** Kontrollera **Deployments** → klicka på den failade deploymenten → **Building**-loggar. Repot måste ha `package.json` och `package-lock.json` i root (som i opensverige/openclawsverige).
- **"Vercel hittar inget":** Kontrollera att Git-repot verkligen är **opensverige/openclawsverige** (Settings → Git). Efter byte av repo: gör en ny deploy (push till main eller Redeploy).
