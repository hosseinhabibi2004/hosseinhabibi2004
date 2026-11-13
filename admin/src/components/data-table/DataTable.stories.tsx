import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Pencil, Trash2 } from "lucide-react";
import { fn } from "storybook/test";

import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { IconAction, IconActions } from "@/components/IconAction";
import { StatusBadge } from "@/components/StatusBadge";

interface Row {
  id: string;
  title: string;
  status: "draft" | "published";
  updated: string;
}

const COLUMNS: DataTableColumn<Row>[] = [
  { id: "title", header: "Title", isTitle: true, cell: (row) => row.title },
  { id: "status", header: "Status", cell: (row) => <StatusBadge locale="en" status={row.status} /> },
  { id: "updated", header: "Updated", cell: (row) => row.updated },
];

const ROWS: Row[] = [
  { id: "1", title: "Hello, world", status: "published", updated: "2026-11-02" },
  { id: "2", title: "نوشتهٔ فارسی با عنوانی نسبتاً بلند برای آزمودن شکستن خط", status: "draft", updated: "2026-11-05" },
  { id: "3", title: "A very long English title that keeps going to check how the row wraps in the table and in the card", status: "draft", updated: "2026-11-10" },
];

const meta = {
  title: "Data table/DataTable",
  component: DataTable<Row>,
  args: {
    caption: "List of posts",
    columns: COLUMNS,
    rows: ROWS,
    getRowId: (row: Row) => row.id,
    onRetry: fn(),
  },
} satisfies Meta<typeof DataTable<Row>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithRowActions: Story = {
  args: {
    rowActions: () => (
      <IconActions>
        <IconAction label="Edit" icon={Pencil} onClick={fn()} />
        <IconAction label="Delete" icon={Trash2} tone="danger" onClick={fn()} />
      </IconActions>
    ),
  },
};
export const Loading: Story = { args: { rows: undefined, skeletonRows: 4 } };
export const Empty: Story = { args: { rows: [] } };
export const ErrorState: Story = { args: { isError: true } };
export const Expanded: Story = {
  args: {
    expansion: {
      isExpanded: (row: Row) => row.id === "1",
      render: (row: Row) => <p className="p-4 text-sm text-muted-foreground">Details of {row.title}</p>,
    },
  },
};
