"use client";

import {
  ChevronDown,
  CircleCheck,
  Edit2,
  HelpCircle,
  MoreHorizontal,
  SendIcon,
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

type UserReviewDialogProps = {
  userType?: "reviewer" | "reviewee";
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  createdBy?: string;
  displayName?: string;
  sectionName?: string;
  sectionPhase?: "SCREENING" | "MAIN";
};

export const UserReviewDialog = ({
  userType = "reviewee",
  open,
  onOpenChange,
  question,
  threadId,
  threadMessage,
  threadCreatedBy,
  threadCreatedAt,
  threadIsCompleted = false,
  reviews,
  createdBy,
  displayName,
  sectionName,
  sectionPhase,
}: UserReviewDialogProps) => {
  const [commentText, setCommentText] = useState("");
  const [status, setStatus] = useState<"resolved" | "unresolved">(
    threadIsCompleted ? "resolved" : "unresolved",
  );
  const [comments, setComments] = useState<
    Array<{
      author: string;
      time: string;
      content: string;
      isThreadMessage?: boolean;
    }>
  >([]);
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(
    null,
  );
  const [editingCommentContent, setEditingCommentContent] = useState("");

  // State for question editing
  const [questionTitle, setQuestionTitle] = useState(question?.title || "");
  const [questionType, setQuestionType] = useState<QuestionType>(
    (question?.type === "NUM" ? "NU" : question?.type || "SA") as QuestionType,
  );
  const [isRequired, setIsRequired] = useState(question?.isRequired ?? true);
  const [suffix, setSuffix] = useState(question?.suffix || "");
  const [placeholder, setPlaceholder] = useState(
    question?.config?.placeholder || "",
  );
  const [questionOptions, setQuestionOptions] = useState<QuestionOption[]>([]);

  // States for logic control settings
  const [respondentCondition, setRespondentCondition] = useState("全員");
  const [answerControl, setAnswerControl] = useState("なし");
  const [targetCondition, setTargetCondition] = useState("なし");
  const [skipCondition, setSkipCondition] = useState("なし");
  const [displayOrder, setDisplayOrder] = useState("通常");
  const [jumpCondition, setJumpCondition] = useState("なし");

  // tRPC mutation for creating reviews
  const createReviewMutation = api.review.create.useMutation();

  // Update question mutation
  const updateQuestionMutation = api.question.update.useMutation({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  // Update status when threadIsCompleted changes
  useEffect(() => {
    setStatus(threadIsCompleted ? "resolved" : "unresolved");
  }, [threadIsCompleted]);

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

  // Initialize comments when dialog opens or data changes
  useEffect(() => {
    if (open) {
      const formattedComments = [];

      // Add thread message as first comment if it exists
      if (threadMessage) {
        formattedComments.push({
          author: threadCreatedBy || "田中太郎",
          time: threadCreatedAt
            ? typeof threadCreatedAt === "string" &&
              threadCreatedAt.includes("前")
              ? threadCreatedAt // If it's already a relative time string like "15分前"
              : new Date(threadCreatedAt).toLocaleString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
            : new Date().toLocaleString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
          content: threadMessage,
          isThreadMessage: true,
        });
      }

      // Add reviews if they exist
      if (reviews && reviews.length > 0) {
        reviews.forEach((review) => {
          formattedComments.push({
            author: review.createdBy,
            time: new Date(review.createdAt).toLocaleString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            content: review.message,
            isThreadMessage: false,
          });
        });
      }

      setComments(formattedComments);
    }
  }, [open, threadMessage, reviews, threadCreatedBy, threadCreatedAt]);

  // Settings data
  const settingsData = [
    {
      label: "必須回答",
      value: isRequired ? "必須オン" : "必須オフ",
      icon: true,
      hasSwitch: true,
    },
    { label: "回答者条件", value: respondentCondition, icon: true },
    { label: "回答制御", value: answerControl, icon: true },
    { label: "対象者条件", value: targetCondition, icon: true },
    { label: "スキップ条件", value: skipCondition, icon: true },
    { label: "カテゴリ表示順", value: displayOrder, icon: true },
    { label: "ジャンプ条件", value: jumpCondition, icon: true },
  ];

  // Handle comment submission
  const handleSendComment = async () => {
    if (commentText.trim()) {
      // Determine the author name based on userType and available props
      const authorName =
        userType === "reviewer" && displayName
          ? displayName
          : createdBy || "現在のユーザー";

      if (threadId) {
        // If we have a threadId, send via tRPC
        try {
          const newReview = await createReviewMutation.mutateAsync({
            threadId,
            message: commentText,
            createdBy: authorName,
          });

          const newComment = {
            author: newReview.createdBy,
            time: "今",
            content: newReview.message,
            isThreadMessage: false,
          };
          setComments([...comments, newComment]);
          setCommentText("");
        } catch (error) {
          console.error("Failed to send comment:", error);
        }
      } else {
        // If no threadId, just add to local state
        const newComment = {
          author: authorName,
          time: "今",
          content: commentText,
          isThreadMessage: false,
        };
        setComments([...comments, newComment]);
        setCommentText("");
      }
    }
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

  const handleOptionsChange = (options: QuestionOption[]) => {
    setQuestionOptions(options);
  };

  const handleEditComment = (index: number) => {
    setEditingCommentIndex(index);
    setEditingCommentContent(comments[index].content);
  };

  const handleSaveEditComment = () => {
    if (editingCommentIndex !== null) {
      const newComments = [...comments];
      newComments[editingCommentIndex] = {
        ...newComments[editingCommentIndex],
        content: editingCommentContent,
      };
      setComments(newComments);
      setEditingCommentIndex(null);
      setEditingCommentContent("");
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentIndex(null);
    setEditingCommentContent("");
  };

  const handleDeleteComment = (index: number) => {
    const newComments = comments.filter((_, i) => i !== index);
    setComments(newComments);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1376px] max-h-[90vh] h-[960px] p-0 gap-0 bg-white rounded-[48px] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)] overflow-hidden flex">
        <DialogTitle className="sr-only">レビュー・編集画面</DialogTitle>
        <div className="flex flex-col items-start gap-2.5 pt-16 pb-10 px-16 h-full w-full">
          <div className="flex items-start gap-8 relative w-full h-full overflow-hidden">
            {/* Left Panel - Question Editor */}
            <div className="flex flex-col items-center gap-4 flex-1 w-full h-full overflow-hidden">
              <div className="flex flex-col items-start w-full flex-1 overflow-hidden">
                {/* Tab Header */}
                <div className="flex items-center justify-between gap-2 px-6 py-0 w-full">
                  <div className="flex items-center justify-center w-52 h-10 bg-[#138FB5] text-white font-bold text-base rounded-[8px_8px_0px_0px] px-8 py-2">
                    {sectionPhase === "MAIN" ? "本調査" : "スクリーニング調査"}
                  </div>

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
                              {settingsData.map((setting, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 w-full"
                                >
                                  <div className="flex w-36 items-center gap-1 px-0 py-1">
                                    <div className="inline-flex items-center gap-2">
                                      <div className="font-medium text-sm text-[#333333] whitespace-nowrap">
                                        {setting.label}
                                      </div>
                                      {setting.icon && (
                                        <div className="inline-flex items-center pt-0.5 pb-0 px-0 self-stretch">
                                          <HelpCircle className="w-4 h-4 text-[#606060]" />
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {setting.hasSwitch ? (
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

            {/* Right Panel - Comments */}
            <Card className="flex flex-col w-[480px] h-full items-start bg-[#F4F7F9] rounded-lg overflow-hidden border-none">
              <CardContent className="flex flex-col items-start gap-2 px-0 py-2 w-full h-full overflow-hidden">
                <ScrollArea className="w-full h-full">
                  {comments.map((comment, index) => (
                    <div
                      key={index}
                      className={`flex flex-col items-start gap-4 px-6 py-0 relative self-stretch w-full border-b-2 ${
                        comment.isThreadMessage
                          ? "bg-blue-50 border-blue-100"
                          : "border-white"
                      }`}
                    >
                      <div className="flex-col min-h-10 items-start justify-center gap-0.5 px-0 py-2 self-stretch w-full flex">
                        <div className="flex items-start gap-0.5 relative self-stretch w-full">
                          <div className="flex items-center gap-2 relative flex-1 grow">
                            <div
                              className={`font-medium text-sm whitespace-nowrap ${
                                comment.isThreadMessage
                                  ? "text-[#138FB5] font-bold"
                                  : "text-fontgray"
                              }`}
                            >
                              {comment.author}
                            </div>
                            <div className="font-medium text-xs text-fontgray whitespace-nowrap">
                              {comment.time}
                            </div>
                          </div>
                          {index !== 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="flex items-center h-5"
                                >
                                  <MoreHorizontal className="w-5 h-5 text-[#979BA2]" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditComment(index)}
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  編集
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteComment(index)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  削除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <div className="flex flex-col items-start justify-center relative self-stretch w-full">
                          {editingCommentIndex === index ? (
                            <div className="flex flex-col gap-2 w-full">
                              <Textarea
                                value={editingCommentContent}
                                onChange={(e) =>
                                  setEditingCommentContent(e.target.value)
                                }
                                className="min-h-[80px] font-medium text-sm text-[#333333] resize-none"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSaveEditComment}
                                  className="h-8 bg-[#138FB5] hover:bg-[#0f7a9f]"
                                >
                                  保存
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEditComment}
                                  className="h-8"
                                >
                                  キャンセル
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="self-stretch font-medium text-sm text-fontdefault">
                              {comment.content}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>

              {/* Comment input */}
              <div className="flex items-start gap-3 px-4 py-4 pl-6 bg-[#138FB5] w-full">
                <div className="flex items-end gap-3 w-full">
                  <div className="flex-1 bg-white rounded-lg shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendComment();
                        }
                      }}
                      placeholder="コメントを入力..."
                      className="w-full min-h-[40px] px-4 py-2 bg-transparent border-none resize-none font-medium text-base text-[#333333] placeholder:text-[#999999] focus:outline-none"
                    />
                  </div>
                  <div className="pb-3.5">
                    <Button
                      size="icon"
                      className="w-9 h-9 bg-[#484848] hover:bg-[#333333] rounded-full p-0"
                      onClick={handleSendComment}
                    >
                      <SendIcon className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
