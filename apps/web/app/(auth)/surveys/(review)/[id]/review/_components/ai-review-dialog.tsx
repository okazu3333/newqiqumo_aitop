"use client";

import {
  ChevronDown,
  CircleCheck,
  Download,
  Edit2,
  Ellipsis,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  QuestionForm,
  type QuestionOption,
  type QuestionType,
} from "@/components/question-form/question-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/trpc/react";

type AiReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType?: "reviewer" | "reviewee";
  question?: {
    id: number;
    code: string;
    title: string;
    type: string;
    options?: Array<{
      id?: number;
      value: string;
      label: string;
    }>;
    suffix?: string | null;
    // biome-ignore lint/suspicious/noExplicitAny: some reason
    config?: any;
    isRequired: boolean;
    respondentCondition?: string;
    answerControl?: string;
    targetCondition?: string;
    skipCondition?: string;
    displayOrder?: string;
    jumpCondition?: string;
  };
  threadId?: number;
  threadMessage?: string;
  threadCreatedBy?: string;
  threadCreatedAt?: Date | string;
  threadIsCompleted?: boolean;
  reviews?: Array<{
    id: number;
    message: string;
    createdBy: string;
    createdAt: Date | string;
  }>;
  sectionName?: string;
  sectionPhase?: "SCREENING" | "MAIN";
};

type QuestionSetting = {
  label: string;
  hasInfo?: boolean;
  value: string;
  type?: "toggle" | "input" | "textarea";
};

type AiReview = {
  title: string;
  time: string;
  content: string;
};

