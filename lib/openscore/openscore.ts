export const VERDICTS = ["BUILD", "PIVOT", "KILL"] as const;
export type Verdict = (typeof VERDICTS)[number];

export type RiskImpact = "low" | "medium" | "high";

export interface IdeaInput {
  idea: string;
}

export interface TopRisk {
  risk: string;
  probability: number;
  impact: RiskImpact;
}

export interface ResearchSource {
  title: string;
  url: string;
}

export interface ResearchAction {
  type: string;
  status: string;
  query: string | null;
  url: string | null;
  pattern: string | null;
}

export interface ResearchInfo {
  model: string;
  output: string;
  sourceCount: number;
  sources: ResearchSource[];
  actions: ResearchAction[];
}

export interface OpenScoreResult {
  total_score: number;
  confidence_score: number;
  unfair_advantage_score: number;
  kill_signal_count: number;
  verdict: Verdict;
  strengths: string[];
  weaknesses: string[];
  top_risks: TopRisk[];
  kill_signals: string[];
  brutal_summary: string;
  failure_reason: string;
  build_realism: string;
  need_severity: string;
  monetization_reality: string;
  differentiation: string;
}

export interface ScoreRecord {
  id: string;
  createdAt: string;
  submittedInput: IdeaInput;
  idea: string;
  targetAudience: string;
  coreProblem: string;
  solution: string;
  teamSkills: string;
  totalScore: number;
  confidenceScore: number;
  unfairAdvantageScore: number;
  killSignalCount: number;
  verdict: Verdict;
  brutalSummary: string;
  failureReason: string;
  result: OpenScoreResult;
  research: ResearchInfo | null;
}

export type OpenScoreViewState = "empty" | "loading" | "success" | "error";

export interface IdeaScoreDbRow {
  id: string;
  created_at: string;
  submitted_input: unknown;
  idea: string;
  target_audience: string;
  core_problem: string;
  solution: string;
  team_skills: string;
  raw_prompt: string;
  raw_response: unknown;
  total_score: number | null;
  confidence_score: number | null;
  unfair_advantage_score: number | null;
  kill_signal_count: number | null;
  verdict: string | null;
  brutal_summary: string | null;
  failure_reason: string | null;
}

const fieldMinimums: Record<keyof IdeaInput, number> = {
  idea: 20,
};

export function validateIdeaInput(
  input: IdeaInput,
): Partial<Record<keyof IdeaInput, string>> {
  const errors: Partial<Record<keyof IdeaInput, string>> = {};

  (Object.keys(fieldMinimums) as (keyof IdeaInput)[]).forEach((field) => {
    const value = input[field].trim();
    if (!value) {
      errors[field] = "Obligatoriskt";
      return;
    }

    if (value.length < fieldMinimums[field]) {
      errors[field] = `Använd minst ${fieldMinimums[field]} tecken`;
    }
  });

  return errors;
}

export function assertIdeaInput(payload: unknown): IdeaInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("invalid payload");
  }

  const candidate = payload as Record<string, unknown>;
  const input: IdeaInput = {
    idea: asNonEmptyString(candidate.idea, "idea"),
  };

  const errors = validateIdeaInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error("invalid payload");
  }

  return input;
}

export function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();
  const normalized = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(normalized);
  } catch {
    const start = normalized.indexOf("{");
    const end = normalized.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("invalid json");
    }
    return JSON.parse(normalized.slice(start, end + 1));
  }
}

export function parseOpenScoreResponse(payload: unknown): OpenScoreResult {
  if (!payload || typeof payload !== "object") {
    throw new Error("invalid AI response");
  }

  const data = payload as Record<string, unknown>;
  const verdict = asNonEmptyString(data.verdict, "verdict").toUpperCase();
  if (!VERDICTS.includes(verdict as Verdict)) {
    throw new Error("invalid verdict");
  }

  return {
    total_score: asIntegerInRange(data.total_score, "total_score", 0, 100),
    confidence_score: asIntegerInRange(
      data.confidence_score,
      "confidence_score",
      0,
      10,
    ),
    unfair_advantage_score: asIntegerInRange(
      data.unfair_advantage_score,
      "unfair_advantage_score",
      0,
      5,
    ),
    kill_signal_count: asIntegerInRange(
      data.kill_signal_count,
      "kill_signal_count",
      0,
      Number.MAX_SAFE_INTEGER,
    ),
    verdict: verdict as Verdict,
    strengths: asStringArray(data.strengths, "strengths"),
    weaknesses: asStringArray(data.weaknesses, "weaknesses"),
    top_risks: asTopRisks(data.top_risks),
    kill_signals: asStringArray(data.kill_signals, "kill_signals"),
    brutal_summary: asNonEmptyString(data.brutal_summary, "brutal_summary"),
    failure_reason: asNonEmptyString(data.failure_reason, "failure_reason"),
    build_realism: asNonEmptyString(data.build_realism, "build_realism"),
    need_severity: asNonEmptyString(data.need_severity, "need_severity"),
    monetization_reality: asNonEmptyString(
      data.monetization_reality,
      "monetization_reality",
    ),
    differentiation: asNonEmptyString(data.differentiation, "differentiation"),
  };
}

