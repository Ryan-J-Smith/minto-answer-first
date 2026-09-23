import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell, useNarrationStart } from "../components/SceneShell";
import { enter, sec } from "../components/motion";
import { SectionRail } from "../components/SectionRail";
import { HandPyramid, LanguageCard, PyramidMark, ReachBook, seeded } from "../components/ReachShapes";
import { beatEnd, beatStart, getNarration } from "../narration";
import { colors, easeInOut, fonts } from "../theme";

const ID = "09-reach";

// Latin names only: the render environment has no CJK fonts.
const LANGUAGES = ["Simplified Chinese", "Traditional Chinese", "German", "Japanese", "Korean", "Norwegian", "Portuguese", "Spanish", "Vietnamese"];

// Three firm squares (left) and the industry grid (below).
const FIRM = { size: 110, y: 205, xs: [100, 250, 400] } as const;
const GRID = { cols: 9, rows: 5, cell: 88, gap: 12, x: 94, y: 352 } as const;
const DOT_COUNT = 45; // one per industry cell

type Flight = { fromX: number; fromY: number; toX: number; toY: number; delay: number };

const makeFlights = (): Flight[] => {
  const r = seeded(31);
  const cells = Array.from({ length: GRID.cols * GRID.rows }, (_, i) => i);
  // Shuffle so early dots land across the whole grid, not the first row.
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const a = cells[i] ?? 0;
    cells[i] = cells[j] ?? 0;
    cells[j] = a;
  }
  return Array.from({ length: DOT_COUNT }, (_, i) => {
    const firm = i % 3;
    const cell = cells[i % cells.length] ?? 0;
    const col = cell % GRID.cols;
    const row = Math.floor(cell / GRID.cols);
    const jx = 0; // land exactly on cell centres
    const jy = 0;
    return {
      fromX: (FIRM.xs[firm] ?? 0) + FIRM.size / 2 + (r() - 0.5) * 40,
      fromY: FIRM.y + FIRM.size / 2 + (r() - 0.5) * 40,
      toX: GRID.x + col * (GRID.cell + GRID.gap) + GRID.cell / 2 + jx,
      toY: GRID.y + row * (GRID.cell + GRID.gap) + GRID.cell / 2 + jy,
      delay: i / DOT_COUNT,
    };
  });
};

/** Seat positions around the table: 5 along the top, 5 along the bottom, one at each end. */
const seats = (cx: number, cy: number, w: number, h: number): Array<{ x: number; y: number; head: boolean }> => {
  const out: Array<{ x: number; y: number; head: boolean }> = [];
  for (let i = 0; i < 5; i++) {
    const x = cx - w / 2 + (w / 6) * (i + 1);
    out.push({ x, y: cy - h / 2 - 34, head: false });
    out.push({ x, y: cy + h / 2 + 34, head: false });
  }
  out.push({ x: cx - w / 2 - 36, y: cy, head: true });
  out.push({ x: cx + w / 2 + 36, y: cy, head: false });
  return out;
};

