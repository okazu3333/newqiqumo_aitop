import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const reviewRouter = router({
  // threadIdを元にレビュー一覧を取得
  list: publicProcedure
    .input(
      z.object({
        threadId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const reviews = await ctx.db.review.findMany({
        where: {
          threadId: input.threadId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return reviews;
    }),

  // レビューを作成
  create: publicProcedure
    .input(
      z.object({
        threadId: z.number(),
        message: z.string(),
        createdBy: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const review = await ctx.db.review.create({
        data: {
          threadId: input.threadId,
          message: input.message,
          createdBy: input.createdBy,
        },
      });

      return review;
    }),

  // レビューを取得
  get: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const review = await ctx.db.review.findUnique({
        where: {
          id: input.id,
        },
        include: {
          thread: true,
        },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      return review;
    }),

  // レビューを更新
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          message: z.string(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const review = await ctx.db.review.update({
        where: {
          id: input.id,
        },
        data: input.data,
      });

      return review;
    }),

  // レビューを削除
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const review = await ctx.db.review.delete({
        where: {
          id: input.id,
        },
      });

      return review;
    }),
});
