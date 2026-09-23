# Simulated viewer review — render 1 (rendered film, 3:42)

Evidence: `out/review/AnswerFirst-sheet-01..04.png` (one frame / 2 s) plus close-ups
`out/review/v-{600,2820,3600,3660,4560,5340,5460}.png`. Phone, LinkedIn feed, muted first, captions on.
Script is locked; this judges picture and pacing only.

## 1. Scores

| Viewer | Score | One sentence |
|---|---|---|
| A — product manager, no consulting background | **7/10** | The hook's counter and the buried recommendation stop the thumb, the technique chapter is now a real explainer they'd reuse, and the only places they drift are three or four blank-ish frames and one muddled transition at 2:00. |
| B — ex-BCG, runs strategy at a bank | **7/10** | Accurate, restrained, and the push-in earns real respect; what still costs points are craft defects a partner would circle (colliding evidence labels in Rules, clipped text in "No overlaps", a doubled crossfade in the morph) and two narration claims B still doesn't accept. |
| C — second-year analyst, low patience | **8/10** | Screenshots the pricing pyramid, the MECE letters, the push-in and the five-slide row; the author line at 3:36 is exactly the credibility that turns "useful" into a follow. |

### Where they scroll away (or nearly)

- **A:** first risk at 0:19–0:22, where the one-page pyramid fades to ~10 % and the frame is effectively blank for ~2 s before "Answer First" lands (see v-600). Second risk at 2:52–2:56, four seconds of three empty squares. Stays through both with sound on; muted, ~30 % chance of leaving at 0:21.
- **B:** does not scroll; skips forward at 2:04–2:18 (deck) because they know it, comes back for the morph. Loses a little respect at 1:22–1:40 (evidence columns collide) and 1:34 (clipped text).
- **C:** no scroll-away. Mild "what am I looking at" at 2:00 ("A SEN/DE/ENCE" label collision under a ghosted sentence) and at 3:14/3:26 (empty frames at chapter openings).

### Confusion moments (all viewers)

- 0:19–0:21 (02-title): the "one page" vanishes before the title arrives; A wonders if the video glitched.
- 1:34 (05-rules, v-2820): "Customers wi | Competitors" — letters cut off under the tinted overlap. Reads as a bug, not as "overlap".
- 1:22–1:40 (05-rules): middle-column evidence "we're now lowest" runs into the third column's dash and "2 quarters missed".
- 2:00 (06-recursion, v-3600): the sentence "We should raise the p… three reasons" is still ghosted behind the slide card, and the labels A SENTENCE / A SLIDE overprint each other.
- 2:32 (08-applications, v-4560): answer text and question text both visible at ~50 % for half a second.

### Screenshot / share moments

- 0:06 "31" with the recommendation card; 0:16–0:18 the complete one-page pyramid.
- 0:50 eight accent dots in 600, "8 / OF 600".
- 1:02–1:04 thinking / ~~language~~.
- 1:24–1:40 the pricing pyramid with rules 1–3 in the margin (C would reuse the layout).
- 1:40 M · E · C · E landing.
- 1:46–1:56 the push-in into "Customers will stay" and then into the fact rows with ✓ A FACT. **Share moment for all three.**
- 2:16 the five numbered cards / "What the client sees" (C).
- 3:22–3:24 the reveal: PROBLEM · QUESTION · ANSWER thumbnails over the film's own pyramid.
- 3:36 the author line.

### Illegible on a phone (1080 → ~390 px wide)

- 05-rules evidence labels at 23 px (fine as texture, but the collisions make them look broken).
- 07-deck five-card titles at ~14 px (2:14–2:18): only the numerals carry.
- 09-reach language-card names (2:50) and the tiny accent pyramids in the industry grid (3:04) read as smudges.
- 01-hook "SLIDE" under the numeral and "ONE PAGE" label: fine, they're decorative.

### Consulting cosplay

