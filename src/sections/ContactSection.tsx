import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import GitHubCalendar, { type Activity } from "react-github-calendar";
import {
  Mail,
  Github,
  Linkedin,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { social, discordInvite } from "@/config";

/** Official Discord glyph (lucide ships no brand marks). Inherits color via currentColor. */
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

/** Official X (Twitter) glyph (lucide ships no brand marks). Inherits color via currentColor. */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

/** Official WeChat glyph (lucide ships no brand marks). Inherits color via currentColor. */
function WeChatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088zm-3.535 3.084c.43 0 .78.35.78.787a.79.79 0 0 1-.78.79.79.79 0 0 1-.78-.79c0-.434.35-.787.78-.787zm4.71 0c.43 0 .78.35.78.787a.79.79 0 0 1-.78.79.79.79 0 0 1-.78-.79c0-.434.35-.787.78-.787z" />
    </svg>
  );
}

interface ContactSectionProps {
  reduced: boolean;
}

interface LinkItem {
  name: string;
  Icon: LucideIcon;
  href: string;
}

const links: LinkItem[] = [
  { name: "Gmail", Icon: Mail, href: social.gmail },
  { name: "GitHub", Icon: Github, href: social.github },
  { name: "LinkedIn", Icon: Linkedin, href: social.linkedin },
  { name: "Website", Icon: Globe, href: social.website },
];

/** Keep only the most recent ~100 days of contributions for the calendar. */
function lastDays(contributions: Activity[]): Activity[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 100);
  return contributions.filter((a) => new Date(a.date) >= cutoff);
}

/** Scene 5 — contact. The personal footer, maxed out and centred. */
export function ContactSection({ reduced }: ContactSectionProps) {
  const root = useRef<HTMLElement>(null);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [discordOpen, setDiscordOpen] = useState(false);

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from(".contact-reveal", {
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: "top 65%" },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const iconBtn =
    "group relative flex h-16 w-16 items-center justify-center rounded-2xl border border-paper/15 bg-paper/[0.03] text-paper/80 transition-all hover:-translate-y-1 hover:border-paper/40 hover:text-paper";

  return (
    <section
      ref={root}
      className="flex min-h-screen w-full flex-col items-center justify-center gap-12 bg-ink px-6 py-24 text-paper"
    >
      <div className="contact-reveal text-center">
        <h2 className="font-display text-5xl font-bold tracking-tightest sm:text-7xl">
          Let&apos;s talk.
        </h2>
        <p className="mt-4 font-mono text-sm tracking-widest text-paper/50">
          STOP TYPING — START SPEAKING
        </p>
      </div>

      <div className="contact-reveal flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {/* Discord — links out; community-invite tooltip on hover. First in the row. */}
        <a
          href={social.discord}
          target="_blank"
          rel="noreferrer"
          aria-label="Discord"
          className={iconBtn}
          onMouseEnter={() => setDiscordOpen(true)}
          onMouseLeave={() => setDiscordOpen(false)}
          onFocus={() => setDiscordOpen(true)}
          onBlur={() => setDiscordOpen(false)}
        >
          <DiscordIcon className="h-6 w-6" />
          {discordOpen && (
            <span className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-10 w-56 -translate-x-1/2 rounded-xl border border-paper/15 bg-ink/95 px-4 py-3 text-center text-xs font-medium leading-relaxed text-paper shadow-2xl backdrop-blur">
              {discordInvite}
            </span>
          )}
        </a>

        {/* X (Twitter) — second */}
        <a
          href={social.x}
          target="_blank"
          rel="noreferrer"
          aria-label="X"
          className={iconBtn}
        >
          <XIcon className="h-6 w-6" />
        </a>

        {links.map(({ name, Icon, href }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={name}
            className={iconBtn}
          >
            <Icon className="h-7 w-7" />
          </a>
        ))}

        {/* WeChat — QR on hover */}
        <button
          type="button"
          aria-label="WeChat"
          className={iconBtn}
          onMouseEnter={() => setWechatOpen(true)}
          onMouseLeave={() => setWechatOpen(false)}
          onFocus={() => setWechatOpen(true)}
          onBlur={() => setWechatOpen(false)}
        >
          <WeChatIcon className="h-7 w-7" />
          {wechatOpen && (
            <span className="absolute bottom-[calc(100%+16px)] left-1/2 z-10 -translate-x-1/2 rounded-xl bg-white p-3 shadow-2xl">
              <img
                src={social.wechatQr}
                alt="WeChat QR"
                className="h-[260px] w-[260px] max-w-none rounded-md object-contain"
              />
            </span>
          )}
        </button>
      </div>

      <div className="contact-reveal w-full max-w-3xl rounded-2xl border border-paper/10 bg-paper/[0.02] p-6">
        <p className="mb-4 text-center font-mono text-xs uppercase tracking-[0.3em] text-paper/40">
          github · last 100 days
        </p>
        <div className="flex justify-center overflow-x-auto">
          <GitHubCalendar
            username={social.githubUser}
            colorScheme="dark"
            transformData={lastDays}
            hideColorLegend
            labels={{ totalCount: "{{count}} commits in the last 100 days" }}
          />
        </div>
      </div>

      <p className="contact-reveal font-mono text-xs text-paper/40">
        © 2026 KunCheng Li · AntiType
      </p>
    </section>
  );
}
