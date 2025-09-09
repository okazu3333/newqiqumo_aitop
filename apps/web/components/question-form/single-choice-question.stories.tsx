import type { Meta, StoryObj } from "@storybook/react";
import { SingleChoiceQuestion } from "./single-choice-question";

const meta = {
  title: "Components/QuestionForm/SingleChoiceQuestion",
  component: SingleChoiceQuestion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[800px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SingleChoiceQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  name: "Preview Mode (No Checkbox)",
  args: {
    questionNumber: "Q1",
    questionText: "あなたの性別を教えてください。",
    options: [
      { id: 1, label: "男性" },
      { id: 2, label: "女性" },
      { id: 3, label: "その他" },
      { id: 4, label: "回答しない" },
    ],
    isFixed: true,
    isEditable: false,
  },
};

export const Edit: Story = {
  name: "Edit Mode (With Checkbox)",
  args: {
    questionNumber: "Q1",
    questionText: "あなたの性別を教えてください。",
    options: [
      { id: 1, label: "男性" },
      { id: 2, label: "女性" },
      { id: 3, label: "その他" },
      { id: 4, label: "回答しない" },
    ],
    isFixed: true,
    isEditable: true,
  },
};

export const WithoutFixedFlag: Story = {
  args: {
    questionNumber: "Q8",
    questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
    options: [
      { id: 1, label: "毎日" },
      { id: 2, label: "週に数回" },
      { id: 3, label: "月に数回" },
      { id: 4, label: "ほとんど使用しない" },
    ],
    isFixed: false,
    isEditable: false,
  },
};

export const Interactive: Story = {
  args: {
    questionNumber: "Q2",
    questionText: "好きな色を選んでください。",
    options: [
      { id: 1, label: "赤" },
      { id: 2, label: "青" },
      { id: 3, label: "緑" },
      { id: 4, label: "黄" },
      { id: 5, label: "紫" },
    ],
    isFixed: false,
    isEditable: false,
    selectedValue: "2",
    onValueChange: (value) => console.log("Selected:", value),
  },
};
