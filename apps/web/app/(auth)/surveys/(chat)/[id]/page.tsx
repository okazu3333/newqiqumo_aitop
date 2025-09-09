"use client";

import {
  CheckCircle2,
  ChevronRightIcon,
  CircleHelp,
  ExternalLink,
  TriangleAlert,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SurveyCardHeader } from "@/components/survey-card-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/trpc/react";
import { SurveyForm, type SurveyFormData } from "../_components/survey-form";
import { useChatContext } from "../chat-context";
import { PublishAvailableConfirmDialog } from "../new/_components/publish-available-confirm-dialog";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const surveyIdString = params.id as string;
  const surveyId = Number(surveyIdString);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    setNewSurveyUserMessages,
    newSurveyUserMessages,
    setNewSurveyAiResponses,
    newSurveyAiResponses,
  } = useChatContext();

  const { data: survey, isLoading } = api.survey.getById.useQuery({
    id: surveyId,
  });

  const updateSurvey = api.survey.update.useMutation({
    onSuccess: () => {
      toast.success("調査が更新されました");
      router.push(`/surveys/${surveyIdString}/sections`);
    },
    onError: (error) => {
      toast.error(`更新に失敗しました: ${error.message}`);
    },
  });

  const form = useForm<SurveyFormData>();
  const { handleSubmit, reset, watch, setValue } = form;
  const targetCondition = watch("targetCondition") || "";

  useEffect(() => {
    if (survey) {
      reset({
        title: survey.title || "",
        purpose: survey.purpose || "",
        targetCondition: survey.targetCondition || "",
        analysisCondition: survey.analysisCondition || "",
        researchMethod: survey.researchMethod || "",
        researchScale: survey.researchScale || "",
      });
    }
  }, [survey, reset]);

  // Check if targetCondition contains residence info (e.g., "在住")
  const hasResidenceCondition = targetCondition.includes("在住");

  // Check if targetCondition contains age info (e.g., "代")
  const hasAgeCondition = /\d+代/.test(targetCondition);

  // Both conditions are satisfied
  const isDistributionOptimal = hasResidenceCondition && hasAgeCondition;

  const onSubmit = async (data: SurveyFormData) => {
    // PoCではワンクリックで次へ進めるように常に更新→遷移
    await updateSurvey.mutateAsync({
      id: surveyId,
      ...data,
    });
  };

  const handleEditSurvey = () => {
    setIsDialogOpen(false);
  };

  const handleProceedAnyway = async () => {
    setIsDialogOpen(false);
    const data = form.getValues();
    await updateSurvey.mutateAsync({
      id: surveyId,
      ...data,
    });
  };

  const handleExpandResidence = () => {
    const currentCondition = targetCondition;
    const newCondition = currentCondition
      ? `${currentCondition}\n東京都在住`
      : "東京都在住";
    setValue("targetCondition", newCondition);

    // Add message to AI chat
    const userMessage = "居住地を広げる";
    setNewSurveyUserMessages([...newSurveyUserMessages, userMessage]);

    const aiResponse = {
      text: "調査AIパネルに下記条件を拡張しました：\n\n【調査対象者条件】\n東京都在住を追加しました。\n\n都市部での調査は回答者を集めやすく、配信可能数が増加します。",
    };
    setNewSurveyAiResponses([...newSurveyAiResponses, aiResponse]);
  };

  const handleExpandAge = () => {
    const currentCondition = targetCondition;
    const newCondition = currentCondition
      ? `${currentCondition}\n20代男性`
      : "20代男性";
    setValue("targetCondition", newCondition);

    // Add message to AI chat
    const userMessage = "年齢条件を広げる";
    setNewSurveyUserMessages([...newSurveyUserMessages, userMessage]);

    const aiResponse = {
      text: "調査AIパネルに下記条件を拡張しました：\n\n【調査対象者条件】\n20代男性を追加しました。\n\n若年層は調査への参加率が高く、配信可能数が増加します。",
    };
    setNewSurveyAiResponses([...newSurveyAiResponses, aiResponse]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full">
        <SurveyCardHeader
          workingTitle="読み込み中..."
          currentStep={0}
          surveyId={surveyId}
        />
        <div className="flex flex-col w-full items-center gap-6 p-6 bg-[#ffffff] rounded-b-lg shadow-main-bg">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
            <div className="h-96 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex flex-col w-full">
        <SurveyCardHeader
          workingTitle="調査が見つかりません"
          currentStep={0}
          surveyId={surveyId}
        />
        <div className="flex flex-col w-full items-center gap-6 p-6 bg-[#ffffff] rounded-b-lg shadow-main-bg">
          <p className="text-center text-gray-500">
            調査が見つかりませんでした
          </p>
          <Button onClick={() => router.push("/")}>調査一覧に戻る</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full">
        <SurveyCardHeader
          workingTitle={`${survey.title || "調査の編集"}`}
          currentStep={0}
          surveyId={surveyId}
        />
        <div className="flex flex-col w-full items-center gap-6 p-6 bg-[#ffffff] rounded-b-lg shadow-main-bg">
          {/* Survey Overview Section */}
          <header className="flex items-start justify-center gap-4 w-full">
            <div className="w-2 h-6 bg-[#60adc2]" />
            <div className="flex flex-col items-start gap-4 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#333333] whitespace-nowrap">
                  調査概要編集
                </h2>
              </div>
            </div>
          </header>

          {/* Info Banner */}
          <div className="flex flex-col items-start gap-2 px-6 py-0 w-full rounded overflow-hidden">
            <div className="flex items-center w-full">
              <p className="text-sm font-medium text-[#333333]">
                概要を編集し右の「AIと話す」ボタンを押すと
                <span className="inline-flex items-center whitespace-nowrap">
                  調査AI
                  <CircleHelp className="w-4 h-4 text-gray-500 mx-1" />
                </span>
                とチャットで相談しながら詳細を設定できます。
              </p>
            </div>
          </div>

          {/* Survey Form Fields */}
          <SurveyForm form={form} />

          {/* Distribution Section */}
          <div className="flex flex-col h-[400px] items-start justify-center gap-4 w-full">
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-start justify-center gap-4 w-full">
                <div className="w-2 h-6 bg-[#60adc2]" />
                <div className="flex flex-col items-start gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#333333] whitespace-nowrap">
                      配信ついて
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution Outlook */}
            <div className="flex flex-col items-start w-full">
              <div className="flex h-10 items-center gap-2">
                <label
                  className="text-sm font-bold text-[#333333] whitespace-nowrap"
                  htmlFor="distribution-outlook"
                >
                  配信の見通し
                </label>
                <CircleHelp className="w-4 h-4 text-gray-500" />
              </div>

              <Card className="w-full rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  {isDistributionOptimal ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 relative">
                        <CheckCircle2 className="w-8 h-8 text-[#4bbc80]" />
                      </div>
                      <p className="text-sm font-bold text-black whitespace-nowrap">
                        十分な配信が見込めます。
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 relative">
                          <TriangleAlert className="w-8 h-8 text-[#D96868]" />
                        </div>
                        <p className="text-sm font-bold text-black whitespace-nowrap">
                          配信可能な数が十分ではありません。
                        </p>
                      </div>

                      <p className="text-sm font-medium text-[#333333] mb-4">
                        AIと相談して条件の緩和・調査規模（予算）の変更をするか、配信可能数を下回ることを確認の上、調査票セクションの設定に進んでください。
                      </p>

                      <div className="flex items-center gap-4">
                        {!hasResidenceCondition && (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-[20px] border-2 border-[#333333] px-6 py-0"
                            onClick={handleExpandResidence}
                          >
                            <span className="font-bold text-[#3a3a3a] text-xs whitespace-nowrap">
                              居住地を広げる
                            </span>
                          </Button>
                        )}

                        {!hasAgeCondition && (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-[20px] border-2 border-[#333333] px-6 py-0"
                            onClick={handleExpandAge}
                          >
                            <span className="font-bold text-[#3a3a3a] text-xs whitespace-nowrap">
                              年齢条件を広げる
                            </span>
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-[32px] border-2 border-[#d96868] text-[#d96868] ml-auto"
                        >
                          <span className="font-bold text-xs whitespace-nowrap">
                            Element Bridgeでシミュレーション
                          </span>
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Suggestion Quality */}
            <div className="flex flex-col w-full items-start">
              <div className="flex h-10 items-center gap-4">
                <div className="flex items-center gap-2">
                  <label
                    className="text-sm font-bold text-[#333333] whitespace-nowrap"
                    htmlFor="ai-suggestion-quality"
                  >
                    調査AIからの提案の質
                  </label>
                  <CircleHelp className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              <Card className="w-full rounded-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-4 h-4 bg-[#4bbc80] rounded-lg"
                        />
                      ))}
                    </div>
                    <p className="flex-1 text-sm font-medium text-[#333333]">
                      調査票セクション・調査票設問の設定に必要な情報が揃っています。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="flex justify-center pb-10 bg-[#ffffff]">
          <Button
            type="submit"
            className="w-[340px] h-14 bg-[#556064] rounded-[34px] flex items-center justify-center gap-4 px-4 py-0"
            disabled={updateSurvey.isPending}
          >
            <span className="font-bold text-white text-base text-center tracking-[0] leading-[22.4px] font-['Noto_Sans_JP',Helvetica]">
              {updateSurvey.isPending ? "更新中..." : "調査票セクションの設定"}
            </span>
            {!updateSurvey.isPending && (
              <ChevronRightIcon className="w-[6.68px] h-[11.89px]" />
            )}
          </Button>
        </div>
      </form>

      <PublishAvailableConfirmDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onEditSurvey={handleEditSurvey}
        onProceedAnyway={handleProceedAnyway}
      />
    </>
  );
};

export default Page;
