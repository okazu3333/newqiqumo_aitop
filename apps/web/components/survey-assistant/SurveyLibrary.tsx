import React, { useState, useMemo, useCallback } from 'react';
import { FileText, Calendar, Eye, MoreHorizontal, X } from 'lucide-react';

interface Survey {
  id: string;
  title: string;
  client: string;
  purpose: string;
  implementationDate: string;
  tags: string[];
  description: string;
}

interface SurveyLibraryProps {
  onSelectSurvey: (survey: Survey) => void;
  searchKeywords?: string[];
  onClearSearch?: () => void;
}

export default function SurveyLibrary({ onSelectSurvey, searchKeywords = [], onClearSearch }: SurveyLibraryProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  const surveys: Survey[] = [
    {
      id: '1',
      title: '消費者満足度調査 2024年版',
      client: 'A社',
      purpose: '満足度調査',
      implementationDate: '2024年3月',
      tags: ['満足度', 'NPS', 'ブランド評価'],
      description: '顧客満足度とNPSを測定する包括的な調査'
    },
    {
      id: '2',
      title: 'ブランド認知度定点調査',
      client: 'B社',
      purpose: '定点調査',
      implementationDate: '2024年1月',
      tags: ['認知度', '定点', 'ブランド'],
      description: '四半期ごとのブランド認知度追跡調査'
    },
    {
      id: '3',
      title: '購買行動変化調査',
      client: 'C社',
      purpose: '動態調査',
      implementationDate: '2023年12月',
      tags: ['購買行動', '変化', 'トレンド'],
      description: 'コロナ禍における消費者の購買行動変化を分析'
    },
    {
      id: '4',
      title: '新商品コンセプト評価調査',
      client: 'D社',
      purpose: 'コンセプト評価',
      implementationDate: '2023年11月',
      tags: ['新商品', 'コンセプト', '評価'],
      description: '新商品のコンセプトに対する消費者反応の測定'
    },
    {
      id: '5',
      title: 'デジタル体験満足度調査',
      client: 'E社',
      purpose: 'UX評価',
      implementationDate: '2023年10月',
      tags: ['デジタル', 'UX', '満足度'],
      description: 'Webサイト・アプリのユーザー体験評価'
    },
    {
      id: '6',
      title: '価格感度分析調査',
      client: 'F社',
      purpose: '価格調査',
      implementationDate: '2023年9月',
      tags: ['価格', '感度', '分析'],
      description: '商品価格に対する消費者の感度分析'
    },
    {
      id: '7',
      title: 'SNS利用実態調査',
      client: 'G社',
      purpose: '利用実態調査',
      implementationDate: '2023年8月',
      tags: ['SNS', '利用実態', 'デジタル'],
      description: 'SNSプラットフォームの利用状況と行動分析'
    },
    {
      id: '8',
      title: '健康意識調査',
      client: 'H社',
      purpose: '意識調査',
      implementationDate: '2023年7月',
      tags: ['健康', '意識', 'ライフスタイル'],
      description: '健康に対する意識と行動の変化を調査'
    },
    {
      id: '9',
      title: 'オンライン学習調査',
      client: 'I社',
      purpose: '教育調査',
      implementationDate: '2023年6月',
      tags: ['教育', 'オンライン', '学習'],
      description: 'オンライン学習の効果と満足度調査'
    },
    {
      id: '10',
      title: 'テレワーク実態調査',
      client: 'J社',
      purpose: '働き方調査',
      implementationDate: '2023年5月',
      tags: ['テレワーク', '働き方', '生産性'],
      description: 'テレワークの実態と課題に関する調査'
    },
    {
      id: '11',
      title: 'サステナビリティ意識調査',
      client: 'K社',
      purpose: '意識調査',
      implementationDate: '2023年4月',
      tags: ['サステナビリティ', '環境', '意識'],
      description: '環境問題とサステナビリティに対する意識調査'
    },
    {
      id: '12',
      title: 'フードデリバリー利用調査',
      client: 'L社',
      purpose: '利用実態調査',
      implementationDate: '2023年3月',
      tags: ['フードデリバリー', '利用実態', '満足度'],
      description: 'フードデリバリーサービスの利用実態と満足度'
    },
    {
      id: '13',
      title: 'キャッシュレス決済調査',
      client: 'M社',
      purpose: '利用実態調査',
      implementationDate: '2023年2月',
      tags: ['キャッシュレス', '決済', 'フィンテック'],
      description: 'キャッシュレス決済の利用状況と課題'
    },
    {
      id: '14',
      title: 'エンターテイメント消費調査',
      client: 'N社',
      purpose: '消費行動調査',
      implementationDate: '2023年1月',
      tags: ['エンターテイメント', '消費', 'メディア'],
      description: 'エンターテイメントコンテンツの消費行動分析'
    },
    {
      id: '15',
      title: 'スマートホーム導入調査',
      client: 'O社',
      purpose: '導入実態調査',
      implementationDate: '2022年12月',
      tags: ['スマートホーム', 'IoT', '導入実態'],
      description: 'スマートホーム機器の導入状況と満足度'
    },
    {
      id: '16',
      title: '副業・兼業実態調査',
      client: 'P社',
      purpose: '働き方調査',
      implementationDate: '2022年11月',
      tags: ['副業', '兼業', '働き方'],
      description: '副業・兼業の実態と課題に関する調査'
    },
    {
      id: '17',
      title: 'シェアリングエコノミー調査',
      client: 'Q社',
      purpose: '利用実態調査',
      implementationDate: '2022年10月',
      tags: ['シェアリング', 'エコノミー', '利用実態'],
      description: 'シェアリングエコノミーサービスの利用実態'
    },
    {
      id: '18',
      title: 'メンタルヘルス調査',
      client: 'R社',
      purpose: '健康調査',
      implementationDate: '2022年9月',
      tags: ['メンタルヘルス', '健康', 'ストレス'],
      description: 'メンタルヘルスの状況とサポートニーズ'
    },
    {
      id: '19',
      title: 'Z世代消費行動調査',
      client: 'S社',
      purpose: '世代別調査',
      implementationDate: '2022年8月',
      tags: ['Z世代', '消費行動', '価値観'],
      description: 'Z世代の消費行動と価値観に関する調査'
    },
    {
      id: '20',
      title: 'リモート医療調査',
      client: 'T社',
      purpose: '医療調査',
      implementationDate: '2022年7月',
      tags: ['リモート医療', 'テレヘルス', '満足度'],
      description: 'リモート医療サービスの利用実態と満足度'
    }
  ];

  // Filter surveys based on search keywords (memoized for performance)
  const filteredSurveys = useMemo(() => {
    if (searchKeywords.length === 0) return surveys;
    
    return surveys.filter(survey => 
      searchKeywords.some(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        return survey.title.toLowerCase().includes(lowerKeyword) ||
               survey.description.toLowerCase().includes(lowerKeyword) ||
               survey.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)) ||
               survey.purpose.toLowerCase().includes(lowerKeyword);
      })
    );
  }, [searchKeywords]);

  const displayedSurveys = useMemo(() => {
    return showAll ? filteredSurveys.slice(0, 20) : filteredSurveys.slice(0, 6);
  }, [filteredSurveys, showAll]);

  const handleSurveyClick = useCallback((survey: Survey) => {
    setSelectedSurveyId(survey.id);
    onSelectSurvey(survey);
  }, [onSelectSurvey]);

  const handlePreview = useCallback((survey: Survey, e: React.MouseEvent) => {
    e.stopPropagation();
    const previewUrl = `/surveys/preview/${survey.id}`;
    window.open(previewUrl, '_blank');
  }, []);

  const handleMore = useCallback((survey: Survey, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('詳細:', survey.title);
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#202020]">調査票ライブラリ</h2>
            {searchKeywords.length > 0 && onClearSearch && (
              <button
                onClick={onClearSearch}
                className="flex items-center gap-1 px-3 py-1 text-sm text-[#9E9E9E] hover:text-[#202020] hover:bg-[#F9F9F9] rounded-lg transition-colors"
                title="検索条件をクリア"
              >
                <X className="w-3 h-3" />
                クリア
              </button>
            )}
          </div>
          {searchKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-sm text-[#9E9E9E]">検索キーワード:</span>
              {searchKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="text-xs bg-[#E8F4F8] text-[#0f7a9e] px-2 py-1 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="text-sm text-[#9E9E9E]">
          {searchKeywords.length > 0 
            ? `${filteredSurveys.length}件の関連調査票`
            : `${surveys.length}件の調査票`
          }
        </span>
      </div>

      {filteredSurveys.length === 0 && searchKeywords.length > 0 ? (
        <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-[#E0E0E0] mx-auto mb-4" />
        <p className="text-[#9E9E9E] mb-4">検索条件に一致する調査票が見つかりませんでした</p>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="px-4 py-2 bg-[#138FB5] text-white rounded-lg hover:bg-[#0f7a9e] transition-colors"
            >
              すべての調査票を表示
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto">
          {displayedSurveys.map((survey) => (
          <div
            key={survey.id}
            onClick={() => handleSurveyClick(survey)}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedSurveyId === survey.id
                ? 'border-[#138FB5] bg-[#E8F4F8] shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#138FB5]" />
                <span className="text-xs font-medium text-[#0f7a9e] bg-[#E8F4F8] px-2 py-1 rounded-full">
                  {survey.purpose}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => handlePreview(survey, e)}
                  className="p-1 text-[#9E9E9E] hover:text-[#202020] hover:bg-[#F9F9F9] rounded transition-colors"
                  title="プレビューを新しいタブで開く"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => handleMore(survey, e)}
                  className="p-1 text-[#9E9E9E] hover:text-[#202020] hover:bg-[#F9F9F9] rounded transition-colors"
                  title="詳細"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="font-medium text-[#202020] mb-2 line-clamp-2">{survey.title}</h3>
            <p className="text-sm text-[#9E9E9E] mb-3 line-clamp-2">{survey.description}</p>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-[#9E9E9E]">
                <FileText className="h-3 w-3" />
                <span>{survey.client}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#9E9E9E]">
                <Calendar className="h-3 w-3" />
                <span>{survey.implementationDate}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {survey.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-[#F9F9F9] text-[#9E9E9E] px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {survey.tags.length > 3 && (
                <span className="text-xs text-[#9E9E9E]">+{survey.tags.length - 3}</span>
              )}
            </div>

            {selectedSurveyId === survey.id && (
              <div className="mt-3 pt-3 border-t border-[#138FB5]">
                <button className="w-full py-2 px-3 bg-[#138FB5] text-white text-sm font-medium rounded-lg hover:bg-[#0f7a9e] transition-colors">
                  この調査票を参考にする
                </button>
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {filteredSurveys.length > 6 && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 text-[#138FB5] hover:text-[#0f7a9e] font-medium transition-colors"
          >
            {showAll ? '表示を減らす (6件表示)' : `すべて表示 (${Math.min(filteredSurveys.length, 20)}件表示)`}
          </button>
        </div>
      )}
    </div>
  );
} 