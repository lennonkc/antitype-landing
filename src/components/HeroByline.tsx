import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

interface HeroBylineProps {
  /** The byline / signature text, e.g. "— From AntiType". */
  text: string;
  reduced?: boolean;
  className?: string;
}

/**
 * The byline signs the thesis like a hand. A drawn lead-in rule (a real CSS
 * line, so its length is ours to set — the font's em dash is not) runs into an
 * upright handwriting face (kept near-vertical to sit calmly under the geometric
 * headline), and the whole mark inks itself in left-to-right via a single
 * clip-path wipe, the way a pen lays down a signature, then rests.
 * Monochrome, no shudder. The phrase stays one connected mark (never split per
 * glyph, which would break the cursive joins). Static when `reduced`.
 */
export function HeroByline({
  text,
  reduced = false,
  className = "",
}: HeroBylineProps) {
  const root = useRef<HTMLSpanElement>(null);
  // The drawn rule replaces any leading dash in the copy.
  const body = text.replace(/^\s*[—–-]+\s*/, "");

  useGSAP(
    () => {
      if (reduced || !root.current) return;
      // Reveal as if drawn by a pen: unwipe from the left edge to the right.
      // Top/bottom are padded out so descenders & flourishes never clip.
      gsap.set(root.current, { clipPath: "inset(-25% 0% -25% 0%)" });
      gsap.from(root.current, {
        clipPath: "inset(-25% 100% -25% 0%)",
        opacity: 0,
        duration: 1.5,
        ease: "power1.inOut",
        onComplete: () => gsap.set(root.current, { clearProps: "clipPath" }),
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <span
      ref={root}
      aria-label={text}
      className={`inline-flex items-center gap-3 font-signature font-medium ${className}`}
    >
      <span aria-hidden className="h-px w-12 shrink-0 bg-paper/70" />
      <span>{body}</span>
    </span>
  );
}
