import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const reviewAccessRouter = router({
  // 特定のアンケートのレビューアクセス情報を取得
  getBySurveyId: publicProcedure
    .input(
      z.object({
        surveyId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { surveyId } = input;

      const access = await ctx.db.reviewAccess.findUnique({
        where: { surveyId },
        include: {
          survey: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!access) {
        return null;
      }

      // 期限が切れているかチェック
      const isExpired = new Date() > new Date(access.expiresAt);

      return {
        ...access,
        isExpired,
      };
    }),

  // レビューアクセスを作成または更新
  upsert: publicProcedure
    .input(
      z.object({
        surveyId: z.number(),
        password: z.string().min(1, "パスワードは必須です"),
        expiresAt: z.string().datetime(), // ISO日時文字列
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { surveyId, password, expiresAt } = input;

      // アンケートが存在するか確認
      const survey = await ctx.db.survey.findUnique({
        where: { id: surveyId },
      });

      if (!survey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "アンケートが見つかりません",
        });
      }

      // レビューアクセスを作成または更新
      const access = await ctx.db.reviewAccess.upsert({
        where: { surveyId },
        update: {
          password,
          expiresAt: new Date(expiresAt),
        },
        create: {
          surveyId,
          password,
          expiresAt: new Date(expiresAt),
        },
      });

      return access;
    }),

  // パスワードを検証
  validate: publicProcedure
    .input(
      z.object({
        surveyId: z.number(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { surveyId, password } = input;

      const access = await ctx.db.reviewAccess.findUnique({
        where: { surveyId },
      });

      if (!access) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "レビューアクセス情報が見つかりません",
        });
      }

      // 期限をチェック
      if (new Date() > new Date(access.expiresAt)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "このURLは有効期限が切れています",
        });
      }

      // パスワードをチェック（簡易実装のため平文比較）
      if (access.password !== password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "パスワードが正しくありません",
        });
      }

      return { success: true };
    }),

  // レビューアクセスを削除
  delete: publicProcedure
    .input(
      z.object({
        surveyId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { surveyId } = input;

      await ctx.db.reviewAccess.delete({
        where: { surveyId },
      });

      return { success: true };
    }),
});
