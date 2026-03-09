# KillMyIdea UX Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign ScoreResult and IdeaForm to match Openclawsverige styling and layout requirements.

**Architecture:** Keep existing data flow and component boundaries. Replace Tailwind-heavy styling with global utility classes, restructure ScoreResult sections into a hero + stats grid + visible summary + accordions, and add a canvas layering helper class in global CSS.

**Tech Stack:** Next.js App Router, React, TypeScript, global CSS (Openclawsverige classes), Tailwind for minimal layout utilities.

---

### Task 1: Redesign ScoreResult layout and content

**Files:**
- Modify: `app/killmyidea/components/ScoreResult.tsx`
- Modify: `app/globals.css`

**Step 1: Write a manual verification checklist**

```text
- Hero shows total score with "/100"
- Verdict badge uses killmyidea-verdict modifiers
- Verdict sentence matches verdict mapping
- Saved notice appears when showSavedNotice is true
- Canvas appears only when totalScore >= 70 and sits behind content
- Stats grid shows 4 cards (confidence, unfair advantage, kill signals, total)
- Brutal sammanfattning is always visible as a card
- Accordions group the remaining sections correctly
```

**Step 2: Update ScoreResult structure**

```tsx
import { ScoreCelebrationCanvas } from "./ScoreCelebrationCanvas";

const verdictSentences: Record<ScoreRecord["verdict"], string> = {
  BUILD: "Bygg vidare",
  PIVOT: "Vrid innan du bygger",
  KILL: "Lagg ner nu",
};

const verdictClasses: Record<ScoreRecord["verdict"], string> = {
  BUILD: "killmyidea-verdict killmyidea-verdict--build",
  PIVOT: "killmyidea-verdict killmyidea-verdict--pivot",
  KILL: "killmyidea-verdict killmyidea-verdict--kill",
};

<section className="space-y-4">
  <div className="card killmyidea-score-hero">
    {record.totalScore >= 70 ? (
      <div className="killmyidea-score-canvas">
        <ScoreCelebrationCanvas />
      </div>
    ) : null}
    <div className="killmyidea-score-glow" />
    <div className="label">Dom</div>
    <div className="space-y-2">
      <div className="t-display">
        {record.totalScore}
        <span className="t-body">/100</span>
      </div>
      <span className={verdictClasses[record.verdict]}>{verdictLabels[record.verdict]}</span>
      <p className="t-body" style={{ fontWeight: 600 }}>
        {verdictSentences[record.verdict]}
      </p>
      {showSavedNotice ? <p className="t-body">Sparad i historiken.</p> : null}
    </div>
  </div>

  <div className="grid-2">
    <MetricCard label="Sakerhet" value={`${record.confidenceScore}/10`} />
    <MetricCard label="Orattvis fordel" value={`${record.unfairAdvantageScore}/5`} />
    <MetricCard label="Dodssignaler" value={`${record.killSignalCount}`} />
    <MetricCard label="Total" value={`${record.totalScore}/100`} />
  </div>

  <div className="card">
    <div className="label">Brutal sammanfattning</div>
    <p className="t-body">{record.brutalSummary}</p>
  </div>

  <details className="killmyidea-accordion">
    <summary>Risker, fall & styrkor</summary>
    {/* risks list, failure reason, kill signals, strengths/weaknesses */}
  </details>
  <details className="killmyidea-accordion">
    <summary>Research</summary>
    {/* research output, sources, actions */}
  </details>
  <details className="killmyidea-accordion">
    <summary>Ra analys</summary>
    {/* build_realism, need_severity, monetization_reality, differentiation */}
  </details>
</section>
```

**Step 3: Add canvas helper class**

```css
.killmyidea-score-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.killmyidea-score-hero > :not(.killmyidea-score-glow):not(.killmyidea-score-canvas) {
  position: relative;
  z-index: 1;
}
```

**Step 4: Run lint**

Run: `npm run lint`
Expected: No errors.

**Step 5: Commit**

```bash
git add app/killmyidea/components/ScoreResult.tsx app/globals.css
git commit -m "feat: redesign score result layout"
```

---

### Task 2: Simplify IdeaForm styling

**Files:**
- Modify: `app/killmyidea/components/IdeaForm.tsx`

**Step 1: Update form markup to use global classes**

```tsx
<section className="card">
  <form className="space-y-4" onSubmit={onSubmit}>
    <label className="block space-y-2">
      <p className="t-body">Skriv hela caset i ett fält.</p>
      <textarea className="t-body" ... />
      {error ? (
        <span id="idea-error" style={{ color: "var(--error)", fontSize: "12px" }}>
          {error}
        </span>
      ) : null}
    </label>
    <button type="submit" className="btn btn-primary" disabled={isLoading}>
      ...
    </button>
    {isLoading ? (
      <p className="t-mono" role="status" aria-live="polite">
        {loadingLine}
      </p>
    ) : null}
  </form>
</section>
```

**Step 2: Run lint**

Run: `npm run lint`
Expected: No errors.

**Step 3: Commit**

```bash
git add app/killmyidea/components/IdeaForm.tsx
git commit -m "feat: redesign score result layout"
```

---

### Task 3: Manual verification

**Files:**
- None

**Step 1: Run the UI and verify**

Run: `npm run dev`
Expected: App starts without errors.

Verify:
- ScoreResult hero layout, verdict sentence, and stats grid
- Accordions expand/collapse correctly
- Canvas appears for scores >= 70
- IdeaForm instruction is single-line, error is visible in red
