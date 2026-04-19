"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, X, ExternalLink } from "lucide-react";
import type { ProjectWithRelations, Tag } from "@/lib/showcase/types";

interface AdminQueueItemProps {
  project: ProjectWithRelations;
  allTags: Tag[];
  onApproved: (id: string) => void;
  onRejected: (id: string) => void;
}

export function AdminQueueItem({
  project,
  allTags,
  onApproved,
  onRejected,
}: AdminQueueItemProps) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [screenshotUrl, setScreenshotUrl] = useState(project.screenshot_url ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(project.hero_image_url ?? "");
  const [url, setUrl] = useState(project.url ?? "");
  const [repoUrl, setRepoUrl] = useState(project.repo_url ?? "");
  const [tagline, setTagline] = useState(project.tagline ?? "");
  const [body, setBody] = useState(project.body ?? "");
  const [featured, setFeatured] = useState(project.featured ?? false);
  const [techStack, setTechStack] = useState(
    (project.tech_stack ?? []).join(", ")
  );
  const [tagSlugs, setTagSlugs] = useState<Set<string>>(
    new Set(project.project_tags.map((pt) => pt.tags.slug))
  );

  const builder = project.builders;

  function toggleTag(slug: string) {
    setTagSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function handleApprove() {
    setLoading("approve");
    setError(null);
    const techList = techStack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: project.id,
          screenshot_url: screenshotUrl || null,
          hero_image_url: heroImageUrl || null,
          url: url || null,
          repo_url: repoUrl || null,
          tagline: tagline || null,
          body: body || null,
          tech_stack: techList,
          tag_slugs: Array.from(tagSlugs),
          featured,
        }),
      });
      if (res.ok) {
        onApproved(project.id);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Kunde inte godkänna");
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!confirm(`Arkivera "${project.title}"? Projektet döljs men raderas inte.`))
      return;
    setLoading("reject");
    try {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id }),
      });
      if (res.ok) onRejected(project.id);
    } finally {
      setLoading(null);
    }
  }

  const mono = { fontFamily: "var(--font-mono)" };
  const inputCls =
    "w-full px-2 py-1 text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)]";
  const labelCls = "text-[11px] uppercase tracking-widest text-[var(--text-muted)]";

  const tagsByCategory = {
    domain: allTags.filter((t) => t.category === "domain"),
    tech: allTags.filter((t) => t.category === "tech"),
    stage: allTags.filter((t) => t.category === "stage"),
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md overflow-hidden">
      <div className="grid sm:grid-cols-[200px_1fr] gap-0">
        <div className="relative aspect-video sm:aspect-auto bg-[var(--bg-surface)] min-h-[140px]">
          {screenshotUrl ? (
            <Image
              src={screenshotUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="200px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-[var(--text-muted)]" style={mono}>
                ingen bild
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div>
            <h3
              className="text-base font-medium text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {project.title}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5" style={mono}>
              {builder?.display_name ?? builder?.discord_username} ·{" "}
              {builder?.discord_id} ·{" "}
              {new Date(project.created_at).toLocaleDateString("sv-SE")}
            </p>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {project.description}
          </p>

          <label className="flex flex-col gap-1">
            <span className={labelCls} style={mono}>
              Brödtext — hisspitch, max 3–4 korta stycken
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="80–120 ord: problemet i en mening, vad det ÄR, nuläget. Ingen inledning, ingen utläggning. Läsaren är redan halvvägs ute."
              rows={6}
              className={`${inputCls} leading-relaxed`}
              maxLength={1200}
            />
            <span className="text-[10px] text-[var(--text-muted)]" style={mono}>
              {body.length} / 1200
            </span>
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={labelCls} style={mono}>Tagline</span>
              <input
                type="text"
                value={tagline}
                maxLength={140}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="En mening från byggaren"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls} style={mono}>Byggt med (kommaseparerat)</span>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="Next.js, Supabase, Claude API"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls} style={mono}>URL</span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls} style={mono}>Repo-URL</span>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls} style={mono}>Screenshot (thumb, 16:9)</span>
              <input
                type="url"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls} style={mono}>Hero image (stor, detail)</span>
              <input
                type="url"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className={labelCls} style={mono}>Tags</span>
            {(Object.keys(tagsByCategory) as Array<keyof typeof tagsByCategory>).map(
              (cat) => (
                <div key={cat} className="flex flex-wrap gap-1 items-center">
                  <span
                    className="text-[10px] text-[var(--text-muted)] mr-1 w-14 inline-block"
                    style={mono}
                  >
                    {cat}
                  </span>
                  {tagsByCategory[cat].map((tag) => {
                    const active = tagSlugs.has(tag.slug);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.slug)}
                        className={`px-1.5 py-0.5 text-[10px] border rounded transition-colors ${
                          active
                            ? "border-[var(--crayfish-red)] text-[var(--crayfish-red)]"
                            : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                        }`}
                        style={mono}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-[var(--gold)]"
            />
            <span className="text-xs text-[var(--text-secondary)]" style={mono}>
              Från communityn — lyft ovanför griden (kräver tagline)
            </span>
          </label>

          {(project.url || project.repo_url) && (
            <div className="flex flex-wrap gap-2 text-xs" style={mono}>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--gold)] hover:underline"
                >
                  <ExternalLink size={11} />
                  ursprunglig URL
                </a>
              )}
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  <ExternalLink size={11} />
                  ursprungligt repo
                </a>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs text-[var(--crayfish-red)]" style={mono}>
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleApprove}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--crayfish-red)] text-white rounded transition-opacity disabled:opacity-50"
            >
              <Check size={13} />
              {loading === "approve" ? "Publicerar..." : "Godkänn & publicera"}
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] rounded transition-colors hover:border-[var(--text-muted)] disabled:opacity-50"
            >
              <X size={13} />
              {loading === "reject" ? "Arkiverar..." : "Avvisa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
