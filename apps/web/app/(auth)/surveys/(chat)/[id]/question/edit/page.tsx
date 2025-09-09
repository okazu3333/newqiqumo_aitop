"use client";

import { ActionButtons, ModeToggle } from "../_components/mode-toggle";
import { SurveyEditSection } from "./_components/survey-edit-section-wrapper";

const Page = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#ffffff] rounded-b-lg shadow-main-bg">
      <div className="flex flex-col flex-1 gap-6 p-6">
        {/* Header Section with Mode Toggle */}
        <div className="flex items-start justify-between self-stretch w-full">
          <ModeToggle currentMode="edit" />
        </div>

        {/* Survey Edit Area */}
        <SurveyEditSection />
      </div>

      {/* Action Buttons at the bottom */}
      <ActionButtons />
    </div>
  );
};

export default Page;
