"use client";

import type { FormEvent } from "react";

interface IdeaFormProps {
  idea: string;
  error?: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  loadingLine: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function IdeaForm({
  idea,
  error,
  isLoading,
  isAuthenticated,
  loadingLine,
  onChange,
  onSubmit,
}: IdeaFormProps) {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-2">
          <p className="text-xs text-zinc-500">
            Skriv hela caset i ett fält: målgrupp, problem, lösning, team, risker och
            antaganden.
          </p>
          <textarea
            className="min-h-0 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700/50"
            rows={8}
            value={idea}
            onChange={(event) => onChange(event.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(error)}
            aria-describedby="idea-error"
            placeholder="Ex: Vi bygger en AI-driven tjänst för..."
          />
          {error ? (
            <span id="idea-error" className="text-xs text-red-400">
              {error}
            </span>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-200"
        >
          {isLoading
            ? "Poängsätter brutalt..."
            : isAuthenticated
              ? "Poängsätt idé"
              : "Logga in för att poängsätta"}
        </button>

        {isLoading ? (
          <p className="text-sm text-zinc-400" role="status" aria-live="polite">
            {loadingLine}
          </p>
        ) : null}
      </form>
    </section>
  );
}
