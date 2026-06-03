import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$*";

/** from = resting source · play = animate source→target · to = settled target. */
export type ScrambleState = "from" | "play" | "to";

interface ScrambleTextProps {
  from: string;
  to: string;
  state: ScrambleState;
  /** Total transition duration (ms). */
  durationMs?: number;
  reduced?: boolean;
  className?: string;
}

/**
 * Each character independently cycles through random glyphs (a "rolling" hacker
 * reveal) and settles onto the target string, staggered left-to-right. Driven
 * by an explicit 3-state prop so scrolling past leaves it settled on `to`, and
 * only scrolling back above the window reverts it to `from`.
 */
export function ScrambleText({
  from,
  to,
  state,
  durationMs = 1100,
  reduced = false,
  className = "",
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(from);
  const rafRef = useRef<number>();
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const cancel = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    if (reduced) {
      setDisplay(state === "from" ? from : to);
      return;
    }
    if (state === "from") {
      cancel();
      setDisplay(from);
      return;
    }
    if (state === "to") {
      cancel();
      setDisplay(to);
      return;
    }

    // state === "play": animate from → to
    const target = to;
    const len = target.length;
    const settleStart = 0.25; // fraction of duration before the first char settles
    startRef.current = null;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const t = Math.min(1, (now - startRef.current) / durationMs);

      let out = "";
      for (let i = 0; i < len; i++) {
        const charSettle = settleStart + (1 - settleStart) * (i / len);
        if (t >= charSettle || target[i] === " ") {
          out += target[i];
        } else {
          out += GLYPHS[Math.floor((now / 40 + i * 7) % GLYPHS.length)];
        }
      }
      setDisplay(out);

      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(target);
    };

    rafRef.current = requestAnimationFrame(tick);
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, reduced, from, to]);

  return (
    <span className={className} aria-label={state === "from" ? from : to}>
      {display}
    </span>
  );
}
