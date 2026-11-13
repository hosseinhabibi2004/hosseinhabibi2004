import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { ConfirmDialog } from "@/components/ConfirmDialog";

const meta = {
  title: "Shared/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    onConfirm: fn(),
    title: "Delete this post?",
    description: "It moves to the trash and can be restored later.",
    confirmLabel: "Delete",
    variant: "destructive",
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Pending: Story = { args: { isPending: true } };
export const WithError: Story = { args: { error: "The post is locked by another editor." } };
export const Persian: Story = {
  args: {
    title: "این نوشته حذف شود؟",
    description: "نوشته به سطل زباله می‌رود و بعداً قابل بازیابی است.",
    confirmLabel: "حذف",
  },
};
