import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  assertIdeaInput,
  extractJsonObject,
  mapDbRowToScoreRecord,
  parseOpenScoreResponse,
  type IdeaScoreDbRow,
} from "@/lib/openscore/openscore";
import {
  composePromptFromTemplate,
  getActivePromptTemplate,
} from "@/lib/openscore/prompt-config";
import { runDeepResearch } from "@/lib/openscore/research";
import {
  OPEN_SCORE_JSON_SCHEMA,
  OPEN_SCORE_SYSTEM_PROMPT,
} from "@/lib/openscore/score-config";
import { getOpenAIClient, getSupabaseAdminClient } from "@/lib/openscore/server-clients";

export const runtime = "nodejs";
export const maxDuration = 240;

export async function POST(request: Request) {
  const supabase = getSupabaseAdminClient();
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

  let input;

  try {
    const payload = await request.json();
    input = assertIdeaInput(payload);
  } catch {
    return NextResponse.json({ error: "kunde inte poängsätta idé" }, { status: 400 });
  }

  const openai = getOpenAIClient();

  let promptTemplate = "";
  try {
    const template = await getActivePromptTemplate(supabase);
    if (!template) {
      return NextResponse.json(
        { error: "ingen aktiv prompt hittades i databasen" },
        { status: 400 },
      );
    }
    promptTemplate = template.prompt_text;
  } catch {
    return NextResponse.json(
      { error: "kunde inte läsa prompt från databasen" },
      { status: 500 },
    );
  }

  const researchModel =
    process.env.OPENAI_RESEARCH_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  let researchResult;

  try {
    researchResult = await runDeepResearch(openai, input.idea, researchModel);
  } catch {
    return NextResponse.json(
      { error: "kunde inte köra o3-deep-research" },
      { status: 502 },
    );
  }

  const scoringPromptBase = composePromptFromTemplate(promptTemplate, input.idea);
  const scoringPrompt = `${scoringPromptBase}

---
Researchresultat (från o3-deep-research med webbkällor):
${researchResult.outputText}

Källor:
${researchResult.sources.map((source) => `- ${source.title}: ${source.url}`).join("\n") || "- Inga källor rapporterade"}`;

  const scoreModel = process.env.OPENAI_SCORE_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o";
  let rawText = "";

  try {
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

    rawText = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!rawText) {
      throw new Error("empty ai response");
    }
  } catch {
    return NextResponse.json({ error: "kunde inte poängsätta idé" }, { status: 502 });
  }

  let parsedResult;
  try {
    const parsedJson = extractJsonObject(rawText);
    parsedResult = parseOpenScoreResponse(parsedJson);
  } catch {
    return NextResponse.json({ error: "ogiltigt AI-svar" }, { status: 502 });
  }

  const ideaScoreId = randomUUID();
  const inferredContext = `Utläses ur idébeskrivningen: ${input.idea}`;

  try {
    const { data, error } = await supabase
      .from("openscore_idea_scores")
      .insert({
        id: ideaScoreId,
        submitted_input: {
          idea: input.idea,
        },
        idea: input.idea,
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
          research_model: researchModel,
          research: {
            model: researchModel,
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
      .select("*")
      .single();

    if (error || !data) {
      throw error ?? new Error("missing insert data");
    }

    const researchInsert = await supabase.from("openscore_research_runs").insert({
      idea_score_id: ideaScoreId,
      idea: input.idea,
      research_model: researchModel,
      research_prompt: researchResult.researchPrompt,
      research_output: researchResult.outputText,
      source_count: researchResult.sourceCount,
      sources: researchResult.sources,
      raw_response: researchResult.rawResponse,
      status: "completed",
    });

    if (researchInsert.error) {
      await supabase.from("openscore_idea_scores").delete().eq("id", ideaScoreId);
      throw researchInsert.error;
    }

    const record = mapDbRowToScoreRecord(data as IdeaScoreDbRow);
    return NextResponse.json({ record }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "kunde inte spara score + research" },
      { status: 500 },
    );
  }
}
