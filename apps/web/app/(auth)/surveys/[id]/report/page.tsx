"use client";

import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/trpc/react";
import { HorizontalBar } from "@/components/report/HorizontalBar";

export default function ReportPage() {
  const params = useParams();
  const surveyId = Number(params.id);

  const { data: survey } = api.survey.getById.useQuery({ id: surveyId });
  const { data: sections, isLoading } = api.question.listBySurvey.useQuery({ surveyId });

  const handleDownloadRawData = () => {
    const csv = generateRawDataCSV();
    downloadCSV(csv, `${survey?.title || "survey"}_raw_data.csv`);
  };

  const handleDownloadAggregatedData = () => {
    const csv = generateAggregatedDataCSV();
    downloadCSV(csv, `${survey?.title || "survey"}_aggregated_data.csv`);
  };

  const generateRawDataCSV = () => {
    const headers = ["回答ID", "回答日時", "設問コード", "設問内容", "回答内容"];
    const rows = [
      ["1", "2024-01-15 10:30:00", "SC1", "年齢を教えてください", "20代"],
      ["1", "2024-01-15 10:30:00", "Q1", "満足度を教えてください", "満足"],
      ["2", "2024-01-15 11:15:00", "SC1", "年齢を教えてください", "30代"],
      ["2", "2024-01-15 11:15:00", "Q1", "満足度を教えてください", "不満"],
    ];
    return [headers, ...rows].map((r) => r.join(",")).join("\n");
  };

  const generateAggregatedDataCSV = () => {
    const headers = ["設問コード", "設問内容", "選択肢", "回答数", "回答率"];
    const rows: string[][] = [];
    (sections ?? []).forEach((sec: any) => {
      sec.questions.forEach((q: any) => {
        if (q.type === "SA" || q.type === "MA") {
          const counts = buildDummyCounts(q.options?.length ?? 0);
          const total = counts.reduce((a: number, b: number) => a + b, 0);
          q.options?.forEach((opt: any, idx: number) => {
            const c = counts[idx] ?? 0;
            const pct = total ? Math.round((c / total) * 100) : 0;
            rows.push([q.code, q.title, opt.label, String(c), `${pct}%`]);
          });
        } else {
          rows.push([q.code, q.title, "(自由記述/数値)", "-", "-"]);
        }
      });
    });
    return [headers, ...rows].map((r) => r.join(",")).join("\n");
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function buildDummyCounts(n: number): number[] {
    if (n <= 0) return [];
    const base = 12;
    return Array.from({ length: n }, (_, i) => (n - i) * base);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">レポートを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* ヘッダー（タイトル + 右寄せダウンロード） */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">回答レポート</h1>
            <p className="mt-1 text-base text-gray-600">{survey?.title}</p>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button onClick={handleDownloadRawData} variant="outline">
              <Download className="w-4 h-4 mr-2" /> ローデータをダウンロード
            </Button>
            <Button onClick={handleDownloadAggregatedData} variant="outline">
              <Download className="w-4 h-4 mr-2" /> 集計データをダウンロード
            </Button>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* 各設問のグラフと回答数 */}
        <div className="space-y-6">
          {(sections ?? []).map((sec: any) => (
            <div key={sec.id}>
              <h2 className="text-lg font-bold text-gray-800 mb-3">{sec.title || (sec.phase === "SCREENING" ? "スクリーニング" : "本調査")}</h2>
              <div className="space-y-4">
                {sec.questions.map((q: any) => (
                  <Card key={q.id} className="shadow-sm border-gray-200">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base font-semibold flex items-center justify-between gap-4">
                        <div className="truncate">
                          <span className="text-[#138FB5] mr-2 whitespace-nowrap">{q.code}</span>
                          <span className="truncate align-middle">{q.title}</span>
                        </div>
                        {(q.type === "SA" || q.type === "MA") && (
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            合計: {buildDummyCounts(q.options?.length ?? 0).reduce((a,b)=>a+b,0)} 件
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                      {q.type === "SA" || q.type === "MA" ? (
                        <div className="h-[220px]">
                          <HorizontalBar
                            labels={q.options?.map((o: any) => o.label) ?? []}
                            counts={buildDummyCounts(q.options?.length ?? 0)}
                          />
                        </div>
                      ) : (
                        <FreeTextExamples />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{``}</style>
    </div>
  );
}

function FreeTextExamples() {
  const [open, setOpen] = useState(false);
  const examples = [
    "最近の購入で重視した点は価格と配送の速さです。",
    "品質面は満足だが、在庫切れが多く改善を希望します。",
    "アプリの操作性は良いが、検索精度を上げてほしい。",
  ];
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">自由記述（解答例を{open ? "折りたたむ" : "表示"}）</div>
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} className="gap-1">
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {open ? "解答例を折りたたむ" : "解答例を表示"}
      </Button>
      {open && (
        <ul className="mt-2 space-y-2">
          {examples.map((ex, i) => (
            <li key={i} className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded p-2">
              {ex}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
