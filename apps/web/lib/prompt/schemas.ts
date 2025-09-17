import { z } from "zod";

// Common meta schema
export const MetaSchema = z.object({
  version: z.string().default("1.0"),
  locale: z.string().default("ja-JP"),
  generatedAt: z.string().default(() => new Date().toISOString()),
  promptChain: z
    .object({ previous: z.string().optional(), schemaVersion: z.string().optional() })
    .optional(),
});

// Prompt1 (調査設計情報抽出)
const FieldValueSchema = z.object({
  value: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())]).or(z.null()).optional(),
  source: z.enum(["user", "inferred", "empty"]).default("empty"),
  confidence: z.number().min(0).max(1).default(0),
});

export const Prompt1Schema = z.object({
  meta: MetaSchema,
  必須項目: z.object({
    調査タイトル: FieldValueSchema,
    調査目的: FieldValueSchema,
    調査対象者条件: FieldValueSchema,
    分析対象者条件: FieldValueSchema,
  }),
  任意項目: z.object({
    接触対象: FieldValueSchema.optional(),
    カテゴリ種類: FieldValueSchema.optional(),
    利用スタイル: FieldValueSchema.optional(),
    選定理由: FieldValueSchema.optional(),
    設問タイプ: FieldValueSchema.optional(),
    回答形式: FieldValueSchema.optional(),
    設問構成: FieldValueSchema.optional(),
    分岐条件: FieldValueSchema.optional(),
    分析視点: FieldValueSchema.optional(),
  }),
  補完ロジック: z
    .object({
      方針: z.object({ 未入力: z.string(), 推測可能: z.string() }),
      備考: z.array(z.string()).default([]),
    })
    .optional(),
  ユーザー確認質問: z
    .array(
      z.object({
        id: z.string(),
        対象フィールド: z.string().optional(),
        質問文: z.string(),
        理由: z.string().optional(),
        候補例: z.array(z.string()).optional(),
        優先度: z.enum(["high", "medium", "low"]).optional(),
      }),
    )
    .default([]),
});
export type Prompt1 = z.infer<typeof Prompt1Schema>;

// Prompt2（設問設計生成）
export const ChoiceSchema = z.object({ code: z.string(), label: z.string() });
export const ScaleSchema = z.object({
  min: z.number(),
  max: z.number(),
  labels: z.array(z.string()).min(2),
});

export const ScreeningQuestionSchema = z.object({
  id: z.string(),
  設問文: z.string(),
  選択肢: z.array(ChoiceSchema).optional().default([]),
  形式: z.enum(["単一選択", "複数選択", "自由記述", "数値入力", "5段階評価"]),
  internalType: z.enum(["SA", "MA", "FA", "NU", "Scale"]).optional(),
  scale: ScaleSchema.optional(),
  分岐: z.array(z.any()).optional().default([]),
});

export const MainQuestionSchema = z.object({
  id: z.string(),
  設問文: z.string(),
  選択肢: z.array(ChoiceSchema).optional().default([]),
  形式: z.enum(["単一選択", "複数選択", "自由記述", "数値入力", "5段階評価"]),
  internalType: z.enum(["SA", "MA", "FA", "NU", "Scale"]).optional(),
  scale: ScaleSchema.optional(),
  分析目的: z.string().optional(),
});

export const BranchRuleSchema = z.object({
  from: z.string(),
  when: z
    .object({ equals: z.string().optional(), code: z.string().optional(), regex: z.string().optional() })
    .optional(),
  goTo: z.string().optional(),
  else: z.string().optional(),
});

export const Prompt2Schema = z.object({
  meta: MetaSchema,
  手法分解: z.object({ スクリーニング: z.string(), 本調査: z.string() }),
  スクリーニング設問: z.array(ScreeningQuestionSchema).default([]),
  本調査設問: z.array(MainQuestionSchema).default([]),
  設問思想: z.record(z.string(), z.any()).default({}),
  分岐ロジック: z.array(BranchRuleSchema).default([]),
  constraints: z.object({ maxScreening: z.number().optional(), maxMain: z.number().optional(), maxDepth: z.number().optional() }).optional(),
});
export type Prompt2 = z.infer<typeof Prompt2Schema>;

// Depth（不足項目深掘り）
export const DepthQuestionSchema = z.object({
  id: z.string(),
  対象項目: z.string(),
  path: z.string().optional(),
  質問文: z.string(),
  期待形式: z.enum(["text", "enum", "multi", "number", "scale"]).optional(),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  validation: z.record(z.string(), z.any()).optional(),
  exampleAnswers: z.array(z.string()).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  dependsOn: z.array(z.string()).optional(),
});

export const DepthSchema = z.object({
  meta: MetaSchema,
  scope: z.object({ threadId: z.string().optional(), messageId: z.string().optional() }).optional(),
  不足項目: z.array(z.string()).default([]),
  追加質問: z.array(DepthQuestionSchema).default([]),
  mapping: z.record(z.string(), z.string()).optional(),
  UI表示用テキスト: z.string().optional(),
  nextAction: z.enum(["confirm", "regenerate", "proceed"]).optional(),
});
export type Depth = z.infer<typeof DepthSchema>; 