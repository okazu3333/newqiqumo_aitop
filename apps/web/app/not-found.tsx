import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 px-4">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700">
        ページが見つかりませんでした
      </h2>
      <p className="text-center text-gray-600 max-w-md">
        お探しのページは存在しないか、移動した可能性があります。
        URLをご確認の上、もう一度お試しください。
      </p>
      <Link href="/">
        <Button className="mt-4">調査一覧に戻る</Button>
      </Link>
    </div>
  );
}