export function mapDbRowToScoreRecord(row: IdeaScoreDbRow): ScoreRecord {
  const rawResponse =
    row.raw_response && typeof row.raw_response === "object"
      ? (row.raw_response as Record<string, unknown>)
      : {};

  const parsed = parseOpenScoreResponse(rawResponse.parsed);
  const research = parseResearchInfo(rawResponse.research);
  const submittedInput = parseSubmittedInput(row.submitted_input, row.idea);

  return {
    id: row.id,
    createdAt: row.created_at,
    submittedInput,
    idea: row.idea,
    targetAudience: row.target_audience,
    coreProblem: row.core_problem,
    solution: row.solution,
    teamSkills: row.team_skills,
    totalScore: parsed.total_score,
    confidenceScore: parsed.confidence_score,
    unfairAdvantageScore: parsed.unfair_advantage_score,
    killSignalCount: parsed.kill_signal_count,
    verdict: parsed.verdict,
    brutalSummary: parsed.brutal_summary,
    failureReason: parsed.failure_reason,
    result: parsed,
    research,
  };
}

function parseSubmittedInput(value: unknown, fallbackIdea: string): IdeaInput {
  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    if (typeof candidate.idea === "string" && candidate.idea.trim()) {
      return {
        idea: candidate.idea.trim(),
      };
    }
  }

  return {
    idea: fallbackIdea,
  };
}

function parseResearchInfo(value: unknown): ResearchInfo | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const output =
    typeof candidate.output === "string" ? candidate.output.trim() : "";
  if (!output) {
    return null;
  }

  const model =
    typeof candidate.model === "string" && candidate.model.trim()
      ? candidate.model.trim()
      : "unknown";

  const sourceCount =
    typeof candidate.source_count === "number" &&
    Number.isInteger(candidate.source_count) &&
    candidate.source_count >= 0
      ? candidate.source_count
      : 0;

  const sources = Array.isArray(candidate.sources)
    ? candidate.sources
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const source = item as Record<string, unknown>;
          const url =
            typeof source.url === "string" ? source.url.trim() : "";
          if (!url) {
            return null;
          }
          const title =
            typeof source.title === "string" && source.title.trim()
              ? source.title.trim()
              : url;
          return { title, url };
        })
        .filter((item): item is ResearchSource => item !== null)
    : [];

  const actions = Array.isArray(candidate.actions)
    ? candidate.actions
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const row = item as Record<string, unknown>;

          const type =
            typeof row.type === "string" && row.type.trim()
              ? row.type.trim()
              : "unknown";
          const status =
            typeof row.status === "string" && row.status.trim()
              ? row.status.trim()
              : "unknown";
          const query =
            typeof row.query === "string" && row.query.trim()
              ? row.query.trim()
              : null;
          const url =
            typeof row.url === "string" && row.url.trim() ? row.url.trim() : null;
          const pattern =
            typeof row.pattern === "string" && row.pattern.trim()
              ? row.pattern.trim()
              : null;

          return { type, status, query, url, pattern };
        })
        .filter((item): item is ResearchAction => item !== null)
    : [];

  return {
    model,
    output,
    sourceCount,
    sources,
    actions,
  };
}

function asNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${field} must not be empty`);
  }

  return normalized;
}

function asIntegerInRange(
  value: unknown,
  field: string,
  min: number,
  max: number,
): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${field} must be an integer`);
  }
  if (value < min || value > max) {
    throw new Error(`${field} out of range`);
  }
  return value;
}

function asStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array`);
  }

  const parsed = value
    .map((item) => {
      if (typeof item !== "string") {
        throw new Error(`${field} must contain strings`);
      }
      return item.trim();
    })
    .filter(Boolean);

  if (parsed.length === 0) {
    throw new Error(`${field} must not be empty`);
  }

  return parsed;
}

function asTopRisks(value: unknown): TopRisk[] {
  if (!Array.isArray(value)) {
    throw new Error("top_risks must be an array");
  }

  const parsed = value.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("invalid risk item");
    }

    const risk = item as Record<string, unknown>;
    const impactValue = asNonEmptyString(risk.impact, "impact").toLowerCase();

    if (!["low", "medium", "high"].includes(impactValue)) {
      throw new Error("impact must be low, medium, or high");
    }

    return {
      risk: asNonEmptyString(risk.risk, "risk"),
      probability: asIntegerInRange(risk.probability, "probability", 0, 100),
      impact: impactValue as RiskImpact,
    };
  });

  if (parsed.length === 0) {
    throw new Error("top_risks must not be empty");
  }

  return parsed;
}
