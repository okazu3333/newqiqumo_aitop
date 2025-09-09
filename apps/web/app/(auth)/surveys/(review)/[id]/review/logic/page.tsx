"use client";

import { useParams } from "next/navigation";
import { SurveyCardHeader } from "@/components/survey-card-header";
import type { ReviewItem } from "@/lib/types/review";
import { api } from "@/lib/trpc/react";
import { ReviewModeToggle } from "../_components/review-mode-toggle";
import { PreviewLogicCheckSection } from "./_components/preview-logic-check-section";
import { useEffect, useRef } from "react";

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
];

const Page = () => {
  const params = useParams();
  const surveyId = Number(params.id);

  // Fetch sections/questions
  const { data: sections, isLoading, refetch } = api.question.listBySurvey.useQuery({
    surveyId,
  });

  // Auto-seed dummy if empty
  const seedMutation = api.question.seedForSurvey.useMutation({
    onSuccess: () => refetch(),
  });

  // Guard to avoid repeated POSTs in dev double-render
  const seededOnceRef = useRef<number | null>(null);
  useEffect(() => {
    if (isLoading) return;
    if (!sections || sections.length === 0) return;
    const total = sections.reduce((sum: number, s: any) => sum + (s.questions?.length || 0), 0);
    if (total === 0 && !seedMutation.isPending && seededOnceRef.current !== surveyId) {
      seededOnceRef.current = surveyId;
      seedMutation.mutate({ surveyId });
    }
  }, [isLoading, sections, seedMutation, surveyId]);

  return (
    <div className="flex flex-col gap-4">
      <SurveyCardHeader workingTitle="ロジック確認" currentStep={3} surveyId={surveyId} />
      <div className="flex flex-col w-full items-center gap-6 p-6 bg-[#ffffff] rounded-b-lg shadow-main-bg">
        {/* Header Section with Mode Toggle */}
        <ReviewModeToggle currentMode="logic" />

        {/* Logic Check Section with Comments */}
        <PreviewLogicCheckSection reviewItems={mockReviewItems} />
      </div>
    </div>
  );
};

export default Page;
