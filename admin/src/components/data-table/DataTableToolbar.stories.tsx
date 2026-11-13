import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { OptionSelect } from "@/components/OptionSelect";

const meta = {
  title: "Data table/DataTableToolbar",
  component: DataTableToolbar,
  args: { isFiltered: false, onReset: fn(), onSearchChange: fn(), search: "" },
} satisfies Meta<typeof DataTableToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithFilter: Story = {
  args: {
    isFiltered: true,
    search: "hello",
    children: (
      <OptionSelect
        value="draft"
        onChange={fn()}
        aria-label="Status"
        className="w-40"
        options={[
          { value: "all", label: "All" },
          { value: "draft", label: "Draft" },
        ]}
      />
    ),
  },
};
export const NoSearch: Story = { args: { onSearchChange: undefined, isFiltered: true } };
export const Persian: Story = { args: { searchPlaceholder: "جست‌وجوی نوشته‌ها", search: "سلام", isFiltered: true } };
