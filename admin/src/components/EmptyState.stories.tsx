import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FileText } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Shared/EmptyState",
  component: EmptyState,
  args: { icon: FileText, title: "No posts yet" },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescriptionAndAction: Story = {
  args: {
    description: "Posts you write will show up here. Start with a draft and publish when it is ready.",
    action: <Button>New post</Button>,
  },
};
export const Persian: Story = {
  args: { title: "هنوز نوشته‌ای نیست", description: "نوشته‌هایی که می‌نویسید اینجا نمایش داده می‌شوند." },
};
