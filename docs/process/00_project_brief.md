# Project brief: "Answer First" (working title)

An educational short film (~3:30–4:00) on Barbara Minto and the Pyramid Principle, for the
director's LinkedIn. Built entirely in code so segments can be inserted, removed, or re-ordered.

## Agreed requirements

- **Toolchain:** Remotion (React/TypeScript). Each scene is a component; the timeline is an
  ordered list of scenes. Runs in WSL; preview studio opens in the Windows browser.
- **Narration:** open-source text-to-speech, female narrator. First choice: Kokoro (runs locally
  on the RTX 3080). Narration is *third person*; the narrator is not the director.
- **Editability rules:**
  - Each scene owns its own narration clip.
  - Each scene's duration is derived from its audio length (plus configured padding).
  - Captions are generated per scene from that scene's audio, so re-ordering never breaks sync.
- **Format:** square, 1080×1080, burned-in captions (LinkedIn autoplays muted). A 16:9 cut may
  come later but is not designed for now.
- **Music:** none for v1. Revisit only if the narration feels clinical against picture.
- **Length:** target ~3:30. Hard ceiling 4:00. Prefer going a little long over cutting compelling
  material. "Origin" is the first place to trim if needed.
- **Structure:** self-referential. The film is itself a pyramid / a five-slide McKinsey deck:
  1. Slide one: the answer (thesis) with three supports
  2–4. One chapter per support: Origin, Technique, Applications & impact
  5. Next steps
  Reveal at the end shows the film's own outline as the deck.
- **Opening:** SCQA hook built on the five-paragraph essay ("you learned half of this in ninth
  grade"). Then a title card, like a short film.
- **Ending:** next steps for the viewer, then a single credits screen (~5 s): narration model,
  tools (Remotion, Claude Code), sources, photo credits, director's name/profile.
- **Recursion is the visual signature.** "Every box is the top of its own pyramid." The
  push-in animation (pyramid → push into a box → same shape → push again → pull back out)
  recurs in the technique chapter, the deck, the issue tree, and the final reveal.
- **Visual direction (revised 2026-09-23 pm):** dark navy field with a subtle blue gradient glow,
  off-white type and strokes, one cyan accent, thin sweeping line-work on the bookends. The
  sensibility of a strategy-firm keynote (references: QuantumBlack / McKinsey decks) without posing
  as any firm: no logos, no firm names in visuals. No grain, no paper texture. Serif display kept
  for the big statements. No photographs; everything is drawn from primitives.
- **Title card is first** (LinkedIn preview frame), animated from frame 0, 2.6 s. The hook ends by
  setting her name beneath the finished one-page pyramid.
- **Voice:** Kokoro `af_heart`, speed 0.95, beat-level pauses.
- **Language rules:** no "going out / going in" metaphor; say "applied to communicating" /
  "applies to thinking". Credits end with one small line: "Made with Claude Fable 5.1 by the director · [profile link]".

## Guardrails

- Every factual claim traces to `01_research_dossier.md`. No unsourced numbers.
- Barbara Minto is alive. Nothing implies otherwise.
- Any claim about what happens *inside* McKinsey / consulting firms is flagged
  `[CHECK: firm-internal]` in the script and must pass the director's review (a former McKinsey consultant).
- Dropped: "make it Minto" as a verb (website marketing copy; a former McKinsey consultant on the team had never heard it used).
- Dropped: "millions of copies sold" (only unsourced blogs).
- Dropped: memos as the running example (dated). Presentations are the lingua franca; email if a
  text example is needed.
- Photo/asset rights are recorded in the dossier before use.
