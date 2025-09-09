"use client";

import { ActionButtons, ModeToggle } from "../_components/mode-toggle";
import { SurveyPreviewSection } from "./_components/survey-preview-section-new";

const Page = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#ffffff] rounded-b-lg shadow-main-bg">
      <div className="flex flex-col flex-1 gap-6 p-6">
        {/* Header Section with Mode Toggle */}
        <div className="flex items-start justify-end self-stretch w-full">
          <ModeToggle currentMode="preview" />
        </div>

        <SurveyPreviewSection />
      </div>

      {/* Action Buttons at the bottom */}
      <ActionButtons />
    </div>
  );
};

export default Page;
