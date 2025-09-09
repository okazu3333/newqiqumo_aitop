"use client";

import { CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/app/(auth)/surveys/(chat)/chat-context";

export type StepStatus = "complete" | "current" | "next";

export type Step = {
  id: string;
  label: string;
  status: StepStatus;
};

export type PublishStepProps = {
  currentStep: number;
  steps?: string[];
  className?: string;
  surveyId?: number;
};

const defaultSteps = [
  "概要の設定",
  "セクションの設定",
  "設問の設定",
  "レビュー",
  "調査票の確定",
];

export const PublishStep = ({
  currentStep,
  steps = defaultSteps,
  className,
  surveyId,
}: PublishStepProps) => {
  const router = useRouter();
  let isChatCollapsed = false;
  try {
    isChatCollapsed = useChatContext().isChatCollapsed;
  } catch {
    isChatCollapsed = false;
  }

  const getStepStatus = (index: number): StepStatus => {
    if (index < currentStep) return "complete";
    if (index === currentStep) return "current";
    return "next";
  };

  const handleStepClick = (index: number) => {
    if (!surveyId) return;

    const status = getStepStatus(index);
    // Allow navigation to completed steps and also to step 4 when current step is 4
    if (status !== "complete" && !(currentStep === 4 && index < 4)) return;

    // Navigate based on the step index
    switch (index) {
      case 0:
        router.push(`/surveys/${surveyId}`);
        break;
      case 1:
        router.push(`/surveys/${surveyId}/sections`);
        break;
      case 2:
        router.push(`/surveys/${surveyId}/question/preview`);
        break;
      case 3:
        router.push(`/surveys/${surveyId}/review/preview`);
        break;
      case 4:
        router.push(`/surveys/${surveyId}/complete`);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 bg-[#75BACF] px-3 py-2.5 sm:px-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center",
          isChatCollapsed ? "sm:justify-center" : "sm:justify-start",
        )}
      >
        <h3 className="text-xs font-bold text-white whitespace-nowrap">
          配信までのステップ
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto sm:gap-0">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step} className="flex items-center flex-shrink-0">
                <StepItem
                  label={step}
                  status={status}
                  isCompact={steps.length > 4}
                  onClick={() => handleStepClick(index)}
                  isClickable={
                    surveyId !== undefined &&
                    (status === "complete" || (currentStep === 4 && index < 4))
                  }
                />
                {index < steps.length - 1 && (
                  <div className="h-0.5 w-2 bg-white sm:w-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export type StepItemProps = {
  label: string;
  status: StepStatus;
  isCompact?: boolean;
  onClick?: () => void;
  isClickable?: boolean;
};

const StepItem = ({
  label,
  status,
  isCompact = false,
  onClick,
  isClickable = false,
}: StepItemProps) => {
  const content = (
    <>
      <span className="truncate text-[10px] sm:text-xs">{label}</span>
      {status === "complete" && (
        <CircleCheck className="h-3 w-3 flex-shrink-0 text-[#4BBC80] sm:h-4 sm:w-4" />
      )}
    </>
  );

  const className = cn(
    "flex items-center justify-center gap-1 rounded px-2 py-1 text-xs sm:gap-2 sm:px-4",
    "h-5 sm:h-6",
    isCompact ? "w-20 sm:w-28 lg:w-32" : "w-24 sm:w-32",
    {
      "bg-[#138FB5] font-bold text-white": status === "current",
      "bg-white font-medium text-[#138FB5]":
        status === "next" || status === "complete",
      "cursor-pointer hover:opacity-80 transition-opacity": isClickable,
    },
  );

  return (
    <button
      type="button"
      className={className}
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      style={{ cursor: isClickable ? "pointer" : "default" }}
    >
      {content}
    </button>
  );
};
