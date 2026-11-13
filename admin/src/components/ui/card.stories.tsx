import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta = {
  title: "UI/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <CardHeader>
        <CardTitle>Posts</CardTitle>
        <CardDescription>Everything published on the site.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">New</Button>
        </CardAction>
      </CardHeader>
      <CardContent>12 posts, 3 drafts.</CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <CardHeader>
        <CardTitle>Delete the trash</CardTitle>
        <CardDescription>This cannot be undone.</CardDescription>
      </CardHeader>
      <CardContent>Posts in the trash are removed for good.</CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button variant="destructive">Delete</Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  args: { size: "sm" },
  render: (args) => (
    <Card {...args} className="max-w-xs">
      <CardHeader>
        <CardTitle>نوشته‌ها</CardTitle>
        <CardDescription>همهٔ مطالب منتشر شده در سایت.</CardDescription>
      </CardHeader>
      <CardContent>۱۲ نوشته، ۳ پیش‌نویس</CardContent>
    </Card>
  ),
};
