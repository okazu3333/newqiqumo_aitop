import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data in correct order (respect foreign key constraints)
  await prisma.review.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.section.deleteMany();
  await prisma.survey.deleteMany();

  // Create survey
  const survey = await prisma.survey.create({
    data: {
      title: "男性化粧品についての調査",
      purpose: "男性の使用率と使用している化粧品とその理由",
      targetCondition: "東京都、20代、男性、結婚の有無、子どもの有無",
      analysisCondition:
        "男性化粧品の使用状況（使用有無、頻度）、使用している化粧品の種類とブランド、化粧品を使用している理由（目的や期待する効果）、化粧品購入チャネル（購入方法、購入場所）、化粧品に期待する改善点や要望、今後も化粧品を使いたいと考えるか、その理由",
      researchMethod: "N/A",
      researchScale: "100万",
    },
  });

  console.log("📋 Created survey:", survey.id);

  // ===================
  // スクリーニングセクション
  // ===================

  // セクション1: 性別・年齢・居住地
  await prisma.section.create({
    data: {
      surveyId: survey.id,
      phase: "SCREENING",
      order: 1,
      title: "性別・年齢・居住地",
      questions: {
        create: [
          {
            code: "SC1",
            type: "SA",
            title: "あなたの性別を教えてください。",
            order: 1,
            isRequired: true,
            config: JSON.stringify({}),
            options: {
              create: [
                { code: "1", label: "男性", value: "male", order: 1 },
                { code: "2", label: "女性", value: "female", order: 2 },
                { code: "3", label: "その他", value: "other", order: 3 },
                {
                  code: "4",
                  label: "回答しない",
                  value: "no_answer",
                  order: 4,
                },
              ],
            },
          },
          {
            code: "SC2",
            type: "NU",
            title: "あなたの年齢を教えてください。",
            order: 2,
            isRequired: true,
            suffix: "歳",
            config: JSON.stringify({
              minValue: 0,
              maxValue: 120,
              step: 1,
            }),
          },
          {
            code: "SC3",
            type: "SA",
            title: "あなたのお住まい（都道府県）を教えてください。",
            order: 3,
            isRequired: true,
            config: JSON.stringify({}),
            options: {
              create: [
                { code: "1", label: "北海道", value: "hokkaido", order: 1 },
                { code: "2", label: "青森県", value: "aomori", order: 2 },
                { code: "3", label: "岩手県", value: "iwate", order: 3 },
                { code: "4", label: "宮城県", value: "miyagi", order: 4 },
                { code: "5", label: "秋田県", value: "akita", order: 5 },
                { code: "6", label: "山形県", value: "yamagata", order: 6 },
                { code: "7", label: "福島県", value: "fukushima", order: 7 },
                { code: "8", label: "茨城県", value: "ibaraki", order: 8 },
                { code: "9", label: "栃木県", value: "tochigi", order: 9 },
                { code: "10", label: "群馬県", value: "gunma", order: 10 },
                { code: "11", label: "埼玉県", value: "saitama", order: 11 },
                { code: "12", label: "千葉県", value: "chiba", order: 12 },
                { code: "13", label: "東京都", value: "tokyo", order: 13 },
                { code: "14", label: "神奈川県", value: "kanagawa", order: 14 },
                { code: "15", label: "新潟県", value: "niigata", order: 15 },
                { code: "16", label: "富山県", value: "toyama", order: 16 },
                { code: "17", label: "石川県", value: "ishikawa", order: 17 },
                { code: "18", label: "福井県", value: "fukui", order: 18 },
                { code: "19", label: "山梨県", value: "yamanashi", order: 19 },
                { code: "20", label: "長野県", value: "nagano", order: 20 },
                { code: "21", label: "岐阜県", value: "gifu", order: 21 },
                { code: "22", label: "静岡県", value: "shizuoka", order: 22 },
                { code: "23", label: "愛知県", value: "aichi", order: 23 },
                { code: "24", label: "三重県", value: "mie", order: 24 },
                { code: "25", label: "滋賀県", value: "shiga", order: 25 },
                { code: "26", label: "京都府", value: "kyoto", order: 26 },
                { code: "27", label: "大阪府", value: "osaka", order: 27 },
                { code: "28", label: "兵庫県", value: "hyogo", order: 28 },
                { code: "29", label: "奈良県", value: "nara", order: 29 },
                { code: "30", label: "和歌山県", value: "wakayama", order: 30 },
                { code: "31", label: "鳥取県", value: "tottori", order: 31 },
                { code: "32", label: "島根県", value: "shimane", order: 32 },
                { code: "33", label: "岡山県", value: "okayama", order: 33 },
                { code: "34", label: "広島県", value: "hiroshima", order: 34 },
                { code: "35", label: "山口県", value: "yamaguchi", order: 35 },
                { code: "36", label: "徳島県", value: "tokushima", order: 36 },
                { code: "37", label: "香川県", value: "kagawa", order: 37 },
                { code: "38", label: "愛媛県", value: "ehime", order: 38 },
                { code: "39", label: "高知県", value: "kochi", order: 39 },
                { code: "40", label: "福岡県", value: "fukuoka", order: 40 },
                { code: "41", label: "佐賀県", value: "saga", order: 41 },
                { code: "42", label: "長崎県", value: "nagasaki", order: 42 },
                { code: "43", label: "熊本県", value: "kumamoto", order: 43 },
                { code: "44", label: "大分県", value: "oita", order: 44 },
                { code: "45", label: "宮崎県", value: "miyazaki", order: 45 },
                {
                  code: "46",
                  label: "鹿児島県",
                  value: "kagoshima",
                  order: 46,
                },
                { code: "47", label: "沖縄県", value: "okinawa", order: 47 },
              ],
            },
          },
        ],
      },
    },
  });

  // セクション2: 未既婚
  await prisma.section.create({
    data: {
      surveyId: survey.id,
      phase: "SCREENING",
      order: 2,
      title: "未既婚",
      questions: {
        create: {
          code: "SC4",
          type: "SA",
          title: "あなたは結婚していますか？",
          order: 1,
          isRequired: true,
          config: JSON.stringify({}),
          options: {
            create: [
              { code: "1", label: "既婚", value: "married", order: 1 },
              { code: "2", label: "未婚", value: "single", order: 2 },
              { code: "3", label: "離婚", value: "divorced", order: 3 },
              { code: "4", label: "死別", value: "widowed", order: 4 },
            ],
          },
        },
      },
    },
  });

  // セクション3: 子どもの有無
  await prisma.section.create({
    data: {
      surveyId: survey.id,
      phase: "SCREENING",
      order: 3,
      title: "子どもの有無",
      questions: {
        create: {
          code: "SC5",
          type: "MA",
          title: "あなたと同居している方をお知らせください",
          order: 1,
          isRequired: true,
          config: JSON.stringify({ multipleLimit: 10 }),
          options: {
            create: [
              { code: "1", label: "配偶者", value: "spouse", order: 1 },
              {
                code: "2",
                label: "子ども（未就学児）",
                value: "child_preschool",
                order: 2,
              },
              {
                code: "3",
                label: "子ども（小学生）",
                value: "child_elementary",
                order: 3,
              },
              {
                code: "4",
                label: "子ども（中学生）",
                value: "child_junior_high",
                order: 4,
              },
              {
                code: "5",
                label: "子ども（高校生）",
                value: "child_high_school",
                order: 5,
              },
              {
                code: "6",
                label: "子ども（大学生・専門学生）",
                value: "child_college",
                order: 6,
              },
              {
                code: "7",
                label: "子ども（社会人）",
                value: "child_working",
                order: 7,
              },
              { code: "8", label: "両親", value: "parents", order: 8 },
              { code: "9", label: "兄弟姉妹", value: "siblings", order: 9 },
              {
                code: "10",
                label: "その他の親族",
                value: "other_relatives",
                order: 10,
              },
              {
                code: "99",
                label: "同居している人はいない（一人暮らし）",
                value: "living_alone",
                order: 99,
              },
            ],
          },
        },
      },
    },
  });

  // セクション4: 職業
  await prisma.section.create({
    data: {
      surveyId: survey.id,
      phase: "SCREENING",
      order: 4,
      title: "職業",
      questions: {
        create: [
          {
            code: "SC6",
            type: "SA",
            title: "あなたの職業を教えてください",
            order: 1,
            isRequired: true,
            config: JSON.stringify({}),
            options: {
              create: [
                {
                  code: "1",
                  label: "会社員（正社員）",
                  value: "fulltime_employee",
                  order: 1,
                },
                {
                  code: "2",
                  label: "会社員（契約・派遣）",
                  value: "contract_employee",
                  order: 2,
                },
                {
                  code: "3",
                  label: "公務員",
                  value: "public_servant",
                  order: 3,
                },
                {
                  code: "4",
                  label: "自営業・フリーランス",
                  value: "self_employed",
                  order: 4,
                },
                {
                  code: "5",
                  label: "会社役員・経営者",
                  value: "executive",
                  order: 5,
                },
                {
                  code: "6",
                  label: "パート・アルバイト",
                  value: "parttime",
                  order: 6,
                },
                {
                  code: "7",
                  label: "専業主婦・主夫",
                  value: "homemaker",
                  order: 7,
                },
                { code: "8", label: "学生", value: "student", order: 8 },
                { code: "9", label: "無職", value: "unemployed", order: 9 },
                { code: "10", label: "その他", value: "other", order: 10 },
              ],
            },
          },
          {
            code: "SC7",
            type: "MA",
            title: "あなたのご家族の職業を教えてください",
            order: 2,
            isRequired: false,
            config: JSON.stringify({ multipleLimit: 5 }),
            respondentCondition: "SC5!=99", // 一人暮らしでない場合のみ
            options: {
              create: [
                {
                  code: "1",
                  label: "会社員（正社員）",
                  value: "fulltime_employee",
                  order: 1,
                },
                {
                  code: "2",
                  label: "会社員（契約・派遣）",
                  value: "contract_employee",
                  order: 2,
                },
                {
                  code: "3",
                  label: "公務員",
                  value: "public_servant",
                  order: 3,
                },
                {
                  code: "4",
                  label: "自営業・フリーランス",
                  value: "self_employed",
                  order: 4,
                },
                {
                  code: "5",
                  label: "会社役員・経営者",
                  value: "executive",
                  order: 5,
                },
                {
                  code: "6",
                  label: "パート・アルバイト",
                  value: "parttime",
                  order: 6,
                },
                {
                  code: "7",
                  label: "専業主婦・主夫",
                  value: "homemaker",
                  order: 7,
                },
                { code: "8", label: "学生", value: "student", order: 8 },
                { code: "9", label: "無職", value: "unemployed", order: 9 },
                { code: "10", label: "退職者", value: "retired", order: 10 },
                {
                  code: "99",
                  label: "該当なし",
                  value: "not_applicable",
                  order: 99,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ===================
  // 本調査セクション
  // ===================

  // セクション5: 男性化粧品の使用状況
  await prisma.section.create({
    data: {
      surveyId: survey.id,
      phase: "MAIN",
      order: 1,
      title: "男性化粧品の使用状況（使用有無、頻度）",
      questions: {
        create: [
          {
            code: "Q1",
            type: "SA",
            title: "あなたは男性用化粧品を使用していますか？",
            order: 1,
            isRequired: true,
            config: JSON.stringify({}),
            options: {
              create: [
                {
                  code: "1",
                  label: "現在使用している",
                  value: "currently_using",
                  order: 1,
                },
                {
                  code: "2",
                  label: "過去に使用していたが、現在は使用していない",
                  value: "used_before",
                  order: 2,
                },
                {
                  code: "3",
                  label: "使用したことがない",
                  value: "never_used",
                  order: 3,
                },
              ],
            },
          },
          {
            code: "Q2",
            type: "MA",
            title: "現在使用している男性用化粧品の種類を全て選択してください",
            order: 2,
            isRequired: true,
            config: JSON.stringify({ multipleLimit: 15 }),
            respondentCondition: "Q1==1", // 現在使用している人のみ
            options: {
              create: [
                { code: "1", label: "洗顔料", value: "face_wash", order: 1 },
                { code: "2", label: "化粧水", value: "toner", order: 2 },
                { code: "3", label: "乳液", value: "emulsion", order: 3 },
                { code: "4", label: "美容液", value: "serum", order: 4 },
                { code: "5", label: "クリーム", value: "cream", order: 5 },
                {
                  code: "6",
                  label: "オールインワンジェル",
                  value: "all_in_one",
                  order: 6,
                },
                {
                  code: "7",
                  label: "日焼け止め",
                  value: "sunscreen",
                  order: 7,
                },
                { code: "8", label: "BBクリーム", value: "bb_cream", order: 8 },
                {
                  code: "9",
                  label: "コンシーラー",
                  value: "concealer",
                  order: 9,
                },
                {
                  code: "10",
                  label: "ファンデーション",
                  value: "foundation",
                  order: 10,
                },
                {
                  code: "11",
                  label: "リップクリーム",
                  value: "lip_balm",
                  order: 11,
                },
                {
                  code: "12",
                  label: "ヘアワックス・ジェル",
                  value: "hair_wax",
                  order: 12,
                },
                {
                  code: "13",
                  label: "ヘアスプレー",
                  value: "hair_spray",
                  order: 13,
                },
                {
                  code: "14",
                  label: "香水・フレグランス",
                  value: "perfume",
                  order: 14,
                },
                { code: "99", label: "その他", value: "other", order: 99 },
              ],
            },
          },
          {
            code: "Q3",
            type: "SA",
            title: "男性用化粧品を使用する頻度を教えてください",
            order: 3,
            isRequired: true,
            config: JSON.stringify({}),
            respondentCondition: "Q1==1", // 現在使用している人のみ
            options: {
              create: [
                { code: "1", label: "毎日", value: "daily", order: 1 },
                {
                  code: "2",
                  label: "週に4-6回",
                  value: "4_6_per_week",
                  order: 2,
                },
                {
                  code: "3",
                  label: "週に2-3回",
                  value: "2_3_per_week",
                  order: 3,
                },
                {
                  code: "4",
                  label: "週に1回程度",
                  value: "once_per_week",
                  order: 4,
                },
                {
                  code: "5",
                  label: "月に2-3回",
                  value: "2_3_per_month",
                  order: 5,
                },
                {
                  code: "6",
                  label: "月に1回程度",
                  value: "once_per_month",
                  order: 6,
                },
                {
                  code: "7",
                  label: "それ以下",
                  value: "less_frequent",
                  order: 7,
                },
              ],
            },
          },
          {
            code: "Q4",
            type: "NU",
            title: "男性用化粧品に月々どのくらいの金額を使っていますか？",
            order: 4,
            isRequired: true,
            prefix: "￥",
            suffix: "円",
            config: JSON.stringify({
              minValue: 0,
              maxValue: 100000,
              step: 100,
            }),
            respondentCondition: "Q1==1", // 現在使用している人のみ
          },
          {
            code: "Q5",
            type: "MA",
            title: "男性用化粧品を購入する場所を全て選択してください",
            order: 5,
            isRequired: true,
            config: JSON.stringify({ multipleLimit: 10 }),
            respondentCondition: "Q1==1", // 現在使用している人のみ
            options: {
              create: [
                {
                  code: "1",
                  label: "ドラッグストア",
                  value: "drugstore",
                  order: 1,
                },
                {
                  code: "2",
                  label: "コンビニエンスストア",
                  value: "convenience_store",
                  order: 2,
                },
                {
                  code: "3",
                  label: "デパート・百貨店",
                  value: "department_store",
                  order: 3,
                },
                {
                  code: "4",
                  label: "専門店（ロフト、東急ハンズなど）",
                  value: "specialty_store",
                  order: 4,
                },
                {
                  code: "5",
                  label: "スーパーマーケット",
                  value: "supermarket",
                  order: 5,
                },
                {
                  code: "6",
                  label: "オンラインショップ（Amazon、楽天など）",
                  value: "online_shop",
                  order: 6,
                },
                {
                  code: "7",
                  label: "ブランド公式サイト",
                  value: "brand_official",
                  order: 7,
                },
                {
                  code: "8",
                  label: "定期購入サービス",
                  value: "subscription",
                  order: 8,
                },
                { code: "99", label: "その他", value: "other", order: 99 },
              ],
            },
          },
          {
            code: "Q6",
            type: "SA",
            title: "男性用化粧品を使い始めたきっかけは何ですか？",
            order: 6,
            isRequired: true,
            config: JSON.stringify({}),
            respondentCondition: "Q1==1 OR Q1==2", // 現在または過去に使用
            options: {
              create: [
                {
                  code: "1",
                  label: "肌荒れ・肌トラブルの改善のため",
                  value: "skin_trouble",
                  order: 1,
                },
                {
                  code: "2",
                  label: "身だしなみ・エチケットとして",
                  value: "grooming",
                  order: 2,
                },
                {
                  code: "3",
                  label: "アンチエイジング・若々しさの維持",
                  value: "anti_aging",
                  order: 3,
                },
                {
                  code: "4",
                  label: "恋人・配偶者の勧め",
                  value: "partner_recommendation",
                  order: 4,
                },
                {
                  code: "5",
                  label: "友人・知人の勧め",
                  value: "friend_recommendation",
                  order: 5,
                },
                {
                  code: "6",
                  label: "SNS・インフルエンサーの影響",
                  value: "sns_influence",
                  order: 6,
                },
                {
                  code: "7",
                  label: "仕事上の必要性",
                  value: "work_necessity",
                  order: 7,
                },
                { code: "99", label: "その他", value: "other", order: 99 },
              ],
            },
          },
          {
            code: "Q7",
            type: "FA",
            title:
              "男性用化粧品についてのご意見や要望があれば自由にお書きください",
            order: 7,
            isRequired: false,
            config: JSON.stringify({
              maxLength: 500,
              rows: 5,
              placeholder: "ご自由にお書きください（500文字以内）",
            }),
          },
        ],
      },
    },
  });

  // ===================
  // スレッドとレビューのシードデータ
  // ===================

  // スクリーニング質問を取得
  const sc1 = await prisma.question.findFirst({ where: { code: "SC1" } });
  const sc2 = await prisma.question.findFirst({ where: { code: "SC2" } });
  const sc3 = await prisma.question.findFirst({ where: { code: "SC3" } });
  const sc4 = await prisma.question.findFirst({ where: { code: "SC4" } });
  const sc5 = await prisma.question.findFirst({ where: { code: "SC5" } });
  const sc6 = await prisma.question.findFirst({ where: { code: "SC6" } });
  const sc7 = await prisma.question.findFirst({ where: { code: "SC7" } });

  // 本調査質問を取得
  const q1 = await prisma.question.findFirst({ where: { code: "Q1" } });
  const q2 = await prisma.question.findFirst({ where: { code: "Q2" } });
  const q3 = await prisma.question.findFirst({ where: { code: "Q3" } });
  const q4 = await prisma.question.findFirst({ where: { code: "Q4" } });
  const q5 = await prisma.question.findFirst({ where: { code: "Q5" } });
  const q6 = await prisma.question.findFirst({ where: { code: "Q6" } });
  const q7 = await prisma.question.findFirst({ where: { code: "Q7" } });
  const q8 = await prisma.question.findFirst({ where: { code: "Q8" } });

  // ===================
  // スクリーニング質問のAIレビューのスレッド
  // ===================

  // AI-SC1: SC1（性別）に関するAIレビュー
  if (sc1) {
    await prisma.thread.create({
      data: {
        questionId: sc1.id,
        x: 10,
        y: 15,
        createdBy: "AIレビュー",
        message:
          "性別の選択肢について、最新のガイドラインでは『その他』と『回答しない』の選択肢が含まれており、多様性への配慮が見られます。ただし、男性化粧品の調査なので、男性のみをターゲットにする場合は、スクリーニング条件を明確にすることをお勧めします。",
        isCompleted: false,
        type: "ai",
        reviews: {
          create: [
            {
              message:
                "確かに、男性化粧品の調査なので、SC1で男性以外を選択した場合の除外ロジックを追加する必要がありますね。",
              createdBy: "山田太郎",
            },
          ],
        },
      },
    });
  }

  // AI-SC2: SC2（年齢）に関するAIレビュー
  if (sc2) {
    await prisma.thread.create({
      data: {
        questionId: sc2.id,
        x: 25,
        y: 30,
        createdBy: "AIレビュー",
        message:
          "年齢の入力方式が数値入力になっていますが、ターゲット条件で『20代』と指定されています。20-29歳以外の回答者を除外するロジックの追加、または年代選択式への変更を検討してください。",
        isCompleted: false,
        type: "ai",
      },
    });
  }

  // AI-SC3: SC3（居住地）に関するAIレビュー
  if (sc3) {
    await prisma.thread.create({
      data: {
        questionId: sc3.id,
        x: 40,
        y: 20,
        createdBy: "AIレビュー",
        message:
          "都道府県の選択肢が完備されていて良いですが、ターゲット条件が『東京都』となっています。東京都以外を選択した場合のスクリーニングアウトのロジックを設定する必要があります。",
        isCompleted: true,
        type: "ai",
        reviews: {
          create: [
            {
              message:
                "ロジック設定を追加しました。東京都以外は調査対象外となります。",
              createdBy: "鈴木一郎",
            },
          ],
        },
      },
    });
  }

  // AI-SC5: SC5（同居者）に関するAIレビュー
  if (sc5) {
    await prisma.thread.create({
      data: {
        questionId: sc5.id,
        x: 15,
        y: 45,
        createdBy: "AIレビュー",
        message:
          "複数回答形式で同居者を尋ねていますが、『一人暮らし』の選択肢と他の選択肢を同時に選択できないよう、排他制御の設定が必要です。",
        isCompleted: false,
        type: "ai",
        reviews: {
          create: [
            {
              message: "重要な指摘です。排他オプションの設定を追加します。",
              createdBy: "佐藤次郎",
            },
          ],
        },
      },
    });
  }

  // AI-SC7: SC7（家族の職業）に関するAIレビュー
  if (sc7) {
    await prisma.thread.create({
      data: {
        questionId: sc7.id,
        x: 30,
        y: 35,
        createdBy: "AIレビュー",
        message:
          "回答者条件が『SC5!=99』と設定されていますが、この条件式が正しく機能するか確認が必要です。また、家族の職業が男性化粧品の使用とどう関連するか、調査目的との整合性を再検討することをお勧めします。",
        isCompleted: false,
        type: "ai",
      },
    });
  }

  // ===================
  // スクリーニング質問のチームレビューのスレッド
  // ===================

  // Team-SC1: SC1（性別）に関するチームレビュー
  if (sc1) {
    await prisma.thread.create({
      data: {
        questionId: sc1.id,
        x: 50,
        y: 10,
        createdBy: "高橋花子",
        message:
          "男性化粧品の調査なのに、女性も回答できるようになっています。最初から男性のみに絞った方が効率的ではないでしょうか？",
        isCompleted: false,
        type: "team",
        reviews: {
          create: [
            {
              message:
                "将来的に女性の視点も必要になる可能性があるので、データとして収集しておくのも良いかもしれません。",
              createdBy: "山田太郎",
            },
            {
              message:
                "それなら、調査の目的を明確にして、必要に応じて条件分岐を設定しましょう。",
              createdBy: "鈴木一郎",
            },
          ],
        },
      },
    });
  }

  // Team-SC4: SC4（結婚状況）に関するチームレビュー
  if (sc4) {
    await prisma.thread.create({
      data: {
        questionId: sc4.id,
        x: 20,
        y: 55,
        createdBy: "田中次郎",
        message:
          "結婚状況が男性化粧品の使用にどう影響するか、仮説を明確にした方が良いと思います。配偶者の影響などを想定しているのでしょうか？",
        isCompleted: false,
        type: "team",
        reviews: {
          create: [
            {
              message:
                "Q6の選択肢に『恋人・配偶者の勧め』があるので、関連性はありそうです。",
              createdBy: "佐藤花子",
            },
          ],
        },
      },
    });
  }

  // Team-SC5: SC5（同居者）に関するチームレビュー
  if (sc5) {
    await prisma.thread.create({
      data: {
        questionId: sc5.id,
        x: 35,
        y: 40,
        createdBy: "山田花子",
        message:
          "子どもの年齢層が細かく分かれていますが、分析時に統合することも考えて、もう少しシンプルにしても良いのではないでしょうか？",
        isCompleted: true,
        type: "team",
        reviews: {
          create: [
            {
              message:
                "確かに細かすぎるかもしれません。『未成年の子ども』『成人の子ども』の2区分でも十分かもしれませんね。",
              createdBy: "高橋太郎",
            },
            {
              message: "修正しました。分析がしやすくなると思います。",
              createdBy: "田中次郎",
            },
          ],
        },
      },
    });
  }

  // Team-SC6: SC6（職業）に関するチームレビュー
  if (sc6) {
    await prisma.thread.create({
      data: {
        questionId: sc6.id,
        x: 45,
        y: 25,
        createdBy: "佐藤花子",
        message:
          "『学生』の選択肢がありますが、ターゲットが20代男性なので、大学生・大学院生・専門学校生など、もう少し詳細に分けた方が分析に役立つかもしれません。",
        isCompleted: false,
        type: "team",
      },
    });
  }

  // ===================
  // 本調査質問のAIレビューのスレッド
  // ===================

  // AI-1: Q1に関するAIレビュー
  if (q1) {
    await prisma.thread.create({
      data: {
        questionId: q1.id,
        x: 15,
        y: 10,
        createdBy: "AIレビュー",
        message:
          "スクリーニング設問の1問目で、回答者の性別を尋ねています。設問タイプは単一選択で問題ないと考えられますが、LGBTQの人々の存在を考慮して、選択肢には「男性」「女性」以外に、「その他」や「答えたくない」もあると望ましいです。",
        isCompleted: false,
        type: "ai",
        reviews: {
          create: [
            {
              message:
                "AIの指摘は適切だと思います。多様性を考慮した選択肢を追加しましょう。",
              createdBy: "山田花子",
            },
          ],
        },
      },
    });
  }

  // AI-2: Q2に関するAIレビュー（カバレッジ検証）
  if (q2) {
    await prisma.thread.create({
      data: {
        questionId: q2.id,
        x: 80,
        y: 20,
        createdBy: "AIレビュー",
        message:
          "前の設問からジャンプ条件が設定されておらず、この設問に辿り着けませんでした。Q1で「使用していない」を選択した場合のロジック設定を確認してください。",
        isCompleted: false,
        type: "ai",
      },
    });
  }

  // AI-3: Q3に関するAIレビュー（文言の一貫性）
  if (q3) {
    await prisma.thread.create({
      data: {
        questionId: q3.id,
        x: 20,
        y: 30,
        createdBy: "AIレビュー",
        message:
          "他の設問では「教えてください」ですが、この設問では「お教えください」になっています。文言を統一することをお勧めします。",
        isCompleted: true,
        type: "ai",
        reviews: {
          create: [
            {
              message: "修正しました。全て「教えてください」に統一しました。",
              createdBy: "鈴木一郎",
            },
          ],
        },
      },
    });
  }

  // AI-4: Q5に関するAIレビュー（選択肢の網羅性）
  if (q5) {
    await prisma.thread.create({
      data: {
        questionId: q5.id,
        x: 12,
        y: 15,
        createdBy: "AIレビュー",
        message:
          "購入チャネルの選択肢に「ドラッグストア」「オンラインショップ」がありますが、「定期購入サービス」も近年増えているため、追加を検討してください。",
        isCompleted: false,
        type: "ai",
      },
    });
  }

  // AI-5: Q8に関するAIレビュー（必須項目の確認）
  if (q8) {
    await prisma.thread.create({
      data: {
        questionId: q8.id,
        x: 18,
        y: 25,
        createdBy: "AIレビュー",
        message:
          "自由記述の設問ですが、必須回答にすると離脱率が上がる可能性があります。任意回答にすることを推奨します。",
        isCompleted: false,
        type: "ai",
        reviews: {
          create: [
            {
              message:
                "同意見です。最後の設問なので、任意にして回答率を上げた方が良いですね。",
              createdBy: "佐藤次郎",
            },
          ],
        },
      },
    });
  }

  // ===================
  // チームレビューのスレッド
  // ===================

  // Team-1: Q1に関するチームレビュー
  if (q1) {
    await prisma.thread.create({
      data: {
        questionId: q1.id,
        x: 25,
        y: 40,
        createdBy: "田中太郎",
        message:
          "「興味はあるが使用していない」という選択肢を追加した方が、潜在顧客の把握に役立つのではないでしょうか？",
        isCompleted: false,
        type: "team",
        reviews: {
          create: [
            {
              message:
                "良いアイデアです。マーケティング戦略を考える上で重要なデータになりそうです。",
              createdBy: "山田花子",
            },
            {
              message: "賛成です。追加しましょう。",
              createdBy: "高橋次郎",
            },
          ],
        },
      },
    });
  }

  // Team-2: Q2に関するチームレビュー
  if (q2) {
    await prisma.thread.create({
      data: {
        questionId: q2.id,
        x: 30,
        y: 50,
        createdBy: "山田花子",
        message:
          "選択肢の順序を使用頻度の高い順に並べ替えた方が回答しやすいと思います。",
        isCompleted: false,
        type: "team",
      },
    });
  }

  // Team-3: Q4に関するチームレビュー
  if (q4) {
    await prisma.thread.create({
      data: {
        questionId: q4.id,
        x: 15,
        y: 20,
        createdBy: "佐藤次郎",
        message:
          "金額の入力欄に「約」を付けた方が、概算でも答えやすくなるのではないでしょうか？",
        isCompleted: true,
        type: "team",
        reviews: {
          create: [
            {
              message: "確かにその通りですね。修正しました。",
              createdBy: "田中太郎",
            },
          ],
        },
      },
    });
  }

  // Team-4: Q6に関するチームレビュー
  if (q6) {
    await prisma.thread.create({
      data: {
        questionId: q6.id,
        x: 10,
        y: 35,
        createdBy: "高橋次郎",
        message:
          "「その他」の選択肢に自由記述欄を追加すると、想定外の回答も収集できて良いと思います。",
        isCompleted: false,
        type: "team",
        reviews: {
          create: [
            {
              message:
                "賛成です。新しい購入決定要因を発見できるかもしれません。",
              createdBy: "山田花子",
            },
            {
              message: "実装方法を検討してみます。",
              createdBy: "鈴木一郎",
            },
          ],
        },
      },
    });
  }

  // Team-5: Q7に関するチームレビュー
  if (q7) {
    await prisma.thread.create({
      data: {
        questionId: q7.id,
        x: 20,
        y: 45,
        createdBy: "鈴木一郎",
        message:
          "質問文が長すぎるので、もう少し簡潔にした方が回答者の負担が減ると思います。",
        isCompleted: false,
        type: "team",
      },
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log(`Created ${await prisma.survey.count()} surveys`);
  console.log(`Created ${await prisma.section.count()} sections`);
  console.log(`Created ${await prisma.question.count()} questions`);
  console.log(`Created ${await prisma.option.count()} options`);
  console.log(`Created ${await prisma.thread.count()} threads`);
  console.log(`Created ${await prisma.review.count()} reviews`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
