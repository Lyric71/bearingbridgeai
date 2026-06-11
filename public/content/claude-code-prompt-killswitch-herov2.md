# Claude Code Prompt — Validated-Pilot Hero Animation ("Survives Contact with Reality")

Copy everything below the line into Claude Code.

---

Build a single self-contained file `hero-validation.html` (inline CSS + vanilla JS, no build step, no frameworks — GSAP via CDN is allowed but optional) implementing the hero section of a consulting website, including an animated "pilot validation dashboard." It must be production-quality: I will later port it to a Next.js + Tailwind component, so keep the JS cleanly separated in one `<script>` block and use CSS custom properties for all tokens.

## 1. Brand context (read carefully — it drives every visual decision)

bearingpoint.ai is a senior AI adoption consultancy. The headline is **"AI adoption that survives contact with reality."** The animation must perform exactly that sentence: a pilot is tested against **pre-agreed success and kill criteria**, the evidence comes in, the pilot **survives validation**, and the work visibly continues — building and scaling to production. 

The credibility device is that the criteria exist *before* the results: the viewer must see the bar the pilot has to clear from the very first frame. This is proof-driven optimism, not hype. The emotional register: a flight-test program certifying an aircraft — rigorous gates, calmly passed, then onward. If any part feels like a celebration (confetti energy) or like marketing magic (instant success), it is wrong. Earned progress is the product.

## 2. Design system (extracted from our reference, use exactly)

