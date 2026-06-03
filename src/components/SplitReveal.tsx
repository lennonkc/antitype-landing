import type { CSSProperties } from "react";

/** Radius of the circular cut-out, in vmin. Matches the watch bezel size. */
const HOLE_R = "31vmin";

const basePanel: CSSProperties = {
  position: "absolute",
  top: 0,
  height: "100%",
  width: "50.2%", // slight overlap at the seam so no hairline shows
  background: "#000000",
  willChange: "transform",
};

/**
 * Two black "cardboard" panels that together cover the stage, with a circular
 * hole punched in the centre (left + right semicircles) that frames the watch
 * behind them. The parent timeline slides `.split-left` / `.split-right` apart.
 */
export function SplitReveal() {
  const leftMask = `radial-gradient(circle ${HOLE_R} at 100% 50%, transparent calc(${HOLE_R} - 0.5px), #000 ${HOLE_R})`;
  const rightMask = `radial-gradient(circle ${HOLE_R} at 0% 50%, transparent calc(${HOLE_R} - 0.5px), #000 ${HOLE_R})`;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <div
        className="split-left"
        style={{
          ...basePanel,
          left: 0,
          maskImage: leftMask,
          WebkitMaskImage: leftMask,
        }}
      />
      <div
        className="split-right"
        style={{
          ...basePanel,
          right: 0,
          maskImage: rightMask,
          WebkitMaskImage: rightMask,
        }}
      />
    </div>
  );
}
