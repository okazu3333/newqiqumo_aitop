import type { Meta, StoryObj } from "@storybook/react";
import { TextQuestion } from "./text-question";

const meta = {
  title: "Components/QuestionForm/TextQuestion",
  component: TextQuestion,
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
} satisfies Meta<typeof TextQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    questionNumber: "Q12",
    questionText: "化粧品を選ぶ際に重視するポイントを教えてください。",
    placeholder: "自由にご記入ください",
    isFixed: false,
    isEditable: false,
    isMultiline: false,
  },
};

export const Edit: Story = {
  args: {
    questionNumber: "Q12",
    questionText: "化粧品を選ぶ際に重視するポイントを教えてください。",
    placeholder: "自由にご記入ください",
    isFixed: false,
    isEditable: true,
    isMultiline: false,
  },
};

export const Multiline: Story = {
  args: {
    questionNumber: "Q13",
    questionText:
      "現在使用している化粧品について、改善してほしい点があれば詳しく教えてください。",
    placeholder: "できるだけ詳しくご記入ください",
    isFixed: false,
    isEditable: false,
    isMultiline: true,
  },
};

export const WithValue: Story = {
  args: {
    questionNumber: "Q14",
    questionText: "お住まいの地域を教えてください。",
    placeholder: "例：東京都渋谷区",
    isFixed: false,
    isEditable: false,
    isMultiline: false,
    value: "東京都新宿区",
  },
};

export const Interactive: Story = {
  args: {
    questionNumber: "Q15",
    questionText: "その他、ご意見・ご要望があればお聞かせください。",
    placeholder: "ご自由にお書きください",
    isFixed: false,
    isEditable: false,
    isMultiline: true,
    value: "",
    onValueChange: (value) => console.log("Text changed:", value),
  },
};
