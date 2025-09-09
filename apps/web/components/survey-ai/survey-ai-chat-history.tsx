import { ChevronDown, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatHistoryItem = {
  id: string;
  type: "本調査" | "SC調査";
  description: string;
};

const mockChatHistory: ChatHistoryItem[] = [
  {
    id: "1",
    type: "本調査",
    description: "化粧品を使用するきっかけを追加",
  },
  {
    id: "2",
    type: "SC調査",
    description: "化粧品を使用するきっかけを追加",
  },
  {
    id: "3",
    type: "本調査",
    description: "化粧品を使用するきっかけを追加",
  },
  {
    id: "4",
    type: "本調査",
    description: "化粧品を使用するきっかけを追加",
  },
  {
    id: "5",
    type: "本調査",
    description: "化粧品を使用するきっかけを追加",
  },
];

type SurveyAiChatHistoryProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistory?: (historyId: string) => void;
  hasTestingSection?: boolean;
};

export const SurveyAiChatHistory = ({
  isOpen,
  onClose,
  onSelectHistory,
  hasTestingSection = false,
}: SurveyAiChatHistoryProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-[#ffffff] shadow-[-4px_0px_12px_0px_rgba(0,0,0,0.04)] rounded-[0px_0px_0px_8px] z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-0 h-16 bg-[#138FB5]">
        <div className="flex items-center gap-2">
          <List className="w-6 h-6 text-white" />
          <span className="text-white text-base font-bold">
            チャット履歴を確認
          </span>
        </div>
        <Button
          onClick={onClose}
          className="w-8 h-8 bg-white hover:bg-gray-100 rounded-full p-0 flex items-center justify-center shadow-[0px_0px_8px_0px_rgba(0,0,0,0.08)]"
          type="button"
        >
          <X className="w-4 h-4 text-[#0098C7] stroke-[#138FB5]" />
        </Button>
      </div>

      {/* Chat History List */}
      <ScrollArea
        className={`flex-1 ${hasTestingSection ? "h-[calc(100vh-368px)]" : "h-[calc(100vh-152px)]"}`}
      >
        <div className="px-6 py-0">
          {mockChatHistory.map((item, index) => (
            <button
              key={item.id}
              className={`flex items-center justify-between border-b border-[#DCDCDC] py-3 cursor-pointer hover:bg-white/50 w-full text-left ${
                index === 0 ? "opacity-80" : ""
              }`}
              onClick={() => onSelectHistory?.(item.id)}
              type="button"
            >
              <div className="flex items-center gap-1 flex-1">
                <span className="text-[#333333] text-sm font-medium w-20 flex-shrink-0">
                  【{item.type}】
                </span>
                <span className="text-[#333333] text-sm font-medium">
                  {item.description}
                </span>
              </div>
              <div className="flex items-center justify-center w-6 h-6 p-1">
                <ChevronDown className="w-4 h-4 text-[#333333]" />
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
