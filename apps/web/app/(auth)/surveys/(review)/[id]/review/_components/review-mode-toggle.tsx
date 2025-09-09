"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { RespondentAttributesDialog } from "@/components/respondent-attributes-dialog";
import { ReviewUrlDialog } from "@/components/review-url-dialog";

import { api } from "@/lib/trpc/react";

type Mode = {
  id: string;
  label: string;
  path: string;
};

const getModesReviewee = (surveyId: number): Mode[] => [
  {
    id: "preview",
    label: "一覧プレビュー",
    path: `/surveys/${surveyId}/review/preview`,
  },
  {
    id: "logic",
    label: "ロジックチェック",
    path: `/surveys/${surveyId}/review/logic`,
  },
];

const getModesReviewer = (surveyId: number): Mode[] => [
  {
    id: "preview",
    label: "一覧プレビュー",
    path: `/surveys/${surveyId}/review/reviewer/preview`,
  },
  {
    id: "logic",
    label: "ロジックチェック",
    path: `/surveys/${surveyId}/review/reviewer/logic`,
  },
];

type ReviewModeToggleProps = {
  type?: "reviewer" | "reviewee";
  currentMode: string;
};

export const ReviewModeToggle = ({
  currentMode,
  type = "reviewee",
}: ReviewModeToggleProps) => {
  const router = useRouter();
  const params = useParams();
  const surveyId = Number(params.id);
  const [showReviewUrlDialog, setShowReviewUrlDialog] = useState(false);
  const [showRespondentDialog, setShowRespondentDialog] = useState(false);

  // Fetch survey data to get the title
  const { data: survey } = api.survey.getById.useQuery({
    id: surveyId,
  });

  const modes =
    type === "reviewer"
      ? getModesReviewer(surveyId)
      : getModesReviewee(surveyId);

  const handleModeChange = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex items-start justify-end self-stretch w-full px-6 py-0">
      <div className="inline-flex items-center justify-end gap-2">
        <div className="inline-flex gap-2 items-center">
          <span className="font-medium text-[#138FB5] text-xs leading-8 whitespace-nowrap">
            モード切り替え
          </span>
        </div>

        <div className="inline-flex items-center">
          {modes.map((mode, index) => (
            <React.Fragment key={mode.id}>
              {index > 0 && <div className="w-1 h-0.5 bg-[#138FB5] mx-0" />}
              <button
                className={`h-6 px-4 py-0 rounded-[20px] border-2 border-solid border-[#138fb5] inline-flex items-center gap-2 ${
                  mode.id === currentMode ? "bg-[#138FB5]" : "bg-white"
                }`}
                type="button"
                onClick={() => handleModeChange(mode.path)}
              >
                <span
                  className={`whitespace-nowrap font-bold text-xs leading-8 ${
                    mode.id === currentMode ? "text-white" : "text-[#138FB5]"
                  }`}
                >
                  {mode.label}
                </span>
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {type !== "reviewer" && (
        <div className="flex items-center gap-2" />
      )}

      <ReviewUrlDialog
        open={showReviewUrlDialog}
        onOpenChange={setShowReviewUrlDialog}
        surveyId={surveyId}
      />

      <RespondentAttributesDialog
        open={showRespondentDialog}
        onOpenChange={setShowRespondentDialog}
        projectId={String(surveyId)}
        projectTitle={survey?.title || "調査タイトル未設定"}
      />
    </div>
  );
};
