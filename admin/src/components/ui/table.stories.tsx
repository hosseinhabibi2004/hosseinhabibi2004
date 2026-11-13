import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const meta = {
  title: "UI/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>List of posts</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Hello, world</TableCell>
          <TableCell><Badge>Published</Badge></TableCell>
          <TableCell>2026-11-02</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Notes on a very long title that should wrap or truncate gracefully inside the cell</TableCell>
          <TableCell><Badge variant="secondary">Draft</Badge></TableCell>
          <TableCell>2026-11-10</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell>2</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Persian: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>عنوان</TableHead>
          <TableHead>وضعیت</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>سلام دنیا</TableCell>
          <TableCell><Badge>منتشر شده</Badge></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
