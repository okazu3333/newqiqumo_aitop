import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./prisma/dev.db"
    }
  }
});

async function main() {
  console.log('🔧 Starting section-question relationship fix...');

  // 既存のセクションを取得
  const sections = await prisma.section.findMany({
    include: {
      questions: true
    },
    orderBy: [
      { surveyId: 'asc' },
      { phase: 'asc' },
      { order: 'asc' }
    ]
  });

  console.log(`Found ${sections.length} sections`);

  for (const section of sections) {
    console.log(`\n📋 Processing section: ${section.title} (${section.phase})`);
    
    // 既存の質問がある場合はスキップ
    if (section.questions.length > 0) {
      console.log(`  ⏭️  Section already has ${section.questions.length} questions, skipping`);
      continue;
    }

    // セクションタイプに基づいて質問を作成
    if (section.phase === 'SCREENING') {
      if (section.title.includes('基本属性確認')) {
        await createBasicAttributeQuestions(section.id);
      } else if (section.title.includes('対象者条件確認')) {
        await createTargetConditionQuestions(section.id);
      } else if (section.title.includes('性別・年齢・居住地')) {
        await createDemographicQuestions(section.id);
      } else if (section.title.includes('未既婚')) {
        await createMaritalStatusQuestion(section.id);
      } else if (section.title.includes('子どもの有無')) {
        await createChildrenQuestion(section.id);
      } else if (section.title.includes('職業')) {
        await createOccupationQuestions(section.id);
      }
    } else if (section.phase === 'MAIN') {
      if (section.title.includes('利用状況・体験')) {
        await createUsageExperienceQuestions(section.id);
      } else if (section.title.includes('今後の利用意向')) {
        await createFutureIntentionQuestions(section.id);
      } else if (section.title.includes('男性化粧品の使用状況')) {
        await createCosmeticUsageQuestions(section.id);
      }
    }
  }

  console.log('\n🎉 Section-question relationship fix completed!');
}

async function createBasicAttributeQuestions(sectionId: number) {
  console.log('    📝 Creating basic attribute questions...');
  
  const questions = [
    {
      code: 'SC1',
      type: 'SA',
      title: '年齢を教えてください',
      order: 1,
      isRequired: true,
      config: '{}'
    },
    {
      code: 'SC2',
      type: 'SA',
      title: '性別を教えてください',
      order: 2,
      isRequired: true,
      config: '{}'
    },
    {
      code: 'SC3',
      type: 'SA',
      title: '居住地域を教えてください',
      order: 3,
      isRequired: true,
      config: '{}'
    }
  ];

  for (const questionData of questions) {
    const question = await prisma.question.create({
      data: {
        ...questionData,
        sectionId: sectionId
      }
    });

    // 選択肢を作成
    if (questionData.code === 'SC1') {
      await createAgeOptions(question.id);
    } else if (questionData.code === 'SC2') {
      await createGenderOptions(question.id);
    } else if (questionData.code === 'SC3') {
      await createRegionOptions(question.id);
    }
  }
}

async function createTargetConditionQuestions(sectionId: number) {
  console.log('    📝 Creating target condition questions...');
  
  const questions = [
    {
      code: 'SC4',
      type: 'SA',
      title: '該当するサービスを利用したことがありますか？',
      order: 1,
      isRequired: true,
      config: '{}'
    },
    {
      code: 'SC5',
      type: 'SA',
      title: '利用頻度を教えてください（過去1年間）',
      order: 2,
      isRequired: true,
      config: '{}'
    }
  ];

  for (const questionData of questions) {
    const question = await prisma.question.create({
      data: {
        ...questionData,
        sectionId: sectionId
      }
    });

    // 選択肢を作成
    if (questionData.code === 'SC4') {
      await createServiceUsageOptions(question.id);
    } else if (questionData.code === 'SC5') {
      await createUsageFrequencyOptions(question.id);
    }
  }
}

