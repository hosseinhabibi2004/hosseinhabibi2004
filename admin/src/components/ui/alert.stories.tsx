import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircleAlert, Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <Info aria-hidden />
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>Your changes are saved as a draft until you publish.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  args: { variant: "destructive" },
  render: (args) => (
    <Alert {...args}>
      <CircleAlert aria-hidden />
      <AlertTitle>Could not save</AlertTitle>
      <AlertDescription>The title is required in at least one language.</AlertDescription>
    </Alert>
  ),
};

export const Persian: Story = {
  args: { variant: "destructive" },
  render: (args) => (
    <Alert {...args} dir="rtl">
      <CircleAlert aria-hidden />
      <AlertTitle>ذخیره نشد</AlertTitle>
      <AlertDescription>عنوان دست‌کم در یک زبان لازم است.</AlertDescription>
    </Alert>
  ),
};
