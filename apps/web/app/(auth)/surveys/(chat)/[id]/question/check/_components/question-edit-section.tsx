"use client";

import { useState } from "react";
import { QuestionForm, type QuestionType } from "@/components/question-form";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type Question = {
  id: string;
  type: string;
  questionNumber: string;
  questionText: string;
  isMainSurvey?: boolean;
};

type QuestionEditSectionProps = {
  question: Question;
  activeTab: "screening" | "main";
};

type QuestionData = {
  id: string;
  type: QuestionType;
  questionNumber: string;
  questionText: string;
  options?: Array<{ id: string | number; label: string }>;
  suffix?: string;
  isFixed?: boolean;
};

export const QuestionEditSection = ({ question }: QuestionEditSectionProps) => {
  const [questionData, setQuestionData] = useState<QuestionData>({
    id: question.id,
    type: question.type as QuestionType,
    questionNumber: question.questionNumber,
    questionText: question.questionText,
    options: getDefaultOptions(question),
    suffix: getSuffix(question),
    isFixed: isFixedQuestion(question.id),
  });

  function getDefaultOptions(q: Question) {
    switch (q.id) {
      case "q1":
      case "Q1":
        return [
          { id: 1, label: "男性" },
          { id: 2, label: "女性" },
        ];
      case "q3":
      case "Q3":
        return [{ id: 1, label: "47都道府県" }];
      case "q4":
      case "Q4":
        return [
          { id: 1, label: "未婚" },
          { id: 2, label: "既婚（離別・死別含む）" },
        ];
      case "q5":
      case "Q5":
        return [
          { id: 1, label: "自分のみ（一人暮らし）" },
          { id: 2, label: "配偶者" },
          { id: 3, label: "こども（未就学児）" },
          { id: 4, label: "こども（小学生）" },
          { id: 5, label: "こども（中高生）" },
          { id: 6, label: "こども（高校生を除く18歳以上）" },
          { id: 7, label: "自分（配偶者）の親" },
          { id: 8, label: "自分（配偶者）の兄弟姉妹" },
          { id: 9, label: "自分（配偶者）の祖父母" },
          { id: 10, label: "その他" },
        ];
      case "q8":
      case "Q8":
      case "q13":
      case "Q13":
      case "q14":
      case "Q14":
      case "q15":
      case "Q15":
        return [
          { id: 1, label: "毎日" },
          { id: 2, label: "週に数回" },
          { id: 3, label: "月に数回" },
          { id: 4, label: "ほとんど使用しない" },
        ];
      default:
        return [
          { id: 1, label: "選択肢1" },
          { id: 2, label: "選択肢2" },
        ];
    }
  }

  function getSuffix(q: Question) {
    if (q.id === "q2" || q.id === "Q2") return "歳";
    if (q.id === "q12" || q.id === "Q12") return "円";
    return undefined;
  }

  function isFixedQuestion(id: string) {
    return ["q1", "Q1", "q2", "Q2", "q3", "Q3"].includes(id);
  }

  const handleQuestionChange = (text: string) => {
    setQuestionData({ ...questionData, questionText: text });
  };

  const handleOptionsChange = (
    options: Array<{ id: string | number; label: string }>,
  ) => {
    setQuestionData({ ...questionData, options });
  };

  return (
    <div className="flex flex-col items-start relative self-stretch w-full">
      <Card className="flex flex-col items-start gap-4 p-4 relative self-stretch w-full flex-[0_0_auto] bg-[#138fb5] rounded-lg">
        <ScrollArea className="flex flex-col h-[300px] items-start gap-4 relative self-stretch rounded-lg">
          <div className="flex flex-col gap-4 w-full">
            <QuestionForm
              type={questionData.type}
              questionNumber={questionData.questionNumber}
              questionText={questionData.questionText}
              options={questionData.options}
              isFixed={questionData.isFixed}
              isEditable={!questionData.isFixed}
              suffix={questionData.suffix}
              onQuestionChange={handleQuestionChange}
              onOptionsChange={handleOptionsChange}
            />
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
