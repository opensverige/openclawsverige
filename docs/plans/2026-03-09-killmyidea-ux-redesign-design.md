# KillMyIdea UX Redesign Design

**Date:** 2026-03-09
**Scope:** `app/killmyidea/components/ScoreResult.tsx`, `app/killmyidea/components/IdeaForm.tsx`, `app/globals.css`

## Goals
- Align ScoreResult and IdeaForm with Openclawsverige styleguide.
- Improve visual hierarchy for score and verdict.
- Keep critical summary visible while collapsing detailed sections.
- Reduce Tailwind utility usage in favor of global classes.

## Non-goals
- Changing data shape or score logic.
- New backend behavior or API changes.
- Reworking existing copy beyond the specified verdict sentence.

## Layout Overview
### ScoreResult
- Hero card using `.card` + `.killmyidea-score-hero` + `.killmyidea-score-glow`.
- Inside hero: total score, verdict badge, bold one-line verdict sentence, optional saved notice.
- Celebration canvas behind hero content when `totalScore >= 70`.
- Stats grid directly below hero using `.grid-2` with 4 cards.
- "Brutal sammanfattning" remains visible as its own `.card`.
- Three accordions using `.killmyidea-accordion`:
  1. Risk + failure reason + kill signals + strengths/weaknesses
  2. Research output + sources + actions
  3. Raw analysis (build_realism, need_severity, monetization_reality, differentiation)

### IdeaForm
- Single-line instruction.
- `.card` wrapper for form.
- `.btn.btn-primary` for submit.
- Loading line retained with `.t-body` or `.t-mono`.
- Error message stays visible with minimal inline red styling.

## Content Mapping
- Verdict sentence (derived from verdict):
  - BUILD: "Bygg vidare"
  - PIVOT: "Vrid innan du bygger"
  - KILL: "Lagg ner nu"
- Stats:
  - Confidence: `{record.confidenceScore}/10`
  - Unfair advantage: `{record.unfairAdvantageScore}/5`
  - Kill signals: `{record.killSignalCount}`
  - Total: `{record.totalScore}/100`

## Styling Notes
- Prefer `.card`, `.label`, `.t-display`, `.t-heading`, `.t-body`, `.t-mono`.
- Add a helper class for canvas layering if needed (e.g. `.killmyidea-score-canvas`).
- Keep minimal inline styles for red error text only.

## Accessibility
- Keep existing form `aria-*` attributes.
- Accordions remain keyboard-accessible via native `<details>`.

## Testing/Verification
- Manual visual check of hero, grid, and accordions.
- Verify canvas appears only at `totalScore >= 70`.
- Check error state and loading line in IdeaForm.
