"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

type Choice = {
  id: string;
  label: string;
};

export type QiqumoPhonePreviewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionNo?: string;
  title: string;
  required?: boolean;
  description?: string;
  type?: "SA" | "MA";
  choices: Choice[];
};

export default function QiqumoPhonePreview({ open, onOpenChange, questionNo = "Q1", title, required = true, description, type = "SA", choices }: QiqumoPhonePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0 overflow-hidden border-0 bg-transparent">
        <div className="w-[360px] h-[720px] mx-auto bg-white rounded-[24px] shadow-2xl overflow-hidden border border-gray-200">
          {/* Top bar (notch) */}
          <div className="h-6 bg-black/90 flex items-center justify-center relative">
            <div className="w-36 h-2 rounded-full bg-gray-700" />
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            <div className="text-[#00a6a6] font-bold">
              {questionNo}
              <span className="ml-2 text-[#202020] font-normal text-base align-middle">
                {title}
              </span>
              {required && (
                <span className="ml-2 text-[#ff5c5c] text-xs align-middle">(必須)</span>
              )}
            </div>

            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}

            <div className="space-y-3">
              {choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-md bg-[#f5f5f5] hover:bg-[#eee] border border-transparent"
                >
                  <span className="inline-block w-4 h-4 rounded-full border border-gray-400 bg-white" />
                  <span className="text-sm text-[#202020]">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 