async function createUsageExperienceQuestions(sectionId: number) {
  console.log('    📝 Creating usage experience questions...');
  
  const questions = [
    {
      code: 'Q1',
      type: 'MA',
      title: '最も重視する要素は何ですか？（複数選択可）',
      order: 1,
      isRequired: true,
      config: '{}'
    },
    {
      code: 'Q2',
      type: 'SA',
      title: '現在の満足度を教えてください',
      order: 2,
      isRequired: true,
      config: '{}'
    },
    {
      code: 'Q3',
      type: 'FA',
      title: '改善してほしい点を教えてください',
      order: 3,
      isRequired: false,
      config: '{"maxLength": 500, "rows": 3}'
    }
  ];

  for (const questionData of questions) {
    const question = await prisma.question.create({
      data: {
        ...questionData,
        sectionId: sectionId
      }
    });

    // 選択肢を作成
    if (questionData.code === 'Q1') {
      await createImportantFactorsOptions(question.id);
    } else if (questionData.code === 'Q2') {
      await createSatisfactionOptions(question.id);
    }
  }
}

async function createFutureIntentionQuestions(sectionId: number) {
  console.log('    📝 Creating future intention questions...');
  
  const questions = [
    {
      code: 'Q4',
      type: 'SA',
      title: '今後も利用し続ける予定ですか？',
      order: 1,
      isRequired: true,
      config: '{}'
    },
    {
      code: 'Q5',
      type: 'SA',
      title: '友人・家族に薦めますか？',
      order: 2,
      isRequired: true,
      config: '{}'
    }
  ];

  for (const questionData of questions) {
    const question = await prisma.question.create({
      data: {
        ...questionData,
        sectionId: sectionId
      }
    });

    // 選択肢を作成
    if (questionData.code === 'Q4') {
      await createContinueUsageOptions(question.id);
    } else if (questionData.code === 'Q5') {
      await createRecommendOptions(question.id);
    }
  }
}

// 選択肢作成関数
async function createAgeOptions(questionId: number) {
  const options = [
    { code: '1', label: '15-19歳', value: '15-19', order: 1 },
    { code: '2', label: '20-29歳', value: '20-29', order: 2 },
    { code: '3', label: '30-39歳', value: '30-39', order: 3 },
    { code: '4', label: '40-49歳', value: '40-49', order: 4 },
    { code: '5', label: '50-59歳', value: '50-59', order: 5 },
    { code: '6', label: '60-69歳', value: '60-69', order: 6 },
    { code: '7', label: '70歳以上', value: '70+', order: 7 }
  ];

  for (const optionData of options) {
    await prisma.option.create({
      data: {
        questionId,
        ...optionData
      }
    });
  }
}

async function createGenderOptions(questionId: number) {
  const options = [
    { code: '1', label: '男性', value: 'male', order: 1 },
    { code: '2', label: '女性', value: 'female', order: 2 },
    { code: '3', label: 'その他・回答しない', value: 'other', order: 3 }
  ];

  for (const optionData of options) {
    await prisma.option.create({
      data: {
        questionId,
        ...optionData
      }
    });
  }
}

async function createRegionOptions(questionId: number) {
  const options = [
    { code: '1', label: '北海道・東北', value: 'hokkaido-tohoku', order: 1 },
    { code: '2', label: '関東', value: 'kanto', order: 2 },
    { code: '3', label: '中部', value: 'chubu', order: 3 },
    { code: '4', label: '関西', value: 'kansai', order: 4 },
    { code: '5', label: '中国・四国', value: 'chugoku-shikoku', order: 5 },
    { code: '6', label: '九州・沖縄', value: 'kyushu-okinawa', order: 6 }
  ];

  for (const optionData of options) {
    await prisma.option.create({
      data: {
        questionId,
        ...optionData
      }
    });
  }
}

async function createServiceUsageOptions(questionId: number) {
  const options = [
    { code: '1', label: 'はい、現在も利用している', value: 'current_user', order: 1 },
    { code: '2', label: 'はい、過去に利用していた', value: 'former_user', order: 2 },
    { code: '3', label: 'いいえ、利用したことがない', value: 'never_user', order: 3 }
  ];

  for (const optionData of options) {
    await prisma.option.create({
      data: {
        questionId,
        ...optionData
      }
    });
  }
}

