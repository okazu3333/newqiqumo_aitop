import {
  Bot,
  Check,
  ChevronsRight,
  CircleCheck,
  CirclePlus,
  HelpCircle,
  List,
  Send,
  Trash2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/app/(auth)/surveys/(chat)/chat-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { SurveyAiChatHistory } from "./survey-ai-chat-history";
import { SurveyImportDialog } from "./survey-import-dialog";

type SurveyAiChatProps = {
  onCollapseChange?: (isCollapsed: boolean) => void;
};

export const SurveyAiChat = ({ onCollapseChange }: SurveyAiChatProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    isTestRunning,
    setIsTestCompleted,
    setImportedSurveyData,
    setNewSurveyUserMessages,
    setNewSurveyAiResponses,
    newSurveyUserMessages,
    newSurveyAiResponses,
    addImportedFile,
    isProcessingFile,
    setIsProcessingFile,
  } = useChatContext();

  // Scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: xxx
  useEffect(() => {
    // Add a small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      // Find the viewport element within the ScrollArea
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport && messagesEndRef.current) {
        // Scroll the viewport to bottom
        viewport.scrollTop = viewport.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [newSurveyUserMessages, newSurveyAiResponses]);

  useEffect(() => {
    if (isTestRunning) {
      setProgress(0); // Reset progress when test starts
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isTestRunning]);

  // Separate effect to handle test completion
  useEffect(() => {
    if (progress === 100 && isTestRunning) {
      setIsTestCompleted(true);
    }
  }, [progress, isTestRunning, setIsTestCompleted]);

  const handleFileImport = async (file: File) => {
    console.log("Imported file:", file.name);

    // JSONファイルの場合の処理
    if (file.type === "application/json") {
      try {
        // ファイル処理開始
        setIsProcessingFile(true);

        // ユーザーメッセージを即座に追加（ファイル情報を含む）
        const fileSize = (file.size / 1024).toFixed(1); // KB単位
        const newUserMessage = `JSONファイル「${file.name}」（${fileSize}KB）を読み込みました。`;
        setNewSurveyUserMessages([...newSurveyUserMessages, newUserMessage]);

        // AIが考えているような遅延を追加（2秒）
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const text = await file.text();
        const data = JSON.parse(text);

        // データをコンテキストに保存
        setImportedSurveyData(data);

        // ファイル履歴に追加
        const importedFile = {
          id: Date.now().toString(),
          name: file.name,
          importedAt: new Date(),
          data: data,
        };
        addImportedFile(importedFile);

        // フォーマットされた内容を表示（ファイル情報を含む）
        const importTime = new Date().toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        const formattedContent =
          `ファイル「${file.name}」の内容を確認しました。\n` +
          `取り込み日時: ${importTime}\n\n` +
          "以下の情報をフォームに反映します：\n\n" +
          `【調査タイトル】\n${data.title || "未設定"}\n\n` +
          `【調査目的】\n${data.purpose || "未設定"}\n\n` +
          `【調査対象者条件】\n${data.targetCondition || "未設定"}\n\n` +
          `【分析対象者条件】\n${data.analysisCondition || "未設定"}\n\n` +
          `【調査手法】\n${data.researchMethod || "未設定"}\n\n` +
          `【調査規模（予算）】\n${data.researchScale || "未設定"}`;

        const newAiResponse = {
          text: formattedContent,
        };
        setNewSurveyAiResponses([...newSurveyAiResponses, newAiResponse]);
      } catch (error) {
        console.error("Failed to parse JSON file:", error);
        const errorMessage =
          "JSONファイルの読み込みに失敗しました。ファイル形式を確認してください。";
        const newAiResponse = {
          text: errorMessage,
        };
        setNewSurveyAiResponses([...newSurveyAiResponses, newAiResponse]);
      } finally {
        // ファイル処理終了
        setIsProcessingFile(false);
      }
    } else {
      // 他のファイルタイプの処理（今後実装）
      console.log("Non-JSON file processing not implemented yet");
    }
  };

  const handleChatHistorySelect = (historyId: string) => {
    console.log("Selected chat history:", historyId);
    // ここでチャット履歴の選択処理を実装
    setIsChatHistoryOpen(false);
  };

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // ユーザーメッセージを追加
    const newUserMessage = inputValue;
    setNewSurveyUserMessages([...newSurveyUserMessages, newUserMessage]);
    setInputValue("");

    // AIが応答中であることを示す
    setIsAiResponding(true);

    // 1.5秒の遅延を追加してAIが考えているような演出
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // AIレスポンスを生成
    let aiResponseText = "";

    // キーワードに基づいてレスポンスを生成
    if (newUserMessage.includes("北海道")) {
      aiResponseText =
        "調査対象条件を「北海道在住の20代男性」に更新しました。北海道は日本の最北端に位置し、独特の文化や消費行動があるため、地域を限定した調査は有意義ですね。他にも条件を追加されますか？";
    } else if (
      newUserMessage.includes("予算") ||
      newUserMessage.includes("万円")
    ) {
      aiResponseText =
        "調査規模（予算）についてのご相談ですね。予算に応じて適切なサンプルサイズや調査手法をご提案できます。具体的な金額をお教えいただければ、最適な調査設計をご提案いたします。";
    } else if (
      newUserMessage.includes("目的") ||
      newUserMessage.includes("調査")
    ) {
      aiResponseText =
        "調査目的についてのご質問ですね。明確な調査目的を設定することで、より効果的な調査設計が可能になります。どのような情報を得たいのか、具体的にお聞かせください。";
    } else {
      aiResponseText =
        "承知いたしました。ご入力いただいた内容を確認し、調査概要に反映いたします。他にも設定したい項目がございましたら、お知らせください。";
    }

    const newAiResponse = {
      text: aiResponseText,
    };
    setNewSurveyAiResponses([...newSurveyAiResponses, newAiResponse]);
    setIsAiResponding(false);
  };

  if (isCollapsed) {
    return (
      <div className="relative w-16 h-16 bg-[#138fb5] rounded-[0px_0px_0px_8px]">
        <button
          onClick={toggleCollapse}
          className="flex flex-col items-center justify-center w-full h-16 cursor-pointer"
          type="button"
        >
          <div className="flex flex-col items-center gap-0">
            <Bot className="w-6 h-6 text-white" />
            <span className="text-white text-xs font-bold">AIと話す</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[480px] h-[calc(100vh-88px)] relative">
      {/* Testing Section */}
      {isTestRunning && (
        <>
          <header className="flex w-full h-16 items-center justify-between px-6 py-0 bg-[#138fb5] flex-shrink-0">
            <div className="flex w-[212px] items-center gap-2 relative">
              <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] font-bold text-white text-base tracking-[0] leading-6 whitespace-nowrap font-bold-16">
                  テスト実施中
                </div>
              </div>
            </div>

            <button
              onClick={toggleCollapse}
              className="flex flex-col w-6 items-center justify-center relative cursor-pointer"
              type="button"
            >
              <ChevronsRight className="w-6 h-6 text-white" />
            </button>
          </header>
          <div className="w-full bg-[#f5f5f5] border-b border-gray-300 p-4 flex-shrink-0">
            <div className="mb-2">
              <p className="text-center text-lg font-bold text-gray-800">
                テスト実施中
              </p>
            </div>
            <div className="flex justify-center items-center">
              <div className="relative w-24 h-24">
                <svg
                  className="transform -rotate-90 w-24 h-24"
                  aria-label="Progress circle"
                >
                  <title>Progress circle</title>
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="#e0e0e0"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="#138fb5"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                    className="transition-all duration-100 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">
                    {progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Header */}
      <header className="flex w-full h-16 items-center justify-between px-6 py-0 bg-[#138fb5] flex-shrink-0">
        <div className="flex w-[212px] items-center gap-2 relative">
          <Bot className="w-6 h-6 text-white" />
          <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] font-bold text-white text-base tracking-[0] leading-6 whitespace-nowrap font-bold-16">
              調査AI
            </div>

            <div className="inline-flex items-center pt-0.5 pb-0 px-0 relative self-stretch flex-[0_0_auto]">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <button
          onClick={toggleCollapse}
          className="flex flex-col w-6 items-center justify-center relative cursor-pointer"
          type="button"
        >
          <ChevronsRight className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* Chat Messages Area */}
      <ScrollArea
        ref={scrollAreaRef}
        className={`flex-1 w-full bg-gray-50 py-2 ${isTestRunning && isChatHistoryOpen ? "h-[calc(100%-336px)]" : ""}`}
      >
        <div className="relative w-full -top-2">
          {/* First AI Message with File Upload Button */}
          {newSurveyAiResponses.length > 0 && (
            <div className="flex items-start mb-4">
              <Bot className="w-6 h-6 mt-4 ml-3 mr-1 text-[#138fb5]" />
              <Card className="max-w-[340px] bg-white rounded-[20px_20px_20px_0px] border-[#d0cfcf]">
                <CardContent className="p-4">
                  <p className="text-fontdefault text-sm font-medium leading-6 whitespace-pre-wrap">
                    {newSurveyAiResponses[0].text}
                  </p>
                  {/* Show button only if first message mentions file upload */}
                  {newSurveyAiResponses[0].text.includes("ファイル") && (
                    <Button
                      className="mt-4 w-[236px] h-8 rounded-3xl bg-[#138fb5] hover:bg-[#0f7a9b] text-white text-xs font-bold"
                      onClick={() => setIsImportDialogOpen(true)}
                    >
                      <CirclePlus className="w-4 h-4 mr-1" />
                      調査概要をファイルから読み込む
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Message pairs - map through data */}
          {newSurveyUserMessages.map((message, index) => (
            <React.Fragment key={`message-${index}`}>
              {/* User Message */}
              <div className="flex justify-end px-6 mb-4">
                <div className="max-w-[340px] px-4 py-2 bg-[#ffe9a3] rounded-[20px_20px_2px_20px]">
                  <p className="text-black-1000 text-sm font-medium leading-6">
                    {message}
                  </p>
                </div>
              </div>

              {/* AI Response */}
              {newSurveyAiResponses[index + 1] && (
                <div className="flex flex-col mb-4">
                  <div className="flex items-start">
                    <Bot className="w-6 h-6 mt-4 ml-3 mr-1 text-[#138fb5]" />
                    <Card className="max-w-[340px] w-[321px] bg-white rounded-[20px_20px_20px_2px] border-[#dcdcdc]">
                      <CardContent className="p-4">
                        <p className="text-fontdefault text-sm font-medium leading-6 whitespace-pre-wrap">
                          {newSurveyAiResponses[index + 1].text}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  {newSurveyAiResponses[index + 1].suggestions && (
                    <div className="ml-10 mt-2 space-y-2">
                      {newSurveyAiResponses[index + 1].suggestions?.map(
                        (suggestion, suggestionIndex) => (
                          <div
                            key={suggestionIndex}
                            className="bg-[#e7ecf0] rounded-lg p-3 flex flex-col gap-1 max-w-[340px]"
                          >
                            <div className="flex items-center gap-1.5 w-full">
                              <div className="w-6 h-6 bg-white rounded flex items-center justify-center flex-shrink-0">
                                {suggestion.type === "add" ? (
                                  <Check className="w-5 h-5 text-[#4bbc80]" />
                                ) : (
                                  <Trash2 className="w-5 h-5 text-[#d96868]" />
                                )}
                              </div>
                              <span className="font-bold text-[#333333] text-sm leading-[1.714] font-['Noto_Sans_JP']">
                                【{suggestion.section}】
                                {suggestion.type === "add"
                                  ? "に追加"
                                  : "から削除"}
                              </span>
                            </div>
                            <p className="font-bold text-[#333333] text-xs leading-[2] font-['Noto_Sans_JP'] ml-0">
                              {suggestion.text}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}

          {/* ファイル処理中のローディングUI */}
          {isProcessingFile && (
            <div className="flex items-start mb-4">
              <Bot className="w-6 h-6 mt-4 ml-3 mr-1 text-[#138fb5]" />
              <Card className="max-w-[340px] bg-white rounded-[20px_20px_20px_0px] border-[#d0cfcf]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-[#138fb5] rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-[#138fb5] rounded-full animate-bounce"
                        style={{ animationDelay: "200ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-[#138fb5] rounded-full animate-bounce"
                        style={{ animationDelay: "400ms" }}
                      />
                    </div>
                    <p className="text-fontdefault text-sm font-medium leading-6">
                      ファイルを分析しています...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI応答中のローディングUI */}
          {isAiResponding && (
            <div className="flex items-start mb-4">
              <Bot className="w-6 h-6 mt-4 ml-3 mr-1 text-[#138fb5]" />
              <Card className="max-w-[340px] bg-white rounded-[20px_20px_20px_0px] border-[#d0cfcf]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-[#138fb5] rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-[#138fb5] rounded-full animate-bounce"
                        style={{ animationDelay: "200ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-[#138fb5] rounded-full animate-bounce"
                        style={{ animationDelay: "400ms" }}
                      />
                    </div>
                    <p className="text-fontdefault text-sm font-medium leading-6">
                      考えています...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="relative w-full h-[170px] bg-[#138fb5] rounded-[0px_0px_0px_8px] shadow-main-bg flex-shrink-0">
        <div className="flex flex-wrap w-full items-start gap-[10px_42px] px-6 py-4">
          {/* Input Field with Send Button */}

          <div className="flex items-center gap-4 w-full">
            <Textarea
              className="w-full h-16 min-h-16 bg-areawhite rounded-lg shadow-shadow-default px-4 py-1.5 pr-12 text-fontdefault text-base font-medium leading-6 resize-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="メッセージを入力してください..."
              rows={2}
            />
            <Button
              className="w-9 h-[38.49px] bg-[#484848] hover:bg-[#333333] rounded-full p-0 flex items-center justify-center"
              type="button"
              onClick={handleSendMessage}
              disabled={isAiResponding || !inputValue.trim()}
            >
              <Send className="w-[14px] h-[14px] text-white" />
            </Button>
          </div>

          {/* File Upload Button */}
          <Button
            variant="outline"
            className="w-[236px] h-8 bg-white rounded-3xl text-[#138fb5] text-xs font-bold hover:bg-gray-100 hover:text-[#138fb5]"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <CirclePlus className="w-8 h-8 text-[#138fb5]" />
            調査概要をファイルから読み込む
          </Button>
        </div>

        {/* Chat History Button */}
        <div className="absolute bottom-0 left-0 w-full h-8">
          <Button
            className="w-full h-8 bg-[#484848] hover:bg-[#3a3a3a] rounded-[0px_0px_0px_8px] justify-start"
            onClick={() => setIsChatHistoryOpen(true)}
          >
            <List className="w-4 h-4 mr-2" />
            <span className="text-white text-xs font-medium leading-6">
              チャット履歴を確認
            </span>
          </Button>
        </div>
      </div>

      {/* Survey Import Dialog */}
      <SurveyImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onFileImport={handleFileImport}
      />

      {/* Chat History Panel */}
      {isChatHistoryOpen && (
        <div className="absolute inset-0 z-40">
          {/* Testing Section for Chat History */}
          {isTestRunning && (
            <>
              <header className="flex w-full h-16 items-center justify-between px-6 py-0 bg-[#138fb5] flex-shrink-0">
                <div className="flex w-[212px] items-center gap-2 relative">
                  <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                    <div className="relative w-fit mt-[-1.00px] font-bold text-white text-base tracking-[0] leading-6 whitespace-nowrap font-bold-16">
                      テスト実施中
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleCollapse}
                  className="flex flex-col w-6 items-center justify-center relative cursor-pointer"
                  type="button"
                >
                  <ChevronsRight className="w-6 h-6 text-white" />
                </button>
              </header>
              <div className="w-full bg-[#f5f5f5] border-b border-gray-300 p-4 flex-shrink-0">
                <div className="mb-2">
                  {progress === 100 ? (
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-lg font-bold text-gray-800">
                        テストが完了しました！
                      </p>
                      <CircleCheck className="w-8 h-8 text-[#138fb5]" />
                      <p className="text-lg font-bold text-gray-800">100%</p>
                    </div>
                  ) : (
                    <p className="text-center text-lg font-bold text-gray-800">
                      テスト実施中
                    </p>
                  )}
                </div>
                {progress < 100 && (
                  <div className="flex justify-center items-center">
                    <div className="relative w-24 h-24">
                      <svg
                        className="transform -rotate-90 w-24 h-24"
                        aria-label="Progress circle"
                      >
                        <title>Progress circle</title>
                        <circle
                          cx="48"
                          cy="48"
                          r="36"
                          stroke="#e0e0e0"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="36"
                          stroke="#138fb5"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 36}`}
                          strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                          className="transition-all duration-100 ease-linear"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-800">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          <div
            className={`absolute inset-0 ${isTestRunning ? "top-[216px]" : ""}`}
          >
            <SurveyAiChatHistory
              isOpen={isChatHistoryOpen}
              onClose={() => setIsChatHistoryOpen(false)}
              onSelectHistory={handleChatHistorySelect}
              hasTestingSection={isTestRunning}
            />
          </div>
        </div>
      )}
    </div>
  );
};
