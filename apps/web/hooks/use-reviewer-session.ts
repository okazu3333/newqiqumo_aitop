"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ReviewerSession = {
  displayName: string;
  surveyId: number;
};

export const useReviewerSession = (surveyId: number) => {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<ReviewerSession | null>(null);

  useEffect(() => {
    // localStorageから表示名を取得
    const displayName = localStorage.getItem(`reviewer_${surveyId}`);

    // レビュアー用のパスかチェック
    const isReviewerPath = pathname.includes("/reviewer/");

    if (isReviewerPath && !displayName && !pathname.includes("/login")) {
      // ログインしていない場合はログインページへリダイレクト
      router.push(`/surveys/${surveyId}/review/reviewer/login`);
    } else if (displayName) {
      setSession({
        displayName,
        surveyId,
      });
    }
  }, [surveyId, pathname, router]);

  const logout = () => {
    localStorage.removeItem(`reviewer_${surveyId}`);
    router.push(`/surveys/${surveyId}/review/reviewer/login`);
  };

  return {
    session,
    logout,
  };
};
