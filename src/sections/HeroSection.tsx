import { useState } from "react";
import { ScatterGatherHeadline } from "@/components/ScatterGatherHeadline";
import { HeroByline } from "@/components/HeroByline";
import { hero } from "@/config";

interface HeroSectionProps {
  reduced: boolean;
}

/** Scene 1 — pure-black hero. The thesis scatters in from chaos onto a single
 *  line, then the byline inks itself in as a signature in its lower-right. */
export function HeroSection({ reduced }: HeroSectionProps) {
  const [headlineDone, setHeadlineDone] = useState(false);

  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-ink px-6">
      <div className="relative z-10 inline-flex flex-col items-end">
        {/* Sized in vw so the whole sentence always stays on one line. */}
        <h1 className="whitespace-nowrap font-display text-[clamp(1rem,3.9vw,4.5rem)] font-bold leading-[1.05] tracking-tightest text-paper">
          <ScatterGatherHeadline
            text={hero.title}
            reduced={reduced}
            onComplete={() => setHeadlineDone(true)}
          />
        </h1>

        {/* Handwritten signature tucked into the headline's lower-right corner. */}
        <div className="mt-2 min-h-8 self-end pr-[0.15em] text-right">
          {(headlineDone || reduced) && (
            <HeroByline
              text={hero.subtitle}
              reduced={reduced}
              className="text-[1.125rem] text-paper/90 sm:text-[1.40625rem]"
            />
          )}
        </div>
      </div>

      <div
        className={`absolute bottom-10 left-1/2 z-10 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.4em] text-paper/40 transition-opacity duration-1000 ${
          headlineDone || reduced ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="inline-block animate-bounce">scroll ↓</span>
      </div>
    </section>
  );
}
