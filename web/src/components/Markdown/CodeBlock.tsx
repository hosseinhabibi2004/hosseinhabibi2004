import type { ReactNode } from "react";

import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  code: string;
  language: string | null;
  copyLabel: string;
  copiedLabel: string;
  children: ReactNode;
}

export function CodeBlock({ code, language, copyLabel, copiedLabel, children }: CodeBlockProps) {
  return (
    <div className="my-8 overflow-hidden rounded-lg bg-code text-code-foreground" dir="ltr">
      <div className="flex items-center justify-between bg-code-header px-4 py-2 font-sans text-xs">
        <span className="text-code-foreground/70">{language ?? "text"}</span>
        <CopyButton text={code} label={copyLabel} copiedLabel={copiedLabel} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">{children}</pre>
    </div>
  );
}
