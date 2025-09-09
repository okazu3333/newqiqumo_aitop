"use client";

import { ChatProvider, useChatContext } from "./chat-context";

type SurveysLayoutProps = {
  children: React.ReactNode;
  chat: React.ReactNode;
};

const SurveysLayoutContent = ({ children, chat }: SurveysLayoutProps) => {
  const { isChatCollapsed } = useChatContext();

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="w-full py-6 px-4">
        <div className={
          isChatCollapsed
            ? "flex gap-4 w-full"
            : "flex gap-4 max-w-[1440px] mx-auto"
        }>
          <div
            className={`flex flex-col transition-all duration-300 ${
              isChatCollapsed ? "w-full" : "w-[calc(100%-500px)]"
            }`}
          >
            {children}
          </div>
          {chat}
        </div>
      </main>
    </div>
  );
};

const SurveysLayout = ({ children, chat }: SurveysLayoutProps) => {
  return (
    <ChatProvider>
      <SurveysLayoutContent chat={chat}>{children}</SurveysLayoutContent>
    </ChatProvider>
  );
};

export default SurveysLayout;
