import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { SurveyAiChat } from "./survey-ai-chat";

const meta: Meta<typeof SurveyAiChat> = {
  title: "Survey AI/Chat",
  component: SurveyAiChat,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  render: () => {
    // Create a version with empty messages for demonstration
    const EmptyChatComponent = () => {
      return (
        <div className="h-screen flex flex-col bg-gray-100">
          {/* Header */}
          <div className="bg-[#138fb5] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-[#138fb5] text-xs">💬</span>
              </div>
              <h1 className="text-xl font-semibold">調査AI</h1>
              <div className="bg-white text-[#138fb5] text-xs px-2 py-1 rounded">
                β
              </div>
              <div className="w-5 h-5 text-white">❓</div>
            </div>
            <div className="w-6 h-6 text-white">➡️</div>
          </div>

          {/* Empty Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">チャットを開始してください</p>
              <p className="text-sm">調査に関する質問を入力してください</p>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-[#138fb5] p-4 space-y-3">
            <div className="flex gap-2">
              <input
                placeholder="調査について質問してください..."
                className="flex-1 p-3 rounded-lg border-0 text-gray-800 placeholder-gray-500"
              />
              <Button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full"
              >
                ➤
              </Button>
            </div>

            <Button
              type="button"
              className="w-full bg-white text-[#138fb5] hover:bg-gray-50 p-3 rounded-lg flex items-center justify-center gap-2"
            >
              <span>➕</span>
              調査概要をファイルから読み込む
            </Button>
          </div>

          {/* Footer */}
          <div className="bg-gray-600 text-white p-3">
            <Button
              type="button"
              className="w-full text-white hover:bg-gray-500 p-2 rounded flex items-center gap-2"
            >
              <span>📋</span>
              チャット履歴を確認
            </Button>
          </div>
        </div>
      );
    };

    return <EmptyChatComponent />;
  },
};
