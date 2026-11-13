import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StatGrid, StatTile } from "@/components/StatGrid";

const meta = {
  title: "Shared/StatGrid",
  component: StatGrid,
} satisfies Meta<typeof StatGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { count: 4, children: null },
  render: (args) => (
    <StatGrid {...args}>
      <StatTile label="Posts" value="42" hint="3 drafts" emphasis />
      <StatTile label="Projects" value="8" />
      <StatTile label="Views" value="12,430" hint="Last 30 days" />
      <StatTile label="Failed uploads" value="2" tone="negative" />
    </StatGrid>
  ),
};

export const WithLinks: Story = {
  args: { count: 3, children: null },
  render: (args) => (
    <StatGrid {...args}>
      <StatTile label="Posts" value="42" href="/posts" />
      <StatTile label="Projects" value="8" href="/projects" />
      <StatTile label="Messages" value="5" href="/messages" hint="2 unread" />
    </StatGrid>
  ),
};

export const Persian: Story = {
  args: { count: 3, children: null },
  render: (args) => (
    <StatGrid {...args}>
      <StatTile label="نوشته‌ها" value="۴۲" hint="۳ پیش‌نویس" />
      <StatTile label="پروژه‌ها" value="۸" />
      <StatTile label="بازدیدها" value="۱۲٬۴۳۰" tone="negative" />
    </StatGrid>
  ),
};

export const ManyTiles: Story = {
  args: { count: 6, children: null },
  render: (args) => (
    <StatGrid {...args}>
      {["A", "B", "C", "D", "E", "F"].map((label, index) => (
        <StatTile key={label} label={`Metric ${label}`} value={String((index + 1) * 111)} />
      ))}
    </StatGrid>
  ),
};
