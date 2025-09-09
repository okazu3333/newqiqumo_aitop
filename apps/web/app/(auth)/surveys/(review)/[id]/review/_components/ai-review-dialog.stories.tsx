import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AiReviewDialog } from "./ai-review-dialog";

const meta = {
  title: "Surveys/Review/AiReviewDialog",
  component: AiReviewDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AiReviewDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const AiReviewDialogWrapper = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>AIレビューダイアログを開く</Button>
      <AiReviewDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export const Default: Story = {
  args: {
    open: false,
    onOpenChange: () => {},
  },
  render: () => <AiReviewDialogWrapper />,
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

export const WithEditingOption: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "4番目の選択肢「答えたくない」が編集モードで表示されます。",
      },
    },
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

export const ScreeningTab: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "スクリーニング調査タブがアクティブな状態",
      },
    },
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
