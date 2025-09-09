import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const sectionRouter = router({
  list: publicProcedure
    .input(z.object({ surveyId: z.number() }))
    .query(async ({ input, ctx }) => {
      const sections = await ctx.db.section.findMany({
        where: { surveyId: input.surveyId },
        orderBy: [{ phase: "asc" }, { order: "asc" }],
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      });
      return sections;
    }),

  sync: publicProcedure
    .input(
      z.object({
        surveyId: z.number(),
        screeningTitles: z.array(z.string()),
        mainTitles: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { surveyId, screeningTitles, mainTitles } = input;

      // 既存のセクションを取得
      const existingSections = await ctx.db.section.findMany({
        where: { surveyId },
      });

      // 既存のセクションをphaseとtitleでマップ化
      const existingMap = new Map(
        existingSections.map((s) => [`${s.phase}:${s.title}`, s]),
      );

      // 新しいセクションのセット
      const newSectionsSet = new Set([
        ...screeningTitles.map((title) => `SCREENING:${title}`),
        ...mainTitles.map((title) => `MAIN:${title}`),
      ]);

      // 削除対象のセクションを特定
      const sectionsToDelete = existingSections.filter(
        (s) => !newSectionsSet.has(`${s.phase}:${s.title}`),
      );

      // セクションを削除
      if (sectionsToDelete.length > 0) {
        await ctx.db.section.deleteMany({
          where: {
            id: { in: sectionsToDelete.map((s) => s.id) },
          },
        });
      }

      // 新規作成するセクションを特定して作成
      const sectionsToCreate = [];

      // スクリーニングセクションの処理
      for (let i = 0; i < screeningTitles.length; i++) {
        const title = screeningTitles[i];
        if (!existingMap.has(`SCREENING:${title}`)) {
          sectionsToCreate.push({
            surveyId,
            phase: "SCREENING",
            title,
            order: i + 1,
          });
        }
      }

      // 本調査セクションの処理
      for (let i = 0; i < mainTitles.length; i++) {
        const title = mainTitles[i];
        if (!existingMap.has(`MAIN:${title}`)) {
          sectionsToCreate.push({
            surveyId,
            phase: "MAIN",
            title,
            order: i + 1,
          });
        }
      }

      // 新規セクションを作成
      if (sectionsToCreate.length > 0) {
        await ctx.db.section.createMany({
          data: sectionsToCreate,
        });
      }

      // 既存セクションの順序を更新
      const updatePromises = [];

      // スクリーニングセクションの順序更新
      for (let i = 0; i < screeningTitles.length; i++) {
        const title = screeningTitles[i];
        const existing = existingMap.get(`SCREENING:${title}`);
        if (existing && existing.order !== i + 1) {
          updatePromises.push(
            ctx.db.section.update({
              where: { id: existing.id },
              data: { order: i + 1 },
            }),
          );
        }
      }

      // 本調査セクションの順序更新
      for (let i = 0; i < mainTitles.length; i++) {
        const title = mainTitles[i];
        const existing = existingMap.get(`MAIN:${title}`);
        if (existing && existing.order !== i + 1) {
          updatePromises.push(
            ctx.db.section.update({
              where: { id: existing.id },
              data: { order: i + 1 },
            }),
          );
        }
      }

      await Promise.all(updatePromises);

      // 更新後のセクションを返す
      const updatedSections = await ctx.db.section.findMany({
        where: { surveyId },
        orderBy: [{ phase: "asc" }, { order: "asc" }],
      });

      return updatedSections;
    }),

  create: publicProcedure
    .input(
      z.object({
        surveyId: z.number(),
        phase: z.enum(["SCREENING", "MAIN"]),
        title: z.string().min(1),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // orderが指定されていない場合は、同じphaseの最大order + 1を設定
      let order = input.order;
      if (order === undefined) {
        const maxOrderSection = await ctx.db.section.findFirst({
          where: {
            surveyId: input.surveyId,
            phase: input.phase,
          },
          orderBy: { order: "desc" },
        });
        order = (maxOrderSection?.order ?? 0) + 1;
      }

      const section = await ctx.db.section.create({
        data: {
          surveyId: input.surveyId,
          phase: input.phase,
          title: input.title,
          order,
        },
      });

      return section;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const section = await ctx.db.section.update({
        where: { id },
        data,
      });
      return section;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const section = await ctx.db.section.delete({
        where: { id: input.id },
      });
      return section;
    }),
});
