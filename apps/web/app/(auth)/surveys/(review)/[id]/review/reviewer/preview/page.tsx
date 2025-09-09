"use client";

import { useParams } from "next/navigation";
import { useReviewerSession } from "@/hooks/use-reviewer-session";
import { ReviewModeToggle } from "../../_components/review-mode-toggle";
import { ReviewPreviewSection } from "../../_components/review-preview-section";

const Page = () => {
  const params = useParams();
  const surveyId = Number(params.id);
  useReviewerSession(surveyId); // セッション管理（自動リダイレクト）
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col w-full items-center gap-6 p-6 bg-[#ffffff] rounded-b-lg shadow-main-bg">
        <ReviewModeToggle currentMode="preview" type="reviewer" />

        <ReviewPreviewSection userType="reviewer" />
      </div>
    </div>
  );
};

export default Page;
