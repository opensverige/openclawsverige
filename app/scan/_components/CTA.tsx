// app/scan/_components/CTA.tsx
"use client";

import { PixelBlock } from "./PixelBlock";

export default function CTA() {
  function handleShare() {
    const text =
      "Sveriges första öppna AI-readiness scanner för företag — agent.opensverige.se";
    if (navigator.share) {
      navigator.share({
        title: "agent.opensverige",
        text,
        url: "https://opensverige.se/scan",
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText("https://opensverige.se/scan");
    }
  }

  return (
    <section
      style={{
        padding: "48px 24px 64px",
        textAlign: "center",
        maxWidth: 480,
        margin: "0 auto",
        fontFamily: "'Libre Franklin', sans-serif",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
      >
        <PixelBlock size={36} />
      </div>
      <h2
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(24px,5vw,36px)",
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: -0.5,
          marginBottom: 8,
        }}
      >
        250+ builders bygger redan.
        <br />
        Häng med.
      </h2>
      <p style={{ fontSize: 14, color: "#999", marginBottom: 24 }}>
        Öppen källkod. Stockholm, Göteborg, Malmö.
      </p>
      <a
        href="https://discord.gg/CSphbTk8En"
        style={{
          display: "inline-block",
          fontSize: 14,
          fontWeight: 700,
          color: "#fff",
          background: "#c4391a",
          padding: "14px 36px",
          borderRadius: 10,
          textDecoration: "none",
          boxShadow: "0 4px 20px #c4391a18",
        }}
      >
        Gå med i Discord →
      </a>
      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleShare}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: "#c4391a",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Dela med någon som behöver det här
        </button>
      </div>
    </section>
  );
}
