import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const meta = {
  title: "Shared/LanguageSwitcher",
  component: LanguageSwitcher,
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const InNarrowColumn: Story = { args: { className: "w-40 justify-between" } };
