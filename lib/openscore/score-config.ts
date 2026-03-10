export const OPEN_SCORE_SYSTEM_PROMPT = `You are OpenSverige's brutal startup validator.
Be cynical, practical, and specific.
Avoid hype, inspiration, fluff, and generic startup advice.
Prioritize realism, execution risk, distribution risk, and monetization truth.
Kill weak ideas fast.
Write all descriptive text values in Swedish.
Keep enum values exactly as:
- verdict: BUILD, PIVOT, or KILL
- top_risks[].impact: low, medium, or high
Return strict JSON only, no markdown.`;

export const OPEN_SCORE_JSON_SCHEMA = {
  name: "openscore_result",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      total_score: { type: "integer", minimum: 0, maximum: 100 },
      confidence_score: { type: "integer", minimum: 0, maximum: 10 },
      unfair_advantage_score: { type: "integer", minimum: 0, maximum: 5 },
      kill_signal_count: { type: "integer", minimum: 0 },
      verdict: { type: "string", enum: ["BUILD", "PIVOT", "KILL"] },
      strengths: {
        type: "array",
        minItems: 1,
        items: { type: "string", minLength: 1 },
      },
      weaknesses: {
        type: "array",
        minItems: 1,
        items: { type: "string", minLength: 1 },
      },
      top_risks: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            risk: { type: "string", minLength: 1 },
            probability: { type: "integer", minimum: 0, maximum: 100 },
            impact: { type: "string", enum: ["low", "medium", "high"] },
          },
          required: ["risk", "probability", "impact"],
        },
      },
      kill_signals: {
        type: "array",
        minItems: 1,
        items: { type: "string", minLength: 1 },
      },
      brutal_summary: { type: "string", minLength: 1 },
      failure_reason: { type: "string", minLength: 1 },
      build_realism: { type: "string", minLength: 1 },
      need_severity: { type: "string", minLength: 1 },
      monetization_reality: { type: "string", minLength: 1 },
      differentiation: { type: "string", minLength: 1 },
    },
    required: [
      "total_score",
      "confidence_score",
      "unfair_advantage_score",
      "kill_signal_count",
      "verdict",
      "strengths",
      "weaknesses",
      "top_risks",
      "kill_signals",
      "brutal_summary",
      "failure_reason",
      "build_realism",
      "need_severity",
      "monetization_reality",
      "differentiation",
    ],
  },
} as const;
