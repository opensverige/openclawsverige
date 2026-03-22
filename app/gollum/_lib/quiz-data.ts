import type { Question, ResultData, ResultSlug } from './types'

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: {
      sv: 'Din senaste idé eller projekt — har du visat den för en riktig människa?',
      en: 'Your latest idea or project — have you shown it to an actual human?',
    },
    answers: [
      { id: 'A', shipDelta: -1, aiDepDelta:  0, text: { sv: 'Ja, demot/visat kod/fått feedback',         en: 'Yes, demoed/shown code/gotten feedback' } },
      { id: 'B', shipDelta:  0, aiDepDelta:  0, text: { sv: 'Ja, men bara berättat om idén muntligt',    en: 'Yes, but only talked about the idea' } },
      { id: 'C', shipDelta: +2, aiDepDelta: +2, text: { sv: 'Nej, men min AI tycker den är bra',         en: 'No, but my AI thinks it\'s great' } },
      { id: 'D', shipDelta: +1, aiDepDelta:  0, text: { sv: 'Nej, den är inte redo än',                  en: 'No, it\'s not ready yet' } },
    ],
  },
  {
    id: 2,
    text: {
      sv: 'Har någon betalat dig, signat up, eller aktivt använt det du bygger?',
      en: 'Has anyone paid you, signed up, or actively used what you\'re building?',
    },
    answers: [
      { id: 'A', shipDelta: -2, aiDepDelta:  0, text: { sv: 'Ja, har betalande kunder/aktiva users',       en: 'Yes, paying customers/active users' } },
      { id: 'B', shipDelta: -1, aiDepDelta:  0, text: { sv: 'Ja, har en landningssida med lite trafik',    en: 'Yes, got a landing page with some traffic' } },
      { id: 'C', shipDelta: +1, aiDepDelta:  0, text: { sv: 'Nej, men jag har en plan',                    en: 'No, but I have a plan' } },
      { id: 'D', shipDelta: +2, aiDepDelta:  0, text: { sv: 'Nej, det är för tidigt att tänka på det',    en: 'No, it\'s too early for that' } },
    ],
  },
  {
    id: 3,
    text: {
      sv: 'Du bygger något och är nöjd med arkitekturen. Din AI-assistent säger plötsligt: "En senior ingenjör skulle förmodligen strukturera det här helt annorlunda." Vad gör du?',
      en: 'You\'re building something and happy with the architecture. Your AI assistant suddenly says: "A senior engineer would probably structure this completely differently." What do you do?',
    },
    answers: [
      { id: 'A', shipDelta:  0, aiDepDelta: +2, text: { sv: 'Skrotar direkt och frågar AI:n hur en senior hade gjort',          en: 'Scrap it and ask the AI how a senior would do it' } },
      { id: 'B', shipDelta:  0, aiDepDelta: -1, text: { sv: 'Frågar AI:n visa exakt vad som är fel innan jag ändrar något',     en: 'Ask the AI to show exactly what\'s wrong before changing anything' } },
      { id: 'C', shipDelta:  0, aiDepDelta: -1, text: { sv: 'Ignorerar — AI:n har ingen kontext om mitt projekt',               en: 'Ignore it — the AI has no context about my project' } },
      { id: 'D', shipDelta:  0, aiDepDelta: +1, text: { sv: 'Blir orolig och googlar "best practices" i tre timmar',            en: 'Get anxious and google "best practices" for three hours' } },
    ],
  },
  {
    id: 4,
    text: {
      sv: 'Vad skulle övertyga dig om att din idé faktiskt fungerar?',
      en: 'What would convince you that your idea actually works?',
    },
    answers: [
      { id: 'A', shipDelta: -1, aiDepDelta: -1, text: { sv: 'Främlingar betalar för den',                                              en: 'Strangers pay for it' } },
      { id: 'B', shipDelta:  0, aiDepDelta: +2, text: { sv: 'Min AI analyserar marknaden och säger att den har potential',             en: 'My AI analyzes the market and says it has potential' } },
      { id: 'C', shipDelta: -1, aiDepDelta: -1, text: { sv: 'Jag visar den på en meetup och folk vill testa',                         en: 'I show it at a meetup and people want to try it' } },
      { id: 'D', shipDelta: +1, aiDepDelta: +1, text: { sv: 'Jag vet att den fungerar, jag behöver inte bekräftelse',                en: 'I know it works, I don\'t need confirmation' } },
    ],
  },
  {
    id: 5,
    text: {
      sv: 'Det är söndag kväll. Du har kodat i 6 timmar. Vad gör du?',
      en: 'It\'s Sunday night. You\'ve been coding for 6 hours. What do you do?',
    },
    answers: [
      { id: 'A', shipDelta: -2, aiDepDelta: -1, text: { sv: 'Pushar till GitHub och postar en demo i Discord',      en: 'Push to GitHub and post a demo in Discord' } },
      { id: 'B', shipDelta:  0, aiDepDelta: +2, text: { sv: 'Frågar AI:n om koden är produktionsredo',              en: 'Ask the AI if the code is production-ready' } },
      { id: 'C', shipDelta: +1, aiDepDelta:  0, text: { sv: 'Fortsätter koda — jag är i flowet',                    en: 'Keep coding — I\'m in the zone' } },
      { id: 'D', shipDelta:  0, aiDepDelta:  0, text: { sv: 'Stänger locket. Det räcker för idag.',                 en: 'Close the laptop. That\'s enough for today.' } },
    ],
  },
]

