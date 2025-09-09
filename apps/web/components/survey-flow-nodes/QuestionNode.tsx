import { Handle, Position } from "@xyflow/react";
import { Comment } from "@/app/(auth)/surveys/(review)/[id]/review/_components/comment";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ReviewItem } from "@/lib/types/review";

type QuestionNodeProps = {
  data: {
    id: string;
    type: string;
    question: string;
    isMainSurvey?: boolean;
    reviewItems?: ReviewItem[];
  };
  id: string;
};

export const QuestionNode = ({ data, id }: QuestionNodeProps) => {
  // Filter comments for this specific question
  const questionComments =
    data.reviewItems?.filter((item) => item.questionId === id) || [];

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

      <Card className="flex flex-col items-start w-64 bg-white rounded-lg border border-solid border-[#dcdcdc]">
        <CardHeader className="p-0 w-full space-y-0">
          <div className="flex items-center w-full bg-[#f5f5f5] rounded-t-lg border border-solid border-[#dcdcdc]">
            <div className="inline-flex items-center justify-center p-2 bg-[#138FB5] rounded-tl-lg">
              <span className="font-medium text-white text-[12px] leading-[14px] text-center whitespace-nowrap">
                {data.id}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-2">
              <div className="flex items-center gap-1">
                <span className="font-medium text-[#333333] text-[11px] leading-[24px] text-center whitespace-nowrap">
                  {data.isMainSurvey
                    ? "本調査設問"
                    : "スクリーニング設問・固定設問"}
                </span>
              </div>
              <Badge
                variant="outline"
                className="font-medium text-[#333333] text-[11px] leading-[24px] text-center whitespace-nowrap bg-transparent border-none px-0"
              >
                {data.type}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4 px-6 py-2 w-full">
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center flex-1">
              <p className="flex-1 font-medium text-[#333333] text-[12px] leading-[24px]">
                {data.question}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};
