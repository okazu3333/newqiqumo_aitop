import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserReviewDialog } from "./user-review-dialog";

const meta = {
  title: "Surveys/Review/UserReviewDialog",
  component: UserReviewDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UserReviewDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const UserReviewDialogWrapper = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        ユーザーレビューダイアログを開く
      </Button>
      <UserReviewDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export const Default: Story = {
  args: {
    open: false,
    onOpenChange: () => {},
  },
  render: () => <UserReviewDialogWrapper />,
};

export const OpenDialog: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
  decorators: [
    (Story) => (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
