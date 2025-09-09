import { PublishStep } from "@/components/publish-step";
import { Card, CardHeader } from "@/components/ui/card";

type SurveyCardHeaderProps = {
  title?: string;
  workingTitleLabel?: string;
  workingTitle: string;
  currentStep: number;
  surveyId?: number;
};

export const SurveyCardHeader = ({
  title = "新規調査作成",
  workingTitleLabel = "現在作業中のタイトル",
  workingTitle,
  currentStep,
  surveyId,
}: SurveyCardHeaderProps) => {
  return (
    <Card className="w-full rounded-t-lg shadow-none border-0">
      <CardHeader className="flex flex-col p-0 space-y-0">
        <div className="flex flex-col h-16 items-start justify-center gap-2.5 px-6 py-[9px] relative w-full bg-[#138FB5] rounded-[8px_8px_0px_0px]">
          <div className="flex items-center gap-4 relative w-full">
            <div className="inline-flex items-center gap-2 relative">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans_JP',Helvetica] font-bold text-white text-lg tracking-[0] leading-[normal]">
                {title}
              </div>
            </div>

            <div className="flex items-center relative flex-1 grow">
              <div className="inline-flex h-8 items-center gap-2 px-4 py-2 relative bg-[#E7ECF0] rounded-[4px_0px_0px_4px]">
                <div className="relative w-fit mt-[-2.00px] [font-family:'YuGothic-Bold',Helvetica] font-bold text-[#333333] text-xs tracking-[0.48px] leading-[18px] whitespace-nowrap">
                  {workingTitleLabel}
                </div>
              </div>

              <div className="flex h-8 items-center gap-[7px] px-3 py-2 relative flex-1 grow bg-white rounded-[0px_4px_4px_0px]">
                <div className="relative w-fit mt-[-2.00px] [font-family:'YuGothic-Bold',Helvetica] font-bold text-[#333333] text-xs tracking-[0.48px] leading-[18px] whitespace-nowrap">
                  {workingTitle}
                </div>
              </div>
            </div>
          </div>
        </div>
        <PublishStep currentStep={currentStep} surveyId={surveyId} />
      </CardHeader>
    </Card>
  );
};
