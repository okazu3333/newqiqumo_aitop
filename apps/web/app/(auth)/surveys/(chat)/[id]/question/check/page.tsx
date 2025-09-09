"use client";

import { use } from "react";
import { ActionButtons, ModeToggle } from "../_components/mode-toggle";
import { LogicCheckSection } from "./_components/logic-check-section";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = ({ params }: PageProps) => {
  const { id } = use(params);
  const surveyId = Number(id);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#ffffff] rounded-b-lg shadow-main-bg">
      <div className="flex flex-col flex-1 gap-6 p-6">
        {/* Header Section with Mode Toggle */}
        <div className="flex items-start justify-between self-stretch w-full">
          <ModeToggle currentMode="logic" />
        </div>

        {/* User Information Section */}
        <LogicCheckSection surveyId={surveyId} />
      </div>

      {/* Action Buttons at the bottom */}
      <ActionButtons />
    </div>
  );
};

export default Page;
