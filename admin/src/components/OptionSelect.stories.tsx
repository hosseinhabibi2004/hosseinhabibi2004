import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { OptionSelect } from "@/components/OptionSelect";

const OPTIONS = [
  { value: "all", label: "All posts" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
] as const;

function ControlledSelect(args: React.ComponentProps<typeof OptionSelect<string>>) {
  const [value, setValue] = useState("draft");
  return <OptionSelect {...args} value={value} onChange={setValue} />;
}

const meta = {
  title: "Shared/OptionSelect",
  component: OptionSelect<string>,
  args: { value: "all", options: OPTIONS, onChange: fn(), "aria-label": "Status", className: "w-48" },
} satisfies Meta<typeof OptionSelect<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Controlled: Story = {
  render: (args) => <ControlledSelect {...args} />,
};
export const Placeholder: Story = { args: { value: "", placeholder: "Choose a status" } };
export const Disabled: Story = { args: { disabled: true } };
export const Persian: Story = {
  args: {
    value: "published",
    options: [
      { value: "all", label: "همهٔ نوشته‌ها" },
      { value: "published", label: "منتشر شده" },
      { value: "draft", label: "پیش‌نویس" },
    ],
  },
};