async function createUsageFrequencyOptions(questionId: number) {
  const options = [
    { code: '1', label: '週に1回以上', value: 'weekly_plus', order: 1 },
    { code: '2', label: '月に2-3回', value: 'monthly_2_3', order: 2 },
    { code: '3', label: '月に1回程度', value: 'monthly_1', order: 3 },
    { code: '4', label: '数ヶ月に1回', value: 'few_months', order: 4 },
    { code: '5', label: '年1-2回', value: 'yearly_1_2', order: 5 }
  ];

  for (const optionData of options) {
    await prisma.option.create({
      data: {
        questionId,
        ...optionData
      }
    });
  }
}

async function createImportantFactorsOptions(questionId: number) {
  const options = [
    { code: '1', label: '価格の安さ', value: 'price', order: 1 },
    { code: '2', label: '品質の高さ', value: 'quality', order: 2 },
    { code: '3', label: '配送の速さ', value: 'speed', order: 3 },
    { code: '4', label: '商品の種類の豊富さ', value: 'variety', order: 4 },
    { code: '5', label: 'アプリの使いやすさ', value: 'usability', order: 5 },
    { code: '6', label: 'カスタマーサポート', value: 'support', order: 6 }
  ];

  for (const optionData of options) {
    await prisma.option.create({
      data: {
        questionId,
        ...optionData
      }
    });
  }
}

async function createSatisfactionOptions(questionId: number) {
  const options = [
    { code: '1', label: '非常に満足', value: 'very_satisfied', order: 1 },
    { code: '2', label: '満足', value: 'satisfied', order: 2 },
    { code: '3', label: 'どちらでもない', value: 'neutral', order: 3 },
    { code: '4', label: '不満', value: 'dissatisfied', order: 4 },
    { code: '5', label: '非常に不満', value: 'very_dissatisfied', order: 5 }
  ];

  for (const optionData of options) {
    await prisma.option.create({
      data: {
        questionId,
        ...optionData
      }
    });
  }
}

async function createContinueUsageOptions(questionId: number) {
  const options = [
    { code: '1', label: 'はい、継続する', value: 'continue', order: 1 },
    { code: '2', label: 'はい、条件が良ければ', value: 'continue_if_better', order: 2 },
    { code: '3', label: 'どちらでもない', value: 'neutral', order: 3 },
    { code: '4', label: 'いいえ、利用を検討中', value: 'considering_stop', order: 4 },
    { code: '5', label: 'いいえ、利用を中止する', value: 'stop', order: 5 }
  ];

  for (const optionData of options) {
    await prisma.option.create({
      data: {
        questionId,
        ...optionData
      }
    });
  }
}

async function createRecommendOptions(questionId: number) {
  const options = [
    { code: '1', label: '強く薦める', value: 'strongly_recommend', order: 1 },
    { code: '2', label: '薦める', value: 'recommend', order: 2 },
    { code: '3', label: 'どちらでもない', value: 'neutral', order: 3 },
    { code: '4', label: '薦めない', value: 'not_recommend', order: 4 },
    { code: '5', label: '強く薦めない', value: 'strongly_not_recommend', order: 5 }
  ];

  for (const optionData of options) {
    await prisma.option.create({
      data: {
        questionId,
        ...optionData
      }
    });
  }
}

// 既存の質問タイプ用の関数
async function createDemographicQuestions(sectionId: number) {
  console.log('    📝 Creating demographic questions...');
  // 既存の質問がある場合はスキップ
}

async function createMaritalStatusQuestion(sectionId: number) {
  console.log('    📝 Creating marital status question...');
  // 既存の質問がある場合はスキップ
}

async function createChildrenQuestion(sectionId: number) {
  console.log('    📝 Creating children question...');
  // 既存の質問がある場合はスキップ
}

async function createOccupationQuestions(sectionId: number) {
  console.log('    📝 Creating occupation questions...');
  // 既存の質問がある場合はスキップ
}

async function createCosmeticUsageQuestions(sectionId: number) {
  console.log('    📝 Creating cosmetic usage questions...');
  // 既存の質問がある場合はスキップ
}

main()
  .catch((e) => {
    console.error('❌ Error during fix:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 