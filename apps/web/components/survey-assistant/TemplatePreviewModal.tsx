"use client";

import React, { useState } from "react";
import { X, FileText, User, CircleDot, CheckSquare, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export type PreviewQuestion = {
  id?: string;
  text: string;
  type?: 'single' | 'multiple' | 'scale' | 'text';
  options?: string[];
  scale?: { min: number; max: number; labels: string[] };
  category?: string;
};

export type TemplatePreview = {
  title: string;
  description?: string;
  category: string;
  questionCount: number;
  audience: string;
  questions: PreviewQuestion[];
  purpose?: string;
  categoryCounts?: { label: string; count: number }[];
  mode?: 'screening' | 'main';
};

type TemplatePreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TemplatePreview | null;
  onConfirm: () => void;
  onEdit: () => void;
};

export default function TemplatePreviewModal({ open, onOpenChange, data, onConfirm, onEdit }: TemplatePreviewModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === 'Tab') {
        const root = containerRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // Focus first actionable on open
    requestAnimationFrame(() => {
      containerRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
    });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="template-preview-title">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} aria-hidden="true" />
      <div ref={containerRef} className="relative bg-white rounded-lg w-full max-w-6xl h-[80vh] mx-4 overflow-hidden flex shadow-xl">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 id="template-preview-title" className="font-semibold text-gray-900">アンケート情報</h3>
          </div>

          {/* Template Title */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{data.title}</h4>
            {data.description && <p className="text-sm text-gray-600">{data.description}</p>}
          </div>

          {/* Category */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">カテゴリ</p>
            <p className="text-sm text-gray-800">{data.category}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="py-3 px-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">設問数</p>
              <p className="text-sm font-medium text-primary">{data.questionCount}問</p>
            </div>
            <div className="py-3 px-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">対象者</p>
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{data.audience}</span>
              </div>
            </div>
          </div>

          {/* Mode Badge */}
          {data.mode && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-1">アンケート手法</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full border ${data.mode === 'main' ? 'text-sky-700 bg-sky-50 border-sky-200' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                {data.mode === 'main' ? 'じっくり聞くアンケート（本調査）' : '対象を絞るアンケート（事前調査）'}
              </span>
            </div>
          )}

          {/* Purpose */}
          {data.purpose && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-1">調査目的</p>
              <p className="text-sm text-gray-700 leading-relaxed">{data.purpose}</p>
            </div>
          )}

          {/* Category Counts */}
          {data.categoryCounts && data.categoryCounts.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-2">カテゴリ別設問数</p>
              <div className="space-y-2">
                {data.categoryCounts.map((c, i) => (
                  <div key={`${c.label}-${i}`} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-700">{c.label}</span>
                    <span className="text-sm font-medium text-blue-600">{c.count}問</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">合計</span>
                <span className="text-sm font-semibold text-primary">{data.questionCount}問</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">アンケートプレビュー</h2>
              <p className="text-sm text-gray-600 mt-1">実際の調査画面のイメージです</p>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              {/* Survey Header */}
              <div className="text-center mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-gray-800">{data.title}</p>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {data.questions.map((q, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200">
                    <div className="p-4">
                      <p className="text-sm text-gray-900 flex items-center gap-2 flex-wrap">
                        <span className="text-gray-500 mr-1">Q{idx + 1}.</span>
                        <TypeBadge type={q.type} />
                        {q.category && <CategoryBadge label={q.category} />}
                        <span className="whitespace-pre-wrap break-words">{q.text}</span>
                      </p>
                    </div>
                  </div>
                ))}
                {data.questions.length === 0 && (
                  <div className="p-4 text-xs text-gray-500">設問がありません</div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-2 sticky bottom-0 bg-white">
            <Button variant="outline" onClick={onEdit}>このテンプレートを利用する</Button>
            <Button onClick={onConfirm}>QIQUMOで作成する</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionItem({ index, question }: { index: number; question: PreviewQuestion }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 mr-1">Q{index + 1}.</span>
            <TypeBadge type={question.type} />
            {question.category && <CategoryBadge label={question.category} />}
            <span className="whitespace-pre-wrap break-words">{question.text}</span>
          </p>
        </div>
        {(question.options?.length || question.scale) && (
          <button
            className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '選択肢を隠す' : '選択肢を表示'}
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          {question.type === 'single' && question.options && (
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="radio" name={`q-${index}`} className="text-blue-600" />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'multiple' && question.options && (
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" className="text-blue-600 rounded" />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'scale' && question.scale && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                {question.scale.labels.map((label, labelIndex) => (
                  <div key={labelIndex} className="flex flex-col items-center gap-2">
                    <input type="radio" name={`q-${index}`} className="text-blue-600" value={labelIndex + 1} />
                    <span className="text-xs text-center text-gray-600 max-w-16">{label}</span>
                    <span className="text-xs font-medium text-gray-800">{labelIndex + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              placeholder="ご自由にお書きください..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          )}
        </div>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: PreviewQuestion['type'] }) {
  const info = (() => {
    switch (type) {
      case 'single':
        return { label: '単一選択', icon: <CircleDot className="w-3.5 h-3.5" />, cls: 'text-primary bg-primary/10 border-primary/20' };
      case 'multiple':
        return { label: '複数選択', icon: <CheckSquare className="w-3.5 h-3.5" />, cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'scale':
        return { label: '5段階評価', icon: <SlidersHorizontal className="w-3.5 h-3.5" />, cls: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'text':
      default:
        return { label: '自由記述', icon: <FileText className="w-3.5 h-3.5" />, cls: 'text-gray-700 bg-gray-50 border-gray-200' };
    }
  })();
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border ${info.cls}`} title={info.label}>
      {info.icon}
      {info.label}
    </span>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border text-purple-700 bg-purple-50 border-purple-200" title={label}>
      {label}
    </span>
  );
} 