"use client";

import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useState } from "react";
import "@xyflow/react/dist/style.css";
import {
  GroupNode,
  MarriageQuestionNode,
  QuestionNode,
  StartNode,
} from "@/components/survey-flow-nodes";
import { GroupDetailsPanel } from "./group-details-panel";
import { QuestionDetailsPanel } from "./question-details-panel";

const nodeTypes = {
  start: StartNode,
  question: QuestionNode,
  marriageQuestion: MarriageQuestionNode,
  group: GroupNode,
};

const getQuestionData = (nodeId: string) => {
  const questionMap: Record<string, any> = {
    q1: {
      id: "q1",
      type: "SA",
      questionNumber: "Q1",
      questionText: "あなたの性別を教えてください。",
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "固定",
      jumpCondition: "なし",
    },
    q2: {
      id: "q2",
      type: "NU",
      questionNumber: "Q2",
      questionText: "あなたの年齢を教えてください。",
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "18-99の範囲",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "固定",
      jumpCondition: "なし",
    },
    q3: {
      id: "q3",
      type: "SA",
      questionNumber: "Q3",
      questionText: "あなたのお住まい（都道府県）を教えてください。",
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "固定",
      jumpCondition: "なし",
    },
    q4: {
      id: "q4",
      type: "SA",
      questionNumber: "Q4",
      questionText: "あなたは結婚していますか。",
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "デフォルト",
      jumpCondition: "Q4_1 → Q5, Q4_2 → Q6",
    },
    q5: {
      id: "q5",
      type: "SA",
      questionNumber: "Q5",
      questionText: "あなたと同居している方をお知らせください。",
      isRequired: true,
      respondentCondition: "未婚者のみ",
      answerControl: "なし",
      targetCondition: "Q4 = 1（未婚）",
      skipCondition: "既婚者",
      displayOrder: "デフォルト",
      jumpCondition: "なし",
    },
    q6: {
      id: "q6",
      type: "GR",
      questionNumber: "Q6",
      questionText: "あなたの職業を教えてください。",
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "グループ表示",
      jumpCondition: "なし",
    },
    q7: {
      id: "q7",
      type: "GR",
      questionNumber: "Q7",
      questionText: "あなたのご家族の職業を教えてください。",
      isRequired: false,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "グループ表示",
      jumpCondition: "なし",
    },
    q8: {
      id: "q8",
      type: "SA",
      questionNumber: "Q8",
      questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "デフォルト",
      jumpCondition: "なし",
    },
    q9: {
      id: "q9",
      type: "GR",
      questionNumber: "Q9",
      questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "グループ表示",
      jumpCondition: "なし",
    },
    q10: {
      id: "q10",
      type: "SA",
      questionNumber: "Q10",
      questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "デフォルト",
      jumpCondition: "なし",
    },
    q11: {
      id: "q11",
      type: "SA",
      questionNumber: "Q11",
      questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
      isRequired: false,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "デフォルト",
      jumpCondition: "なし",
    },
    q12: {
      id: "q12",
      type: "SA",
      questionNumber: "Q12",
      questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "デフォルト",
      jumpCondition: "なし",
    },
    q13: {
      id: "q13",
      type: "SA",
      questionNumber: "Q13",
      questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "デフォルト",
      jumpCondition: "なし",
    },
    q14: {
      id: "q14",
      type: "SA",
      questionNumber: "Q14",
      questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
      isRequired: true,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "デフォルト",
      jumpCondition: "なし",
    },
    q15: {
      id: "q15",
      type: "SA",
      questionNumber: "Q15",
      questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
      isRequired: false,
      respondentCondition: "全員",
      answerControl: "なし",
      targetCondition: "なし",
      skipCondition: "なし",
      displayOrder: "デフォルト",
      jumpCondition: "なし",
    },
  };
  return questionMap[nodeId] || null;
};

