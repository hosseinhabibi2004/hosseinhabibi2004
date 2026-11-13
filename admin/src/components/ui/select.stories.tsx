import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const meta = {
  title: "UI/Select",
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export const Default: Story = {
  render: () => (
    <Select items={STATUSES} defaultValue="draft">
      <SelectTrigger aria-label="Status" className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

export const Placeholder: Story = {
  render: () => (
    <Select items={STATUSES}>
      <SelectTrigger aria-label="Status" className="w-48">
        <SelectValue placeholder="Choose a status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
          {STATUSES.slice(0, 2).map((status) => (
            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="archived">Archived</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select items={STATUSES} defaultValue="published" disabled>
      <SelectTrigger aria-label="Status" className="w-48" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};
