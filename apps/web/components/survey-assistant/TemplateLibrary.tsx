import React, { useState } from 'react';
import { FileText, Eye, ChevronLeft, ChevronRight, Search, BarChart3, Activity, Lightbulb, Shield } from 'lucide-react';

interface ScrollState {
  isDragging: boolean;
  startX: number;
  scrollLeft: number;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  features: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  category?: string;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
}

const templateSegments = [
  {
    id: 'awareness',
    title: '認知・認識調査',
    icon: Search,
    color: 'bg-slate-600',
    iconColor: 'text-white',
    templates: [
      {
        id: 'product-awareness',
        title: '商品認知度調査',
        description: 'この商品を知っているか、どこで知ったかを確認',
        features: ['認知率測定', '認知経路分析', '競合比較'],
        difficulty: 'basic' as const
      },
      {
        id: 'ad-effectiveness',
        title: '広告効果調査',
        description: '広告接触の有無、想起した内容、印象変化を測定',
        features: ['広告接触率', '想起内容', '印象変化'],
        difficulty: 'intermediate' as const
      },
      {
        id: 'brand-awareness',
        title: 'ブランド認知調査',
        description: 'ブランド名を知っているか、他社比較での想起率',
        features: ['純粋想起', '助成想起', '競合比較'],
        difficulty: 'basic' as const
      },
      {
        id: 'campaign-awareness',
        title: 'キャンペーン認知調査',
        description: 'キャンペーンを知っているか、参加意向はどうか',
        features: ['キャンペーン認知', '参加意向', '効果測定'],
        difficulty: 'basic' as const
      }
    ]
  },
  {
    id: 'satisfaction',
    title: '満足度・評価調査',
    icon: BarChart3,
    color: 'bg-slate-600',
    iconColor: 'text-white',
    templates: [
      {
        id: 'customer-satisfaction',
        title: '顧客満足度（CS調査）',
        description: '商品やサービスの満足度、改善点を確認',
        features: ['総合満足度', '項目別評価', '改善要望'],
        difficulty: 'basic' as const
      },
      {
        id: 'employee-satisfaction',
        title: '従業員満足度（ES調査）',
        description: '社内制度や働きやすさを評価',
        features: ['職場環境', '制度評価', 'エンゲージメント'],
        difficulty: 'intermediate' as const
      },
      {
        id: 'service-experience',
        title: 'サービス体験評価',
        description: '接客、サポート、UXなどの体験を評価',
        features: ['接客評価', 'UX評価', 'サポート品質'],
        difficulty: 'intermediate' as const
      },
      {
        id: 'event-satisfaction',
        title: 'イベント参加満足度',
        description: 'イベントやセミナー参加者の評価・改善要望',
        features: ['内容評価', '運営評価', '改善提案'],
        difficulty: 'basic' as const
      }
    ]
  },
  {
    id: 'behavior',
    title: '利用実態・行動調査',
    icon: Activity,
    color: 'bg-slate-600',
    iconColor: 'text-white',
    templates: [
      {
        id: 'purchase-behavior',
        title: '購買行動調査',
        description: '購入場所、購入頻度、支払方法などを把握',
        features: ['購入チャネル', '購入頻度', '決済方法'],
        difficulty: 'intermediate' as const
      },
      {
        id: 'product-usage',
        title: '商品利用度調査',
        description: '利用頻度や利用理由を把握',
        features: ['利用頻度', '利用理由', 'シーン把握'],
        difficulty: 'basic' as const
      },
      {
        id: 'usage-scenario',
        title: '利用シーン調査',
        description: 'いつ・どこで・どんな状況で使われているかを調査',
        features: ['利用場面', '利用頻度', 'シチュエーション'],
        difficulty: 'basic' as const
      },
      {
        id: 'churn-analysis',
        title: '解約・離脱理由調査',
        description: '利用をやめた理由、代替手段を確認',
        features: ['離脱理由', '代替選択', '改善要望'],
        difficulty: 'advanced' as const
      },
      {
        id: 'user-profile',
        title: 'ユーザープロファイル調査',
        description: '属性や生活習慣、関連行動を把握',
        features: ['デモグラフィック', 'ライフスタイル', '行動パターン'],
        difficulty: 'intermediate' as const
      },
      {
        id: 'app-usage',
        title: 'アプリ利用調査',
        description: '利便性や改善点を把握',
        features: ['利用頻度', 'UX評価', '改善要望'],
        difficulty: 'basic' as const
      }
    ]
  },
  {
    id: 'new-product',
    title: '新商品・サービス調査',
    icon: Lightbulb,
    color: 'bg-slate-600',
    iconColor: 'text-white',
    templates: [
      {
        id: 'concept-evaluation',
        title: '新商品コンセプト評価',
        description: 'アイデア段階での受容性や購入意向を測る',
        features: ['コンセプト評価', '購入意向', '改善提案'],
        difficulty: 'advanced' as const
      },
      {
        id: 'package-test',
        title: 'パッケージテスト',
        description: 'デザインやラベルの好意度・分かりやすさを確認',
        features: ['デザイン評価', '視認性', '情報伝達'],
        difficulty: 'intermediate' as const
      },
      {
        id: 'price-sensitivity',
        title: '価格受容性調査',
        description: '許容価格帯や価格印象を把握',
        features: ['PSM分析', '価格感度', '競合比較'],
        difficulty: 'advanced' as const
      },
      {
        id: 'competitive-analysis',
        title: '競合比較調査',
        description: '新商品と既存競合を並べて比較評価',
        features: ['競合比較', '差別化要因', 'ポジショニング'],
        difficulty: 'advanced' as const
      }
    ]
  },
  {
    id: 'brand-image',
    title: 'ブランド・イメージ調査',
    icon: Shield,
    color: 'bg-slate-600',
    iconColor: 'text-white',
    templates: [
      {
        id: 'brand-image-evaluation',
        title: 'ブランドイメージ評価',
        description: '信頼性・先進性・親しみやすさなどを測定',
        features: ['イメージ評価', '属性分析', 'ポジショニング'],
        difficulty: 'intermediate' as const
      },
      {
        id: 'brand-comparison',
        title: 'ブランド比較調査',
        description: '複数ブランドの印象を比較',
        features: ['多ブランド比較', '相対評価', '差別化分析'],
        difficulty: 'advanced' as const
      },
      {
        id: 'nps-survey',
        title: 'NPS調査',
        description: '推奨度（0〜10点）と理由を把握',
        features: ['NPS測定', '推奨理由', 'セグメント分析'],
        difficulty: 'basic' as const
      },
      {
        id: 'attitude-change',
        title: '態度変容調査',
        description: '認知 → 興味 → 購入意向 までの変化を測る',
        features: ['認知段階', '興味度', '購入意向'],
        difficulty: 'advanced' as const
      }
    ]
  }
];

