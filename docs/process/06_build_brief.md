# Build brief for scene builders

You are building one or more scenes of "Answer First" in Remotion. The bar is a much higher bar: an engaging,
editorial motion-graphics explainer. The last attempt was rejected as "text on screen being read
back". Do not repeat it.

## Ground rules
1. **Source of truth:** `docs/ai_docs/05_script_v3_final.md` (picture per beat) and `src/scenes.json`
   (narration beats). Build what the storyboard says; improve on it where you can make the idea land
   harder, but never put the narration sentence on screen as body text.
2. **Only edit your own scene files** under `src/scenes/`. You may ADD new components under
   `src/components/` with a name prefixed by your scene (e.g. `HookCounter.tsx`). Do not modify
   existing shared components (`Paper`, `Captions`, `SceneShell`, `motion`, `pyramid/*`, `SlideCard`,
   `DotGrid`, `Typo`, `DocumentLines`, `theme`). If a shared component is missing something, add an
   optional prop only if it cannot change existing behaviour; otherwise write your own component.
3. **Wrap the scene in `<SceneShell sceneId="…">`.** It supplies paper, the narration audio, captions.
4. **Key every motion to the voice.** Use `beatStart(sceneId, i)` / `beatEnd(sceneId, i)` (0-based
   beat index) or `cue(sceneId, "phrase")` from `src/narration.ts`, converted to frames with
   `sec(seconds, fps)` and offset by `useNarrationStart(sceneId)` (the leading pad). Use `enter()`
   from `components/motion.ts` for ease-out entrances. Camera moves use `easeInOut` from theme.
5. **Safe area:** 1080×1080. Keep content inside x∈[88,992], y∈[100,880]; captions live below 880.
   Minimum text sizes: 22px for labels, 30px for anything the viewer must read, 84px+ for a headline.
6. **Visual language:** paper/ink/one accent from `theme.ts`. Hairline boxes, serif (`fonts.display`)
   for answers, big numbers and pull-quotes; sans (`fonts.body`) for labels. No bounces, no drop
   shadows except the subtle one already on `SlideCard`. Grain and vignette come from `Paper`.
7. **Type must pass:** `npx tsc --noEmit` with zero errors before you report.
8. **Verify visually.** Render stills at 3–5 meaningful frames per scene:
   `npx remotion still <scene-id> out/stills/<scene-id>-<n>.png --frame=<n>` then LOOK at each PNG
   with the Read tool and fix what's wrong (overlaps, text running off, illegible sizes, motion that
   hasn't started when the narration says it). Iterate until every still would pass a picky designer.
   Frame numbers: `useNarrationStart` pad ≈ 9–12 frames; beat times are in
   `src/generated/narration.json` (`beats[i].startMs`). fps = 30.
9. **Also render a short clip** of your scene to check motion:
   `npx remotion render <scene-id> out/clips/<scene-id>.mp4 --concurrency=4`
   and extract a contact sheet: `npx remotion ffmpeg -y -i out/clips/<scene-id>.mp4 -vf "fps=1,scale=270:-1,tile=6x4" out/clips/<scene-id>-sheet.png`
   then Read the sheet.
10. Report back with: which files you created, what each still shows, anything in the storyboard you
    changed and why, and any `[CHECK]` items for the director.

## Primitives cheat-sheet
- `layoutPyramid(tree, {boxW:[...], boxH:[...], gapX:[...], gapY:[...]}, maxDepth?)` → layout with
  `nodes`, `edges`, `byId`, `width`, `height`. Arrays are per-depth; last value repeats.
- `<PyramidView layout origin camera appearance fontSize />` — `appearance(node) => {enter, text,
  emphasis, dim, dx, dy, fill, mono}`; `camera = {scale, tx, ty}` around `origin`.
- `frameNode(layout, id, {width:1080,height:1080,padding}, origin, subtreeRoot|null)` → camera that
  frames a node (and its subtree). Interpolate from `{1,0,0}` to it for a push-in.
- `ANSWER_TREE`, `FACT_ROWS`, `QUESTION_TEXT`, `HYPOTHESIS_TEXT`, `OWNERS` in `src/example.ts`.
- `<SlideCard width title bullets number enter emphasis style />` — 16:9 card.
- `<DotGrid count columns cell dot reveal highlight />`.
- `<Eyebrow>`, `<BigStat value label source enter size />`, `<Quote text attribution enter size />`.
- `makeDocLines(count, seed, headings)` + `<DocumentLines lines shown width x y highlightIndex highlightText />`.
- Fonts: `fonts.display` (Fraunces), `fonts.displayItalic`, `fonts.body` (Inter).

## Scene ownership
- Builder A: `Hook.tsx`, `Title.tsx`, `Thesis.tsx` (rework: no sentence in the box), `Credits.tsx`
- Builder B: `Origin.tsx`, `Reach.tsx`
- Builder C: `Rules.tsx`, `Recursion.tsx`
- Builder D: `Deck.tsx`, `Applications.tsx`
- Builder E: `Reveal.tsx`, `NextSteps.tsx`
