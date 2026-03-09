"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { AuthModal } from "@/app/killmyidea/components/AuthModal";
import { HeroSection } from "@/app/killmyidea/components/HeroSection";
import { HistoryList } from "@/app/killmyidea/components/HistoryList";
import { IdeaForm } from "@/app/killmyidea/components/IdeaForm";
import { ScoreResult } from "@/app/killmyidea/components/ScoreResult";
import {
  validateIdeaInput,
  type IdeaInput,
  type OpenScoreViewState,
  type ScoreRecord,
} from "@/lib/openscore/openscore";
import { getSupabaseBrowserClient } from "@/lib/openscore/supabase-browser";

const ACTIVE_JOB_STORAGE_KEY = "openscore_active_job_id";

const initialFormValues: IdeaInput = {
  idea: "",
};

const loadingLines = [
  "Analyserar idé...",
  "Letar efter svaga punkter...",
  "Brutaliserar din startupfantasi...",
];

interface ScoreJobPayload {
  job?: {
    id: string;
    status: "queued" | "research_running" | "scoring" | "completed" | "failed";
    statusMessage: string | null;
    progressEvents: string[];
    errorMessage: string | null;
    ideaScoreId: string | null;
  };
  record?: ScoreRecord | null;
  error?: string;
}

export function KillMyIdeaPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [formValues, setFormValues] = useState<IdeaInput>(initialFormValues);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof IdeaInput, string>>>(
    {},
  );
  const [viewState, setViewState] = useState<OpenScoreViewState>("empty");
  const [currentRecord, setCurrentRecord] = useState<ScoreRecord | null>(null);
  const [historyItems, setHistoryItems] = useState<ScoreRecord[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [showSavedNotice, setShowSavedNotice] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [liveEvents, setLiveEvents] = useState<string[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const isLoading = viewState === "loading";
  const isAuthenticated = Boolean(accessToken);

  useEffect(() => {
    if (!isLoading) {
      setLoadingIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setLoadingIndex((current) => (current + 1) % loadingLines.length);
    }, 1200);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  const loadingLine = useMemo(() => loadingLines[loadingIndex], [loadingIndex]);

  const clearActiveJob = useCallback(() => {
    setActiveJobId(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrateAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }

      const session = data.session;
      setAccessToken(session?.access_token ?? null);
      setUserEmail(session?.user.email ?? null);
      setAuthReady(true);
    };

    void hydrateAuth();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAccessToken(session?.access_token ?? null);
        setUserEmail(session?.user.email ?? null);
      },
    );

    return () => {
      mounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await fetch("/api/history", { cache: "no-store" });
      const payload = (await response.json()) as {
        items?: ScoreRecord[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "kunde inte hämta historik");
      }

      setHistoryItems(payload.items ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "kunde inte hämta historik";
      setHistoryError(message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!authReady || typeof window === "undefined") {
      return;
    }

    const storedJobId = window.localStorage.getItem(ACTIVE_JOB_STORAGE_KEY);
    if (!storedJobId) {
      return;
    }

    setActiveJobId(storedJobId);
    if (accessToken) {
      setViewState("loading");
      setLiveStatus("Återansluter till pågående körning...");
    }
  }, [accessToken, authReady]);

  useEffect(() => {
    if (!activeJobId || !authReady) {
      return;
    }

    if (!accessToken) {
      return;
    }

    let cancelled = false;
    let inFlight = false;

    const pollJob = async () => {
      if (cancelled || inFlight) {
        return;
      }
      inFlight = true;

      try {
        const response = await fetch(`/api/score/jobs/${activeJobId}`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const payload = (await response.json()) as ScoreJobPayload;

        if (!response.ok || !payload.job) {
          throw new Error(payload.error ?? "kunde inte läsa jobbstatus");
        }

        if (cancelled) {
          return;
        }

        setViewState("loading");
        setStatusMessage(null);
        setLiveStatus(payload.job.statusMessage ?? "Kör...");
        setLiveEvents(payload.job.progressEvents.slice(-12));

        if (payload.job.status === "completed") {
          if (!payload.record) {
            throw new Error("jobbet slutfördes men resultat saknas");
          }
          const completedRecord = payload.record;

          setCurrentRecord(completedRecord);
          setHistoryItems((current) => [
            completedRecord,
            ...current.filter((item) => item.id !== completedRecord.id),
          ]);
          setShowSavedNotice(true);
          setViewState("success");
          setLiveStatus(null);
          setLiveEvents([]);
          clearActiveJob();
          return;
        }

        if (payload.job.status === "failed") {
          setViewState("error");
          setStatusMessage(payload.job.errorMessage ?? "körningen misslyckades");
          setLiveStatus(null);
          clearActiveJob();
          return;
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "kunde inte läsa jobbstatus";
        const isFatal =
          message.includes("jobbet hittades inte") || message.includes("du måste vara inloggad");

        if (message.includes("du måste vara inloggad")) {
          setIsAuthModalOpen(true);
        }

        if (isFatal) {
          setViewState("error");
          setStatusMessage(message);
          setLiveStatus(null);
          if (message.includes("jobbet hittades inte")) {
            clearActiveJob();
          }
          return;
        }

        setViewState("loading");
        setStatusMessage(null);
        setLiveStatus("Anslutning tappad, försöker igen...");
        setLiveEvents((current) =>
          [...current, `${new Date().toISOString()} - Retry efter tillfälligt fel`].slice(
            -12,
          ),
        );
      } finally {
        inFlight = false;
      }
    };

    void pollJob();
    const intervalId = window.setInterval(() => {
      void pollJob();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [accessToken, activeJobId, authReady, clearActiveJob]);

  const handleIdeaChange = (value: string) => {
    setFormValues({ idea: value });
    if (formErrors.idea) {
      setFormErrors((current) => ({ ...current, idea: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSavedNotice(false);

    if (!accessToken) {
      setIsAuthModalOpen(true);
      return;
    }

    const validation = validateIdeaInput(formValues);
    setFormErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setViewState("loading");
    setStatusMessage(null);
    setLiveStatus("Skapar jobb...");
    setLiveEvents([`${new Date().toISOString()} - Skapar jobb...`]);

    try {
      const response = await fetch("/api/score/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formValues),
      });

      const payload = (await response.json()) as { jobId?: string; error?: string };
      if (!response.ok || !payload.jobId) {
        throw new Error(payload.error ?? "kunde inte starta körningen");
      }

      setActiveJobId(payload.jobId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ACTIVE_JOB_STORAGE_KEY, payload.jobId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "kunde inte starta körningen";
      setViewState("error");
      setStatusMessage(message);
      setLiveStatus(null);
      clearActiveJob();
    }
  };

  const handleHistorySelect = (item: ScoreRecord) => {
    setCurrentRecord(item);
    setViewState("success");
    setStatusMessage(null);
    setShowSavedNotice(false);
    setLiveStatus(null);
    setLiveEvents([]);
    clearActiveJob();
  };

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setAuthErrorMessage(null);
      setIsAuthSubmitting(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        setIsAuthModalOpen(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "kunde inte logga in";
        setAuthErrorMessage(message);
      } finally {
        setIsAuthSubmitting(false);
      }
    },
    [supabase],
  );

  const handleSignup = useCallback(
    async (email: string, password: string) => {
      setAuthErrorMessage(null);
      setIsAuthSubmitting(true);
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          throw error;
        }

        if (!data.session) {
          setAuthErrorMessage("Konto skapat. Bekräfta din e-post och logga in.");
          return;
        }

        setIsAuthModalOpen(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "kunde inte skapa konto";
        setAuthErrorMessage(message);
      } finally {
        setIsAuthSubmitting(false);
      }
    },
    [supabase],
  );

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentRecord(null);
    setViewState("empty");
    setStatusMessage(null);
    setLiveStatus(null);
    setLiveEvents([]);
    clearActiveJob();
  }, [clearActiveJob, supabase]);

  return (
    <main>
      <div className="section">
        <HeroSection />
        <div className="button-row" style={{ justifyContent: "center" }}>
          <Link href="/prompt" className="btn btn-secondary">
            Visa aktiv prompt
          </Link>

          {isAuthenticated ? (
            <button type="button" onClick={() => void handleLogout()} className="btn btn-secondary">
              Logga ut {userEmail ? `(${userEmail})` : ""}
            </button>
          ) : (
            <button type="button" onClick={() => setIsAuthModalOpen(true)} className="btn btn-secondary">
              Logga in
            </button>
          )}
        </div>
      </div>

      <div className="section">
        <IdeaForm
          idea={formValues.idea}
          error={formErrors.idea}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
          loadingLine={loadingLine}
          onChange={handleIdeaChange}
          onSubmit={handleSubmit}
        />
      </div>

      {viewState === "error" && statusMessage ? (
        <div className="callout warning">
          <span className="callout-icon">⚠️</span>
          <span>
            <strong>Misslyckades.</strong> {statusMessage}
          </span>
        </div>
      ) : null}

      {viewState === "loading" ? (
        <div className="callout info">
          <span className="callout-icon">⏳</span>
          <div>
            <strong>{loadingLine}</strong>
            {liveStatus ? (
              <div className="t-body" style={{ marginTop: "var(--sp-2)" }}>
                {liveStatus}
              </div>
            ) : null}
            {liveEvents.length > 0 ? (
              <ul className="format-list" style={{ marginTop: "var(--sp-2)" }}>
                {liveEvents.map((line, index) => (
                  <li key={`${line}-${index}`}>{line}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      {viewState === "success" && currentRecord ? (
        <ScoreResult record={currentRecord} showSavedNotice={showSavedNotice} />
      ) : null}

      <div className="section">
        <HistoryList
          items={historyItems}
          activeId={currentRecord?.id ?? null}
          isLoading={historyLoading}
          error={historyError}
          onSelect={handleHistorySelect}
        />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        isSubmitting={isAuthSubmitting}
        errorMessage={authErrorMessage}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    </main>
  );
}
