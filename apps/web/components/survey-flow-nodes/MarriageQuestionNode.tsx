import { Handle, Position } from "@xyflow/react";
import { Comment } from "@/app/(auth)/surveys/(review)/[id]/review/_components/comment";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ReviewItem } from "@/lib/types/review";

type MarriageQuestionNodeProps = {
  data?: { reviewItems?: ReviewItem[] };
  id: string;
};

export const MarriageQuestionNode = ({
  data,
  id,
}: MarriageQuestionNodeProps) => {
  const marriageOptions = [
    { id: "1", label: "未婚" },
    { id: "2", label: "既婚（離別・死別含む）" },
  ];

  // Filter comments for this specific question
  const questionComments =
    data?.reviewItems?.filter((item) => item.questionId === id) || [];

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      {/* Comments positioned absolutely around the question */}
      {questionComments.map((comment) => (
        <div
          key={comment.id}
          className="absolute"
          style={{
            left: `${comment.position?.x ?? 0}%`,
            top: `${comment.position?.y ?? 0}%`,
            zIndex: 10,
          }}
        >
          <Comment {...comment} />
        </div>
      ))}

      <Card className="w-64 border border-solid border-[#8e99a2] bg-white rounded-lg p-0">
        <div className="flex items-center relative w-full bg-[#f5f5f5] rounded-t-lg border border-solid border-[#8e99a2]">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-[#138FB5] rounded-tl-lg">
            <Badge className="bg-[#138FB5] border-none px-0 h-auto">
              <span className="font-medium text-white text-[12px] text-center leading-[14px] whitespace-nowrap">
                Q4
              </span>
            </Badge>
          </div>

          <div className="inline-flex items-center gap-3 ml-3">
            <div className="inline-flex items-center gap-1">
              <span className="font-medium text-[#333333] text-[12px] text-center leading-[24px] whitespace-nowrap">
                スクリーニング設問
              </span>
            </div>

            <span className="font-medium text-[#333333] text-[12px] text-center leading-[24px] whitespace-nowrap">
              SA
            </span>
          </div>
        </div>

        <CardContent className="flex flex-col items-start gap-2 pt-2 pb-4 px-6">
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center flex-1">
              <span className="flex-1 font-medium text-[#333333] text-[12px] leading-[24px]">
                あなたは結婚していますか？
              </span>
            </div>
          </div>

          <RadioGroup className="w-full space-y-0">
            {marriageOptions.map((option) => (
              <div key={option.id} className="flex items-center gap-2 w-full">
                <div className="w-10 flex items-center justify-end">
                  <RadioGroupItem
                    value={option.id}
                    id={`marriage-${option.id}`}
                    className="w-3 h-3 border-[#cbcbcb] data-[state=unchecked]:bg-white"
                  />
                  <div className="w-6 flex items-center justify-center">
                    <span className="font-medium text-[#333333] text-[12px] text-center leading-[14px] whitespace-nowrap">
                      {option.id}
                    </span>
                  </div>
                </div>

                <div className="px-2 py-0 flex-1 rounded flex items-center">
                  <Label
                    htmlFor={`marriage-${option.id}`}
                    className="flex-1 text-[#333333] text-[12px] leading-[24px] cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
                {option.id === "1" && (
                  <div className="text-[10px] text-green-600 font-semibold">
                    → Q5へ
                  </div>
                )}
                {option.id === "2" && (
                  <div className="text-[10px] text-red-600 font-semibold">
                    → Q6へ
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};
