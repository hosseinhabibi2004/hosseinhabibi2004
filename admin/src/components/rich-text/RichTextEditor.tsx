"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { useEffect, useState } from "react";

import { editorExtensions } from "@/components/rich-text/markdown";
import { Toolbar } from "@/components/rich-text/Toolbar";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

/**
 * A WYSIWYG editor whose value in and out is a Markdown string. The Source toggle swaps the
 * canvas for a plain textarea over the same Markdown, for what the toolbar cannot make.
 */
export function RichTextEditor({
  value,
  onChange,
  className,
  id,
  label,
}: {
  value: string;
  onChange: (markdown: string) => void;
  className?: string;
  id?: string;
  /** The editing canvas's accessible name. */
  label?: string;
}) {
  const { t } = useT("common");
  const [source, setSource] = useState(false);

  const editor = useEditor({
    extensions: editorExtensions,
    content: value,
    contentType: "markdown",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        ...(label ? { role: "textbox", "aria-label": label, "aria-multiline": "true" } : {}),
        class: "min-h-40 px-3 py-2 text-sm outline-none [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-bold [&_blockquote]:border-s-2 [&_blockquote]:ps-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ps-5 [&_ol]:ps-5 [&_a]:underline [&_code]:font-mono [&_pre]:font-mono [&_hr]:my-3 [&_hr]:border-border [&_p]:my-2",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getMarkdown()),
  });
  // Re-render the toolbar as the selection moves.
  useEditorState({ editor, selector: (state) => state.editor?.state.selection });

  // A value that changed from outside (another language tab, a reset) replaces the document.
  useEffect(() => {
    if (editor && !source && value !== editor.getMarkdown()) {
      editor.commands.setContent(value, { contentType: "markdown" });
    }
  }, [editor, value, source]);

  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2", className)}>
      <div className="flex items-start justify-between gap-2">
        {editor && !source ? <Toolbar editor={editor} /> : <span />}
        <Toggle size="sm" pressed={source} onPressedChange={setSource} aria-label={t("editor.source")}>
          {t("editor.source")}
        </Toggle>
      </div>
      {source ? (
        <Textarea
          aria-label={t("editor.sourceLabel")}
          dir="auto"
          className="min-h-40 font-mono"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
