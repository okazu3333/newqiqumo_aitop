import type { Meta, StoryObj } from "@storybook/react";
import { QuestionForm } from "./question-form";

const meta: Meta<typeof QuestionForm> = {
  title: "Form/QuestionForm",
  component: QuestionForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Single Choice with few options (Radio Buttons)
export const SingleChoiceFewOptions: Story = {
  args: {
    type: "SA",
    questionNumber: "Q1",
    questionText: "あなたの性別を教えてください。",
    options: [
      { id: "1", label: "男性" },
      { id: "2", label: "女性" },
      { id: "3", label: "その他" },
    ],
    isFixed: true,
    isEditable: false,
  },
};

// Single Choice with many options (Select Dropdown)
export const SingleChoiceManyOptions: Story = {
  args: {
    type: "SA",
    questionNumber: "Q2",
    questionText: "お住まいの都道府県を選択してください。",
    options: [
      { id: "1", label: "北海道" },
      { id: "2", label: "青森県" },
      { id: "3", label: "岩手県" },
      { id: "4", label: "宮城県" },
      { id: "5", label: "秋田県" },
      { id: "6", label: "山形県" },
      { id: "7", label: "福島県" },
      { id: "8", label: "茨城県" },
      { id: "9", label: "栃木県" },
      { id: "10", label: "群馬県" },
      { id: "11", label: "埼玉県" },
      { id: "12", label: "千葉県" },
      { id: "13", label: "東京都" },
      { id: "14", label: "神奈川県" },
      { id: "15", label: "新潟県" },
      { id: "16", label: "富山県" },
      { id: "17", label: "石川県" },
      { id: "18", label: "福井県" },
      { id: "19", label: "山梨県" },
      { id: "20", label: "長野県" },
    ],
    isFixed: false,
    isEditable: false,
  },
};

// Single Choice Editable Mode
export const SingleChoiceEditable: Story = {
  args: {
    type: "SA",
    questionNumber: "Q3",
    questionText: "好きな色を選んでください。",
    options: [
      { id: "1", label: "赤" },
      { id: "2", label: "青" },
      { id: "3", label: "緑" },
    ],
    isEditable: true,
  },
};

// Multiple Choice
export const MultipleChoice: Story = {
  args: {
    type: "MA",
    questionNumber: "Q4",
    questionText: "あなたと同居している方をお知らせください。",
    options: [
      { id: "1", label: "自分のみ（一人暮らし）" },
      { id: "2", label: "配偶者" },
      { id: "3", label: "こども（未就学児）" },
      { id: "4", label: "こども（小学生）" },
      { id: "5", label: "こども（中高生）" },
    ],
    isFixed: false,
    isEditable: false,
  },
};

// Multiple Choice Editable Mode
export const MultipleChoiceEditable: Story = {
  args: {
    type: "MA",
    questionNumber: "Q5",
    questionText: "使用している化粧品の種類を選んでください。",
    options: [
      { id: "1", label: "洗顔料" },
      { id: "2", label: "化粧水" },
      { id: "3", label: "乳液" },
    ],
    isEditable: true,
  },
};

// Numeric Question
export const NumericQuestion: Story = {
  args: {
    type: "NU",
    questionNumber: "Q6",
    questionText: "あなたの年齢を教えてください。",
    suffix: "歳",
    min: 0,
    max: 120,
    isFixed: true,
    isEditable: false,
  },
};

// Numeric Question Editable Mode
export const NumericQuestionEditable: Story = {
  args: {
    type: "NU",
    questionNumber: "Q7",
    questionText: "身長を入力してください。",
    suffix: "cm",
    isEditable: true,
  },
};

// Text Question - Single Line
export const TextQuestionSingleLine: Story = {
  args: {
    type: "FA",
    questionNumber: "Q8",
    questionText: "ご意見・ご感想をお聞かせください。",
    placeholder: "ここに入力してください",
    isMultiline: false,
    isFixed: false,
    isEditable: false,
  },
};

// Text Question - Multiple Lines
export const TextQuestionMultiLine: Story = {
  args: {
    type: "FA",
    questionNumber: "Q9",
    questionText: "詳細なフィードバックをお聞かせください。",
    placeholder: "詳しくご記入ください",
    isMultiline: true,
    isFixed: false,
    isEditable: false,
  },
};

// Text Question Editable Mode
export const TextQuestionEditable: Story = {
  args: {
    type: "FA",
    questionNumber: "Q10",
    questionText: "その他ご意見",
    placeholder: "自由にご記入ください",
    isEditable: true,
  },
};

// Interactive Example - Single Choice
export const InteractiveSingleChoice: Story = {
  args: {
    type: "SA",
    questionNumber: "Q11",
    questionText: "満足度を教えてください。",
    options: [
      { id: "1", label: "非常に満足" },
      { id: "2", label: "満足" },
      { id: "3", label: "どちらでもない" },
      { id: "4", label: "不満" },
      { id: "5", label: "非常に不満" },
    ],
    isFixed: false,
    isEditable: false,
    onValueChange: (value) => {
      console.log("Selected value:", value);
    },
  },
};

// Interactive Example - Multiple Choice
export const InteractiveMultipleChoice: Story = {
  args: {
    type: "MA",
    questionNumber: "Q12",
    questionText: "興味のある分野を選択してください。",
    options: [
      { id: "1", label: "スポーツ" },
      { id: "2", label: "音楽" },
      { id: "3", label: "映画" },
      { id: "4", label: "読書" },
      { id: "5", label: "料理" },
      { id: "6", label: "旅行" },
    ],
    isFixed: false,
    isEditable: false,
    onValueChange: (values) => {
      console.log("Selected values:", values);
    },
  },
};
