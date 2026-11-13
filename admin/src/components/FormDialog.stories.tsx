import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { FormDialog } from "@/components/FormDialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const meta = {
  title: "Shared/FormDialog",
  component: FormDialog,
  args: {
    title: "Rename post",
    description: "The address of the post does not change.",
    submitLabel: "Save",
    onSubmit: fn((event) => event.preventDefault()),
    onClose: fn(),
    children: (
      <Field>
        <FieldLabel htmlFor="name">Title</FieldLabel>
        <Input id="name" defaultValue="Hello, world" />
      </Field>
    ),
  },
} satisfies Meta<typeof FormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithError: Story = { args: { error: "A post with this title already exists." } };
export const PendingDestructive: Story = {
  args: { destructive: true, isPending: true, submitLabel: "Void", title: "Void this entry" },
};
export const Persian: Story = {
  args: { title: "تغییر عنوان", description: "نشانی نوشته تغییر نمی‌کند.", submitLabel: "ذخیره", size: "sm" },
};
