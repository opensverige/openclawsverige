// app/scan/page.tsx
import type { Metadata } from "next";
import Nav from "./_components/Nav";
import ScannerSection from "./_components/ScannerSection";
import IntegrationVote from "./_components/IntegrationVote";
import CTA from "./_components/CTA";

export const metadata: Metadata = {
  title: "Hur agent-redo är ditt företag?",
  description:
    "Vi scannar din sajt och visar vad AI-agenter ser — GDPR, EU AI Act och teknisk tillgänglighet. Gratis. Öppet.",
};

export default function ScanPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F4", color: "#111" }}>
      {/* Font loading: preconnect first, then stylesheet — hoisted to <head> by Next.js */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Libre+Franklin:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&display=optional"
      />
      <Nav />
      <ScannerSection />
      <div
        style={{
          maxWidth: 580,
          margin: "0 auto",
          height: 1,
          background: "#EDECE8",
        }}
      />
      <IntegrationVote />
      <div
        style={{
          maxWidth: 580,
          margin: "0 auto",
          height: 1,
          background: "#EDECE8",
        }}
      />
      <CTA />
      <footer
        style={{
          padding: "14px 24px",
          borderTop: "1.5px solid #EDECE8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "#706F6C",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span>agent.opensverige.se</span>
        <span>opensverige.se — öppen källkod</span>
      </footer>
    </div>
  );
}
