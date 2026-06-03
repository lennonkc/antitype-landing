import { useRef, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

interface ScatterGatherHeadlineProps {
  text: string;
  /** Skip the reveal, render the full sentence at once. */
  reduced?: boolean;
  /** Fires once the sentence has fully gathered (or immediately when reduced). */
  onComplete?: () => void;
  className?: string;
}

/**
 * "Anti-type" headline reveal: every character starts flung across the
 * viewport — scattered, rotated, blurred, the wrong size — then the whole
 * sentence violently converges into place and snaps into focus. Chaos → order.
 *
 * Characters carry only transforms (cheap); the focus pull is a single blur on
 * the root so we never stack `filter` on 30+ nodes. Static when `reduced`.
 */
export function ScatterGatherHeadline({
  text,
  reduced = false,
  onComplete,
  className = "",
}: ScatterGatherHeadlineProps) {
  const root = useRef<HTMLSpanElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      if (!root.current) return;
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", root.current);

      if (reduced) {
        gsap.set(chars, { clearProps: "all" });
        onComplete?.();
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        onComplete: () => {
          // Drop the focus-pull layer entirely once sharp — leave no lingering
          // filter/compositing layer on the headline.
          gsap.set(root.current, { clearProps: "filter" });
          onComplete?.();
        },
      });

      // The sentence implodes from chaos into its resting layout.
      tl.from(
        chars,
        {
          x: () => gsap.utils.random(-0.42, 0.42) * vw,
          y: () => gsap.utils.random(-0.42, 0.42) * vh,
          rotateZ: () => gsap.utils.random(-160, 160),
          scale: () => gsap.utils.random(0.18, 2),
          autoAlpha: 0,
          duration: 1.05,
          stagger: { each: 0.02, from: "random" },
        },
        0,
      );

      // Whole headline pulls from blurred → razor sharp as it lands. We tween
      // `filter` directly — GSAP's CSSPlugin interpolates blur() natively,
      // whereas an unregistered CSS custom property is not smoothly tweenable
      // (GSAP drops it straight to the end value, so the focus-pull never runs).
      tl.fromTo(
        root.current,
        { filter: "blur(18px)" },
        { filter: "blur(0px)", duration: 1.25, ease: "power2.out" },
        0,
      );

      // A breath of camera push for depth.
      tl.from(
        root.current,
        { scale: 1.06, transformOrigin: "50% 50%", duration: 1.4, ease: "power3.out" },
        0,
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  // Start blurred so there is no sharp first frame before GSAP takes over.
  const rootStyle: CSSProperties = reduced ? {} : { filter: "blur(18px)" };

  return (
    <span
      ref={root}
      aria-label={text}
      className={`inline-flex flex-nowrap whitespace-nowrap gap-x-[0.3em] ${className}`}
      style={rootStyle}
    >
      {words.map((word, w) => (
        <span key={w} aria-hidden className="inline-flex whitespace-nowrap">
          {Array.from(word).map((ch, i) => (
            <span
              key={i}
              data-char
              className="inline-block will-change-transform"
            >
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
