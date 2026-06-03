import { useEffect, useId, useRef } from "react";
import type { DemoStatus } from "./AppMockup";

/**
 * The AntiType watch-face ripple, recreated for the web. A faithful port of the
 * firmware radial spectrum (firmware/main/apps/app_antitype/face_view.cpp): 20
 * triangular bars radiate from the dial centre (+ a vertical mirror → a full
 * symmetric ring), tinted by a 3-stop radial gradient, with a breathing centre
 * disc. There's no real audio, so the bars are driven by the firmware's own
 * SYNTHESISED waveform (`synthesizeBands`) — a gentle rolling sine that never
 * goes silent — plus the same shuffle/blend motion.
 *
 * Rendered as an inline SVG with a 400×400 viewBox matching {@link Stopwatch},
 * so dropped into `.cine-watch` it scales 1:1 with the dial at every viewport
 * (the responsive requirement) — no Canvas DPR/resize handling needed.
 *
 * The continuous bar motion runs on its own rAF (like ScrambleText / the video
 * iframe); the layer's *visibility* is owned by the scroll timeline in
 * CinematicAct, so it stays a pure function of scroll position.
 */
interface WatchFaceProps {
  /** Tints the gradient; mapped from the demo's narrative status. */
  status: DemoStatus;
  /** Render a single frozen frame (reduced-motion / static fallback). */
  reduced?: boolean;
  className?: string;
}

/* Firmware FaceView::themeOf palettes [inner, mid, outer], mapped from the
 * page's DemoStatus to the matching firmware FaceState colour. */
const PALETTE: Record<DemoStatus, readonly [string, string, string]> = {
  idle: ["#10B981", "#34D399", "#6EE7B7"], // FaceState::idle — teal
  recording: ["#9333EA", "#A855F7", "#C084FC"], // FaceState::listening — purple
  transcribing: ["#1D4ED8", "#3B82F6", "#93C5FD"], // FaceState::editing — blue
  done: ["#10B981", "#34D399", "#6EE7B7"], // FaceState::done — teal/green
};

/* Centre glyph + word per state — mirrors firmware themeOf's {glyph, word}
 * (AUDIO/"IDLE", AUDIO/"SPEAK", EDIT/"EDIT", OK/"DONE"). */
type Glyph = "audio" | "edit" | "ok";
const FACE_META: Record<DemoStatus, { word: string; glyph: Glyph }> = {
  idle: { word: "IDLE", glyph: "audio" },
  recording: { word: "SPEAK", glyph: "audio" },
  transcribing: { word: "EDIT", glyph: "edit" },
  done: { word: "DONE", glyph: "ok" },
};

/* Centre icon, drawn crisp on top of the disc (24×24, Feather-style).
 * transform: centre a 24px icon (×0.9 → 21.6) on the dial centre 200,200, nudged
 * up into the disc's upper half so the word sits below it. */
function GlyphIcon({ glyph, color }: { glyph: Glyph; color: string }) {
  return (
    <g
      transform="translate(189.2 178.2) scale(0.9)"
      fill="none"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyph === "audio" && (
        <>
          <path d="M9 17.5V4.5L19 2.5V15.5" />
          <circle cx="6.4" cy="17.5" r="2.7" fill={color} stroke="none" />
          <circle cx="16.4" cy="15.5" r="2.7" fill={color} stroke="none" />
        </>
      )}
      {glyph === "edit" && <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />}
      {glyph === "ok" && <path d="M20 6L9 17l-5-5" />}
    </g>
  );
}

/* Geometry in the shared 400×400 viewBox (Stopwatch dial: centre 200,200,
 * screen r=150). Firmware values (rest 82 / max 156 / disc⌀150 in a 466 screen)
 * scaled proportionally onto the 150-radius web dial. */
const CX = 200;
const CY = 200;
const BAND_COUNT = 20; // firmware FaceView::band_count
const DEG_STEP = 180 / BAND_COUNT; // 9° per bar (firmware _deg_step)
const GAP_DEG = 1; // firmware deg_space (slim gap between bars)
const R_REST = 52; // silence tip radius (firmware 82, scaled)
const R_MAX = 132; // full-amplitude tip radius (firmware 156, scaled)
const DISC_R = 46; // centre disc base radius (firmware 150⌀ → 75r, scaled)
const LOW_BANDS = 5; // # of lowest bands the disc "breath" tracks (firmware bass)
const RAD = Math.PI / 180;

/* Per-bar fixed angles. Firmware: deg = i*9 + 90, outer edge [deg+gap, deg+9-gap];
 * the inner vertex sits at the centre (pie-slice triangle), and the disc masks
 * the convergence. y-down SVG matches LVGL's trig, so sweeping 90°→270° + the
 * vertical mirror below fills a full left-right-symmetric ring. */
const BARS = Array.from({ length: BAND_COUNT }, (_, i) => {
  const deg = 90 + i * DEG_STEP;
  return { a1: (deg + GAP_DEG) * RAD, a2: (deg + DEG_STEP - GAP_DEG) * RAD };
});

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* Per-bar oscillator constants (deterministic pseudo-random, fixed per bar).
 * Each bar bounces on its OWN frequency/phase with its OWN height weight, so the
 * ring reads as an organic spectrum with clear bar-to-bar variation rather than
 * a uniform rolling "flower". (The firmware drove all 20 bars off one shared
 * sine + a position shuffle; on the web that read as a tight, mechanical gear,
 * so we give each bar independent motion instead.) */
const seed = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const F1 = BARS.map((_, i) => 1.1 + seed(i) * 1.6); // slow bounce freq
const P1 = BARS.map((_, i) => seed(i + 17) * Math.PI * 2);
const F2 = BARS.map((_, i) => 2.3 + seed(i + 41) * 2.2); // faster overtone
const P2 = BARS.map((_, i) => seed(i + 73) * Math.PI * 2);
const W = BARS.map((_, i) => 0.45 + seed(i + 97) * 0.55); // per-bar height weight → variation

