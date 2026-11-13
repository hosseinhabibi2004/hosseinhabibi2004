"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * A row action as an icon: edit, open, deactivate. The label is the
 * button's accessible name and its tooltip, so a table of ten rows carries
 * ten small glyphs instead of ten words each — and still says what each does.
 *
 * `href` makes it a link (`external` opens a new tab); otherwise `onClick`.
 * `tone="danger"` is for an action that takes something away.
 */
export function IconAction({
  label,
  icon: Icon,
  onClick,
  href,
  external = false,
  tone = "default",
  disabled = false,
}: {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  const className = cn(
    "text-muted-foreground hover:text-foreground",
    tone === "danger" && "hover:bg-destructive/10 hover:text-destructive",
  );
  const button = href ? (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      className={className}
      nativeButton={false}
      render={
        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        />
      }
    />
  ) : (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      className={className}
      disabled={disabled}
      onClick={onClick}
    />
  );

  return (
    <Tooltip>
      <TooltipTrigger render={button}>
        <Icon aria-hidden />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** A row of `IconAction`s, kept together at the row's end. */
export function IconActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-1">{children}</div>
  );
}
