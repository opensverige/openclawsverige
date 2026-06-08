// Allt innehåll för /hackathon — svenska + engelska. Lätt att switcha.
// WIP-platshållare för datum: sätt rätt årtal när det spikas.

export type Lang = 'sv' | 'en'

export const SHARED = {
  deadlineISO: '2026-06-14T00:00:00+02:00',
  channelName: '⠴-❯_hackathon-spel',
  channelUrl:
    'https://discord.com/channels/1466847548864987289/1513152604241400018',
  discordUrl: 'https://discord.gg/CSphbTk8En',
  githubUrl: 'https://github.com/opensverige',
} as const

export type Fact = { label: string; value: string }
export type Requirement = { title: string; body: string }
export type SubmitItem = { text: string; bonus?: boolean }
export type Criterion = {
  no: string
  name: string
  body: string
  weight: number
  extra?: boolean
}
export type Prize = { name: string; detail?: string }

export type Content = {
  tagline: string
  deadlineLabel: string
  submissionPrefix: string
  cta: string
  countdown: {
    days: string
    hours: string
    mins: string
    secs: string
    closed: string
    aria: string
  }
  sections: {
    delta: string
    brief: string
    submit: string
    criteria: string
    prizes: string
    tips: string
    rules: string
  }
  participationLead: string
  requirements: Requirement[]
  submitPrefix: string
  submitBy: string
  submit: SubmitItem[]
  facts: Fact[]
  criteriaLead: string
  votingPrefix: string
  votingSuffix: string
  criteria: Criterion[]
  prizes: Prize[]
  tips: string[]
  rules: string[]
  support: string
  wipNote: string
  footerBack: string
}

const ch = SHARED.channelName

