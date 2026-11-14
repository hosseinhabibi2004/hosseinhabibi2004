"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CopyButtonProps {
  text: string;
  label: string;
  copiedLabel: string;
}

export function CopyButton({ text, label, copiedLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  const Icon = copied ? Check : Copy;
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-xs text-code-foreground/70 transition-colors hover:text-code-foreground focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Icon aria-hidden className="size-3.5" />
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
