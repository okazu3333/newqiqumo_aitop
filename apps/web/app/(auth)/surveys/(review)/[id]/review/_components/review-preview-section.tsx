"use client";

import { Copy, MessageCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Comment } from "@/app/(auth)/surveys/(review)/[id]/review/_components/comment";
import { QuestionForm, type QuestionType } from "@/components/question-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/trpc/react";
import { toast } from "sonner";

type ReviewItem = {
  id: number;
  questionNo: string;
  type: string;
  reviewerName: string;
  time: string;
  comment: string;
  status: "unresolved" | "resolved";
  reviewType: "ai" | "team";
  replies?: number;
};

type QuestionFormData = Record<string, string | string[] | undefined>;

type TabType = "share" | "design" | "all" | "screening" | "main";

// Tab Selection Component
const TabSelectionSection = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) => {
  const tabItems = [
    { id: "share" as TabType, label: "レビュー共有" },
    { id: "design" as TabType, label: "調査設計" },
    { id: "all" as TabType, label: "調査全体" },
    { id: "screening" as TabType, label: "スクリーニング調査" },
    { id: "main" as TabType, label: "本調査" },
  ];

  return (
    <div className="px-6">
      <div className="flex items-center gap-2">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`w-53 h-10 rounded-[8px_8px_0px_0px] px-8 py-2 flex items-center justify-center cursor-pointer transition-colors ${
              activeTab === tab.id
                ? "bg-[#138FB5] text-white font-bold text-base"
                : "bg-white text-[#138FB5] font-medium text-base border-t-2 border-r-2 border-l-2 border-[#138FB5] hover:bg-gray-50"
            }`}
          >
            <span className="text-center leading-6 font-['Noto_Sans_JP']">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

type ReviewPreviewSectionProps = {
  userType?: "reviewer" | "reviewee";
};

export const ReviewPreviewSection = ({
  userType = "reviewee",
}: ReviewPreviewSectionProps) => {
  const params = useParams();
  const surveyId = Number(params.id);
  
  // Debug logging
  console.log("Params:", params);
  console.log("SurveyId:", surveyId);
  console.log("SurveyId type:", typeof surveyId);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [expandedCommentId, setExpandedCommentId] = useState<number | null>(
    null,
  );
  const [hoveredQuestionId, setHoveredQuestionId] = useState<number | null>(
    null,
  );
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showIcon, setShowIcon] = useState(false);
  const [threadFormOpen, setThreadFormOpen] = useState(false);
  const [threadFormData, setThreadFormData] = useState<{
    questionId: number;
    x: number;
    y: number;
  } | null>(null);
  const [threadMessage, setThreadMessage] = useState("");
  const questionRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { handleSubmit, watch, setValue } = useForm<QuestionFormData>({
    defaultValues: {},
  });

  // Fetch survey overview
  console.log("Calling survey.getById with:", { id: surveyId });
  const { data: survey } = api.survey.getById.useQuery(
    { id: surveyId },
    { enabled: !isNaN(surveyId) && surveyId > 0 }
  );

  // Review share settings (URL, password, expiry)
  const [isEditingShare] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [shareExpiresAt, setShareExpiresAt] = useState("");
  const { data: reviewAccess } =
    api.reviewAccess.getBySurveyId.useQuery(
      { surveyId },
      { enabled: !isNaN(surveyId) && surveyId > 0 }
    );
  // Share mutation disabled in preview; inputs are read-only
  // const { mutate: upsertReviewAccess, isPending: isSavingShare } =
  //   api.reviewAccess.upsert.useMutation({
  //     onSuccess: () => {
  //       toast("レビューアクセス情報を保存しました");
  //       setIsEditingShare(false);
  //       refetchReviewAccess();
  //     },
  //     onError: (error) => toast.error(`エラー: ${error.message}`),
  //   });

  useEffect(() => {
    if (reviewAccess) {
      setSharePassword(reviewAccess.password);
      setShareExpiresAt(
        new Date(reviewAccess.expiresAt).toISOString().slice(0, 16),
      );
    } else {
      setSharePassword("review123");
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setShareExpiresAt(d.toISOString().slice(0, 16));
    }
  }, [reviewAccess]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const reviewUrl = `${origin}/surveys/${surveyId}/review/reviewer/login`;
  const answerUrl = `${origin}/surveys/preview/${surveyId}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast(`${label}をコピーしました`);
  };

  // Fetch questions from tRPC
  const { data: sections, isLoading: sectionsLoading } =
    api.question.listBySurvey.useQuery(
      { surveyId },
      { enabled: !isNaN(surveyId) && surveyId > 0 }
    );


  // Fetch threads from tRPC
  const {
    data: threads,
    isLoading: threadsLoading,
    refetch: refetchThreads,
  } = api.thread.list.useQuery(
    { surveyId },
    { enabled: !isNaN(surveyId) && surveyId > 0 }
  );


  // Build effective threads (fallback to dummy when none)
  const allQuestions: any[] = (sections || []).flatMap((s: any) => s.questions || []);
  const dummyTargets: number[] = [allQuestions[0]?.id, allQuestions[1]?.id].filter(Boolean);
  const effectiveThreads: any[] =
    threads && threads.length > 0
      ? threads
      : dummyTargets.map((qid, idx) => ({
          id: -100 - idx,
          questionId: qid,
          question: { code: allQuestions.find((q: any) => q.id === qid)?.code || `Q${idx + 1}` },
          type: idx === 0 ? "ai" : "team",
          createdBy: idx === 0 ? "AIレビュー" : "レビュアーA",
          message:
            idx === 0
              ? "設問文が長い可能性があります。簡潔にしましょう。"
              : "選択肢の網羅性に漏れがないか再確認をお願いします。",
          createdAt: new Date().toISOString(),
          isCompleted: false,
          x: idx === 0 ? 25 : 60,
          y: idx === 0 ? 40 : 30,
          reviews: [],
        }));

  // Create thread mutation
  const createThreadMutation = api.thread.create.useMutation({
    onSuccess: () => {
      refetchThreads();
      setThreadFormOpen(false);
      setThreadMessage("");
      setThreadFormData(null);
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    console.log("Form submitted:", data);
  };

  const handleCommentIconClick = (e: React.MouseEvent, questionId: number) => {
    const questionEl = questionRefs.current.get(questionId);
    if (!questionEl) return;

    const rect = questionEl.getBoundingClientRect();
    const scrollContainer = questionEl.closest(".scroll-container");
    const containerRect = scrollContainer?.getBoundingClientRect();

    if (!containerRect) return;

    // Calculate position relative to the question element
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setThreadFormData({
      questionId,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
    setThreadFormOpen(true);
  };

  const handleCreateThread = async () => {
    if (!threadFormData || !threadMessage.trim()) return;

    await createThreadMutation.mutateAsync({
      questionId: threadFormData.questionId,
      message: threadMessage,
      type: "team",
      x: threadFormData.x,
      y: threadFormData.y,
      createdBy: userType === "reviewer" ? "レビュアー" : "レビュイー",
    });
  };

  const handleMouseMove = (e: React.MouseEvent, questionId: number) => {
    const questionEl = questionRefs.current.get(questionId);
    if (!questionEl) return;

    const rect = questionEl.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    // Clear existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Show icon immediately on movement
    setShowIcon(true);

    // Hide icon after a short delay if mouse stops moving
    hoverTimeoutRef.current = setTimeout(() => {
      setShowIcon(false);
    }, 1500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Convert threads to ReviewItems format
  const reviewItems: ReviewItem[] = effectiveThreads.map((thread: any) => {
      // Calculate relative time
      const createdAt = new Date(thread.createdAt);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60),
      );
      let timeAgo = "";
      if (diffInMinutes < 60) {
        timeAgo = `${diffInMinutes}分前`;
      } else if (diffInMinutes < 1440) {
        timeAgo = `${Math.floor(diffInMinutes / 60)}時間前`;
      } else {
        timeAgo = `${Math.floor(diffInMinutes / 1440)}日前`;
      }

      return {
        id: thread.id,
        questionNo: thread.question.code,
        type: thread.type === "ai" ? "AIレビュー" : "チームレビュー",
        reviewerName: thread.createdBy,
        time: timeAgo,
        comment: thread.message,
        status: thread.isCompleted ? "resolved" : "unresolved",
        reviewType: thread.type as "ai" | "team",
        replies: thread.reviews?.length || 0,
      };
    });

  if (sectionsLoading || threadsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
          <div className="h-96 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">質問が設定されていません</p>
      </div>
    );
  }

  // Get current sections based on active tab
  const currentSections = (sections || [])
    .filter((section: any) =>
      activeTab === "all"
        ? true
      : activeTab === "screening"
        ? section.phase === "SCREENING"
          : activeTab === "main"
            ? section.phase === "MAIN"
            : false,
    )
    .sort((a: any, b: any) => {
      if (activeTab !== "all") return 0;
      if (a.phase === b.phase) return 0;
      return a.phase === "SCREENING" ? -1 : 1;
    });

  return (<form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-start relative self-stretch w-full"
    >
      <TabSelectionSection activeTab={activeTab} onTabChange={setActiveTab} />
      <Card className="flex flex-col items-start gap-3 p-3 relative self-stretch w-full bg-[#138FB5] rounded-lg">
        {/* Main scrollable content - full width */}
        <ScrollArea className="w-full h-[calc(100vh-220px)] scroll-container">
          <div className="flex flex-col items-start gap-3 relative w-full">
              {activeTab === "share" && (
                <>
                  <Card className="flex flex-col gap-4 px-6 py-4 w-full bg-[#f4f7f9] rounded-lg border border-[#dcdcdc] shadow-[0_0_8px_rgba(0,0,0,0.04)]">
                    <div className="font-bold text-[#333333] text-xs">レビュー共有</div>
                    <div className="space-y-3 w-full">
                      <div className="space-y-1">
                        <Label htmlFor="review-url" className="text-xs text-[#333]">レビュー用URL</Label>
                        <div className="flex gap-2">
                          <Input id="review-url" value={reviewUrl} readOnly className="flex-1" />
                          <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(reviewUrl, "URL")}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="review-password" className="text-xs text-[#333]">パスワード</Label>
                        <div className="flex gap-2">
                          <Input
                            id="review-password"
                            value={sharePassword}
                            readOnly={!isEditingShare}
                            onChange={(e) => setSharePassword(e.target.value)}
                            className={`flex-1 ${isEditingShare ? "border-blue-500 bg-blue-50 focus:bg-white" : "bg-gray-50"}`}
                          />
                          <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(sharePassword, "パスワード")}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="expires-at" className="text-xs text-[#333]">有効期限</Label>
                        <div className="flex gap-2">
                          <Input
                            id="expires-at"
                            type="datetime-local"
                            value={shareExpiresAt}
                            readOnly={!isEditingShare}
                            onChange={(e) => setShareExpiresAt(e.target.value)}
                            className={`flex-1 ${isEditingShare ? "border-blue-500 bg-blue-50 focus:bg-white" : "bg-gray-50"}`}
                          />
                          <div className="w-10" />
                        </div>
                        {reviewAccess?.isExpired && (
                          <p className="text-sm text-red-500">このURLは有効期限が切れています</p>
                        )}
                      </div>
                      <div className="pt-2 flex gap-2 justify-end">
                        {/* 操作用ボタン非表示（削除要件） */}
                      </div>
                    </div>
                  </Card>

                  <Card className="flex flex-col gap-4 px-6 py-4 w-full bg-[#f4f7f9] rounded-lg border border-[#dcdcdc] shadow-[0_0_8px_rgba(0,0,0,0.04)]">
                    <div className="font-bold text-[#333333] text-xs">回答画面</div>
                    <div className="space-y-3 w-full">
                      <div className="space-y-1">
                        <Label htmlFor="answer-url" className="text-xs text-[#333]">回答画面URL</Label>
                        <div className="flex gap-2">
                          <Input id="answer-url" value={answerUrl} readOnly className="flex-1" />
                          <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(answerUrl, "URL")}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {/* 回答画面遷移ボタン削除 */}
                    </div>
                  </Card>
                </>
              )}

              {activeTab === "design" && (
                <Card className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]">
                  <div className="inline-flex items-start gap-2 relative">
                    <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs leading-6 whitespace-nowrap">
                      調査設計（概要）
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 w-full">
                    <Card className="p-4 bg-white border border-[#dcdcdc] rounded-lg">
                      <div className="font-bold text-sm text-[#333333] mb-2">概要の設定項目</div>
                      <div className="space-y-2 text-sm text-[#333333]">
                        <div className="flex items-start gap-2"><span className="text-[#666666] min-w-28">タイトル</span><span className="flex-1">{survey?.title || "-"}</span></div>
                        <div className="flex items-start gap-2"><span className="text-[#666666] min-w-28">調査目的</span><span className="flex-1 whitespace-pre-wrap">{survey?.purpose || "-"}</span></div>
                        <div className="flex items-start gap-2"><span className="text-[#666666] min-w-28">調査対象者条件</span><span className="flex-1 whitespace-pre-wrap">{survey?.targetCondition || "-"}</span></div>
                        <div className="flex items-start gap-2"><span className="text-[#666666] min-w-28">分析対象者条件</span><span className="flex-1 whitespace-pre-wrap">{survey?.analysisCondition || "-"}</span></div>
                        <div className="flex items-start gap-2"><span className="text-[#666666] min-w-28">調査手法</span><span className="flex-1">{survey?.researchMethod || "-"}</span></div>
                        <div className="flex items-start gap-2"><span className="text-[#666666] min-w-28">調査規模（予算）</span><span className="flex-1">{survey?.researchScale || "-"}</span></div>
                      </div>
                    </Card>
                  </div>
                </Card>
              )}

              {activeTab !== "design" && activeTab !== "share" && (
                currentSections.map((section: any) => (
                  <Card
                    key={section.id}
                    className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]"
                  >
                    <div className="inline-flex items-start gap-2 relative">
                      <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs leading-6 whitespace-nowrap">
                        {section.title}
                        <span className="ml-2 text-[#666666]">(
                          {section.phase === "SCREENING" ? "SC" : "Q"}
                        )</span>
                      </div>
                    </div>

                    {section.questions.map((question: any, idx: number) => {
                      const isAll = activeTab === "all";
                      const isScreening = section.phase === "SCREENING";
                      const prefix = isScreening ? "SC" : "Q";

                      const sectionsForPhase = (currentSections as any[]).filter(
                        (s) => s.phase === section.phase,
                      );
                      const sectionOffset = sectionsForPhase.findIndex(
                        (s) => s.id === section.id,
                      );
                      const priorCount = isAll
                        ? sectionsForPhase
                            .slice(0, sectionOffset)
                            .reduce(
                              (sum, s) => sum + (s.questions?.length || 0),
                              0,
                            )
                        : 0;

                      const displayIndex = priorCount + idx + 1;
                      const displayNumber = `${prefix}${displayIndex}`;

                      const questionThreads =
                        effectiveThreads.filter(
                          (thread: any) => thread.questionId === question.id,
                        ) || [];

                      return (
                        <div
                          key={question.id}
                          className="w-full relative group"
                          ref={(el) => {
                            if (el) questionRefs.current.set(question.id, el);
                          }}
                          onMouseEnter={() => setHoveredQuestionId(question.id)}
                          onMouseLeave={() => {
                            setHoveredQuestionId(null);
                            setCursorPosition(null);
                            setShowIcon(false);
                            if (hoverTimeoutRef.current) {
                              clearTimeout(hoverTimeoutRef.current);
                            }
                          }}
                          onMouseMove={(e) => handleMouseMove(e, question.id)}
                          role="region"
                          aria-label={`Question ${displayNumber}`}
                        >
                          {hoveredQuestionId === question.id &&
                            userType === "reviewer" &&
                            cursorPosition &&
                            showIcon && (
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleCommentIconClick(e, question.id)
                                }
                                className="absolute p-1.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 border border-gray-200 opacity-90 hover:opacity-100"
                                style={{
                                  left: `${cursorPosition.x + 10}px`,
                                  top: `${cursorPosition.y - 10}px`,
                                  pointerEvents: "auto",
                                  transform: "translate(-50%, -50%)",
                                }}
                                aria-label="Add comment"
                              >
                                <MessageCircle className="w-4 h-4 text-[#138FB5]" />
                              </button>
                            )}

                          {questionThreads.map((thread: any) => {
                            const reviewItem = reviewItems.find(
                              (item) => item.id === thread.id,
                            );
                            if (!reviewItem) return null;

                            return (
                              <div
                                key={thread.id}
                                className="absolute"
                                style={{
                                  left: `${thread.x}%`,
                                  top: `${thread.y}%`,
                                  zIndex:
                                    expandedCommentId === thread.id ? 50 : 30,
                                }}
                              >
                                <Comment
                                  {...reviewItem}
                                  userType={userType}
                                  question={question}
                                  threadId={thread.id}
                                  threadMessage={thread.message}
                                  threadCreatedBy={thread.createdBy}
                                  threadCreatedAt={thread.createdAt}
                                  threadIsCompleted={thread.isCompleted}
                                  reviews={thread.reviews}
                                  onExpandChange={(id, expanded) => {
                                    setExpandedCommentId(expanded ? id : null);
                                  }}
                                  onDelete={() => {
                                    setExpandedCommentId(null);
                                    refetchThreads();
                                  }}
                                  sectionName={section.title}
                                  sectionPhase={
                                    section.phase as "SCREENING" | "MAIN"
                                  }
                                />
                              </div>
                            );
                          })}

                          <QuestionForm
                            type={question.type as QuestionType}
                            questionNumber={displayNumber}
                            questionText={question.title}
                            options={question.options?.map((opt: any) => ({
                              id: opt.value,
                              label: opt.label,
                            }))}
                            suffix={question.suffix || undefined}
                            placeholder={
                              question.config
                                ? typeof question.config === "string"
                                  ? JSON.parse(question.config).placeholder
                                  : (question.config as { placeholder: string })
                                      .placeholder
                                : undefined
                            }
                            isFixed={question.isRequired}
                            isEditable={false}
                            value={watch(question.code)}
                            onValueChange={(value) =>
                              setValue(question.code, value)
                            }
                          />
                        </div>
                      );
                    })}
                  </Card>
                ))
              )}
          </div>
        </ScrollArea>
      </Card>

      {/* Thread Creation Dialog */}
      <Dialog open={threadFormOpen} onOpenChange={setThreadFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新しいスレッドを作成</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Textarea
              placeholder="コメントを入力してください..."
              value={threadMessage}
              onChange={(e) => setThreadMessage(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setThreadFormOpen(false);
                  setThreadMessage("");
                  setThreadFormData(null);
                }}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={handleCreateThread}
                disabled={
                  !threadMessage.trim() || createThreadMutation.isPending
                }
              >
                {createThreadMutation.isPending ? "作成中..." : "作成"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};
