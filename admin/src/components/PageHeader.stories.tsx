import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Shared/PageHeader",
  component: PageHeader,
  args: { title: "Posts" },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescriptionAndActions: Story = {
  args: {
    description: "Write, edit and publish the posts shown on the site.",
    actions: (
      <>
        <Button variant="outline">Trash</Button>
        <Button>New post</Button>
      </>
    ),
  },
};
export const LongTitle: Story = {
  args: {
    title: "A very long page title that goes on and on to check that the action wraps below it on a phone",
    description: "Short description.",
    actions: <Button>New post</Button>,
  },
};
export const Persian: Story = {
  args: { title: "نوشته‌ها", description: "نوشته‌های نمایش‌داده‌شده در سایت را بنویسید و منتشر کنید.", actions: <Button>نوشتهٔ جدید</Button> },
};
