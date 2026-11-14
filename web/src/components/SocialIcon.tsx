import { Globe } from "lucide-react";

/** Brand glyphs for the profile link kinds; any other kind falls back to a globe. */
export function SocialIcon({ kind, className }: { kind: string; className?: string }) {
  const k = kind.toLowerCase();
  const common = { "aria-hidden": true, className, fill: "currentColor" } as const;
  if (k === "github") {
    return (
      <svg viewBox="0 0 16 16" {...common}>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    );
  }
  if (k === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <rect x="3" y="9" width="3.5" height="12" />
        <circle cx="4.75" cy="4.75" r="2" />
        <path d="M10 9h3.3v1.7c.6-1.1 1.9-2 3.7-2 3.3 0 4 2.1 4 5V21h-3.5v-6c0-1.4 0-2.9-1.9-2.9s-2.1 1.4-2.1 2.8V21H10z" />
      </svg>
    );
  }
  if (k === "x" || k === "twitter") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M18.9 2H22l-7.2 8.2L23 22h-6.4l-5-6.5L5.8 22H2.7l7.7-8.8L2.3 2h6.5l4.5 5.9zm-1.1 18h1.7L7.3 3.9H5.5z" />
      </svg>
    );
  }
  return <Globe aria-hidden className={className} />;
}
