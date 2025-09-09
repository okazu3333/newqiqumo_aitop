"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AssistantRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seconds, setSeconds] = useState(2);
  const next = searchParams?.get("next") || "/assistant";

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    const to = setTimeout(() => {
      router.replace(next);
    }, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(to);
    };
  }, [router, next]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">作成を開始します…</span>
        </div>
        <div className="text-xs text-gray-500">{seconds} 秒後に自動で遷移します</div>
        <Button onClick={() => router.replace(next)}>
          今すぐ開始
        </Button>
      </div>
    </main>
  );
} 