"use client";

import { SurveyAiChat } from "@/components/survey-ai/survey-ai-chat";
import { cn } from "@/lib/utils";
import { useChatContext } from "../../../chat-context";

const ChatSlot = () => {
  const { setIsChatCollapsed } = useChatContext();

  return (
    <div className={cn("sticky top-0 h-screen")}>
      <SurveyAiChat onCollapseChange={setIsChatCollapsed} />
    </div>
  );
};

export default ChatSlot;