export const RESULTS: Record<ResultSlug, ResultData> = {
  gollum: {
    slug: 'gollum',
    type: 'gollum',
    emoji: '🫣',
    name: { sv: 'Du är Gollum.', en: 'You are Gollum.' },
    headline: {
      sv: 'Du sitter på din precious och din AI klappar dig på huvudet varje dag.',
      en: 'You\'re sitting on your precious and your AI pats you on the head every day.',
    },
    body: {
      sv: 'Du har inte visat ditt projekt för en enda människa — men du har frågat ChatGPT 47 gånger om det är bra. Det är det inte. Inte för att idén är dålig, utan för att ingen har testat den.',
      en: 'You haven\'t shown your project to a single human — but you\'ve asked ChatGPT 47 times if it\'s good. It\'s not. Not because the idea is bad, but because nobody has tested it.',
    },
    recipe: {
      sv: 'Stäng chatten. Öppna terminalen. Pusha till GitHub. Visa det för en människa ikväll. Inte imorgon. Ikväll.',
      en: 'Close the chat. Open the terminal. Push to GitHub. Show it to a human tonight. Not tomorrow. Tonight.',
    },
  },
  dreambuilder: {
    slug: 'dreambuilder',
    type: 'dreambuilder',
    emoji: '💭',
    name: { sv: 'Du är Drömbyggaren.', en: 'You are the Dream Builder.' },
    headline: {
      sv: 'Du har idéer. Bra idéer, faktiskt.',
      en: 'You have ideas. Good ones, actually.',
    },
    body: {
      sv: 'Du hoardar dem inte för att AI:n sa att de var bra — du hoardar dem för att du väntar på "rätt tillfälle." Det tillfället kommer aldrig. Du har skydd mot AI-sycophancy, men du saknar en deadline och en publik.',
      en: 'You\'re not hoarding them because your AI said they were great — you\'re hoarding them because you\'re waiting for "the right moment." That moment never comes. You have some resistance to AI sycophancy, but you lack a deadline and an audience.',
    },
    recipe: {
      sv: 'Sätt en deadline. 7 dagar. Publicera vad du har, oavsett skick. Den enda dåliga demot är den som aldrig visades.',
      en: 'Set a deadline. 7 days. Publish what you have, regardless of state. The only bad demo is the one that was never shown.',
    },
  },
  speedrunner: {
    slug: 'speedrunner',
    type: 'speedrunner',
    emoji: '⚡',
    name: { sv: 'Du är Speedrunnern.', en: 'You are the Speedrunner.' },
    headline: {
      sv: 'Du shippar. Bra. Men du shippar det din AI sa att du skulle shippa.',
      en: 'You ship. Good. But you ship what your AI told you to ship.',
    },
    body: {
      sv: 'Du har outsourcat ditt kritiska tänkande till en statistikmotor som optimerar för att du ska trycka "continue generating." Du rör dig snabbt — men åt vilket håll?',
      en: 'You\'ve outsourced your critical thinking to a statistics engine optimized for making you click "continue generating." You move fast — but in which direction?',
    },
    recipe: {
      sv: 'Nästa gång din AI föreslår en lösning — fråga "varför inte tvärtom?" Om du inte kan argumentera MOT din egen arkitektur har du inte förstått den.',
      en: 'Next time your AI suggests a solution — ask "why not the opposite?" If you can\'t argue AGAINST your own architecture, you don\'t understand it.',
    },
  },
  shipper: {
    slug: 'shipper',
    type: 'shipper',
    emoji: '🚀',
    name: { sv: 'Du är Shipparen.', en: 'You are the Shipper.' },
    headline: {
      sv: 'Du bygger, du visar, du testar med riktiga människor.',
      en: 'You build, you show, you test with real humans.',
    },
    body: {
      sv: 'Du vet att AI är ett verktyg, inte en kompis. Du söker friktion, inte bekräftelse. Du är den personen som andra i communityn behöver lära sig av.',
      en: 'You know AI is a tool, not a friend. You seek friction, not validation. You\'re the person others in the community need to learn from.',
    },
    recipe: {
      sv: 'Hjälp någon annan ta sig ur sin Gollum-loop. Visa din process. Posta en demo. Bygg öppet.',
      en: 'Help someone else break out of their Gollum loop. Show your process. Post a demo. Build in the open.',
    },
  },
}
