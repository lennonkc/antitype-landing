/**
 * Single source of truth for all copy, links and asset paths.
 * Non-technical edits (text, URLs, video id) should happen here.
 */

export const hero = {
  title: "We don't type anymore like we used to do",
  subtitle: "— From AntiType",
};

export const watchText = {
  line1From: "M5 Stack",
  line1To: "AntiType",
  line2From: "StopWatch",
  line2To: "SpeakWatch",
};

/** Spoken narration for the page-3 long-press demo (≈49 words). */
export const narration =
  "Hey — this is AntiType, the SpeakWatch. I'm not typing this. I just press the button on my stopwatch and talk, and my words land right where my cursor is. No keyboard, no friction. Anywhere I can type, I can speak instead. That's it. Welcome to a world after typing.";

/** Set via .env: VITE_YOUTUBE_ID=xxxx — empty string shows a placeholder. */
export const youtubeId = import.meta.env.VITE_YOUTUBE_ID ?? "";

/** Discord community invite — tooltip copy shown when hovering the Discord button. */
export const discordInvite =
  "Join our Discord — be first to hear about every new release.";

export const social = {
  discord: "https://discord.gg/tfDsrYDUY",
  x: "https://x.com/lennonlkc",
  gmail: "mailto:lennonlkc@gmail.com",
  github: "https://github.com/lennonkc",
  githubUser: "lennonkc",
  linkedin: "https://www.linkedin.com/in/kuncheng-li",
  website: "https://www.kc-li.com",
  wechatQr: "https://www.kc-li.com/wechatQRcode.jpg",
};
