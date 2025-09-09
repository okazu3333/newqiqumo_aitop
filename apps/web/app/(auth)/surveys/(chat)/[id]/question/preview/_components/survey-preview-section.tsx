/** biome-ignore-all lint/suspicious/noExplicitAny: so many any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  type Section,
  SurveySectionCard,
} from "@/app/(auth)/_components/survey-section-card";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Data for screening survey questions
const screeningSections: Section[] = [
  {
    id: "fixed",
    title: "固定セクション：性別・年齢・居住地",
    questions: [
      {
        id: "q1",
        number: "Q1",
        type: "SA・単一選択方式",
        isFixed: true,
        question: "あなたの性別を教えてください。",
        options: [
          { id: "1", label: "男性" },
          { id: "2", label: "女性" },
        ],
      },
      {
        id: "q2",
        number: "Q2",
        type: "NU・数値回答形式",
        isFixed: true,
        question: "あなたの年齢を教えてください。",
        suffix: "歳",
      },
      {
        id: "q3",
        number: "Q3",
        type: "SA・単一選択方式",
        isFixed: true,
        question: "あなたのお住まい（都道府県）を教えてください。",
        placeholder: "47都道府県",
      },
    ],
  },
  {
    id: "marital",
    title: "セクション：未既婚",
    questions: [
      {
        id: "q4",
        number: "Q4",
        type: "SA・単一選択方式",
        isFixed: false,
        question: "あなたは結婚していますか。",
        options: [
          { id: "1", label: "未婚" },
          { id: "2", label: "既婚（離別・死別含む）" },
        ],
      },
    ],
  },
  {
    id: "children",
    title: "セクション：子どもの有無",
    questions: [
      {
        id: "q5",
        number: "Q5",
        type: "MA・複数選択方式",
        isFixed: false,
        question: "あなたと同居している方をお知らせください。",
        options: [
          { id: "1", label: "自分のみ（一人暮らし）" },
          { id: "2", label: "配偶者" },
          { id: "3", label: "こども（未就学児）" },
          { id: "4", label: "こども（小学生）" },
          { id: "5", label: "こども（中高生）" },
          { id: "6", label: "こども（高校生を除く18歳以上）" },
          { id: "7", label: "自分（配偶者）の親" },
          { id: "8", label: "自分（配偶者）の兄弟姉妹" },
          { id: "9", label: "自分（配偶者）の祖父母" },
          { id: "10", label: "その他" },
        ],
      },
    ],
  },
];

// Data for main survey questions
const mainSurveySections: Section[] = [
  {
    id: "cosmetics-usage-1",
    title: "セクション：男性化粧品の使用状況（使用有無、頻度）",
    questions: [
      {
        id: "q8",
        number: "Q8",
        type: "SA・単一選択方式",
        isFixed: false,
        question: "あなたはどのくらいの頻度で化粧品を使用しますか？",
        options: [
          { id: "1", label: "毎日" },
          { id: "2", label: "週に数回" },
          { id: "3", label: "月に数回" },
          { id: "4", label: "ほとんど使用しない" },
        ],
      },
      {
        id: "q9",
        number: "Q9",
        type: "GR・グループ選択",
        isFixed: false,
        question: "あなたが使用している化粧品の種類を教えてください。",
        options: [
          { id: "1", label: "スキンケア用品" },
          { id: "2", label: "洗顔料" },
          { id: "3", label: "化粧水" },
          { id: "4", label: "乳液・クリーム" },
          { id: "5", label: "日焼け止め" },
          { id: "6", label: "ヘアケア用品" },
        ],
      },
      {
        id: "q10",
        number: "Q10",
        type: "SA・単一選択方式",
        isFixed: false,
        question: "化粧品を購入する際に最も重視する要因は何ですか？",
        options: [
          { id: "1", label: "価格" },
          { id: "2", label: "ブランド" },
          { id: "3", label: "効果" },
          { id: "4", label: "成分" },
          { id: "5", label: "口コミ・評価" },
        ],
      },
      {
        id: "q11",
        number: "Q11",
        type: "SA・単一選択方式",
        isFixed: false,
        question: "化粧品に関する情報をどこで入手することが多いですか？",
        options: [
          { id: "1", label: "インターネット" },
          { id: "2", label: "店舗スタッフ" },
          { id: "3", label: "友人・知人" },
          { id: "4", label: "雑誌・メディア" },
        ],
      },
      {
        id: "q12",
        number: "Q12",
        type: "SA・単一選択方式",
        isFixed: false,
        question: "今後、化粧品の使用頻度を増やしたいと思いますか？",
        options: [
          { id: "1", label: "とても思う" },
          { id: "2", label: "やや思う" },
          { id: "3", label: "あまり思わない" },
          { id: "4", label: "全く思わない" },
        ],
      },
    ],
  },
  {
    id: "cosmetics-usage-2",
    title: "セクション：化粧品ブランドの認知・購入意向",
    questions: [
      {
        id: "q13",
        number: "Q13",
        type: "SA・単一選択方式",
        isFixed: false,
        question: "最も信頼している化粧品ブランドを教えてください。",
        options: [
          { id: "1", label: "資生堂" },
          { id: "2", label: "花王" },
          { id: "3", label: "ユニリーバ" },
          { id: "4", label: "ロレアル" },
          { id: "5", label: "その他" },
        ],
      },
      {
        id: "q14",
        number: "Q14",
        type: "SA・単一選択方式",
        isFixed: false,
        question: "新しい化粧品ブランドを試すことに対してどう思いますか？",
        options: [
          { id: "1", label: "積極的に試したい" },
          { id: "2", label: "条件が合えば試したい" },
          { id: "3", label: "あまり試したくない" },
          { id: "4", label: "全く試したくない" },
        ],
      },
      {
        id: "q15",
        number: "Q15",
        type: "SA・単一選択方式",
        isFixed: false,
        question: "化粧品の購入チャネルとして最もよく利用するのはどこですか？",
        options: [
          { id: "1", label: "ドラッグストア" },
          { id: "2", label: "百貨店" },
          { id: "3", label: "オンラインショップ" },
          { id: "4", label: "コンビニエンスストア" },
          { id: "5", label: "専門店" },
        ],
      },
    ],
  },
];

type QuestionFormData = {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string[];
  q8?: string;
  q9?: string[];
  q10?: string;
  q11?: string;
  q12?: string;
  q13?: string;
  q14?: string;
  q15?: string;
};

type TabType = "screening" | "main";

// Tab Selection Component
const TabSelectionSection = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) => {
  const tabItems = [
    { id: "screening" as TabType, label: "スクリーニング調査" },
    { id: "main" as TabType, label: "本調査" },
  ];

  return (
    <div className="px-6">
      <div className="flex items-center gap-2">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`w-53 h-10 rounded-[8px_8px_0px_0px] px-8 py-2 flex items-center justify-center cursor-pointer transition-colors ${
              activeTab === tab.id
                ? "bg-[#138FB5] text-white font-bold text-base"
                : "bg-white text-[#138FB5] font-medium text-base border-t-2 border-r-2 border-l-2 border-[#138FB5] hover:bg-gray-50"
            }`}
          >
            <span className="text-center leading-6 font-['Noto_Sans_JP']">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const SurveyPreviewSection = () => {
  const [activeTab, setActiveTab] = useState<TabType>("screening");
  const { control, handleSubmit, watch, setValue, getValues } =
    useForm<QuestionFormData>({
      defaultValues: {
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: [],
        q8: "",
        q9: [],
        q10: "",
        q11: "",
        q12: "",
        q13: "",
        q14: "",
        q15: "",
      },
    });

  const onSubmit = (data: QuestionFormData) => {
    console.log("Form submitted:", data);
  };

  // Get current sections based on active tab
  const currentSections =
    activeTab === "screening" ? screeningSections : mainSurveySections;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-start relative self-stretch w-full"
    >
      <TabSelectionSection activeTab={activeTab} onTabChange={setActiveTab} />
      <Card className="flex flex-col items-start gap-4 p-4 relative self-stretch w-full bg-[#138FB5] rounded-lg">
        <ScrollArea className="w-full h-[620px]">
          <div className="flex flex-col items-start gap-4 relative w-full">
            {currentSections.map((section) => (
              <SurveySectionCard
                key={section.id}
                section={section}
                control={control}
                watch={watch as (name: string) => any}
                setValue={setValue as (name: string, value: any) => void}
                getValues={getValues as (name?: string) => any}
              />
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Separator
        className="absolute w-1 h-[230px] top-[211px] right-4 bg-[#dcdcdc] rounded"
        orientation="vertical"
      />
    </form>
  );
};
