import type { Meta, StoryObj } from "@storybook/react";
import { MultipleChoiceQuestion } from "./multiple-choice-question";

const meta = {
  title: "Components/QuestionForm/MultipleChoiceQuestion",
  component: MultipleChoiceQuestion,
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
} satisfies Meta<typeof MultipleChoiceQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    questionNumber: "Q5",
    questionText: "あなたと同居している方をお知らせください。",
    options: [
      { id: 1, label: "自分のみ（一人暮らし）" },
      { id: 2, label: "配偶者" },
      { id: 3, label: "こども（未就学児）" },
      { id: 4, label: "こども（小学生）" },
      { id: 5, label: "こども（中高生）" },
      { id: 6, label: "こども（高校生を除く18歳以上）" },
      { id: 7, label: "自分（配偶者）の親" },
      { id: 8, label: "自分（配偶者）の兄弟姉妹" },
      { id: 9, label: "自分（配偶者）の祖父母" },
      { id: 10, label: "その他" },
    ],
    isFixed: false,
    isEditable: false,
  },
};

export const Edit: Story = {
  args: {
    questionNumber: "Q5",
    questionText: "あなたと同居している方をお知らせください。",
    options: [
      { id: 1, label: "自分のみ（一人暮らし）" },
      { id: 2, label: "配偶者" },
      { id: 3, label: "こども（未就学児）" },
      { id: 4, label: "こども（小学生）" },
    ],
    isFixed: false,
    isEditable: true,
  },
};

export const WithSelectedValues: Story = {
  args: {
    questionNumber: "Q9",
    questionText: "あなたが使用している化粧品の種類を教えてください。",
    options: [
      { id: 1, label: "スキンケア用品" },
      { id: 2, label: "洗顔料" },
      { id: 3, label: "ヘアケア用品" },
      { id: 4, label: "香水・フレグランス" },
      { id: 5, label: "日焼け止め" },
    ],
    isFixed: false,
    isEditable: false,
    selectedValues: ["1", "2", "5"],
  },
};

export const Interactive: Story = {
  args: {
    questionNumber: "Q3",
    questionText: "趣味を選んでください（複数選択可）。",
    options: [
      { id: 1, label: "読書" },
      { id: 2, label: "映画鑑賞" },
      { id: 3, label: "スポーツ" },
      { id: 4, label: "音楽" },
      { id: 5, label: "旅行" },
      { id: 6, label: "料理" },
    ],
    isFixed: false,
    isEditable: false,
    selectedValues: ["1", "3"],
    onValuesChange: (values) => console.log("Selected values:", values),
  },
};
