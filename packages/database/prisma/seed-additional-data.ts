import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./prisma/dev.db"
    }
  }
});

async function main() {
  console.log('🌱 Starting additional data seeding...');

  // 新しい調査票の作成
  const surveys = [
    {
      title: '食品宅配サービス利用実態調査',
      purpose: '食品宅配サービスの利用状況と満足度の把握',
      targetCondition: '全国\n20-60代\n男女\n食品宅配サービス利用経験者',
      analysisCondition: '利用頻度・利用理由・満足度・改善要望',
      researchMethod: 'オンライン調査',
      researchScale: '1000名'
    },
    {
      title: 'リモートワーク環境満足度調査',
      purpose: 'リモートワーク環境の現状と課題の特定',
      targetCondition: '全国\n20-50代\n男女\nリモートワーク実施者',
      analysisCondition: '環境満足度・課題・支援要望・生産性',
      researchMethod: 'オンライン調査',
      researchScale: '800名'
    },
    {
      title: 'スマートフォンアプリ利用行動調査',
      purpose: 'スマートフォンアプリの利用パターンとニーズの分析',
      targetCondition: '全国\n15-60代\n男女\nスマートフォン所有者',
      analysisCondition: '利用頻度・ジャンル別利用状況・課金意向',
      researchMethod: 'オンライン調査',
      researchScale: '1200名'
    },
    {
      title: 'サステナブル消費意識調査',
      purpose: '環境配慮型商品・サービスの認知と購買意向の把握',
      targetCondition: '全国\n20-70代\n男女\n一般消費者',
      analysisCondition: '環境意識・購買行動・価格感度・情報源',
      researchMethod: 'オンライン調査',
      researchScale: '1500名'
    }
  ];

  for (const surveyData of surveys) {
    const survey = await prisma.survey.create({
      data: surveyData
    });
    console.log(`✅ Created survey: ${survey.title}`);

    // スクリーニング設問の作成
    const screeningSections = [
      {
        title: '基本属性確認',
        phase: 'SCREENING',
        order: 1,
        questions: [
          {
            title: '年齢を教えてください',
            type: 'SINGLE_CHOICE',
            order: 1,
            required: true,
            options: [
              { text: '15-19歳', order: 1 },
              { text: '20-29歳', order: 2 },
              { text: '30-39歳', order: 3 },
              { text: '40-49歳', order: 4 },
              { text: '50-59歳', order: 5 },
              { text: '60-69歳', order: 6 },
              { text: '70歳以上', order: 7 }
            ]
          },
          {
            title: '性別を教えてください',
            type: 'SINGLE_CHOICE',
            order: 2,
            required: true,
            options: [
              { text: '男性', order: 1 },
              { text: '女性', order: 2 },
              { text: 'その他・回答しない', order: 3 }
            ]
          },
          {
            title: '居住地域を教えてください',
            type: 'SINGLE_CHOICE',
            order: 3,
            required: true,
            options: [
              { text: '北海道・東北', order: 1 },
              { text: '関東', order: 2 },
              { text: '中部', order: 3 },
              { text: '関西', order: 4 },
              { text: '中国・四国', order: 5 },
              { text: '九州・沖縄', order: 6 }
            ]
          }
        ]
      },
      {
        title: '対象者条件確認',
        phase: 'SCREENING',
        order: 2,
        questions: [
          {
            title: '該当するサービスを利用したことがありますか？',
            type: 'SINGLE_CHOICE',
            order: 1,
            required: true,
            options: [
              { text: 'はい、現在も利用している', order: 1 },
              { text: 'はい、過去に利用していた', order: 2 },
              { text: 'いいえ、利用したことがない', order: 3 }
            ]
          },
          {
            title: '利用頻度を教えてください（過去1年間）',
            type: 'SINGLE_CHOICE',
            order: 2,
            required: true,
            options: [
              { text: '週に1回以上', order: 1 },
              { text: '月に2-3回', order: 2 },
              { text: '月に1回程度', order: 3 },
              { text: '数ヶ月に1回', order: 4 },
              { text: '年1-2回', order: 5 }
            ]
          }
        ]
      }
    ];

    // 本調査設問の作成
    const mainSections = [
      {
        title: '利用状況・体験',
        phase: 'MAIN',
        order: 1,
        questions: [
          {
            title: '最も重視する要素は何ですか？（複数選択可）',
            type: 'MULTIPLE_CHOICE',
            order: 1,
            required: true,
            options: [
              { text: '価格の安さ', order: 1 },
              { text: '品質の高さ', order: 2 },
              { text: '配送の速さ', order: 3 },
              { text: '商品の種類の豊富さ', order: 4 },
              { text: 'アプリの使いやすさ', order: 5 },
              { text: 'カスタマーサポート', order: 6 }
            ]
          },
          {
            title: '現在の満足度を教えてください',
            type: 'SINGLE_CHOICE',
            order: 2,
            required: true,
            options: [
              { text: '非常に満足', order: 1 },
              { text: '満足', order: 2 },
              { text: 'どちらでもない', order: 3 },
              { text: '不満', order: 4 },
              { text: '非常に不満', order: 5 }
            ]
          },
          {
            title: '改善してほしい点を教えてください',
            type: 'TEXT',
            order: 3,
            required: false
          }
        ]
      },
      {
        title: '今後の利用意向',
        phase: 'MAIN',
        order: 2,
        questions: [
          {
            title: '今後も利用し続ける予定ですか？',
            type: 'SINGLE_CHOICE',
            order: 1,
            required: true,
            options: [
              { text: 'はい、継続する', order: 1 },
              { text: 'はい、条件が良ければ', order: 2 },
              { text: 'どちらでもない', order: 3 },
              { text: 'いいえ、利用を検討中', order: 4 },
              { text: 'いいえ、利用を中止する', order: 5 }
            ]
          },
          {
            title: '友人・家族に薦めますか？',
            type: 'SINGLE_CHOICE',
            order: 2,
            required: true,
            options: [
              { text: '強く薦める', order: 1 },
              { text: '薦める', order: 2 },
              { text: 'どちらでもない', order: 3 },
              { text: '薦めない', order: 4 },
              { text: '強く薦めない', order: 5 }
            ]
          }
        ]
      }
    ];

    // セクションと質問の作成
    for (const sectionData of [...screeningSections, ...mainSections]) {
      const section = await prisma.section.create({
        data: {
          surveyId: survey.id,
          phase: sectionData.phase,
          order: sectionData.order,
          title: sectionData.title
        }
      });
      console.log(`  ✅ Created section: ${section.title}`);

      for (const questionData of sectionData.questions) {
                  const question = await prisma.question.create({
            data: {
              sectionId: section.id,
              code: `Q${questionData.order}`,
              type: questionData.type,
              title: questionData.title,
              isRequired: questionData.required,
              order: questionData.order
            }
          });
        console.log(`    ✅ Created question: ${question.title}`);

        // 選択肢の作成
        if (questionData.options) {
          for (const optionData of questionData.options) {
            await prisma.option.create({
              data: {
                questionId: question.id,
                code: `O${optionData.order}`,
                label: optionData.text,
                value: optionData.text,
                order: optionData.order
              }
            });
          }
          console.log(`      ✅ Created ${questionData.options.length} options`);
        }
      }
    }
  }

  console.log('🎉 Additional data seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 