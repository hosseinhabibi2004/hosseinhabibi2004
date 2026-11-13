import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { LoadError } from "@/components/LoadError";

const meta = {
  title: "Shared/LoadError",
  component: LoadError,
} satisfies Meta<typeof LoadError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithRetry: Story = { args: { onRetry: fn() } };
export const CustomMessage: Story = { args: { message: "The posts could not be loaded.", onRetry: fn() } };
export const Persian: Story = { args: { message: "بارگذاری نوشته‌ها انجام نشد.", onRetry: fn() } };
