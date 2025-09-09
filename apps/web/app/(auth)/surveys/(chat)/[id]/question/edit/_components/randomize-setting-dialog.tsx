"use client";

import { Info, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Block = {
  id: number;
  name: string;
  startQuestion: string;
  endQuestion: string;
  randomEnabled: boolean;
};

type RandomizeSettingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const RandomizeSettingDialog = ({
  isOpen,
  onClose,
}: RandomizeSettingDialogProps) => {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 1,
      name: "ブロック1",
      startQuestion: "Q1 あなたの性別を教えてください。",
      endQuestion: "Q2 あなたの年齢を教えてください。",
      randomEnabled: true,
    },
    {
      id: 2,
      name: "ブロック2",
      startQuestion: "Q3 あなたのお住まい（都道府県）を教えてください。",
      endQuestion: "Q4 あなたは結婚していますか。",
      randomEnabled: false,
    },
    {
      id: 3,
      name: "ブロック3",
      startQuestion: "Q5 あなたと同居している方をお知らせください。",
      endQuestion: "Q7 あなたはどのくらいの頻度で化粧品を使用しますか？",
      randomEnabled: false,
    },
  ]);

  const toggleRandom = (id: number) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id
          ? { ...block, randomEnabled: !block.randomEnabled }
          : block,
      ),
    );
  };

  const deleteBlock = (id: number) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  const addBlock = () => {
    const newId = Math.max(...blocks.map((b) => b.id), 0) + 1;
    setBlocks([
      ...blocks,
      {
        id: newId,
        name: `ブロック${newId}`,
        startQuestion: `Q${newId} 新しい質問...`,
        endQuestion: `Q${newId + 1} 新しい質問...`,
        randomEnabled: false,
      },
    ]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="bg-[#333333] text-white px-6 py-4">
          <DialogTitle className="text-xl font-semibold">
            ランダム設定
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Description */}
          <div className="mb-6">
            <p className="text-[#333333] text-sm mb-3">
              ランダム設定を行うには、ブロックを設定してからランダムの設定を行います
            </p>

            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 bg-[#E8F5F9] px-3 py-1 rounded-md">
                <Info className="w-4 h-4 text-[#138FB5]" />
                <span className="text-sm text-[#138FB5] font-medium">
                  ブロック編集
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-[#556064] mb-4">
                ※ブロックは複数設定することも可能です（例Q1〜Q1）
              </p>

              <Button
                className="text-[#138FB5] border-[#138FB5] rounded-full hover:bg-[#138FB5]/10 hover:text-[#138FB5] text-sm font-medium"
                variant="outline"
              >
                ブロック単位のランダム
              </Button>
            </div>
          </div>

          {/* Table */}
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f5f5f5]">
                  <TableHead className="text-[#333333] font-medium text-xs">
                    グループ
                  </TableHead>
                  <TableHead className="text-[#333333] font-medium text-xs">
                    ブロック
                  </TableHead>
                  <TableHead className="text-[#333333] font-medium text-xs">
                    ブロック開始質問
                  </TableHead>
                  <TableHead className="text-center text-[#333333] font-medium text-xs">
                    〜
                  </TableHead>
                  <TableHead className="text-[#333333] font-medium text-xs">
                    ブロック終了質問
                  </TableHead>
                  <TableHead className="text-center text-[#333333] font-medium text-xs">
                    設問ランダム
                  </TableHead>
                  <TableHead className="text-center text-[#333333] font-medium text-xs">
                    削除
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block) => (
                  <TableRow key={block.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm text-[#556064]">-</TableCell>
                    <TableCell className="text-sm font-medium text-[#333333]">
                      <Select defaultValue={block.name}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={block.name}>
                            {block.name}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-[#556064]">
                      <Select defaultValue={block.startQuestion}>
                        <SelectTrigger className="w-[200px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={block.startQuestion}>
                            {block.startQuestion}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center text-sm text-[#556064]">
                      〜
                    </TableCell>
                    <TableCell className="text-sm text-[#556064]">
                      <Select defaultValue={block.endQuestion}>
                        <SelectTrigger className="w-[200px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={block.endQuestion}>
                            {block.endQuestion}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={block.randomEnabled}
                        onCheckedChange={() => toggleRandom(block.id)}
                        className="data-[state=checked]:bg-[#138FB5]"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBlock(block.id)}
                        className="h-8 w-8 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Add Block Button */}
          <div className="flex justify-center mt-6">
            <Button
              onClick={addBlock}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-2",
                "bg-[#138FB5] hover:bg-[#138FB5]/80 text-white",
                "rounded-full font-medium text-sm",
              )}
            >
              <Plus className="w-5 h-5" />
              ブロックを作成
            </Button>
          </div>
        </div>

        <DialogFooter className="bg-[#f5f5f5] px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 text-[#333333]"
          >
            キャンセル
          </Button>
          <Button
            onClick={onClose}
            className="px-6 bg-[#333333] hover:bg-[#333333]/80 text-white"
          >
            ブロックを保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