/** Normalised per-bar level in [0,1] at a given phase. */
const osc = (i: number, phase: number) =>
  0.5 + 0.5 * (0.65 * Math.sin(F1[i] * phase + P1[i]) + 0.35 * Math.sin(F2[i] * phase + P2[i]));

/* Motion params per "energy": only LISTENING (recording) is lively & wide; every
 * other state is calm — small amplitude, slow, barely moving. */
const ENERGETIC = { base: 0.1, energy: 0.85, speed: 2.0 };
const CALM = { base: 0.12, energy: 0.1, speed: 0.7 };

/** Pie-slice triangle from the dial centre to the bar's outer arc edge. */
const wedge = (a1: number, a2: number, r: number) =>
  `M${CX} ${CY}L${(CX + r * Math.cos(a1)).toFixed(1)} ${(
    CY +
    r * Math.sin(a1)
  ).toFixed(1)}L${(CX + r * Math.cos(a2)).toFixed(1)} ${(
    CY +
    r * Math.sin(a2)
  ).toFixed(1)}Z`;

/* Settled calm frame (phase 0) for first paint / the reduced-motion still. */
const INITIAL_DISPLAY = BARS.map((_, i) => CALM.base + CALM.energy * W[i] * osc(i, 0));
const INITIAL_D = BARS.map((b, i) => wedge(b.a1, b.a2, R_REST + (R_MAX - R_REST) * clamp01(INITIAL_DISPLAY[i])));

export function WatchFace({ status, reduced = false, className = "" }: WatchFaceProps) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const discRef = useRef<SVGCircleElement | null>(null);
  const [c1, c2, c3] = PALETTE[status];
  const meta = FACE_META[status];

  // Read live in the rAF loop so energy follows the scroll-driven status without
  // restarting the animation (only LISTENING is energetic).
  const statusRef = useRef(status);
  statusRef.current = status;

  // Unique gradient/filter/clip ids so multiple instances don't collide. Strip
  // useId's colons — they're illegal in CSS selectors / url(#…) refs; the random
  // body (e.g. "r3") keeps it unique.
  const uid = useId().replace(/:/g, "");
  const gradId = `face-grad-${uid}`;
  const glowId = `face-glow-${uid}`;
  const clipId = `face-clip-${uid}`;
  const barsId = `face-bars-${uid}`;

  useEffect(() => {
    if (reduced) return;
    const display = INITIAL_DISPLAY.slice();
    let phase = 0;
    let discScale = 1;
    let last = performance.now();
    let raf = 0;

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000); // clamp tab-switch gaps
      last = now;

      const e = statusRef.current === "recording" ? ENERGETIC : CALM;
      phase += dt * e.speed; // accumulated phase → speed changes stay continuous

      for (let i = 0; i < BAND_COUNT; i++) {
        const tgt = e.base + e.energy * W[i] * osc(i, phase);
        // attack faster than release → responsive rise, soft settle when listening ends
        display[i] += (tgt - display[i]) * (tgt > display[i] ? 0.55 : 0.3);
        const r = R_REST + (R_MAX - R_REST) * clamp01(display[i]);
        pathRefs.current[i]?.setAttribute("d", wedge(BARS[i].a1, BARS[i].a2, r));
      }

      // centre disc breathes with the lowest bands (firmware updateCenterDisc)
      let low = 0;
      for (let i = 0; i < LOW_BANDS; i++) low += display[i];
      low /= LOW_BANDS;
      const pulse = Math.min(0.16, Math.max(0, low * 0.18));
      discScale += (1 + pulse - discScale) * 0.4;
      discRef.current?.setAttribute("r", (DISC_R * discScale).toFixed(2));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <svg
      viewBox="0 0 400 400"
      width="100%"
      height="100%"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradId} gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r={R_MAX}>
          <stop offset="0%" stopColor={c1} />
          <stop offset="50%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </radialGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={clipId}>
          <circle cx={CX} cy={CY} r="150" />
        </clipPath>
      </defs>

      {/* clip keeps the glow inside the dial screen */}
      <g clipPath={`url(#${clipId})`}>
        <g filter={`url(#${glowId})`}>
          {/* one set of bars; the <use> mirrors them about the vertical axis */}
          <g id={barsId} fill={`url(#${gradId})`}>
            {BARS.map((_, i) => (
              <path
                key={i}
                ref={(el) => {
                  pathRefs.current[i] = el;
                }}
                d={INITIAL_D[i]}
              />
            ))}
          </g>
          <use href={`#${barsId}`} transform="matrix(-1 0 0 1 400 0)" />

          {/* breathing centre disc (accent at ~30%, masks the bar convergence) */}
          <circle
            ref={discRef}
            cx={CX}
            cy={CY}
            r={DISC_R}
            fill={c3}
            fillOpacity="0.28"
            stroke={c3}
            strokeOpacity="0.6"
            strokeWidth="1.5"
          />
        </g>

        {/* centre glyph + word — crisp (outside the glow), per-state (firmware
            themeOf). Dark halo (paintOrder=stroke) keeps it legible over bars. */}
        <GlyphIcon glyph={meta.glyph} color={c3} />
        <text
          x={CX}
          y="216"
          textAnchor="middle"
          fill={c3}
          stroke="rgba(0,0,0,0.55)"
          strokeWidth="2.6"
          paintOrder="stroke"
          strokeLinejoin="round"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "1.5px",
          }}
        >
          {meta.word}
        </text>
      </g>
    </svg>
  );
}
