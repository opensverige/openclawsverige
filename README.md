# Bygg AI-agenter. Tillsammans med andra svenskar.

**Open Claw Sverige** är det svenska OpenClaw-communityt där vi experimenterar, delar kod och bygger AI-lösningar – på svenska, för svenskar.

---

## Varför ett svenskt OpenClaw-community?

- **Samarbeta på svenska** – Inget språkbarriär. Diskutera, felsök och innovera på ditt modersmål med folk i samma tidszon.
- **Hands-on, inte fluff** – Vi delar faktisk kod, verkliga use cases och konkreta lösningar. Mindre teori, mer action.
- **Early adopter-fördel** – OpenClaw exploderar globalt. Bli en av de första i Norden som behärskar tekniken.
- **Open source first** – Vi tror på FOSS-filosofin. Allt vi bygger delas öppet. Alla kan bidra, alla får tillgång.

---

## Vad får du?

✅ Tillgång till svenskt OpenClaw-community  
✅ Direktkanal till andra svenska utvecklare  
✅ Delad kodbank och resurser  
✅ Hjälp när du kör fast  
✅ Möjlighet att påverka svensk AI-utveckling  
✅ Nätverk med likasinnade tech-entusiaster  

---

## Redo att börja bygga?

**Gratis. Öppen källkod. Inga krav.**

👉 [**Gå med i Discord**](https://discord.gg/CSphbTk8En)  
👉 [**Facebook-gruppen**](https://www.facebook.com/groups/2097332881024571/)  
👉 [**LinkedIn-gruppen**](https://www.linkedin.com/groups/9544657/)

Du behöver INTE vara expert – vi lär oss tillsammans.

---

## Utveckling & deploy

- **Installera och bygg:** `npm install && npm run build`

### Deploy på Vercel

1. **Koppla rätt repo** – Vercel måste bygga från **det här repot**: [opensverige/openclawsverige](https://github.com/opensverige/openclawsverige).  
   Vercel Dashboard → ditt projekt → **Settings** → **Git** → om det står ett annat repo (t.ex. `Baltsar/openclawsverige_public`), klicka **Disconnect** och koppla **opensverige/openclawsverige** istället.

2. **Root Directory** – Låt stå tomt (projektets root är repots root).

3. **Redeploy** – **Deployments** → **Redeploy** på senaste (gärna "Redeploy" med "Clear cache and redeploy").

4. **Öppna sajten** – Använd **produktions-URL:en** (t.ex. `https://<projekt>.vercel.app` eller din egen domän), inte länken till en enskild deployment-sida. Knappen **Visit** vid en deployment öppnar rätt URL.

Om deployment-sidan i Vercel visar 404 men bygget lyckats: öppna direkt **Visit**-länken eller produktions-URL:en – ofta fungerar sajten även då.

## Databas-konventioner

- Nya tabeller ska alltid prefixas med `opensverige_`.
