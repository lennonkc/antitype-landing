import { useReducedMotion } from "@/lib/motionPrefs";
import { useLenis } from "@/lib/useLenis";
import { HeroSection } from "@/sections/HeroSection";
import { CinematicAct } from "@/sections/CinematicAct";
import { ContactSection } from "@/sections/ContactSection";

export default function App() {
  const reduced = useReducedMotion();
  useLenis(!reduced);

  return (
    <main className="w-full">
      <HeroSection reduced={reduced} />
      <CinematicAct reduced={reduced} />
      {/* Pull the contact card up so it rises out of the watch's black collapse
          right as the cinematic ends — no dead black screen between them. Both
          are bg-ink, so the overlap is seamless. The static fallback (reduced)
          has no pinned tail to overlap, so it flows normally. */}
      <div className={reduced ? undefined : "relative z-10 -mt-[65vh]"}>
        <ContactSection reduced={reduced} />
      </div>
    </main>
  );
}
