import type { Answer, ResultSlug, Scores } from './types'

/**
 * Accumulates ship and aiDep scores from selected answers.
 * answers[i] is the selected Answer for question i.
 */
export function calculateScores(answers: Answer[]): Scores {
  return answers.reduce(
    (acc, a) => ({ ship: acc.ship + a.shipDelta, aiDep: acc.aiDep + a.aiDepDelta }),
    { ship: 0, aiDep: 0 }
  )
}

/**
 * Maps scores to result slug using the 2x2 matrix.
 * Ranges: ship -6..+6, aiDep -3..+8
 *
 *           aiDep < 3     aiDep >= 3
 * ship >= 2  dreambuilder   gollum
 * ship <  2  shipper        speedrunner
 */
export function getResult(scores: Scores): ResultSlug {
  const { ship, aiDep } = scores
  if (ship >= 2 && aiDep >= 3) return 'gollum'
  if (ship >= 2 && aiDep <  3) return 'dreambuilder'
  if (ship <  2 && aiDep >= 3) return 'speedrunner'
  return 'shipper'
}