export const AiReviewDialog = ({
  open,
  onOpenChange,
  userType = "reviewee",
  question,
  threadMessage,
  threadCreatedAt,
  threadIsCompleted = false,
  reviews,
  sectionName,
  sectionPhase,
}: AiReviewDialogProps) => {
  const [status, _setStatus] = useState<"resolved" | "unresolved">(
    threadIsCompleted ? "resolved" : "unresolved",
  );
  const [questionOptions, setQuestionOptions] = useState<QuestionOption[]>([]);
  const [questionTitle, setQuestionTitle] = useState(question?.title || "");
  const [questionType, setQuestionType] = useState<QuestionType>(
    (question?.type === "NUM" ? "NU" : question?.type || "SA") as QuestionType,
  );
  const [isRequired, setIsRequired] = useState(question?.isRequired ?? true);
  const [suffix, setSuffix] = useState(question?.suffix || "");
  const [placeholder, setPlaceholder] = useState(
    question?.config?.placeholder || "",
  );

  // States for logic control settings
  const [respondentCondition, setRespondentCondition] = useState("全員");
  const [answerControl, setAnswerControl] = useState("なし");
  const [targetCondition, setTargetCondition] = useState("なし");
  const [skipCondition, setSkipCondition] = useState("なし");
  const [displayOrder, setDisplayOrder] = useState("通常");
  const [jumpCondition, setJumpCondition] = useState("なし");

  const questionSettings: QuestionSetting[] = [
    {
      label: "必須回答",
      hasInfo: true,
      value: isRequired ? "必須オン" : "必須オフ",
      type: "toggle",
    },
    { label: "回答者条件", hasInfo: true, value: respondentCondition },
    { label: "回答制御", hasInfo: true, value: answerControl },
    { label: "対象者条件", hasInfo: true, value: targetCondition },
    { label: "スキップ条件", hasInfo: true, value: skipCondition },
    { label: "カテゴリ表示順", hasInfo: true, value: displayOrder },
    { label: "ジャンプ条件", hasInfo: true, value: jumpCondition },
  ];

  const [aiReviews, setAiReviews] = useState<AiReview[]>([]);
  const [editingReviewIndex, setEditingReviewIndex] = useState<number | null>(
    null,
  );
  const [editingReviewContent, setEditingReviewContent] = useState("");

  // Update question mutation
  const updateQuestionMutation = api.question.update.useMutation({
    onSuccess: () => {
      // Optionally show success message
      onOpenChange(false);
    },
  });

  // Initialize question data when question prop changes
  useEffect(() => {
    if (question) {
      setQuestionTitle(question.title);
      setQuestionType(
        (question.type === "NUM" ? "NU" : question.type) as QuestionType,
      );
      setIsRequired(question.isRequired);
      setSuffix(question.suffix || "");
      setPlaceholder(
        question.config?.placeholder ||
          (typeof question.config === "string"
            ? JSON.parse(question.config).placeholder || ""
            : ""),
      );

      // Initialize logic control settings
      setRespondentCondition(question.respondentCondition || "全員");
      setAnswerControl(question.answerControl || "なし");
      setTargetCondition(question.targetCondition || "なし");
      setSkipCondition(question.skipCondition || "なし");
      setDisplayOrder(question.displayOrder || "通常");
      setJumpCondition(question.jumpCondition || "なし");

      if (question.options) {
        setQuestionOptions(
          question.options.map((opt, index) => ({
            id: opt.id || index + 1,
            label: opt.label,
          })),
        );
      }
    }
  }, [question]);

  // Initialize AI reviews when dialog opens or data changes
  useEffect(() => {
    if (open && threadMessage) {
      const formattedReviews: AiReview[] = [];

      // Add thread message as first review
      formattedReviews.push({
        title: "AIレビュー・回答テスト結果",
        time: threadCreatedAt
          ? typeof threadCreatedAt === "string" &&
            threadCreatedAt.includes("前")
            ? threadCreatedAt
            : new Date(threadCreatedAt).toLocaleString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })
          : "今",
        content: threadMessage,
      });

      // Add other reviews if they exist
      if (reviews && reviews.length > 0) {
        reviews.forEach((review) => {
          formattedReviews.push({
            title: review.createdBy,
            time: new Date(review.createdAt).toLocaleString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            content: review.message,
          });
        });
      }

      setAiReviews(formattedReviews);
    }
  }, [open, threadMessage, reviews, threadCreatedAt]);

  const handleOptionsChange = (options: QuestionOption[]) => {
    setQuestionOptions(options);
  };

  const handleEditReview = (index: number) => {
    setEditingReviewIndex(index);
    setEditingReviewContent(aiReviews[index].content);
  };

  const handleSaveEdit = () => {
    if (editingReviewIndex !== null) {
      const newReviews = [...aiReviews];
      newReviews[editingReviewIndex] = {
        ...newReviews[editingReviewIndex],
        content: editingReviewContent,
      };
      setAiReviews(newReviews);
      setEditingReviewIndex(null);
      setEditingReviewContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewIndex(null);
    setEditingReviewContent("");
  };

  const handleDeleteReview = (index: number) => {
    const newReviews = aiReviews.filter((_, i) => i !== index);
    setAiReviews(newReviews);
  };

  const handleSaveQuestion = async () => {
    if (!question?.id) return;

    type UpdateData = {
      id: number;
      title: string;
      type: "SA" | "MA" | "FA" | "NUM";
      isRequired: boolean;
      suffix?: string;
      config?: { placeholder: string };
      respondentCondition?: string;
      answerControl?: string;
      targetCondition?: string;
      skipCondition?: string;
      displayOrder?: string;
      jumpCondition?: string;
      options?: Array<{
        id?: number;
        code: string;
        label: string;
        value: string;
        order: number;
      }>;
    };

    const updateData: UpdateData = {
      id: question.id,
      title: questionTitle,
      type: questionType === "NU" ? "NUM" : questionType,
      isRequired,
      respondentCondition,
      answerControl,
      targetCondition,
      skipCondition,
      displayOrder,
      jumpCondition,
    };

    // Add type-specific fields
    if (questionType === "NU") {
      updateData.suffix = suffix;
    } else if (questionType === "FA") {
      updateData.config = { placeholder };
    }

    // Add options for SA/MA types
    if (
      (questionType === "SA" || questionType === "MA") &&
      questionOptions.length > 0
    ) {
      updateData.options = questionOptions.map((opt, index) => ({
        id: typeof opt.id === "number" ? opt.id : undefined,
        code: `OPT${index + 1}`,
        label: opt.label,
        value: opt.label,
        order: index + 1,
      }));
    }

    await updateQuestionMutation.mutateAsync(updateData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1376px] max-h-[90vh] h-[960px] p-0 gap-0 bg-white rounded-[48px] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)] overflow-hidden flex">
        <DialogTitle className="sr-only">AIレビュー・編集画面</DialogTitle>
        <div className="flex flex-col items-start gap-2.5 pt-16 pb-10 px-16 h-full w-full">
          <div className="flex items-start gap-8 relative w-full h-full overflow-hidden">
            {/* Left Panel - Question Editor */}
            <div className="flex flex-col items-center gap-4 flex-1 w-full h-full overflow-hidden">
              <div className="flex flex-col items-start w-full flex-1 overflow-hidden">
                {/* Tab Header */}
                <div className="flex items-center gap-2 px-6 py-0 w-full">
                  <div className="flex items-center justify-center w-52 h-10 bg-[#138FB5] text-white font-bold text-base rounded-[8px_8px_0px_0px] px-8 py-2">
                    {sectionPhase === "MAIN" ? "本調査" : "スクリーニング調査"}
                  </div>

                  <Button className="h-8 bg-[#60ADC2] hover:bg-[#4d96ab] rounded-[20px] flex items-center gap-1 px-6 py-4">
                    <Download className="w-6 h-6" />
                    <span className="font-bold text-sm text-white whitespace-nowrap">
                      テスト結果DL
                    </span>
                  </Button>

                  <div className="flex h-6 items-center justify-end gap-2.5 flex-1">
                    <div className="font-medium text-xs text-[#333333] whitespace-nowrap">
                      レビューステータス
                    </div>
                    {status === "resolved" ? (
                      <CircleCheck className="w-4 h-4 text-white fill-[#138FB5]" />
                    ) : (
                      <CircleCheck className="w-4 h-4 text-[#979BA2]" />
                    )}
                    <div className="w-10 font-bold text-xs text-[#333333] text-center">
                      {status === "resolved" ? "完了" : "未完了"}
                    </div>
                  </div>
                </div>

                {/* Question Content Area */}
                <div className="flex flex-col items-start w-full flex-1 overflow-hidden">
                  <Card className="flex flex-col items-start gap-4 p-4 w-full h-full bg-[#138FB5] rounded-lg border-none">
                    <ScrollArea className="w-full h-full rounded-lg shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]">
                      <div className="flex flex-col items-start gap-4 px-10 py-8 w-full bg-[#F4F7F9] rounded border border-solid border-[#dcdcdc]">
                        <div className="inline-flex items-center gap-2">
                          <div className="font-bold text-xs text-[#333333] whitespace-nowrap">
                            {sectionName
                              ? `セクション：${sectionName}`
                              : "セクション：未設定"}
                          </div>
                        </div>

                        <Card className="flex flex-col items-start w-full bg-white rounded-lg border border-solid border-[#dcdcdc]">
                          <div className="flex items-center gap-3 pl-3 pr-0 py-0 w-full bg-[#f5f5f5] rounded-[8px_8px_0px_0px] border border-solid border-[#dcdcdc]">
                            <Checkbox className="w-4 h-4" />
                            <div className="inline-flex items-center justify-center px-4 py-2 bg-[#138FB5]">
                              <div className="w-fit mt-[-1.00px] font-medium text-white text-base text-center whitespace-nowrap">
                                {question?.code || "Q1"}
                              </div>
                            </div>
                          </div>

                          <CardContent className="flex flex-col items-start gap-4 pt-4 pb-6 px-12 w-full">
                            <Select
                              value={questionType}
                              onValueChange={(value) =>
                                setQuestionType(value as QuestionType)
                              }
                              disabled={userType !== "reviewee"}
                            >
                              <SelectTrigger className="flex w-[200px] items-center justify-between pl-4 pr-2 py-1 rounded-[3px] border border-solid border-[#dcdcdc]">
                                <div className="inline-flex items-center gap-[9px]">
                                  <div className="w-10 font-bold text-xs text-[#333333]">
                                    {questionType}
                                  </div>
                                  <div className="font-bold text-xs text-[#333333] whitespace-nowrap">
                                    {questionType === "MA"
                                      ? "複数選択方式"
                                      : questionType === "FA"
                                        ? "自由記述方式"
                                        : questionType === "NU"
                                          ? "数値入力方式"
                                          : "単一選択方式"}
                                  </div>
                                </div>
                                <ChevronDown className="w-4 h-4" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SA">単一選択方式</SelectItem>
                                <SelectItem value="MA">複数選択方式</SelectItem>
                                <SelectItem value="FA">自由記述方式</SelectItem>
                                <SelectItem value="NU">数値入力方式</SelectItem>
                              </SelectContent>
                            </Select>

                            <div className="flex flex-col items-start gap-2 w-full">
                              <QuestionForm
                                includeHeader={false}
                                type={questionType}
                                questionNumber={question?.code || "Q1"}
                                questionText={questionTitle}
                                options={questionOptions}
                                suffix={suffix}
                                placeholder={placeholder}
                                isEditable={userType === "reviewee"}
                                isMultiline={true}
                                onQuestionChange={setQuestionTitle}
                                onOptionsChange={handleOptionsChange}
                                onSuffixChange={setSuffix}
                                onPlaceholderChange={setPlaceholder}
                              />
                            </div>

                            <div className="flex flex-col items-start gap-2 px-6 py-3.5 w-full bg-[#f5f5f5] rounded overflow-hidden">
                              {questionSettings.map((setting, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 w-full"
                                >
                                  <div className="flex w-36 items-center gap-1 px-0 py-1">
                                    <div className="inline-flex items-center gap-2">
                                      <div className="font-medium text-sm text-[#333333] whitespace-nowrap">
                                        {setting.label}
                                      </div>
                                      {setting.hasInfo && (
                                        <div className="inline-flex items-center pt-0.5 pb-0 px-0 self-stretch">
                                          <HelpCircle className="w-4 h-4 text-[#606060]" />
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {setting.type === "toggle" ? (
                                    <div className="inline-flex items-center gap-2 px-0 py-1">
                                      <Switch
                                        checked={isRequired}
                                        onCheckedChange={setIsRequired}
                                        disabled={userType !== "reviewee"}
                                        className="data-[state=checked]:bg-[#138FB5]"
                                      />
                                      <div className="font-medium text-xs text-[#333333] text-center whitespace-nowrap">
                                        {isRequired ? "必須オン" : "必須オフ"}
                                      </div>
                                    </div>
                                  ) : userType === "reviewee" ? (
                                    <Input
                                      value={setting.value}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        switch (setting.label) {
                                          case "回答者条件":
                                            setRespondentCondition(value);
                                            break;
                                          case "回答制御":
                                            setAnswerControl(value);
                                            break;
                                          case "対象者条件":
                                            setTargetCondition(value);
                                            break;
                                          case "スキップ条件":
                                            setSkipCondition(value);
                                            break;
                                          case "カテゴリ表示順":
                                            setDisplayOrder(value);
                                            break;
                                          case "ジャンプ条件":
                                            setJumpCondition(value);
                                            break;
                                        }
                                      }}
                                      className="min-h-10 flex-1"
                                    />
                                  ) : (
                                    <div className="min-h-10 flex items-center gap-1.5 px-4 py-2 flex-1 bg-white rounded-sm border border-solid border-[#dcdcdc]">
                                      <div className="font-normal text-sm text-[#333333] whitespace-nowrap">
                                        {setting.value}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex h-20 items-center justify-center gap-6 w-full">
                <Button
                  variant="outline"
                  className="h-10 bg-white hover:bg-gray-50 rounded-[20px] border border-solid border-[#dcdcdc] min-w-[168px] px-6 py-4"
                  onClick={() => onOpenChange(false)}
                >
                  <span className="font-bold text-base text-[#3a3a3a] whitespace-nowrap">
                    キャンセル
                  </span>
                </Button>

                {userType === "reviewee" && (
                  <Button
                    className="h-10 bg-[#556064] hover:bg-[#444b4f] rounded-[20px] min-w-[168px] px-6 py-4"
                    onClick={handleSaveQuestion}
                    disabled={updateQuestionMutation.isPending}
                  >
                    <span className="font-bold text-base text-white text-center whitespace-nowrap">
                      {updateQuestionMutation.isPending
                        ? "保存中..."
                        : "編集を保存して反映する"}
                    </span>
                  </Button>
                )}
              </div>
            </div>

            {/* Right Panel - AI Reviews */}
            <div className="flex flex-col w-[480px] h-full bg-[#F4F7F9] rounded-lg overflow-hidden">
              <div className="flex flex-col gap-2 py-2 w-full h-full">
                <ScrollArea className="w-full h-full">
                  <div className="flex flex-col">
                    {aiReviews.map((review, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-4 px-6 py-2 w-full border-b-2 border-white"
                      >
                        <div className="flex flex-col gap-0.5 w-full">
                          <div className="flex items-start gap-0.5 w-full">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="font-medium text-sm text-[#9DA0A7] leading-[1.714]">
                                {review.title}
                              </div>
                              <div className="font-medium text-xs text-[#9DA0A7] leading-[2]">
                                {review.time}
                              </div>
                            </div>
                            {index !== 0 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex items-center h-5"
                                  >
                                    <Ellipsis className="w-5 h-5 text-[#979BA2]" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditReview(index)}
                                  >
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    編集
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteReview(index)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    削除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <div className="w-full">
                            {editingReviewIndex === index ? (
                              <div className="flex flex-col gap-2">
                                <Textarea
                                  value={editingReviewContent}
                                  onChange={(e) =>
                                    setEditingReviewContent(e.target.value)
                                  }
                                  className="min-h-[80px] font-medium text-sm text-[#333333] leading-[1.714] resize-none"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    className="h-8 bg-[#138FB5] hover:bg-[#0f7a9f]"
                                  >
                                    保存
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="h-8"
                                  >
                                    キャンセル
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="font-medium text-sm text-[#333333] leading-[1.714]">
                                {review.content}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
