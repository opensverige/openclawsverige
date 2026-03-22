export type Lang = 'sv' | 'en'

export type ResultSlug = 'gollum' | 'dreambuilder' | 'speedrunner' | 'shipper'

export interface TriggeredCombo {
  id: string
  callout: BilingualString
}

export interface ScoringResult {
  ship: number
  aiDep: number
  baseShip: number
  baseAiDep: number
  archetype: ResultSlug
  triggeredCombos: TriggeredCombo[]
  mirrors: BilingualString[]
}

export type QuizView =
  | { screen: 'landing' }
  | { screen: 'question'; index: number }
  | { screen: 'result'; slug: ResultSlug; scoringResult: ScoringResult | null }

export interface BilingualString {
  sv: string
  en: string
}

export interface Answer {
  id: 'A' | 'B' | 'C' | 'D'
  text: BilingualString
  shipDelta: number
  aiDepDelta: number
}

export interface Question {
  id: number
  text: BilingualString
  answers: [Answer, Answer, Answer, Answer]
}

export interface ResultData {
  slug: ResultSlug
  emoji: string
  name: BilingualString
  /** Short punchy line shown in badge and OG image */
  headline: BilingualString
  /** Full diagnosis body copy */
  body: BilingualString
  /** Action recipe / red pill */
  recipe: BilingualString
  type: 'gollum' | 'dreambuilder' | 'speedrunner' | 'shipper'
}
