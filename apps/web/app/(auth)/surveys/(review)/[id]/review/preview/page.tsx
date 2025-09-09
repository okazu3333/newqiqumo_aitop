"use client";

import { useParams } from "next/navigation";
import { SurveyCardHeader } from "@/components/survey-card-header";
import { api } from "@/lib/trpc/react";
import { ReviewModeToggle } from "../_components/review-mode-toggle";
import { ReviewPreviewSection } from "../_components/review-preview-section";

const Page = () => {
  const params = useParams();
  const surveyId = Number(params.id);

  const { data: survey, isLoading } = api.survey.getById.useQuery({
    id: surveyId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <SurveyCardHeader
          workingTitle="読み込み中..."
          currentStep={3}
          surveyId={surveyId}
        />
        <div className="flex flex-col w-full items-center gap-6 p-6 bg-[#ffffff] rounded-b-lg shadow-main-bg">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
            <div className="h-96 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SurveyCardHeader
        workingTitle={survey?.title || "調査タイトル未設定"}
        currentStep={3}
        surveyId={surveyId}
      />
      <div className="flex flex-col w-full items-center gap-4 p-4 bg-[#ffffff] rounded-b-lg shadow-main-bg">
        {/* Header Section with Mode Toggle */}
        <div className="flex items-start justify-end self-stretch w-full">
          <ReviewModeToggle currentMode="preview" />
        </div>
        <div className="w-full">
          <ReviewPreviewSection />
        </div>
      </div>
    </div>
  );
};

export default Page;
