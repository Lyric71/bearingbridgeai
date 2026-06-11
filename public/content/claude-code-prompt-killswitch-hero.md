# Claude Code Prompt — Kill-Switch Hero Animation

Copy everything below the line into Claude Code.

---

Build a single self-contained file `hero-killswitch.html` (inline CSS + vanilla JS, no build step, no frameworks — GSAP via CDN is allowed but optional) implementing the hero section of a consulting website, including an animated "kill-switch pilot dashboard." It must be production-quality: I will later port it to a Next.js + Tailwind component, so keep the JS cleanly separated in one `<script>` block and use CSS custom properties for all tokens.

## 1. Brand context (read carefully — it drives every visual decision)

bearingpoint.ai is a senior AI adoption consultancy. Its entire brand is **anti-hype**: every pilot we sell has pre-agreed *kill criteria* — if the pilot doesn't meet them, we terminate it and the client buys certainty at pilot price instead of failure at production price. This hero animation performs that promise: a pilot dashboard where a metric crosses its kill threshold and the project is **calmly, professionally terminated**.

The emotional register is the opposite of an alarm. Think: an auditor closing a file with a stamp, not a reactor meltdown. If any part of your implementation feels urgent, panicked, or gamified, it is wrong. Calm is the product.

## 2. Design system (extracted from our reference, use exactly)

```css
:root {
  --cream:  #F3E9D8;   /* hero background band */
  --ink:    #111827;   /* headlines, borders, dark text */
  --accent: #C56A3C;   /* terracotta — the ONLY accent color */
  --paper:  #FFFFFF;   /* card background */
  --ok:     #16A34A;   /* healthy metric ticks only, use sparingly */
}
```

- Headings: serif — load **Source Serif 4** from Google Fonts, weight 400 only (never bold). H1 ~64–72px desktop, line-height 1.15.
- Body/UI: **Inter**, 400/500. Body 16px. Dashboard UI text 12–13px.
- Labels/kickers: Inter 11px, uppercase, letter-spacing 0.12em, color var(--accent).
- **Square corners everywhere. border-radius: 0 on every element.** No drop shadows. Borders are 1px solid rgb(17 24 39 / 0.12). Whitespace does the work.
- Muted text = ink at 70% opacity. Never introduce a second accent color, never use pure red.

## 3. Hero layout

Full-width band, background var(--cream), min-height ~88vh, generous padding (~96px top to clear a future nav).

**Desktop (≥1024px):** two columns, max-width 1200px centered, gap 64px.
- Left (~55%): kicker "AI ADOPTION & TRANSFORMATION", then H1: `AI adoption that survives contact with <em>reality</em>.` — the `<em>` is italic serif in var(--accent). Sub-paragraph (Inter, 18px, ink/75%, max 48ch): "Senior consulting for companies that want AI working in their operations — not in a slide deck. We assess honestly, pilot before promising, and put kill criteria in writing." Two CTAs: primary = filled var(--accent), white text, padding 16px 32px, square ("Book a 30-minute call"); secondary = transparent, 1px ink border ("See the method").
- Right (~45%, max 460px): the dashboard card.

**Mobile (<1024px):** single column; H1 40px; dashboard card after the CTAs, full-width, scaled typography (11–12px UI text).

## 4. The dashboard card (the centerpiece)

A miniature, plausible pilot-monitoring UI. Background var(--paper), 1px border, square. Composition top to bottom:

1. **Card header:** left — label "PILOT 07" (kicker style) + title "Invoice triage agent" (serif, 20px). Right — status chip: `CROSSING · WEEK 5 OF 8` (1px ink border, 11px uppercase). Below, one muted line: "Kill criteria agreed before kickoff — 12 May".
2. **Four metric rows.** Each row: metric name (13px, ink), live value (tabular-nums, 15px, 500), a 90px inline SVG sparkline, and a muted target annotation:
   - `Task accuracy` → climbs to **94.6%** · target ≥ 95% · sparkline trending up
   - `Cost per task` → settles at **$0.041** · max $0.06 · healthy
   - `Handling time` → **−38%** vs. baseline · healthy
   - `Error escalation rate` → **THE KILL METRIC.** Climbs from 0.8% toward **2.1%** · annotation: "kill threshold ≥ 2.0%". Its sparkline has a horizontal **dashed terracotta threshold line** drawn at the 2.0% level from the start, with a tiny "KILL ≥ 2.0%" label.
3. **Card footer:** initially a muted line "Reviewed weekly with client steering." — later replaced (see timeline).

