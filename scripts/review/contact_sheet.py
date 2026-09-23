"""Render a composition to a frame sequence and tile it into contact sheets for review.

Usage:
    .venv/bin/python scripts/review/contact_sheet.py [composition=AnswerFirst] [seconds_per_frame=2]

Writes out/review/<comp>/frames/*.png (via `remotion render --sequence --every-nth-frame`) and
out/review/<comp>-sheet-NN.png (6×5 grid, 270 px thumbnails, timestamp burned in).
Remotion's bundled ffmpeg has no `tile` filter, hence Pillow.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
FPS = 30
COLS, ROWS, THUMB = 6, 5, 270


def main() -> int:
    comp = sys.argv[1] if len(sys.argv) > 1 else "AnswerFirst"
    step_sec = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
    every = max(1, int(round(step_sec * FPS)))
    out_dir = ROOT / "out" / "review" / comp
    frames_dir = out_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for old in frames_dir.glob("*.png"):
        old.unlink()
    subprocess.run(
        [
            "npx", "remotion", "render", comp, str(frames_dir), "--sequence", f"--every-nth-frame={every}",
            "--image-format=png", "--concurrency=6", "--log=error",
        ],
        cwd=ROOT,
        check=True,
    )
    frames = sorted(frames_dir.glob("*.png"))
    if not frames:
        print("no frames rendered")
        return 1
    per_sheet = COLS * ROWS
    sheets = 0
    for start in range(0, len(frames), per_sheet):
        batch = frames[start : start + per_sheet]
        sheet = Image.new("RGB", (COLS * THUMB, ROWS * THUMB), (40, 40, 40))
        draw = ImageDraw.Draw(sheet)
        for i, f in enumerate(batch):
            idx = start + i
            t = idx * every / FPS
            im = Image.open(f).convert("RGB").resize((THUMB, THUMB))
            x, y = (i % COLS) * THUMB, (i // COLS) * THUMB
            sheet.paste(im, (x, y))
            label = f"{int(t // 60)}:{t % 60:04.1f}"
            draw.rectangle([x, y, x + 78, y + 22], fill=(0, 0, 0))
            draw.text((x + 4, y + 4), label, fill=(255, 255, 255))
        sheets += 1
        sheet.save(ROOT / "out" / "review" / f"{comp}-sheet-{sheets:02d}.png")
    print(f"{len(frames)} frames -> {sheets} sheet(s) in out/review/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
