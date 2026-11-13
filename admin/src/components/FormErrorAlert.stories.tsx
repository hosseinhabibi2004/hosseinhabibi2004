import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FormErrorAlert } from "@/components/FormErrorAlert";

const meta = {
  title: "Shared/FormErrorAlert",
  component: FormErrorAlert,
  args: { message: "Could not save the post." },
} satisfies Meta<typeof FormErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongMessage: Story = {
  args: { message: "The server refused the request because the cover image is larger than the allowed size, and the slug is already used by another post in this language." },
};
export const Persian: Story = { args: { message: "ذخیرهٔ نوشته انجام نشد." } };
