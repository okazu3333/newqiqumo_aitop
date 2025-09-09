"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const ConfirmationSection = () => {
  const router = useRouter();
  const [isReviewed, setIsReviewed] = useState(false);
  const [isClientApproved, setIsClientApproved] = useState(false);

  const handleFinalize = () => {
    if (isReviewed) {
      router.push("/surveys/1/complete");
    }
  };

  const handleEdit = () => {
    router.push("/surveys/1/question/preview");
  };

  return (
    <Card className="w-full bg-white rounded border border-[#dcdcdc]">
      <CardContent className="flex flex-col gap-2 p-4">
        {/* Checkboxes */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <Checkbox
              id="review-confirm"
              checked={isReviewed}
              onCheckedChange={(checked) => setIsReviewed(checked as boolean)}
              className="mt-1 h-4 w-4 rounded-sm border-[#cccccc] data-[state=checked]:bg-[#138fb5] data-[state=checked]:border-[#138fb5]"
            />
            <label
              htmlFor="review-confirm"
              className="text-xs font-bold text-[#333333] leading-6 cursor-pointer"
            >
              本調査設問をすべて精査し、内容に問題ないことを確認しました。
            </label>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="client-approve"
              checked={isClientApproved}
              onCheckedChange={(checked) =>
                setIsClientApproved(checked as boolean)
              }
              className="mt-1 h-4 w-4 rounded-sm border-[#cccccc] data-[state=checked]:bg-[#138fb5] data-[state=checked]:border-[#138fb5]"
            />
            <label
              htmlFor="client-approve"
              className="text-xs font-bold text-[#333333] leading-6 cursor-pointer"
            >
              （対顧客利用時のみ）顧客からも「この内容で問題ない」と承諾を得ました。
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="h-10 px-6 rounded-[20px] border border-[#dcdcdc] bg-white text-[#3a3a3a] font-bold text-base hover:bg-gray-50"
          >
            調査票を編集する
          </Button>

          <Button
            onClick={handleFinalize}
            disabled={!isReviewed}
            className="h-10 px-6 rounded-[20px] bg-[#556064] hover:bg-[#454d51] text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            調査票を確定する
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfirmationSection;
