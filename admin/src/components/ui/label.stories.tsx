import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "UI/Label",
  component: Label,
  args: { children: "Title", htmlFor: "title" },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithInput: Story = {
  render: (args) => (
    <div className="flex max-w-sm flex-col gap-2">
      <Label {...args} />
      <Input id="title" />
    </div>
  ),
};
export const Persian: Story = { args: { children: "عنوان" } };
