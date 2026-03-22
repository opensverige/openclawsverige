export type Lang = 'sv' | 'en'

export type ResultSlug = 'gollum' | 'dreambuilder' | 'speedrunner' | 'shipper'

export type QuizView =
  | { screen: 'landing' }
  | { screen: 'question'; index: number }
  | { screen: 'result'; slug: ResultSlug }

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
  /** First sentence shown in badge and as OG sub-copy */
  headline: BilingualString
  /** Full body copy shown below headline */
  body: BilingualString
  recipe: BilingualString
  /** Result type: affects recipe box color and whether AntiSycophancy or ShipperMentor is shown */
  type: 'gollum' | 'dreambuilder' | 'speedrunner' | 'shipper'
}

export interface Scores {
  ship: number
  aiDep: number
}
