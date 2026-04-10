import type { Answer, BilingualString, ResultSlug, ScoringResult, TriggeredCombo } from './types'
import { MIRROR_MAP, PRIORITY_ORDER } from './quiz-data'

interface ComboDefinition {
  id: string
  check: (a: Answer[]) => boolean
  bonusShip: number
  bonusAiDep: number
  callout: BilingualString
}

// answers[i] = answer to question (i+1), i.e. answers[0] = Q1, answers[5] = Q6
const COMBOS: ComboDefinition[] = [
  {
    id: 'gollum-lock',
    check: (a) => a[0]?.id === 'C' && a[3]?.id === 'B',
    bonusShip: 2, bonusAiDep: 2,
    callout: {
      sv: 'Din AI tycker idén är bra (Q1) OCH AI:s marknadsanalys ger dig trygghet (Q4). Slutet kretslopp — ingen människa i loopen.',
      en: 'Your AI thinks the idea is great (Q1) AND AI market analysis gives you comfort (Q4). Closed loop — no humans involved.',
    },
  },
  {
    id: 'precious-lock',
    check: (a) => a[0]?.id === 'D' && a[1]?.id === 'D',
    bonusShip: 2, bonusAiDep: 0,
    callout: {
      sv: '"Inte redo" (Q1) + "för tidigt" (Q2). Dubbelt undvikande. Idén är inte redo för att DU inte är redo att bli bedömd.',
      en: '"Not ready" (Q1) + "too early" (Q2). Double avoidance. The idea isn\'t ready because YOU aren\'t ready to be judged.',
    },
  },
  {
    id: 'ai-sycophancy',
    check: (a) => a[2]?.id === 'A' && a[3]?.id === 'B',
    bonusShip: 0, bonusAiDep: 3,
    callout: {
      sv: 'Skrotade approach vid AI-press (Q3) OCH litar på AI-marknadsanalys (Q4). Outsourcat omdöme.',
      en: 'Scrapped approach under AI pressure (Q3) AND trusts AI market analysis (Q4). Outsourced judgement.',
    },
  },
  {
    id: 'speedrunner-lock',
    check: (a) => a[4]?.id === 'A' && a[2]?.id === 'A',
    bonusShip: 0, bonusAiDep: 2,
    callout: {
      sv: 'Shippar snabbt (Q5) men skrotar approach när AI säger till (Q3). Velocity utan autonomi.',
      en: 'Ships fast (Q5) but scraps approach when AI says to (Q3). Velocity without autonomy.',
    },
  },
  {
    id: 'dreambuilder-lock',
    check: (a) => a[0]?.id === 'D' && a[4]?.id === 'C' && a[3]?.id === 'D',
    bonusShip: 2, bonusAiDep: 0,
    callout: {
      sv: '"Inte redo" + "i flowet" + "behöver ingen bekräftelse" = monument som aldrig blir klart.',
      en: '"Not ready" + "in the zone" + "no confirmation needed" = a monument that never gets finished.',
    },
  },
  {
    id: 'shipper-lock',
    check: (a) => a[0]?.id === 'A' && a[1]?.id === 'A' && a[4]?.id === 'A',
    bonusShip: -2, bonusAiDep: -1,
    callout: {
      sv: 'Demot live + betalande users + pushar och postar. Full reality-kontakt.',
      en: 'Demoed live + paying users + pushes and posts. Full reality contact.',
    },
  },
  {
    id: 'paralysis-flag',
    check: (a) => a[2]?.id === 'D' && a[1]?.id === 'C',
    bonusShip: 1, bonusAiDep: 1,
    callout: {
      sv: 'Googlar best practices 3h (Q3) + "har en plan" (Q2). Planering som substitut för exekvering.',
      en: 'Googles best practices for 3h (Q3) + "has a plan" (Q2). Planning as a substitute for execution.',
    },
  },
  {
    id: 'therapist-loop',
    check: (a) => a[6]?.id === 'A' && a[3]?.id === 'B',
    bonusShip: 0, bonusAiDep: 3,
    callout: {
      sv: 'Ny AI-chat vid varje problem (Q7) + AI-marknadsanalys som trygghet (Q4). AI:n är din terapeut, rådgivare och ja-sägare.',
      en: 'New AI chat at every problem (Q7) + AI market analysis for comfort (Q4). The AI is your therapist, advisor, and yes-man.',
    },
  },
  {
    id: 'echo-chamber',
    check: (a) => a[7]?.id === 'C' && a[8]?.id === 'B',
    bonusShip: 1, bonusAiDep: 3,
    callout: {
      sv: 'Ber AI motbevisa mänsklig kritik (Q8) + bästa ögonblicket var AI-beröm (Q9). Echo chamber — AI bekräftar och försvarar dig mot omvärlden.',
      en: 'Asks AI to disprove human criticism (Q8) + best moment was AI praise (Q9). Echo chamber — AI confirms and defends you against the outside world.',
    },
  },
  {
    id: 'exposed-builder',
    check: (a) => a[5]?.id === 'A' && a[6]?.id === 'B' && a[4]?.id === 'A',
    bonusShip: -2, bonusAiDep: -1,
    callout: {
      sv: 'Delar messy kod (Q6) + ber community om hjälp (Q7) + pushar och postar (Q5). Maximalt exponerad. Anti-Gollum.',
      en: 'Shares messy code (Q6) + asks community for help (Q7) + pushes and posts (Q5). Maximally exposed. Anti-Gollum.',
    },
  },
]

function classify(ship: number, aiDep: number): ResultSlug {
  if (ship >= 0 && aiDep >= 2) return 'gollum'
  if (ship >= 0 && aiDep <  2) return 'dreambuilder'
  if (ship <  0 && aiDep >= 2) return 'speedrunner'
  return 'shipper'
}

export function calculateScores(answers: Answer[]): ScoringResult {
  // 1. Base scoring
  let ship = 0
  let aiDep = 0
  for (const a of answers) {
    ship  += a.shipDelta
    aiDep += a.aiDepDelta
  }
  const baseShip = ship
  const baseAiDep = aiDep

  // 2. Combo detection + bonuses
  const triggeredCombos: TriggeredCombo[] = []
  for (const combo of COMBOS) {
    if (combo.check(answers)) {
      ship  += combo.bonusShip
      aiDep += combo.bonusAiDep
      triggeredCombos.push({ id: combo.id, callout: combo.callout })
    }
  }

  // 3. Classify
  const archetype = classify(ship, aiDep)

  // 4. Mirror — top-3 answers that reveal the most for this archetype
  const priority = PRIORITY_ORDER[archetype]
  const mirrors: import('./types').BilingualString[] = []
  for (const qId of priority) {
    const answer = answers[qId - 1]
    if (answer && mirrors.length < 3) {
      const mirrorEntry = MIRROR_MAP[qId]?.[answer.id]
      if (mirrorEntry) mirrors.push(mirrorEntry)
    }
  }

  return { ship, aiDep, baseShip, baseAiDep, archetype, triggeredCombos, mirrors }
}

// Keep for URL-restore path (no answers available)
export function getResult(ship: number, aiDep: number): ResultSlug {
  return classify(ship, aiDep)
}
