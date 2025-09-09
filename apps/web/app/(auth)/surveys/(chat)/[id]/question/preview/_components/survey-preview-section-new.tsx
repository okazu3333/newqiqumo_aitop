"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { QuestionForm, type QuestionType } from "@/components/question-form";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/trpc/react";

type TabType = "all" | "screening" | "main";

type FormData = Record<string, string | string[] | undefined>;

// Tab Selection Component
const TabSelectionSection = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) => {
  const tabItems = [
    { id: "all" as TabType, label: "調査全体" },
    { id: "screening" as TabType, label: "スクリーニング調査" },
    { id: "main" as TabType, label: "本調査" },
  ];

  return (
    <div className="px-6">
      <div className="flex items-center gap-2">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`w-auto h-10 rounded-[8px_8px_0px_0px] px-6 py-2 flex items-center justify-center cursor-pointer transition-colors ${
              activeTab === tab.id
                ? "bg-[#138FB5] text-white font-bold text-base"
                : "bg-white text-[#138FB5] font-medium text-base border-t-2 border-r-2 border-l-2 border-[#138FB5] hover:bg-gray-50"
            }`}
          >
            <span className="text-center leading-6 font-['Noto_Sans_JP']">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const SurveyPreviewSection = () => {
  const params = useParams();
  const surveyId = Number(params.id);
  
  // Debug logging
  console.log("Question Preview - Params:", params);
  console.log("Question Preview - SurveyId:", surveyId);
  console.log("Question Preview - SurveyId type:", typeof surveyId);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [formValues, setFormValues] = useState<FormData>({});

  // Fetch questions from tRPC
  const { data: sections, isLoading, refetch } = api.question.listBySurvey.useQuery(
    { surveyId },
    { enabled: !isNaN(surveyId) && surveyId > 0 }
  );

  // Seed dummy questions when none exist
  const seedMutation = api.question.seedForSurvey.useMutation({
    onSuccess: async () => {
      refetch();
      try {
        await seedThreadsMutation.mutateAsync({ surveyId });
      } catch {}
    },
  });

  const seedThreadsMutation = api.thread.seedForSurvey.useMutation();

  useEffect(() => {
    if (!isLoading && sections && sections.length > 0) {
      const totalQuestions = sections.reduce((sum: number, s: any) => sum + (s.questions?.length || 0), 0);
      if (totalQuestions === 0 && !seedMutation.isPending) {
        seedMutation.mutate({ surveyId });
      }
    }
  }, [isLoading, sections, seedMutation, surveyId, refetch]);

  const { handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", { ...formValues, ...data });
  };

  const handleValueChange = (
    questionCode: string,
    value: string | string[],
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [questionCode]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
          <div className="h-96 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">質問が設定されていません</p>
      </div>
    );
  }

  // Filter sections based on active tab
  const currentSections = (sections as any[])
    .filter((section: any) =>
      activeTab === "all"
        ? true
        : activeTab === "screening"
          ? section.phase === "SCREENING"
          : section.phase === "MAIN",
    )
    // Ensure SCREENING first then MAIN for 調査全体
    .sort((a: any, b: any) => {
      if (activeTab !== "all") return 0;
      if (a.phase === b.phase) return 0;
      return a.phase === "SCREENING" ? -1 : 1;
    });

  const renderQuestion = (
    question: any,
    displayNumber: string,
  ) => {
    const questionNumber = displayNumber;
    const questionCode = question.code;

    // Parse config if it's a string
    const config =
      typeof question.config === "string"
        ? JSON.parse(question.config)
        : question.config || {};

    // Map question type and prepare common props
    const questionType = question.type as QuestionType;

    // Prepare options for SA and MA questions
    const options =
      question.type === "SA" || question.type === "MA"
        ? question.options.map((opt: any) => ({
            id: opt.value,
            label: opt.label,
          }))
        : undefined;

    // Get the appropriate value based on question type
    const value =
      question.type === "MA"
        ? (formValues[questionCode] as string[]) || []
        : (formValues[questionCode] as string);

    return (
      <QuestionForm
        key={question.id}
        type={questionType}
        questionNumber={questionNumber}
        questionText={question.title}
        options={options}
        suffix={question.type === "NU" ? question.suffix : undefined}
        placeholder={question.type === "FA" ? config.placeholder : undefined}
        isFixed={question.isRequired}
        isEditable={false}
        isMultiline={question.type === "FA" && config.rows > 1}
        value={value}
        min={question.type === "NU" ? config.minValue : undefined}
        max={question.type === "NU" ? config.maxValue : undefined}
        onValueChange={(val) => handleValueChange(questionCode, val)}
      />
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-start relative self-stretch w-full"
    >
      <TabSelectionSection activeTab={activeTab} onTabChange={setActiveTab} />
      <Card className="flex flex-col items-start gap-3 p-3 relative self-stretch w-full bg-[#138FB5] rounded-lg">
        <ScrollArea className="w-full h-[calc(100vh-220px)]">
          <div className="flex flex-col items-start gap-3 relative w-full">
              {currentSections.map((section: any) => (
                <Card
                  key={section.id}
                  className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]"
                >
                  <div className="inline-flex items-start gap-2 relative">
                    <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs leading-6 whitespace-nowrap">
                      {section.title}
                      <span className="ml-2 text-[#666666]">(
                        {section.phase === "SCREENING" ? "SC" : "Q"}
                      )</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full">
                    {(() => {
                      // Build display numbers according to rules
                      const isAll = activeTab === "all";
                      const isScreening = section.phase === "SCREENING";

                      // Compute running indices per phase when in 調査全体
                      let prefix = isAll ? (isScreening ? "SC" : "Q") : "Q";

                      // When 調査全体, numbering for MAIN should restart from 1 after SCREENING end
                      // Prepare cumulative counts up to this section for its phase
                      const sectionsForPhase = (currentSections as any[]).filter(s => s.phase === section.phase);
                      const sectionOffset = sectionsForPhase.findIndex(s => s.id === section.id);
                      const priorCount = sectionsForPhase.slice(0, sectionOffset).reduce((sum, s) => sum + (s.questions?.length || 0), 0);

                      return section.questions.map((question: any, idx: number) => {
                        const displayIndex = priorCount + idx + 1;
                        const displayNumber = `${prefix}${displayIndex}`;
                        return renderQuestion(question, displayNumber);
                      });
                    })()}
                  </div>
                </Card>
              ))}

              {currentSections.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full h-64">
                  <p className="text-white">
                    {activeTab === "screening"
                        ? "SC調査の質問がありません"
                        : "本調査の質問がありません"}
                  </p>
                </div>
              )}
          </div>
        </ScrollArea>
      </Card>
      <Separator
        className="absolute w-1 h-[230px] top-[211px] right-4 bg-[#dcdcdc] rounded"
        orientation="vertical"
      />
    </form>
  );
};
