import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { UrlTabs } from "@/components/UrlTabs";

const meta = {
  title: "Shared/UrlTabs",
  component: UrlTabs,
  args: {
    label: "Sections",
    sections: [
      { id: "general", label: "General", content: <p className="text-sm">General settings.</p> },
      { id: "seo", label: "SEO", content: <p className="text-sm">Search engine settings.</p> },
      { id: "history", label: "History", content: <p className="text-sm">Past changes.</p> },
    ],
  },
} satisfies Meta<typeof UrlTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleSection: Story = {
  args: { sections: [{ id: "only", label: "Only", content: <p className="text-sm">Just one.</p> }] },
};
export const Persian: Story = {
  args: {
    label: "بخش‌ها",
    sections: [
      { id: "general", label: "عمومی", content: <p className="text-sm">تنظیمات عمومی.</p> },
      { id: "seo", label: "سئو", content: <p className="text-sm">تنظیمات موتور جست‌وجو.</p> },
    ],
  },
};
