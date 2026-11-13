import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { fn } from "storybook/test";

import { IconAction, IconActions } from "@/components/IconAction";

const meta = {
  title: "Shared/IconAction",
  component: IconAction,
  args: { label: "Edit", icon: Pencil, onClick: fn() },
} satisfies Meta<typeof IconAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Danger: Story = { args: { label: "Delete", icon: Trash2, tone: "danger" } };
export const Disabled: Story = { args: { disabled: true } };
export const RowOfActions: Story = {
  render: () => (
    <IconActions>
      <IconAction label="Open" icon={ExternalLink} href="https://example.com" external />
      <IconAction label="ویرایش" icon={Pencil} onClick={fn()} />
      <IconAction label="Delete" icon={Trash2} tone="danger" onClick={fn()} />
    </IconActions>
  ),
};
