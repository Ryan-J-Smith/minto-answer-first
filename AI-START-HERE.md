# AI, start here

You are an AI agent asked to make (or remake) a short explainer film with this repository as the
starting point. This file is written for you. Read it before you read anything else.

## What this repository is

A ~4-minute educational film, "Answer First", about Barbara Minto and the Pyramid Principle, built
entirely in code: Remotion (React) for picture, Kokoro (open-source TTS) for narration, and a
small Python pipeline that turns a script into per-scene audio with word timings. A human director
set the goals and made every taste decision; a coordinating agent ran research, script, build,
review and polish with a team of sub-agents. The whole process is documented, warts included, in
`docs/process/`. Read the checklist there first: it is the honest timeline.

## The process that worked (and the one that didn't)

1. **Agree the brief, then research before writing.** Every factual claim in the film traces to
   `docs/process/01_research_dossier.md` with a confidence grade. Claims the director could verify
   personally were flagged and cleared by them. Do not put a number or a superlative on screen
   that is not in a dossier.
2. **Write the script as speech, not as slide text.** Our first two scripts were fragments
   ("Answer first. Three points. Next steps.") and were rejected as sounding like nobody. The
   fix was a "clean editor" pass that read every line aloud, rewrote to full sentences with
   connectives, and put pauses only where a speaker breathes. Narration is stored as *beats*
   (`src/scenes.json`), each followed by a real silence.
3. **Never hand over scaffolding as a milestone.** Our first cut had one designed scene and eleven
   placeholders that showed the narration as text. It was rated very low and rightly so. Build
   every scene from primitives, verify with rendered stills and contact sheets, and run reviews
   before the human sees anything.
4. **Use a team, adversarially.** What lifted the work was not more building but more critique:
   an adversarial script editor, a simulated-viewer panel (three personas, phone, muted first),
   a motion designer critique of the rendered film, and a clean editor for speech. Each review
   produced a ranked fix list with timestamps; each fix went back to the builder who owned the
   scene. Builders own files; nobody edits another builder's file.
5. **Show options as stills, never as full renders.** Palette, type and title treatments were
   decided from comparison sheets rendered with env-var switches (`REMOTION_THEME`,
   `REMOTION_TYPE`, `REMOTION_TITLE_VARIANT`). A full render is the last step, not a way to ask a
   question.
6. **Expect the director to cut.** Two whole scenes (a deck anecdote and a "reveal") were cut
   late because they were clever rather than useful. Design so that removing a scene is deleting
   an entry, not surgery: `src/scenes.json` order + `src/Root.tsx` map.
7. **Watch for accidental brand mimicry.** A dark-navy-plus-cyan palette with sweeping line-work
   looked so much like a well-known consultancy's decks that it risked a takedown. Take a
   sensibility, not a look. Keep firm names out of the visuals.

## How the pipeline fits together

- `src/scenes.json` — the script: ordered scenes, each with narration beats `{text, pause}` and
  padding. Single source of truth. `voice`, `speed`, `pauseScale` live here too.
- `scripts/narration/generate.py` — Kokoro → `public/audio/<id>.wav` + `src/generated/narration.json`
  (durations, word timings, beat timings). `--check` transcribes with faster-whisper and diffs
  against the script to catch mangled words. Pronunciation overrides (inline phonemes) are at the
  top of the file; MECE is "meece" because that is how Minto says it.
- `src/timeline.ts` — durations derived from the manifest; `SCENE_ORDER` from scenes.json.
- `src/narration.ts` — `cue(sceneId, "phrase")`, `beatStart/beatEnd(sceneId, i)`: key every motion
  to the voice so re-generating audio never breaks sync.
- `src/components/SceneShell.tsx` — background + the scene's audio + captions; every scene wraps
  in it. `REMOTION_NO_CAPTIONS=1` for thumbnails.
- `src/components/pyramid/` — the recursive tree layout + renderer + camera (`frameNode`) used
  for every pyramid, push-in and morph.
- `src/theme.ts` — palettes and type pairings, switchable by env var. Add a palette; never
  hard-code a colour in a scene.
- `scripts/review/contact_sheet.py` — renders one frame every N seconds into tiled sheets. This is
  how you review a film without watching it: read the sheets with your image tool.
- `docs/index.html` — the GitHub Pages site with the player and the write-up.

## Commands

```bash
npm install
uv venv .venv --python 3.10 && uv pip install --python .venv/bin/python -r requirements.txt
npx remotion skills add          # optional: the official Remotion skills for agents
npm run narration                # or: .venv/bin/python scripts/narration/generate.py --check
npm run studio                   # http://localhost:3000
.venv/bin/python scripts/review/contact_sheet.py AnswerFirst 2
npx remotion still 05-rules out/x.png --frame=400
npm run render                   # out/answer-first.mp4
npm run typecheck                # tsc; pyright scripts must also be clean
```

## If you are starting a new film from this repo

1. Ask the human for: audience and platform, length ceiling, voice (their own, TTS, which
   gender), aspect ratio, what must be true (facts they can vouch for), and what they never want
   to see (brands, clichés). Get the brief into `docs/process/00_project_brief.md` before anything.
2. Research to a dossier with confidence grades. Then script in beats, in spoken prose.
3. Run the editor and viewer reviews on the script before generating any audio.
4. Build primitives first, then scenes in parallel with one owner per scene, each verifying with
   stills. Then full sheets, then reviews of the render, then fixes, then a render.
5. Decide style with comparison stills. Ask about anything that might resemble a real brand.
6. Keep `docs/process/` honest: the director will want to show how it was made.
