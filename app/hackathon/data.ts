// Allt innehåll för /hackathon bor här — WIP, redigera fritt.
// OBS: datumen nedan är inte spikade. Sätt rätt år/kanal när det är klart.

export const HACKATHON = {
  status: 'live' as const,
  eyebrow: 'Open Sverige · Spel-Hackathon',
  title: 'HACKATHON',
  tagline: 'Skapa ett litet spel på en vecka.',
  // Deadline styr nedräkningen. ISO med svensk tidszon (+02:00 sommartid).
  // WIP-platshållare — sätt rätt årtal när det är spikat.
  deadlineISO: '2026-06-14T00:00:00+02:00',
  deadlineLabel: '14 juni · 00:00',
  discordChannel: '#hackathon-spel',
  discordUrl: 'https://discord.gg/CSphbTk8En',
  githubUrl: 'https://github.com/opensverige',
  wipNote:
    'Hackathonet pågår nu. Öppen källkod väger extra, alla nivåer är välkomna — kom med din idé.',
} as const

export type Requirement = { title: string; body: string }

// Hårda krav för att delta — Discord-medlemskap + rätt kanal.
export const REQUIREMENTS: Requirement[] = [
  {
    title: 'Var medlem i vår Discord',
    body: 'Hackathonet körs i communityn. Du måste vara med i opensverige-Discord för att delta och lämna in.',
  },
  {
    title: 'Lämna in i #hackathon-spel',
    body: 'All inlämning sker i vår dedikerade kanal. Spel som postas någon annanstans räknas inte.',
  },
]

// Löpande stöd under veckan.
export const SUPPORT_NOTE =
  'Fastnar du under veckan? Fråga i #hackathon-spel — communityn och juryn hjälps åt.'

export type Fact = { label: string; value: string }

export const FACTS: Fact[] = [
  { label: 'När', value: 'Pågår nu · 1 vecka' },
  { label: 'Tema', value: 'Skapa ett litet spel' },
  { label: 'Teknik', value: 'Valfri genre & engine — Godot, Unity, Pygame, web…' },
  { label: 'Krav', value: 'Spelbart: minst en loop eller nivå. Inget krav på storlek eller grafik.' },
  { label: 'Inlämning', value: 'Senast 14 juni 00:00 i #hackathon-spel' },
]

export type SubmitItem = { text: string; bonus?: boolean }

export const SUBMIT: SubmitItem[] = [
  { text: 'Länk till spelet — itch.io, GitHub Pages, eller zip + instruktioner' },
  { text: 'Kort beskrivning: vad är spelet och hur spelar man?' },
  { text: 'GitHub-länk med öppen källkod', bonus: true },
]

export type Criterion = {
  no: string
  name: string
  body: string
  // Hur tungt kriteriet väger, för pixel-mätaren (av 5).
  weight: number
  extra?: boolean
}

export const CRITERIA: Criterion[] = [
  {
    no: '01',
    name: 'Spelglädje',
    body: 'Är det kul att spela? Vill man spela mer? Community-rösterna väger tungt här.',
    weight: 4,
  },
  {
    no: '02',
    name: 'Kreativitet & idé',
    body: 'Något oväntat, eget eller smart? En idé som sticker ut.',
    weight: 3,
  },
  {
    no: '03',
    name: 'Polish & spelbarhet',
    body: 'Känns det färdigt? Funkar kontroller, känsla och flow utan friktion?',
    weight: 3,
  },
  {
    no: '04',
    name: 'OpenSverige & Framtid',
    body: 'Öppen kod på GitHub? Lätt att återanvända eller bygga vidare på? Potential som bas för andra projekt?',
    weight: 5,
    extra: true,
  },
]

export type Prize = { name: string; detail?: string }

// Prispott (announcerad). Öppen källkod väger extra i juryn.
export const PRIZES: Prize[] = [
  { name: '8Bitdo Retro Mechanical Keyboard', detail: 'Hot-swappable · Nordic' },
  { name: '8Bitdo N30 Wireless Mouse', detail: 'Retro' },
  { name: 'Marhynchus Mini Mechanical Macropad', detail: 'Med knob & RGB' },
  { name: '1000 kr på grunden.ai', detail: 'GLM 5.1' },
]

export const TIPS: string[] = [
  'Håll scopet litet. En loop som funkar slår en stor idé som aldrig blir klar.',
  'Gör det spelbart i webbläsaren om du kan (itch.io HTML5 / GitHub Pages) — fler hinner testa och rösta.',
  'Lägg koden öppet på GitHub från dag ett. Det väger extra hos juryn och hjälper andra bygga vidare.',
  'En tydlig kärnmekanik slår tio halvfärdiga. Polera det som redan funkar.',
  'Skriv en rad om hur man spelar i inlämningen. En förvirrad domare röstar lågt.',
]
