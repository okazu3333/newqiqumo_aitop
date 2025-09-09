"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type QuestionConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: string[];
  onConfirm: () => void;
  onEdit: () => void;
};

export default function QuestionConfirmModal({ open, onOpenChange, questions, onConfirm, onEdit }: QuestionConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>自動生成された設問を確認</DialogTitle>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-auto space-y-3">
          {questions.length === 0 ? (
            <p className="text-sm text-gray-500">設問が見つかりませんでした。</p>
          ) : (
            <ol className="list-decimal list-inside space-y-2">
              {questions.map((q, idx) => (
                <li key={idx} className="text-sm text-[#202020]">{q}</li>
              ))}
            </ol>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="secondary" type="button" onClick={onEdit}>編集する</Button>
          <Button type="button" onClick={onConfirm}>はい、このまま進む</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 