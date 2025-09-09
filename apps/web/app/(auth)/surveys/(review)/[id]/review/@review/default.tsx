"use client";

import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  MessageSquareText,
} from "lucide-react";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";
import { AiReviewDialog } from "../_components/ai-review-dialog";
import { UserReviewDialog } from "../_components/user-review-dialog";

import { useReviewContext } from "../review-context";

type ReviewType = "ai" | "team";
type FilterStatus = "all" | "unresolved" | "resolved";

type ReviewSidebarProps = {
  userType?: "reviewer" | "reviewee";
};

const ReviewSidebar = ({ userType = "reviewee" }: ReviewSidebarProps) => {
  const { isReviewCollapsed, setIsReviewCollapsed } = useReviewContext();
  const [selectedReviewType, setSelectedReviewType] =
    useState<ReviewType>("ai");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  // biome-ignore lint/suspicious/noExplicitAny: do something
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const params = useParams();
  const surveyId = Number(params.id);

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

  // Fetch threads from tRPC
  const { data: threads, isLoading } = api.thread.list.useQuery(
    {
      surveyId,
    },
    {
      enabled: !!surveyId,
    },
  );

  // Prefer real threads; if none, provide two dummy examples for visibility (memoized)
  const effectiveThreads = useMemo(() => {
    if (threads && threads.length > 0) return threads;
    return [
      {
        id: 1001,
        questionId: 1,
        type: "ai",
        createdBy: "AIレビュー",
        createdAt: new Date().toISOString(),
        isCompleted: false,
        message: "設問文が長い可能性があります。簡潔にしましょう。",
        reviews: [
          {
            id: 2001,
            message: "具体例を短くする案です。",
            createdBy: "AIアシスタント",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 1002,
        questionId: 2,
        type: "team",
        createdBy: "レビュアーA",
        createdAt: new Date().toISOString(),
        isCompleted: false,
        message: "選択肢の網羅性に漏れがないか再確認をお願いします。",
        reviews: [
          {
            id: 2002,
            message: "同義の選択肢が重複しているかも。",
            createdBy: "レビュアーB",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 1003,
        questionId: 3,
        type: "team",
        createdBy: "レビュアーB",
        createdAt: new Date().toISOString(),
        isCompleted: true,
        message: "設問の日本語表現をより統一的にしてください。",
        reviews: [
          {
            id: 2003,
            message: "ガイドラインに合わせた表現例を貼りました。",
            createdBy: "レビュアーC",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 1004,
        questionId: 4,
        type: "team",
        createdBy: "レビュアーC",
        createdAt: new Date().toISOString(),
        isCompleted: false,
        message: "分岐条件が対象外の回答者にも当たっていないか確認をお願いします。",
        reviews: [
          {
            id: 2004,
            message: "対象条件のロジックを見直す必要がありそうです。",
            createdBy: "レビュアーA",
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ];
  }, [threads]);

  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);

  // Convert threads to ReviewItems format
  useEffect(() => {
    if (effectiveThreads) {
      const items: ReviewItem[] = effectiveThreads.map((thread: any) => {
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

        // Determine review type based on thread type
        const reviewType = thread.type === "ai" ? "ai" : "team";

        // Format question number (you may need to adjust this based on actual question data)
        const questionNo = `Q${thread.questionId}`;

        return {
          id: thread.id,
          questionNo,
          type: thread.type === "ai" ? "AIレビュー" : thread.createdBy,
          reviewerName: thread.createdBy,
          time: timeAgo,
          comment: thread.message,
          status: thread.isCompleted ? "resolved" : "unresolved",
          reviewType,
          replies: thread.reviews?.length || 0,
        };
      });
      setReviewItems(items);
    }
  }, [effectiveThreads]);

  // Auto-select first thread when threads arrive and nothing is selected
  useEffect(() => {
    if (!selectedThread && effectiveThreads && effectiveThreads.length > 0) {
      setSelectedThread(effectiveThreads[0]);
    }
  }, [effectiveThreads, selectedThread]);

  // Get tRPC utils for invalidation
  const utils = api.useUtils();

  // Update thread mutation
  const updateThreadMutation = api.thread.update.useMutation({
    onSuccess: () => {
      // Refetch threads after successful update
      utils.thread.list.invalidate({ surveyId });
    },
  });

  const toggleItemStatus = (itemId: number) => {
    const item = reviewItems.find((item) => item.id === itemId);
    if (item) {
      // Update local state immediately for better UX
      setReviewItems((items) =>
        items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: item.status === "resolved" ? "unresolved" : "resolved",
              }
            : item,
        ),
      );

      // Update in database
      updateThreadMutation.mutate({
        id: itemId,
        data: {
          isCompleted: item.status === "unresolved", // Toggle the status
        },
      });
    }
  };

  const handleItemDoubleClick = (item: ReviewItem) => {
    // Find the corresponding thread
    const thread = threads?.find((t: { id: number }) => t.id === item.id);
    if (thread) {
      setSelectedThread(thread);
      if (item.reviewType === "ai") {
        setIsAiDialogOpen(true);
      } else {
        setIsUserDialogOpen(true);
      }
    }
  };

  // Filter items based on selected review type and status
  const filteredItems = reviewItems.filter((item) => {
    if (item.reviewType !== selectedReviewType) return false;
    if (filterStatus === "all") return true;
    return item.status === filterStatus;
  });

  return (
    <div
      className={cn(
        "transition-all duration-300 flex",
        isReviewCollapsed ? "w-12" : "w-[500px]",
      )}
    >
      <div
        className={cn(
          "bg-[#F4F7F9] shadow-[-4px_0px_12px_0px_rgba(0,0,0,0.04)] flex flex-col rounded-lg border-l-2 border-[#DCDCDC]",
          isReviewCollapsed ? "h-12" : "h-[calc(100vh-6rem)]",
        )}
      >
        {!isReviewCollapsed && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#138FB5]">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-6 h-6 text-white" />
                <h2 className="text-white text-base font-bold">
                  レビューコメント
                </h2>
                <button className="ml-2" type="button">
                  <CircleHelp className="w-4 h-4 text-white" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewCollapsed(true)}
                className="text-white hover:opacity-80"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-4 border-b border-[#DCDCDC] flex flex-row justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedReviewType("ai")}
                    className={cn(
                      "px-6 py-1 text-xs font-bold rounded-xl transition-colors",
                      selectedReviewType === "ai"
                        ? "bg-[#138FB5] text-white"
                        : "bg-white text-[#138FB5] border border-[#138FB5]",
                    )}
                  >
                    AIレビュー
                  </button>
                  <div className="w-2 h-[2px] bg-[#138FB5]" />
                  <button
                    type="button"
                    onClick={() => setSelectedReviewType("team")}
                    className={cn(
                      "px-4 py-1 text-xs font-bold rounded-xl transition-colors",
                      selectedReviewType === "team"
                        ? "bg-[#138FB5] text-white"
                        : "bg-white text-[#138FB5] border border-[#138FB5]",
                    )}
                  >
                    チームレビュー
                  </button>
                </div>
              </div>
              <div className="flex items-center rounded-xl border-2 bg-white border-[#138FB5] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFilterStatus("unresolved")}
                  className={cn(
                    "px-3 py-1 text-xs font-bold transition-colors",
                    filterStatus === "unresolved"
                      ? "bg-[#138FB5] text-white"
                      : "text-[#138FB5]",
                  )}
                >
                  未対応
                </button>
                <div className="w-[2px] h-6 bg-[#138FB5]" />
                <button
                  type="button"
                  onClick={() => setFilterStatus("resolved")}
                  className={cn(
                    "px-3 py-1 text-xs font-bold transition-colors",
                    filterStatus === "resolved"
                      ? "bg-[#138FB5] text-white"
                      : "text-[#138FB5]",
                  )}
                >
                  対応済
                </button>
                <div className="w-[2px] h-6 bg-[#138FB5]" />
                <button
                  type="button"
                  onClick={() => setFilterStatus("all")}
                  className={cn(
                    "px-3 py-1 text-xs font-bold transition-colors",
                    filterStatus === "all"
                      ? "bg-[#138FB5] text-white"
                      : "text-[#138FB5]",
                  )}
                >
                  すべて
                </button>
              </div>
            </div>

            {/* Test Completion UI - Only show for AI Review */}
            {selectedReviewType === "ai" && (
              <div className="px-6 py-4 bg-white border-b border-[#DCDCDC]">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <p className="text-lg font-bold text-gray-800">
                    テストが完了しました！
                  </p>
                  <CircleCheck className="w-8 h-8 text-[#138fb5]" />
                  <p className="text-lg font-bold text-gray-800">100%</p>
                </div>

                {/* Test Status Progress Bars */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CircleCheck className="w-6 h-6 text-[#138fb5]" />
                    <span className="text-sm font-medium text-gray-700">
                      回答テスト
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#138fb5] transition-all duration-300"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CircleCheck className="w-6 h-6 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      カバレッジ検証
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#138fb5] transition-all duration-300"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Items */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-gray-500">読み込み中...</div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-gray-500">
                    {filterStatus === "all"
                      ? "レビューコメントはありません"
                      : filterStatus === "unresolved"
                        ? "未対応のレビューはありません"
                        : "対応済みのレビューはありません"}
                  </div>
                </div>
              ) : (
                filteredItems.map((item, _index) => (
                  // biome-ignore lint/a11y/noStaticElementInteractions: <>
                  <div
                    key={item.id}
                    className={cn(
                      "px-6 py-4 border-b border-[#DCDCDC] cursor-pointer transition-all duration-200",
                      item.status === "resolved"
                        ? "bg-[#F8FAFB] hover:bg-[#F0F4F6]"
                        : "bg-white hover:bg-[#E7ECF0]",
                    )}
                    onClick={() => {
                      const thread = (effectiveThreads ?? []).find((t: { id: number }) => t.id === item.id);
                      if (thread) setSelectedThread(thread);
                    }}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#9DA0A7] font-medium">
                          {item.questionNo}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItemStatus(item.id);
                        }}
                        className={cn(
                          "transition-all duration-200 hover:scale-110",
                          item.status === "resolved"
                            ? "hover:opacity-90"
                            : "hover:opacity-70",
                        )}
                      >
                        {item.status === "resolved" ? (
                          <div className="relative">
                            <CircleCheck className="w-5 h-5 text-white fill-[#138FB5] drop-shadow-md" />
                            <div className="absolute inset-0 bg-[#138FB5] rounded-full blur-sm opacity-30 -z-10" />
                          </div>
                        ) : (
                          <div className="relative group">
                            <CircleCheck className="w-5 h-5 text-[#979BA2] stroke-2 group-hover:text-[#138FB5] transition-colors" />
                            <div className="absolute inset-0 bg-[#138FB5] rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity -z-10" />
                          </div>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          item.status === "resolved"
                            ? "text-[#666666]"
                            : "text-[#333333]",
                        )}
                      >
                        {selectedReviewType === "ai" ? item.type : item.reviewerName}
                      </span>
                      <span className="text-xs text-[#9DA0A7]">{item.time}</span>
                    </div>
                    <p
                      className={cn(
                        "text-sm",
                        item.status === "resolved"
                          ? "text-[#666666] line-through"
                          : "text-[#333333]",
                      )}
                    >
                      {item.comment}
                    </p>
                    {(item?.replies ?? 0) > 0 && (
                      <p className="text-xs text-[#9DA0A7] mt-2">{item.replies}件の返信</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {isReviewCollapsed && (
          <button
            type="button"
            onClick={() => setIsReviewCollapsed(false)}
            className="w-12 h-12 flex items-center justify-center bg-[#138FB5] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Dialogs */}
      <AiReviewDialog
        open={isAiDialogOpen}
        onOpenChange={(open) => {
          setIsAiDialogOpen(open);
          if (!open) setSelectedThread(null);
        }}
        userType={userType}
        threadId={selectedThread?.id}
        threadMessage={selectedThread?.message}
        threadCreatedBy={selectedThread?.createdBy}
        threadCreatedAt={selectedThread?.createdAt}
        threadIsCompleted={selectedThread?.isCompleted}
        reviews={selectedThread?.reviews}
        question={selectedThread?.question}
      />
      <UserReviewDialog
        open={isUserDialogOpen}
        onOpenChange={(open) => {
          setIsUserDialogOpen(open);
          if (!open) setSelectedThread(null);
        }}
        userType={userType}
        threadId={selectedThread?.id}
        threadMessage={selectedThread?.message}
        threadCreatedBy={selectedThread?.createdBy}
        threadCreatedAt={selectedThread?.createdAt}
        threadIsCompleted={selectedThread?.isCompleted}
        reviews={selectedThread?.reviews}
        question={selectedThread?.question}
      />
    </div>
  );
};

export default ReviewSidebar;
