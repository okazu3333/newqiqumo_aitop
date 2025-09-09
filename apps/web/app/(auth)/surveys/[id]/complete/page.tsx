"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SurveyCardHeader } from "@/components/survey-card-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/trpc/react";

const CompletePage = () => {
  const params = useParams();
  const surveyId = Number(params.id);

  const { data: survey, isLoading } = api.survey.getById.useQuery({
    id: surveyId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="w-full py-6 px-4">
          <div className="max-w-[1440px] mx-auto">
            <SurveyCardHeader
              title="調査票"
              workingTitleLabel="現在作業中のタイトル"
              workingTitle="読み込み中..."
              currentStep={4}
              surveyId={surveyId}
            />
            <div className="flex flex-col items-center gap-6 p-6 bg-[#f4f7f9] rounded-b-lg shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)] min-h-[329px]">
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded w-[640px]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="w-full py-6 px-4">
        <div className="max-w-[1440px] mx-auto">
          <SurveyCardHeader
            title="調査票"
            workingTitleLabel="現在作業中のタイトル"
            workingTitle={survey?.title || "調査タイトル未設定"}
            currentStep={4}
            surveyId={surveyId}
          />

          {/* Main Content Container */}
          <div className="flex flex-col items-center gap-6 p-6 bg-[#f4f7f9] rounded-b-lg shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)] min-h-[329px]">
            <Card className="w-[640px] bg-white rounded-lg border-0">
              <CardContent className="flex flex-col items-center gap-10 px-6 py-[60px]">
                {/* Success Message */}
                <h1 className="text-[#333333] text-lg font-bold text-center">
                  内容を確定しました。配信設定を開始できます。
                </h1>

                {/* Action Buttons */}
                <div className="flex items-center gap-6">
                  <Button
                    asChild
                    variant="outline"
                    className="w-[240px] h-10 rounded-[20px] border-2 border-[#0f0f0f] bg-white text-[#333333] font-bold text-sm hover:bg-gray-50"
                  >
                    <Link href="/surveys">アンケート一覧に戻る</Link>
                  </Button>

                  <Button
                    asChild
                    className="w-[240px] h-10 rounded-[32px] bg-[#d96868] hover:bg-[#c35858] border-2 border-[#d96868] text-white font-bold text-sm"
                  >
                    <Link
                      href="#"
                      className="flex items-center justify-center gap-2"
                    >
                      Element Bridgeで配信を開始
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompletePage;
