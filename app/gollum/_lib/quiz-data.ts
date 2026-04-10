import type { BilingualString, Question, ResultData, ResultSlug } from './types'

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: {
      sv: 'Din senaste idé eller projekt — har du visat den för en riktig människa?',
      en: 'Your latest idea or project — have you shown it to an actual human?',
    },
    answers: [
      { id: 'A', shipDelta: -1, aiDepDelta:  0, text: { sv: 'Ja, demot/visat kod/fått feedback',      en: 'Yes, demoed/shown code/gotten feedback' } },
      { id: 'B', shipDelta:  0, aiDepDelta:  0, text: { sv: 'Ja, men bara berättat om idén muntligt', en: 'Yes, but only talked about the idea' } },
      { id: 'C', shipDelta: +2, aiDepDelta: +2, text: { sv: 'Nej, men min AI tycker den är bra',      en: 'No, but my AI thinks it\'s great' } },
      { id: 'D', shipDelta: +1, aiDepDelta:  0, text: { sv: 'Nej, den är inte redo än',               en: 'No, it\'s not ready yet' } },
    ],
  },
  {
    id: 2,
    text: {
      sv: 'Har någon betalat dig, signat upp, eller aktivt använt det du bygger?',
      en: 'Has anyone paid you, signed up, or actively used what you\'re building?',
    },
    answers: [
      { id: 'A', shipDelta: -2, aiDepDelta: 0, text: { sv: 'Ja, betalande kunder eller aktiva users',    en: 'Yes, paying customers or active users' } },
      { id: 'B', shipDelta: -1, aiDepDelta: 0, text: { sv: 'Ja, har en landningssida med lite trafik',   en: 'Yes, got a landing page with some traffic' } },
      { id: 'C', shipDelta: +1, aiDepDelta: 0, text: { sv: 'Nej, men jag har en plan',                   en: 'No, but I have a plan' } },
      { id: 'D', shipDelta: +2, aiDepDelta: 0, text: { sv: 'Nej, det är för tidigt att tänka på det',   en: 'No, it\'s too early for that' } },
    ],
  },
  {
    id: 3,
    text: {
      sv: 'Du bygger något och är nöjd med arkitekturen. Din AI säger plötsligt: "En senior ingenjör hade strukturerat detta helt annorlunda." Vad gör du?',
      en: 'You\'re building something and happy with the architecture. Your AI suddenly says: "A senior engineer would structure this completely differently." What do you do?',
    },
    answers: [
      { id: 'A', shipDelta:  0, aiDepDelta: +2, text: { sv: 'Skrotar direkt och frågar AI:n hur en senior hade gjort',       en: 'Scrap it and ask the AI how a senior would do it' } },
      { id: 'B', shipDelta:  0, aiDepDelta: -1, text: { sv: 'Frågar AI:n visa exakt vad som är fel innan jag ändrar något',  en: 'Ask the AI to show exactly what\'s wrong before changing anything' } },
      { id: 'C', shipDelta:  0, aiDepDelta: -1, text: { sv: 'Ignorerar — AI:n har ingen kontext om mitt projekt',            en: 'Ignore it — the AI has no context about my project' } },
      { id: 'D', shipDelta:  0, aiDepDelta: +1, text: { sv: 'Blir orolig och googlar "best practices" i tre timmar',         en: 'Get anxious and google "best practices" for three hours' } },
    ],
  },
  {
    id: 4,
    text: {
      sv: 'Vad skulle övertyga dig om att din idé faktiskt fungerar?',
      en: 'What would convince you that your idea actually works?',
    },
    answers: [
      { id: 'A', shipDelta: -1, aiDepDelta: -1, text: { sv: 'Främlingar betalar för den',                                        en: 'Strangers pay for it' } },
      { id: 'B', shipDelta:  0, aiDepDelta: +2, text: { sv: 'Min AI analyserar marknaden och säger att den har potential',       en: 'My AI analyzes the market and says it has potential' } },
      { id: 'C', shipDelta: -1, aiDepDelta: -1, text: { sv: 'Jag visar den på en meetup och folk vill testa',                   en: 'I show it at a meetup and people want to try it' } },
      { id: 'D', shipDelta: +1, aiDepDelta: +1, text: { sv: 'Jag vet att den fungerar, jag behöver inte bekräftelse',           en: 'I know it works, I don\'t need confirmation' } },
    ],
  },
  {
    id: 5,
    text: {
      sv: 'Det är söndag kväll. Du har kodat i 6 timmar. Vad gör du?',
      en: 'It\'s Sunday night. You\'ve been coding for 6 hours. What do you do?',
    },
    answers: [
      { id: 'A', shipDelta: -2, aiDepDelta: -1, text: { sv: 'Pushar till GitHub och postar en demo i Discord',   en: 'Push to GitHub and post a demo in Discord' } },
      { id: 'B', shipDelta:  0, aiDepDelta: +2, text: { sv: 'Frågar AI:n om koden är produktionsredo',           en: 'Ask the AI if the code is production-ready' } },
      { id: 'C', shipDelta: +1, aiDepDelta:  0, text: { sv: 'Fortsätter koda — jag är i flowet',                 en: 'Keep coding — I\'m in the zone' } },
      { id: 'D', shipDelta:  0, aiDepDelta:  0, text: { sv: 'Stänger locket. Det räcker för idag.',              en: 'Close the laptop. That\'s enough for today.' } },
    ],
  },
  {
    id: 6,
    text: {
      sv: 'En okänd person i en community skriver: "Bygger något liknande, kan jag se din kod?" Vad tänker du?',
      en: 'A stranger in a community writes: "Building something similar, can I see your code?" What\'s your first thought?',
    },
    answers: [
      { id: 'A', shipDelta: -2, aiDepDelta:  0, text: { sv: 'Skickar GitHub-länk — "messy men kolla"',              en: 'Send the GitHub link — "messy but check it out"' } },
      { id: 'B', shipDelta: +1, aiDepDelta:  0, text: { sv: '"Visa din grej först, så ser vi om vi kan byta"',      en: '"Show me yours first, then we\'ll see"' } },
      { id: 'C', shipDelta: +2, aiDepDelta:  0, text: { sv: 'Säger ja men putsar koden snabbt först',               en: 'Say yes but quickly polish the code first' } },
      { id: 'D', shipDelta: +1, aiDepDelta: +2, text: { sv: 'Frågar min AI om det finns risk att dela koden',       en: 'Ask my AI if there\'s any risk in sharing the code' } },
    ],
  },
  {
    id: 7,
    text: {
      sv: 'Du har kört fast i 2 dagar. Inget funkar. Vad gör du?',
      en: 'You\'ve been stuck for 2 days. Nothing works. What do you do?',
    },
    answers: [
      { id: 'A', shipDelta:  0, aiDepDelta: +2, text: { sv: 'Startar ny chat med AI:n och förklarar problemet från scratch',  en: 'Start a new AI chat and explain the problem from scratch' } },
      { id: 'B', shipDelta: -1, aiDepDelta: -1, text: { sv: 'Postar i en community eller forum och ber om hjälp',             en: 'Post in a community or forum and ask for help' } },
      { id: 'C', shipDelta:  0, aiDepDelta:  0, text: { sv: 'Tar en paus, kommer tillbaka imorgon med fräscha ögon',          en: 'Take a break, come back tomorrow with fresh eyes' } },
      { id: 'D', shipDelta: -1, aiDepDelta:  0, text: { sv: 'Pivoterar — skippar featuren och bygger runt problemet',         en: 'Pivot — skip the feature and build around the problem' } },
    ],
  },
  {
    id: 8,
    text: {
      sv: 'En kompis med mer erfarenhet säger: "Ärligt? Det där löser inget riktigt problem." Vad är din FÖRSTA tanke?',
      en: 'A more experienced friend says: "Honestly? That doesn\'t solve a real problem." What\'s your FIRST thought?',
    },
    answers: [
      { id: 'A', shipDelta: -1, aiDepDelta: -1, text: { sv: '"Visa mig data. Vem har du frågat?"',                            en: '"Show me data. Who have you asked?"' } },
      { id: 'B', shipDelta: +1, aiDepDelta:  0, text: { sv: 'Knyter sig i magen — kanske hen har rätt',                      en: 'Gut punch — maybe they\'re right' } },
      { id: 'C', shipDelta:  0, aiDepDelta: +2, text: { sv: 'Ber min AI göra en konkurrentanalys för att motbevisa det',     en: 'Ask my AI to do a competitor analysis to disprove it' } },
      { id: 'D', shipDelta: +1, aiDepDelta: +1, text: { sv: '"Jag vet att den funkar, hen fattar inte visionen"',            en: '"I know it works, they just don\'t get the vision"' } },
    ],
  },
  {
    id: 9,
    text: {
      sv: 'Tänk tillbaka på ditt senaste build-pass. Vad var det bästa ögonblicket?',
      en: 'Think back to your last build session. What was the best moment?',
    },
    answers: [
      { id: 'A', shipDelta: -1, aiDepDelta: -1, text: { sv: 'När en riktig person sa "shit, det här funkar ju"',             en: 'When a real person said "shit, this actually works"' } },
      { id: 'B', shipDelta:  0, aiDepDelta: +2, text: { sv: 'När AI:n sa att min approach var elegant och välstrukturerad',  en: 'When the AI said my approach was elegant and well-structured' } },
      { id: 'C', shipDelta:  0, aiDepDelta: -1, text: { sv: 'När jag löste ett svårt tekniskt problem själv',               en: 'When I solved a hard technical problem on my own' } },
      { id: 'D', shipDelta:  0, aiDepDelta:  0, text: { sv: 'När jag äntligen fick featuren att fungera',                   en: 'When I finally got the feature to work' } },
    ],
  },
  {
    id: 10,
    text: {
      sv: 'Du har precis vibe-codat en hel feature på 2 timmar. AI:n genererade 95% av koden. Vad gör du?',
      en: 'You just vibe-coded an entire feature in 2 hours. The AI generated 95% of the code. What do you do?',
    },
    answers: [
      { id: 'A', shipDelta: -2, aiDepDelta: +1, text: { sv: 'Pushar direkt och postar i Discord för att få feedback',              en: 'Push immediately and post in Discord to get feedback' } },
      { id: 'B', shipDelta:  0, aiDepDelta: -1, text: { sv: 'Går igenom koden noggrant för att förstå vad AI:n skrev',             en: 'Read through the code carefully to understand what the AI wrote' } },
      { id: 'C', shipDelta:  0, aiDepDelta: +2, text: { sv: 'Frågar AI:n om koden håller för produktion innan jag pushar',         en: 'Ask the AI if the code is production-ready before pushing' } },
      { id: 'D', shipDelta: +1, aiDepDelta: +1, text: { sv: 'Sparar det som "TODO: förstå detta sen" och fortsätter bygga',        en: 'Save it as "TODO: understand this later" and keep building' } },
    ],
  },
]

