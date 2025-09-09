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
      {/* Stepper Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            {[{label:'作成', current:false}, {label:'確認', current:true}, {label:'配信', current:false}].map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-medium border ${s.current ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground'}`}>{i+1}</div>
                <span className={`text-sm ${s.current ? 'font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
                {i < 2 && <div className="w-10 h-px bg-border mx-1" />}
              </div>
            ))}
            <div className="ml-auto text-sm text-muted-foreground">{data.type === 'main' ? '本調査' : '事前調査'} / {data.audience ?? '対象者 未設定'}</div>
          </div>
          <nav className="mt-2 text-xs text-muted-foreground">
            <ol className="flex items-center gap-1">
              <li><a href="/surveys" className="hover:underline">surveys</a></li>
              <li>/</li>
              <li><a href="/assistant" className="hover:underline">assistant</a></li>
              <li>/</li>
              <li aria-current="page" className="text-foreground">confirm</li>
            </ol>
          </nav>
          <div className="mt-3 text-xs text-muted-foreground flex gap-4">
            <span>アンケート種別: {data.type === 'main' ? '本調査' : '事前調査'}</span>
            <span>タイトル: {data.title}</span>
            <span>対象者: {data.audience ?? '未設定'}</span>
            <span className="bg-muted px-2 py-0.5 rounded">確認</span>
          </div>
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