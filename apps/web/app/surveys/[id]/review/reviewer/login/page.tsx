"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/trpc/react";

export default function ReviewerLoginPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = Number(params.id);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  // パスワード検証用のmutation
  const { mutate: validatePassword, isPending } =
    api.reviewAccess.validate.useMutation({
      onSuccess: () => {
        // 簡易的な実装のため、セッション管理は後回し
        // displayNameをlocalStorageに保存
        localStorage.setItem(`reviewer_${surveyId}`, displayName);
        router.push(`/surveys/${surveyId}/review/reviewer/preview`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !password) {
      toast.error("表示名とパスワードを入力してください");
      return;
    }

    validatePassword({
      surveyId,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)] w-[560px] p-14">
        <h1 className="text-[28px] font-bold text-[#333333] text-center mb-16 font-['Lexend_Exa']">
          Survey Bridge
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="displayName"
                className="text-base font-bold text-[#333333]"
              >
                表示名
              </Label>
              <span className="text-xs font-bold text-[#FF1414]">*必須</span>
            </div>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="山田太郎"
              className="h-12 px-4 border-2 border-[#DCDCDC] rounded-sm shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)] focus:border-[#75BACF] focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="password"
                className="text-base font-bold text-[#333333]"
              >
                パスワード
              </Label>
              <span className="text-xs font-bold text-[#FF1414]">*必須</span>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 px-4 border-2 border-[#DCDCDC] rounded-sm shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)] focus:border-[#75BACF] focus:outline-none"
              required
            />
          </div>

          <div className="pt-8 space-y-4">
            <Button
              type="submit"
              className="w-full h-14 bg-black hover:bg-gray-800 text-white font-bold text-lg rounded-full"
              disabled={isPending}
            >
              {isPending ? "ログイン中..." : "ログイン"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