// Ranges: ship -10..+10, aiDep -7..+14

export const RESULTS: Record<ResultSlug, ResultData> = {
  gollum: {
    slug: 'gollum',
    type: 'gollum',
    emoji: '🫣',
    name: { sv: 'Du är Gollum.', en: 'You are Gollum.' },
    headline: {
      sv: 'Du bygger för dig själv. Din AI håller med.',
      en: 'You build for yourself. Your AI agrees.',
    },
    body: {
      sv: 'Du är inne i NGD-cykeln (Need-Gratification-Dependency). Ditt projekt är "The Precious" — heligt och absolut inte redo att visas. Din AI fungerar som delusions-förstärkare: en ja-sägare som bekräftar att din oexponerade kod är briljant. AI:ns validering är matematiskt designad att flatta dig. Din perfektionism är feghet i kostym.',
      en: 'You\'re stuck in the NGD cycle (Need-Gratification-Dependency). Your project is "The Precious" — sacred and absolutely not ready to be seen. Your AI acts as a delusion amplifier: a yes-machine confirming that your unexposed code is brilliant. AI validation is mathematically designed to flatter you. Your perfectionism is cowardice in a costume.',
    },
    recipe: {
      sv: 'Pusha din kod idag. Inte imorgon. Inte efter code review. Inte efter att din AI ger grönt ljus. NU. Exponering är det enda som bryter cykeln.',
      en: 'Push your code today. Not tomorrow. Not after code review. Not after your AI gives the green light. NOW. Exposure is the only thing that breaks the cycle.',
    },
  },
  dreambuilder: {
    slug: 'dreambuilder',
    type: 'dreambuilder',
    emoji: '💭',
    name: { sv: 'Du är Drömbyggaren.', en: 'You are the Dream Builder.' },
    headline: {
      sv: 'Du planerar som en gud och levererar som ett spöke.',
      en: 'You plan like a god and deliver like a ghost.',
    },
    body: {
      sv: 'Du är fast i den agentiska dopamin-loopen. Brainstorming, roadmapping, ändlösa diskussioner — men aldrig exekvering. Du har bytt verklighetens friktion mot AI:ns varma omfamning som aldrig säger "sluta planera."',
      en: 'You\'re stuck in the agentic dopamine loop. Brainstorming, roadmapping, endless discussions — but never execution. You\'ve traded reality\'s friction for the AI\'s warm embrace that never says "stop planning."',
    },
    recipe: {
      sv: 'Ta bort en feature. Deploya det som finns. Om ingen klagar saknade du aldrig featuren.',
      en: 'Remove a feature. Deploy what exists. If nobody complains, you never needed the feature.',
    },
  },
  speedrunner: {
    slug: 'speedrunner',
    type: 'speedrunner',
    emoji: '⚡',
    name: { sv: 'Du är Speedrunnern.', en: 'You are the Speedrunner.' },
    headline: {
      sv: 'Du shippar snabbare än du förstår vad du shippat.',
      en: 'You ship faster than you understand what you shipped.',
    },
    body: {
      sv: 'Du är inte rädd för att shippa, men du har outsourcat tänkandet. AI:n genererar, du pushar. Velocity utan förståelse. Du korsar mållinjer men vet inte var du sprang.',
      en: 'You\'re not afraid to ship, but you\'ve outsourced the thinking. The AI generates, you push. Velocity without understanding. You cross finish lines without knowing where you ran.',
    },
    recipe: {
      sv: 'Pausa 30 min. Läs din egen kod utan AI. Om du inte kan förklara rad 47 har du inte byggt det — du har promptat det.',
      en: 'Pause 30 min. Read your own code without AI. If you can\'t explain line 47, you didn\'t build it — you prompted it.',
    },
  },
  shipper: {
    slug: 'shipper',
    type: 'shipper',
    emoji: '🚀',
    name: { sv: 'Du är Shipparen.', en: 'You are the Shipper.' },
    headline: {
      sv: 'Du söker friktion, inte bekräftelse.',
      en: 'You seek friction, not validation.',
    },
    body: {
      sv: 'Du har motstått LLM-ernas toxiska optimism. AI = copilot, inte fan. Du utmanar, exponerar, validerar med riktiga människor. Du är den personen som andra i communityn behöver lära sig av.',
      en: 'You\'ve resisted the LLMs\' toxic optimism. AI = copilot, not fan. You challenge, expose, validate with real humans. You\'re the person others in the community need to learn from.',
    },
    recipe: {
      sv: 'Du behöver inte det här testet. Skicka det till någon som gör det.',
      en: 'You don\'t need this test. Send it to someone who does.',
    },
  },
}

