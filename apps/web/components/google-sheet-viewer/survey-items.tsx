"use client";

import { useEffect, useState } from "react";
import Spreadsheet, { type Matrix } from "react-spreadsheet";
import { api } from "@/lib/trpc/react";
import { useChatContext } from "@/app/(auth)/surveys/(chat)/chat-context";

type SpreadsheetData = Matrix<CellData>;

type CellData = {
  value: string;
  readOnly?: boolean;
  className?: string;
};

type SurveyData = {
  sections: Array<{
    phase: string;
    title: string;
    questions: Array<{
      type: string;
      description?: string | null;
    }>;
  }>;
};

const createSurveyItemsData = (survey?: SurveyData): CellData[][] => {
  // Row 1: Title in column A
  const titleRow: CellData[] = [
    {
      value: "調査項目案",
      readOnly: true,
      className: "title-cell",
    }, // A1
    { value: "", readOnly: true }, // B1
    { value: "", readOnly: true }, // C1
    { value: "", readOnly: true }, // D1
  ];

  // Row 2: Empty row
  const emptyRow1: CellData[] = [
    { value: "", readOnly: true },
    { value: "", readOnly: true },
    { value: "", readOnly: true },
    { value: "", readOnly: true },
  ];

  // Row 3: SC調査 headers starting from column A
  const scHeaderRow: CellData[] = [
    {
      value: "SC調査_聴取項目",
      readOnly: true,
      className: "sc-header-cell",
    }, // A3
    {
      value: "設問種別",
      readOnly: true,
      className: "sc-header-cell",
    }, // B3
    {
      value: "設問\nカウント",
      readOnly: true,
      className: "sc-header-cell",
    }, // C3
    {
      value: "備考　(選択肢イメージ/質問意図など)",
      readOnly: true,
      className: "sc-header-cell",
    }, // D3
  ];

  // SC調査のデータ
  let scDataRows: CellData[][] = [];
  let scTotalCount = 0;

  if (survey?.sections) {
    // Filter SCREENING phase sections and create rows
    const screeningSections = survey.sections.filter(
      (section) => section.phase === "SCREENING",
    );

    scDataRows = screeningSections.flatMap((section) =>
      section.questions.map((question) => {
        scTotalCount += 1;
        return [
          { value: section.title, readOnly: true },
          { value: question.type, readOnly: true },
          { value: "1", readOnly: true },
          { value: question.description || "", readOnly: true },
        ];
      }),
    );
  } else {
    // Default sample data
    scDataRows = [
      [
        { value: "性別", readOnly: true },
        { value: "SA", readOnly: true },
        { value: "1", readOnly: true },
        { value: "男性/女性", readOnly: true },
      ],
      [
        { value: "年齢", readOnly: true },
        { value: "SA", readOnly: true },
        { value: "1", readOnly: true },
        { value: "20-29歳/30-39歳/40-49歳/50-59歳/60歳以上", readOnly: true },
      ],
      [
        { value: "居住地域", readOnly: true },
        { value: "SA", readOnly: true },
        { value: "1", readOnly: true },
        { value: "都道府県選択", readOnly: true },
      ],
      [
        { value: "商品利用経験", readOnly: true },
        { value: "MA", readOnly: true },
        { value: "1", readOnly: true },
        { value: "過去1年以内の利用商品を複数選択", readOnly: true },
      ],
    ];
    scTotalCount = 4;
  }

  // Add total row for SC調査
  if (scDataRows.length > 0) {
    scDataRows.push([
      { value: "合計", readOnly: true, className: "sc-total-cell" },
      { value: "", readOnly: true, className: "sc-total-cell" },
      {
        value: String(scTotalCount),
        readOnly: true,
        className: "sc-total-cell",
      },
      { value: "", readOnly: true, className: "sc-total-cell" },
    ]);
  }

  // Add empty row after SC data
  scDataRows.push([
    { value: "", readOnly: true },
    { value: "", readOnly: true },
    { value: "", readOnly: true },
    { value: "", readOnly: true },
  ]);

  // 2 empty rows between SC and 本調査
  const emptyRows2 = Array(2).fill([
    { value: "", readOnly: true },
    { value: "", readOnly: true },
    { value: "", readOnly: true },
    { value: "", readOnly: true },
  ]);

  // 本調査 headers
  const mainHeaderRow: CellData[] = [
    {
      value: "本調査_聴取項目",
      readOnly: true,
      className: "main-header-cell",
    },
    {
      value: "設問種別",
      readOnly: true,
      className: "main-header-cell",
    },
    {
      value: "設問\nカウント",
      readOnly: true,
      className: "main-header-cell",
    },
    {
      value: "備考　(選択肢イメージ/質問意図など)",
      readOnly: true,
      className: "main-header-cell",
    },
  ];

  // 本調査のデータ
  let mainDataRows: CellData[][] = [];
  let mainTotalCount = 0;

  if (survey?.sections) {
    // Filter MAIN phase sections and create rows
    const mainSections = survey.sections.filter(
      (section) => section.phase === "MAIN",
    );

    mainDataRows = mainSections.flatMap((section) =>
      section.questions.map((question) => {
        mainTotalCount += 1;
        return [
          { value: section.title, readOnly: true },
          { value: question.type, readOnly: true },
          { value: "1", readOnly: true },
          { value: question.description || "", readOnly: true },
        ];
      }),
    );
  } else {
    // Default sample data
    mainDataRows = [
      [
        { value: "利用頻度", readOnly: true },
        { value: "SA", readOnly: true },
        { value: "1", readOnly: true },
        { value: "毎日/週2-3回/週1回/月2-3回/月1回以下", readOnly: true },
      ],
      [
        { value: "満足度評価", readOnly: true },
        { value: "Matrix", readOnly: true },
        { value: "5", readOnly: true },
        {
          value: "各項目を5段階評価（非常に満足～非常に不満）",
          readOnly: true,
        },
      ],
      [
        { value: "改善要望", readOnly: true },
        { value: "FA", readOnly: true },
        { value: "1", readOnly: true },
        { value: "自由記述（最大500文字）", readOnly: true },
      ],
      [
        { value: "推奨意向", readOnly: true },
        { value: "NPS", readOnly: true },
        { value: "1", readOnly: true },
        { value: "0-10の11段階評価", readOnly: true },
      ],
      [
        { value: "継続利用意向", readOnly: true },
        { value: "SA", readOnly: true },
        { value: "1", readOnly: true },
        {
          value:
            "必ず継続/たぶん継続/どちらともいえない/たぶん継続しない/継続しない",
          readOnly: true,
        },
      ],
    ];
    mainTotalCount = 5;
  }

  // Add total row for 本調査
  if (mainDataRows.length > 0) {
    mainDataRows.push([
      { value: "合計", readOnly: true, className: "main-total-cell" },
      { value: "", readOnly: true, className: "main-total-cell" },
      {
        value: String(mainTotalCount),
        readOnly: true,
        className: "main-total-cell",
      },
      { value: "", readOnly: true, className: "main-total-cell" },
    ]);
  }

  // Additional empty rows
  const additionalEmptyRows = Array(5).fill([
    { value: "", readOnly: true },
    { value: "", readOnly: true },
    { value: "", readOnly: true },
    { value: "", readOnly: true },
  ]);

  return [
    titleRow,
    emptyRow1,
    scHeaderRow,
    ...scDataRows,
    ...emptyRows2,
    mainHeaderRow,
    ...mainDataRows,
    ...additionalEmptyRows,
  ];
};

