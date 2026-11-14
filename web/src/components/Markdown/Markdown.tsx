/* eslint-disable @typescript-eslint/no-unused-vars -- `node` is destructured only to keep it off the DOM */
import type { Element, Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { toString } from "hast-util-to-string";
import type { ComponentProps, ElementType, ReactElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { CodeBlock } from "./CodeBlock";
import "./markdown.css";

export interface MarkdownProps {
  source: string;
  copyLabel: string;
  copiedLabel: string;
}

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "mark"],
};

function isExternal(href: string | undefined): boolean {
  return !!href && /^(https?:)?\/\//i.test(href);
}

function codeInfo(pre: Element | undefined): { code: string; language: string | null } {
  const code = pre?.children.find(
    (c): c is Element => c.type === "element" && c.tagName === "code",
  );
  if (!code) return { code: pre ? toString(pre) : "", language: null };
  const classes = (code.properties.className as string[] | undefined) ?? [];
  const lang = classes.find((c) => c.startsWith("language-"));
  return { code: toString(code), language: lang ? lang.slice("language-".length) : null };
}

type BlockTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "ul" | "ol" | "blockquote";

function block(Tag: BlockTag) {
  const Component = Tag as ElementType;
  return function Block({ node, ...props }: ComponentProps<BlockTag> & { node?: unknown }) {
    return <Component {...props} dir="auto" />;
  };
}

/**
 * Renders the Markdown source to a React element. Server pages that own an async render can
 * `await` this directly instead of suspending on `<Markdown />`.
 */
export async function renderMarkdown({
  source,
  copyLabel,
  copiedLabel,
}: MarkdownProps): Promise<ReactElement> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: false });
  const tree = (await processor.run(processor.parse(source))) as Root;

  const content = toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    passNode: true,
    components: {
      h1: block("h1"),
      h2: block("h2"),
      h3: block("h3"),
      h4: block("h4"),
      h5: block("h5"),
      h6: block("h6"),
      p: block("p"),
      ul: block("ul"),
      ol: block("ol"),
      blockquote: block("blockquote"),
      a({ node, href, ...props }: ComponentProps<"a"> & { node?: unknown }) {
        return isExternal(href) ? (
          <a {...props} href={href} target="_blank" rel="noopener noreferrer" />
        ) : (
          <a {...props} href={href} />
        );
      },
      table({ node, ...props }: ComponentProps<"table"> & { node?: unknown }) {
        return (
          <div className="md-table">
            <table {...props} />
          </div>
        );
      },
      pre({ node, children }: ComponentProps<"pre"> & { node?: Element }) {
        const { code, language } = codeInfo(node);
        return (
          <CodeBlock
            code={code}
            language={language}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
          >
            {children}
          </CodeBlock>
        );
      },
    },
  });

  return <div className="md">{content}</div>;
}

export async function Markdown(props: MarkdownProps): Promise<ReactElement> {
  return renderMarkdown(props);
}