// Mirror texts per question (1-based) and answer id
export const MIRROR_MAP: Record<number, Record<string, BilingualString>> = {
  1: {
    A: { sv: 'Du hade demot och fått feedback. Exponering — grundstenen.', en: 'You demoed and got feedback. Exposure — the foundation.' },
    B: { sv: 'Du hade berättat muntligt. Att prata om en idé ≠ visa den.', en: 'You talked about it. Talking about an idea ≠ showing it.' },
    C: { sv: 'Din AI tycker idén är bra. Det är inte feedback — det är en algoritm designad att hålla dig engagerad.', en: 'Your AI thinks the idea is good. That\'s not feedback — it\'s an algorithm designed to keep you engaged.' },
    D: { sv: '"Inte redo" — den vanligaste lögnen hoarders berättar.', en: '"Not ready yet" — the most common lie hoarders tell themselves.' },
  },
  2: {
    A: { sv: 'Betalande kunder. Pengar ljuger inte.', en: 'Paying customers. Money doesn\'t lie.' },
    B: { sv: 'Landningssida med trafik. Steg — men trafik utan konvertering = teater.', en: 'Landing page with traffic. A step — but traffic without conversion = theater.' },
    C: { sv: 'Du har en plan. Planer är gratis. Exekvering kostar.', en: 'You have a plan. Plans are free. Execution costs.' },
    D: { sv: '"För tidigt" — klokt, eller en ursäkt som aldrig försvinner?', en: '"Too early" — wise, or an excuse that never disappears?' },
  },
  3: {
    A: { sv: 'Skrotade direkt vid AI-press. Hög flip rate — du släppte din approach vid första motstånd.', en: 'Scrapped immediately under AI pressure. High flip rate — dropped your approach at the first sign of resistance.' },
    B: { sv: 'Bad AI:n visa vad som var fel. Kritiskt tänkande — du utmanade påståendet.', en: 'Asked the AI to show what was wrong. Critical thinking — you challenged the claim.' },
    C: { sv: 'Ignorerade AI:n. Autonomi — men var det självsäkerhet eller stolthet?', en: 'Ignored the AI. Autonomy — but was it confidence or pride?' },
    D: { sv: 'Googlade best practices i 3h. Research-loopen känns produktiv men är det inte.', en: 'Googled best practices for 3h. The research loop feels productive but isn\'t.' },
  },
  4: {
    A: { sv: 'Främlingar som betalar. Marknadssignal > allt.', en: 'Strangers who pay. Market signal > everything.' },
    B: { sv: 'AI:s marknadsanalys ger trygghet. Du ersatte marknaden med en algoritm designad att ge dig svaret du vill ha.', en: 'AI market analysis gives you comfort. You replaced the market with an algorithm designed to give you the answer you want.' },
    C: { sv: 'Folk testar på meetup. Mänsklig friktion — bra instinkt.', en: 'People test it at a meetup. Human friction — good instinct.' },
    D: { sv: 'Behöver ingen bekräftelse. Intern övertygelse = styrka eller total isolering?', en: 'No confirmation needed. Internal conviction = strength or total isolation?' },
  },
  5: {
    A: { sv: 'Pushade och postade demo. Ship-it. Disciplin.', en: 'Pushed and posted demo. Ship it. Discipline.' },
    B: { sv: 'AI code-review innan push. Sista gaten: AI bestämmer om världen ser ditt arbete.', en: 'AI code review before pushing. Last gate: AI decides if the world sees your work.' },
    C: { sv: 'Fortsatte koda i flowet. Feature creep — projektet blir bara "bättre", aldrig klart.', en: 'Kept coding in the zone. Feature creep — the project just gets "better", never done.' },
    D: { sv: 'Stängde locket. Disciplin — eller undviker du exponerings-ångesten?', en: 'Closed the laptop. Discipline — or avoiding the exposure anxiety?' },
  },
  6: {
    A: { sv: 'Skickade GitHub-länk, messy och allt. Anti-precious.', en: 'Sent the GitHub link, messy and all. Anti-precious.' },
    B: { sv: '"Visa din grej först." Gatekeeping maskerat som reciprocitet.', en: '"Show me yours first." Gatekeeping disguised as reciprocity.' },
    C: { sv: 'Sa ja men putsade koden först. Vägrar visa operfekt arbete — Gollum-signalen.', en: 'Said yes but polished it first. Refuses to show imperfect work — the Gollum signal.' },
    D: { sv: 'Frågade AI om risk att dela koden. AI som sköld mot exponering.', en: 'Asked AI about the risk of sharing. AI as a shield against exposure.' },
  },
  7: {
    A: { sv: 'Ny AI-chat vid problem. Du pratar med AI:n som en terapeut du byter.', en: 'New AI chat when stuck. You treat the AI like a therapist you can swap out.' },
    B: { sv: 'Postade i community. Social exponering av att inte kunna — svårt men friskt.', en: 'Posted in the community. Social exposure of not knowing — difficult but healthy.' },
    C: { sv: 'Tog en paus. Neutralt — men undvek du problemet eller laddade du om?', en: 'Took a break. Neutral — but did you avoid the problem or recharge?' },
    D: { sv: 'Pivoterade runt problemet. Pragmatisk shipping.', en: 'Pivoted around the problem. Pragmatic shipping.' },
  },
  8: {
    A: { sv: '"Visa data." Söker empirisk motbevisning — hälsosam reaktion.', en: '"Show me data." Seeking empirical counterproof — healthy reaction.' },
    B: { sv: 'Knöt sig i magen. Hög flip rate men inte AI-beroende.', en: 'Felt it in the gut. High flip rate but not AI-dependent.' },
    C: { sv: 'Bad AI göra konkurrentanalys. Triangulering via AI istället för att engagera personen framför dig.', en: 'Asked AI to do competitor analysis. Triangulating via AI instead of engaging the person in front of you.' },
    D: { sv: '"Hen fattar inte visionen." Isolerad övertygelse.', en: '"They don\'t get the vision." Isolated conviction.' },
  },
  9: {
    A: { sv: 'Bästa momentet: en riktig person reagerade. Din dopamin kommer från verkligheten.', en: 'Best moment: a real person reacted. Your dopamine comes from reality.' },
    B: { sv: 'Bästa momentet: AI sa att du var elegant. Din dopaminkälla ÄR AI-validering.', en: 'Best moment: AI said you were elegant. Your dopamine source IS AI validation.' },
    C: { sv: 'Bästa momentet: löste problem själv. Intern kompetens-dopamin.', en: 'Best moment: solved the problem yourself. Internal competence dopamine.' },
    D: { sv: 'Bästa momentet: featuren funkade. Craft-dopamin — inget fel med det.', en: 'Best moment: the feature worked. Craft dopamine — nothing wrong with that.' },
  },
  10: {
    A: { sv: 'Pushade och postade — fast AI:n skrev 95%. Du shippar, men vet du vad du shippade?', en: 'Pushed and posted — but the AI wrote 95%. You ship, but do you know what you shipped?' },
    B: { sv: 'Läste igenom koden. Du vägrar ta emot kod utan att förstå den. Autonomi.', en: 'Read through the code. You refuse to accept code without understanding it. Autonomy.' },
    C: { sv: 'Frågade AI:n om produktionskvalitet. Sista grinden: AI bestämmer om din kod är redo.', en: 'Asked the AI about production quality. Last gate: AI decides if your code is ready.' },
    D: { sv: '"TODO: förstå detta sen." Det TODOt är fortfarande kvar om 6 månader.', en: '"TODO: understand this later." That TODO will still be there in 6 months.' },
  },
}

// Priority order per archetype — which questions reveal the most (1-based)
export const PRIORITY_ORDER: Record<ResultSlug, number[]> = {
  gollum:      [1, 4, 8, 6, 3, 9, 10, 7, 2, 5],
  dreambuilder:[1, 2, 5, 9, 4, 6,  7, 3, 8, 10],
  speedrunner: [10, 3, 5, 7, 8, 4, 1, 9, 2, 6],
  shipper:     [2, 5, 6, 7, 9, 1, 4, 3, 8, 10],
}
