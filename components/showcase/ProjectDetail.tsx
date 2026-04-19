import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import type { ProjectWithRelations } from "@/lib/showcase/types";
import { techIconSlug } from "@/lib/showcase/tech-icons";
import { ShareButtons } from "./ShareButtons";
import { ProjectRow } from "./ProjectRow";

function TechStackChips({ items }: { items: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-3">
      {items.map((name, i) => {
        const slug = techIconSlug(name);
        return (
          <div key={`${name}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span
                className="text-[var(--text-muted)] text-[14px] mx-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                +
              </span>
            )}
            <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border)]">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
                {slug ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`https://cdn.simpleicons.org/${slug}`}
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 object-contain"
                  />
                ) : (
                  <span
                    className="text-[10px] font-medium text-[var(--text-secondary)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {name.trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <span
                className="text-[13px] text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {name}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface ProjectDetailProps {
  project: ProjectWithRelations;
  related: ProjectWithRelations[];
  canonicalUrl: string;
}

const display = { fontFamily: "var(--font-display)" };
const mono = { fontFamily: "var(--font-mono)" };
const body = { fontFamily: "var(--font-body)" };

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?\n]+[.!?]?/);
  const first = (match ? match[0] : trimmed).trim();
  return first.length > 140 ? first.slice(0, 137).trimEnd() + "..." : first;
}

export function ProjectDetail({
  project,
  related,
  canonicalUrl,
}: ProjectDetailProps) {
  const builder = project.builders;
  const tags = project.project_tags.map((pt) => pt.tags);
  const username = builder?.discord_username ?? "okand";

  const publishedDate = project.published_at
    ? new Date(project.published_at).toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const heroSrc = project.hero_image_url ?? project.screenshot_url;
  const stageTag = tags.find((t) => t.category === "stage");
  const domainTag = tags.find((t) => t.category === "domain");
  const techTags = tags.filter((t) => t.category === "tech");

  const shareText = `${project.title} av @${username} — byggt i OpenSverige.\n${
    project.tagline ?? firstSentence(project.description)
  }`;

  const Specs = () => (
    <aside
      className="space-y-6"
      style={mono}
      aria-label="Projekt-specifikationer"
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--gold)]"
          aria-hidden
        />
        <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--gold)]">
          Live
        </span>
      </div>

      {publishedDate && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1.5">
            Shippat
          </p>
          <p className="text-[13px] text-[var(--text-primary)]">
            {publishedDate}
          </p>
        </div>
      )}

      {domainTag && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1.5">
            Domän
          </p>
          <p className="text-[13px] text-[var(--text-primary)]">
            {domainTag.name}
          </p>
        </div>
      )}

      {stageTag && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1.5">
            Stage
          </p>
          <p className="text-[13px] text-[var(--text-primary)]">
            {stageTag.name}
          </p>
        </div>
      )}

      {techTags.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1.5">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {techTags.map((t) => (
              <span
                key={t.id}
                className="px-1.5 py-0.5 text-[11px] rounded border border-[var(--border)] text-[var(--text-secondary)]"
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {(project.url || project.repo_url) && (
        <div className="pt-2 flex flex-col gap-2">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between gap-2 px-3 py-2.5 text-[13px] font-medium bg-[var(--crayfish-red)] text-white rounded transition-opacity duration-150 hover:opacity-90"
            >
              <span>Besök projektet</span>
              <ArrowUpRight size={14} />
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between gap-2 px-3 py-2.5 text-[13px] font-medium border border-[var(--border)] text-[var(--text-secondary)] rounded transition-colors duration-150 hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <span className="inline-flex items-center gap-2">
                <Github size={13} />
                Repo på GitHub
              </span>
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      )}

      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-2">
          Dela
        </p>
        <ShareButtons shareText={shareText} shareUrl={canonicalUrl} />
      </div>
    </aside>
  );

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] pb-20">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 pt-8">
        <Link
          href="/showcase"
          className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          style={mono}
        >
          <ArrowLeft size={14} />
          Alla projekt
        </Link>
      </div>

      {heroSrc && (
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[220px] sm:max-h-[380px] bg-[var(--bg-surface)] rounded-md overflow-hidden border border-[var(--border)] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
            <Image
              src={heroSrc}
              alt={project.title}
              fill
              sizes="(max-width: 1120px) 100vw, 1120px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 mt-8 sm:mt-10 lg:grid lg:grid-cols-[1fr_260px] lg:gap-12">
        <article className="max-w-[680px]">
          <h1
            className="text-[36px] sm:text-[56px] lg:text-[64px] leading-[1.04] text-[var(--text-primary)]"
            style={{
              ...display,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            {project.title}
          </h1>

          <p className="mt-4 text-sm text-[var(--text-secondary)]" style={mono}>
            Byggt av{" "}
            <Link
              href={`/showcase/b/${username}`}
              className="text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors"
            >
              @{username}
            </Link>
          </p>

          {/* Mobile: compact meta strip + single primary CTA. Full specs reappear below the story. */}
          <div className="lg:hidden mt-5">
            <p className="text-[12px] text-[var(--text-muted)]" style={mono}>
              <span className="inline-flex items-center gap-1.5 text-[var(--gold)]">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--gold)]"
                  aria-hidden
                />
                Live
              </span>
              {domainTag && <> · {domainTag.name}</>}
              {publishedDate && <> · {publishedDate}</>}
            </p>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-between gap-2 px-4 py-3 text-[14px] font-medium bg-[var(--crayfish-red)] text-white rounded transition-opacity duration-150 hover:opacity-90"
                style={mono}
              >
                <span>Besök projektet</span>
                <ArrowUpRight size={15} />
              </a>
            )}
          </div>

          {project.tagline && (
            <blockquote
              className="mt-8 sm:mt-10 pl-5 sm:pl-6 border-l-2 border-[var(--gold)] text-[var(--gold)]"
              style={{ ...display, fontStyle: "italic" }}
            >
              <p className="text-[22px] sm:text-[26px] leading-[1.4]">
                &ldquo;{project.tagline}&rdquo;
              </p>
              <p
                className="mt-3 text-[12px] text-[var(--text-muted)] not-italic"
                style={mono}
              >
                — @{username}
              </p>
            </blockquote>
          )}

          <div
            className="mt-10 space-y-6 text-[var(--text-primary)]"
            style={{ ...body, fontSize: 18, lineHeight: 1.75 }}
          >
            {project.body ? (
              project.body
                .trim()
                .split(/\n{2,}/)
                .map((para, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {para}
                  </p>
                ))
            ) : (
              <p className="whitespace-pre-line">{project.description}</p>
            )}
          </div>

          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="mt-12">
              <p
                className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]"
                style={mono}
              >
                Byggt med
              </p>
              <TechStackChips items={project.tech_stack} />
            </div>
          )}

          {/* Mobile-only tail: repo + share. Everything else already shown up top or implicit. */}
          <div
            className="lg:hidden mt-12 pt-6 border-t border-[var(--border)] space-y-5"
            style={mono}
          >
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Github size={14} />
                Repo på GitHub
                <ArrowUpRight size={13} />
              </a>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-2">
                Dela
              </p>
              <ShareButtons shareText={shareText} shareUrl={canonicalUrl} />
            </div>
          </div>
        </article>

        <div className="hidden lg:block">
          <div className="sticky top-8">
            <Specs />
          </div>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 mt-20">
        {related.length > 0 && (
          <section className="max-w-[680px]">
            <h2
              className="text-[24px] sm:text-[28px] text-[var(--text-primary)]"
              style={{ ...display, fontWeight: 500, letterSpacing: "-0.01em" }}
            >
              Upptäck fler projekt
            </h2>
            <p
              className="mt-1 text-[12px] text-[var(--text-muted)]"
              style={mono}
            >
              Från OpenSverige-communityn
            </p>
            <div className="mt-4 border-t border-[var(--border)]">
              {related.map((p) => (
                <ProjectRow key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-24 text-center max-w-[480px] mx-auto">
          <p
            className="text-[22px] text-[var(--text-primary)]"
            style={{ ...display, fontWeight: 500 }}
          >
            Bygger du något?
          </p>
          <p
            className="mt-2 text-[15px] text-[var(--text-secondary)]"
            style={body}
          >
            Gå med i OpenSverige-communityn{" "}
            <a
              href="https://discord.gg/CSphbTk8En"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors"
            >
              → Gå med
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
