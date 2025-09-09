"use client";

import { GripVertical, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type NumericQuestionProps = {
  questionNumber: string;
  questionText: string;
  suffix?: string;
  isFixed?: boolean;
  isEditable?: boolean;
  isRequired?: boolean;
  value?: string;
  min?: number;
  max?: number;
  onValueChange?: (value: string) => void;
  onQuestionChange?: (text: string) => void;
  onSuffixChange?: (suffix: string) => void;
  onRequiredChange?: (required: boolean) => void;
  onPipingChange?: (questionId: string | undefined) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  includeHeader?: boolean;
  previousQuestions?: Array<{
    id: string;
    questionNumber: string;
    questionText: string;
  }>;
  selectedPipingQuestionId?: string;
};

export const NumericQuestion = ({
  questionNumber,
  questionText,
  suffix = "",
  isFixed = false,
  isEditable = false,
  isRequired = false,
  includeHeader = true,
  value,
  min,
  max,
  onValueChange,
  onQuestionChange,
  onSuffixChange,
  onRequiredChange,
  onPipingChange,
  dragHandleProps,
  previousQuestions = [],
  selectedPipingQuestionId,
}: NumericQuestionProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [localQuestion, setLocalQuestion] = useState(questionText);
  const [localSuffix, setLocalSuffix] = useState(suffix);
  const [localIsRequired, setLocalIsRequired] = useState(isRequired);
  const [isPipingEnabled, setIsPipingEnabled] = useState(
    !!selectedPipingQuestionId,
  );

  return (
    <Card
      className={cn(
        !includeHeader && "shadow-none border-none rounded-none",
        "flex flex-col items-start relative self-stretch w-full bg-white border border-solid border-[#dcdcdc]",
      )}
    >
      {includeHeader && (
        <div
          className={cn(
            "flex items-center gap-3 pr-0 py-0 relative self-stretch w-full flex-[0_0_auto] bg-[#f5f5f5] rounded-[8px_8px_0px_0px] border border-solid border-[#dcdcdc]",
            isEditable && "pl-2",
          )}
        >
          {isEditable && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => setIsSelected(checked as boolean)}
              className="w-4 h-4"
            />
          )}

          <div
            className={cn(
              "inline-flex items-center justify-center px-4 py-2 relative flex-[0_0_auto] bg-[#138fb5]",
              isEditable ? "rounded-none" : "rounded-[8px_0px_0px_0px]",
            )}
          >
            <div className="relative w-fit mt-[-1.00px] font-medium text-white text-xs text-center whitespace-nowrap">
              {questionNumber}
            </div>
          </div>

          <div className="inline-flex items-center gap-3 relative flex-[0_0_auto]">
            {isFixed && (
              <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] font-medium text-[#333333] text-xs text-center whitespace-nowrap">
                  固定設問
                </div>
                <Lock className="w-4 h-4 text-[#333333]" />
              </div>
            )}

            <div className="relative w-fit mt-[-1.00px] font-medium text-[#333333] text-xs text-center whitespace-nowrap">
              NU・数値入力方式
            </div>
          </div>
        </div>
      )}

      <CardContent
        className={cn(
          "flex flex-col items-start gap-4 pt-4 pb-6 px-12 relative self-stretch w-full",
          isEditable && "pl-4",
        )}
      >
        {isEditable ? (
          <div className="flex items-center gap-2 relative self-stretch w-full">
            {dragHandleProps && (
              <div
                className="cursor-move hover:bg-gray-100 p-1 rounded"
                {...dragHandleProps}
              >
                <GripVertical className="w-4 h-4 text-gray-500" />
              </div>
            )}
            <div className="flex flex-col items-start gap-2 relative self-stretch w-full">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={localIsRequired}
                  onCheckedChange={(checked) => {
                    setLocalIsRequired(checked as boolean);
                    onRequiredChange?.(checked as boolean);
                  }}
                />
                <Label
                  htmlFor="required"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  回答必須
                </Label>
              </div>
              <Input
                value={localQuestion}
                onChange={(e) => {
                  setLocalQuestion(e.target.value);
                  onQuestionChange?.(e.target.value);
                }}
                className="w-full"
                placeholder="質問文を入力してください"
              />
              {previousQuestions.length > 0 && (
                <div className="flex items-center justify-between gap-2 relative self-stretch w-full">
                  <div className="flex items-center space-x-2 py-3">
                    <Checkbox
                      id={`piping-${questionNumber}`}
                      checked={isPipingEnabled}
                      onCheckedChange={(checked) => {
                        setIsPipingEnabled(checked as boolean);
                        if (!checked) {
                          onPipingChange?.(undefined);
                        }
                      }}
                    />
                    <Label
                      htmlFor={`piping-${questionNumber}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      回答の代入(パイピング)
                    </Label>
                  </div>
                  {isPipingEnabled && previousQuestions.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedPipingQuestionId}
                        onValueChange={(value) => onPipingChange?.(value)}
                      >
                        <SelectTrigger className="w-[280px]">
                          <SelectValue placeholder="代入する質問を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {previousQuestions.map((question) => (
                            <SelectItem key={question.id} value={question.id}>
                              {question.questionNumber}. {question.questionText}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedPipingQuestionId && (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full bg-[#138fb5] text-white hover:text-white hover:bg-[#138fb5]/80"
                          size="sm"
                          onClick={() => {
                            const selectedQuestion = previousQuestions.find(
                              (q) => q.id === selectedPipingQuestionId,
                            );
                            if (selectedQuestion) {
                              const placeholder = `{{${selectedQuestion.questionNumber}}}`;
                              const newText = localQuestion + placeholder;
                              setLocalQuestion(newText);
                              onQuestionChange?.(newText);
                            }
                          }}
                        >
                          設問のラベルを挿入する
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">回答欄:</span>
                <Input
                  type="number"
                  disabled
                  placeholder="0"
                  className="w-[104px] h-6 rounded border border-solid border-[#dcdcdc]"
                />
                <Input
                  value={localSuffix}
                  onChange={(e) => {
                    setLocalSuffix(e.target.value);
                    onSuffixChange?.(e.target.value);
                  }}
                  className="w-24"
                  placeholder="単位"
                />
              </div>

              {(min !== undefined || max !== undefined) && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>範囲:</span>
                  {min !== undefined && <span>最小: {min}</span>}
                  {max !== undefined && <span>最大: {max}</span>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 relative self-stretch w-full">
              <div className="flex items-center relative flex-1 grow">
                <div className="flex-1 mt-[-1.00px] font-medium text-[#333333] text-sm leading-6">
                  {questionText}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start relative self-stretch w-full">
              <div className="flex items-center gap-2 relative self-stretch w-full">
                <div className="flex w-10 items-center justify-end relative">
                  <div className="flex flex-col w-6 items-center justify-center gap-2.5 relative">
                    <div className="relative w-fit mt-[-1.00px] font-medium text-[#333333] text-sm text-center leading-6 whitespace-nowrap">
                      1
                    </div>
                  </div>
                </div>
                <div className="gap-2 flex items-center px-2 py-0 relative flex-1 grow">
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => onValueChange?.(e.target.value)}
                    min={min}
                    max={max}
                    className="relative w-[104px] h-6 rounded border border-solid border-[#dcdcdc]"
                  />
                  {suffix && (
                    <div className="w-fit mt-[-1.00px] font-normal text-[#333333] text-xs whitespace-nowrap leading-6">
                      {suffix}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
