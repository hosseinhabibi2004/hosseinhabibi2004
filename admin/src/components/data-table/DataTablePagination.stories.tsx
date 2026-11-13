import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { DataTablePagination } from "@/components/data-table/DataTablePagination";

function PaginationDemo(args: React.ComponentProps<typeof DataTablePagination>) {
  const [page, setPage] = useState(1);
  return <DataTablePagination {...args} page={page} onPageChange={setPage} />;
}

const meta = {
  title: "Data table/DataTablePagination",
  component: DataTablePagination,
  args: { page: 2, pageSize: 10, total: 47, onPageChange: fn() },
} satisfies Meta<typeof DataTablePagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const FirstPage: Story = { args: { page: 1 } };
export const LastPage: Story = { args: { page: 5 } };
export const NoResults: Story = { args: { page: 1, total: 0 } };
export const Interactive: Story = {
  render: (args) => <PaginationDemo {...args} />,
};
