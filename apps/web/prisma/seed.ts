import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureSurvey() {
  const existing = await prisma.survey.findFirst({ where: { title: "PoC Survey" } });
  if (existing) return existing;
  return prisma.survey.create({
    data: {
      title: "PoC Survey",
      purpose: "PoC local prisma in apps/web",
      targetCondition: "n/a",
      analysisCondition: "n/a",
      researchMethod: "n/a",
      researchScale: "n/a",
    },
  });
}

async function ensureSection(surveyId: number, phase: string, order: number, title: string) {
  const existing = await prisma.section.findFirst({ where: { surveyId, phase, order } });
  if (existing) return existing;
  return prisma.section.create({ data: { surveyId, phase, order, title } });
}

async function ensureQuestion(sectionId: number, code: string, title: string) {
  const existing = await prisma.question.findFirst({ where: { sectionId, code } });
  if (existing) return existing;
  return prisma.question.create({
    data: {
      sectionId,
      code,
      type: "SA",
      title,
      order: 1,
      isRequired: true,
      config: "{}",
    },
  });
}

async function ensureOption(questionId: number, code: string, label: string, value: string, order: number) {
  const existing = await prisma.option.findFirst({ where: { questionId, code } });
  if (existing) return existing;
  return prisma.option.create({ data: { questionId, code, label, value, order } });
}

async function ensureThread(questionId: number) {
  const existing = await prisma.thread.findFirst({ where: { questionId, type: "ai" } });
  if (existing) return existing;
  return prisma.thread.create({
    data: {
      questionId,
      x: 10,
      y: 10,
      createdBy: "AIレビュー",
      message: "PoC: 表現の一貫性を確認してください",
      type: "ai",
    },
  });
}

async function main() {
  console.log("🌱 Seeding (append mode) ...");

  const survey = await ensureSurvey();
  const screening = await ensureSection(survey.id, "SCREENING", 1, "Screening");
  const mainSec = await ensureSection(survey.id, "MAIN", 1, "Main");

  const qSc1 = await ensureQuestion(screening.id, "SC1", "年齢を教えてください");
  await ensureOption(qSc1.id, "1", "20代", "20s", 1);
  await ensureOption(qSc1.id, "2", "30代", "30s", 2);

  const q1 = await ensureQuestion(mainSec.id, "Q1", "満足度を教えてください");
  await ensureOption(q1.id, "1", "満足", "good", 1);
  await ensureOption(q1.id, "2", "不満", "bad", 2);

  await ensureThread(q1.id);

  console.log("✅ Seed append done: surveyId", survey.id);
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
}); 