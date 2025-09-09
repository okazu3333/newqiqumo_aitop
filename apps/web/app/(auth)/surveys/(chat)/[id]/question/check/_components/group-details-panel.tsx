"use client";

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

type GroupDetailsPanelProps = {
  group: {
    id: string;
    title: string;
    description?: string;
    questions?: Array<{
      id: string;
      questionNumber: string;
      questionText: string;
      type: string;
    }>;
  };
  onClose: () => void;
};

export const GroupDetailsPanel = ({ group }: GroupDetailsPanelProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data matching QuestionDetailsPanel structure
  const configRows = [
    {
      label: "セクション名",
      value: "セクション1",
    },
    {
      label: "設問種別",
      value: "グループ",
    },
    {
      label: "区分",
      value: "スクリーニング調査",
    },
    {
      label: "必須回答",
      value: "必須オン",
    },
    {
      label: "回答者条件",
      value: "全員",
    },
    {
      label: "回答制御",
      value: "なし",
    },
    {
      label: "対象者条件",
      value: "なし",
    },
    {
      label: "スキップ条件",
      value: "なし",
    },
    {
      label: "カテゴリ表示順",
      value: "デフォルト",
    },
    {
      label: "ジャンプ条件",
      value: "なし",
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
              <span className="font-bold text-[16px]">
                セクションを編集する
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#333333]">
                セクション編集
              </DialogTitle>
            </DialogHeader>
            <QuestionEditSection
              question={{
                id: group.id,
                type: "グループ",
                questionNumber: "セクション1",
                questionText: group.title,
                isMainSurvey: false,
              }}
              activeTab="screening"
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
