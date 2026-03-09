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
import { runDeepResearchStream } from "@/lib/openscore/research";
import {
  OPEN_SCORE_JSON_SCHEMA,
  OPEN_SCORE_SYSTEM_PROMPT,
} from "@/lib/openscore/score-config";
import { getOpenAIClient, getSupabaseAdminClient } from "@/lib/openscore/server-clients";

export const maxDuration = 240;

type ScoreStreamEvent =
  | { type: "status"; message: string }
  | {
      type: "research_event";
      message: string;
      eventType: string;
      sequenceNumber: number | null;
    }
  | { type: "result"; record: ReturnType<typeof mapDbRowToScoreRecord> }
  | { type: "error"; message: string };

function asSseChunk(event: ScoreStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  const encoder = new TextEncoder();
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

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      const close = () => {
        if (isClosed) {
          return;
        }
        isClosed = true;
        try {
          controller.close();
        } catch {
          // Streamen är redan stängd.
        }
      };

      const push = (event: ScoreStreamEvent) => {
        if (isClosed) {
          return;
        }
        try {
          controller.enqueue(encoder.encode(asSseChunk(event)));
        } catch {
          // Klienten kan ha avbrutit anslutningen.
          isClosed = true;
        }
      };

      const fail = (message: string) => {
        push({ type: "error", message });
        close();
      };

      const run = async () => {
        let input;

        try {
          const payload = await request.json();
          input = assertIdeaInput(payload);
        } catch {
          fail("kunde inte poängsätta idé");
          return;
        }

        const openai = getOpenAIClient();

        let promptTemplate = "";
        try {
          push({ type: "status", message: "Läser aktiv prompt..." });
          const template = await getActivePromptTemplate(supabase);
          if (!template) {
            fail("ingen aktiv prompt hittades i databasen");
            return;
          }
          promptTemplate = template.prompt_text;
        } catch {
          fail("kunde inte läsa prompt från databasen");
          return;
        }

        const researchModel =
          process.env.OPENAI_RESEARCH_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
        let researchResult;
        try {
          push({ type: "status", message: "Startar o3 deep research..." });
          researchResult = await runDeepResearchStream(
            openai,
            input.idea,
            researchModel,
            (progress) => {
              push({
                type: "research_event",
                message: progress.message,
                eventType: progress.eventType,
                sequenceNumber: progress.sequenceNumber,
              });
            },
          );
          push({
            type: "status",
            message: `Research klar: ${researchResult.sourceCount} källor`,
          });
        } catch {
          fail("kunde inte köra o3-deep-research");
          return;
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
          push({ type: "status", message: "Poängsätter idén..." });
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
          fail("kunde inte poängsätta idé");
          return;
        }

        let parsedResult;
        try {
          const parsedJson = extractJsonObject(rawText);
          parsedResult = parseOpenScoreResponse(parsedJson);
        } catch {
          fail("ogiltigt AI-svar");
          return;
        }

        const ideaScoreId = randomUUID();
        const inferredContext = `Utläses ur idébeskrivningen: ${input.idea}`;

        try {
          push({ type: "status", message: "Sparar score och research..." });
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
          push({ type: "result", record });
          close();
        } catch {
          fail("kunde inte spara score + research");
        }
      };

      void run();
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
