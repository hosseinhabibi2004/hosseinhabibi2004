"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Code2,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  type LucideIcon,
} from "lucide-react";

import { Toggle } from "@/components/ui/toggle";
import { useT } from "@/i18n/client";

interface Action {
  label: `editor.${"heading2" | "heading3" | "bold" | "italic" | "code" | "bulletList" | "orderedList" | "quote" | "codeBlock" | "rule"}`;
  icon: LucideIcon;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

const ACTIONS: Action[] = [
  { label: "editor.heading2", icon: Heading2, isActive: (e) => e.isActive("heading", { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: "editor.heading3", icon: Heading3, isActive: (e) => e.isActive("heading", { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: "editor.bold", icon: Bold, isActive: (e) => e.isActive("bold"), run: (e) => e.chain().focus().toggleBold().run() },
  { label: "editor.italic", icon: Italic, isActive: (e) => e.isActive("italic"), run: (e) => e.chain().focus().toggleItalic().run() },
  { label: "editor.code", icon: Code, isActive: (e) => e.isActive("code"), run: (e) => e.chain().focus().toggleCode().run() },
  { label: "editor.bulletList", icon: List, isActive: (e) => e.isActive("bulletList"), run: (e) => e.chain().focus().toggleBulletList().run() },
  { label: "editor.orderedList", icon: ListOrdered, isActive: (e) => e.isActive("orderedList"), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { label: "editor.quote", icon: Quote, isActive: (e) => e.isActive("blockquote"), run: (e) => e.chain().focus().toggleBlockquote().run() },
  { label: "editor.codeBlock", icon: Code2, isActive: (e) => e.isActive("codeBlock"), run: (e) => e.chain().focus().toggleCodeBlock().run() },
  { label: "editor.rule", icon: Minus, isActive: () => false, run: (e) => e.chain().focus().setHorizontalRule().run() },
];

/** The formatting buttons; each one reflects the selection and runs one editor command. */
export function Toolbar({ editor }: { editor: Editor }) {
  const { t } = useT("common");

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt(t("editor.linkPrompt"), previous ?? "https://");
    if (href === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href === "") chain.unsetLink().run();
    else chain.setLink({ href }).run();
  }

  return (
    <div role="toolbar" aria-label={t("editor.label")} className="flex flex-wrap gap-1">
      {ACTIONS.map(({ label, icon: Icon, isActive, run }) => (
        <Toggle
          key={label}
          size="sm"
          aria-label={t(label)}
          pressed={isActive(editor)}
          onPressedChange={() => run(editor)}
        >
          <Icon aria-hidden />
        </Toggle>
      ))}
      <Toggle size="sm" aria-label={t("editor.link")} pressed={editor.isActive("link")} onPressedChange={setLink}>
        <Link2 aria-hidden />
      </Toggle>
    </div>
  );
}
