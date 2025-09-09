"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatContext } from "../../../chat-context";

type Mode = {
  id: string;
  label: string;
  pathSuffix: string;
};

const modes: Mode[] = [
  { id: "preview", label: "一覧プレビュー", pathSuffix: "/question/preview" },
  { id: "edit", label: "編集", pathSuffix: "/question/edit" },
  { id: "logic", label: "ロジックチェック", pathSuffix: "/question/check" },
];

type ModeToggleProps = {
  currentMode: string;
};

export const ModeToggle = ({ currentMode }: ModeToggleProps) => {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const handleModeChange = (pathSuffix: string) => {
    router.push(`/surveys/${surveyId}${pathSuffix}`);
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
                onClick={() => handleModeChange(mode.pathSuffix)}
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
    </div>
  );
};

export const ActionButtons = () => {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;
  const { startTest } = useChatContext();
  const [hasExecutedTest, setHasExecutedTest] = useState(false);

  const handleTestExecution = () => {
    toast("テスト実行を開始しました");
    startTest();

    // Enable the review button after 6 seconds
    setTimeout(() => {
      setHasExecutedTest(true);
      toast.success("テスト実行が完了しました。レビューへ進むことができます。");
    }, 6000);
  };

  const handleProceedToReview = () => {
    if (!hasExecutedTest) {
      toast.error("レビューへ進む前にテスト実行を完了してください");
      return;
    }
    router.push(`/surveys/${surveyId}/review/preview`);
  };

  return (
    <div className="flex justify-center items-center gap-4 w-full px-6 py-4">
      <Button
        onClick={handleTestExecution}
        className="h-10 px-6 py-4 bg-[#556064] hover:bg-[#556064]/80 rounded-[20px] inline-flex items-center justify-center gap-4"
      >
        <span className="font-bold text-white text-base text-center leading-6 whitespace-nowrap">
          テスト実行
        </span>
      </Button>

      <Button
        onClick={handleProceedToReview}
        disabled={!hasExecutedTest}
        className={cn(
          "h-10 px-6 py-4 rounded-[20px] inline-flex items-center justify-center gap-4",
          hasExecutedTest
            ? "bg-[#138FB5] hover:bg-[#138FB5]/80"
            : "bg-gray-300 cursor-not-allowed",
        )}
      >
        <span className="font-bold text-white text-base text-center leading-6 whitespace-nowrap">
          調査票を保存する(レビューへ進む)
        </span>
      </Button>
    </div>
  );
};
