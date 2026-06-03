import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Stopwatch } from "@/components/Stopwatch";
import { SplitReveal } from "@/components/SplitReveal";
import { ScrambleText, type ScrambleState } from "@/components/ScrambleText";
import { VirtualHand } from "@/components/VirtualHand";
import { AppMockup, type DemoStatus } from "@/components/AppMockup";
import { LiveVideo } from "@/components/LiveVideo";
import { WatchFace } from "@/components/WatchFace";
import { watchText, narration } from "@/config";

/** Shared watch sizing: container vmin → bezel ≈ 62vmin to match the cut-out. */
const WATCH_BOX = "76vmin";

interface CinematicActProps {
  reduced: boolean;
}

export function CinematicAct({ reduced }: CinematicActProps) {
  return reduced ? <CinematicStatic /> : <CinematicScrolled />;
}

/* ------------------------------------------------------------------ */
/* Full cinematic (desktop, motion ok)                                 */
/* ------------------------------------------------------------------ */

function CinematicScrolled() {
  const wrapper = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const leftHandRef = useRef<HTMLDivElement>(null);

  const [scrambleState, setScrambleState] = useState<ScrambleState>("from");
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [typed, setTyped] = useState(0);

  // Dedupe refs: the scrubbed demo onUpdate fires every frame, so we only push
  // a React re-render when the rounded char-count / status actually changes.
  const typedRef = useRef(0);
  const statusRef = useRef<DemoStatus>("idle");

  useGSAP(
    () => {
      // initial states
      gsap.set(".cine-bg", { backgroundColor: "#000000" });
      gsap.set(".cine-watch", { scale: 1, yPercent: 0 });
      // both brand lines start off the LEFT edge — they share one left→right
      // current (float in to centre, then continue out to the right)
      gsap.set(".cine-line1", { xPercent: -170, opacity: 0 });
      gsap.set(".cine-line2", { xPercent: -170, opacity: 0 });
      gsap.set(".cine-app", { autoAlpha: 0, y: 70 });
      // transform-origin at the fingertip so the press scale plants the tip on
      // the button instead of bobbing the whole hand. Right hand → glyph
      // top-left; left hand is mirrored so its tip sits at the top-right.
      if (handRef.current)
        gsap.set(handRef.current, { opacity: 0, transformOrigin: "5% 6%" });
      if (leftHandRef.current)
        gsap.set(leftHandRef.current, { opacity: 0, transformOrigin: "95% 6%" });
      gsap.set(".cine-video", { opacity: 0, pointerEvents: "none" });
      gsap.set(".cine-face", { opacity: 0 });
      gsap.set(".cine-caption", { opacity: 0 });

      // Spatial timeline (scrubbed). Total ≈ 7 units; positions are absolute
      // so they keep a stable mapping to scroll progress.
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: wrapper.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: stage.current,
        },
      });

      // reveal: cardboard slides apart, background washes to white, watch grows
      tl.to(".split-left", { xPercent: -110, duration: 1.2 }, 0);
      tl.to(".split-right", { xPercent: 110, duration: 1.2 }, 0);
      tl.to(".cine-bg", { backgroundColor: "#f7f7f5", ease: "none", duration: 1.2 }, 0.4);
      tl.to(".cine-watch", { scale: 1.2, ease: "power2.out", duration: 1.4 }, 0.4);
      // brand lines float in from the left edge and decelerate onto the dial
      // (power2.out → glides to a near-stop at centre; line1 leads, line2 trails
      // so the pair reads as one flowing current rather than a lockstep slide)
      tl.to(".cine-line1", { xPercent: 0, opacity: 1, ease: "power2.out", duration: 1.0 }, 1.4);
      tl.to(".cine-line2", { xPercent: 0, opacity: 1, ease: "power2.out", duration: 1.0 }, 1.6);
      // (scramble plays here — driven by its own ScrollTrigger below)
      // brand text leaves FIRST: it keeps the same left→right current and floats
      // off the right edge (power2.in → eases out of the centre dwell, then
      // accelerates away), fully gone by ~3.9 — *before* the watch starts to
      // shrink at 4.0, so the dial clears the text before it collapses upward.
      tl.to(".cine-line1", { xPercent: 170, opacity: 0, ease: "power2.in", duration: 0.6 }, 3.2);
      tl.to(".cine-line2", { xPercent: 170, opacity: 0, ease: "power2.in", duration: 0.6 }, 3.3);
      // watch shrinks up, app surface rises in
      tl.to(".cine-watch", { scale: 0.34, yPercent: -35, duration: 1 }, 4.0);
      tl.to(".cine-app", { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.8 }, 4.3);
      // watch-face ripple lives ONLY across the AntiType://compose window: it
      // blooms in with the app card and fades out as the card recedes (7.0,
      // before the watch re-grows / the video blooms). Both its opacity here and
      // its colour (driven by `status` below) are pure functions of scroll.
      tl.to(".cine-face", { opacity: 1, duration: 0.6 }, 4.3);
      tl.to(".cine-face", { opacity: 0, duration: 0.6 }, 7.0);

      // ── scroll-driven demo (SINGLE SOURCE OF TRUTH) ──────────────────────
      // The typed narration, the status pill, and BOTH hands are now pure
      // functions of scroll position, owned by this one scrubbed timeline — no
      // audio, no real-time typewriter, no onEnter/onComplete event machine.
      // At any scroll height the demo state is exactly what the playhead says,
      // so it can't desync, ghost on refresh, or flash on scroll-up: the hands
      // exist ONLY inside their tween windows (≈ units 4.8–7.1) and are 0 elsewhere.
      const TYPE_START = 5.1;
      const TYPE_END = 6.3;
      const clamp01 = gsap.utils.clamp(0, 1);
      // proxy tween → spans the demo (5.0 → 7.8: card fully present, then receding).
      // onUpdate derives typed-count + status from the absolute playhead unit, so
      // scrubbing back un-types the text and reverts the status the same way.
      const demo = { p: 0 };
      tl.to(
        demo,
        {
          p: 1,
          duration: 2.8,
          ease: "none",
          onUpdate: () => {
            const t = 5.0 + demo.p * 2.8; // absolute timeline unit
            const n = Math.round(
              clamp01((t - TYPE_START) / (TYPE_END - TYPE_START)) * narration.length,
            );
            if (n !== typedRef.current) {
              typedRef.current = n;
              setTyped(n);
            }
            const s: DemoStatus =
              t < TYPE_START
                ? "idle"
                : t < TYPE_END
                  ? "recording"
                  : t < 6.8
                    ? "transcribing"
                    : "done";
            if (s !== statusRef.current) {
              statusRef.current = s;
              setStatus(s);
            }
          },
        },
        5.0,
      );

      // RIGHT hand — long-press the blue button, hold through the dictation,
      // then lift off. Opacity/scale/ripple are all scrubbed, so the hand is
      // only ever on screen while the playhead sits in 4.8–6.6.
      if (handRef.current) {
        const ripple = handRef.current.querySelector<HTMLElement>(".ripple");
        tl.fromTo(
          handRef.current,
          { opacity: 0, scale: 1.1, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" },
          4.8,
        );
        tl.to(handRef.current, { scale: 0.93, duration: 0.2, ease: "power2.in" }, 5.1);
        if (ripple)
          tl.fromTo(
            ripple,
            { scale: 0.4, opacity: 0.8 },
            { scale: 2.2, opacity: 0, duration: 0.7, ease: "power2.out" },
            5.1,
          );
        // held pressed (scale 0.93) while the text types 5.3 → 6.3, then lift + fade
        tl.to(handRef.current, { opacity: 0, scale: 1, y: -12, duration: 0.3, ease: "power2.in" }, 6.3);
      }

      // LEFT hand — quick SHORT-press the yellow button (→ inserted at cursor).
      // A tight press→lift (6.35 → 7.1) reads as a tap, mirroring "short press".
      if (leftHandRef.current) {
        const ripple = leftHandRef.current.querySelector<HTMLElement>(".ripple");
        tl.fromTo(
          leftHandRef.current,
          { opacity: 0, scale: 1.1, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power2.out" },
          6.35,
        );
        tl.to(leftHandRef.current, { scale: 0.93, duration: 0.2, ease: "power2.in" }, 6.6);
        if (ripple)
          tl.fromTo(
            ripple,
            { scale: 0.4, opacity: 0.8 },
            { scale: 2.2, opacity: 0, duration: 0.7, ease: "power2.out" },
            6.6,
          );
        tl.to(leftHandRef.current, { opacity: 0, scale: 1, y: -12, duration: 0.25, ease: "power2.in" }, 6.85);
      }

      // ── regrow: the demo recedes, the watch swells back to full size (matches
      //    the scene-2 peak, scale 1.2), recentred over the now-empty stage ──
      tl.to(".cine-app", { autoAlpha: 0, y: 60, duration: 0.8 }, 7.0);
      tl.to(".cine-watch", { scale: 1.2, yPercent: 0, duration: 1.4 }, 7.0);
      // live video blooms into the (black) dial; caption fades up; clicks enabled
      tl.to(".cine-video", { opacity: 1, duration: 0.7 }, 8.4);
      // tl.set captures the prior pointerEvents as its from-value, so scrub-back
      // before 8.4 restores "none" (and back before 11.3 restores "auto") cleanly.
      tl.set(".cine-video", { pointerEvents: "auto" }, 8.4);
      tl.to(".cine-caption", { opacity: 1, duration: 0.7 }, 8.4);
      // dwell — pinned; the user can click play here
      tl.to({}, { duration: 2.2 }, 9.1);
      // ── close: caption out, watch nests 1.2→1.0 into the iris, black curtains
      //    slide back in (reverse of the opening), background washes back to black ──
      tl.to(".cine-caption", { opacity: 0, duration: 0.5 }, 11.3);
      tl.set(".cine-video", { pointerEvents: "none" }, 11.3);
      tl.to(".cine-watch", { scale: 1.0, duration: 0.6 }, 11.3);
      tl.to(".split-left", { xPercent: 0, duration: 1.2 }, 11.5);
      tl.to(".split-right", { xPercent: 0, duration: 1.2 }, 11.5);
      tl.to(".cine-bg", { backgroundColor: "#000000", ease: "none", duration: 1.2 }, 11.5);
      // watch (with its video) shrinks away inside the iris → all-black stage.
      // This lands at the timeline END so the iris is still closing at the very
      // moment the pin releases — no "watch gone but still pinned" black gap.
      // The ContactSection is pulled up (negative margin) to overlap this tail,
      // so "Let's talk." is already rising out of the same black void as the pin
      // hands off. (Scrub lag keeps the watch faintly visible right up to the
      // release, so the watch and the rising card cross-fade with no dead frame.)
      tl.to(".cine-watch", { scale: 0, autoAlpha: 0, duration: 1.0 }, 12.7);
      tl.to(".cine-video", { opacity: 0, duration: 1.0 }, 12.7);

      // Scramble window — decoupled so retiming can't desync it. Recomputed for
      // the 1150vh wrapper / ~13.7-unit timeline: brand-text settled (~unit 2.6)
      // → just before it exits (~unit 3.2) maps to ≈16%–20% of wrapper scroll.
      ScrollTrigger.create({
        trigger: wrapper.current,
        start: "16% top",
        end: "20% top",
        onEnter: () => setScrambleState("play"),
        onLeave: () => setScrambleState("to"),
        onEnterBack: () => setScrambleState("play"),
        onLeaveBack: () => setScrambleState("from"),
      });
    },
    { scope: wrapper, dependencies: [] },
  );

  const typing = typed < narration.length;

  return (
    <div ref={wrapper} className="relative h-[1150vh] w-full">
      <div ref={stage} className="relative h-screen w-full overflow-hidden">
        {/* background wash */}
        <div className="cine-bg absolute inset-0" />

        {/* shared watch — centred via flex so GSAP only drives scale/translate
            (a GSAP transform would otherwise clobber Tailwind's -translate-1/2) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="cine-watch will-change-transform relative"
            style={{ width: WATCH_BOX, height: WATCH_BOX }}
          >
            <Stopwatch className="h-full w-full" />
            {/* AntiType ripple on the dial — sits over the (black) screen, below
                the video (z-10) and hands (z-20). Inside .cine-watch so it scales
                with the dial; opacity is scroll-driven (only on during compose). */}
            <div className="cine-face pointer-events-none absolute inset-0 opacity-0">
              <WatchFace status={status} />
            </div>
            {/* live video fitted into the dial screen — lives INSIDE .cine-watch
                so it scales with the watch (blooms at full size, shrinks away on
                close). Only opacity/pointerEvents are GSAP-driven; the centring
                translate stays untouched. 65% of the box ≈ the 16:9 rect inscribed
                in the dial's screen circle. */}
            <div
              className="cine-video absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0"
              style={{ width: "65%" }}
            >
              <LiveVideo variant="dial" className="w-full" />
            </div>

            {/* Hands live INSIDE .cine-watch, so they inherit the dial's 76vmin
                responsive size AND the GSAP scale/translate that shrinks it in
                the demo — the fingertips stay locked to the buttons at every
                viewport. `width`/`left`/`top` are all % of the 400×400 face. */}

            {/* RIGHT hand long-presses the top-right BLUE button (→ LISTENING).
                Glyph top-left fingertip lands on the blue button (≈80.6%,22.4%);
                caption sits at its upper-right. */}
            <div
              ref={handRef}
              className="cine-hand absolute z-20 will-change-transform"
              style={{ left: "80.6%", top: "18.9%", width: "60%" }}
            >
              <VirtualHand
                caption="long press to speak"
                captionClassName="bottom-full right-0 mb-[6%]"
              />
            </div>

            {/* LEFT hand short-presses the top-left YELLOW button (→ INSERTED).
                Mirror of the right hand; the flipped fingertip (top-right) lands
                on the yellow button (≈18.8%,21.9%); caption sits above it. */}
            <div
              ref={leftHandRef}
              className="cine-hand-left absolute z-20 will-change-transform"
              style={{ left: "-41.2%", top: "18.4%", width: "60%" }}
            >
              <VirtualHand
                mirrored
                caption="short click to insert"
                captionClassName="bottom-full left-1/2 -translate-x-1/2 mb-[6%]"
              />
            </div>
          </div>
        </div>

        {/* brand text over the dial */}
        <div className="cine-textwrap pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-[1.5vmin] font-display font-bold tracking-tightest text-paper">
          <div className="cine-line1 text-[6.5vmin] leading-none will-change-transform">
            <ScrambleText
              from={watchText.line1From}
              to={watchText.line1To}
              state={scrambleState}
            />
          </div>
          <div className="cine-line2 text-[6.5vmin] leading-none will-change-transform">
            <ScrambleText
              from={watchText.line2From}
              to={watchText.line2To}
              state={scrambleState}
            />
          </div>
        </div>

        {/* cardboard split panels (slide away to reveal the watch) */}
        <SplitReveal />

        {/* app surface for the demo (centred via flex; GSAP drives y/opacity).
            The narration is revealed char-by-char by SCROLL (the demo proxy tween
            above drives `typed`), so it has no real-time timer of its own. */}
        <div className="absolute inset-x-0 top-[54%] z-30 flex justify-center px-4">
          <div className="cine-app will-change-transform">
            <AppMockup status={status}>
              {narration.slice(0, typed)}
              <span
                aria-hidden
                className={`inline-block -mb-[0.05em] bg-current align-baseline ${
                  typing ? "" : "animate-cursor-blink"
                }`}
                style={{ width: "0.5ch", marginLeft: "0.1ch" }}
              >
                &nbsp;
              </span>
            </AppMockup>
          </div>
        </div>

        {/* live-demo caption — fades in with the in-dial video, out on close.
            bottom-[2%] keeps it just below the watch ring (which reaches ~860px
            in a 900px stage at scale 1.2); 14% was inside the bezel → invisible) */}
        <div className="cine-caption pointer-events-none absolute inset-x-0 bottom-[2%] z-30 flex justify-center opacity-0">
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-ink/50">
            ● Live demo
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Static fallback (touch / reduced-motion / narrow)                   */
/* ------------------------------------------------------------------ */

function CinematicStatic() {
  return (
    <>
      <section className="flex min-h-screen w-full flex-col items-center justify-center gap-[2vmin] bg-paper px-6 py-20">
        <div style={{ width: "min(72vmin,80vw)" }}>
          <Stopwatch className="h-full w-full" />
        </div>
        <div className="text-center font-display font-bold tracking-tightest text-ink">
          <div className="text-4xl sm:text-5xl">{watchText.line1To}</div>
          <div className="text-4xl sm:text-5xl">{watchText.line2To}</div>
        </div>
      </section>

      <section className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-paper px-6 py-20">
        <div className="relative" style={{ width: "min(36vmin,48vw)" }}>
          <Stopwatch className="h-full w-full" />
          {/* frozen ripple still (reduced-motion: no animation) */}
          <div className="pointer-events-none absolute inset-0">
            <WatchFace status="done" reduced />
          </div>
        </div>
        <AppMockup status="done">
          <span className="font-mono">{narration}</span>
        </AppMockup>
      </section>

      <section className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-paper px-6 py-20">
        <div className="flex w-full max-w-3xl items-end justify-between">
          <h2 className="font-display text-3xl font-bold tracking-tightest text-ink sm:text-4xl">
            Live demo
          </h2>
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-ink/50">
            ● rec
          </span>
        </div>
        <div className="w-full max-w-3xl">
          <LiveVideo variant="card" />
        </div>
      </section>
    </>
  );
}
