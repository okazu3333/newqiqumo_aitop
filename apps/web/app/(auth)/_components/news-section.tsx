import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const NewsSection = () => {
  const newsItems = [
    {
      id: "1",
      date: "2025/06/10",
      type: "メンテナンス",
      typeColor: "bg-[#60adc2] text-white hover:bg-[#60adc2] hover:text-white",
      content: "【07/01】メンテナンスを実施します。",
    },
    {
      id: "2",
      date: "2025/06/04",
      type: "アップデート",
      typeColor: "bg-[#60adc2] text-white hover:bg-[#60adc2] hover:text-white",
      content: "アップデートを実施しました。",
    },
    {
      id: "3",
      date: "2025/06/02",
      type: "重要",
      typeColor: "bg-red-500 text-white hover:bg-red-500 hover:text-white",
      content:
        "新規アカウント登録ありがとうございます。登録時の設定の確認はこちらをご確認ください。なお、...",
    },
  ];

  return (
    <Card className="bg-transparent shadow-none border-none">
      <CardHeader className="bg-[#138fb5] text-white rounded-t-lg py-2 flex items-center justify-center w-[200px]">
        <h2 className="text-base font-bold">最新のおしらせ</h2>
      </CardHeader>
      <CardContent className="p-6 bg-white border shadow rounded-b-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-700">山田 太郎 さん こんにちは！</p>
          <Link href="/news">
            <Button
              variant="outline"
              className="mt-2 ml-auto block bg-transparent"
            >
              お知らせ一覧へ
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {newsItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <span className="text-sm text-gray-600 min-w-[80px]">
                {item.date}
              </span>
              <Badge
                className={`${item.typeColor} min-w-[80px] justify-center`}
              >
                {item.type}
              </Badge>
              <p className="text-sm text-gray-700 flex-1">{item.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
