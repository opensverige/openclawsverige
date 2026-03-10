import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  extractJsonObject,
  mapDbRowToScoreRecord,
  parseOpenScoreResponse,
  type IdeaScoreDbRow,
} from "@/lib/openscore/openscore";
import {
  composePromptFromTemplate,
  getActivePromptTemplate,
} from "@/lib/openscore/prompt-config";
import {
  buildResearchPrompt,
  parseResearchResponse,
  type ResearchRunResult,
} from "@/lib/openscore/research";
import {
  OPEN_SCORE_JSON_SCHEMA,
  OPEN_SCORE_SYSTEM_PROMPT,
} from "@/lib/openscore/score-config";
import { getOpenAIClient, getSupabaseAdminClient } from "@/lib/openscore/server-clients";

interface ScoreJobDbRow {
  id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  idea: string;
  status: "queued" | "research_running" | "scoring" | "completed" | "failed";
  status_message: string | null;
  progress_events: unknown;
  research_response_id: string | null;
  research_model: string | null;
  research_prompt: string | null;
  research_output: string | null;
  research_source_count: number | null;
  research_sources: unknown;
  research_actions: unknown;
  research_raw_response: unknown;
  score_model: string | null;
  idea_score_id: string | null;
  error_message: string | null;
}

interface JobPayload {
  id: string;
  status: ScoreJobDbRow["status"];
  statusMessage: string | null;
  progressEvents: string[];
  errorMessage: string | null;
  ideaScoreId: string | null;
}

