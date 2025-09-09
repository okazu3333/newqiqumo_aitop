"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 拡張されたダミーデータ
  const allNewsItems = [
    {
      id: "1",
      date: "2025/06/10",
      type: "メンテナンス",
      typeColor: "bg-[#60adc2] text-white hover:bg-[#60adc2]",
      content: "【07/01】メンテナンスを実施します。",
      detail:
        "7月1日午前2時から午前5時まで、システムメンテナンスを実施いたします。メンテナンス中はサービスをご利用いただけません。お客様にはご不便をおかけしますが、何卒ご理解いただきますようお願い申し上げます。",
    },
    {
      id: "2",
      date: "2025/06/04",
      type: "アップデート",
      typeColor: "bg-[#60adc2] text-white hover:bg-[#60adc2]",
      content: "アップデートを実施しました。",
      detail:
        "新機能として、アンケート結果のリアルタイム集計機能を追加しました。また、UIの改善により、より使いやすくなりました。",
    },
    {
      id: "3",
      date: "2025/06/02",
      type: "重要",
      typeColor: "bg-red-500 text-white hover:bg-red-500",
      content:
        "新規アカウント登録ありがとうございます。登録時の設定の確認はこちらをご確認ください。",
      detail:
        "アカウント登録が完了しました。初期設定として、プロフィール情報の入力と、通知設定の確認をお願いいたします。ご不明な点がございましたら、ヘルプセンターをご参照ください。",
    },
    {
      id: "4",
      date: "2025/05/28",
      type: "お知らせ",
      typeColor: "bg-gray-500 text-white hover:bg-gray-500",
      content: "新しいアンケートテンプレートが追加されました。",
      detail:
        "顧客満足度調査、従業員エンゲージメント調査、市場調査など、様々な用途に対応したテンプレートをご用意しました。",
    },
    {
      id: "5",
      date: "2025/05/20",
      type: "メンテナンス",
      typeColor: "bg-[#60adc2] text-white hover:bg-[#60adc2]",
      content: "【05/21】緊急メンテナンスを実施しました。",
      detail:
        "システムの不具合により、緊急メンテナンスを実施いたしました。現在は正常に稼働しております。",
    },
    {
      id: "6",
      date: "2025/05/15",
      type: "アップデート",
      typeColor: "bg-[#60adc2] text-white hover:bg-[#60adc2]",
      content: "モバイルアプリがリリースされました。",
      detail:
        "iOS/Android向けのモバイルアプリがリリースされました。外出先でもアンケートの作成・管理が可能になりました。",
    },
    {
      id: "7",
      date: "2025/05/10",
      type: "重要",
      typeColor: "bg-red-500 text-white hover:bg-red-500",
      content: "セキュリティアップデートのお知らせ",
      detail:
        "セキュリティ強化のため、パスワードポリシーを更新しました。次回ログイン時にパスワードの変更をお願いする場合があります。",
    },
    {
      id: "8",
      date: "2025/05/01",
      type: "お知らせ",
      typeColor: "bg-gray-500 text-white hover:bg-gray-500",
      content: "ゴールデンウィーク期間中のサポート体制について",
      detail:
        "5月3日から5月5日まで、サポート窓口を休業させていただきます。緊急のお問い合わせは、メールにてご連絡ください。",
    },
    {
      id: "9",
      date: "2025/04/25",
      type: "アップデート",
      typeColor: "bg-[#60adc2] text-white hover:bg-[#60adc2]",
      content: "API機能が強化されました。",
      detail:
        "外部システムとの連携を強化するため、新しいAPIエンドポイントを追加しました。詳細はAPIドキュメントをご確認ください。",
    },
    {
      id: "10",
      date: "2025/04/20",
      type: "メンテナンス",
      typeColor: "bg-[#60adc2] text-white hover:bg-[#60adc2]",
      content: "【04/25】定期メンテナンスのお知らせ",
      detail:
        "サーバーの定期メンテナンスを実施します。作業時間は午前3時から午前4時を予定しています。",
    },
    {
      id: "11",
      date: "2025/04/15",
      type: "重要",
      typeColor: "bg-red-500 text-white hover:bg-red-500",
      content: "利用規約の改定について",
      detail:
        "4月30日より、利用規約を改定いたします。主な変更点は、データの取り扱いに関する項目です。詳細は規約ページをご確認ください。",
    },
    {
      id: "12",
      date: "2025/04/10",
      type: "お知らせ",
      typeColor: "bg-gray-500 text-white hover:bg-gray-500",
      content: "新機能：レポート自動生成機能",
      detail:
        "アンケート結果を自動的にレポート形式にまとめる機能を追加しました。PDF、Excel形式での出力に対応しています。",
    },
    {
      id: "13",
      date: "2025/04/05",
      type: "アップデート",
      typeColor: "bg-[#60adc2] text-white hover:bg-[#60adc2]",
      content: "ダッシュボードのUI改善",
      detail:
        "ユーザーフィードバックを基に、ダッシュボードのUIを改善しました。より直感的な操作が可能になりました。",
    },
    {
      id: "14",
      date: "2025/04/01",
      type: "メンテナンス",
      typeColor: "bg-[#60adc2] text-white hover:bg-[#60adc2]",
      content: "【04/02】緊急メンテナンス完了",
      detail:
        "データベースの最適化を実施しました。パフォーマンスが向上しています。",
    },
    {
      id: "15",
      date: "2025/03/28",
      type: "重要",
      typeColor: "bg-red-500 text-white hover:bg-red-500",
      content: "年度末のデータバックアップのお願い",
      detail:
        "年度末にあたり、重要なデータのバックアップをお願いいたします。エクスポート機能をご活用ください。",
    },
  ];

  // ページネーション計算
  const totalPages = Math.ceil(allNewsItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = allNewsItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ページ番号の配列を生成
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="pl-0">
              <ChevronLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="bg-[#138fb5] text-white rounded-t-lg">
            <h1 className="text-xl font-bold">お知らせ一覧</h1>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4 text-sm text-gray-600">
              全{allNewsItems.length}件中 {startIndex + 1}-
              {Math.min(endIndex, allNewsItems.length)}件を表示
            </div>

            <div className="space-y-4">
              {currentItems.map((item) => (
                <Card key={item.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-sm text-gray-600 min-w-[80px]">
                        {item.date}
                      </span>
                      <Badge
                        className={`${item.typeColor} min-w-[80px] justify-center`}
                      >
                        {item.type}
                      </Badge>
                      <p className="text-sm font-semibold text-gray-800 flex-1">
                        {item.content}
                      </p>
                    </div>
                    <div className="pl-[180px]">
                      <p className="text-sm text-gray-600">{item.detail}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page as number);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Page;
