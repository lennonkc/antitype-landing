import { forwardRef } from "react";

interface StopwatchProps {
  className?: string;
}

/**
 * Font-less stopwatch face (inline SVG so callers can target sub-nodes).
 * The dynamic watch text is overlaid by the parent, not baked into the SVG.
 * `#sw-btn-yellow` is the top-right button the virtual hand presses.
 */
export const Stopwatch = forwardRef<HTMLDivElement, StopwatchProps>(
  function Stopwatch({ className = "" }, ref) {
    return (
      <div ref={ref} className={className}>
        <svg
          viewBox="0 0 400 400"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="AntiType SpeakWatch"
        >
          <defs>
            <linearGradient id="sw-bezel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a4a4c" />
              <stop offset="20%" stopColor="#2a2a2c" />
              <stop offset="80%" stopColor="#1a1a1c" />
              <stop offset="100%" stopColor="#0a0a0c" />
            </linearGradient>
            <radialGradient id="sw-screen" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#151515" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
            <linearGradient id="sw-glare" x1="0%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sw-yellow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffca28" />
              <stop offset="100%" stopColor="#f57f17" />
            </linearGradient>
            <linearGradient id="sw-blue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#42a5f5" />
              <stop offset="100%" stopColor="#1565c0" />
            </linearGradient>
          </defs>

          <g id="sw-btn-yellow" transform="rotate(-48 200 200)">
            <rect x="168" y="26" width="64" height="20" rx="6" fill="#c49010" />
            <rect x="168" y="22" width="64" height="16" rx="6" fill="url(#sw-yellow)" />
          </g>

          <g transform="rotate(48 200 200)">
            <rect x="168" y="28" width="64" height="18" rx="6" fill="#0d47a1" />
            <rect x="168" y="24" width="64" height="16" rx="6" fill="url(#sw-blue)" />
          </g>

          <circle cx="200" cy="200" r="164" fill="url(#sw-bezel)" />
          <circle cx="200" cy="200" r="154" fill="#0a0a0a" stroke="#222" strokeWidth="2" />
          <circle cx="200" cy="200" r="150" fill="url(#sw-screen)" />

          <path
            d="M 52 180 A 148 148 0 0 1 348 180 Q 200 260 52 180 Z"
            fill="url(#sw-glare)"
          />
          <path
            d="M 50 200 A 150 150 0 0 1 200 50 A 150 150 0 0 0 50 200 Z"
            fill="#ffffff"
            opacity="0.05"
          />
        </svg>
      </div>
    );
  },
);
