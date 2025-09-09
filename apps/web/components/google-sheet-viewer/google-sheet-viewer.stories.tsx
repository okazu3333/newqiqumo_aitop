import type { Meta, StoryObj } from "@storybook/react";
import {
  GoogleSheetViewer,
  MainSurvey,
  ScreeningSurvey,
  SurveyItems,
} from "./index";

const meta = {
  title: "Components/GoogleSheetViewer",
  component: GoogleSheetViewer,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultTab: {
      control: "select",
      options: ["items", "screening", "main"],
      description: "Default tab to display",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof GoogleSheetViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story showing the integrated tabs
export const Default: Story = {
  args: {
    defaultTab: "items",
  },
};

// Story showing the survey items tab
export const SurveyItemsTab: Story = {
  args: {
    defaultTab: "items",
  },
};

// Story showing the screening survey tab
export const ScreeningSurveyTab: Story = {
  args: {
    defaultTab: "screening",
  },
};

// Story showing the main survey tab
export const MainSurveyTab: Story = {
  args: {
    defaultTab: "main",
  },
};

// Individual component stories
export const SurveyItemsOnly: StoryObj<typeof SurveyItems> = {
  render: () => (
    <div className="w-full h-[600px]">
      <SurveyItems />
    </div>
  ),
};

export const ScreeningSurveyOnly: StoryObj<typeof ScreeningSurvey> = {
  render: () => (
    <div className="w-full h-[600px]">
      <ScreeningSurvey />
    </div>
  ),
};

export const MainSurveyOnly: StoryObj<typeof MainSurvey> = {
  render: () => (
    <div className="w-full h-[600px]">
      <MainSurvey />
    </div>
  ),
};

// Story with custom styling
export const CustomStyling: Story = {
  args: {
    defaultTab: "items",
    className: "border-2 border-gray-300 rounded-lg shadow-lg",
  },
};

// Story in a container with specific dimensions
export const InContainer: Story = {
  decorators: [
    (Story) => (
      <div className="w-[1200px] h-[800px] border border-gray-200 p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    defaultTab: "items",
  },
};
