"use client";

import { TriangleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type PublishAvailableConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onEditSurvey: () => void;
  onProceedAnyway: () => void;
};

export const PublishAvailableConfirmDialog = ({
  isOpen,
  onClose,
  onEditSurvey,
  onProceedAnyway,
}: PublishAvailableConfirmDialogProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[680px] h-[400px] relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center"
          type="button"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-8 px-[68px] py-24">
          {/* Header with icon and title */}
          <div className="flex items-center justify-center gap-2.5 w-full">
            <TriangleAlert className="w-6 h-6 text-[#D96868]" />
            <h2 className="text-lg font-bold text-[#333333] text-center font-['Noto_Sans_JP'] leading-[1.333]">
              配信可能数が不足しています。
            </h2>
          </div>

          {/* Body content */}
          <div className="flex flex-col gap-10 w-full">
            {/* Message */}
            <div className="flex flex-col gap-4 w-full">
              <p className="text-sm font-medium text-[#333333] text-center leading-[1.714] font-['Noto_Sans_JP'] w-full">
                設定した調査概要の内容では、配信可能数が十分ではありません。
                <br />
                このまま次に進むことも可能ですが、
                <br />
                調査に必要な回答数が得られない可能性があります。
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 w-full">
              <Button
                onClick={onEditSurvey}
                className="flex-1 h-auto py-2 px-6 bg-[#484848] text-white font-bold text-base rounded-[20px] hover:bg-[#484848]/90 font-['Noto_Sans_JP'] leading-[1.5]"
                type="button"
              >
                調査概要を編集する
              </Button>
              <Button
                onClick={onProceedAnyway}
                variant="outline"
                className="flex-1 h-auto py-2 px-6 border-2 border-[#556064] text-[#3A3A3A] font-bold text-base rounded-[20px] hover:bg-gray-50 font-['Noto_Sans_JP'] leading-[1.5]"
                type="button"
              >
                了承して進む
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
