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
    <section className="card">
      <form onSubmit={onSubmit}>
        <label className="label" htmlFor="killmyidea-idea">
          Idé
        </label>
        <p className="t-body" style={{ marginBottom: "var(--sp-3)" }}>
          Beskriv målgrupp, problem, lösning, team och risker i ett stycke.
        </p>
        <textarea
          id="killmyidea-idea"
          rows={8}
          value={idea}
          onChange={(event) => onChange(event.target.value)}
          disabled={isLoading}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "idea-error" : undefined}
          placeholder="Ex: Vi bygger en AI-driven tjänst för..."
          style={{
            width: "100%",
            minHeight: 160,
            resize: "vertical",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            padding: "var(--sp-4)",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            lineHeight: 1.6,
          }}
        />
        {error ? (
          <div id="idea-error" className="t-body" style={{ color: "var(--crayfish-light)" }}>
            {error}
          </div>
        ) : null}

        <div style={{ marginTop: "var(--sp-4)" }}>
          <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading
              ? "Poängsätter brutalt..."
              : isAuthenticated
                ? "Poängsätt idé"
                : "Logga in för att poängsätta"}
          </button>
        </div>

        {isLoading ? (
          <div
            className="t-mono stats"
            role="status"
            aria-live="polite"
            style={{ marginTop: "var(--sp-3)", color: "var(--text-muted)" }}
          >
            {loadingLine}
          </div>
        ) : null}
      </form>
    </section>
  );
}
