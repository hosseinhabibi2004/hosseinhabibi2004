import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bold } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  args: { "aria-label": "Bold", children: <Bold aria-hidden /> },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Pressed: Story = { args: { defaultPressed: true } };
export const Small: Story = { args: { size: "sm" } };
export const Disabled: Story = { args: { disabled: true } };
