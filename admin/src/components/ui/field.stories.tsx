import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const meta = {
  title: "UI/Field",
  component: Field,
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field {...args} className="max-w-sm">
      <FieldLabel htmlFor="title">Title</FieldLabel>
      <Input id="title" placeholder="My first post" />
      <FieldDescription>Shown in the list and as the page heading.</FieldDescription>
    </Field>
  ),
};

export const WithError: Story = {
  render: (args) => (
    <Field {...args} data-invalid className="max-w-sm">
      <FieldLabel htmlFor="slug">Slug</FieldLabel>
      <Input id="slug" aria-invalid defaultValue="Not a slug!" />
      <FieldError>Use lowercase letters, digits and hyphens only.</FieldError>
    </Field>
  ),
};

export const Group: Story = {
  render: () => (
    <FieldSet className="max-w-sm">
      <FieldLegend>Languages</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox id="en" defaultChecked />
          <FieldLabel htmlFor="en">English</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="fa" />
          <FieldLabel htmlFor="fa">فارسی</FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};
