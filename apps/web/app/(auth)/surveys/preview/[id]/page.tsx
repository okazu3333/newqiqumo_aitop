"use client";

import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SurveyPreviewPage() {
  const params = useParams();
  const surveyId = params.id as string;

  const handleGoBack = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
      <div className="text-center bg-white p-12 rounded-lg shadow-sm border border-gray-200 max-w-md w-full mx-4">
        <div className="text-9xl font-bold text-[#E0E0E0] mb-4">404</div>
        <h2 className="text-2xl font-bold text-[#202020] mb-2">ページが見つかりません</h2>
        <p className="text-[#9E9E9E] mb-6">
          調査票プレビュー機能は現在開発中です
        </p>
        <div className="space-y-2 text-sm text-[#9E9E9E] mb-6">
          <p>Survey ID: {surveyId}</p>
          <p>URL: /surveys/preview/{surveyId}</p>
        </div>
        <Button 
          onClick={handleGoBack}
          className="bg-[#138FB5] hover:bg-[#0f7a9e] text-white flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          閉じる
        </Button>
      </div>
    </div>
  );
} 