"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar, CheckSquare, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Draft = {
  title: string;
  type: "screening" | "main";
  audience?: string;
  questions: { id: string; text: string }[];
};

export default function AssistantConfirmPage() {
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("assistant_draft");
      if (raw) setDraft(JSON.parse(raw));
    } catch {}
  }, []);

  const data = useMemo<Draft>(() => {
    if (draft) return draft;
    // fallback dummy
    return {
      title: "従業員満足度アンケート（ES調査）",
      type: "main",
      audience: "全従業員",
      questions: [
        { id: "Q1", text: "あなたの性別をお知らせください。" },
        { id: "Q2", text: "あなたの年齢をお知らせください。" },
        { id: "Q3", text: "あなたの所属部署に最も近いものをお知らせください。" },
        { id: "Q4", text: "あなたの役職に最も近いものをお知らせください。" },
        { id: "Q5", text: "あなたは入社して何年目ですか。" },
        { id: "Q6", text: "あなたは現在の仕事に対して、総合的にどのくらい満足していますか。" },
        { id: "Q7", text: "職場に対して悩みや要望がございましたら、ご自由にお書きください。" },
      ],
    };
  }, [draft]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b">
        <div className="flex items-center">
          <div className="flex">
            <ChevronLeft className="w-6 h-6 text-gray-400 my-auto ml-2" />
            <div className="bg-primary text-primary-foreground px-6 py-3 flex items-center gap-2 relative">
              <span className="text-sm">✓</span>
              <span>アンケート作成</span>
              <div className="absolute right-0 top-0 w-0 h-0 border-l-[20px] border-l-primary border-t-[24px] border-t-transparent border-b-[24px] border-b-transparent"></div>
            </div>
            <div className="bg-gray-600 text-white px-6 py-3 flex items-center gap-2 relative">
              <span className="text-sm">📋</span>
              <span>アンケート配信</span>
              <div className="absolute right-0 top-0 w-0 h-0 border-l-[20px] border-l-gray-600 border-t-[24px] border-t-transparent border-b-[24px] border-b-transparent"></div>
            </div>
            <div className="bg-gray-800 text-white px-6 py-3 flex items-center gap-2">
              <span className="text-sm">📊</span>
              <span>ダッシュボード</span>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 my-auto mr-2" />
          </div>

          {/* Right side info */}
          <div className="ml-auto flex items-center gap-2 px-4">
            <span className="text-sm text-gray-600">{data.type === "main" ? "本調査" : "事前調査"} / {data.audience ?? "対象者 未設定"}</span>
          </div>
        </div>

        {/* Survey Info Bar */}
        <div className="px-4 py-2 bg-gray-100 flex items-center gap-4 text-sm">
          <span>アンケート種別:{data.type === "main" ? "本調査" : "事前調査"}</span>
          <span>タイトル:{data.title}</span>
          <span>対象者:{data.audience ?? "未設定"}</span>
          <span className="bg-gray-300 px-2 py-1 rounded text-xs">確認</span>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-48 bg-white border-r min-h-screen">
          <div className="p-3 space-y-1">
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
              <span>単一選択</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>複数選択</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
              <Menu className="w-4 h-4" />
              <span>画像選択</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
              <span className="w-4 h-4 text-center text-xs border rounded flex items-center justify-center">記</span>
              <span>自由入力・単一行</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>自由入力・複数行</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
              <span className="w-4 h-4 text-center text-xs border rounded flex items-center justify-center">数</span>
              <span>数値入力</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
              <span>単一選択でマトリクス</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>複数選択でマトリクス</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
              <span className="w-4 h-4 text-center text-xs flex items-center justify-center">★</span>
              <span>ランク付け</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 bg-gray-50">
          <Card className="rounded-lg max-w-4xl">
            <CardContent className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <div className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-r-full rounded-l-sm mb-4 relative">
                  <span className="font-medium">Welcome</span>
                </div>
                <h2 className="text-xl font-medium text-gray-800">{data.title}</h2>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {data.questions.map((q) => (
                  <div key={q.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-4">
                      <Menu className="w-5 h-5 text-gray-400" />
                      <div className="bg-primary text-primary-foreground w-10 h-6 rounded-sm flex items-center justify-center text-sm font-medium">
                        {q.id}
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{q.text}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thanks Section */}
              <div className="mt-8">
                <div className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-r-full rounded-l-sm mb-2 relative">
                  <span className="font-medium">Thanks</span>
                </div>
                <p className="text-gray-700">ありがとうございました。</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 