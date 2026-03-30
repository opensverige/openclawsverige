import { NextRequest } from "next/server";

export interface ProbeResult {
  url: string;
  status: number;
  contentType: string | null;
  body: string;
  error?: string;
}

const MAX_URLS = 20;
const BODY_LIMIT = 15_000;

function isValidPublicUrl(raw: string): boolean {
  let parsed: URL;
  try { parsed = new URL(raw); } catch { return false; }
  if (!["http:", "https:"].includes(parsed.protocol)) return false;
  const host = parsed.hostname.toLowerCase();
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(host)) return false;
  if (host.endsWith(".local") || host.endsWith(".internal")) return false;
  const parts = host.split(".");
  if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
    const [a, b] = parts.map(Number);
    if (a === 10) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 169 && b === 254) return false;
  }
  return true;
}

async function probeOne(url: string): Promise<ProbeResult> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "OpenSverige-Scanner/1.0 (https://opensverige.se/scan)" },
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    const body = (await res.text()).slice(0, BODY_LIMIT);
    return { url, status: res.status, contentType: res.headers.get("content-type"), body };
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return { url, status: 0, contentType: null, body: "", error: isTimeout ? "timeout" : "fetch_failed" };
  }
}

export async function POST(req: NextRequest) {
  let urls: unknown;
  try { ({ urls } = await req.json()); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(urls) || urls.length === 0) {
    return Response.json({ error: "urls must be a non-empty array" }, { status: 400 });
  }
  if (urls.length > MAX_URLS) {
    return Response.json({ error: `Max ${MAX_URLS} URLs per request` }, { status: 400 });
  }

  const validUrls = (urls as unknown[]).filter(u => typeof u === "string" && isValidPublicUrl(u)) as string[];
  const probes = await Promise.all(validUrls.map(probeOne));
  return Response.json({ probes });
}