## 5. Animation timeline (be precise; use a single timeline driver)

Trigger: when the card enters viewport (IntersectionObserver, threshold 0.5), play once. Total ≈ 11s, then hold final state. A small replay control (↺, 28px square, 1px border) appears after completion, top-right of the card.

- **t=0–0.6s — Arrival.** Card fades up 16px (ease-out). Sparklines are empty axes.
- **t=0.6–4.0s — The pilot runs.** All four sparklines draw left-to-right (SVG stroke-dashoffset). Values count up/down with eased ticking (tabular-nums so nothing jitters). Rows 1–3 land on their final healthy values; tiny ✓ in var(--ok) appears next to rows 2–3 (and a neutral "0.4 below target" note on row 1 — close, not catastrophic). Meanwhile row 4 climbs slowly and *almost* flattens around 1.7% — a believable false reassurance beat around t=3.0s.
- **t=4.0–5.2s — The crossing.** Row 4 resumes climbing and crosses the dashed threshold line. At the crossing point: a 3px terracotta dot marks the intersection, the dashed line pulses ONCE (opacity 0.5→1→0.7, 600ms — no flashing loop), and the row's value turns var(--accent): **2.1%**. A small annotation slides in under the row: "Kill criterion breached — week 5". Everything else stays still. No shaking, no red.
- **t=5.2–6.5s — Calm termination.** 250ms of total stillness first (the inhale). Then: all sparklines freeze; rows 1–3 desaturate to 45% opacity; the status chip crossfades to `TERMINATED · WEEK 5 OF 8` with a 1px var(--accent) border. The pause-then-act sequencing is what makes it feel deliberate rather than reactive.
- **t=6.5–7.3s — The stamp.** A rectangular stamp rotates in over the card center, −8°: two nested 2px var(--accent) borders, uppercase serif, reading `KILLED — EVIDENCE ACQUIRED` with a second line in 10px Inter: "5 weeks · pilot budget only". Animation: scale 1.6→1.0 with opacity 0→0.92, 320ms, ease-in (it lands, it doesn't bounce), then ONE 1px settle. Add a subtle ink-stamp texture using an SVG noise filter (feTurbulence) masked to the stamp — it should look pressed, not printed.
- **t=7.3–9.0s — The lesson.** Card footer crossfades to, typed character-by-character (25ms/char, no blinking cursor after finish): `Cost of certainty: 5 weeks. Cost avoided: a failed production rollout.` followed by a real link `Why every pilot has kill criteria →` in var(--accent).
- **t=9.0s+ — Hold.** Final state persists. No loop. Looping a termination would make it a gag; holding makes it a statement.

## 6. Accessibility & performance (non-negotiable)

- `prefers-reduced-motion: reduce` → skip all animation; render the final stamped state immediately, fully legible.
- The card gets `role="img"` and `aria-label="Example pilot dashboard: a pilot whose error rate crossed its pre-agreed kill threshold was terminated in week five, at pilot cost only."` Decorative internals `aria-hidden="true"`. The footer link remains a real focusable `<a>`.
- 60fps: animate only `transform`, `opacity`, and SVG `stroke-dashoffset`/`stroke-dasharray`. Drive value counters with a single `requestAnimationFrame` loop. No layout-property animation, no canvas, no images. Whole file < 60KB excluding fonts.
- No sound. Ever.

## 7. What NOT to do

- No red, no warning triangles, no blinking, no siren metaphors, no skull icons.
- No confetti-grade easing (no elastic/bounce); use ease-out and ease-in-out only, plus the single stamp settle.
- No rounded corners, no gradients, no glassmorphism, no drop shadows.
- Don't make the failing pilot look incompetent — three of four metrics are *good*. The point is discipline, not disaster.
- Don't speed it up to feel snappy. The 250ms stillness before termination and the slow type-out are the design.

## 8. Acceptance checklist (verify each before finishing)

1. Plays once on scroll-into-view; replay button works and fully resets state.
2. Reads correctly at 360px, 768px, 1440px widths.
3. Reduced-motion shows the complete final state with stamp and footer text.
4. All numbers use tabular-nums (zero horizontal jitter while counting).
5. The threshold line is visible from t=0 — the viewer must be able to see the criterion *before* it's breached, because "agreed in advance" is the whole story.
6. Final stamped card is screenshot-worthy: someone should be able to share it and the brand promise is fully legible without animation.
7. No console errors; works in Chrome, Safari, Firefox.

When done, open the file, watch the full timeline, and self-review against section 5 timings and section 7 prohibitions before declaring it complete.
