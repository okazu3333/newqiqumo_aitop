"use client";

import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/trpc/react";

type ReviewUrlDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: number;
};

export const ReviewUrlDialog = ({
  open,
  onOpenChange,
  surveyId,
}: ReviewUrlDialogProps) => {
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // データ取得
  const { data: reviewAccess, refetch } =
    api.reviewAccess.getBySurveyId.useQuery({ surveyId }, { enabled: open });

  // 保存用のmutation
  const { mutate: saveAccess, isPending } = api.reviewAccess.upsert.useMutation(
    {
      onSuccess: () => {
        toast("レビューアクセス情報を保存しました");
        setIsEditing(false);
        refetch();
      },
      onError: (error) => {
        toast.error(`エラー: ${error.message}`);
      },
    },
  );

  // 初期値設定
  useEffect(() => {
    if (reviewAccess) {
      setPassword(reviewAccess.password);
      setExpiresAt(new Date(reviewAccess.expiresAt).toISOString().slice(0, 16));
    } else {
      // デフォルト値
      setPassword("review123");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7); // 7日後
      setExpiresAt(tomorrow.toISOString().slice(0, 16));
    }
  }, [reviewAccess]);

  const reviewUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/surveys/${surveyId}/review/reviewer/login`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast(`${label}をコピーしました`);
  };

  const handleSave = () => {
    if (!password || !expiresAt) {
      toast.error("パスワードと有効期限を入力してください");
      return;
    }

    saveAccess({
      surveyId,
      password,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            レビュー用URL・パスワード
            {isEditing && (
              <span className="ml-2 text-sm font-normal text-blue-600">
                （編集中）
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="review-url">レビュー用URL</Label>
            <div className="flex gap-2">
              <Input
                id="review-url"
                value={reviewUrl}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(reviewUrl, "URL")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-password">パスワード</Label>
            <div className="flex gap-2">
              <Input
                id="review-password"
                value={password}
                readOnly={!isEditing}
                onChange={(e) => setPassword(e.target.value)}
                className={`flex-1 ${
                  isEditing
                    ? "border-blue-500 bg-blue-50 focus:bg-white"
                    : "bg-gray-50"
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(password, "パスワード")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires-at">有効期限</Label>
            <div className="flex gap-2">
              <Input
                id="expires-at"
                type="datetime-local"
                value={expiresAt}
                readOnly={!isEditing}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={`flex-1 ${
                  isEditing
                    ? "border-blue-500 bg-blue-50 focus:bg-white"
                    : "bg-gray-50"
                }`}
              />
              <div className="w-10" />
            </div>
            {reviewAccess?.isExpired && (
              <p className="text-sm text-red-500">
                このURLは有効期限が切れています
              </p>
            )}
          </div>

          <div className="pt-4 flex gap-2 justify-end">
            {!isEditing ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                編集
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    // 元の値に戻す
                    if (reviewAccess) {
                      setPassword(reviewAccess.password);
                      setExpiresAt(
                        new Date(reviewAccess.expiresAt)
                          .toISOString()
                          .slice(0, 16),
                      );
                    }
                  }}
                  className="bg-gray-50 hover:bg-gray-100"
                >
                  キャンセル
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  保存
                </Button>
              </>
            )}
          </div>

          <div className="pt-2 text-sm text-gray-500">
            レビュアーにこのURLとパスワードを共有してください。
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
