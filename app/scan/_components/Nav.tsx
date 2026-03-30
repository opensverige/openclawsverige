// app/scan/_components/Nav.tsx
"use client";

import { PixelDot } from "./PixelBlock";

export default function Nav() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1.5px solid #EDECE8",
        position: "sticky",
        top: 0,
        background: "rgba(248,247,244,0.92)",
        backdropFilter: "blur(20px)",
        zIndex: 100,
        fontFamily: "'Libre Franklin', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <PixelDot size={18} />
        <span
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 17,
            letterSpacing: -0.5,
            color: "#111",
          }}
        >
          agent<span style={{ color: "#c4391a" }}>.opensverige</span>
        </span>
      </div>
      <a
        href="https://discord.gg/CSphbTk8En"
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          background: "#111",
          padding: "0 16px",
          borderRadius: 8,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          minHeight: 44,
        }}
      >
        250+ builders →
      </a>
    </nav>
  );
}
