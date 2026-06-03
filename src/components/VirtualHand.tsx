interface VirtualHandProps {
  className?: string;
  /** Flip horizontally → fingertip moves to the glyph's TOP-RIGHT corner. */
  mirrored?: boolean;
  /** Small label shown beside the hand (fades with it). */
  caption?: string;
  /** Tailwind classes positioning the caption relative to the hand box. */
  captionClassName?: string;
}

/**
 * A hand-drawn finger pointer (public/pointing.svg) plus a press ripple.
 * Positioning and the press motion are driven by the CinematicAct timeline;
 * this is pure markup. The fingertip sits at the glyph's TOP-LEFT corner (or
 * TOP-RIGHT when `mirrored`), so the parent anchors that corner onto the watch
 * button. Classes `.hand` and `.ripple` are the animation handles.
 *
 * The hand FILLS its parent (`w-full`) and every inner dimension is relative
 * (image = 100%, ripple = % of the box, caption = `cqw`), so the parent can set
 * one width — in % of the watch dial — and the whole glyph scales with the watch
 * across viewports and through the GSAP scale that shrinks the dial in the demo.
 * The root is a size container so `cqw` caption text tracks that same width.
 */
export function VirtualHand({
  className = "",
  mirrored = false,
  caption,
  captionClassName = "",
}: VirtualHandProps) {
  return (
    <div
      className={`pointer-events-none relative block w-full ${className}`}
      style={{ containerType: "inline-size" }}
    >
      {/* ripple emanates from the fingertip (top-left, or top-right mirrored) */}
      <span
        className={`ripple absolute top-[6%] block aspect-square w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5cqw] border-ink/70 opacity-0 ${
          mirrored ? "left-[95%]" : "left-[5%]"
        }`}
        aria-hidden
      />
      <img
        src="/pointing.svg"
        alt=""
        aria-hidden
        className="hand relative block w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]"
        style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
      />
      {caption ? (
        <span
          className={`absolute whitespace-nowrap font-mono text-[7cqw] uppercase tracking-[0.25em] text-ink/55 ${captionClassName}`}
        >
          {caption}
        </span>
      ) : null}
    </div>
  );
}