- Much reduced. "To: the CEO · Re: pricing", "WHAT THE CLIENT SEES", "THE FIRMS / INDUSTRY" all read as diagram labels, not flexing.
- B still rejects two narration lines (script, not picture): "Every major firm teaches it to its new consultants" and "Most will move on within a few years". Noted only.

### Does the ending earn a follow?

- C: yes, because of the author line and the three concrete next steps.
- A: yes-ish; would follow if the post copy repeats the six-years line.
- B: would follow if the author line were on screen a beat longer (it appears at 3:36 and the scene cuts at ~3:38).

## 2. Ten fixes, ranked

| # | Time | Scene | Exact change |
|---|------|-------|--------------|
| 1 | 1:22–1:40 | 05-rules | Evidence columns collide: shorten labels to two words ("now lowest", "2 qtrs missed", "1 segment at risk" → "1 segment risk") and/or add ≥ 24 px between columns so no label crosses into the next column's dash. This is the film's core chapter; a colliding label there reads as carelessness. |
| 2 | 1:57–2:02 | 06-recursion | The three-sizes coda: fully fade out the sentence line and the "A SENTENCE" label before the slide card and "A SLIDE" enter (no crossfade; sequential), then fade the slide out before the year-long tree. Give the Minto quote its own clean beat: paper wash to ~85 %, quote ≥ 40 px, hold ≥ 2.5 s. |
| 3 | 0:19–0:22 | 02-title (and end of 01-hook) | Keep the one-page pyramid at ≥ 35 % opacity throughout the title card and bring "Answer First" in within 0.4 s of the cut, so there is never a frame with only a half-drawn emblem on blank paper (v-600). |
| 4 | 2:52–2:56 | 09-reach | Three empty squares for ~4 s. Drop the pyramid marks in on "Every" (beat start), add the label THE FIRMS immediately, and start the first dots leaving on "consultants". |
| 5 | 1:33–1:36 | 05-rules | "No overlaps": text is cut off by the tinted intersection. Clip each box's text to its own box (overflow hidden) and fade the overlapped box text to 40 % while boxes overlap, so the overlap reads as a shape, not a rendering error. |
| 6 | 2:14–2:18 | 07-deck | Five-card row: widen the row to ~900 px and set card titles ≥ 22 px, or drop the titles and keep numerals + "Answer / Customers / Competitors / Company / Next steps" as a caption line under the row at 24 px. |
| 7 | 2:26–2:36 | 08-applications | Text morph: fade old text to 0 before new text fades in (two half-length fades, sequential) so no frame shows doubled text. |
| 8 | 0:40–0:42 | 04-origin | Two seconds of empty paper. Have "experiment" begin drawing on the first syllable of the beat and let the rail's CLEVELAND dot pulse in from frame 0. |
| 9 | 3:14, 3:26 | 10-reveal, 11-next-steps | Chapter openings are blank for ~2 s. Draw the eyebrow at frame 0 and pre-draw faint layout guides (the pyramid's connector spine in 10; the three numeral positions in 11) so the frame is never empty. |
| 10 | 3:04–3:06 | 09-reach | The tiny accent pyramids in the grid are smudges on a phone. Make them ≥ 44 px ink outlines with only the top box in accent, or morph each dot into a three-box outline. Also hold the author line in 11-next-steps ≥ 1 s longer before the cut. |

## 3. Do not change

1. **The push-in, 1:44–1:58 (06-recursion).** The camera move into "Customers will stay" and again into the fact rows is the single most memorable image, and the ✓ A FACT landing is the stopping rule made visible.
2. **The hook, 0:00–0:10 (01-hook).** Giant serif counter → 31 → recommendation card → eight room dots dimming to one. Works muted, works with sound, and the reveal reuses it.
3. **0:46–1:04 (04-origin).** The 600-dot ripple with eight accent dots, then thinking / ~~language~~. It is the emotional centre of the origin chapter and needs no help.
