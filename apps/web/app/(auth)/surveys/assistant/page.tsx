"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Send, Upload, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QuestionConfirmModal from '@/components/survey-assistant/QuestionConfirmModal';
import TemplatePreviewModal, { TemplatePreview, PreviewQuestion } from '@/components/survey-assistant/TemplatePreviewModal';
import { SURVEY_ASSISTANT_SYSTEM_PROMPT } from '@/components/survey-assistant/prompt';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { listAllTemplates } from '@/components/survey-assistant/TemplateLibrary';

interface Survey {
  id: string;
  title: string;
  client: string;
  purpose: string;
  implementationDate: string;
  tags: string[];
  description: string;
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatCollected = {
  theme?: string;
  mode?: 'screening' | 'main';
  count?: number;
  audience?: string;
  needs?: string;
};

export default function SurveyAssistantPage() {
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [referenceSurvey, setReferenceSurvey] = useState<Survey | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'sys', role: 'system', content: SURVEY_ASSISTANT_SYSTEM_PROMPT }]);
  const [collected, setCollected] = useState<ChatCollected>({});

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [generatedQuestions] = useState<string[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null);
  const [seeAllOpen, setSeeAllOpen] = useState(false);
  const [pastOpen, setPastOpen] = useState(false);
  // See-all modal filters
  const [tplSearch, setTplSearch] = useState("");
  const [tplCategory, setTplCategory] = useState("");
  const [tplMethod, setTplMethod] = useState<"screening" | "main" | "">("");
  const [tplPage, setTplPage] = useState(1);
  // Past modal filters (same as template modal)
  const [pastSearch, setPastSearch] = useState("");
  const [pastCategory, setPastCategory] = useState("");
  const [pastMethod, setPastMethod] = useState<"screening" | "main" | "">("");
  const [pastShowAll, setPastShowAll] = useState(false);
  // Modal UX enhancements: refs, scrolled states, sort controls
  const tplSearchRef = useRef<HTMLInputElement | null>(null);
  const pastSearchRef = useRef<HTMLInputElement | null>(null);
  const tplScrollRef = useRef<HTMLDivElement | null>(null);
  const pastScrollRef = useRef<HTMLDivElement | null>(null);
  const [tplScrolled, setTplScrolled] = useState(false);
  const [pastScrolled, setPastScrolled] = useState(false);
  const [pastSort, setPastSort] = useState<'おすすめ' | '新着'>('おすすめ');

  const chatCardRef = useRef<HTMLDivElement | null>(null);
  const isChatActive = inputMessage.trim().length > 0 || attachedFiles.length > 0;

  const [isSending, setIsSending] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const hasConversation = messages.some((m) => m.role !== 'system');
  const isChatVisible = inputFocused || inputMessage.trim().length > 0 || hasConversation;
  const [isDragOver, setIsDragOver] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCustomizeSuggestions, setShowCustomizeSuggestions] = useState(false);

  // Repositioned: scroll effects after dependent vars are declared
  useEffect(() => {
    if (isChatActive) {
      chatCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isChatActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (seeAllOpen) setTimeout(() => tplSearchRef.current?.focus(), 60);
  }, [seeAllOpen]);
  useEffect(() => {
    if (pastOpen) setTimeout(() => pastSearchRef.current?.focus(), 60);
  }, [pastOpen]);
  useEffect(() => {
    const el = tplScrollRef.current;
    if (!el) return;
    const onScroll = () => setTplScrolled(el.scrollTop > 0);
    onScroll();
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [seeAllOpen]);
  useEffect(() => {
    const el = pastScrollRef.current;
    if (!el) return;
    const onScroll = () => setPastScrolled(el.scrollTop > 0);
    onScroll();
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [pastOpen]);

  const clearTplFilters = () => {
    setTplSearch("");
    setTplCategory("");
    setTplMethod("");
  };
  const clearPastFilters = () => {
    setPastSearch("");
    setPastCategory("");
    setPastMethod("");
  };

  const tplFiltered = React.useMemo(() => {
    const all = listAllTemplates();
    const filtered = all.filter((tpl) => {
      const catOk = !tplCategory || tpl.category === tplCategory;
      const q = tplSearch.trim().toLowerCase();
      const kwOk = !q || tpl.title.toLowerCase().includes(q) || tpl.description.toLowerCase().includes(q);
      return catOk && kwOk;
    });
    return filtered;
  }, [tplSearch, tplCategory, tplMethod]);

  // Paginate template results (12 per page)
  const tplPageSize = 6;
  const tplTotalPages = Math.max(1, Math.ceil(tplFiltered.length / tplPageSize));
  useEffect(() => {
    setTplPage((p) => Math.min(Math.max(1, p), tplTotalPages));
  }, [tplTotalPages]);

  // Mock past surveys list; in real app, fetch user surveys
  const pastSurveys: { id: string; title: string; audience: string; updatedAt: string; description: string; mode?: 'screening' | 'main' }[] = [
    { id: 'sv-001', title: '2024年Q4 顧客満足度調査', audience: '既存顧客', updatedAt: '2024-12-18', description: '満足度／改善点の定点観測', mode: 'main' },
    { id: 'sv-002', title: 'ブランド認知度調査（秋）', audience: '一般消費者', updatedAt: '2024-10-02', description: '認知経路と想起の把握', mode: 'screening' },
    { id: 'sv-003', title: 'サービス体験評価（サポート）', audience: 'ユーザー', updatedAt: '2024-08-15', description: 'サポート品質の評価', mode: 'main' },
    { id: 'sv-004', title: 'NPS調査（年次）', audience: '会員', updatedAt: '2024-05-30', description: '推奨度と理由', mode: 'main' },
  ];

  // fixed descriptions for past surveys (no randomization)

  const pastFiltered = React.useMemo(() => {
    const q = pastSearch.trim().toLowerCase();
    const filtered = pastSurveys.filter((s) => {
      const kwOk = !q || s.title.toLowerCase().includes(q) || (s.description?.toLowerCase().includes(q));
      const catOk = !pastCategory || s.title.toLowerCase().includes(pastCategory.toLowerCase()) || (s.description?.toLowerCase().includes(pastCategory.toLowerCase()) ?? false);
      const methodOk = !pastMethod || (s.mode && s.mode === pastMethod);
      return kwOk && catOk && methodOk;
    });
    if (pastSort === '新着') {
      filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return filtered;
  }, [pastSearch, pastCategory, pastMethod, pastSort, pastSurveys]);

  const handleSelectPastSurvey = (item: { id: string; title: string; audience: string; description: string; mode?: 'screening' | 'main' }) => {
    setPastOpen(false);
    // Map to preview shape with lightweight questions
    const questions: PreviewQuestion[] = [
      { text: `${item.title}の総合評価を教えてください`, type: 'scale', scale: { min: 1, max: 5, labels: ['非常に不満', '不満', '普通', '満足', '非常に満足'] } },
      { text: `重視する点を教えてください（複数選択可）`, type: 'multiple', options: ['品質', '価格', '使いやすさ', 'サポート', 'その他'] },
      { text: `改善してほしい点があれば教えてください`, type: 'text' },
    ];
    setPreviewData({
      title: item.title,
      description: item.description,
      category: '過去のアンケート',
      questionCount: questions.length,
      audience: item.audience,
      questions,
      purpose: item.description,
      mode: item.mode,
      categoryCounts: undefined,
    });
    setPreviewOpen(true);
  };

  const handleSendMessage = () => {
    if (isSending) return;
    if (!inputMessage.trim() && attachedFiles.length === 0) return;
    // TODO: integrate with backend chat API; include SURVEY_ASSISTANT_SYSTEM_PROMPT as system message
    // Example payload shape (to be wired with actual API):
    // { system: SURVEY_ASSISTANT_SYSTEM_PROMPT, user: inputMessage, files: attachedFiles }
    setIsSending(true);
    // Simulate request for animation feedback
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: inputMessage.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setAttachedFiles([]);
    setIsTyping(true);

    const deriveIntentFromInput = (text: string) => {
      const intent: Partial<ChatCollected> = {};

      // 1) Structured key-value parsing (Japanese labels)
      // Accept lines like: テーマ: XXX / 手法: 本調査|事前調査 / 設問数: 5問 / 対象者: 既存顧客|従業員|一般対象者 / 目的: YYY
      try {
        const kvPairs: Record<string, string> = {};
        for (const rawLine of text.split(/\n+/)) {
          const line = rawLine.trim();
          if (!line) continue;
          const m = line.match(/^([^:：\s]+)\s*[:：]\s*(.+)$/);
          if (m) {
            const key = m[1]?.trim();
            const value = m[2]?.trim();
            if (key && value) kvPairs[key] = value;
          }
        }
        // Map to intent
        if (kvPairs['テーマ'] || kvPairs['タイトル']) {
          intent.theme = (kvPairs['テーマ'] ?? kvPairs['タイトル']) as string;
        }
        if (kvPairs['手法']) {
          const v = kvPairs['手法'];
          if (/本調査|main/i.test(v)) intent.mode = 'main';
          else if (/事前調査|screening|対象.*絞/i.test(v)) intent.mode = 'screening';
        }
        if (kvPairs['設問数']) {
          const n = kvPairs['設問数'].match(/(\d+)/);
          if (n) intent.count = Math.max(1, Math.min(20, parseInt(n[1]!, 10)));
        }
        if (kvPairs['対象者']) {
          const v = kvPairs['対象者'];
          if (/従業員|社員|ES/.test(v)) intent.audience = '従業員';
          else if (/顧客|ユーザー|会員|CS/.test(v)) intent.audience = '既存顧客';
          else if (/一般|消費者/.test(v)) intent.audience = '一般対象者';
        }
        if (kvPairs['目的']) {
          intent.needs = kvPairs['目的'];
        }
      } catch {}

      // 2) Heuristics (fallbacks)
      if (!intent.theme) {
        if (/ES|従業員満足/.test(text)) intent.theme = '従業員満足度（ES）調査';
        else if (/CS|顧客満足/.test(text)) intent.theme = '顧客満足度（CS）調査';
        else if (/NPS/i.test(text)) intent.theme = 'NPS調査';
        else if (/ブランド認知|認知度/.test(text)) intent.theme = 'ブランド認知度調査';
      }
      if (!intent.mode) {
        if (/screening|対象をしぼる|事前調査/.test(text)) intent.mode = 'screening';
        else if (/main|じっくり|本調査/.test(text)) intent.mode = 'main';
      }
      if (!intent.count) {
        const m = text.match(/(\d+)\s*問/);
        if (m) intent.count = Math.max(1, Math.min(20, parseInt(m[1]!, 10)));
      }
      if (!intent.audience) {
        if (/従業員|社員|ES/.test(text)) intent.audience = '従業員';
        else if (/顧客|ユーザー|会員/.test(text)) intent.audience = '既存顧客';
        else if (/一般|消費者/.test(text)) intent.audience = '一般対象者';
      }
      if (!intent.needs) {
        const needMatch = text.match(/(.{0,12})(したい|知りたい)/);
        if (needMatch) intent.needs = needMatch[0].replace(/(したい|知りたい)/, '').trim() || undefined;
      }
      // Do not default here; ask later or use safe defaults when generating
      return intent;
    };

    const intent = deriveIntentFromInput(userMsg.content);
    const merged: ChatCollected = {
      mode: intent.mode ?? collected.mode,
      count: intent.count ?? collected.count,
      theme: intent.theme ?? collected.theme,
      audience: intent.audience ?? collected.audience,
      needs: intent.needs ?? collected.needs,
    };
    setCollected(merged);

    const effectiveMode: 'screening' | 'main' | '未設定' = (merged.mode as any) ?? '未設定';
    const effectiveCount = merged.count ?? (merged.mode === 'screening' ? 3 : 5);
    const summary = `テーマ: ${merged.theme ?? '未設定'} / モード: ${effectiveMode} / 設問数: ${effectiveCount} / 対象者: ${merged.audience ?? '未設定'}`;
    const nextAsk = (() => {
      if (!merged.theme) return 'テーマを1文で教えてください。（例：従業員満足度調査／ブランド認知度調査）';
      // After theme, explicitly confirm method if not set by user input (this is the final step)
      if (!merged.mode) return 'アンケート手法はどちらですか？「じっくり聞くアンケート（本調査）」または「対象を絞るアンケート（事前調査）」からお選びください。';
      // When mode is decided, proceed to proposal modal
      return null;
    })();

    const generateSurvey = (c: ChatCollected) => {
      const title = c.theme ?? 'アンケート調査';
      const type: 'screening' | 'main' = c.mode ?? 'main';
      const total = c.count ?? (type === 'screening' ? 3 : 5);
      const baseQuestions: { text: string; type: 'single_choice' | 'multiple_choice' | 'scale' | 'text'; options?: string[] }[] = [];
      // Seed by mode
      if (type === 'screening') {
        baseQuestions.push(
          { text: '本テーマに関する対象条件に当てはまりますか？', type: 'single_choice', options: ['当てはまる', '当てはまらない', 'わからない'] },
          { text: 'あなたの属性について教えてください（年代）', type: 'single_choice', options: ['18-24歳', '25-34歳', '35-44歳', '45-54歳', '55歳以上'] },
          { text: '本テーマに関連する経験はありますか？', type: 'single_choice', options: ['現在経験中', '過去に経験あり', '未経験'] },
        );
      } else {
        baseQuestions.push(
          { text: `${title}に関する現在の利用状況を教えてください。`, type: 'single_choice', options: ['現在利用中', '過去に利用', '未利用'] },
          { text: `${title}に対する総合満足度を教えてください。`, type: 'scale', options: ['非常に不満', '不満', '普通', '満足', '非常に満足'] },
          { text: `${title}に関して重要視する点を教えてください。（複数選択可）`, type: 'multiple_choice', options: ['品質', '価格', '利便性', 'サポート', 'ブランド', 'その他（自由記述）'] },
          { text: `${title}の改善してほしい点があれば、具体的に教えてください。`, type: 'text' },
        );
      }
      // Expand to desired count by cycling patterns
      const patterns = [
        { text: `${title}の認知経路を教えてください。`, type: 'multiple_choice', options: ['SNS', '検索', '口コミ', '広告', '店頭', 'その他（自由記述）'] },
        { text: `${title}の再利用意向を教えてください。`, type: 'single_choice', options: ['必ず利用する', 'おそらく利用する', 'わからない', 'あまり利用しない', '利用しない'] },
        { text: `${title}の推奨度を5段階で評価してください。`, type: 'scale', options: ['全く勧めない', 'あまり勧めない', 'どちらでもない', '勧める', '強く勧める'] },
      ] as const;
      while (baseQuestions.length < total) {
        baseQuestions.push(patterns[(baseQuestions.length - 1) % patterns.length] as any);
      }
      const questions = baseQuestions.slice(0, total).map((q, idx) => ({ id: `Q${idx + 1}`, text: q.text, type: q.type, options: q.type === 'text' ? undefined : q.options }));
      return { title, type, questions };
    };

    setTimeout(() => {
      setIsSending(false);
      setJustSent(true);
      if (nextAsk) {
        const assistantText = `承知しました。${summary}\n${nextAsk}`;
        const aiMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', content: assistantText };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const survey = generateSurvey(merged);
        const assistantText = `要件が揃いました。\nタイトル: ${survey.title}\nモード: ${survey.type}\n設問数: ${survey.questions.length}\nこの内容で設問をプレビューします。`;
        const aiMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', content: assistantText };
        setMessages(prev => [...prev, aiMsg]);
        // Map to TemplatePreviewModal format
        const buildRationaleFor = (text: string, type: string): string => {
          const t = text || '';
          const is = (re: RegExp) => re.test(t);
          if (is(/満足|満足度/)) return 'KPIの把握が必要なので、5件法でTop2Box/平均を確認する設問を作成';
          if (is(/推奨|薦め|NPS/)) return '口コミ意向を見たいので、推奨度を段階評価で測る設問を作成';
          if (is(/購入意向|購入|利用意向/)) return '需要の強さを判断したいので、意向の段階評価設問を作成';
          if (is(/魅力|魅力度/)) return '第一印象の強さを把握したいので、魅力度の段階評価設問を作成';
          if (is(/独自性|差別化/)) return '差別化の認識を確認したいので、独自性の段階評価設問を作成';
          if (is(/認知|知って/)) return '到達状況を把握したいので、認知有無の単一選択設問を作成';
          if (is(/利用状況|頻度/)) return 'セグメント分けのため、現状把握（利用状況/頻度）の単一選択設問を作成';
          if (is(/価格|PSM|高い|安い/)) return '価格印象を確認したいので、価格に関する段階評価/選択設問を作成';
          if (is(/改善|理由|自由記述|ご自由に/)) return '具体策を集めたいので、自由記述で理由/改善案を収集する設問を作成';
          if (is(/年齢|性別|職業|年収/)) return '分析軸の把握が必要なので、基本属性の単一選択設問を作成';
          switch (type) {
            case 'single':
            case 'single_choice':
              return '判断の明確化が必要なので、単一選択の設問を作成';
            case 'multiple':
            case 'multiple_choice':
              return '重視点を網羅把握したいので、複数選択の設問を作成';
            case 'scale':
              return '強さの度合いを把握したいので、段階評価の設問を作成';
            case 'text':
            default:
              return '具体的な声を集めたいので、自由記述の設問を作成';
          }
        };
        const previewQuestions = survey.questions.map((q) => {
          const base: any = { text: q.text };
          const rationale = buildRationaleFor(q.text, q.type);
          if (q.type === 'single_choice') return { ...base, type: 'single', options: q.options, rationale };
          if (q.type === 'multiple_choice') return { ...base, type: 'multiple', options: q.options, rationale };
          if (q.type === 'scale') return { ...base, type: 'scale', scale: { min: 1, max: (q.options?.length ?? 5), labels: q.options ?? ['非常に不満','不満','普通','満足','非常に満足'] }, rationale };
          return { ...base, type: 'text', rationale };
        });
        // Assign dummy categories cyclically
        const catPool = ['基本事実', '態度・意識', '改善要望', '認知経路'];
        previewQuestions.forEach((pq: any, idx: number) => {
          pq.category = catPool[idx % catPool.length];
        });
        setPreviewData({
          title: survey.title,
          description: merged.needs ?? '',
          category: 'チャット提案',
          questionCount: previewQuestions.length,
          audience: merged.audience ?? '未設定',
          questions: previewQuestions,
          purpose: merged.needs ?? '',
          mode: merged.mode,
          categoryCounts: undefined,
        });
        setPreviewOpen(true);
      }
      setIsTyping(false);
      setTimeout(() => setJustSent(false), 900);
    }, 800);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) setAttachedFiles(prev => [...prev, ...files]);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-resize textarea to fit content (capped by CSS max-height)
  const autoResizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    autoResizeTextarea(inputRef.current);
  }, [inputMessage]);

  // Insert prompt into input without sending, focus input, and close modal if open
  const insertPromptToInput = (text: string) => {
    setSeeAllOpen(false);
    setShowWelcome(false);
    setInputMessage(text);
    setInputFocused(true);
    setTimeout(() => {
      chatCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      inputRef.current?.focus();
      autoResizeTextarea(inputRef.current);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Avoid submitting while composing (IME)
    // @ts-ignore
    const composing = e.nativeEvent?.isComposing;
    if (composing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConfirmProceed = () => {
    try {
      const draft = {
        title: referenceSurvey?.title ?? 'アンケート調査',
        type: previewData?.mode ?? 'main',
        audience: previewData?.audience ?? undefined,
        questions: (previewData?.questions ?? []).map((q, idx) => ({ id: `Q${idx + 1}`, text: typeof q === 'string' ? q : q.text })),
      };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('assistant_draft', JSON.stringify(draft));
        router.push('/assistant/confirm');
      }
    } catch {
      // fallback: open new creation directly
      const params = new URLSearchParams();
      if (referenceSurvey) {
        params.set('referenceSurveyId', referenceSurvey.id);
        params.set('referenceSurveyTitle', referenceSurvey.title);
      }
      const url = params.toString() ? `/surveys/new?${params.toString()}` : '/surveys/new';
      router.push(url);
    }
  };

  const guideToChatFromTemplate = (tpl: Partial<TemplatePreview> & { title: string; description?: string; audience?: string; purpose?: string; category?: string; questionCount?: number; mode?: 'screening' | 'main' }) => {
    const prefill = `このテンプレートをベースに作成したいです。\nタイトル: ${tpl.title}\n対象: ${tpl.audience}${tpl.purpose ? `\n目的: ${tpl.purpose}` : ''}`;
    // Close modal and jump to chat
    setPreviewOpen(false);
    setInputFocused(true);
    setShowWelcome(false);
    setTimeout(() => {
      chatCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      inputRef.current?.focus();
    }, 0);
    // Send user message immediately
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: prefill };
    setMessages((prev) => [...prev, userMsg]);
    // Show assistant prompt with suggestions
    const aiMsg: ChatMessage = { id: `a-${Date.now() + 1}`, role: 'assistant', content: 'どのようなカスタマイズをしますか？\n例：設問数の増減、選択肢の追加・修正、質問タイプの変更、文言のトーン調整、対象者の変更 など' };
    setMessages((prev) => [...prev, aiMsg]);
    setShowCustomizeSuggestions(true);
  };

  const handleSelectTemplate = (item: { id: string; title: string; description: string; category?: string }) => {
    setSeeAllOpen(false);
              const getQuestions = (templateId: string): PreviewQuestion[] => {
                switch (templateId) {
                  case 'product-awareness':
                    return [
                      { text: '以下の商品をご存知ですか？', type: 'single', options: ['知っている', '聞いたことがある', '知らない'], },
                      { text: 'どちらでこの商品を知りましたか？（複数選択可）', type: 'multiple', options: ['テレビCM', 'インターネット広告', '店頭', '友人・知人', 'SNS', 'その他'], },
                      { text: 'この商品に対する興味度を教えてください', type: 'scale', scale: { min: 1, max: 5, labels: ['全く興味がない', '興味がない', 'どちらでもない', '興味がある', 'とても興味がある'] }, },
                      { text: 'あなたの年齢を教えてください', type: 'single', options: ['18-29歳', '30-39歳', '40-49歳', '50-59歳', '60歳以上'], },
                    ];
                  case 'customer-satisfaction':
                    return [
                      { text: '当サービスの総合満足度を教えてください', type: 'scale', scale: { min: 1, max: 5, labels: ['非常に不満', '不満', '普通', '満足', '非常に満足'] }, },
                      { text: '商品の品質についてはいかがですか？', type: 'scale', scale: { min: 1, max: 5, labels: ['非常に悪い', '悪い', '普通', '良い', '非常に良い'] }, },
                      { text: 'カスタマーサポートの対応はいかがでしたか？', type: 'scale', scale: { min: 1, max: 5, labels: ['非常に悪い', '悪い', '普通', '良い', '非常に良い'] }, },
                      { text: '改善してほしい点があれば、具体的にお聞かせください', type: 'text' },
                      { text: '今後も継続してご利用いただけますか？', type: 'single', options: ['必ず利用する', 'おそらく利用する', 'わからない', 'おそらく利用しない', '利用しない'], },
                      { text: 'あなたの性別を教えてください', type: 'single', options: ['男性', '女性', 'その他', '回答しない'], },
                    ];
                  case 'purchase-behavior':
                    return [
                      { text: '最も頻繁に購入する場所はどちらですか？', type: 'single', options: ['実店舗（スーパー）', '実店舗（専門店）', 'オンラインショップ', 'コンビニ', 'その他'], },
                      { text: '購入頻度を教えてください', type: 'single', options: ['週1回以上', '月2-3回', '月1回', '2-3ヶ月に1回', '半年に1回以下'], },
                      { text: '購入時に重視する点は何ですか？（複数選択可）', type: 'multiple', options: ['価格', '品質', 'ブランド', '利便性', 'デザイン', '口コミ・評判'], },
                      { text: '現在の価格についてどう思いますか？', type: 'scale', scale: { min: 1, max: 5, labels: ['高すぎる', 'やや高い', '適正', 'やや安い', '安すぎる'] }, },
                      { text: 'あなたの年収を教えてください', type: 'single', options: ['300万円未満', '300-500万円', '500-700万円', '700-1000万円', '1000万円以上'], },
                    ];
                  case 'concept-evaluation':
                    return [
                      { text: 'このコンセプトの魅力度を教えてください', type: 'scale', scale: { min: 1, max: 7, labels: ['全く魅力的でない', '', '', 'どちらでもない', '', '', '非常に魅力的'] }, },
                      { text: '購入意向はいかがですか？', type: 'scale', scale: { min: 1, max: 5, labels: ['絶対に購入しない', '購入しない', 'どちらでもない', '購入する', '絶対に購入する'] }, },
                      { text: 'このコンセプトの独自性をどう評価しますか？', type: 'scale', scale: { min: 1, max: 5, labels: ['全く独自性がない', '独自性がない', 'どちらでもない', '独自性がある', '非常に独自性がある'] }, },
                      { text: 'このコンセプトで気になる点や改善提案があれば教えてください', type: 'text' },
                      { text: 'あなたの職業を教えてください', type: 'single', options: ['会社員', '公務員', '自営業', '学生', '主婦・主夫', 'その他'], },
                    ];
                  default:
                    return [
                      { text: 'サンプル質問：あなたの年齢を教えてください', type: 'single', options: ['18-29歳', '30-39歳', '40-49歳', '50-59歳', '60歳以上'], },
                      { text: 'サンプル質問：満足度を5段階で評価してください', type: 'scale', scale: { min: 1, max: 5, labels: ['非常に不満', '不満', '普通', '満足', '非常に満足'] }, },
                    ];
                }
              };
              const getAudience = (templateId: string) => {
                switch (templateId) {
                  case 'product-awareness':
                    return '一般消費者（18-65歳）';
                  case 'customer-satisfaction':
                    return '既存顧客・サービス利用者';
                  case 'purchase-behavior':
                    return '商品購入経験者';
                  case 'concept-evaluation':
                    return 'ターゲット顧客層';
                  default:
                    return '一般対象者';
                }
              };
              const buildCategoryCounts = (templateId: string) => {
                const q = getQuestions(templateId);
                const mapping: { label: string; match: (t: string) => boolean }[] = [
                  { label: '基本情報', match: (t) => ['年齢', '性別', '職業'].some(k => t.includes(k)) },
                  { label: '認知経路', match: (t) => ['どちらでこの商品を知りましたか', 'どこで知'].some(k => t.includes(k)) },
                  { label: '興味度', match: (t) => t.includes('興味度') },
                  { label: '総合評価', match: (t) => t.includes('総合満足度') },
                ];
                const counts: Record<string, number> = {};
                for (const qu of q) {
                  const text = qu.text;
                  const found = mapping.find(m => m.match(text));
                  const label = found ? found.label : 'その他';
                  counts[label] = (counts[label] ?? 0) + 1;
                }
                return Object.entries(counts).map(([label, count]) => ({ label, count }));
              };
              const questions = getQuestions(item.id);
              const buildTplRationale = (text: string, type: string) => buildRationaleFor(text, type);
              const questionsWithRationale = questions.map((q) => ({ ...q, rationale: buildTplRationale(q.text, q.type as string) }));
              setPreviewData({
                title: item.title,
                description: item.description,
                category: item.category ?? 'テンプレート',
                questionCount: questionsWithRationale.length,
                audience: getAudience(item.id),
                questions: questionsWithRationale,
                purpose: item.description,
                categoryCounts: buildCategoryCounts(item.id),
                mode: tplMethod || undefined,
              });
              setPreviewOpen(true);
  };


  const spotlightTemplates: { id: string; title: string; description: string; category?: string; prompt?: string }[] = [
    { id: 'concept-evaluation', title: '新商品コンセプト評価', description: '新商品の魅力・購入意向・独自性をコンパクトに確認します', category: '新商品・サービス調査', prompt: '新商品コンセプトの魅力度・購入意向・独自性を評価する設問を5問程度で提案して。対象は一般消費者。最後に自由記述も入れて。\n\nテーマ: 新商品コンセプト評価\n手法: 本調査\n設問数: 5問\n対象者: 一般対象者\n目的: 改善ポイントを知りたい' },
    { id: 'employee-satisfaction', title: '従業員満足度（ES調査）', description: '制度・職場環境・エンゲージメントを短時間で把握します', category: '満足度・評価調査', prompt: '従業員満足度（ES）を測る本調査の設問（5問目安）を提案して。制度・職場環境・エンゲージメントを含めて。\n\nテーマ: 従業員満足度（ES）調査\n手法: 本調査\n設問数: 5問\n対象者: 従業員\n目的: 改善点を知りたい' },
  ];

  const sendSuggestion = (text: string) => {
    setInputMessage(text);
    setShowCustomizeSuggestions(false);
    setTimeout(() => {
      handleSendMessage();
      // Guide to modal preview as the final step of the flow
      if (previewData) {
        const aiFollowUp: ChatMessage = { id: `a-${Date.now() + 2}`, role: 'assistant', content: '内容を反映しました。プレビューを開きます。' };
        setMessages((prev) => [...prev, aiFollowUp]);
        setTimeout(() => setPreviewOpen(true), 400);
      }
    }, 0);
  };

  // Build a prompt string from a template entry for the modal (fallback for items without explicit prompt)
  function getPromptForTemplateEntry(tpl: { id: string; title: string; description?: string; category?: string }): string {
    const desc = (tpl.description ?? '').trim();
    const purpose = desc || `${tpl.title}に関する調査`;
    return `${tpl.title}の調査に必要な設問を5問程度で提案してください。\n\nテーマ: ${tpl.title}\n手法: 本調査\n設問数: 5問\n対象者: 一般対象者\n目的: ${purpose}`;
  }

  // Parse structured meta from a prompt block
  function parsePromptMeta(prompt?: string): { purpose?: string; method?: string; count?: number } {
    if (!prompt) return {};
    const get = (label: string) => {
      const m = prompt.match(new RegExp(`${label}\\s*[:：]\\s*(.+)`));
      return m ? m[1].trim() : undefined;
    };
    const purpose = get('目的');
    const methodRaw = get('手法');
    const method = methodRaw && /事前調査|screening/i.test(methodRaw) ? '事前調査' : (methodRaw ? '本調査' : undefined);
    const countRaw = get('設問数');
    const cm = countRaw?.match(/(\d+)/);
    const count = cm ? Math.max(1, Math.min(20, parseInt(cm[1]!, 10))) : undefined;
    return { purpose, method, count };
  }

  // Provide lightweight question structure tags by template id
  function getQuestionStructure(templateId: string): string[] {
    switch (templateId) {
      case 'concept-evaluation':
        return ['コンセプトの魅力度', '購入意向', '独自性の評価', '改善要望（自由記述）'];
      case 'employee-satisfaction':
        return ['利用状況／体験', '全体満足度', '各要素満足度（制度・環境）', 'エンゲージメント', '改善要望'];
      case 'price-sensitivity':
        return ['利用状況', '価格認知・印象', 'PSM（4設問）', '関連確認'];
      case 'brand-image-evaluation':
        return ['全体印象', 'ブランドイメージ（信頼性・先進性・親しみやすさ）', '比較・強弱把握'];
      default:
        return ['利用状況', '全体満足度', '要素別評価', '改善要望'];
    }
  }

  // Friendly meta text by template id
  function getTemplateFriendlyMeta(templateId: string, fallbackDesc?: string): { purpose: string; method: string; structure: string[] } {
    switch (templateId) {
      case 'customer-satisfaction':
        return {
          purpose: '顧客の満足度や改善点を把握するための調査です。',
          method: '本調査',
          structure: ['利用状況', '満足度', '改善要望'],
        };
      case 'concept-evaluation':
        return {
          purpose: '新商品コンセプトの受容性や改善余地を把握するための調査です。',
          method: '本調査',
          structure: getQuestionStructure(templateId),
        };
      case 'employee-satisfaction':
        return {
          purpose: '従業員の満足度や組織の改善点を把握するための調査です。',
          method: '本調査',
          structure: getQuestionStructure(templateId),
        };
      case 'price-sensitivity':
        return {
          purpose: '許容価格帯や価格印象を把握するための調査です。',
          method: '本調査',
          structure: getQuestionStructure(templateId),
        };
      case 'brand-image-evaluation':
        return {
          purpose: 'ブランドの印象や強み・弱みを整理するための調査です。',
          method: '本調査',
          structure: getQuestionStructure(templateId),
        };
      default:
        return {
          purpose: fallbackDesc ? `${fallbackDesc}ための調査です。` : '対象テーマに関する実態や改善点を把握するための調査です。',
          method: '本調査',
          structure: getQuestionStructure(templateId),
        };
    }
  }

  function getDefaultAudience(templateId: string): string {
    switch (templateId) {
      case 'customer-satisfaction':
        return '既存顧客';
      case 'employee-satisfaction':
        return '全従業員';
      case 'product-usage':
        return '商品利用経験者';
      case 'brand-image-evaluation':
        return '一般消費者';
      case 'event-satisfaction':
        return 'イベント参加者';
      case 'concept-evaluation':
        return '一般消費者';
      case 'app-usage':
        return 'アプリ利用者';
      case 'ad-effectiveness':
        return '広告接触者';
      case 'nps-survey':
        return '顧客';
      case 'churn-analysis':
        return '解約者';
      default:
        return '一般対象者';
    }
  }

  function getOverrides(templateId: string): { count: number; methodLabel: string; audience: string } {
    const audience = getDefaultAudience(templateId);
    switch (templateId) {
      case 'customer-satisfaction':
        return { count: 5, methodLabel: '本調査', audience };
      case 'employee-satisfaction':
        return { count: 5, methodLabel: '本調査', audience };
      case 'product-usage':
        return { count: 5, methodLabel: '本調査', audience };
      case 'brand-image-evaluation':
        return { count: 5, methodLabel: '本調査', audience };
      case 'event-satisfaction':
        return { count: 5, methodLabel: '本調査', audience };
      case 'concept-evaluation':
        return { count: 7, methodLabel: '本調査', audience };
      case 'app-usage':
        return { count: 6, methodLabel: '本調査', audience };
      case 'ad-effectiveness':
        return { count: 5, methodLabel: '本調査', audience };
      case 'nps-survey':
        return { count: 3, methodLabel: '本調査', audience };
      case 'churn-analysis':
        return { count: 5, methodLabel: '事前抽出', audience };
      default:
        return { count: 5, methodLabel: '本調査', audience };
    }
  }

  function buildStructuredPrompt(args: { id: string; title: string; purpose: string; count: number; methodLabel: string; audience: string }): string {
    const { title, purpose, count, methodLabel, audience } = args;
    return `テーマ: ${title}\n設問数: ${count}問\n調査タイプ: ${methodLabel}\n対象者: ${audience}\n目的: ${purpose}`;
  }

  // Display-only example without duplicates (omit 調査タイプ and 目的 which are already shown above)
  function buildDisplayExample(args: { title: string; purpose: string; count: number; audience: string; methodLabel: string }): string {
    const { title } = args;
    return `テーマ: ${title}`;
  }

  // Build a more specific rationale string for tooltips based on question text/type
  function buildRationaleFor(text: string, type: string): string {
    const t = text || '';
    const is = (re: RegExp) => re.test(t);
    if (is(/満足|満足度/)) return 'KPIの把握が必要なので、5件法でTop2Box/平均を確認する設問を作成';
    if (is(/推奨|薦め|NPS/)) return '口コミ意向を見たいので、推奨度を段階評価で測る設問を作成';
    if (is(/購入意向|購入|利用意向/)) return '需要の強さを判断したいので、意向の段階評価設問を作成';
    if (is(/魅力|魅力度/)) return '第一印象の強さを把握したいので、魅力度の段階評価設問を作成';
    if (is(/独自性|差別化/)) return '差別化の認識を確認したいので、独自性の段階評価設問を作成';
    if (is(/認知|知って/)) return '到達状況を把握したいので、認知有無の単一選択設問を作成';
    if (is(/利用状況|頻度/)) return 'セグメント分けのため、現状把握（利用状況/頻度）の単一選択設問を作成';
    if (is(/価格|PSM|高い|安い/)) return '価格印象を確認したいので、価格に関する段階評価/選択設問を作成';
    if (is(/改善|理由|自由記述|ご自由に/)) return '具体策を集めたいので、自由記述で理由/改善案を収集する設問を作成';
    if (is(/年齢|性別|職業|年収/)) return '分析軸の把握が必要なので、基本属性の単一選択設問を作成';
    switch (type) {
      case 'single':
      case 'single_choice':
        return '判断の明確化が必要なので、単一選択の設問を作成';
      case 'multiple':
      case 'multiple_choice':
        return '重視点を網羅把握したいので、複数選択の設問を作成';
      case 'scale':
        return '強さの度合いを把握したいので、段階評価の設問を作成';
      case 'text':
      default:
        return '具体的な声を集めたいので、自由記述の設問を作成';
    }
  }

  // Numbered flow with short hints for 質問構成
  function getQuestionFlowWithHints(templateId: string): { label: string; hint: string }[] {
    switch (templateId) {
      case 'customer-satisfaction':
        return [
          { label: '利用状況', hint: '現在/過去/未利用など' },
          { label: '満足度', hint: '総合満足の5段階評価' },
          { label: '改善要望', hint: '自由記述で改善点' },
        ];
      case 'employee-satisfaction':
        return [
          { label: '体験/環境', hint: '制度・職場環境の捉え方' },
          { label: '全体満足', hint: '職場への満足度' },
          { label: 'エンゲージメント', hint: '定着/推奨意向など' },
          { label: '改善要望', hint: '自由記述で提案' },
        ];
      case 'product-usage':
        return [
          { label: '利用頻度', hint: 'どのくらい使うか' },
          { label: '利用理由', hint: '重視点/選定理由' },
          { label: 'シーン', hint: '利用場面や文脈' },
        ];
      case 'brand-image-evaluation':
        return [
          { label: '全体印象', hint: '第一想起/親近感' },
          { label: 'イメージ', hint: '信頼性・先進性など' },
          { label: '強み/弱み', hint: '改善余地の把握' },
        ];
      case 'event-satisfaction':
        return [
          { label: '参加状況', hint: '参加回数/動機' },
          { label: '満足度', hint: '内容/運営の評価' },
          { label: '改善要望', hint: '自由記述で改善点' },
        ];
      case 'concept-evaluation':
        return [
          { label: '魅力度', hint: 'どれくらい魅力的か' },
          { label: '購入意向', hint: '購入可能性の評価' },
          { label: '独自性', hint: '差別化の認識' },
          { label: '改善要望', hint: '自由記述で懸念点' },
        ];
      case 'app-usage':
        return [
          { label: '利用頻度', hint: '週/日ベースの利用' },
          { label: '利便性', hint: '操作性/速度/分かりやすさ' },
          { label: '改善要望', hint: '機能/UXの改善点' },
        ];
      case 'ad-effectiveness':
        return [
          { label: '接触', hint: '広告を見聞きしたか' },
          { label: '認知/想起', hint: '内容/メッセージの想起' },
          { label: '印象/意向', hint: '好意度/行動意向' },
        ];
      case 'nps-survey':
        return [
          { label: '推奨度', hint: '0〜10点で評価' },
          { label: '理由', hint: '推奨/非推奨の理由' },
          { label: '改善', hint: '改善要望（任意）' },
        ];
      case 'churn-analysis':
        return [
          { label: '離脱理由', hint: 'やめた主因の特定' },
          { label: '他社利用', hint: '代替/乗り換え先' },
          { label: '改善', hint: '復帰の条件/改善点' },
        ];
      default:
        return getQuestionStructure(templateId).map((s) => ({ label: s, hint: '' }));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-10 px-6 pb-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Starter Tiles removed as requested */}

          <Card ref={chatCardRef} className={`relative p-0`}>
            {/* Chat Header */}
            <CardHeader className="px-6 pt-5 pb-3 border-b bg-muted rounded-t-lg">
              <p className="text-muted-foreground text-sm">調査項目をチャットで入力もしくは、プロンプトテンプレートから選択してください</p>
              {justSent && (
                <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1 text-xs shadow-sm">
                  <Check className="w-3.5 h-3.5" /> 送信しました
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {/* Messages Area */}
              <div className={`${(isChatVisible || showWelcome) ? 'py-4 h-[360px] max-h-[60vh]' : 'py-0 h-0 max-h-0'} px-6 overflow-y-auto space-y-3 transition-all duration-300`}>
                {showWelcome && (
                  <div className="flex justify-start">
                    <div className="bg-background text-foreground border rounded-2xl px-4 py-3 text-sm max-w-[70%] shadow-sm">
                      <p className="mb-2">👋 こんにちは！私はアンケート作成AIです。</p>
                      <p className="mb-3">知りたいことを入力していただければ、自動でアンケートを作ります。ざっくりでも、詳しく書いても大丈夫です。</p>

                      <p className="text-xs text-muted-foreground font-medium mb-1">📝 入力例（カンタンに始めたい方）</p>
                      <ul className="list-disc list-inside pl-0 space-y-1 mb-3">
                        <li>社員が仕事に満足しているか知りたい</li>
                        <li>新しい商品についてお客さんの印象を知りたい</li>
                      </ul>

                      <p className="text-xs text-muted-foreground font-medium mb-1">🔎 入力例（調査に慣れている方向け）</p>
                      <ul className="list-disc list-inside pl-0 space-y-1 mb-3">
                        <li>30代女性を対象に、新商品の購入意向を200サンプルで調査したい</li>
                        <li className="list-none">NPSとブランドイメージを併せて測りたい（業種は通信、利用歴あり）</li>
                      </ul>

                      <p className="text-xs text-muted-foreground font-medium mb-1">⚡ 流れ</p>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>知りたいことを入力</li>
                        <li>不足があればAIが推定 or 簡単に質問</li>
                        <li>完成したアンケートをプレビュー（必要なら詳細編集もできます）</li>
                      </ol>

                      <div className="mt-2 flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => { setShowWelcome(false); }}>閉じる</Button>
                      </div>
                    </div>
                  </div>
                )}
                {messages.filter(m => m.role !== 'system').map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`} aria-live={m.role === 'assistant' ? 'polite' : undefined}>
                    <div className={`${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'} rounded-2xl px-4 py-3 text-[15px] leading-6 break-words shadow-sm max-w-[68%] md:max-w-[60%]`}>
                      {m.content.split(/\n\s*\n/).map((para, idx) => (
                        <p key={idx} className="mb-2 last:mb-0 whitespace-pre-wrap">{para}</p>
                      ))}
                    </div>
                  </div>
                ))}
                {showCustomizeSuggestions && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-3 py-2 text-xs text-foreground border">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: '設問数を+2', text: '設問数を2問増やしてください。' },
                          { label: '選択肢を追加', text: '選択肢に「その他（自由記述）」を追加してください。' },
                          { label: '質問タイプ変更', text: '評価尺度の質問を単一選択に変更してください。' },
                          { label: '文言を丁寧に', text: '全体の文言を丁寧語に整えてください。' },
                          { label: '対象者を既存顧客', text: '対象者を既存顧客にしてください。' },
                        ].map((s) => (
                          <Button key={s.label} size="sm" variant="secondary" onClick={() => sendSuggestion(s.text)}>
                            {s.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {isTyping && (
                  <div className="flex justify-start gap-2 items-center">
                    <Skeleton className="h-10 w-40" />
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                className={`px-6 pb-5 pt-3 border-t ${isDragOver ? 'bg-accent/20' : ''} sticky bottom-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 pb-[env(safe-area-inset-bottom)]`}
                onDrop={handleDropFiles}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {attachedFiles.length > 0 && (
                  <div className="mb-2 space-y-2">
                    <p className="text-sm font-medium">添付ファイル</p>
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded border">
                        <span className="text-sm">{file.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-destructive hover:text-destructive">
                          削除
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                                <div className="relative">
                  <div className="relative rounded-md border border-input bg-background ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors">
                    <Textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onInput={(e) => autoResizeTextarea(e.currentTarget)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        setInputFocused(true);
                        setShowWelcome(true);
                      }}
                      onBlur={() => setInputFocused(false)}
                      placeholder="例：新サービスの満足度を3問で確認したい"
                      className="min-h-[48px] max-h-[40vh] resize-none overflow-auto leading-6 pr-16 border-0 bg-transparent"
                    />
                    <Button
                      className="absolute bottom-2 right-2 h-9 w-9 p-0 flex items-center justify-center"
                      onClick={handleSendMessage}
                      disabled={isSending || (!inputMessage.trim() && attachedFiles.length === 0)}
                      aria-label="送信"
                    >
                      {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Enterで送信 / Shift+Enterで改行</div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* よく使うテンプレート - grid 3 columns */}
          <div className="space-y-1 mt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-foreground">プロンプトテンプレート</h4>
              <Button variant="ghost" size="sm" onClick={() => setSeeAllOpen(true)}>すべて表示</Button>
            </div>
            <div className="mx-auto w-full max-w-[1200px] px-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5 justify-center justify-items-center place-content-center min-h-[260px]">
                {[
                  ...spotlightTemplates,
                  { id: 'price-sensitivity', title: '価格受容性調査', description: 'PSMで許容価格帯の目安をすばやく確認します', category: '新商品・サービス調査', prompt: 'PSM（価格感度測定）を用いて許容価格帯を把握するための設問（PSMの4設問＋関連設問）を提案して。\n\nテーマ: 価格受容性調査\n手法: 本調査\n設問数: 5問\n対象者: 一般対象者\n目的: 許容価格帯を知りたい' },
                  { id: 'brand-image-evaluation', title: 'ブランドイメージ評価', description: '信頼性・先進性・親しみやすさなどの印象を整理します', category: 'ブランド・イメージ調査', prompt: '信頼性・先進性・親しみやすさ等のブランドイメージ指標を評価する設問を提案して。\n\nテーマ: ブランドイメージ評価\n手法: 本調査\n設問数: 5問\n対象者: 一般対象者\n目的: 強み・弱みを知りたい' },
                ].slice(0,3).map((t: any) => {
                  const friendly = getTemplateFriendlyMeta(t.id, t.description);
                  const ov = getOverrides(t.id);
                  const exampleText = buildStructuredPrompt({ id: t.id, title: t.title, purpose: friendly.purpose, count: ov.count, methodLabel: ov.methodLabel, audience: ov.audience });
                  return (
                    <Card key={t.id} className="p-4 w-[360px] relative overflow-hidden hover:shadow-lg transition-shadow min-h-[320px] flex flex-col overflow-visible">
                      
                      <div className="relative z-10 flex flex-col h-full gap-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="text-[17px] font-semibold leading-6">{t.title}</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">{t.category ?? 'テンプレート'}</span>
                        </div>
                        <div className="text-[13px] text-foreground"><span className="text-foreground">目的：</span>{friendly.purpose}</div>
                        <div className="text-[13px] text-foreground mt-0.5">調査手法: {ov.methodLabel}</div>
                        <div className="text-[13px] text-foreground">設問数: {ov.count}問</div>
                        <div className="mt-1 text-[13px] text-foreground">
                          <span className="text-[12px] text-foreground tracking-wide">質問構成</span>
                          <ol className="mt-0.5 list-decimal pl-4 space-y-0.5">
                            {getQuestionFlowWithHints(t.id).map((item, i) => (
                              <li key={i}>
                                <span className="font-medium">{item.label}</span>
                                {item.hint ? <span className="text-muted-foreground">（{item.hint}）</span> : null}
                              </li>
                            ))}
                          </ol>
                        </div>
                        

                        <div className="mt-auto pt-3 flex flex-col sm:flex-row sm:justify-end gap-2">
                          <Button variant="outline" className="order-2 sm:order-1 w-full sm:w-auto" onClick={() => handleSelectTemplate(t)}>プレビュー</Button>
                          <Button className="order-1 sm:order-2 w-full sm:w-auto h-9" onClick={() => sendSuggestion(t.prompt ?? exampleText)}>このプロンプトを利用する</Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* See All Modal using TemplateLibrary */}
          <Dialog open={seeAllOpen} onOpenChange={setSeeAllOpen}>
            <DialogContent className="max-w-5xl w-[90vw] h-[80vh] overflow-hidden p-0">
              <DialogHeader className="sr-only">
                <DialogTitle>テンプレートをすべて表示</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col h-full">
                <div ref={tplScrollRef} className="flex-1 min-h-0 overflow-y-scroll pt-3">
                  {/* Filters placed inside scroll container for proper sticky behavior */}
                  <div className={`sticky top-0 bg-background z-20 px-3 py-1.5 min-h-[48px] border-b mb-[15px] ${tplScrolled ? 'shadow-sm' : ''}`}>
                    <div className="flex items-center gap-3 flex-nowrap overflow-x-auto pr-2">
                      <input
                        ref={tplSearchRef}
                        type="text"
                        placeholder="キーワード検索（例: 満足度, 認知, NPS）"
                        className="flex-1 min-w-[220px] max-w-[680px] w-full md:w-auto px-3 py-2 border rounded-md text-sm mb-[10px]"
                        value={tplSearch}
                        onChange={(e) => { setTplSearch(e.target.value); setTplPage(1); }}
                      />
                      <select className="px-3 py-2 border rounded-md text-sm flex-shrink-0" aria-label="カテゴリ" value={tplCategory} onChange={(e) => { setTplCategory(e.target.value); setTplPage(1); }}>
                        <option value="">カテゴリ: すべて</option>
                        <option value="認知・認識調査">認知・認識調査</option>
                        <option value="満足度・評価調査">満足度・評価調査</option>
                        <option value="利用実態・行動調査">利用実態・行動調査</option>
                        <option value="新商品・サービス調査">新商品・サービス調査</option>
                        <option value="ブランド・イメージ調査">ブランド・イメージ調査</option>
                      </select>
                      <select className="px-3 py-2 border rounded-md text-sm flex-shrink-0" aria-label="手法" value={tplMethod} onChange={(e) => { setTplMethod(e.target.value as any); setTplPage(1); }}>
                        <option value="">手法: すべて</option>
                        <option value="main">本調査</option>
                        <option value="screening">事前調査</option>
                      </select>
                      <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => { clearTplFilters(); setTplPage(1); }}>クリア</Button>
                      <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">{tplFiltered.length} 件</span>
                    </div>
                  </div>
                  <div className="px-3 pt-[40px] pb-2 h-full flex items-start justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-6 justify-center place-content-center mx-auto max-w-[980px]">
                      {(() => {
                        const filtered = tplFiltered;
                        const start = (tplPage - 1) * tplPageSize;
                        const shown = filtered.slice(start, start + tplPageSize);
                        return shown.map((tpl, idx) => {
                          const friendly = getTemplateFriendlyMeta(tpl.id, tpl.description);
                          const ov = getOverrides(tpl.id);
                          const prompt = buildStructuredPrompt({ id: tpl.id, title: tpl.title, purpose: friendly.purpose, count: ov.count, methodLabel: ov.methodLabel, audience: ov.audience });
                          return (
                            <Card key={`${tpl.id}-${idx}`} className="p-3 border rounded-lg flex flex-col">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="text-sm font-medium line-clamp-1">{tpl.title}</div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">{tpl.category ?? 'テンプレート'}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mb-1">{tpl.description}</div>
                              <div className="text-[13px] text-foreground"><span className="text-muted-foreground">目的：</span>{friendly.purpose}</div>
                              <div className="text-[13px] text-foreground mt-0.5">調査手法: {ov.methodLabel}</div>
                              <div className="mt-1 text-[13px] text-foreground">
                                <span className="text-[11px] text-foreground tracking-wide">質問構成</span>
                                <ol className="mt-0.5 list-decimal pl-4 space-y-0.5">
                                  {getQuestionFlowWithHints(tpl.id).map((item, i) => (
                                    <li key={i}>
                                      <span className="font-medium">{item.label}</span>
                                      {item.hint ? <span className="text-muted-foreground">（{item.hint}）</span> : null}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                              
                              <div className="mt-auto flex flex-col sm:flex-row gap-1 sm:gap-2 pt-2">
                                <Button size="sm" variant="outline" onClick={() => handleSelectTemplate({ id: tpl.id, title: tpl.title, description: tpl.description, category: tpl.category })}>プレビュー</Button>
                                <Button size="sm" onClick={() => insertPromptToInput(prompt)}>このプロンプトを利用する</Button>
                              </div>
                            </Card>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
                {/* Modal footer pagination (fixed) */}
                <div className="shrink-0 border-t bg-background p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={tplPage <= 1} onClick={() => setTplPage((p) => Math.max(1, p - 1))}>前へ</Button>
                    <span className="text-xs text-muted-foreground">{tplPage} / {tplTotalPages}</span>
                    <Button variant="outline" size="sm" disabled={tplPage >= tplTotalPages} onClick={() => setTplPage((p) => Math.min(tplTotalPages, p + 1))}>次へ</Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Past Surveys Modal (same modal style, different content) */}
          <Dialog open={pastOpen} onOpenChange={setPastOpen}>
            <DialogContent className="max-w-5xl w-[90vw] h-[70vh] overflow-hidden p-0">
              <DialogHeader className="px-3 py-1 space-y-0">
                <DialogTitle className="leading-tight text-base">過去のアンケートを選択</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col h-full">
                <div ref={pastScrollRef} className="flex-1 min-h-0 overflow-y-auto">
                  {/* Search/filters same as template modal, inside scroll */}
                  <div className={`sticky top-0 bg-background z-20 px-3 py-1 min-h-[40px] flex flex-wrap items-center gap-1 border-b ${pastScrolled ? 'shadow-sm' : ''}`}>
                    <input
                      ref={pastSearchRef}
                      type="text"
                      placeholder="キーワード検索（例: 満足度, 認知, NPS）"
                      className="flex-1 min-w-[200px] px-3 py-2 border rounded-md text-sm"
                      value={pastSearch}
                      onChange={(e) => setPastSearch(e.target.value)}
                    />
                    <select className="px-3 py-2 border rounded-md text-sm" value={pastCategory} onChange={(e) => setPastCategory(e.target.value)}>
                      <option value="">種別を選択</option>
                      <option value="認知・認識調査">認知・認識調査</option>
                      <option value="満足度・評価調査">満足度・評価調査</option>
                      <option value="利用実態・行動調査">利用実態・行動調査</option>
                      <option value="新商品・サービス調査">新商品・サービス調査</option>
                      <option value="ブランド・イメージ調査">ブランド・イメージ調査</option>
                    </select>
                    <select className="px-3 py-2 border rounded-md text-sm" value={pastMethod} onChange={(e) => setPastMethod(e.target.value as any)}>
                      <option value="">手法を選択</option>
                      <option value="main">本調査</option>
                      <option value="screening">事前調査</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{pastFiltered.length} 件</span>
                      <Button variant="ghost" size="sm" onClick={clearPastFilters}>すべてクリア</Button>
                      <select className="px-2 py-1 border rounded-md text-xs" value={pastSort} onChange={(e) => setPastSort(e.target.value as any)}>
                        <option value="おすすめ">おすすめ</option>
                        <option value="新着">新着</option>
                      </select>
                    </div>
                  </div>
                  <div className="mx-auto w-full max-w-[900px] relative px-3">
                    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 transition-[max-height] duration-300 overflow-hidden ${pastShowAll ? 'max-h-none' : 'max-h-[420px]'}`}>
                      {(() => {
                        const filtered = pastFiltered;
                        const shown = pastShowAll ? filtered : filtered.slice(0, 6);
                        return shown.map((s) => (
                          <Card key={s.id} className="p-3 rounded-lg flex flex-col hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-sm font-medium line-clamp-1">{s.title}</div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">{s.audience}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">最終更新: {s.updatedAt}</div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</div>
                            <div className="flex flex-col md:flex-row gap-1 md:gap-2 mt-auto pt-2">
                              <Button size="sm" variant="outline" onClick={() => handleSelectPastSurvey(s)}>プレビュー</Button>
                              <Button size="sm" onClick={() => { setPastOpen(false); guideToChatFromTemplate({ title: s.title, description: s.description, category: '過去のアンケート', questionCount: 5, audience: s.audience, questions: [], purpose: s.description, mode: s.mode }); }}>チャットでカスタマイズ</Button>
                            </div>
                          </Card>
                        ));
                      })()}
                    </div>
                    {!pastShowAll && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-9 h-16 bg-gradient-to-t from-background to-transparent" />
                    )}
                    <div className="absolute left-0 right-0 bottom-1 flex justify-center">
                      <Button variant="ghost" size="sm" onClick={() => setPastShowAll((v) => !v)}>{pastShowAll ? '件数を絞る' : 'もっと表示'}</Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <TemplatePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewData}
        onConfirm={() => {
          if (!previewData) return;
          setReferenceSurvey({
            id: 'tmpl',
            title: previewData.title,
            client: '',
            purpose: previewData.category,
            implementationDate: '',
            tags: [],
            description: previewData.category,
          });
          setPreviewOpen(false);
          // Store draft then go via redirect page to confirm
          try {
            const draft = {
              title: previewData.title,
              type: previewData.mode ?? 'main',
              audience: previewData.audience ?? undefined,
              questions: (previewData.questions ?? []).map((q: any, idx: number) => ({ id: `Q${idx + 1}`, text: typeof q === 'string' ? q : q.text })),
            };
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('assistant_draft', JSON.stringify(draft));
            }
          } catch {}
          router.push('/assistant/redirect?next=/assistant/confirm');
        }}
        onEdit={() => {
          if (!previewData) return;
          guideToChatFromTemplate(previewData);
        }}
      />

      <QuestionConfirmModal
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        questions={generatedQuestions}
        onConfirm={handleConfirmProceed}
        onEdit={() => setIsConfirmOpen(false)}
      />
    </div>
  );
} 