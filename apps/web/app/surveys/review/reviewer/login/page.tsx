"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReviewerLoginPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 適当なパスワードでログイン（実際の認証は不要）
    if (password) {
      router.push("/surveys/1/review/reviewer/preview");
    }
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
            >
              ログイン
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
