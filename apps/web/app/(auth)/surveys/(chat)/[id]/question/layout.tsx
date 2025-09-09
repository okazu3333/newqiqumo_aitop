"use client";

import { useParams } from "next/navigation";
import { SurveyCardHeader } from "@/components/survey-card-header";
import { api } from "@/lib/trpc/react";

type QuestionLayoutProps = {
  children: React.ReactNode;
};

const QuestionLayout = ({ children }: QuestionLayoutProps) => {
  const params = useParams();
  const surveyId = Number(params.id);

  // 調査情報を取得
  const { data: survey } = api.survey.getById.useQuery({
    id: surveyId,
  });

  return (
    <div className="flex flex-col w-full">
      <SurveyCardHeader
        workingTitle={survey?.title || "調査票設問の設定"}
        currentStep={2}
        surveyId={surveyId}
      />
      {children}
    </div>
  );
};

export default QuestionLayout;
