import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const surveyRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const surveys = await ctx.db.survey.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });
    return surveys;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const survey = await ctx.db.survey.findUnique({
        where: { id: input.id },
      });
      return survey;
    }),

  getByIdWithRelations: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const survey = await ctx.db.survey.findUnique({
        where: { id: input.id },
        include: {
          sections: {
            include: {
              questions: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });
      return survey;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "タイトルは必須です"),
        purpose: z.string().optional(),
        targetCondition: z.string().optional(),
        analysisCondition: z.string().optional(),
        researchMethod: z.string().optional(),
        researchScale: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log("survey.create input:", input);
      try {
        const survey = await ctx.db.survey.create({
          data: {
            title: input.title,
            purpose: input.purpose,
            targetCondition: input.targetCondition,
            analysisCondition: input.analysisCondition,
            researchMethod: input.researchMethod,
            researchScale: input.researchScale,
          },
        });
        return survey;
      } catch (e) {
        console.error("survey.create prisma error:", e);
        throw e;
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1, "タイトルは必須です").optional(),
        purpose: z.string().optional(),
        targetCondition: z.string().optional(),
        analysisCondition: z.string().optional(),
        researchMethod: z.string().optional(),
        researchScale: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const survey = await ctx.db.survey.update({
        where: { id },
        data,
      });
      return survey;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const survey = await ctx.db.survey.delete({
        where: { id: input.id },
      });
      return survey;
    }),
});
