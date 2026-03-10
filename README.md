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

- **Node 20+** krävs (Supabase/OpenAI). Använd `.nvmrc` eller `engines` i `package.json`.
- **Installera och bygg:** `npm install && npm run build`
- **Killmyidea** kräver i produktion: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (eller `NEXT_PUBLIC_ANON_KEY`) och för API: `OPENAI_API_KEY`, Supabase service-nyckel. Utan dessa kan `/killmyidea` ge fel eller 404 om builden misslyckas.

## Databas-konventioner

- Nya tabeller ska alltid prefixas med `opensverige_` (t.ex. `opensverige_killmyidea_scores`).
- Befintliga `openscore_*`-tabeller är legacy och lämnas orörda.
