"use client";

import dynamic from "next/dynamic";

export const SurveyEditSection = dynamic(
  () =>
    import("./survey-edit-section").then((mod) => ({
      default: mod.SurveyEditSection,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    ),
  },
);