export const CONTENT: Record<Lang, Content> = {
  sv: {
    tagline: 'Skapa ett litet spel på en vecka.',
    deadlineLabel: 'Söndag 14 juni kl 00:00',
    submissionPrefix: 'Inlämning',
    cta: 'Gå med i Discord',
    countdown: {
      days: 'dgr',
      hours: 'tim',
      mins: 'min',
      secs: 'sek',
      closed: 'INLÄMNING STÄNGD',
      aria: 'Tid kvar till inlämning',
    },
    sections: {
      delta: 'Så deltar du',
      brief: 'Brief',
      submit: 'Så lämnar du in',
      criteria: 'Kriterier',
      prizes: 'Priser',
      tips: 'Tips',
      rules: 'Regler',
    },
    participationLead:
      'Bygg ditt spel på egen hand — var, när och hur du vill. Du lämnar bara in det i vår Discord, där community + jury bedömer.',
    requirements: [
      {
        title: 'Var medlem i vår Discord',
        body: 'Hackathonet körs i communityn. Du måste vara med i opensverige-Discord för att delta och lämna in.',
      },
      {
        title: 'Lämna in i rätt kanal',
        body: `All inlämning sker i ${ch}. Spel som postas någon annanstans räknas inte.`,
      },
    ],
    submitPrefix: 'Posta i',
    submitBy: 'senast',
    submit: [
      { text: 'Länk till spelet — itch.io, GitHub Pages, eller zip + instruktioner' },
      { text: 'Kort beskrivning: vad är spelet och hur spelar man?' },
      { text: 'GitHub-länk med öppen källkod', bonus: true },
    ],
    facts: [
      { label: 'När', value: 'Pågår nu · 1 vecka' },
      { label: 'Tema', value: 'Skapa ett litet spel' },
      { label: 'Teknik', value: 'Valfri genre & engine — Godot, Unity, Pygame, web…' },
      { label: 'Krav', value: 'Spelbart: minst en loop eller nivå. Inget krav på storlek eller grafik.' },
      { label: 'Inlämning', value: `Senast söndag 14 juni kl 00:00 i ${ch}` },
    ],
    criteriaLead:
      'Community röstar på spelglädje, en liten jury bedömer helheten. 1–5 poäng per kriterium — högst total vinner.',
    votingPrefix: 'Uppröstning sker via reactions i',
    votingSuffix:
      '— även efter inlämning. Community-rösterna räknas in i bedömningen.',
    criteria: [
      { no: '01', name: 'Spelglädje', body: 'Är det kul att spela? Vill man spela mer? Community-rösterna väger tungt här.', weight: 4 },
      { no: '02', name: 'Kreativitet & idé', body: 'Något oväntat, eget eller smart? En idé som sticker ut.', weight: 3 },
      { no: '03', name: 'Polish & spelbarhet', body: 'Känns det färdigt? Funkar kontroller, känsla och flow utan friktion?', weight: 3 },
      { no: '04', name: 'OpenSverige & Framtid', body: 'Öppen kod på GitHub? Lätt att återanvända eller bygga vidare på? Potential som bas för andra projekt?', weight: 5, extra: true },
    ],
    prizes: [
      { name: '8Bitdo Retro Mechanical Keyboard', detail: 'Hot-swappable · Nordic' },
      { name: '8Bitdo N30 Wireless Mouse', detail: 'Retro' },
      { name: 'Marhynchus Mini Mechanical Macropad', detail: 'Med knob & RGB' },
      { name: '1000 kr på grunden.ai', detail: 'GLM 5.1' },
    ],
    tips: [
      'Håll scopet litet. En loop som funkar slår en stor idé som aldrig blir klar.',
      'Gör det spelbart i webbläsaren om du kan (itch.io HTML5 / GitHub Pages) — fler hinner testa och rösta.',
      'Lägg koden öppet på GitHub från dag ett. Det väger extra hos juryn och hjälper andra bygga vidare.',
      'En tydlig kärnmekanik slår tio halvfärdiga. Polera det som redan funkar.',
      'Skriv en rad om hur man spelar i inlämningen. En förvirrad domare röstar lågt.',
    ],
    rules: [
      'Spelet ska byggas under hackathonveckan. Vi tar inte emot spel som påbörjats eller byggts tidigare.',
      'Tävlingen är öppen för deltagare i Sverige.',
      'Genom att lämna in intygar du att bidraget är ditt eget och skapat under perioden.',
      'Arrangören har sista ordet vid bedömning och eventuella tvister.',
    ],
    support: 'Frågor? Skriv i #general eller #bygg-skiten. Alla är välkomna att delta.',
    wipNote:
      'Hackathonet pågår nu. Öppen källkod väger extra, alla nivåer är välkomna — kom med din idé.',
    footerBack: '← opensverige / lab',
  },

  en: {
    tagline: 'Build a small game in one week.',
    deadlineLabel: 'Sunday 14 June, 00:00',
    submissionPrefix: 'Deadline',
    cta: 'Join Discord',
    countdown: {
      days: 'days',
      hours: 'hrs',
      mins: 'min',
      secs: 'sec',
      closed: 'SUBMISSIONS CLOSED',
      aria: 'Time left until the deadline',
    },
    sections: {
      delta: 'How to take part',
      brief: 'Brief',
      submit: 'How to submit',
      criteria: 'Criteria',
      prizes: 'Prizes',
      tips: 'Tips',
      rules: 'Rules',
    },
    participationLead:
      'Build your game on your own — wherever, whenever and however you like. You only submit it in our Discord, where the community + jury judge it.',
    requirements: [
      {
        title: 'Be a member of our Discord',
        body: 'The hackathon runs in the community. You must be in the opensverige Discord to take part and submit.',
      },
      {
        title: 'Submit in the right channel',
        body: `All submissions go in ${ch}. Games posted anywhere else don't count.`,
      },
    ],
    submitPrefix: 'Post in',
    submitBy: 'by',
    submit: [
      { text: 'Link to the game — itch.io, GitHub Pages, or a zip + instructions' },
      { text: 'Short description: what is the game and how do you play it?' },
      { text: 'GitHub link with open source', bonus: true },
    ],
    facts: [
      { label: 'When', value: 'Running now · 1 week' },
      { label: 'Theme', value: 'Build a small game' },
      { label: 'Tech', value: 'Any genre & engine — Godot, Unity, Pygame, web…' },
      { label: 'Requirement', value: 'Playable: at least one loop or level. No size or graphics requirement.' },
      { label: 'Submission', value: `By Sunday 14 June 00:00 in ${ch}` },
    ],
    criteriaLead:
      'The community votes for fun-factor, a small jury judges the whole. 1–5 points per criterion — highest total wins.',
    votingPrefix: 'Upvoting happens via reactions in',
    votingSuffix:
      '— also after submission. Community votes count toward the judging.',
    criteria: [
      { no: '01', name: 'Fun factor', body: 'Is it fun to play? Do you want to play more? Community votes weigh heavily here.', weight: 4 },
      { no: '02', name: 'Creativity & idea', body: 'Something unexpected, original or clever? An idea that stands out.', weight: 3 },
      { no: '03', name: 'Polish & playability', body: 'Does it feel finished? Do the controls, feel and flow work without friction?', weight: 3 },
      { no: '04', name: 'OpenSweden & Future', body: 'Open source on GitHub? Easy to reuse or build on? Potential as a base for other projects?', weight: 5, extra: true },
    ],
    prizes: [
      { name: '8Bitdo Retro Mechanical Keyboard', detail: 'Hot-swappable · Nordic' },
      { name: '8Bitdo N30 Wireless Mouse', detail: 'Retro' },
      { name: 'Marhynchus Mini Mechanical Macropad', detail: 'With knob & RGB' },
      { name: '1000 kr at grunden.ai', detail: 'GLM 5.1' },
    ],
    tips: [
      'Keep the scope small. A loop that works beats a big idea that never ships.',
      'Make it playable in the browser if you can (itch.io HTML5 / GitHub Pages) — more people can test and vote.',
      'Put the code openly on GitHub from day one. It weighs extra with the jury and helps others build on it.',
      'One clear core mechanic beats ten half-finished ones. Polish what already works.',
      'Write one line on how to play in your submission. A confused judge votes low.',
    ],
    rules: [
      "Your game must be built during the hackathon week. We don't accept games started or built beforehand.",
      'The competition is open to participants in Sweden.',
      'By submitting, you confirm the entry is your own and made during the period.',
      'The organizer has the final say on judging and any disputes.',
    ],
    support: 'Questions? Post in #general or #bygg-skiten. Everyone is welcome to take part.',
    wipNote:
      'The hackathon is running now. Open source weighs extra, all levels welcome — bring your idea.',
    footerBack: '← opensverige / lab',
  },
}
