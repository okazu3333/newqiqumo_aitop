"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Copy,
  Trash2,
  HelpCircle,
  BarChart3,
  List as ListIcon,
  Plus,
  Users,
  Send,
  Download,
  Sparkles,
} from "lucide-react";

const surveyData = [
  { id: 44892, name: "テスト", type: "本調査", responses: 0, creator: "岡崎一希", endDate: "", status: "配信依頼設定中", requestTime: "" },
  { id: 44101, name: "afsfasafa", type: "本調査", responses: 0, creator: "岡崎一希", endDate: "", status: "作成中", requestTime: "" },
  { id: 37742, name: "あああああ", type: "本調査", responses: 0, creator: "岡崎一希", endDate: "", status: "作成中", requestTime: "" },
  { id: 36861, name: "aaa", type: "本調査", responses: 0, creator: "岡崎一希", endDate: "", status: "作成中", requestTime: "" },
];

export default function TopPage() {
  const router = useRouter();
  const [surveys] = useState(surveyData);
  const [searchName, setSearchName] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCreator, setSelectedCreator] = useState("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const creators = useMemo(() => Array.from(new Set(surveys.map((s) => s.creator))), [surveys]);

  const filtered = surveys.filter((s) => {
    const byName = searchName ? s.name.includes(searchName) : true;
    const byType = selectedType !== "all" ? s.type === selectedType : true;
    const byStatus = selectedStatus !== "all" ? s.status === selectedStatus : true;
    const byCreator = selectedCreator !== "all" ? s.creator === selectedCreator : true;
    const byDate = dateFrom || dateTo ? true : true;
    return byName && byType && byStatus && byCreator && byDate;
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="w-full max-w-none mx-auto px-4">
        <div className="bg-[#f6faf9] border-b border-teal-200 p-3">
          {/* Filters + Buttons in one horizontal row */}
          <div className="flex items-end justify-between gap-4">
            {/* Filters (left) */}
            <div className="flex items-end gap-3 flex-nowrap">
              <div className="min-w-[240px]">
                <label className="block text-xs font-medium mb-1 text-gray-700">アンケート名検索</label>
                <Input
                  placeholder="アンケート名検索"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="h-8 text-sm w-[240px]"
                />
              </div>
              <div className="min-w-[160px]">
                <label className="block text-xs font-medium mb-1 text-gray-700">アンケート種別</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-8 text-sm w-[160px]">
                    <SelectValue placeholder="指定なし" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">指定なし</SelectItem>
                    <SelectItem value="本調査">本調査</SelectItem>
                    <SelectItem value="事前抽出調査">事前抽出調査</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[160px]">
                <label className="block text-xs font-medium mb-1 text-gray-700">ステータス</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-8 text-sm w-[160px]">
                    <SelectValue placeholder="指定なし" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">指定なし</SelectItem>
                    <SelectItem value="作成中">作成中</SelectItem>
                    <SelectItem value="配信依頼設定中">配信依頼設定中</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[160px]">
                <label className="block text-xs font-medium mb-1 text-gray-700">作成者</label>
                <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                  <SelectTrigger className="h-8 text-sm w-[160px]">
                    <SelectValue placeholder="指定なし" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">指定なし</SelectItem>
                    {creators.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[300px]">
                <label className="block text-xs font-medium mb-1 text-gray-700">終了日</label>
                <div className="flex items-center gap-1">
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-sm w-[140px]" />
                  <span className="text-xs text-gray-500">-</span>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-sm w-[140px]" />
                </div>
              </div>
            </div>

            {/* Actions (right) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button onClick={() => router.push("/assistant/redirect")} className="bg-[#ff6b00] hover:bg-[#e65f00] text-white rounded-full h-9 px-4 shadow-md">
                <Sparkles className="w-4 h-4 mr-1" /> New AIで作成
              </Button>
              <Button onClick={() => router.push("/surveys/new")} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" /> 新規作成
              </Button>
              <Button variant="outline" size="sm">リスト管理</Button>
              <Button variant="outline" size="sm">無料集計ツール</Button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-3">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#75bacf] hover:bg-[#75bacf]">
                <TableHead className="text-white w-10 text-center">
                  <Users className="w-4 h-4 inline" />
                </TableHead>
                <TableHead className="text-white w-16">NO</TableHead>
                <TableHead className="text-white">アンケート名</TableHead>
                <TableHead className="text-white w-24">アンケート種別</TableHead>
                <TableHead className="text-white w-20">回答数</TableHead>
                <TableHead className="text-white w-28">作成者</TableHead>
                <TableHead className="text-white w-32">終了日</TableHead>
                <TableHead className="text-white w-32">ステータス</TableHead>
                <TableHead className="text-white w-32">配信依頼時間</TableHead>
                <TableHead className="text-white w-20 text-center">表示</TableHead>
                <TableHead className="text-white w-[320px] text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50">
                  <TableCell className="text-center">
                    <Users className="w-4 h-4 text-gray-500 mx-auto" />
                  </TableCell>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.type}</TableCell>
                  <TableCell>{s.responses}</TableCell>
                  <TableCell>{s.creator}</TableCell>
                  <TableCell>{s.endDate || "-"}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>{s.requestTime || "-"}</TableCell>
                  <TableCell className="text-center">
                    <Switch checked onCheckedChange={() => {}} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" size="sm" title="編集">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="配信">
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="ダッシュボード">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="回答データ">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="コピー">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="削除">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="一覧">
                        <ListIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="ヘルプ">
                        <HelpCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
} 