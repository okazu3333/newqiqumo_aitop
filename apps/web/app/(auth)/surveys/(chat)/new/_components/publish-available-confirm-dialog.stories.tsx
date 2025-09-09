import type { Meta, StoryObj } from "@storybook/react";
import { PublishAvailableConfirmDialog } from "./publish-available-confirm-dialog";

const meta: Meta<typeof PublishAvailableConfirmDialog> = {
  title: "Components/PublishAvailableConfirmDialog",
  component: PublishAvailableConfirmDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
    },
    onClose: { action: "close" },
    onEditSurvey: { action: "edit survey" },
    onProceedAnyway: { action: "proceed anyway" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Dialog closed"),
    onEditSurvey: () => console.log("Edit survey clicked"),
    onProceedAnyway: () => console.log("Proceed anyway clicked"),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log("Dialog closed"),
    onEditSurvey: () => console.log("Edit survey clicked"),
    onProceedAnyway: () => console.log("Proceed anyway clicked"),
  },
};
