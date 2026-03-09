import type OpenAI from "openai";

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

export interface ResearchRunResult {
  researchPrompt: string;
  outputText: string;
  sourceCount: number;
  sources: ResearchSource[];
  actions: ResearchAction[];
  rawResponse: unknown;
}

export interface ResearchProgressEvent {
  eventType: string;
  message: string;
  sequenceNumber: number | null;
}

export function buildResearchPrompt(idea: string): string {
  return `Du är en brutal research-analytiker för startupvalidering.

Uppgift:
1. Gör webbresearch om idén nedan.
2. Identifiera konkurrenter, betalningsvilja, marknadssignaler och tydliga risker.
3. Prioritera konkreta fakta med källor.
4. Svara på svenska.
5. Undvik hype och vaga råd.

Idé att undersöka:
${idea}

Outputformat:
- Kort sammanfattning (max 8 rader)
- Konkurrenter (punktlista)
- Marknadssignaler (punktlista)
- Betalningsvilja (punktlista)
- Topprisker (punktlista)
- Rekommendation: BUILD, PIVOT eller KILL
`;
}

export function parseResearchResponse(
  response: unknown,
  researchPrompt: string,
): ResearchRunResult {
  const root = response as Record<string, unknown>;
  const outputText =
    typeof root.output_text === "string" ? root.output_text.trim() : "";

  if (!outputText) {
    throw new Error("empty research response");
  }

  const sources = collectSourcesFromResponse(response);
  const actions = collectActionsFromResponse(response);

  return {
    researchPrompt,
    outputText,
    sourceCount: sources.length,
    sources,
    actions,
    rawResponse: response,
  };
}

export async function runDeepResearch(
  openai: OpenAI,
  idea: string,
  model: string,
): Promise<ResearchRunResult> {
  const researchPrompt = buildResearchPrompt(idea);

  const response = await openai.responses.create({
    model,
    input: researchPrompt,
    tools: [{ type: "web_search_preview" }],
    include: ["web_search_call.action.sources"],
  });

  return parseResearchResponse(response, researchPrompt);
}

export async function runDeepResearchStream(
  openai: OpenAI,
  idea: string,
  model: string,
  onProgress?: (event: ResearchProgressEvent) => void,
): Promise<ResearchRunResult> {
  const researchPrompt = buildResearchPrompt(idea);

  const stream = openai.responses.stream({
    model,
    input: researchPrompt,
    tools: [{ type: "web_search_preview" }],
    include: ["web_search_call.action.sources"],
  });

  try {
    for await (const event of stream) {
      const sequenceNumber =
        typeof event.sequence_number === "number" ? event.sequence_number : null;

      if (event.type === "response.web_search_call.in_progress") {
        onProgress?.({
          eventType: event.type,
          message: "Webbsökning startad",
          sequenceNumber,
        });
      }

      if (event.type === "response.web_search_call.searching") {
        onProgress?.({
          eventType: event.type,
          message: "Söker vidare i källor",
          sequenceNumber,
        });
      }

      if (event.type === "response.web_search_call.completed") {
        onProgress?.({
          eventType: event.type,
          message: "Webbsökning klar",
          sequenceNumber,
        });
      }
    }

    const response = await stream.finalResponse();
    return parseResearchResponse(response, researchPrompt);
  } finally {
    stream.abort();
  }
}

function collectSourcesFromResponse(response: unknown): ResearchSource[] {
  const seen = new Set<string>();
  const results: ResearchSource[] = [];

  const root = response as Record<string, unknown>;
  const output = Array.isArray(root.output) ? root.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = Array.isArray((item as Record<string, unknown>).content)
      ? ((item as Record<string, unknown>).content as unknown[])
      : [];

    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== "object") {
        continue;
      }

      const annotations = Array.isArray(
        (contentItem as Record<string, unknown>).annotations,
      )
        ? ((contentItem as Record<string, unknown>).annotations as unknown[])
        : [];

      for (const annotation of annotations) {
        if (!annotation || typeof annotation !== "object") {
          continue;
        }

        const ann = annotation as Record<string, unknown>;
        const url =
          typeof ann.url === "string"
            ? ann.url
            : typeof ann.source === "string"
              ? ann.source
              : "";

        if (!url || seen.has(url)) {
          continue;
        }

        seen.add(url);
        results.push({
          title:
            typeof ann.title === "string" && ann.title.trim()
              ? ann.title.trim()
              : url,
          url,
        });
      }
    }
  }

  return results;
}

function collectActionsFromResponse(response: unknown): ResearchAction[] {
  const results: ResearchAction[] = [];

  const root = response as Record<string, unknown>;
  const output = Array.isArray(root.output) ? root.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const row = item as Record<string, unknown>;
    if (row.type !== "web_search_call") {
      continue;
    }

    const action =
      row.action && typeof row.action === "object"
        ? (row.action as Record<string, unknown>)
        : null;

    results.push({
      type:
        action && typeof action.type === "string" && action.type.trim()
          ? action.type.trim()
          : "unknown",
      status:
        typeof row.status === "string" && row.status.trim()
          ? row.status.trim()
          : "unknown",
      query:
        action && typeof action.query === "string" && action.query.trim()
          ? action.query.trim()
          : null,
      url:
        action && typeof action.url === "string" && action.url.trim()
          ? action.url.trim()
          : null,
      pattern:
        action && typeof action.pattern === "string" && action.pattern.trim()
          ? action.pattern.trim()
          : null,
    });
  }

  return results;
}
