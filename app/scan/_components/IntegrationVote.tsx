// app/scan/_components/IntegrationVote.tsx
"use client";

import { useState, useEffect } from "react";

const SYSTEMS = [
  { id: "fortnox", name: "Fortnox", desc: "Fakturering, bokföring" },
  { id: "visma", name: "Visma", desc: "eEkonomi, lön" },
  { id: "bankid", name: "BankID", desc: "Identitetsverifiering" },
  { id: "skatteverket", name: "Skatteverket", desc: "Moms, deklaration" },
  { id: "bolagsverket", name: "Bolagsverket", desc: "Företagsinfo" },
  { id: "swish", name: "Swish", desc: "Betalningar" },
  { id: "bankgirot", name: "Bankgirot", desc: "Betalfiler" },
] as const;

type SystemId = (typeof SYSTEMS)[number]["id"];

const LS_COUNTS = "os_iv_counts";
const LS_USER = "os_iv_user";

const ZERO_COUNTS: Record<SystemId, number> = Object.fromEntries(
  SYSTEMS.map((s) => [s.id, 0])
) as Record<SystemId, number>;

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function IntegrationVote() {
  const [counts, setCounts] = useState<Record<SystemId, number>>(ZERO_COUNTS);
  const [userVotes, setUserVotes] = useState<Set<SystemId>>(new Set());

  useEffect(() => {
    setCounts(readLS(LS_COUNTS, ZERO_COUNTS));
    setUserVotes(new Set(readLS<SystemId[]>(LS_USER, [])));
  }, []);

  function toggle(id: SystemId) {
    const voted = userVotes.has(id);
    const newCounts = {
      ...counts,
      [id]: voted ? Math.max(0, counts[id] - 1) : counts[id] + 1,
    };
    const newUser = new Set(userVotes);
    voted ? newUser.delete(id) : newUser.add(id);

    setCounts(newCounts);
    setUserVotes(newUser);
    localStorage.setItem(LS_COUNTS, JSON.stringify(newCounts));
    localStorage.setItem(LS_USER, JSON.stringify([...newUser]));
  }

  const sorted = [...SYSTEMS]
    .map((s) => ({ ...s, count: counts[s.id] }))
    .sort((a, b) => b.count - a.count);

  const topCount = Math.max(1, sorted[0]?.count ?? 1);

  return (
    <section
      style={{
        padding: "64px 24px 32px",
        maxWidth: 580,
        margin: "0 auto",
        fontFamily: "'Libre Franklin', sans-serif",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 700,
          color: "#c4391a",
          letterSpacing: 2,
          marginBottom: 6,
        }}
      >
        VILKA SYSTEM BEHÖVER AGENTER?
      </div>
      <h2
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(22px,4vw,30px)",
          fontWeight: 400,
          letterSpacing: -0.3,
          marginBottom: 6,
        }}
      >
        Rösta. Builders bygger det som efterfrågas mest.
      </h2>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>
        Klicka på systemet du använder.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((sys) => {
          const voted = userVotes.has(sys.id);
          const barW = Math.max(6, Math.round((sys.count / topCount) * 100));
          return (
            <button
              key={sys.id}
              onClick={() => toggle(sys.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#fff",
                border: voted
                  ? "1.5px solid #c4391a44"
                  : "1.5px solid #EDECE8",
                borderRadius: 10,
                padding: "10px 14px",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "border-color 0.2s",
              }}
            >
              {/* Background bar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${barW}%`,
                  background: voted ? "#c4391a08" : "#fafaf7",
                  transition: "width 0.4s ease",
                  zIndex: 0,
                }}
              />
              {/* Vote count */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: voted ? "#c4391a" : "#ccc",
                  minWidth: 38,
                  zIndex: 1,
                  position: "relative",
                  transition: "color 0.15s",
                }}
              >
                <span style={{ fontSize: 9 }}>▲</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {sys.count}
                </span>
              </div>
              {/* Name + desc */}
              <div style={{ flex: 1, zIndex: 1, position: "relative" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{sys.name}</div>
                <div style={{ fontSize: 12, color: "#999" }}>{sys.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
