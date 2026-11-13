import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

const meta = {
  title: "UI/Toaster",
  component: Toaster,
  render: () => (
    <>
      <Toaster />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast.success("Post saved")}>Success</Button>
        <Button variant="outline" onClick={() => toast.error("Could not save the post")}>Error</Button>
        <Button variant="outline" onClick={() => toast.info("ذخیره شد")}>Persian</Button>
      </div>
    </>
  ),
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
