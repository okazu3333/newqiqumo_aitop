import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const threadRouter = router({
  // surveyIdを元にスレッド一覧を取得
  list: publicProcedure
    .input(
      z.object({
        surveyId: z.number(),
        type: z.string().optional(),
        isCompleted: z.boolean().nullable().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const where: {
        question: {
          section: {
            surveyId: number;
          };
        };
        type?: string;
        isCompleted?: boolean;
      } = {
        question: {
          section: {
            surveyId: input.surveyId,
          },
        },
      };

      // typeでフィルタリング
      if (input.type !== undefined) {
        where.type = input.type;
      }

      // isCompletedでフィルタリング（nullでない場合のみ）
      if (input.isCompleted !== null && input.isCompleted !== undefined) {
        where.isCompleted = input.isCompleted;
      }

      const threads = await ctx.db.thread.findMany({
        where,
        include: {
          question: {
            select: {
              id: true,
              code: true,
              title: true,
            },
          },
          reviews: {
            select: {
              id: true,
              message: true,
              createdBy: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return threads;
    }),

  // スレッドを作成
  create: publicProcedure
    .input(
      z.object({
        questionId: z.number(),
        x: z.number(),
        y: z.number(),
        message: z.string(),
        createdBy: z.string(),
        type: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const thread = await ctx.db.thread.create({
        data: {
          questionId: input.questionId,
          x: input.x,
          y: input.y,
          message: input.message,
          createdBy: input.createdBy,
          type: input.type,
        },
      });

      return thread;
    }),

  // スレッドを取得
  get: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const thread = await ctx.db.thread.findUnique({
        where: {
          id: input.id,
        },
        include: {
          question: true,
          reviews: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!thread) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Thread not found",
        });
      }

      return thread;
    }),

  // スレッドを更新
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          message: z.string().optional(),
          isCompleted: z.boolean().optional(),
          type: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const thread = await ctx.db.thread.update({
        where: {
          id: input.id,
        },
        data: input.data,
      });

      return thread;
    }),

  // スレッドを削除
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const thread = await ctx.db.thread.delete({
        where: {
          id: input.id,
        },
      });

      return thread;
    }),

  // 質問ごとにダミースレッド/レビューを生成（既存があればスキップ）
  seedForSurvey: publicProcedure
    .input(z.object({ surveyId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const questions = await ctx.db.question.findMany({
        where: { section: { surveyId: input.surveyId } },
        select: { id: true, code: true, title: true, section: { select: { phase: true, title: true } } },
        orderBy: [{ section: { phase: "asc" } }, { order: "asc" }],
      });

      for (const q of questions) {
        const existing = await ctx.db.thread.findFirst({ where: { questionId: q.id } });
        if (existing) continue;

        // AIレビュー
        const ai = await ctx.db.thread.create({
          data: {
            questionId: q.id,
            x: 22,
            y: 35,
            type: "ai",
            createdBy: "AIレビュー",
            message:
              q.section.title.includes("ブランド") || q.title.includes("ブランド")
                ? "ブランド関連設問：表現の一貫性を確認してください。"
                : q.section.title.includes("購買") || q.title.includes("購入")
                  ? "購入要因の選択肢に抜け漏れがないか確認しました。"
                  : "設問文の簡潔性と選択肢の網羅性を確認しました。",
          },
        });
        await ctx.db.review.create({
          data: {
            threadId: ai.id,
            message: "選択肢順序はロジックに合わせ昇順が読みやすいです。",
            createdBy: "AIレビュー",
          },
        });

        // チームレビュー
        const team = await ctx.db.thread.create({
          data: {
            questionId: q.id,
            x: 68,
            y: 30,
            type: "team",
            createdBy: "レビュアーA",
            message:
              q.section.title.includes("利用意向")
                ? "設問の前提（利用経験の有無）を明記しましょう。"
                : q.section.title.includes("利用状況")
                  ? "最近の期間を指定（直近3ヶ月など）した方が回答が安定します。"
                  : "回答者が解釈しやすいようラベルの具体度を合わせてください。",
          },
        });
        await ctx.db.review.create({
          data: {
            threadId: team.id,
            message: "コメントありがとうございます。修正案を次回ドラフトに反映します。",
            createdBy: "作成者",
          },
        });
      }

      return { ok: true };
    }),
});
