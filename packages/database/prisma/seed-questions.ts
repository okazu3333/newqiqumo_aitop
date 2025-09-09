import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedQuestions(surveyId: number) {
  // スクリーニングセクション用の質問を作成
  const screeningSections = await prisma.section.findMany({
    where: { surveyId, phase: "SCREENING" },
    orderBy: { order: "asc" },
  });

  for (const section of screeningSections) {
    if (section.title.includes("未既婚")) {
      // 既婚状況の質問
      const q1 = await prisma.question.create({
        data: {
          sectionId: section.id,
          code: "SC1",
          type: "SA",
          title: "あなたは結婚していますか。",
          isRequired: true,
          order: 1,
        },
      });

      await prisma.option.createMany({
        data: [
          { questionId: q1.id, code: "1", label: "未婚", value: "1", order: 1 },
          {
            questionId: q1.id,
            code: "2",
            label: "既婚（離別・死別含む）",
            value: "2",
            order: 2,
          },
        ],
      });
    } else if (section.title.includes("子ども")) {
      // 同居人の質問
      const q2 = await prisma.question.create({
        data: {
          sectionId: section.id,
          code: "SC2",
          type: "MA",
          title: "あなたと同居している方をお知らせください。",
          isRequired: false,
          order: 1,
        },
      });

      await prisma.option.createMany({
        data: [
          {
            questionId: q2.id,
            code: "1",
            label: "自分のみ（一人暮らし）",
            value: "1",
            order: 1,
          },
          {
            questionId: q2.id,
            code: "2",
            label: "配偶者",
            value: "2",
            order: 2,
          },
          {
            questionId: q2.id,
            code: "3",
            label: "こども（未就学児）",
            value: "3",
            order: 3,
          },
          {
            questionId: q2.id,
            code: "4",
            label: "こども（小学生）",
            value: "4",
            order: 4,
          },
          {
            questionId: q2.id,
            code: "5",
            label: "こども（中高生）",
            value: "5",
            order: 5,
          },
          {
            questionId: q2.id,
            code: "6",
            label: "こども（高校生を除く18歳以上）",
            value: "6",
            order: 6,
          },
          {
            questionId: q2.id,
            code: "7",
            label: "自分（配偶者）の親",
            value: "7",
            order: 7,
          },
          {
            questionId: q2.id,
            code: "8",
            label: "自分（配偶者）の兄弟姉妹",
            value: "8",
            order: 8,
          },
          {
            questionId: q2.id,
            code: "9",
            label: "自分（配偶者）の祖父母",
            value: "9",
            order: 9,
          },
          {
            questionId: q2.id,
            code: "10",
            label: "その他",
            value: "10",
            order: 10,
          },
        ],
      });
    } else if (section.title.includes("職業")) {
      // 職業の質問
      const q3 = await prisma.question.create({
        data: {
          sectionId: section.id,
          code: "SC3",
          type: "SA",
          title: "あなたの職業を教えてください。",
          isRequired: true,
          order: 1,
        },
      });

      await prisma.option.createMany({
        data: [
          {
            questionId: q3.id,
            code: "1",
            label: "会社員",
            value: "1",
            order: 1,
          },
          {
            questionId: q3.id,
            code: "2",
            label: "公務員",
            value: "2",
            order: 2,
          },
          {
            questionId: q3.id,
            code: "3",
            label: "自営業",
            value: "3",
            order: 3,
          },
          { questionId: q3.id, code: "4", label: "学生", value: "4", order: 4 },
          {
            questionId: q3.id,
            code: "5",
            label: "主婦・主夫",
            value: "5",
            order: 5,
          },
          { questionId: q3.id, code: "6", label: "無職", value: "6", order: 6 },
          {
            questionId: q3.id,
            code: "7",
            label: "その他",
            value: "7",
            order: 7,
          },
        ],
      });
    }
  }

  // 本調査セクション用の質問を作成
  const mainSections = await prisma.section.findMany({
    where: { surveyId, phase: "MAIN" },
    orderBy: { order: "asc" },
  });

  for (const section of mainSections) {
    if (section.title.includes("使用状況")) {
      // 使用頻度の質問
      const q1 = await prisma.question.create({
        data: {
          sectionId: section.id,
          code: "Q1",
          type: "SA",
          title: "あなたはどのくらいの頻度で化粧品を使用しますか？",
          isRequired: true,
          order: 1,
        },
      });

      await prisma.option.createMany({
        data: [
          { questionId: q1.id, code: "1", label: "毎日", value: "1", order: 1 },
          {
            questionId: q1.id,
            code: "2",
            label: "週に数回",
            value: "2",
            order: 2,
          },
          {
            questionId: q1.id,
            code: "3",
            label: "月に数回",
            value: "3",
            order: 3,
          },
          {
            questionId: q1.id,
            code: "4",
            label: "ほとんど使用しない",
            value: "4",
            order: 4,
          },
        ],
      });

      // 使用金額の質問
      await prisma.question.create({
        data: {
          sectionId: section.id,
          code: "Q2",
          type: "NU",
          title: "1ヶ月あたりの化粧品にかける金額を教えてください。",
          suffix: "円",
          config: JSON.stringify({ minValue: 0, maxValue: 100000, step: 100 }),
          isRequired: false,
          order: 2,
        },
      });
    } else if (section.title.includes("種類")) {
      // 使用製品の質問
      const q3 = await prisma.question.create({
        data: {
          sectionId: section.id,
          code: "Q3",
          type: "MA",
          title: "あなたが使用している化粧品の種類を教えてください。",
          isRequired: false,
          order: 1,
        },
      });

      await prisma.option.createMany({
        data: [
          {
            questionId: q3.id,
            code: "1",
            label: "スキンケア用品",
            value: "1",
            order: 1,
          },
          {
            questionId: q3.id,
            code: "2",
            label: "洗顔料",
            value: "2",
            order: 2,
          },
          {
            questionId: q3.id,
            code: "3",
            label: "化粧水",
            value: "3",
            order: 3,
          },
          {
            questionId: q3.id,
            code: "4",
            label: "乳液・クリーム",
            value: "4",
            order: 4,
          },
          {
            questionId: q3.id,
            code: "5",
            label: "日焼け止め",
            value: "5",
            order: 5,
          },
          {
            questionId: q3.id,
            code: "6",
            label: "ヘアケア用品",
            value: "6",
            order: 6,
          },
        ],
      });
    } else if (section.title.includes("理由")) {
      // 使用理由の質問
      await prisma.question.create({
        data: {
          sectionId: section.id,
          code: "Q4",
          type: "FA",
          title: "化粧品を使用している理由を教えてください。",
          config: JSON.stringify({
            placeholder: "できるだけ詳しくお書きください",
            rows: 3,
            maxLength: 500,
          }),
          isRequired: false,
          order: 1,
        },
      });
    } else if (section.title.includes("購入")) {
      // 購入場所の質問
      const q5 = await prisma.question.create({
        data: {
          sectionId: section.id,
          code: "Q5",
          type: "SA",
          title: "化粧品の購入チャネルとして最もよく利用するのはどこですか？",
          isRequired: true,
          order: 1,
        },
      });

      await prisma.option.createMany({
        data: [
          {
            questionId: q5.id,
            code: "1",
            label: "ドラッグストア",
            value: "1",
            order: 1,
          },
          {
            questionId: q5.id,
            code: "2",
            label: "百貨店",
            value: "2",
            order: 2,
          },
          {
            questionId: q5.id,
            code: "3",
            label: "オンラインショップ",
            value: "3",
            order: 3,
          },
          {
            questionId: q5.id,
            code: "4",
            label: "コンビニエンスストア",
            value: "4",
            order: 4,
          },
          {
            questionId: q5.id,
            code: "5",
            label: "専門店",
            value: "5",
            order: 5,
          },
        ],
      });
    } else if (
      section.title.includes("改善点") ||
      section.title.includes("要望")
    ) {
      // 改善要望の質問
      await prisma.question.create({
        data: {
          sectionId: section.id,
          code: "Q6",
          type: "FA",
          title: "化粧品に期待する改善点や要望があれば教えてください。",
          config: JSON.stringify({
            placeholder: "自由にご記入ください",
            rows: 2,
            maxLength: 300,
          }),
          isRequired: false,
          order: 1,
        },
      });
    }
  }

  console.log(`Questions seeded for survey ${surveyId}`);
}

async function main() {
  // 既存の調査を取得
  const surveys = await prisma.survey.findMany({
    include: {
      sections: {
        include: {
          questions: true,
        },
      },
    },
  });

  for (const survey of surveys) {
    // すでに質問がある場合はスキップ
    const hasQuestions = survey.sections.some((s) => s.questions.length > 0);
    if (!hasQuestions) {
      console.log(`Seeding questions for survey ${survey.id}: ${survey.title}`);
      await seedQuestions(survey.id);
    } else {
      console.log(`Survey ${survey.id} already has questions, skipping...`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