export const listAllTemplates = (): Template[] =>
  templateSegments.flatMap((segment) =>
    segment.templates.map((t) => ({ ...t, category: segment.title })),
  );

export default function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
  const [currentSlides, setCurrentSlides] = useState<Record<string, number>>({});
  const [scrollStates, setScrollStates] = useState<Record<string, ScrollState>>({});

  const getSlideIndex = (segmentId: string) => currentSlides[segmentId] || 0;

  const nextSlide = (segmentId: string) => {
    const container = document.getElementById(`slider-${segmentId}`);
    if (container) {
      const cardWidth = 320; // Card width + gap
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  const prevSlide = (segmentId: string) => {
    const container = document.getElementById(`slider-${segmentId}`);
    if (container) {
      const cardWidth = 320; // Card width + gap
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, segmentId: string) => {
    const container = e.currentTarget as HTMLElement;
    setScrollStates(prev => ({
      ...prev,
      [segmentId]: {
        isDragging: true,
        startX: e.pageX - container.offsetLeft,
        scrollLeft: container.scrollLeft
      }
    }));
  };

  const handleMouseMove = (e: React.MouseEvent, segmentId: string) => {
    const state = scrollStates[segmentId];
    if (!state?.isDragging) return;
    
    e.preventDefault();
    const container = e.currentTarget as HTMLElement;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - state.startX) * 2;
    container.scrollLeft = state.scrollLeft - walk;
  };

  const handleMouseUp = (segmentId: string) => {
    setScrollStates(prev => ({
      ...prev,
      [segmentId]: { ...prev[segmentId], isDragging: false }
    }));
  };

  const handleScroll = (e: React.UIEvent, segmentId: string) => {
    const container = e.currentTarget as HTMLElement;
    const cardWidth = 320; // Approximate card width including gap
    const newIndex = Math.round(container.scrollLeft / cardWidth);
    
    setCurrentSlides(prev => ({
      ...prev,
      [segmentId]: Math.max(0, Math.min(newIndex, Math.ceil(templateSegments.find(s => s.id === segmentId)!.templates.length / 3) - 1))
    }));
  };

  // removed unused helpers

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">テンプレートライブラリ</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          目的に応じたテンプレートを選択して、効率的に調査を設計しましょう
        </p>
      </div>

      {/* Template Segments */}
      <div className="space-y-6">
        {templateSegments.map((segment) => {
          const currentIndex = getSlideIndex(segment.id);
          const templatesPerSlide = 3;
          const totalSlides = Math.ceil(segment.templates.length / templatesPerSlide);
          const startIndex = currentIndex * templatesPerSlide;
          const endIndex = Math.min(startIndex + templatesPerSlide, segment.templates.length);
          const IconComponent = segment.icon;

          return (
            <div key={segment.id} className="relative">
              {/* Segment Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 ${segment.color} rounded-lg`}>
                  <IconComponent className={`h-4 w-4 ${segment.iconColor}`} />
                </div>
                <h4 className="text-sm font-medium text-gray-700">{segment.title}</h4>
              </div>

              {/* Navigation Controls */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={() => prevSlide(segment.id)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all group"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                  </button>
                  <button
                    onClick={() => nextSlide(segment.id)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all group"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                  </button>
                </>
              )}

              {/* Templates Slider */}
              <div className="relative mx-12">
                <div 
                  id={`slider-${segment.id}`}
                  className="flex gap-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing pb-4"
                  style={{ 
                    scrollBehavior: scrollStates[segment.id]?.isDragging ? 'auto' : 'smooth',
                    scrollSnapType: 'x mandatory'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, segment.id)}
                  onMouseMove={(e) => handleMouseMove(e, segment.id)}
                  onMouseUp={() => handleMouseUp(segment.id)}
                  onMouseLeave={() => handleMouseUp(segment.id)}
                  onScroll={(e) => handleScroll(e, segment.id)}
                >
                  {segment.templates.slice(startIndex, endIndex).map((template) => (
                    <div
                      key={template.id}
                      onClick={() => {
                        if (!scrollStates[segment.id]?.isDragging) {
                          onSelectTemplate({ ...template, category: segment.title });
                        }
                      }}
                      className="group relative bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg cursor-pointer transition-all duration-200 overflow-hidden flex-shrink-0 w-80"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      {/* Content */}
                      <div className="relative p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-lg bg-gray-100">
                            <FileText className="h-6 w-6 text-gray-600" />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTemplate({ ...template, category: segment.title });
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="プレビューを開く"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Title and Description */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-900 mb-2">
                            {template.title}
                          </h5>
                          <p className="text-gray-600 text-sm">
                            {template.description}
                          </p>
                        </div>
                        
                        {/* Features */}
                        <div className="space-y-2">
                          {template.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              <span className="text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom scrollbar styles */}
              <style jsx>{`
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              {/* Slide Indicators */}
              {totalSlides > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlides(prev => ({ ...prev, [segment.id]: index }))}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex 
                          ? 'bg-blue-600' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Decoration */}
      <div className="text-center pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
          <FileText className="h-4 w-4" />
          <span>すべてのテンプレートはカスタマイズ可能です</span>
        </div>
      </div>
    </div>
  );
}