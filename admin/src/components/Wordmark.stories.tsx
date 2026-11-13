import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Wordmark } from "@/components/Wordmark";

const meta = {
  title: "Shared/Wordmark",
  component: Wordmark,
  args: { name: "Hossein Habibi" },
} satisfies Meta<typeof Wordmark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithTagline: Story = { args: { tagline: "Portfolio admin", size: "lg" } };
export const Small: Story = { args: { size: "sm" } };
export const Persian: Story = { args: { name: "حسین حبیبی", tagline: "مدیریت نمونه‌کار" } };
