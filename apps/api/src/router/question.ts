import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const questionRouter = router({
  listBySurvey: publicProcedure
    .input(z.object({ surveyId: z.number() }))
    .query(async ({ input, ctx }) => {
      const sections = await ctx.db.section.findMany({
        where: { surveyId: input.surveyId },
        orderBy: [{ phase: "asc" }, { order: "asc" }],
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              options: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
      return sections;
    }),

  create: publicProcedure
    .input(
      z.object({
        sectionId: z.number(),
        code: z.string(),
        type: z.enum(["SA", "MA", "NUM", "FA"]),
        title: z.string(),
        description: z.string().optional(),
        isRequired: z.boolean().optional(),
        order: z.number().optional(),
        config: z.record(z.string(), z.any()).optional(),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        respondentCondition: z.string().optional(),
        answerControl: z.string().optional(),
        targetCondition: z.string().optional(),
        skipCondition: z.string().optional(),
        displayOrder: z.string().optional(),
        jumpCondition: z.string().optional(),
        options: z
          .array(
            z.object({
              code: z.string(),
              label: z.string(),
              value: z.string(),
              order: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { options, config, ...questionData } = input;

      // orderが指定されていない場合は、最大order + 1を設定
      let order = questionData.order;
      if (order === undefined) {
        const maxOrderQuestion = await ctx.db.question.findFirst({
          where: { sectionId: input.sectionId },
          orderBy: { order: "desc" },
        });
        order = (maxOrderQuestion?.order ?? 0) + 1;
      }

      const question = await ctx.db.question.create({
        data: {
          ...questionData,
          order,
          config: config ? JSON.stringify(config) : "{}",
        },
      });

      // 選択肢を作成（SA/MA の場合）
      if ((questionData.type === "SA" || questionData.type === "MA") && options && options.length > 0) {
        await ctx.db.option.createMany({
          data: options.map((opt) => ({
            questionId: question.id,
            ...opt,
          })),
        });
      }

      return question;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        code: z.string().optional(),
        type: z.enum(["SA", "MA", "NUM", "FA"]).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        isRequired: z.boolean().optional(),
        order: z.number().optional(),
        config: z.record(z.string(), z.any()).optional(),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        respondentCondition: z.string().optional(),
        answerControl: z.string().optional(),
        targetCondition: z.string().optional(),
        skipCondition: z.string().optional(),
        displayOrder: z.string().optional(),
        jumpCondition: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, config, ...data } = input;
      const question = await ctx.db.question.update({
        where: { id },
        data: {
          ...data,
          config: config ? JSON.stringify(config) : undefined,
        },
      });
      return question;
    }),

  // ダミー設問をセクション毎に生成（既に質問があるセクションはスキップ）
  seedForSurvey: publicProcedure
    .input(z.object({ surveyId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const sections = await ctx.db.section.findMany({
        where: { surveyId: input.surveyId },
        orderBy: [{ phase: "asc" }, { order: "asc" }],
        include: { questions: true },
      });

      function buildOptions(labels: string[]) {
        return labels.map((label, idx) => ({
          code: `O${idx + 1}`,
          label,
          value: label,
          order: idx + 1,
        }));
      }

      for (const section of sections) {
        if ((section.questions?.length || 0) > 0) continue;

        const isScreening = section.phase === "SCREENING";
        const title = section.title || "";

        // デフォルト（フォールバック）
        let questions: Array<{
          type: "SA" | "MA" | "FA";
          title: string;
          options?: { code: string; label: string; value: string; order: number }[];
          placeholder?: string;
        }> = [
          { type: "SA", title: `${section.title}に関する設問（単一選択）`, options: buildOptions(["はい", "いいえ", "わからない"]) },
          { type: "MA", title: `${section.title}に関する設問（複数選択）`, options: buildOptions(["価格", "品質", "使いやすさ", "サポート"]) },
          { type: "FA", title: `${section.title}に関する自由記述`, placeholder: "自由にご記入ください" },
        ];

        // スクリーニング系の具体化
        if (isScreening) {
          if (title.includes("基本属性")) {
            questions = [
              { type: "SA", title: "性別を教えてください", options: buildOptions(["男性", "女性", "回答しない"]) },
              { type: "SA", title: "年齢を教えてください", options: buildOptions(["15-19歳", "20-29歳", "30-39歳", "40-49歳", "50-59歳", "60歳以上"]) },
              { type: "SA", title: "居住地（都道府県）を教えてください", options: buildOptions(["北海道・東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"]) },
            ];
          } else if (title.includes("対象者条件")) {
            questions = [
              { type: "SA", title: "該当サービスの利用経験はありますか", options: buildOptions(["現在利用している", "過去に利用していた", "利用したことがない"]) },
              { type: "SA", title: "過去1年の利用頻度を教えてください", options: buildOptions(["週1回以上", "月2-3回", "月1回程度", "数ヶ月に1回", "年1-2回"]) },
              { type: "FA", title: "対象者条件に関する補足があれば教えてください", placeholder: "例：カテゴリの具体例 など" },
            ];
          } else if (title.includes("職業")) {
            questions = [
              { type: "SA", title: "あなたの職業を教えてください", options: buildOptions(["会社員", "自営業", "公務員", "学生", "専業主婦/主夫", "無職"]) },
              { type: "MA", title: "勤務形態を教えてください（複数選択可）", options: buildOptions(["フルタイム", "パート/アルバイト", "リモート中心", "シフト制"]) },
              { type: "FA", title: "職業について補足があれば記入してください", placeholder: "自由記述" },
            ];
          } else if (title.includes("家族") || title.includes("同居") || title.includes("未既婚") || title.includes("結婚")) {
            questions = [
              { type: "SA", title: "婚姻状況を教えてください", options: buildOptions(["未婚", "既婚", "離別/死別"]) },
              { type: "MA", title: "同居家族を教えてください（複数選択可）", options: buildOptions(["配偶者", "子ども", "親", "兄弟姉妹", "一人暮らし", "その他"]) },
              { type: "FA", title: "家族構成に関する補足があれば記入してください", placeholder: "自由記述" },
            ];
          }
        } else {
          // 本調査系の具体化
          if (title.includes("利用状況") || title.includes("体験")) {
            questions = [
              { type: "MA", title: "重視する要素を教えてください（複数選択可）", options: buildOptions(["価格", "品質", "配送の速さ", "品揃え", "アプリの使いやすさ", "サポート"]) },
              { type: "SA", title: "現在の満足度を教えてください", options: buildOptions(["非常に満足", "満足", "どちらでもない", "不満", "非常に不満"]) },
              { type: "FA", title: "改善してほしい点があれば教えてください", placeholder: "自由記述" },
            ];
          } else if (title.includes("今後の利用意向") || title.includes("意向")) {
            questions = [
              { type: "SA", title: "今後も利用し続けますか", options: buildOptions(["継続する", "条件が良ければ継続", "どちらでもない", "利用を検討中", "利用を中止する"]) },
              { type: "SA", title: "友人・家族に薦めますか（推奨意向）", options: buildOptions(["強く薦める", "薦める", "どちらでもない", "薦めない", "強く薦めない"]) },
              { type: "FA", title: "継続/非継続の理由があれば教えてください", placeholder: "自由記述" },
            ];
          } else if (title.includes("購買") || title.includes("決定要因") || title.includes("行動")) {
            questions = [
              { type: "MA", title: "購入チャネルを教えてください（複数選択可）", options: buildOptions(["ECサイト", "実店舗", "公式オンライン", "フリマ/オークション"]) },
              { type: "MA", title: "購入時の重視点を教えてください（複数選択可）", options: buildOptions(["価格", "品質", "デザイン", "使いやすさ", "口コミ", "ブランド"]) },
              { type: "FA", title: "最近の購入行動で気づいた点があれば教えてください", placeholder: "自由記述" },
            ];
          } else if (title.includes("ブランド") || title.includes("認知") || title.includes("評価")) {
            questions = [
              { type: "MA", title: "認知経路を教えてください（複数選択可）", options: buildOptions(["テレビ", "インターネット検索", "SNS", "口コミ", "店舗"]) },
              { type: "SA", title: "総合的なブランド評価を教えてください", options: buildOptions(["非常に良い", "良い", "普通", "悪い", "非常に悪い"]) },
              { type: "FA", title: "ブランドの印象や想起点を自由に記入してください", placeholder: "自由記述" },
            ];
          } else if (title.includes("競合") || title.includes("差別化") || title.includes("比較")) {
            questions = [
              { type: "SA", title: "競合サービスの利用状況を教えてください", options: buildOptions(["現在も利用", "時々利用", "利用していない"]) },
              { type: "MA", title: "本サービスの強み（差別化要素）を選んでください", options: buildOptions(["価格", "品質", "デザイン", "使いやすさ", "サポート", "スピード"]) },
              { type: "FA", title: "競合と比較した意見・理由があれば教えてください", placeholder: "自由記述" },
            ];
          }
        }

        for (let i = 0; i < questions.length; i++) {
          const qDef = questions[i];
          const baseCode = section.phase === "SCREENING" ? "SC" : "Q";
          const code = `${baseCode}${section.order * 10 + i + 1}`;

          const created = await ctx.db.question.create({
            data: {
              sectionId: section.id,
              code,
              type: qDef.type,
              title: qDef.title,
              isRequired: i === 0,
              order: i + 1,
              config: qDef.type === "FA" && qDef.placeholder ? JSON.stringify({ placeholder: qDef.placeholder, rows: 3 }) : "{}",
            },
          });

          if ((qDef.type === "SA" || qDef.type === "MA") && qDef.options) {
            await ctx.db.option.createMany({
              data: qDef.options.map((opt) => ({
                questionId: created.id,
                ...opt,
              })),
            });
          }
        }
      }

      return { ok: true };
    }),
});
