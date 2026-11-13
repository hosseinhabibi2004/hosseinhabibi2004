import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEditor } from "@tiptap/react";

import { editorExtensions } from "@/components/rich-text/markdown";
import { Toolbar } from "@/components/rich-text/Toolbar";

function ToolbarDemo({ content }: { content: string }) {
  const editor = useEditor({ extensions: editorExtensions, content, immediatelyRender: false });
  return editor ? <Toolbar editor={editor} /> : null;
}

const meta = {
  title: "Editor/Toolbar",
  component: Toolbar,
  render: () => <ToolbarDemo content="" />,
  // The editor is built inside the render function; this one only satisfies the prop type.
  args: { editor: null as never },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithContent: Story = { render: () => <ToolbarDemo content="<h2>Title</h2><p>Text</p>" /> };
