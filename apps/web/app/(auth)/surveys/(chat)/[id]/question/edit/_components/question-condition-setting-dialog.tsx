"use client";

import { Filter, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Condition = {
  id: string;
  question: string;
  answer: string;
  gender: "both" | "male" | "female";
};

type QuestionConditionSettingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const QuestionConditionSettingDialog = ({
  isOpen,
  onClose,
}: QuestionConditionSettingDialogProps) => {
  const [conditions, setConditions] = useState<Condition[]>([
    {
      id: "1",
      question: "あなたの性別を教えてください。",
      answer: "いずれか",
      gender: "both",
    },
  ]);
  const [operator, setOperator] = useState<"AND" | "OR">("AND");

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      question: "あなたの性別を教えてください。",
      answer: "いずれか",
      gender: "both",
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((condition) => condition.id !== id));
  };

  // biome-ignore lint/suspicious/noExplicitAny: xxx
  const updateCondition = (id: string, field: keyof Condition, value: any) => {
    setConditions(
      conditions.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition,
      ),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            設問表示条件
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {/* Explanation */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              例：Q1の好きなスポーツを聞く質問で「サッカーと答えた人」だけにQ2を表示させるなど、表示条件を設定できます。
              <span className="text-red-500 ml-2">
                ※1つの設問につき最大10個まで表示条件の設定が可能です。
              </span>
            </p>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <Card key={condition.id} className="bg-gray-50 p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <div className="bg-gray-200 px-3 py-1 rounded text-sm font-medium text-gray-700">
                      設問
                    </div>
                  </div>
                  <div className="col-span-5">
                    <Select
                      value={condition.question}
                      onValueChange={(value) =>
                        updateCondition(condition.id, "question", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="あなたのお住まい（都道府県）を教えてください。">
                          あなたのお住まい（都道府県）を教えてください。
                        </SelectItem>
                        <SelectItem value="あなたの性別を教えてください。">
                          あなたの性別を教えてください。
                        </SelectItem>
                        <SelectItem value="あなたの年齢を教えてください。">
                          あなたの年齢を教えてください。
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <div className="bg-gray-200 px-3 py-1 rounded text-sm font-medium text-gray-700">
                      回答
                    </div>
                  </div>
                  <div className="col-span-4">
                    <Select
                      value={condition.answer}
                      onValueChange={(value) =>
                        updateCondition(condition.id, "answer", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="いずれか">いずれか</SelectItem>
                        <SelectItem value="男性">男性</SelectItem>
                        <SelectItem value="女性">女性</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    {conditions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(condition.id)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Gender Selection */}
                <div className="mt-3 ml-20">
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`male-${condition.id}`}
                        checked={
                          condition.gender === "male" ||
                          condition.gender === "both"
                        }
                        onCheckedChange={(checked) => {
                          const currentGender = condition.gender;
                          let newGender: "both" | "male" | "female";

                          if (checked) {
                            newGender =
                              currentGender === "female" ? "both" : "male";
                          } else {
                            newGender =
                              currentGender === "both" ? "female" : "both";
                          }
                          updateCondition(condition.id, "gender", newGender);
                        }}
                      />
                      <Label htmlFor={`male-${condition.id}`}>男性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`female-${condition.id}`}
                        checked={
                          condition.gender === "female" ||
                          condition.gender === "both"
                        }
                        onCheckedChange={(checked) => {
                          const currentGender = condition.gender;
                          let newGender: "both" | "male" | "female";

                          if (checked) {
                            newGender =
                              currentGender === "male" ? "both" : "female";
                          } else {
                            newGender =
                              currentGender === "both" ? "male" : "both";
                          }
                          updateCondition(condition.id, "gender", newGender);
                        }}
                      />
                      <Label htmlFor={`female-${condition.id}`}>女性</Label>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  設問編集で選択肢の変更や作成などを行った場合、登録しない限り変更内容が反映されている場合がありますので、保存してお願いします。
                </div>

                {/* Add new condition button */}
                {index === conditions.length - 1 && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="ghost"
                      onClick={addCondition}
                      className="text-[#138FB5] hover:text-[#138FB5]/80 text-sm font-medium"
                    >
                      新条件
                    </Button>
                  </div>
                )}

                {/* AND/OR operators */}
                {index < conditions.length - 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    <RadioGroup
                      value={operator}
                      // biome-ignore lint/suspicious/noExplicitAny: xxx
                      onValueChange={(v) => setOperator(v as any)}
                      className="flex gap-2"
                    >
                      <div className="flex items-center">
                        <RadioGroupItem
                          value="AND"
                          id="and"
                          className="sr-only"
                        />
                        <Label
                          htmlFor="and"
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                            operator === "AND"
                              ? "bg-[#138FB5] text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300",
                          )}
                        >
                          AND
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem
                          value="OR"
                          id="or"
                          className="sr-only"
                        />
                        <Label
                          htmlFor="or"
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                            operator === "OR"
                              ? "bg-[#138FB5] text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300",
                          )}
                        >
                          OR
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </Card>
            ))}

            {/* Add Condition Button */}
            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={addCondition}
                className="text-[#138FB5] hover:text-[#138FB5]/80"
              >
                <Plus className="w-4 h-4 mr-2" />
                条件を追加
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center w-full">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>前の設問</span>
                <span className="mx-2">|</span>
                <span>Q4. あなたの役職に最も近い ▼</span>
                <span className="mx-2">|</span>
                <span>次の設問 ▶</span>
              </div>
              <Button
                onClick={onClose}
                className="bg-[#138FB5] hover:bg-[#138FB5]/80 text-white"
              >
                保存
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
