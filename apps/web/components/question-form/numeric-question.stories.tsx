import type { Meta, StoryObj } from "@storybook/react";
import { NumericQuestion } from "./numeric-question";

const meta = {
  title: "Components/QuestionForm/NumericQuestion",
  component: NumericQuestion,
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
} satisfies Meta<typeof NumericQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    questionNumber: "Q2",
    questionText: "あなたの年齢を教えてください。",
    suffix: "歳",
    isFixed: true,
    isEditable: false,
  },
};

export const Edit: Story = {
  args: {
    questionNumber: "Q2",
    questionText: "あなたの年齢を教えてください。",
    suffix: "歳",
    isFixed: true,
    isEditable: true,
  },
};

export const WithValue: Story = {
  args: {
    questionNumber: "Q10",
    questionText: "1ヶ月あたりの化粧品にかける金額を教えてください。",
    suffix: "円",
    isFixed: false,
    isEditable: false,
    value: "5000",
  },
};

export const WithRange: Story = {
  args: {
    questionNumber: "Q11",
    questionText: "週に何回スポーツをしますか？",
    suffix: "回",
    isFixed: false,
    isEditable: false,
    min: 0,
    max: 7,
  },
};

export const Interactive: Story = {
  args: {
    questionNumber: "Q4",
    questionText: "身長を入力してください。",
    suffix: "cm",
    isFixed: false,
    isEditable: false,
    value: "170",
    onValueChange: (value) => console.log("Value changed:", value),
  },
};
