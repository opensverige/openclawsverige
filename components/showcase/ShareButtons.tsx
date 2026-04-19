"use client";

import { useState } from "react";
import { Check, Copy, Linkedin, Twitter } from "lucide-react";

interface ShareButtonsProps {
  shareText: string;
  shareUrl: string;
}

export function ShareButtons({ shareText, shareUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${shareText}\n${shareUrl}`
  )}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const btnBase =
    "inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] transition-colors duration-150 rounded hover:border-[var(--crayfish-red)] hover:text-[var(--crayfish-red)]";

  return (
    <div className="flex flex-wrap gap-2" style={{ fontFamily: "var(--font-mono)" }}>
      <button type="button" onClick={handleCopy} className={btnBase}>
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Kopierad!" : "Kopiera länk"}
      </button>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={btnBase}
      >
        <Twitter size={13} />
        Dela på X
      </a>

      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={btnBase}
      >
        <Linkedin size={13} />
        Dela på LinkedIn
      </a>
    </div>
  );
}
