import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/components/ui/badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: { children: "Published" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary", children: "Draft" } };
export const Outline: Story = { args: { variant: "outline", children: "Empty" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Failed" } };
export const Persian: Story = { args: { children: "منتشر شده" } };