```css
:root {
  --cream:  #F3E9D8;   /* hero background band */
  --ink:    #111827;   /* headlines, borders, dark text */
  --accent: #C56A3C;   /* terracotta — the ONLY accent color */
  --paper:  #FFFFFF;   /* card background */
  --ok:     #16A34A;   /* validated checkmarks only, use sparingly */
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
- Left (~55%): kicker "AI ADOPTION & TRANSFORMATION", then H1: `AI adoption that survives contact with <em>reality</em>.` — the `<em>` is italic serif in var(--accent). Sub-paragraph (Inter, 18px, ink/75%, max 48ch): "Senior consulting for companies that want AI working in their operations — not in a slide deck. We pilot against criteria agreed in advance, then build and scale what proves itself." Two CTAs: primary = filled var(--accent), white text, padding 16px 32px, square ("Book a 30-minute call"); secondary = transparent, 1px ink border ("See the method").
- Right (~45%, max 460px): the dashboard card.

**Mobile (<1024px):** single column; H1 40px; dashboard card after the CTAs, full-width, scaled typography (11–12px UI text).

## 4. The dashboard card (the centerpiece)

A miniature, plausible pilot-validation UI. Background var(--paper), 1px border, square. Composition top to bottom:

1. **Card header:** left — label "PILOT 07" (kicker style) + title "Invoice triage agent" (serif, 20px). Right — status chip: `CROSSING · WEEK 5 OF 8` (1px ink border, 11px uppercase). Below, one muted line: "Success & kill criteria agreed before kickoff — 12 May".
2. **Four metric rows.** Each row: metric name (13px, ink), live value (tabular-nums, 15px, 500), a 90px inline SVG sparkline, and a muted criterion annotation. **Every sparkline shows its criterion as a dashed terracotta line from t=0** — targets to clear or ceilings not to breach:
   - `Task accuracy` → climbs and clears **95.4%** · criterion: ≥ 95% (dashed target line at 95)
   - `Cost per task` → settles at **$0.041** · criterion: ≤ $0.06 (dashed ceiling line)
   - `Handling time` → reaches **−38%** vs. baseline · criterion: ≥ −25%
   - `Error escalation rate` → **THE TENSION METRIC.** Climbs from 0.8% toward the kill ceiling (dashed line labeled "KILL ≥ 2.0%"), peaks at **1.8%** in week 4… then bends back down to **1.2%** after a fix. Survival must look earned, not effortless.
3. **Phase tracker strip** under the metrics: the five method phases as small labels — `BEARINGS · CHART · CROSSING · BUILD · ANCHOR` — with CROSSING currently underlined in var(--accent).
4. **Card footer:** initially a muted line "Reviewed weekly with client steering." — later replaced (see timeline).

## 5. Animation timeline (be precise; use a single timeline driver)

Trigger: when the card enters viewport (IntersectionObserver, threshold 0.5), play once. Total ≈ 12s, then hold final state. A small replay control (↺, 28px square, 1px border) appears after completion, top-right of the card.

- **t=0–0.6s — Arrival.** Card fades up 16px (ease-out). Sparklines are empty axes — but every dashed criterion line is already drawn and labeled. The bar exists before the results. This is the most important frame of the whole animation.
- **t=0.6–4.5s — The pilot runs.** All four sparklines draw left-to-right (SVG stroke-dashoffset). Values count with eased ticking (tabular-nums). Rows 2–3 clear their criteria first; a small ✓ in var(--ok) appears at each crossing with the word "validated" in 10px. Row 1 clears 95% near the end of the window (✓). Meanwhile row 4 climbs toward the kill ceiling and peaks at 1.8% around t=3.2s — a genuine near-miss beat; a tiny muted annotation appears: "wk 4: prompt + routing fix" — then the line bends downward.
- **t=4.5–5.3s — Survival confirmed.** Row 4 settles at 1.2%, comfortably under the ceiling; it gets its ✓. 250ms of total stillness (the inhale). Then the status chip crossfades to `VALIDATED · WEEK 6 OF 8` with a 1px var(--ok) border — the only moment green is allowed on a non-checkmark element.
- **t=5.3–6.1s — The stamp.** A rectangular stamp rotates in over the card center, −8°: two nested 2px var(--accent) borders, uppercase serif, reading `VALIDATED — SCALING TO PRODUCTION` with a second line in 10px Inter: "evidence acquired · criteria met 4 / 4". Animation: scale 1.6→1.0 with opacity 0→0.92, 320ms, ease-in (it lands, it doesn't bounce), one 1px settle. Subtle ink-stamp texture via SVG feTurbulence mask — pressed, not printed. After 1.2s the stamp drifts to 0.35 opacity and docks toward the card's upper area so the next beat stays legible.
- **t=6.1–8.5s — Keep building.** The story continues — survival is not the end. The phase tracker advances: the underline slides from CROSSING to **BUILD** (400ms), then a new compact row animates in below the tracker: `Production rollout — Finance BU` with a thin progress bar drawing to 64% and a muted "integrations · security review ✓". At t=7.8s the underline ticks once more toward **ANCHOR** with a final line: `Team trained · 31 operators onboarded`, counting up.
- **t=8.5–10.5s — The lesson.** Card footer crossfades to, typed character-by-character (25ms/char, no blinking cursor after finish): `Proven against criteria set in advance. Now in production.` followed by a real link `See the method →` in var(--accent).
- **t=10.5s+ — Hold.** Final state persists: validated metrics, stamp ghosted at top, Build/Anchor progress visible, footer line complete. No loop — held, it reads as a track record.

## 6. Accessibility & performance (non-negotiable)

- `prefers-reduced-motion: reduce` → skip all animation; render the final state immediately, fully legible.
- The card gets `role="img"` and `aria-label="Example pilot dashboard: a pilot validated against success and kill criteria agreed in advance, now scaling to production with the client team trained."` Decorative internals `aria-hidden="true"`. The footer link remains a real focusable `<a>`.
- 60fps: animate only `transform`, `opacity`, and SVG `stroke-dashoffset`/`stroke-dasharray`. Drive value counters with a single `requestAnimationFrame` loop. No layout-property animation, no canvas, no images. Whole file < 60KB excluding fonts.
- No sound. Ever.

## 7. What NOT to do

- No confetti, fireworks, trophy icons, or celebration metaphors — validation is professional, not festive.
- No instant success: the near-miss on the escalation metric (peak 1.8%, fix, recovery) is mandatory. Survival without tension is just another hype demo.
- No red, no warning flashes; the kill ceiling is a calm dashed line, not a threat.
- No confetti-grade easing (no elastic/bounce); ease-out and ease-in-out only, plus the single stamp settle.
- No rounded corners, no gradients, no glassmorphism, no drop shadows.
- Don't drop the kill ceiling from the design — the visible possibility of failure is what makes the survival credible. That dashed line is the brand.
- Don't speed it up to feel snappy. The 250ms stillness before VALIDATED and the slow type-out are the design.

## 8. Acceptance checklist (verify each before finishing)

1. Plays once on scroll-into-view; replay button works and fully resets state (including phase tracker and Build/Anchor rows).
2. Reads correctly at 360px, 768px, 1440px widths.
3. Reduced-motion shows the complete final state with stamp, progress rows, and footer text.
4. All numbers use tabular-nums (zero horizontal jitter while counting).
5. Every criterion line (targets and kill ceiling) is visible from t=0, before any data draws — "agreed in advance" is the whole story.
6. The near-miss beat on the escalation metric is clearly readable: climb → peak near ceiling → annotated fix → recovery → ✓.
7. Final held card is screenshot-worthy: validated 4/4, stamp, production progress, trained team — the full "survive → build → scale" arc legible without animation.
8. No console errors; works in Chrome, Safari, Firefox.

When done, open the file, watch the full timeline, and self-review against section 5 timings and section 7 prohibitions before declaring it complete.
