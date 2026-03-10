"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface PromptPayload {
  prompt?: string;
  error?: string;
}

export function PromptPlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/prompt", { cache: "no-store" });
        const payload = (await response.json()) as PromptPayload;

        if (!response.ok || !payload.prompt) {
          throw new Error(payload.error ?? "Kunde inte läsa prompten.");
        }

        setPrompt(payload.prompt);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Kunde inte läsa prompten.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
            OpenScore
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Aktiv prompt
          </h1>
          <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
            Den här sidan är read-only. Prompten hanteras via databasen.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            Tillbaka till OpenScore
          </Link>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
          {isLoading ? (
            <p className="text-sm text-zinc-400">Laddar prompt...</p>
          ) : null}

          {!isLoading && error ? (
            <p className="text-sm text-red-300">{error}</p>
          ) : null}

          {!isLoading && !error ? (
            <div className="space-y-3">
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-200">
                {prompt}
              </pre>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
