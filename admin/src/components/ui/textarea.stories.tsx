import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Textarea } from "@/components/ui/textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  args: { placeholder: "Write a summary", "aria-label": "Summary" },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: "A short summary that spans a couple of lines so the field grows past one row of text, just to see wrapping." } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "Locked" } };
export const Persian: Story = { args: { defaultValue: "خلاصه‌ای کوتاه از نوشته", dir: "auto" } };