/** Scene 09 — Reach. The book, the firms, the diffusion into industry, and the small room where she still teaches. */
export const Reach: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = useNarrationStart(ID);
  const at = (s: number): number => t0 + sec(s, fps);
  const b = (i: number): number => at(beatStart(ID, i));
  const bEnd = (i: number): number => at(beatEnd(ID, i));
  const flights = useMemo(makeFlights, []);

  const eyebrowIn = enter(frame, 0, sec(0.9, fps));
  /** Frame at `frac` of the way through beat i. */
  const bAt = (i: number, frac: number): number => at(beatStart(ID, i) + (beatEnd(ID, i) - beatStart(ID, i)) * frac);
  /** Frame at which `word` is spoken inside beat i, else `frac` through the beat. */
  const wordOr = (word: string, i: number, frac: number): number => {
    const fallback = beatStart(ID, i) + (beatEnd(ID, i) - beatStart(ID, i)) * frac;
    const hit = getNarration(ID)?.words.find(
      (w) => w.text.toLowerCase().replace(/[^a-z0-9]/g, "") === word && w.startMs / 1000 >= beatStart(ID, i) && w.startMs / 1000 <= beatEnd(ID, i),
    );
    return at(hit ? hit.startMs / 1000 : fallback);
  };

  // Beats (script v6): 0 "it spread wherever consultants went" · 1 book, forty years, nine languages,
  // firms teach it · 2 consultants leave, take the pyramid · 3 the room · 4 simple idea, skill.

  // beat 0: the mark and its rings
  const markIn = enter(frame, b(0) + sec(0.1, fps), sec(1.0, fps));
  const ringsAt = wordOr("spread", 0, 0.25);
  const morph = enter(frame, b(1), sec(0.8, fps)); // 220px mark -> 80px glyph on the cover
  const markX = 430 + (505 - 430) * morph;
  const markY = 380 + (497 - 380) * morph;
  const markSize = 220 + (80 - 220) * morph;
  const markStroke = 3.5 + (2.5 - 3.5) * morph;

  // beat 1: book + languages, then the firms
  const bookIn = enter(frame, b(1) + sec(0.1, fps), sec(0.9, fps));
  const langsAt = wordOr("nine", 1, 0.38);
  const firmsAt = wordOr("firms", 1, 0.62);
  const bookOut = 1 - enter(frame, firmsAt - sec(0.2, fps), sec(0.5, fps));
  const firmsIn = enter(frame, firmsAt, sec(0.5, fps));
  const firmMarksAt = firmsAt + sec(0.5, fps);

  // beat 2: diffusion into industry
  const rowDx = 235; // firms row sits centred over the grid
  const leaveAt = b(2);
  const gridIn = enter(frame, leaveAt, sec(1.0, fps));
  const flightStart = leaveAt + sec(0.4, fps);
  const flightEnd = wordOr("take", 2, 0.8);
  const pyramidsIn = enter(frame, wordOr("pyramid", 2, 0.85), sec(0.8, fps));
  const diffusionOut = 1 - enter(frame, b(3), sec(0.6, fps));

  // beat 3: the room
  const roomIn = enter(frame, b(3) + sec(0.1, fps), sec(0.9, fps));
  const headIn = enter(frame, wordOr("minto", 3, 0.02), sec(0.6, fps));
  const seatsAt = bAt(3, 0.25);

  // beat 4: hand-drawn pyramid
  const wobble = enter(frame, b(4) + sec(0.1, fps), sec(1.3, fps));
  const cleanAt = wordOr("skill", 4, 0.5);
  const clean = enter(frame, cleanAt, sec(1.4, fps));
  const wobbleFade = enter(frame, cleanAt + sec(0.3, fps), sec(1.0, fps));

  const TABLE = { cx: 540, cy: 540, w: 420, h: 190 };
  const roomSeats = seats(TABLE.cx, TABLE.cy, TABLE.w, TABLE.h);

  return (
    <SceneShell sceneId={ID}>
      <AbsoluteFill>
        <SectionRail current={3} enter={eyebrowIn} />

        {/* beat 0: a single pyramid mark */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: markIn * (1 - morph) }}>
          <svg width={1080} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
            {[0, 1, 2].map((i) => {
              const p = enter(frame, ringsAt + sec(i * 0.45, fps), sec(1.6, fps));
              if (p <= 0) return null;
              return (
                <circle
                  key={i}
                  cx={540}
                  cy={490}
                  r={150 + p * (190 + i * 70)}
                  fill="none"
                  stroke={colors.ink}
                  strokeWidth={1.5}
                  opacity={(1 - p) * 0.45}
                />
              );
            })}
          </svg>
        </div>

        {/* beat 1: the book and nine languages */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: bookOut }}>
          {LANGUAGES.map((label, i) => {
            const p = enter(frame, langsAt + sec(i * 0.08, fps), sec(0.6, fps));
            // Fan on an arc around the book: left side, over the top, right side.
            const angle = -Math.PI * 0.95 + (i / (LANGUAGES.length - 1)) * Math.PI * 0.9;
            const rx = 370;
            const ry = 235;
            const x = 540 + Math.cos(angle) * rx - 88;
            const y = 520 + Math.sin(angle) * ry - 29;
            const rot = (angle + Math.PI / 2) * (180 / Math.PI) * 0.35;
            return <LanguageCard key={label} x={x} y={y} rotate={rot} label={label} enter={p} />;
          })}
          <ReachBook x={540 - 130} y={335} w={260} enter={bookIn} />
        </div>
        {/* the one continuous object: beat 0's mark, now the glyph on the cover */}
        <PyramidMark x={markX} y={markY} size={markSize} stroke={markStroke} opacity={markIn * bookOut} />

        {/* beats 2–3: firms, the grid, the flights */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: diffusionOut }}>
          <div style={{ position: "absolute", left: 0, top: 0, translate: `${rowDx}px 0px` }}>
          {FIRM.xs.map((x, i) => {
            const p = enter(frame, firmsAt + sec(i * 0.12, fps), sec(0.6, fps));
            const m = enter(frame, firmMarksAt + sec(i * 0.15, fps), sec(0.6, fps));
            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    position: "absolute",
                    left: x,
                    top: FIRM.y,
                    width: FIRM.size,
                    height: FIRM.size,
                    boxSizing: "border-box",
                    border: `3px solid ${colors.ink}`,
                    borderRadius: 6,
                    backgroundColor: colors.paper,
                    opacity: p * firmsIn,
                    translate: `0px ${(1 - p) * 14}px`,
                  }}
                />
                <div style={{ position: "absolute", left: 0, top: 0, opacity: m, translate: `0px ${(1 - m) * -30}px` }}>
                  <PyramidMark x={x + 20} y={FIRM.y + 20} size={70} stroke={2.5} />
                </div>
              </React.Fragment>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: FIRM.xs[0],
              top: FIRM.y + FIRM.size + 14,
              fontFamily: fonts.body,
              fontSize: 20,
              letterSpacing: "0.16em",
              color: colors.inkSoft,
              opacity: firmsIn,
              whiteSpace: "nowrap",
            }}
          >
            THE FIRMS
          </div>
          </div>

          {/* industry grid */}
          {Array.from({ length: GRID.cols * GRID.rows }, (_, i) => {
            const col = i % GRID.cols;
            const row = Math.floor(i / GRID.cols);
            const p = enter(frame, leaveAt + sec((row * GRID.cols + col) * 0.015, fps), sec(0.5, fps));
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: GRID.x + col * (GRID.cell + GRID.gap),
                  top: GRID.y + row * (GRID.cell + GRID.gap),
                  width: GRID.cell,
                  height: GRID.cell,
                  boxSizing: "border-box",
                  border: `2px solid ${colors.rule}`,
                  borderRadius: 4,
                  opacity: p * gridIn,
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              left: GRID.x,
              top: GRID.y + GRID.rows * (GRID.cell + GRID.gap) - GRID.gap + 14,
              fontFamily: fonts.body,
              fontSize: 20,
              letterSpacing: "0.16em",
              color: colors.inkSoft,
              opacity: gridIn,
            }}
          >
            INDUSTRY
          </div>

          {/* flights */}
          {flights.map((f, i) => {
            const start = flightStart + (flightEnd - flightStart) * f.delay * 0.75;
            const dur = (flightEnd - flightStart) * 0.25;
            const p = interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
            if (p <= 0) return null;
            // Quadratic arc: control point lifted above the straight line.
            const cxp = (f.fromX + f.toX) / 2;
            const cyp = Math.min(f.fromY, f.toY) - 60;
            const x = (1 - p) * (1 - p) * f.fromX + 2 * (1 - p) * p * cxp + p * p * f.toX;
            const y = (1 - p) * (1 - p) * f.fromY + 2 * (1 - p) * p * cyp + p * p * f.toY;
            const landed = p >= 1 ? pyramidsIn : 0;
            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    position: "absolute",
                    left: x - 12,
                    top: y - 12,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: colors.ink,
                    opacity: 1 - landed,
                    scale: `${1 - landed}`,
                  }}
                />
                {landed > 0 ? <PyramidMark x={x - 24} y={y - 24} size={48} stroke={2.5} opacity={landed} color={colors.ink} topColor={colors.accent} /> : null}
              </React.Fragment>
            );
          })}
        </div>

        {/* beats 4–5: the room */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: roomIn }}>
          <div
            style={{
              position: "absolute",
              left: TABLE.cx - TABLE.w / 2,
              top: TABLE.cy - TABLE.h / 2,
              width: TABLE.w,
              height: TABLE.h,
              boxSizing: "border-box",
              border: `3px solid ${colors.ink}`,
              borderRadius: 40,
              backgroundColor: colors.paper,
              translate: `0px ${(1 - roomIn) * 14}px`,
            }}
          />
          {roomSeats.map((s, i) => {
            const p = s.head ? headIn : enter(frame, seatsAt + sec(i * 0.07, fps), sec(0.5, fps));
            const size = s.head ? 26 : 20;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: s.x - size / 2,
                  top: s.y - size / 2,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  backgroundColor: s.head ? colors.accent : colors.ink,
                  opacity: p,
                  scale: `${0.6 + 0.4 * p}`,
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              left: TABLE.cx - 200,
              top: TABLE.cy + TABLE.h / 2 + 70,
              width: 400,
              textAlign: "center",
              fontFamily: fonts.body,
              fontSize: 20,
              letterSpacing: "0.16em",
              color: colors.inkSoft,
              opacity: enter(frame, seatsAt + sec(0.9, fps), sec(0.6, fps)),
            }}
          >
            TWO DAYS · TWELVE SEATS
          </div>
          <HandPyramid x={TABLE.cx - 75} y={TABLE.cy - 70} size={150} wobble={wobble} clean={clean} wobbleFade={wobbleFade} />
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
