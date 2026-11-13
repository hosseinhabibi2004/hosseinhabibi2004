import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs defaultValue="en" {...args}>
      <TabsList aria-label="Language">
        <TabsTrigger value="en">English</TabsTrigger>
        <TabsTrigger value="fa">فارسی</TabsTrigger>
      </TabsList>
      <TabsContent value="en">English content</TabsContent>
      <TabsContent value="fa">محتوای فارسی</TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: (args) => (
    <Tabs defaultValue="general" {...args}>
      <TabsList aria-label="Sections">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="history" disabled>History</TabsTrigger>
      </TabsList>
      <TabsContent value="general">General settings</TabsContent>
      <TabsContent value="seo">SEO settings</TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <Tabs defaultValue="a" {...args}>
      <TabsList aria-label="Sections">
        <TabsTrigger value="a">First</TabsTrigger>
        <TabsTrigger value="b">Second</TabsTrigger>
      </TabsList>
      <TabsContent value="a">First panel</TabsContent>
      <TabsContent value="b">Second panel</TabsContent>
    </Tabs>
  ),
};
