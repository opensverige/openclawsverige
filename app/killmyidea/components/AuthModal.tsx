"use client";

import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string) => Promise<void>;
}

export function AuthModal({
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onLogin,
  onSignup,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  if (!isOpen) {
    return null;
  }

  const title = mode === "login" ? "Logga in" : "Skapa konto";
  const submitLabel = mode === "login" ? "Logga in" : "Skapa konto";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Du måste vara inloggad för att poängsätta idéer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
          >
            Stäng
          </button>
        </div>

        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            if (mode === "login") {
              await onLogin(email, password);
            } else {
              await onSignup(email, password);
            }
          }}
        >
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-400">E-post</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
              placeholder="du@exempel.se"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-zinc-400">Lösenord</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
              placeholder="Minst 6 tecken"
            />
          </label>

          {errorMessage ? <p className="text-xs text-red-300">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Bearbetar..." : submitLabel}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-zinc-400">
          {mode === "login" ? "Har du inget konto?" : "Har du redan konto?"}{" "}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
            className="text-zinc-200 underline underline-offset-2 hover:text-white disabled:opacity-60"
          >
            {mode === "login" ? "Skapa konto" : "Logga in"}
          </button>
        </div>
      </div>
    </div>
  );
}
