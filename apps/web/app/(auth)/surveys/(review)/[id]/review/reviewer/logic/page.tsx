"use client";

import { useParams } from "next/navigation";
import { useReviewerSession } from "@/hooks/use-reviewer-session";
import type { ReviewItem } from "@/lib/types/review";
import { ReviewModeToggle } from "../../_components/review-mode-toggle";
import { PreviewLogicCheckSection } from "../../logic/_components/preview-logic-check-section";

// Mock review items for demonstration with logic check questions
const mockReviewItems: ReviewItem[] = [
  {
    id: 101,
    questionNo: "Q1",
    type: "SA",
    reviewerName: "山田太郎",
    time: "10分前",
    comment:
      "性別の選択肢に「その他」や「回答しない」の選択肢を追加することを検討してください。",
    status: "unresolved",
    reviewType: "team",
    sectionId: "group-1",
    questionId: "q1",
    position: { x: 70, y: 20 },
  },
  {
    id: 102,
    questionNo: "Q4",
    type: "SA",
    reviewerName: "AIレビュー",
    time: "15分前",
    comment:
      "分岐ロジックが正しく設定されていますが、両方の選択肢でテスト実施を推奨します。",
    status: "unresolved",
    reviewType: "ai",
    sectionId: "group-marriage",
    questionId: "q4",
    position: { x: 75, y: 30 },
  },
  {
    id: 103,
    questionNo: "Q8",
    type: "SA",
    reviewerName: "佐藤花子",
    time: "1時間前",
    comment:
      "本調査の最初の質問として適切です。回答者が理解しやすい内容になっています。",
    status: "resolved",
    reviewType: "team",
    sectionId: "group-4",
    questionId: "q8",
    position: { x: 80, y: 10 },
  },
];

const Page = () => {
  const params = useParams();
  const surveyId = Number(params.id);
  useReviewerSession(surveyId); // セッション管理（自動リダイレクト）
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col w-full items-center gap-6 p-6 bg-[#ffffff] rounded-b-lg shadow-main-bg">
        {/* Header Section with Mode Toggle */}
        <ReviewModeToggle currentMode="logic" type="reviewer" />

        {/* Logic Check Section with Comments */}
        <PreviewLogicCheckSection reviewItems={mockReviewItems} />
      </div>
    </div>
  );
};

export default Page;
