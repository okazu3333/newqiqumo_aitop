import { Prompt1Schema, Prompt2Schema, type Prompt1, type Prompt2, type Depth } from "./schemas";

export interface LlmAdapter {
  generatePrompt1(input: string): Promise<Prompt1>;
  generatePrompt2(prompt1: Prompt1): Promise<Prompt2>;
  generateDepth(prompt1: Prompt1): Promise<Depth>; 
}

export class MockLlmAdapter implements LlmAdapter {
  async generatePrompt1(input: string): Promise<Prompt1> {
    const title = /顧客満足度/.test(input) ? '顧客満足度調査' : /従業員満足|ES/.test(input) ? '従業員満足度調査' : /NPS/i.test(input) ? 'NPS調査' : 'アンケート調査';
    const purpose = /顧客満足度/.test(input) ? '顧客満足度や改善点の把握' : '推定: 調査目的の把握';
    const json = {
      meta: { version: "1.0", locale: "ja-JP", generatedAt: new Date().toISOString() },
      必須項目: {
        調査タイトル: { value: title, source: "inferred", confidence: 0.9 },
        調査目的: { value: purpose, source: "inferred", confidence: 0.8 },
        調査対象者条件: { value: "推定: 関連する利用者", source: "inferred", confidence: 0.6 },
        分析対象者条件: { value: "空欄", source: "empty", confidence: 0 },
      },
      任意項目: { 分析視点: { value: ["利用頻度", "年齢"], source: "inferred", confidence: 0.5 } },
      補完ロジック: { 方針: { 未入力: "空欄", 推測可能: "推定: 〜" }, 備考: [] },
      ユーザー確認質問: [],
    };
    return Prompt1Schema.parse(json);
  }

  async generatePrompt2(_prompt1: Prompt1): Promise<Prompt2> {
    const json = {
      meta: { version: "2.0", locale: "ja-JP", generatedAt: new Date().toISOString() },
      手法分解: { スクリーニング: "対象抽出", 本調査: "本調査" },
      スクリーニング設問: [
        {
          id: "S1",
          設問文: "本テーマの利用経験はありますか？",
          形式: "単一選択",
          internalType: "SA",
          選択肢: [
            { code: "1", label: "現在利用中" },
            { code: "2", label: "過去に利用" },
            { code: "3", label: "未利用" }
          ],
        }
      ],
      本調査設問: [
        {
          id: "Q1",
          設問文: "総合満足度を教えてください。",
          形式: "5段階評価",
          internalType: "Scale",
          scale: { min: 1, max: 5, labels: ["非常に不満","不満","普通","満足","非常に満足"] },
          分析目的: "KPI把握（平均・Top2Box）"
        }
      ],
      設問思想: { S1: { 目的: "対象抽出" }, Q1: { 目的: "KPI" } },
      分岐ロジック: [ { from: "S1", when: { code: "1" }, goTo: "Q1" }, { from: "S1", else: "END" } ],
      constraints: { maxScreening: 5, maxMain: 15, maxDepth: 2 }
    };
    return Prompt2Schema.parse(json);
  }

  async generateDepth(prompt1: Prompt1): Promise<Depth> {
    const hasTitle = !!prompt1?.必須項目?.調査タイトル?.value && String(prompt1.必須項目.調査タイトル.value).trim().length > 0;
    const questions: any[] = [];
    const missing: string[] = [];
    if (!hasTitle) {
      missing.push('調査タイトル');
      questions.push({
        id: 'Q1', 対象項目: '調査タイトル', path: '必須項目.調査タイトル', 質問文: 'この調査のタイトルは何にしますか？',
        期待形式: 'text', validation: { required: true, min: 2, max: 60 }, exampleAnswers: ['顧客満足度調査','NPS調査'], priority: 'high'
      });
    }
    const json = {
      meta: { version: '1.0', locale: 'ja-JP', generatedAt: new Date().toISOString() },
      scope: {},
      不足項目: missing,
      追加質問: questions,
      mapping: hasTitle ? {} : { '必須項目.調査タイトル': 'Q1' },
      UI表示用テキスト: hasTitle ? undefined : '調査設計を進めるために、タイトルを入力してください。',
      nextAction: hasTitle ? 'proceed' : 'confirm'
    } as const;
    return json as unknown as Depth;
  }
} 