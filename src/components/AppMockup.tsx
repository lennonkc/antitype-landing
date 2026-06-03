import type { ReactNode } from "react";

export type DemoStatus = "idle" | "recording" | "transcribing" | "done";

interface AppMockupProps {
  children: ReactNode;
  status: DemoStatus;
  className?: string;
}

const statusLabel: Record<DemoStatus, string> = {
  idle: "READY",
  recording: "LISTENING…",
  transcribing: "TRANSCRIBING…",
  done: "INSERTED AT CURSOR",
};

/**
 * The AntiType app surface shown on scene 3: a window-chromed card whose text
 * field fills with the spoken narration. The watch sits above it (owned by the
 * stage), so this is just the input panel.
 */
export function AppMockup({ children, status, className = "" }: AppMockupProps) {
  return (
    <div
      className={`w-[min(680px,86vw)] rounded-2xl border border-ink/15 bg-white/90 shadow-[0_30px_80px_-30px_rgba(5,5,5,0.45)] backdrop-blur ${className}`}
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-ink/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-ink/15" />
        <span className="h-3 w-3 rounded-full bg-ink/15" />
        <span className="h-3 w-3 rounded-full bg-ink/15" />
        <span className="ml-3 font-mono text-xs tracking-widest text-ink/50">
          anti-type://compose
        </span>
        <span className="ml-auto flex items-center gap-2 font-mono text-[10px] tracking-widest text-ink/60">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "recording"
                ? "animate-pulse bg-red-500"
                : status === "transcribing"
                  ? "animate-pulse bg-amber-500"
                  : status === "done"
                    ? "bg-emerald-500"
                    : "bg-ink/30"
            }`}
          />
          {statusLabel[status]}
        </span>
      </div>

      {/* text field */}
      <div className="min-h-[180px] px-6 py-6 text-left">
        <p className="font-mono text-lg leading-relaxed text-ink md:text-xl">
          {children}
        </p>
      </div>
    </div>
  );
}
