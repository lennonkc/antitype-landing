import { useEffect, useState } from "react";

/**
 * Decide whether to run the full cinematic (scrub + pin) experience or the
 * graceful static fallback. We fall back when the user prefers reduced motion,
 * is on a coarse (touch) pointer, or on a narrow viewport — scroll-jacking is a
 * poor experience there.
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return true;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  return prefersReduced || coarsePointer || narrow;
}

/** React hook form, recomputed on resize. SSR-safe (defaults to reduced). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => shouldReduceMotion());

  useEffect(() => {
    const update = () => setReduced(shouldReduceMotion());
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqPointer = window.matchMedia("(pointer: coarse)");
    mqReduced.addEventListener("change", update);
    mqPointer.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mqReduced.removeEventListener("change", update);
      mqPointer.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return reduced;
}
