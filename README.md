# AntiType — Landing Page

Cinematic, scroll-driven landing page for **AntiType (SpeakWatch)**.

> "We don't type anymore like we used to do."

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** for styling
- **GSAP + ScrollTrigger** (pin + scrub) for the cinematic narrative
- **Lenis** smooth scrolling (synced to ScrollTrigger; off on touch / reduced-motion)
- Fonts: Space Grotesk (display) + JetBrains Mono (mono)

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build → dist/
npm run preview  # serve the production build
```

## The five scenes

1. **Hero** — black; headline types itself in, byline jitters.
2. **Reveal** — black "cardboard" splits apart to unbox the stopwatch; it grows
   to fill the screen; `M5 Stack` / `StopWatch` fly onto the dial and scramble
   into `AntiType` / `SpeakWatch`.
3. **App demo** — the watch shrinks into the app; a virtual hand long-presses the
   button while the narration is "spoken" into the input field.
4. **Live demo** — YouTube embed (or placeholder).
5. **Contact** — maxed-out personal footer (links, WeChat QR, GitHub calendar).

On touch devices, narrow viewports, or `prefers-reduced-motion`, the page falls
back to a clean stacked layout with static final states (no scroll-jacking).

## Editing content

All copy, links and asset paths live in [`src/config.ts`](src/config.ts).

## Assets to provide

- `public/audio/page3-narration.mp3` — the spoken narration (script is in
  `src/config.ts`). The demo still runs on a timer if the file is absent.
- `VITE_YOUTUBE_ID` (in `.env`) — the live-demo video id.
- `social.douyin` (in `src/config.ts`) — the DouYin profile URL.
- `public/stopwatch-clean.svg` — font-less watch face (provided; tweak freely).

## Deploy

Static output in `dist/` — deploy to Vercel / Netlify / GitHub Pages.
