import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * Wire Lenis smooth scrolling to GSAP's ScrollTrigger so scrubbed timelines
 * stay perfectly in sync. Disabled entirely when `enabled` is false (touch /
 * reduced-motion / narrow), in which case the page uses native scrolling.
 */
export function useLenis(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("lenis");
      return;
    }

    document.documentElement.classList.add("lenis");
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onRaf = (time: number) => {
      // GSAP ticker uses seconds; Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onRaf);
      lenis.destroy();
      document.documentElement.classList.remove("lenis");
    };
  }, [enabled]);
}
