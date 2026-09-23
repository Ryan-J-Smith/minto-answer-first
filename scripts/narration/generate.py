"""Generate per-scene narration with Kokoro and write a timing manifest.

Reads  src/scenes.json          (single source of truth for the script)
Writes public/audio/<id>.wav    (24 kHz mono)
       src/generated/narration.json  (durations + word timings + beat timings, consumed by Remotion)

Narration is written in *beats*. Each beat is synthesised on its own and followed by a real
silence of `pause` seconds, so the voice breathes where a speaker would:

    "narration": [
      {"text": "Somewhere right now, a smart person is losing an argument.", "pause": 0.9},
      {"text": "Not because they're wrong.", "pause": 1.2}
    ]

Usage:
    .venv/bin/python scripts/narration/generate.py            # all scenes
    .venv/bin/python scripts/narration/generate.py 03-thesis  # one scene
    .venv/bin/python scripts/narration/generate.py --voice bf_emma --speed 0.95
    .venv/bin/python scripts/narration/generate.py --check    # also transcribe with Whisper and diff

Scenes whose beats are unchanged since the last run are skipped unless --force.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
SCENES_PATH = ROOT / "src" / "scenes.json"
AUDIO_DIR = ROOT / "public" / "audio"
MANIFEST_PATH = ROOT / "src" / "generated" / "narration.json"
SAMPLE_RATE = 24_000
OPENING_MARKS = set('“‘([')
# Kokoro trims to near-silence at clip edges; a hair of room keeps consonants from clipping.
EDGE_SILENCE_SEC = 0.08

# Words Kokoro's G2P would otherwise mangle. Written form -> spoken form. Applied to the text sent
# to the model only; the manifest keeps the written form so captions read correctly.
# Kokoro (misaki) also accepts inline phonemes: "[MECE](/mˈiːs/)" — used where plain respelling fails.
PRONUNCIATIONS: dict[str, str] = {
    "MECE": "[MECE](/mˈiːs/)",
    "MBA": "[MBA](/ˌɛmbiːˈeɪ/)",
    "Minto": "[Minto](/mˈɪntoʊ/)",
}


@dataclass(frozen=True)
class Word:
    text: str
    startMs: int
    endMs: int


@dataclass(frozen=True)
class Beat:
    index: int
    text: str
    startMs: int
    endMs: int
    pauseSec: float


@dataclass(frozen=True)
class SceneAudio:
    file: str
    durationSec: float
    textHash: str
    words: list[Word]
    beats: list[Beat]


def beats_of(scene: dict[str, Any], pause_scale: float = 1.0) -> list[tuple[str, float]]:
    """Normalise a scene's narration to [(text, pause_after_sec)]. Accepts a string or a beat list.
    `pause_scale` (scenes.json "pauseScale") scales every scripted pause, for global pacing tweaks."""
    raw = scene.get("narration", "")
    if isinstance(raw, str):
        text = raw.strip()
        return [(text, 0.0)] if text else []
    out: list[tuple[str, float]] = []
    for b in raw:
        text = str(b.get("text", "")).strip()
        if text:
            out.append((text, round(float(b.get("pause", 0.6)) * pause_scale, 3)))
    return out


def text_hash(beats: list[tuple[str, float]], voice: str, speed: float) -> str:
    payload = json.dumps({"v": voice, "s": speed, "b": beats, "p": PRONUNCIATIONS}, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


def apply_pronunciations(text: str) -> str:
    for written, spoken in PRONUNCIATIONS.items():
        text = re.sub(rf"\b{re.escape(written)}\b", spoken, text)
    return text


def load_manifest() -> dict[str, Any]:
    if MANIFEST_PATH.exists():
        return json.loads(MANIFEST_PATH.read_text())
    return {"voice": None, "speed": 1.0, "sampleRate": SAMPLE_RATE, "scenes": {}}


def silence(seconds: float) -> np.ndarray:
    return np.zeros(int(round(seconds * SAMPLE_RATE)), dtype=np.float32)


def trim_edges(audio: np.ndarray, words: list[Word], threshold: float = 0.004, keep_sec: float = 0.06) -> tuple[np.ndarray, list[Word]]:
    """Cut leading/trailing near-silence Kokoro adds around a clip, keeping `keep_sec` of air.
    Word timings are shifted to match. Scripted pauses then start where the voice actually stops."""
    loud = np.flatnonzero(np.abs(audio) > threshold)
    if loud.size == 0:
        return audio, words
    keep = int(keep_sec * SAMPLE_RATE)
    start = max(0, int(loud[0]) - keep)
    end = min(len(audio), int(loud[-1]) + keep)
    shift_ms = int(round(start / SAMPLE_RATE * 1000))
    shifted = [Word(w.text, max(0, w.startMs - shift_ms), max(0, w.endMs - shift_ms)) for w in words]
    return audio[start:end], shifted


def synth_beat(pipeline: Any, text: str, voice: str, speed: float) -> tuple[np.ndarray, list[Word]]:
    """Synthesise one beat. Returns audio (float32) and word timings relative to the beat start."""
    chunks: list[np.ndarray] = []
    words: list[Word] = []
    offset = 0.0
    pending_open = ""  # opening quotes/brackets waiting for the next word
    in_quote = False  # straight double quotes are ambiguous; alternate open/close
    for result in pipeline(apply_pronunciations(text), voice=voice, speed=speed):
        audio = result.audio
        arr = np.asarray(audio.numpy() if hasattr(audio, "numpy") else audio, dtype=np.float32)
        for tok in result.tokens or []:
            t = tok.text.strip()
            if not t:
                continue
            if all(not c.isalnum() for c in t):
                # Punctuation-only token. Opening marks attach to the NEXT word; everything else
                # glues to the previous word so captions keep sentence ends ("mastering." not "." alone).
                if t == '"':
                    is_open = not in_quote
                    in_quote = not in_quote
                elif t.startswith('"') and t.endswith('"') and len(t) > 1:
                    is_open = False  # e.g. '?"' closes
                else:
                    is_open = all(c in OPENING_MARKS for c in t)
                if is_open:
                    pending_open += t
                elif words:
                    prev = words[-1]
                    words[-1] = Word(prev.text + t, prev.startMs, prev.endMs)
                continue
            if tok.start_ts is None or tok.end_ts is None:
                continue
            words.append(
                Word(
                    text=pending_open + t,
                    startMs=int(round((offset + tok.start_ts) * 1000)),
                    endMs=int(round((offset + tok.end_ts) * 1000)),
                )
            )
            pending_open = ""
        chunks.append(arr)
        offset += len(arr) / SAMPLE_RATE
    audio = np.concatenate(chunks) if chunks else silence(0.0)
    return trim_edges(audio, words)


def synth_scene(pipeline: Any, beats: list[tuple[str, float]], voice: str, speed: float) -> tuple[np.ndarray, list[Word], list[Beat]]:
    parts: list[np.ndarray] = [silence(EDGE_SILENCE_SEC)]
    words: list[Word] = []
    beat_meta: list[Beat] = []
    cursor = EDGE_SILENCE_SEC
    for i, (text, pause) in enumerate(beats):
        audio, beat_words = synth_beat(pipeline, text, voice, speed)
        start_ms = int(round(cursor * 1000))
        words.extend(Word(w.text, w.startMs + start_ms, w.endMs + start_ms) for w in beat_words)
        cursor += len(audio) / SAMPLE_RATE
        beat_meta.append(Beat(i, text, start_ms, int(round(cursor * 1000)), pause))
        parts.append(audio)
        # Every beat, including the last, is followed by its scripted pause, so the clip length
        # already contains the scene's breathing room and scenes need no extra trailing pad.
        parts.append(silence(pause))
        cursor += pause
    return np.concatenate(parts), words, beat_meta


def normalise_for_diff(s: str) -> list[str]:
    s = s.lower().replace("’", "'")
    s = re.sub(r"[^a-z0-9' ]+", " ", s)
    return s.split()


def check_with_whisper(wav_path: Path, expected: str) -> list[str]:
    """Transcribe and return a list of human-readable mismatches (empty = clean)."""
    from faster_whisper import WhisperModel  # heavy import; only with --check

    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(str(wav_path), beam_size=5)
    heard = " ".join(seg.text.strip() for seg in segments)
    a, b = normalise_for_diff(expected), normalise_for_diff(heard)
    issues: list[str] = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b).get_opcodes():
        if tag == "equal":
            continue
        issues.append(f"{tag}: script '{' '.join(a[i1:i2])}' -> heard '{' '.join(b[j1:j2])}'")
    return issues


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("scene_ids", nargs="*", help="Scene ids to (re)generate; default all")
    parser.add_argument("--voice", default=None, help="Kokoro voice id (default: scenes.json)")
    parser.add_argument("--speed", type=float, default=None, help="Kokoro speed (default: scenes.json or 1.0)")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--check", action="store_true", help="Transcribe output with Whisper and report mismatches")
    args = parser.parse_args()

    script = json.loads(SCENES_PATH.read_text())
    voice: str = args.voice or script["voice"]
    pause_scale: float = float(script.get("pauseScale", 1.0))
    speed: float = args.speed if args.speed is not None else float(script.get("speed", 1.0))
    lang_code = voice[0]  # 'a' American, 'b' British
    manifest = load_manifest()
    if manifest.get("voice") != voice or manifest.get("speed") != speed:
        manifest["scenes"] = {}
    manifest["voice"] = voice
    manifest["speed"] = speed
    manifest["sampleRate"] = SAMPLE_RATE

    wanted = set(args.scene_ids) if args.scene_ids else None
    pipeline: Any = None
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    problems: dict[str, list[str]] = {}

    for scene in script["scenes"]:
        sid: str = scene["id"]
        beats = beats_of(scene, pause_scale)
        if not beats:
            manifest["scenes"].pop(sid, None)
            continue
        if wanted is not None and sid not in wanted:
            continue
        h = text_hash(beats, voice, speed)
        existing = manifest["scenes"].get(sid)
        wav_path = AUDIO_DIR / f"{sid}.wav"
        if existing and existing.get("textHash") == h and wav_path.exists() and not args.force:
            print(f"{sid}: unchanged, skipping")
        else:
            if pipeline is None:
                from kokoro import KPipeline  # slow import; defer until needed

                pipeline = KPipeline(lang_code=lang_code, repo_id="hexgrad/Kokoro-82M")
            audio, words, beat_meta = synth_scene(pipeline, beats, voice, speed)
            sf.write(wav_path, audio, SAMPLE_RATE)
            duration = len(audio) / SAMPLE_RATE
            manifest["scenes"][sid] = asdict(
                SceneAudio(file=f"audio/{sid}.wav", durationSec=round(duration, 3), textHash=h, words=words, beats=beat_meta)
            )
            n_words = sum(len(t.split()) for t, _ in beats)
            spoken = sum(b.endMs - b.startMs for b in beat_meta) / 1000
            print(f"{sid}: {duration:.1f}s ({n_words} words, {n_words / max(spoken, 0.1) * 60:.0f} wpm spoken, {len(beats)} beats)")
        if args.check:
            issues = check_with_whisper(wav_path, " ".join(t for t, _ in beats))
            if issues:
                problems[sid] = issues

    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n")
    total = sum(s["durationSec"] for s in manifest["scenes"].values())
    print(f"narration total: {total:.1f}s ({total / 60:.2f} min) -> {MANIFEST_PATH.relative_to(ROOT)}")
    if args.check:
        if not problems:
            print("whisper check: clean")
        for sid, issues in problems.items():
            print(f"whisper check {sid}:")
            for line in issues:
                print(f"  {line}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
