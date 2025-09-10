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
  const tplPageSize = 9;
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
      // Theme heuristics
      if (/ES|従業員満足/.test(text)) intent.theme = '従業員満足度（ES）調査';
      else if (/CS|顧客満足/.test(text)) intent.theme = '顧客満足度（CS）調査';
      else if (/NPS/i.test(text)) intent.theme = 'NPS調査';
      else if (/ブランド認知|認知度/.test(text)) intent.theme = 'ブランド認知度調査';
      // Mode heuristics
      if (/screening|対象をしぼる/.test(text)) intent.mode = 'screening';
      else if (/main|じっくり|本調査/.test(text)) intent.mode = 'main';
      // Count
      const m = text.match(/(\d+)\s*問/);
      if (m) intent.count = Math.max(1, Math.min(20, parseInt(m[1], 10)));
      // Audience (very simple keywords)
      if (/従業員|社員|ES/.test(text)) intent.audience = '従業員';
      else if (/顧客|ユーザー|会員/.test(text)) intent.audience = '既存顧客';
      // Needs (extract phrase around 〜したい/知りたい)
      const needMatch = text.match(/(.{0,12})(したい|知りたい)/);
      if (needMatch) intent.needs = needMatch[0].replace(/(したい|知りたい)/, '').trim() || undefined;
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
        const previewQuestions = survey.questions.map((q) => {
          const base: any = { text: q.text };
          if (q.type === 'single_choice') return { ...base, type: 'single', options: q.options };
          if (q.type === 'multiple_choice') return { ...base, type: 'multiple', options: q.options };
          if (q.type === 'scale') return { ...base, type: 'scale', scale: { min: 1, max: (q.options?.length ?? 5), labels: q.options ?? ['非常に不満','不満','普通','満足','非常に満足'] } };
          return { ...base, type: 'text' };
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
              setPreviewData({
                title: item.title,
                description: item.description,
                category: item.category ?? 'テンプレート',
                questionCount: questions.length,
                audience: getAudience(item.id),
                questions,
      purpose: item.description,
                categoryCounts: buildCategoryCounts(item.id),
      mode: tplMethod || undefined,
              });
              setPreviewOpen(true);
  };

  const recentTemplates: { id: string; title: string; description: string; category?: string }[] = [
    { id: 'customer-satisfaction', title: '顧客満足度（CS調査）', description: '総合満足度／各項目評価／改善要望', category: '満足度・評価調査' },
    { id: 'product-awareness', title: '商品認知度調査', description: '認知率／想起率／認知経路の把握', category: '認知・認識調査' },
    { id: 'purchase-behavior', title: '購買行動調査', description: '購入場所と頻度／重視点／価格感度', category: '利用実態・行動調査' },
    { id: 'concept-evaluation', title: '新商品コンセプト評価', description: '魅力度／購入意向／改善余地', category: '新商品・サービス調査' },
  ];

  const spotlightTemplates: { id: string; title: string; description: string; category?: string }[] = [
    { id: 'concept-evaluation', title: '新商品コンセプト評価', description: '魅力度／購入意向／改善余地', category: '新商品・サービス調査' },
    { id: 'employee-satisfaction', title: '従業員満足度（ES調査）', description: '制度満足／職場環境／エンゲージメント', category: '満足度・評価調査' },
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

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Starter Tiles removed as requested */}

          <Card ref={chatCardRef} className={`relative p-0`}>
            {/* Chat Header */}
            <CardHeader className="px-6 pt-5 pb-3 border-b bg-muted rounded-t-lg">
              <p className="text-muted-foreground text-sm">作成したい項目を自然文で入力、テンプレート選択もしくは、過去調査票ファイルをアップロードしてください</p>
              {justSent && (
                <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1 text-xs shadow-sm">
                  <Check className="w-3.5 h-3.5" /> 送信しました
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {/* Messages Area */}
              <div className={`${(isChatVisible || showWelcome) ? 'py-4 h-[360px] max-h-[60vh]' : 'py-0 h-0 max-h-0'} px-6 overflow-y-auto space-y-3 transition-all duration-300`}>
                {!hasConversation && showWelcome && (
                  <div className="flex justify-start">
                    <div className="bg-background text-foreground border rounded-2xl px-4 py-3 text-sm max-w-[70%] shadow-sm">
                      <p className="mb-2">以下の項目を入力し、アンケートを作成してください。</p>
                      <p className="text-xs text-muted-foreground mb-2">入力がないものは、推定項目としてアンケートを作成します。</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>タイトル（例：製品利用度調査）</li>
                        <li>調査目的（例：商品改良にあたり、現状の利用度調査をしたい）</li>
                        <li>設問条件（例：5問程度で作成）</li>
                      </ul>
                      <div className="mt-2 text-xs text-muted-foreground">テンプレートから始める場合は下のテンプレート一覧をご利用ください。</div>
                      <div className="mt-3 flex gap-2">
                        {[
                          '従業員満足度調査で本調査を提案して',
                          'ブランド認知度の事前調査を3問で',
                        ].map((ex, i) => (
                          <Button key={i} size="sm" variant="secondary" onClick={() => { setInputMessage(ex); setShowWelcome(false); }}>
                            {ex}
                          </Button>
                        ))}
                        <Button size="sm" variant="ghost" onClick={() => { setShowWelcome(false); }}>閉じる</Button>
                      </div>
                    </div>
                  </div>
                )}
                {messages.filter(m => m.role !== 'system').map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`} aria-live={m.role === 'assistant' ? 'polite' : undefined}>
                    <div className={`${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground border'} rounded-2xl px-4 py-2 text-sm max-w-[70%] whitespace-pre-wrap shadow-sm`}>
                      {m.content}
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
                className={`px-6 pb-5 pt-3 border-t ${isDragOver ? 'bg-accent/20' : ''} sticky bottom-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75`}
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
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        setInputFocused(true);
                        setShowWelcome(true);
                      }}
                      onBlur={() => setInputFocused(false)}
                      placeholder="例：新サービスの満足度を3問で確認したい"
                      rows={3}
                    />
                    <div className="mt-1 text-xs text-muted-foreground">Enterで送信 / Shift+Enterで改行 ・ ファイルをドロップして添付</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="chat-file-upload"
                      accept=".pdf,.doc,.docx,.xlsx,.pptx,.txt,.csv"
                      multiple
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="chat-file-upload" className="cursor-pointer">
                        <Upload className="h-5 w-5" />
                      </label>
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={isSending || (!inputMessage.trim() && attachedFiles.length === 0)}
                    >
                      {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent - grid 3 columns, centered */}
          <div className="space-y-2">
            <div className="flex items-center">
              <h4 className="text-sm font-medium text-foreground">最近使った</h4>
            </div>
            <div className="mx-auto w-full max-w-[1200px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-4 justify-center justify-items-center place-content-center min-h-[220px]">
                {recentTemplates.slice(0, 4).map((t) => (
                  <Card key={t.id} className="p-4 w-[280px] min-h-[180px] hover:shadow-md transition-shadow flex flex-col overflow-visible">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">{t.title}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">{t.category ?? 'テンプレート'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 break-words">{t.description}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">5問目安</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">本調査</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-muted-foreground overflow-visible">
                      <span className="px-1.5 py-0.5 rounded bg-muted">設問設計</span>
                      <span className="px-1.5 py-0.5 rounded bg-muted">対象設定</span>
                      <span className="px-1.5 py-0.5 rounded bg-muted">選択肢</span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-1 md:gap-2 mt-auto">
                      <Button variant="outline" size="sm" onClick={() => handleSelectTemplate(t)}>プレビュー</Button>
                      <Button size="sm" onClick={() => guideToChatFromTemplate({ title: t.title, description: t.description, category: t.category ?? 'テンプレート', audience: '一般対象者', questions: [], purpose: t.description })}>チャットでカスタマイズ</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* よく使うテンプレート - grid 3 columns */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">よく使うテンプレート</h4>
              <Button variant="ghost" size="sm" onClick={() => setSeeAllOpen(true)}>すべて表示</Button>
            </div>
            <div className="mx-auto w-full max-w-[1200px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-4 justify-center justify-items-center place-content-center min-h-[220px]">
                {[
                  ...spotlightTemplates,
                  { id: 'price-sensitivity', title: '価格受容性調査', description: '許容価格帯の把握', category: '新商品・サービス調査' },
                  { id: 'brand-image-evaluation', title: 'ブランドイメージ評価', description: '親しみやすさ等の測定', category: 'ブランド・イメージ調査' },
                ].slice(0,4).map((t: any) => (
                  <Card key={t.id} className="p-4 w-[280px] relative overflow-hidden hover:shadow-md transition-shadow min-h-[180px] flex flex-col overflow-visible">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold">{t.title}</div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">{t.category ?? 'テンプレート'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 break-words">{t.description}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">5問目安</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">本調査</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-muted-foreground">
                        <span className="px-1.5 py-0.5 rounded bg-muted">認知/評価</span>
                        <span className="px-1.5 py-0.5 rounded bg-muted">改善提案</span>
                        <span className="px-1.5 py-0.5 rounded bg-muted">選択肢</span>
                      </div>
                      <div className="flex flex-col md:flex-row gap-1 md:gap-2 mt-auto pt-3">
                        <Button size="sm" variant="outline" onClick={() => handleSelectTemplate(t)}>プレビュー</Button>
                        <Button size="sm" onClick={() => guideToChatFromTemplate({ title: t.title, description: t.description, category: t.category ?? 'テンプレート', questionCount: 5, audience: '一般対象者', questions: [], purpose: t.description })}>チャットでカスタマイズ</Button>
                      </div>
                    </div>
                  </Card>
                ))}
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
                        return shown.map((tpl, idx) => (
                          <Card key={`${tpl.id}-${idx}`} className="p-3 border rounded-lg flex flex-col">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="text-sm font-medium line-clamp-1">{tpl.title}</div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">{tpl.category ?? 'テンプレート'}</span>
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2 mb-1.5">{tpl.description}</div>
                            <div className="flex flex-wrap gap-1 mb-2 text-[10px] text-muted-foreground">
                              {(tpl.features.slice(0, 3)).map((f, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-muted">{f}</span>
                              ))}
                            </div>
                            <div className="mt-auto flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleSelectTemplate({ id: tpl.id, title: tpl.title, description: tpl.description, category: tpl.category })}>プレビュー</Button>
                              <Button size="sm" onClick={() => guideToChatFromTemplate({ title: tpl.title, description: tpl.description, category: tpl.category ?? 'テンプレート', questionCount: 5, audience: '一般対象者', questions: [], purpose: tpl.description })}>チャットでカスタマイズ</Button>
                            </div>
                          </Card>
                        ));
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