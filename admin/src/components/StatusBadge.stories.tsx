import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StatusBadge } from "@/components/StatusBadge";

const meta = {
  title: "Shared/StatusBadge",
  component: StatusBadge,
  args: { locale: "en", status: "published" },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Published: Story = {};
export const Draft: Story = { args: { status: "draft" } };
export const Empty: Story = { args: { status: "empty", locale: "fa" } };
export const AllStates: Story = {
  render: () => (
    <div className="flex gap-2">
      <StatusBadge locale="en" status="published" />
      <StatusBadge locale="fa" status="draft" />
      <StatusBadge locale="fa" status="empty" />
    </div>
  ),
};