const getSectionData = (nodeId: string) => {
  // biome-ignore lint/suspicious/noExplicitAny: aaa
  const sectionMap: Record<string, any> = {
    "group-1": {
      id: "group-1",
      title: "固定セクション：性別・年齢・居住地",
      description: "回答者の基本属性を確認するセクション",
      questions: [
        {
          id: "q1",
          questionNumber: "Q1",
          questionText: "あなたの性別を教えてください。",
          type: "SA",
        },
        {
          id: "q2",
          questionNumber: "Q2",
          questionText: "あなたの年齢を教えてください。",
          type: "NU",
        },
        {
          id: "q3",
          questionNumber: "Q3",
          questionText: "あなたのお住まい（都道府県）を教えてください。",
          type: "SA",
        },
      ],
    },
    "group-marriage": {
      id: "group-marriage",
      title: "セクション：未既婚",
      description: "回答者の婚姻状況を確認するセクション",
      questions: [
        {
          id: "q4",
          questionNumber: "Q4",
          questionText: "あなたは結婚していますか。",
          type: "条件分岐",
        },
      ],
    },
    "group-2": {
      id: "group-2",
      title: "セクション：子どもの有無",
      description: "同居者に関する情報を確認するセクション",
      questions: [
        {
          id: "q5",
          questionNumber: "Q5",
          questionText: "あなたと同居している方をお知らせください。",
          type: "SA",
        },
      ],
    },
    "group-3": {
      id: "group-3",
      title: "セクション：職業",
      description: "回答者とその家族の職業を確認するセクション",
      questions: [
        {
          id: "q6",
          questionNumber: "Q6",
          questionText: "あなたの職業を教えてください。",
          type: "GR",
        },
        {
          id: "q7",
          questionNumber: "Q7",
          questionText: "あなたのご家族の職業を教えてください。",
          type: "GR",
        },
      ],
    },
    "group-4": {
      id: "group-4",
      title: "セクション：男性化粧品の使用状況（使用有無、頻度）",
      description: "化粧品の使用頻度に関する詳細な情報を収集するセクション",
      questions: [
        {
          id: "q8",
          questionNumber: "Q8",
          questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
          type: "SA",
        },
        {
          id: "q9",
          questionNumber: "Q9",
          questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
          type: "GR",
        },
        {
          id: "q10",
          questionNumber: "Q10",
          questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
          type: "SA",
        },
        {
          id: "q11",
          questionNumber: "Q11",
          questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
          type: "SA",
        },
        {
          id: "q12",
          questionNumber: "Q12",
          questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
          type: "SA",
        },
      ],
    },
    "group-5": {
      id: "group-5",
      title: "セクション：男性化粧品の使用状況（使用有無、頻度）",
      description: "化粧品の使用に関する追加情報を収集するセクション",
      questions: [
        {
          id: "q13",
          questionNumber: "Q13",
          questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
          type: "SA",
        },
        {
          id: "q14",
          questionNumber: "Q14",
          questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
          type: "SA",
        },
        {
          id: "q15",
          questionNumber: "Q15",
          questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
          type: "SA",
        },
      ],
    },
  };
  return sectionMap[nodeId] || null;
};

