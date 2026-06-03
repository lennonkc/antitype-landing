import { youtubeId } from "@/config";

interface LiveVideoProps {
  /** `card` = standalone 16:9 framed card (reduced-motion fallback).
   *  `dial` = bare rounded video fitted inside the watch screen — the dial is
   *  already black, so the video's letterbox blends into it. */
  variant: "dial" | "card";
  className?: string;
}

/**
 * The live-demo video surface. Embeds a YouTube iframe when VITE_YOUTUBE_ID is
 * set (see config.ts), else a play-button placeholder. Shape/chrome differ by
 * variant; the embed/placeholder markup is shared.
 */
export function LiveVideo({ variant, className = "" }: LiveVideoProps) {
  const inner = youtubeId ? (
    <iframe
      className="absolute inset-0 h-full w-full"
      src={`https://www.youtube.com/embed/${youtubeId}`}
      title="AntiType live demo"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  ) : (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-paper/60">
      <span className="flex h-[18%] min-h-9 w-auto aspect-square items-center justify-center rounded-full border-2 border-paper/40">
        <span className="ml-[15%] border-y-[0.45em] border-l-[0.75em] border-y-transparent border-l-paper/60" />
      </span>
      <p className="font-mono text-[clamp(8px,1.4vmin,12px)] tracking-widest">
        YOUTUBE DEMO — coming soon
      </p>
    </div>
  );

  if (variant === "card") {
    return (
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-2xl border border-ink/15 bg-ink shadow-[0_40px_100px_-40px_rgba(5,5,5,0.5)] ${className}`}
      >
        {inner}
      </div>
    );
  }

  // dial: bare rounded video; the surrounding watch screen is already black
  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-[6%] bg-ink ${className}`}
    >
      {inner}
    </div>
  );
}
