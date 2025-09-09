import type { Meta, StoryObj } from "@storybook/react";
import { SurveyCardHeader } from "./survey-card-header";

const meta = {
  title: "Components/SurveyCardHeader",
  component: SurveyCardHeader,
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
} satisfies Meta<typeof SurveyCardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    workingTitle: "00008　男性化粧品についての調査",
    currentStep: 0,
  },
};

export const Step1: Story = {
  args: {
    workingTitle: "00008　男性化粧品についての調査",
    currentStep: 1,
  },
};

export const CustomTitle: Story = {
  args: {
    title: "調査編集",
    workingTitle: "00009　女性向けファッションの調査",
    currentStep: 2,
  },
};

export const CustomWorkingTitleLabel: Story = {
  args: {
    workingTitleLabel: "編集中の調査",
    workingTitle: "00010　健康食品に関する調査",
    currentStep: 0,
  },
};

export const LongTitle: Story = {
  args: {
    workingTitle:
      "00011　若年層における環境問題への意識と行動に関する包括的調査",
    currentStep: 1,
  },
};

export const AllSteps: Story = {
  args: {
    workingTitle: "ステップ例",
    currentStep: 0,
  },
  render: () => (
    <div className="space-y-4">
      <SurveyCardHeader workingTitle="ステップ 0" currentStep={0} />
      <SurveyCardHeader workingTitle="ステップ 1" currentStep={1} />
      <SurveyCardHeader workingTitle="ステップ 2" currentStep={2} />
      <SurveyCardHeader workingTitle="ステップ 3" currentStep={3} />
    </div>
  ),
};