export const runtime = "nodejs";
export const maxDuration = 240;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = getSupabaseAdminClient();
  const openai = getOpenAIClient();

  try {
    const authorizationHeader = request.headers.get("authorization");
    const token = authorizationHeader?.startsWith("Bearer ")
      ? authorizationHeader.slice(7).trim()
      : null;

    if (!token) {
      return NextResponse.json({ error: "du måste vara inloggad" }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "du måste vara inloggad" }, { status: 401 });
    }

    const row = await getJobRow(supabase, id, user.id);
    if (!row) {
      return NextResponse.json({ error: "jobbet hittades inte" }, { status: 404 });
    }

    const nextRow = await advanceJobIfNeeded(supabase, openai, row);

    let record = null;
    if (nextRow.status === "completed" && nextRow.idea_score_id) {
      const { data } = await supabase
        .from("openscore_idea_scores")
        .select("*")
        .eq("id", nextRow.idea_score_id)
        .single();

      if (data) {
        try {
          record = mapDbRowToScoreRecord(data as IdeaScoreDbRow);
        } catch {
          record = null;
        }
      }
    }

    return NextResponse.json(
      {
        job: serializeJob(nextRow),
        record,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("openscore jobs route error", error);
    if (process.env.NODE_ENV !== "production") {
      const message =
        error instanceof Error ? error.message : "kunde inte läsa jobbstatus";
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json({ error: "kunde inte läsa jobbstatus" }, { status: 500 });
  }
}

async function advanceJobIfNeeded(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  openai: ReturnType<typeof getOpenAIClient>,
  row: ScoreJobDbRow,
): Promise<ScoreJobDbRow> {
  if (row.status === "queued") {
    return startResearch(supabase, openai, row);
  }

  if (row.status === "research_running") {
    return continueResearch(supabase, openai, row);
  }

  if (row.status === "scoring") {
    return continueScoring(supabase, openai, row);
  }

  return row;
}

async function startResearch(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  openai: ReturnType<typeof getOpenAIClient>,
  row: ScoreJobDbRow,
): Promise<ScoreJobDbRow> {
  const researchModel =
    process.env.OPENAI_RESEARCH_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const researchPrompt = buildResearchPrompt(row.idea);

  const response = await openai.responses.create({
    model: researchModel,
    input: researchPrompt,
    tools: [{ type: "web_search_preview" }],
    include: ["web_search_call.action.sources"],
    background: true,
  });

  const events = appendEvent(
    parseProgressEvents(row.progress_events),
    `Research startad (${response.id})`,
  );

  return updateJob(supabase, row.id, {
    status: "research_running",
    status_message: "Research pågår...",
    progress_events: events,
    research_response_id: response.id,
    research_model: researchModel,
    research_prompt: researchPrompt,
    error_message: null,
  });
}

async function continueResearch(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  openai: ReturnType<typeof getOpenAIClient>,
  row: ScoreJobDbRow,
): Promise<ScoreJobDbRow> {
  if (!row.research_response_id) {
    return markJobFailed(supabase, row, "saknar research_response_id");
  }

  const response = await openai.responses.retrieve(row.research_response_id);

  if (response.status === "queued" || response.status === "in_progress") {
    return updateJob(supabase, row.id, {
      status_message: "Research pågår i OpenAI...",
    });
  }

  if (
    response.status === "failed" ||
    response.status === "cancelled" ||
    response.status === "incomplete"
  ) {
    return markJobFailed(
      supabase,
      row,
      `research misslyckades (${response.status})`,
      response,
    );
  }

  if (response.status !== "completed") {
    return updateJob(supabase, row.id, {
      status_message: `Väntar på research-status (${response.status})...`,
    });
  }

  let researchResult: ResearchRunResult;
  try {
    researchResult = parseResearchResponse(
      response,
      row.research_prompt ?? buildResearchPrompt(row.idea),
    );
  } catch {
    return markJobFailed(supabase, row, "ogiltigt research-svar", response);
  }

  const scoringEvents = appendEvent(
    appendEvent(parseProgressEvents(row.progress_events), "Research klar"),
    "Poängsätter idé...",
  );

  await updateJob(supabase, row.id, {
    status: "scoring",
    status_message: "Poängsätter idé...",
    progress_events: scoringEvents,
    research_output: researchResult.outputText,
    research_source_count: researchResult.sourceCount,
    research_sources: researchResult.sources,
    research_actions: researchResult.actions,
    research_raw_response: researchResult.rawResponse,
  });

  try {
    return finalizeScore(supabase, openai, row, researchResult);
  } catch {
    return markJobFailed(supabase, row, "kunde inte slutföra poängsättning");
  }
}

async function continueScoring(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  openai: ReturnType<typeof getOpenAIClient>,
  row: ScoreJobDbRow,
): Promise<ScoreJobDbRow> {
  const researchResult = buildResearchResultFromJob(row);
  if (!researchResult) {
    return markJobFailed(
      supabase,
      row,
      "saknar researchdata för att fortsätta poängsättning",
    );
  }

  try {
    return finalizeScore(supabase, openai, row, researchResult);
  } catch {
    return markJobFailed(supabase, row, "kunde inte återuppta poängsättning");
  }
}

async function finalizeScore(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  openai: ReturnType<typeof getOpenAIClient>,
  row: ScoreJobDbRow,
  researchResult: ResearchRunResult,
): Promise<ScoreJobDbRow> {
  const template = await getActivePromptTemplate(supabase);
  if (!template) {
    return markJobFailed(supabase, row, "ingen aktiv prompt i databasen");
  }

  const scoringPromptBase = composePromptFromTemplate(template.prompt_text, row.idea);
  const scoringPrompt = `${scoringPromptBase}

---
Researchresultat (från o3-deep-research med webbkällor):
${researchResult.outputText}

Källor:
${researchResult.sources.map((source) => `- ${source.title}: ${source.url}`).join("\n") || "- Inga källor rapporterade"}`;

  const scoreModel = process.env.OPENAI_SCORE_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o";

  const completion = await openai.chat.completions.create({
    model: scoreModel,
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: OPEN_SCORE_JSON_SCHEMA,
    },
    messages: [
      { role: "system", content: OPEN_SCORE_SYSTEM_PROMPT },
      { role: "user", content: scoringPrompt },
    ],
  });

  const rawText = completion.choices[0]?.message?.content?.trim() ?? "";
  if (!rawText) {
    return markJobFailed(supabase, row, "tomt AI-svar vid poängsättning");
  }

  let parsedResult;
  try {
    parsedResult = parseOpenScoreResponse(extractJsonObject(rawText));
  } catch {
    return markJobFailed(supabase, row, "ogiltigt AI-svar vid poängsättning");
  }

  const ideaScoreId = randomUUID();
  const inferredContext = `Utläses ur idébeskrivningen: ${row.idea}`;

  const { data, error } = await supabase
    .from("openscore_idea_scores")
      .insert({
        id: ideaScoreId,
        submitted_input: {
          idea: row.idea,
        },
        idea: row.idea,
        target_audience: inferredContext,
      core_problem: inferredContext,
      solution: inferredContext,
      team_skills: inferredContext,
      raw_prompt: scoringPrompt,
      raw_response: {
        provider: "openai",
        model: scoreModel,
        response_text: rawText,
        parsed: parsedResult,
        research_model: row.research_model,
        research: {
          model: row.research_model,
          output: researchResult.outputText,
          source_count: researchResult.sourceCount,
          sources: researchResult.sources,
          actions: researchResult.actions,
        },
      },
      total_score: parsedResult.total_score,
      confidence_score: parsedResult.confidence_score,
      unfair_advantage_score: parsedResult.unfair_advantage_score,
      kill_signal_count: parsedResult.kill_signal_count,
      verdict: parsedResult.verdict,
      brutal_summary: parsedResult.brutal_summary,
      failure_reason: parsedResult.failure_reason,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return markJobFailed(supabase, row, "kunde inte spara score");
  }

  const researchInsert = await supabase.from("openscore_research_runs").insert({
    idea_score_id: ideaScoreId,
    idea: row.idea,
    research_model: row.research_model ?? "o3-deep-research",
    research_prompt: researchResult.researchPrompt,
    research_output: researchResult.outputText,
    source_count: researchResult.sourceCount,
    sources: researchResult.sources,
    raw_response: researchResult.rawResponse,
    status: "completed",
  });

  if (researchInsert.error) {
    await supabase.from("openscore_idea_scores").delete().eq("id", ideaScoreId);
    return markJobFailed(supabase, row, "kunde inte spara research-resultat");
  }

  const completedEvents = appendEvent(
    appendEvent(parseProgressEvents(row.progress_events), "Poängsättning klar"),
    "Resultat sparat",
  );

  return updateJob(supabase, row.id, {
    status: "completed",
    status_message: "Klar",
    progress_events: completedEvents,
    score_model: scoreModel,
    idea_score_id: ideaScoreId,
    error_message: null,
  });
}

async function markJobFailed(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  row: ScoreJobDbRow,
  message: string,
  researchRawResponse?: unknown,
): Promise<ScoreJobDbRow> {
  const events = appendEvent(parseProgressEvents(row.progress_events), `Fel: ${message}`);

  return updateJob(supabase, row.id, {
    status: "failed",
    status_message: "Misslyckades",
    progress_events: events,
    error_message: message,
    ...(researchRawResponse ? { research_raw_response: researchRawResponse } : {}),
  });
}

async function getJobRow(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  id: string,
  userId: string,
): Promise<ScoreJobDbRow | null> {
  const { data, error } = await supabase
    .from("openscore_score_jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as ScoreJobDbRow;
}

async function updateJob(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  id: string,
  patch: Partial<ScoreJobDbRow>,
): Promise<ScoreJobDbRow> {
  const { data, error } = await supabase
    .from("openscore_score_jobs")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("failed to update score job");
  }

  return data as ScoreJobDbRow;
}

function serializeJob(row: ScoreJobDbRow): JobPayload {
  return {
    id: row.id,
    status: row.status,
    statusMessage: row.status_message,
    progressEvents: parseProgressEvents(row.progress_events),
    errorMessage: row.error_message,
    ideaScoreId: row.idea_score_id,
  };
}

function parseProgressEvents(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function appendEvent(events: string[], message: string): string[] {
  return [...events, `${new Date().toISOString()} - ${message}`].slice(-40);
}

function buildResearchResultFromJob(row: ScoreJobDbRow): ResearchRunResult | null {
  const outputText = typeof row.research_output === "string" ? row.research_output.trim() : "";
  if (!outputText) {
    return null;
  }

  const sourceCount =
    typeof row.research_source_count === "number" && row.research_source_count >= 0
      ? row.research_source_count
      : 0;

  const sources = Array.isArray(row.research_sources)
    ? row.research_sources
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const source = item as Record<string, unknown>;
          const url = typeof source.url === "string" ? source.url.trim() : "";
          if (!url) {
            return null;
          }
          const title =
            typeof source.title === "string" && source.title.trim()
              ? source.title.trim()
              : url;
          return { title, url };
        })
        .filter((item): item is { title: string; url: string } => item !== null)
    : [];

  const actions = Array.isArray(row.research_actions)
    ? row.research_actions
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const action = item as Record<string, unknown>;
          return {
            type:
              typeof action.type === "string" && action.type.trim()
                ? action.type.trim()
                : "unknown",
            status:
              typeof action.status === "string" && action.status.trim()
                ? action.status.trim()
                : "unknown",
            query:
              typeof action.query === "string" && action.query.trim()
                ? action.query.trim()
                : null,
            url:
              typeof action.url === "string" && action.url.trim()
                ? action.url.trim()
                : null,
            pattern:
              typeof action.pattern === "string" && action.pattern.trim()
                ? action.pattern.trim()
                : null,
          };
        })
        .filter(
          (
            item,
          ): item is {
            type: string;
            status: string;
            query: string | null;
            url: string | null;
            pattern: string | null;
          } => item !== null,
        )
    : [];

  return {
    researchPrompt: row.research_prompt ?? buildResearchPrompt(row.idea),
    outputText,
    sourceCount,
    sources,
    actions,
    rawResponse: row.research_raw_response ?? {},
  };
}
