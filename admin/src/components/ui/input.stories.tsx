import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "@/components/ui/input";

const meta = {
  title: "UI/Input",
  component: Input,
  args: { placeholder: "Title", "aria-label": "Title" },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: "A fairly long post title that keeps going to test how the field handles overflow" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "Locked" } };
export const Invalid: Story = { args: { "aria-invalid": true, defaultValue: "bad value" } };
export const Persian: Story = { args: { defaultValue: "عنوان نوشته", dir: "auto" } };
