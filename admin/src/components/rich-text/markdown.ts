import { Editor, Extension } from "@tiptap/react";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";

const BLOCKS = ["paragraph", "heading", "blockquote", "listItem"];

/** Every block reads in its own direction, so a Persian and an English paragraph sit side by side. */
const AutoDirection = Extension.create({
  name: "autoDirection",
  addGlobalAttributes() {
    return [
      {
        types: BLOCKS,
        attributes: {
          dir: { default: "auto", parseHTML: () => "auto", renderHTML: () => ({ dir: "auto" }) },
        },
      },
    ];
  },
});

/** The editor's schema: what the toolbar can make, read and written as Markdown. */
export const editorExtensions = [
  StarterKit.configure({ link: { openOnClick: false, autolink: false } }),
  Markdown,
  AutoDirection,
];

/** Parses `markdown` into the editor's document and writes it back out — what a save would store. */
export function markdownRoundTrip(markdown: string): string {
  const editor = new Editor({ extensions: editorExtensions, content: markdown, contentType: "markdown" });
  try {
    return editor.getMarkdown();
  } finally {
    editor.destroy();
  }
}
