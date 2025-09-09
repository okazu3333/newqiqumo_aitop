"use client";

import { usePathname } from "next/navigation";
import { createContext, type ReactNode, useContext, useState } from "react";

type ChatState = {
  [path: string]: boolean;
};

export type AiResponse = {
  text: string;
  suggestions?: {
    text: string;
    type: "add" | "delete";
    section: "本調査設問" | "スクリーニング設問";
  }[];
};

type SurveyImportData = {
  title?: string;
  purpose?: string;
  targetCondition?: string;
  analysisCondition?: string;
  researchMethod?: string;
  researchScale?: string;
};

type ImportedFile = {
  id: string;
  name: string;
  importedAt: Date;
  data: SurveyImportData;
};

type ChatContextType = {
  isChatCollapsed: boolean;
  setIsChatCollapsed: (collapsed: boolean) => void;
  isTestRunning: boolean;
  isTestCompleted: boolean;
  startTest: () => void;
  setIsTestCompleted: (completed: boolean) => void;
  newSurveyUserMessages: string[];
  setNewSurveyUserMessages: (messages: string[]) => void;
  newSurveyAiResponses: AiResponse[];
  setNewSurveyAiResponses: (responses: AiResponse[]) => void;
  importedSurveyData: SurveyImportData | null;
  setImportedSurveyData: (data: SurveyImportData | null) => void;
  importedFiles: ImportedFile[];
  addImportedFile: (file: ImportedFile) => void;
  isProcessingFile: boolean;
  setIsProcessingFile: (processing: boolean) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

type ChatProviderProps = {
  children: ReactNode;
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const pathname = usePathname();
  const [chatStates, setChatStates] = useState<ChatState>({});
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [newSurveyUserMessages, setNewSurveyUserMessages] = useState<string[]>(
    [],
  );
  const [newSurveyAiResponses, setNewSurveyAiResponses] = useState<
    AiResponse[]
  >([
    {
      text: "まずは調査概要を設定しましょう！\n今回の調査の情報を教えてください。調査概要をJSONファイルで用意している場合は、その情報を基にAIで自動入力・設定できます。\n例：(具体的なサービス名)の使用率",
    },
  ]);
  const [importedSurveyData, setImportedSurveyData] =
    useState<SurveyImportData | null>(null);
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const isChatCollapsed = chatStates[pathname] ?? false;

  const setIsChatCollapsed = (collapsed: boolean) => {
    setChatStates((prev) => ({
      ...prev,
      [pathname]: collapsed,
    }));
  };

  const startTest = () => {
    setIsTestRunning(true);
    setIsTestCompleted(false);
  };

  const addImportedFile = (file: ImportedFile) => {
    setImportedFiles((prev) => [...prev, file]);
  };

  return (
    <ChatContext.Provider
      value={{
        isChatCollapsed,
        setIsChatCollapsed,
        isTestRunning,
        isTestCompleted,
        startTest,
        setIsTestCompleted,
        newSurveyUserMessages,
        setNewSurveyUserMessages,
        newSurveyAiResponses,
        setNewSurveyAiResponses,
        importedSurveyData,
        setImportedSurveyData,
        importedFiles,
        addImportedFile,
        isProcessingFile,
        setIsProcessingFile,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
