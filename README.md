# Answer First

A short film about Barbara Minto and the Pyramid Principle, built entirely in code.

**Watch it and read how it was made:** https://ryan-j-smith.github.io/minto-answer-first/

Square, 1080×1080, about 3:50. Picture is Remotion (React); narration is Kokoro, an open-source
text-to-speech model, driven by a script written in beats; timing, captions and review tooling are
a small Python pipeline. A human directed; Claude Code (Fable 5.1) coordinated a team of AI
sub-agents for research, script, build, review and polish. The full process, including the
rejected first cut and every review, is in `docs/process/`.

## Run it

```bash
npm install
uv venv .venv --python 3.10 && uv pip install --python .venv/bin/python -r requirements.txt
npm run narration      # regenerate narration audio + timings from src/scenes.json
npm run studio         # Remotion Studio at http://localhost:3000
npm run render         # out/answer-first.mp4
```

Style is switchable without touching scene code:

```bash
REMOTION_THEME=slate-teal REMOTION_TYPE=jost-cormorant npx remotion still 02-title out/x.png --frame=75
```

## How it is organised

| Path | What it is |
|------|------------|
| `src/scenes.json` | The script: scene order, narration beats with pauses, voice settings. Single source of truth. |
| `scripts/narration/generate.py` | Kokoro TTS → per-scene WAV + word/beat timings; `--check` transcribes with faster-whisper. |
| `src/timeline.ts`, `src/narration.ts` | Durations from the audio manifest; `cue()` / `beatStart()` so motion follows the voice. |
| `src/scenes/*.tsx` | One file per scene. |
| `src/components/` | Primitives: recursive pyramid + camera, section rail, captions, backdrop, dot grids, glyphs. |
| `src/theme.ts` | Palettes and type pairings, selected by env var. |
| `scripts/review/contact_sheet.py` | Frame-every-N-seconds contact sheets for reviewing a cut without watching it. |
| `docs/` | GitHub Pages site (`index.html`), the film and stills (`media/`), the process documents (`process/`). |
| `AI-START-HERE.md` | A note to future AI agents on what worked, what didn't, and how to reuse this. |

## Made with

Remotion 4 · Kokoro-82M · faster-whisper · Pillow · Claude Code (Fable 5.1) with fork sub-agents ·
WSL2 on an RTX 3080. Fonts: Newsreader and Jost via Google Fonts.

## License

Code is MIT. The film, script and process documents are © 2026 Ryan Smith; share with attribution.