const initialNodes: Node[] = [
  {
    id: "start",
    type: "start",
    position: { x: 300, y: 50 },
    data: {
      label: "スクリーニング設問開始",
    },
  },
  {
    id: "group-1",
    type: "group",
    position: { x: 200, y: 200 },
    style: {
      width: 300,
      height: 400,
      backgroundColor: "#f5f5f5",
      border: "1px solid #dcdcdc",
      borderRadius: "4px",
    },
    data: {
      title: "固定セクション：性別・年齢・居住地",
    },
  },
  {
    id: "q1",
    type: "question",
    position: { x: 20, y: 40 },
    parentId: "group-1",
    extent: "parent",
    data: {
      id: "Q1",
      type: "SA",
      question: "あなたの性別を教えてください。",
    },
  },
  {
    id: "q2",
    type: "question",
    position: { x: 20, y: 160 },
    parentId: "group-1",
    extent: "parent",
    data: {
      id: "Q2",
      type: "NU",
      question: "あなたの年齢を教えてください。",
    },
  },
  {
    id: "q3",
    type: "question",
    position: { x: 20, y: 280 },
    parentId: "group-1",
    extent: "parent",
    data: {
      id: "Q3",
      type: "SA",
      question: "あなたのお住まい（都道府県）を教えてください。",
    },
  },
  {
    id: "group-marriage",
    type: "group",
    position: { x: 200, y: 650 },
    style: {
      width: 300,
      height: 220,
      backgroundColor: "#f5f5f5",
      border: "1px solid #dcdcdc",
      borderRadius: "4px",
    },
    data: {
      title: "セクション：未既婚",
    },
  },
  {
    id: "q4",
    type: "marriageQuestion",
    position: { x: 20, y: 40 },
    parentId: "group-marriage",
    extent: "parent",
    data: {},
  },
  {
    id: "group-2",
    type: "group",
    position: { x: 550, y: 650 },
    style: {
      width: 300,
      height: 180,
      backgroundColor: "#f5f5f5",
      border: "1px solid #dcdcdc",
      borderRadius: "4px",
    },
    data: {
      title: "セクション：子どもの有無",
    },
  },
  {
    id: "q5",
    type: "question",
    position: { x: 20, y: 40 },
    parentId: "group-2",
    extent: "parent",
    data: {
      id: "Q5",
      type: "SA",
      question: "あなたと同居している方をお知らせください。",
    },
  },
  {
    id: "group-3",
    type: "group",
    position: { x: 550, y: 900 },
    style: {
      width: 300,
      height: 280,
      backgroundColor: "#f5f5f5",
      border: "1px solid #dcdcdc",
      borderRadius: "4px",
    },
    data: {
      title: "セクション：職業",
    },
  },
  {
    id: "q6",
    type: "question",
    position: { x: 20, y: 40 },
    parentId: "group-3",
    extent: "parent",
    data: {
      id: "Q6",
      type: "GR",
      question: "あなたの職業を教えてください。",
    },
  },
  {
    id: "q7",
    type: "question",
    position: { x: 20, y: 160 },
    parentId: "group-3",
    extent: "parent",
    data: {
      id: "Q7",
      type: "GR",
      question: "あなたのご家族の職業を教えてください。",
    },
  },
  {
    id: "screening-end",
    type: "start",
    position: { x: 550, y: 1250 },
    data: {
      label: "スクリーニング終了",
    },
  },
  {
    id: "main-survey-start",
    type: "start",
    position: { x: 300, y: 1400 },
    data: {
      label: "本調査設問START",
    },
  },
  {
    id: "group-4",
    type: "group",
    position: { x: 200, y: 1700 },
    style: {
      width: 300,
      height: 600,
      backgroundColor: "#f5f5f5",
      border: "1px solid #dcdcdc",
      borderRadius: "4px",
    },
    data: {
      title: "セクション：男性化粧品の使用状況（使用有無、頻度）",
    },
  },
  {
    id: "q8",
    type: "question",
    position: { x: 20, y: 40 },
    parentId: "group-4",
    extent: "parent",
    data: {
      id: "Q8",
      type: "SA",
      question: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
    },
  },
  {
    id: "q9",
    type: "question",
    position: { x: 20, y: 160 },
    parentId: "group-4",
    extent: "parent",
    data: {
      id: "Q9",
      type: "GR",
      question: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
    },
  },
  {
    id: "q10",
    type: "question",
    position: { x: 20, y: 280 },
    parentId: "group-4",
    extent: "parent",
    data: {
      id: "Q10",
      type: "SA",
      question: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
    },
  },
  {
    id: "q11",
    type: "question",
    position: { x: 20, y: 400 },
    parentId: "group-4",
    extent: "parent",
    data: {
      id: "Q11",
      type: "SA",
      question: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
    },
  },
  {
    id: "q12",
    type: "question",
    position: { x: 20, y: 520 },
    parentId: "group-4",
    extent: "parent",
    data: {
      id: "Q12",
      type: "SA",
      question: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
    },
  },
  {
    id: "group-5",
    type: "group",
    position: { x: 200, y: 2350 },
    style: {
      width: 300,
      height: 400,
      backgroundColor: "#f5f5f5",
      border: "1px solid #dcdcdc",
      borderRadius: "4px",
    },
    data: {
      title: "セクション：男性化粧品の使用状況（使用有無、頻度）",
    },
  },
  {
    id: "q13",
    type: "question",
    position: { x: 20, y: 40 },
    parentId: "group-5",
    extent: "parent",
    data: {
      id: "Q13",
      type: "SA",
      question: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
    },
  },
  {
    id: "q14",
    type: "question",
    position: { x: 20, y: 160 },
    parentId: "group-5",
    extent: "parent",
    data: {
      id: "Q14",
      type: "SA",
      question: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
    },
  },
  {
    id: "q15",
    type: "question",
    position: { x: 20, y: 280 },
    parentId: "group-5",
    extent: "parent",
    data: {
      id: "Q15",
      type: "SA",
      question: "あなたはどのくらいの頻度で化粧品を使用しますか？",
      isMainSurvey: true,
    },
  },
  {
    id: "end",
    type: "start",
    position: { x: 300, y: 2820 },
    data: {
      label: "本調査設問終了",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-start-q1",
    source: "start",
    target: "q1",
    animated: true,
  },
  {
    id: "e-q1-q2",
    source: "q1",
    target: "q2",
    type: "straight",
  },
  {
    id: "e-q2-q3",
    source: "q2",
    target: "q3",
    type: "straight",
  },
  {
    id: "e-q3-q4",
    source: "q3",
    target: "q4",
    type: "straight",
  },
  {
    id: "e-q4-q5",
    source: "q4",
    target: "q5",
    type: "smoothstep",
    animated: true,
    style: {
      stroke: "#22c55e",
      strokeWidth: 2,
    },
    label: "1: 未婚",
    labelStyle: {
      fill: "#22c55e",
      fontWeight: 700,
      fontSize: 12,
    },
    labelBgStyle: {
      fill: "white",
      fillOpacity: 0.9,
    },
  },
  {
    id: "e-q4-q6",
    source: "q4",
    target: "q6",
    type: "smoothstep",
    style: {
      stroke: "#ef4444",
      strokeWidth: 2,
      strokeDasharray: "5 5",
    },
    label: "2: 既婚",
    labelStyle: {
      fill: "#ef4444",
      fontWeight: 700,
      fontSize: 12,
    },
    labelBgStyle: {
      fill: "white",
      fillOpacity: 0.9,
    },
  },
  {
    id: "e-q6-q7",
    source: "q6",
    target: "q7",
    type: "straight",
  },
  {
    id: "e-q7-screening-end",
    source: "q7",
    target: "screening-end",
    type: "straight",
  },
  {
    id: "e-screening-end-main-start",
    source: "screening-end",
    target: "main-survey-start",
    type: "straight",
    animated: true,
  },
  {
    id: "e-main-start-q8",
    source: "main-survey-start",
    target: "q8",
    type: "straight",
  },
  {
    id: "e-q8-q9",
    source: "q8",
    target: "q9",
    type: "straight",
  },
  {
    id: "e-q9-q10",
    source: "q9",
    target: "q10",
    type: "straight",
  },
  {
    id: "e-q10-q11",
    source: "q10",
    target: "q11",
    type: "straight",
  },
  {
    id: "e-q11-q12",
    source: "q11",
    target: "q12",
    type: "straight",
  },
  {
    id: "e-q12-q13",
    source: "q12",
    target: "q13",
    type: "straight",
  },
  {
    id: "e-q13-q14",
    source: "q13",
    target: "q14",
    type: "straight",
  },
  {
    id: "e-q14-q15",
    source: "q14",
    target: "q15",
    type: "straight",
  },
  {
    id: "e-q15-end",
    source: "q15",
    target: "end",
    type: "straight",
    animated: true,
  },
];

export const SurveyContent = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (node.type === "question" || node.type === "marriageQuestion") {
      const questionData = getQuestionData(node.id);
      if (questionData) {
        setSelectedQuestion(questionData);
        setSelectedSection(null);
      }
    } else if (node.type === "group") {
      const sectionData = getSectionData(node.id);
      if (sectionData) {
        setSelectedSection(sectionData);
        setSelectedQuestion(null);
      }
    } else {
      // Click on non-question/non-group node clears selection
      setSelectedQuestion(null);
      setSelectedSection(null);
    }
  };

  const handlePaneClick = () => {
    // Click on empty space clears selection
    setSelectedQuestion(null);
    setSelectedSection(null);
  };

  return (
    <div className="w-full h-[3000px] bg-gray-50 rounded-lg overflow-x-auto relative">
      {selectedQuestion && (
        <div className="absolute top-4 right-4 z-50">
          <QuestionDetailsPanel
            question={selectedQuestion}
            onClose={() => setSelectedQuestion(null)}
          />
        </div>
      )}
      {selectedSection && (
        <div className="absolute top-4 right-4 z-50">
          <GroupDetailsPanel
            group={selectedSection}
            onClose={() => setSelectedSection(null)}
          />
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
