import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { RichTextEditor } from "@/components/rich-text/RichTextEditor";

function EditorDemo({ value, onChange, ...rest }: React.ComponentProps<typeof RichTextEditor>) {
  const [markdown, setMarkdown] = useState(value);
  return (
    <RichTextEditor
      {...rest}
      value={markdown}
      onChange={(next) => {
        setMarkdown(next);
        onChange(next);
      }}
    />
  );
}

const meta = {
  title: "Editor/RichTextEditor",
  component: RichTextEditor,
  args: { value: "", onChange: () => {}, label: "Body" },
  render: (args) => <EditorDemo {...args} />,
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithContent: Story = {
  args: {
    value: "## A heading\n\nSome **bold** and *italic* text with a [link](https://example.com).\n\n- one\n- two\n\n> A quote\n\n```\ncode\n```",
  },
};
export const Persian: Story = {
  args: { value: "## عنوان\n\nمتنی **پررنگ** و *کج* به زبان فارسی.\n\n- یک\n- دو" },
};
