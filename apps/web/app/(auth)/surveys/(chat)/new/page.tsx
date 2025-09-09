"use client";

import {
  CheckCircle2,
  ChevronRightIcon,
  CircleHelp,
  ExternalLink,
  TriangleAlert,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SurveyCardHeader } from "@/components/survey-card-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/trpc/react";
import {
  SurveyForm,
  type SurveyFormData,
  surveyFields,
} from "../_components/survey-form";
import { useChatContext } from "../chat-context";
import { PublishAvailableConfirmDialog } from "./_components/publish-available-confirm-dialog";

const SurveyNewContent = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    importedSurveyData,
    setNewSurveyUserMessages,
    newSurveyUserMessages,
    setNewSurveyAiResponses,
    newSurveyAiResponses,
  } = useChatContext();

  // アシスタント画面からの参考調査票情報を取得
  const referenceSurveyId = searchParams.get('referenceSurveyId');
  const referenceSurveyTitle = searchParams.get('referenceSurveyTitle');
  const ruleModelName = searchParams.get('ruleModelName');

  // 参考調査票に基づいてダミーデータを生成する関数
  const generateDummyData = (surveyId: string, surveyTitle: string) => {
    const dummyDataMap: { [key: string]: Partial<SurveyFormData> } = {
      '1': { // ブランド満足度調査
        title: "ブランド満足度調査（参考: " + surveyTitle + "）",
        purpose: "顧客満足度とブランド認知度の総合的な評価・分析",
        targetCondition: "全国\n20-60代\n男女\n当該ブランド認知者\n過去1年以内の利用経験者",
        analysisCondition: "ブランド認知度・利用状況\n満足度評価（総合・項目別）\nNPS（推奨意向）\n競合ブランドとの比較評価\n今後の利用意向・改善要望",
        researchMethod: "Webアンケート調査",
        researchScale: "n=1,000"
      },
      '2': { // 購買行動パターン分析
        title: "購買行動パターン分析（参考: " + surveyTitle + "）",
        purpose: "消費者の購買行動変化とトレンドの把握・分析",
        targetCondition: "全国\n25-55代\n男女\n世帯年収300万円以上\n主たる購買決定者",
        analysisCondition: "購買チャネルの利用状況\n購買決定要因・重視点\n情報収集行動\n購買頻度・金額の変化\nコロナ禍での行動変化",
        researchMethod: "オンラインインタビュー + Webアンケート",
        researchScale: "定性: n=20, 定量: n=800"
      },
      '3': { // 新商品コンセプト評価
        title: "新商品コンセプト評価（参考: " + surveyTitle + "）",
        purpose: "新商品コンセプトの市場受容性と改善点の把握",
        targetCondition: "全国\n20-50代\n男女\n対象カテゴリ利用者\n購買関与度：中～高",
        analysisCondition: "コンセプト理解度・魅力度\n購入意向・推奨意向\n価格受容性\n競合商品との差別化ポイント\nコンセプト改善提案",
        researchMethod: "会場調査（CLT）",
        researchScale: "n=300"
      },
      'default': {
        title: "市場調査（参考: " + surveyTitle + "）",
        purpose: "市場動向と消費者ニーズの把握・分析",
        targetCondition: "全国\n20-60代\n男女\n対象商品・サービス利用者",
        analysisCondition: "利用実態・満足度\n購買行動・決定要因\n競合比較・ブランド評価\n今後のニーズ・要望",
        researchMethod: "Webアンケート調査",
        researchScale: "n=500"
      }
    };

    return dummyDataMap[surveyId] || dummyDataMap['default'];
  };

  const form = useForm<SurveyFormData>({
    defaultValues: {
      title: surveyFields[0].defaultValue,
      purpose: surveyFields[1].defaultValue,
      targetCondition: surveyFields[2].defaultValue,
      analysisCondition: surveyFields[3].defaultValue,
      researchMethod: surveyFields[4].defaultValue,
      researchScale: surveyFields[5].defaultValue,
    },
  });

  const { handleSubmit, setValue, watch, reset } = form;
  const targetCondition = watch("targetCondition") || "";

  // アシスタントからのデータがある場合、フォームを初期化
  useEffect(() => {
    if (referenceSurveyId && referenceSurveyTitle) {
      const dummyData = generateDummyData(referenceSurveyId, referenceSurveyTitle);
      reset(dummyData);
    }
  }, [referenceSurveyId, referenceSurveyTitle, reset]);

  // インポートされたデータがある場合、フォームに反映
  useEffect(() => {
    if (importedSurveyData) {
      if (importedSurveyData.title) {
        setValue("title", importedSurveyData.title);
      }
      if (importedSurveyData.purpose) {
        setValue("purpose", importedSurveyData.purpose);
      }
      if (importedSurveyData.targetCondition) {
        setValue("targetCondition", importedSurveyData.targetCondition);
      }
      if (importedSurveyData.analysisCondition) {
        setValue("analysisCondition", importedSurveyData.analysisCondition);
      }
      if (importedSurveyData.researchMethod) {
        setValue("researchMethod", importedSurveyData.researchMethod);
      }
      if (importedSurveyData.researchScale) {
        setValue("researchScale", importedSurveyData.researchScale);
      }
    }
  }, [importedSurveyData, setValue]);

  // Check if targetCondition contains residence info (e.g., "在住")
  const hasResidenceCondition = targetCondition.includes("在住");

  // Check if targetCondition contains age info (e.g., "代")
  const hasAgeCondition = /\d+代/.test(targetCondition);

  // Both conditions are satisfied
  const isDistributionOptimal = hasResidenceCondition && hasAgeCondition;

  const createSurvey = api.survey.create.useMutation({
    onSuccess: (data) => {
      toast.success("調査が作成されました");
      router.push(`/surveys/${data.id}/sections`);
    },
    onError: (error) => {
      toast.error(`エラーが発生しました: ${error.message}`);
    },
  });

  const onSubmit = async (data: SurveyFormData) => {
    const payload = {
      title: (data.title || "").trim(),
      purpose: data.purpose?.trim() || undefined,
      targetCondition: data.targetCondition?.trim() || undefined,
      analysisCondition: data.analysisCondition?.trim() || undefined,
      researchMethod: data.researchMethod?.trim() || undefined,
      researchScale: data.researchScale?.trim() || undefined,
    };

    if (!payload.title) {
      toast.error("タイトルは必須です");
      return;
    }

    if (!isDistributionOptimal) {
      setIsDialogOpen(true);
      return;
    }

    try {
      await createSurvey.mutateAsync(payload as any);
    } catch (error) {
      console.error("Failed to create survey:", error);
    }
  };

  const handleEditSurvey = () => {
    setIsDialogOpen(false);
  };

  const handleProceedAnyway = async () => {
    setIsDialogOpen(false);
    const data = form.getValues();
    const payload = {
      title: (data.title || "").trim(),
      purpose: data.purpose?.trim() || undefined,
      targetCondition: data.targetCondition?.trim() || undefined,
      analysisCondition: data.analysisCondition?.trim() || undefined,
      researchMethod: data.researchMethod?.trim() || undefined,
      researchScale: data.researchScale?.trim() || undefined,
    };

    if (!payload.title) {
      toast.error("タイトルは必須です");
      return;
    }

    try {
      await createSurvey.mutateAsync(payload as any);
    } catch (error) {
      console.error("Failed to create survey:", error);
    }
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
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full">
        <SurveyCardHeader
          workingTitle="00008　男性化粧品についての調査"
          currentStep={0}
        />
        <div className="flex flex-col w-full items-center gap-6 p-6 bg-[#ffffff] rounded-b-lg shadow-main-bg">
          {/* Reference Survey Info */}
          {(referenceSurveyTitle || ruleModelName) && (
            <div className="w-full bg-[#E8F4F8] border border-[#138FB5] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-[#138FB5]" />
                <h3 className="text-sm font-semibold text-[#0f7a9e]">アシスタントからの設定情報</h3>
              </div>
              <div className="space-y-2 text-sm">
                {referenceSurveyTitle && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#9E9E9E] min-w-[80px]">参考調査票:</span>
                    <span className="text-[#202020] font-medium">{referenceSurveyTitle}</span>
                  </div>
                )}
                {ruleModelName && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#9E9E9E] min-w-[80px]">適用ルール:</span>
                    <span className="text-[#202020] font-medium">{ruleModelName}</span>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-[#138FB5]/20">
                  <p className="text-xs text-[#9E9E9E]">
                    上記の情報を基に調査内容を自動入力しました。必要に応じて編集してください。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Survey Overview Section */}
          <header className="flex items-start justify-center gap-4 w-full">
            <div className="w-2 h-6 bg-[#60adc2]" />
            <div className="flex flex-col items-start gap-4 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#333333] whitespace-nowrap">
                  調査概要入力
                </h2>
              </div>
            </div>
          </header>

          {/* Info Banner */}
          <div className="flex flex-col items-start gap-2 px-6 py-0 w-full rounded overflow-hidden">
            <div className="flex items-center w-full">
              <p className="text-sm font-medium text-[#333333]">
                概要を入力し右の「AIと話す」ボタンを押すと
                <span className="inline-flex items-center whitespace-nowrap">
                  調査AI
                  <CircleHelp className="w-4 h-4 text-gray-500 mx-1" />
                </span>
                とチャットで相談しながら詳細を設定できます。
              </p>
            </div>
          </div>

          {/* Question Icon */}

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
            disabled={createSurvey.isPending}
          >
            <span className="font-bold text-white text-base text-center tracking-[0] leading-[22.4px] font-['Noto_Sans_JP',Helvetica]">
              {createSurvey.isPending ? "作成中..." : "調査票セクションの設定"}
            </span>
            {!createSurvey.isPending && (
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

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SurveyNewContent />
    </Suspense>
  );
};

export default Page;
