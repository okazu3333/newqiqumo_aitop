import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuestionEditSection } from "./question-edit-section";

type Question = {
  id: string;
  type: string;
  questionNumber: string;
  questionText: string;
  isMainSurvey?: boolean;
  isRequired?: boolean;
  respondentCondition?: string;
  answerControl?: string;
  targetCondition?: string;
  skipCondition?: string;
  displayOrder?: string;
  jumpCondition?: string;
};

type QuestionDetailsProps = {
  question: Question;
  onClose: () => void;
};

export const QuestionDetailsPanel = ({ question }: QuestionDetailsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const configRows = [
    {
      label: "設問番号",
      value: question.questionNumber,
    },
    {
      label: "設問種別",
      value: question.type,
    },
    {
      label: "区分",
      value: question.isMainSurvey ? "本調査" : "スクリーニング調査",
    },
    {
      label: "必須回答",
      value: question.isRequired ? "必須オン" : "必須オフ",
    },
    {
      label: "回答者条件",
      value: question.respondentCondition || "全員",
    },
    {
      label: "回答制御",
      value: question.answerControl || "なし",
    },
    {
      label: "対象者条件",
      value: question.targetCondition || "なし",
    },
    {
      label: "スキップ条件",
      value: question.skipCondition || "なし",
    },
    {
      label: "カテゴリ表示順",
      value: question.displayOrder || "デフォルト",
    },
    {
      label: "ジャンプ条件",
      value: question.jumpCondition || "なし",
    },
  ];

  return (
    <Card className="w-72 shadow-lg border border-solid border-[#138fb5] bg-white">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col w-full">
          {configRows.map((row, index) => (
            <div
              key={`config-row-${index}`}
              className="flex items-stretch gap-0 w-full border-b border-gray-200 last:border-b-0"
            >
              <div
                className={
                  "flex w-24 items-center justify-center px-2 py-1 bg-[#f5f5f5] border-r border-gray-200"
                }
              >
                <div className="text-[12px] font-bold text-[#333333] text-center">
                  {row.label}
                </div>
              </div>

              <div className="flex-1 px-3 py-1 flex items-center justify-between">
                <div className="text-[12px] text-[#333333]">{row.value}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-10 bg-white text-[#138fb5] rounded-[20px] border border-solid border-[#dcdcdc] hover:bg-gray-50">
              <span className="font-bold text-[16px]">設問を編集する</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#333333]">
                設問編集
              </DialogTitle>
            </DialogHeader>
            <QuestionEditSection
              question={question}
              activeTab={question.isMainSurvey ? "main" : "screening"}
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
