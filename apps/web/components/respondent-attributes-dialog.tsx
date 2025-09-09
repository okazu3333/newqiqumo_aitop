"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RespondentAttributesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
};

export const RespondentAttributesDialog = ({
  open,
  onOpenChange,
  // projectId,
  projectTitle,
}: RespondentAttributesDialogProps) => {
  const [residence, setResidence] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = () => {
    // 将来的に外部URLを開く処理を追加
    console.log("Survey attributes:", { residence, ageGroup, gender });
    // window.open(externalUrl, "_blank");
    onOpenChange(false);
    // フォームをリセット
    setResidence("");
    setAgeGroup("");
    setGender("");
  };

  const isFormValid = residence && ageGroup && gender;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>アンケート回答者属性選択</DialogTitle>
          <DialogDescription>
            「{projectTitle}
            」のアンケート回答を開始するために、以下の属性を選択してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="residence">居住地</Label>
            <Select value={residence} onValueChange={setResidence}>
              <SelectTrigger id="residence">
                <SelectValue placeholder="居住地を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hokkaido">北海道</SelectItem>
                <SelectItem value="tohoku">東北</SelectItem>
                <SelectItem value="kanto">関東</SelectItem>
                <SelectItem value="chubu">中部</SelectItem>
                <SelectItem value="kinki">近畿</SelectItem>
                <SelectItem value="chugoku">中国</SelectItem>
                <SelectItem value="shikoku">四国</SelectItem>
                <SelectItem value="kyushu">九州・沖縄</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="age-group">年齢層</Label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger id="age-group">
                <SelectValue placeholder="年齢層を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10s">10代</SelectItem>
                <SelectItem value="20s">20代</SelectItem>
                <SelectItem value="30s">30代</SelectItem>
                <SelectItem value="40s">40代</SelectItem>
                <SelectItem value="50s">50代</SelectItem>
                <SelectItem value="60s">60代</SelectItem>
                <SelectItem value="70s">70代以上</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender">性別</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="性別を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男性</SelectItem>
                <SelectItem value="female">女性</SelectItem>
                <SelectItem value="other">その他</SelectItem>
                <SelectItem value="no-answer">回答しない</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="bg-[#138fb5] hover:bg-[#0f7a9e]"
          >
            アンケートを開始
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
