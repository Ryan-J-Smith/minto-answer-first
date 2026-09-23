# Implementation checklist

Update as steps complete. `[ ]` todo · `[x]` done · `[~]` in progress · `[!]` blocked (say why).

## Phase 0 — Planning
- [x] Requirements agreed (`00_project_brief.md`)
- [x] Research dossier with sources (`01_research_dossier.md`)
- [x] Script v1 (`02_script.md`)
- [x] Script v1 rejected by director (rejected). Script v2 → editor + viewer reviews → **script v3 locked** (`05_script_v3_final.md`)
- [ ] Retry McKinsey alumni article (MECE pronunciation, extra quotes) — blocked from WSL; director may supply

## Phase 1 — Toolchain
- [x] Remotion project scaffolded (`package.json`, `remotion.config.ts`, `src/Root.tsx`)
- [x] Remotion Studio runs and is reachable from the Windows browser
- [x] Headless Chrome renders a still (`npx remotion still`) — may need apt libs, see below
- [x] Kokoro TTS installed in a uv venv; sample line rendered with two candidate voices
- [x] `ffmpeg` — not needed; Remotion bundles its own (`npx remotion ffmpeg`)

## Phase 2 — Pipeline
- [x] `scripts/narration/` — reads `src/script.ts`, writes one WAV per scene to `public/audio/<sceneId>.wav`
- [x] `src/timeline.ts` — ordered scene list; durations derived from audio metadata + padding
- [x] Caption generation per scene (Remotion whisper.cpp integration or Kokoro word timings)
- [x] `<Series>` composition in `Root.tsx` driven by the timeline

## Phase 3 — Design system
- [x] Tokens: paper, ink, accent, type scale (serif display + sans body), grain overlay
- [x] Primitives: `Paper`, `Captions`, `SceneShell`, `motion`, `pyramid/layout+PyramidView` (recursive + camera), `SlideCard`, `DotGrid`, `Typo` (Eyebrow/BigStat/Quote), `DocumentLines`. Photo dropped (no usable image).
- [x] Style frames: superseded by full builds; every scene verified with stills + contact sheets

## Phase 4 — Scenes (five builder agents in parallel, 2026-09-23; each verifies with stills + contact sheet)
- [x] 03 thesis (establishes slide styling)
- [x] 05 technique: rules
- [x] 06 technique: recursion (push-in)
- [x] 07 technique: deck
- [x] 08 applications: morph
- [x] 09 reach: numbers + diffusion
- [x] 10 reveal
- [x] 01 hook
- [x] 02 title
- [x] 04 origin (typographic; no photo)
- [x] 11 next steps
- [x] 12 credits

## Phase 5 — Finish
- [x] Assets: none (no photographs; all primitives). `public/images/CREDITS.md` records the decision
- [x] Narration v3 (Emma 0.95, beats + pauses, Whisper-checked)
- [x] Full render 1080×1080 H.264 → `out/answer-first.mp4` (3:44)
- [ ] Director review pass on render 2 (this handover); trims / [CHECK] items
- [ ] Final render

## System packages the director may need to install (WSL)
```
sudo apt-get install -y ffmpeg espeak-ng \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2
```
(`espeak-ng` is Kokoro's fallback phonemizer for out-of-dictionary words; the rest are headless
Chrome dependencies. Exact list confirmed after the first `npx remotion browser ensure` attempt.)

## Notes
- 2026-09-23: narration v1 totals 244 s (4:04) before padding/title/credits ≈ 4:26 total. Need ~100 words
  trimmed to land under 4:00. Candidates listed at the bottom of `02_script.md`.
- Voice samples for the hook in `public/audio/samples/` (af_heart, af_bella, bf_emma). Manifest uses af_heart.
- Headless Chrome libs all present in WSL; no apt installs were needed. espeak-ng not installed; Kokoro
  handled every word in the script without it.
- 2026-09-23 pm: narration v3 = beats with scripted pauses, Emma @0.95, pauseScale 0.85, edge-trimmed; Whisper check clean
  (only digit/spelling diffs). Film total 3:45. Builders A–E launched on scenes 01–12.
- Review tooling: `scripts/review/contact_sheet.sh` renders the film and tiles frames every 2 s.
- 2026-09-23 pm: all 12 scenes built by builders A–E; full render + contact sheets reviewed. Fix pass sent:
  scale up trees/cards in 05/06/07/08, fill the empty opening of 05, enlarge hook page, enlarge reach diffusion,
  fix OUT/IN label overlap. Crossfades (8 f) added in Root via TransitionSeries. Next: re-render → viewer +
  designer reviews → final fixes → final render.
- 2026-09-23 late: render 1 reviewed by viewer (7/7/8) + designer (7.5/10); 25 ranked fixes dispatched to builders
  A–E; captions restyled (no box), theme gained contentTop/contentBottom/inkDim; render 2 verified via contact sheets.
  Open for director: author line wording (11), Reach lines "every major firm teaches it" and "most will move on within a
  few years" (09), Deck account (07), MECE pronounced "meece".
- 2026-09-23 evening (render 3): director feedback applied — title first (2.6 s, animated, line-work), dark navy /
  cyan palette (tokens `fg/surface/accent…`, aliases kept), no grain, af_heart voice, layoff line rewritten
  ("the oil crisis cost her the job. She stayed in London, started her own firm…"), OUT/IN replaced by
  COMMUNICATING / THINKING, credits line "Made with Claude Fable 5.1 by Ryan Smith · linkedin.com/in/ryanjsmithphd/".
  All five builders re-verified stills; full-film sheets checked; `out/answer-first.mp4` re-rendered.
- 2026-09-23 night (render 4): director's audit applied — script v6 in spoken prose (clean-editor pass), deck and
  reveal cut, next steps = director's three (email · MECE sub-problems · "How would Barbara Minto structure this?"),
  palette slate + amber (`REMOTION_THEME`, default slate-amber; navy/cyan and line-work rejected as too McKinsey),
  type Jost + Newsreader (`REMOTION_TYPE`), "SLIDE n OF 5" eyebrows replaced by `SectionRail` (metro tracker),
  technique scene respaced (opaque discs, MECE centred, To/Re header gone), captions attach opening quotes to the
  next word. Narration af_heart @1.0, pauseScale 0.75 → film 3:48. Full sheets verified; MP4 rendered.
  Open for director: [CHECK] claims (firms teach it · most move on within a few years · no college degree ·
  "almost unchanged" · MECE = "meece"), author line wording.
- 2026-09-23 night: SCRIPT LOCKED (v6). Director verdicts on the five flagged claims: all accepted as near enough for
  the medium; MECE = "meece" is Minto's own pronunciation (most at the firm say "mee-see"), kept. Author line
  removed; McKinsey alumni article added to credits. Current render: out/answer-first.mp4 (~3:47).
- 2026-09-23 late: hook bridge line added ("There's a simple fix, and the story behind it goes back sixty years…");
  title treatment C (frame + amber corner ticks); author line removed; McKinsey alumni article cited. Final render
  copied to docs/media for the GitHub Pages site. Repo cleanup: cut scenes deleted, process docs sanitised into
  docs/process, README + AI-START-HERE + LICENSE written.