type SurveyItemsProps = {
  className?: string;
  surveyId?: number;
};

export const SurveyItems = ({ className = "", surveyId }: SurveyItemsProps) => {
  const { data: survey } = api.survey.getByIdWithRelations.useQuery(
    { id: surveyId ?? 0 },
    { enabled: !!surveyId },
  );

  const [data, setData] = useState<SpreadsheetData>(() =>
    createSurveyItemsData(),
  );

  let isChatCollapsed = false;
  try {
    isChatCollapsed = useChatContext().isChatCollapsed;
  } catch {
    isChatCollapsed = false;
  }

  useEffect(() => {
    if (survey) {
      setData(createSurveyItemsData(survey as SurveyData));
    }
  }, [survey]);

  const handleDataChange = (newData: SpreadsheetData) => {
    setData(newData);
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <div className="flex-1 overflow-auto">
        <div className={`min-w-fit survey-items-spreadsheet ${isChatCollapsed ? "wide" : ""}`}>
          <Spreadsheet
            data={data}
            onChange={handleDataChange}
            columnLabels={["A", "B", "C", "D"]}
            rowLabels={Array.from({ length: data.length }, (_, i) =>
              String(i + 1),
            )}
          />
        </div>
      </div>
      <style>{`
        .survey-items-spreadsheet .title-cell {
          font-size: 16px !important;
          font-weight: bold !important;
          color: #1a1a1a !important;
          text-align: left !important;
        }
        .survey-items-spreadsheet .header-cell {
          background-color: #e5e7eb !important;
          font-weight: 600 !important;
          color: #374151 !important;
          border: 1px solid #d1d5db !important;
          white-space: pre-wrap !important;
          text-align: left !important;
        }
        .survey-items-spreadsheet .sc-header-cell {
          background-color: #00b0f0 !important;
          font-weight: 600 !important;
          color: white !important;
          border: 1px solid #00b0f0 !important;
          white-space: pre-wrap !important;
          text-align: left !important;
        }
        .survey-items-spreadsheet .main-header-cell {
          background-color: #ff5050 !important;
          font-weight: 600 !important;
          color: white !important;
          border: 1px solid #ff5050 !important;
          white-space: pre-wrap !important;
          text-align: left !important;
        }
        .survey-items-spreadsheet .Spreadsheet__cell {
          min-width: 120px;
          text-align: left !important;
        }
        /* D列（行頭の行番号セルがあるため5番目がD列） */
        .survey-items-spreadsheet .Spreadsheet__cell:nth-child(5) {
          min-width: 300px;
        }
        .survey-items-spreadsheet .Spreadsheet__cell input,
        .survey-items-spreadsheet .Spreadsheet__cell span {
          text-align: left !important;
        }
        .survey-items-spreadsheet .sc-total-cell,
        .survey-items-spreadsheet .main-total-cell {
          font-weight: bold !important;
        }
        /* パネルを閉じた時は列幅を広げる */
        .survey-items-spreadsheet.wide .Spreadsheet__cell { min-width: 160px; }
        .survey-items-spreadsheet.wide .Spreadsheet__cell:nth-child(5) { min-width: 480px; }
      `}</style>
    </div>
  );
};
