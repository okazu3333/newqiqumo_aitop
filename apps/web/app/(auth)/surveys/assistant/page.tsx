"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Send, Upload, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QuestionConfirmModal from '@/components/survey-assistant/QuestionConfirmModal';
import TemplateLibrary from '@/components/survey-assistant/TemplateLibrary';
import TemplatePreviewModal, { TemplatePreview, PreviewQuestion } from '@/components/survey-assistant/TemplatePreviewModal';
import { SURVEY_ASSISTANT_SYSTEM_PROMPT } from '@/components/survey-assistant/prompt';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [selectedRuleModel, setSelectedRuleModel] = useState<string | null>(null);
  const [referenceSurvey, setReferenceSurvey] = useState<Survey | null>(null);
  const [selectedRuleModelName, setSelectedRuleModelName] = useState<string | null>(null);
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'sys', role: 'system', content: SURVEY_ASSISTANT_SYSTEM_PROMPT }]);
  const [collected, setCollected] = useState<ChatCollected>({});

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null);

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

  useEffect(() => {
    if (isChatActive) {
      chatCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isChatActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

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
        const previewQuestions = survey.questions.map((q, i) => {
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

  const guideToChatFromTemplate = (tpl: TemplatePreview) => {
    const prefill = `このテンプレートをベースに作成したいです。\nタイトル: ${tpl.title}\n対象: ${tpl.audience}${tpl.purpose ? `\n目的: ${tpl.purpose}` : ''}`;
    setInputMessage(prefill);
    setPreviewOpen(false);
    setInputFocused(true);
    setTimeout(() => {
      chatCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <Card ref={chatCardRef} className={`relative p-0`}>
            {/* Chat Header */}
            <CardHeader className="px-6 pt-5 pb-3 border-b bg-muted rounded-t-lg">
              <p className="text-muted-foreground text-sm">知りたいことを自然文で入力、または企画書・過去調査票ファイルをアップロードしてください。</p>
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
                      <p className="mb-2">ようこそ。以下のいずれかから始めてください。</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>テーマ（例: 従業員満足度調査）</li>
                        <li>対象（例: 既存顧客 / 全社員）</li>
                        <li>設問数（例: 5問程度）</li>
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
                {/* Quick chips */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    { label: 'テーマ', value: 'テーマ: ' },
                    { label: '対象', value: '対象: ' },
                    { label: '設問数', value: '設問数: ' },
                  ].map((chip) => (
                    <Button key={chip.label} variant="secondary" size="sm" onClick={() => setInputMessage((v) => (v ? v + `\n${chip.value}` : chip.value))}>
                      {chip.label}
                    </Button>
                  ))}
                </div>
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
                      placeholder="知りたいこと・調査目的を入力してください..."
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

          {/* Template Library under chat area */}
          <TemplateLibrary
            onSelectTemplate={(item) => {
              // Map questions & audience by template id (based on external project logic)
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

              const getPurpose = (templateId: string) => {
                switch (templateId) {
                  case 'product-awareness':
                    return '商品の認知度と認知経路を把握し、マーケティング戦略の効果を測定する';
                  case 'customer-satisfaction':
                    return '顧客満足度を多角的に評価し、サービス改善の優先順位を明確化する';
                  case 'purchase-behavior':
                    return '購買行動パターンを分析し、販売戦略とチャネル戦略を最適化する';
                  case 'concept-evaluation':
                    return '新商品コンセプトの市場受容性を評価し、開発方向性を決定する';
                  default:
                    return 'サンプル調査の目的説明';
                }
              };

              const buildCategoryCounts = (templateId: string) => {
                const q = getQuestions(templateId);
                // Prefer explicit mapping by question text to category labels
                const mapping: { label: string; match: (t: string) => boolean }[] = [
                  { label: '基本情報', match: (t) => ['年齢', '性別', '職業'].some(k => t.includes(k)) },
                  { label: '認知経路', match: (t) => ['どちらでこの商品を知りましたか', 'どこで知'].some(k => t.includes(k)) },
                  { label: '興味度', match: (t) => t.includes('興味度') },
                  { label: '総合評価', match: (t) => t.includes('総合満足度') },
                  { label: '品質評価', match: (t) => t.includes('品質') },
                  { label: 'サポート評価', match: (t) => t.includes('サポート') },
                  { label: '改善要望', match: (t) => t.includes('改善') || t.includes('提案') },
                  { label: '継続利用', match: (t) => t.includes('継続してご利用') },
                  { label: '購入場所', match: (t) => t.includes('購入する場所') || t.includes('購入する場所') || t.includes('購入する') },
                  { label: '購入頻度', match: (t) => t.includes('購入頻度') },
                  { label: '重視点', match: (t) => t.includes('重視する点') },
                  { label: '価格満足度', match: (t) => t.includes('価格') },
                  { label: '魅力度', match: (t) => t.includes('魅力度') },
                  { label: '購入意向', match: (t) => t.includes('購入意向') },
                  { label: '独自性', match: (t) => t.includes('独自性') },
                  { label: '評価', match: (t) => t.includes('満足度を5段階') },
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
                purpose: getPurpose(item.id),
                categoryCounts: buildCategoryCounts(item.id),
              });
              setPreviewOpen(true);
            }}
          />
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