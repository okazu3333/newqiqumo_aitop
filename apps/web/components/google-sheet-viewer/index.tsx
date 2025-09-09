"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainSurvey } from "./main-survey";
import { ScreeningSurvey } from "./screening-survey";
import { SurveyItems } from "./survey-items";

type GoogleSheetViewerProps = {
  className?: string;
  defaultTab?: "items" | "screening" | "main";
  surveyId?: number;
};

export const GoogleSheetViewer = ({
  className = "",
  defaultTab = "items",
  surveyId,
}: GoogleSheetViewerProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Tabs defaultValue={defaultTab} className="w-full h-full flex flex-col">
        <TabsList className="grid w-fit grid-cols-3">
          <TabsTrigger value="items">調査項目</TabsTrigger>
          <TabsTrigger value="screening">SC調査</TabsTrigger>
          <TabsTrigger value="main">本調査</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="flex-1 overflow-auto mt-4">
          <SurveyItems surveyId={surveyId} />
        </TabsContent>

        <TabsContent value="screening" className="flex-1 overflow-auto mt-4">
          <ScreeningSurvey surveyId={surveyId} />
        </TabsContent>

        <TabsContent value="main" className="flex-1 overflow-auto mt-4">
          <MainSurvey surveyId={surveyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { MainSurvey } from "./main-survey";
export { ScreeningSurvey } from "./screening-survey";
// Export individual components for direct use if needed
export { SurveyItems } from "./survey-items";
