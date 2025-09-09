import type { Meta, StoryObj } from "@storybook/react";
import { Comment } from "./comment";

const meta = {
  title: "Survey/Comment",
  component: Comment,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof Comment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 1,
    questionNo: "Q1",
    type: "single",
    reviewerName: "山田太郎",
    time: "5分前",
    comment:
      "この設問の選択肢について、「その他」の選択肢を追加することを検討してください。回答者の多様な意見を収集できる可能性があります。",
    status: "unresolved",
    reviewType: "team",
  },
};

export const WithReplies: Story = {
  args: {
    id: 2,
    questionNo: "Q2",
    type: "single",
    reviewerName: "佐藤花子",
    time: "1時間前",
    comment:
      "スクリーニング設問の1問目で、回答者の性別を尋ねています。設問タイプは単一選択で問題ないと考えられますが、LGBTQの人々の存在を考慮して、選択肢には「男性」「女性」以外に、「その他」や「答えたくない」もあると望ましいです。",
    status: "resolved",
    reviewType: "team",
    replies: 2,
  },
};

export const LongContent: Story = {
  args: {
    id: 3,
    questionNo: "Q3",
    type: "multi",
    reviewerName: "田中美咲",
    time: "2時間前",
    comment: `この設問について、いくつか懸念点があります：

1. 質問文が長すぎて、回答者が理解しづらい可能性があります。もう少し簡潔に表現できないでしょうか。

2. 選択肢の順序が論理的でないように見えます。頻度順や重要度順に並べ替えることを検討してください。

3. 「その他」の選択肢がありますが、自由記述欄がないため、具体的な内容を把握できません。自由記述欄の追加を推奨します。

4. この質問の前後の文脈を考慮すると、回答者の負担が大きくなっている可能性があります。全体的な質問数の見直しも必要かもしれません。

以上、ご検討をお願いいたします。`,
    status: "unresolved",
    reviewType: "team",
  },
};

export const Multiple: Story = {
  args: {
    id: 1,
    questionNo: "Q1",
    type: "single",
    reviewerName: "AIレビュー",
    time: "1分前",
    comment:
      "前の設問からジャンプ条件が設定されておらず、この設問に辿り着けませんでした。",
    status: "unresolved",
    reviewType: "ai",
  },
  render: () => (
    <div className="w-[500px] space-y-4">
      <Comment
        id={1}
        questionNo="Q1"
        type="single"
        reviewerName="AIレビュー"
        time="1分前"
        comment="前の設問からジャンプ条件が設定されておらず、この設問に辿り着けませんでした。"
        status="unresolved"
        reviewType="ai"
      />
      <Comment
        id={2}
        questionNo="Q2"
        type="single"
        reviewerName="チームレビュー"
        time="10分前"
        comment="他の設問では「教えてください」ですが、この設問では「お答えください」になっています。表現を統一することをお勧めします。"
        status="resolved"
        reviewType="team"
        replies={1}
      />
      <Comment
        id={3}
        questionNo="Q3"
        type="multi"
        reviewerName="AIレビュー"
        time="15分前"
        comment="選択肢の数が多すぎる可能性があります。回答者の負担を考慮して、グループ化や階層化を検討してください。"
        status="unresolved"
        reviewType="ai"
      />
    </div>
  ),
};
