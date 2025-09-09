"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/trpc/react";
import { EMPTY_ROW, SC_SURVEY_HEADER_ROWS } from "./screening-survey-constants";

type CellValue = string | number;

type SpreadsheetCellProps = {
  value: CellValue;
  onChange: (rowIndex: number, colIndex: number, value: string) => void;
  rowIndex: number;
  colIndex: number;
  isHeader?: boolean;
  isRowHeader?: boolean;
  backgroundColor?: string;
  data?: CellValue[][];
};

const SpreadsheetCell = ({
  value,
  onChange,
  rowIndex,
  colIndex,
  isHeader = false,
  isRowHeader = false,
  backgroundColor = "white",
  data,
}: SpreadsheetCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ""));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // respondentConditionかどうかを判定（「全員」のみ）
  const isRespondentCondition =
    colIndex === 2 && typeof value === "string" && value === "全員";

  // セクションタイトルかどうかを判定（C列で、次の行が「全員」の場合）
  const isSectionTitle =
    colIndex === 2 &&
    data &&
    data[rowIndex + 1] &&
    data[rowIndex + 1][2] === "全員";

  useEffect(() => {
    setEditValue(String(value || ""));
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    // Read-only mode - prevent editing
    return;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onChange(rowIndex, colIndex, editValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(String(value || ""));
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(rowIndex, colIndex, editValue);
  };

  // 特定の行・セルのスタイル設定
  let customBg = backgroundColor;
  let customFontSize = "11px";
  let customFontWeight = isHeader || isRowHeader ? "bold" : "normal";
  let customWhiteSpace = "nowrap";

  // 「SC調査」のスタイル（最優先）
  if (value === "SC調査") {
    customFontSize = "24px";
    customFontWeight = "bold";
    customWhiteSpace = "nowrap";
  }

  // 「あなたについてのアンケート」のスタイル
  if (value === "あなたについてのアンケート") {
    customFontSize = "16px";
    customFontWeight = "bold";
    customWhiteSpace = "nowrap";
  }

  // surveyタイトルのスタイル（D列でかつ前の行が「タイトル」の場合）
  if (
    colIndex === 3 &&
    data &&
    rowIndex > 0 &&
    data[rowIndex - 1][3] === "タイトル"
  ) {
    customFontSize = "16px";
    customFontWeight = "bold";
    customWhiteSpace = "nowrap";
  }

  // 行29（0ベースで28）の背景色を青に
  if (rowIndex === 28) {
    customBg = "#0000ff";
  }

  // タイトル行の次の次の行（2行下）の背景色を青に
  if (
    data &&
    rowIndex > 1 &&
    data[rowIndex - 2] &&
    data[rowIndex - 2][3] === "タイトル"
  ) {
    customBg = "#0000ff";
  }

  // 「回答者\n設問カウント」と「見積\n設問カウント」の背景色
  if (value === "回答者\n設問カウント" || value === "見積\n設問カウント") {
    customBg = "#fbd4b4";
  }

  // 改ページ行の背景色 (C列に改ページがある行全体)
  if (data?.[rowIndex] && data[rowIndex][2] === "改ページ") {
    customBg = "#d8d8d8";
  }

  const cellStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    padding: "2px 4px",
    width:
      value === "あなたについてのアンケート" ||
      value === "SC調査" ||
      (colIndex === 3 &&
        data &&
        rowIndex > 0 &&
        data[rowIndex - 1][3] === "タイトル")
        ? "auto"
        : "120px",
    minWidth:
      value === "あなたについてのアンケート" ||
      value === "SC調査" ||
      (colIndex === 3 &&
        data &&
        rowIndex > 0 &&
        data[rowIndex - 1][3] === "タイトル")
        ? "200px"
        : "120px",
    maxWidth:
      value === "あなたについてのアンケート" ||
      value === "SC調査" ||
      (colIndex === 3 &&
        data &&
        rowIndex > 0 &&
        data[rowIndex - 1][3] === "タイトル")
        ? "none"
        : "120px",
    minHeight: "20px",
    backgroundColor: isHeader ? "#f0f0f0" : isRowHeader ? "#f8f8f8" : customBg,
    fontWeight: customFontWeight,
    fontSize: customFontSize,
    fontFamily: "Arial, sans-serif",
    textAlign: "left",
    verticalAlign: "top",
    cursor: isHeader || isRowHeader ? "default" : "cell",
    overflow: "visible",
    whiteSpace: customWhiteSpace,
    position: "relative",
    zIndex:
      value === "あなたについてのアンケート" || value === "SC調査"
        ? 15
        : value && String(value).length > 10
          ? 10
          : 1,
    color: isRespondentCondition
      ? "#0000ff"
      : isSectionTitle
        ? "#ff6600"
        : "#000000",
  };

  if (isEditing) {
    return (
      <td style={cellStyle}>
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            height: "100%",
            background: "transparent",
            fontSize: "11px",
            fontFamily: "Arial, sans-serif",
            resize: "none",
            padding: "0",
            margin: "0",
            color: "#000000",
          }}
        />
      </td>
    );
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <td
      style={cellStyle}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("cellClick", { detail: { rowIndex, colIndex } }),
        )
      }
      onDoubleClick={handleDoubleClick}
      onMouseEnter={(e) => {
        if (value && String(value).length > 15) {
          e.currentTarget.style.zIndex = "20";
          e.currentTarget.style.backgroundColor = isHeader
            ? "#e8e8e8"
            : rowIndex === 28
              ? "#0000dd"
              : value === "回答者\n設問カウント" ||
                  value === "見積\n設問カウント"
                ? "#f5c896"
                : data &&
                    rowIndex > 1 &&
                    data[rowIndex - 2] &&
                    data[rowIndex - 2][3] === "タイトル"
                  ? "#0000dd"
                  : data?.[rowIndex] && data[rowIndex][2] === "改ページ"
                    ? "#c8c8c8"
                    : "#f8f8f8";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.zIndex =
          value && String(value).length > 15 ? "10" : "1";
        e.currentTarget.style.backgroundColor = isHeader
          ? "#f0f0f0"
          : isRowHeader
            ? "#f8f8f8"
            : rowIndex === 28
              ? "#0000ff"
              : value === "回答者\n設問カウント" ||
                  value === "見積\n設問カウント"
                ? "#fbd4b4"
                : data &&
                    rowIndex > 1 &&
                    data[rowIndex - 2] &&
                    data[rowIndex - 2][3] === "タイトル"
                  ? "#0000ff"
                  : data?.[rowIndex] && data[rowIndex][2] === "改ページ"
                    ? "#d8d8d8"
                    : backgroundColor;
      }}
      title={String(value)}
    >
      {String(value || "")}
    </td>
  );
};

type SurveyData = {
  title?: string;
  sections: Array<{
    phase: string;
    title: string;
    order: number;
    respondentCondition?: string;
    questions: Array<{
      code: string;
      title: string;
      type: string;
      description?: string | null;
      isRequired: boolean;
      respondentCondition?: string;
      options?: Array<{
        label: string;
      }>;
    }>;
  }>;
};

const createInitialData = (survey?: SurveyData): CellValue[][] => {
  // SC調査のヘッダー部分（定数から取得）
  const headerRows: CellValue[][] = [...SC_SURVEY_HEADER_ROWS];

  // SCREENINGフェーズの質問総数を計算
  let totalQuestions = 0;
  if (survey?.sections) {
    const screeningSections = survey.sections.filter(
      (section) => section.phase === "SCREENING",
    );
    screeningSections.forEach((section) => {
      totalQuestions += section.questions.length;
    });
  }

  // 質問総数とタイトルの行を動的に更新
  if (headerRows[27]) {
    // "あなたについてのアンケート"の行
    headerRows[27][0] = totalQuestions;
    headerRows[27][1] = totalQuestions;
    headerRows[27][3] = survey?.title || "あなたについてのアンケート";
  }

  // 実際のSC調査データ
  const dataRows: CellValue[][] = [];

  if (survey?.sections) {
    // SCREENING フェーズのセクションをフィルタリングしてデータ行を作成
    const screeningSections = survey.sections
      .filter((section) => section.phase === "SCREENING")
      .sort((a, b) => a.order - b.order);

    let questionNumber = 1;
    screeningSections.forEach((section) => {
      section.questions.forEach((question) => {
        // 各質問ごとにセクションタイトル行を追加
        const sectionRow = [...EMPTY_ROW];
        sectionRow[2] = section.title; // C列にセクションタイトル
        dataRows.push(sectionRow);

        // 各質問ごとに表示条件行を追加
        const respondentCondition =
          question.respondentCondition || section.respondentCondition || "全員";
        const conditionRow = [...EMPTY_ROW];
        conditionRow[2] = respondentCondition;
        dataRows.push(conditionRow);

        // 質問行
        dataRows.push([
          1,
          1,
          questionNumber,
          question.type,
          questionNumber,
          question.title,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "文字数",
          "",
          "",
          "新規",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        // 文字数チェック行
        dataRows.push([
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          question.title.length,
          "OK",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        // 選択肢がある場合
        if (question.options && question.options.length > 0) {
          // 選択肢ヘッダー
          if (question.type === "SA" || question.type === "PD") {
            dataRows.push([
              "",
              "",
              "",
              "",
              "",
              "ひとつだけ",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              0,
              "OK",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            ]);
          } else if (question.type === "MA") {
            dataRows.push([
              "",
              "",
              "",
              "",
              "",
              "あてはまるものすべて",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              0,
              "OK",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            ]);
          }

          dataRows.push([
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ]);

          // 選択肢行
          question.options.forEach((option, index) => {
            const marker =
              question.type === "SA" || question.type === "PD" ? "○" : "□";
            dataRows.push([
              "",
              "",
              "",
              "",
              "",
              marker,
              index + 1,
              option.label,
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              option.label.length,
              "OK",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            ]);
          });

          // ランダマイズ行
          dataRows.push([
            "",
            "",
            "",
            "",
            "選択肢ランダマイズ：",
            "",
            "ランダマイズなし",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ]);
        }

        // 改ページ
        dataRows.push([...EMPTY_ROW]);
        dataRows.push([...EMPTY_ROW]);
        // 改ページ行 - C列のみに「改ページ」を表示
        const pageBreakRow = [...EMPTY_ROW];
        pageBreakRow[2] = "改ページ"; // C列（インデックス2）
        dataRows.push(pageBreakRow);

        questionNumber++;
      });
    });
  }

  // 空行を追加（最低100行確保）
  const currentRows = headerRows.length + dataRows.length;
  const emptyRows: CellValue[][] = [];
  const minRows = Math.max(100, currentRows + 20);
  for (let i = currentRows; i < minRows; i++) {
    emptyRows.push([...EMPTY_ROW]);
  }

  return [...headerRows, ...dataRows, ...emptyRows];
};

type ScreeningSurveyProps = {
  className?: string;
  surveyId?: number;
};

export const ScreeningSurvey = ({
  className = "",
  surveyId,
}: ScreeningSurveyProps) => {
  const { data: survey } = api.survey.getByIdWithRelations.useQuery(
    { id: surveyId ?? 0 },
    { enabled: !!surveyId },
  );

  const [data, setData] = useState<CellValue[][]>(() => createInitialData());
  const [selectedCell, _setSelectedCell] = useState({ row: -1, col: -1 });

  useEffect(() => {
    if (survey) {
      setData(createInitialData(survey as SurveyData));
    }
  }, [survey]);

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    newValue: string,
  ) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = newValue;
    setData(newData);
  };

  // 列ヘッダー（A, B, C, ...）
  const columnHeaders = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  return (
    <div className={`w-full h-screen bg-gray-100 flex flex-col ${className}`}>
      {/* スプレッドシート */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="min-w-max">
          <table
            className="border-collapse border-0"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <thead>
              <tr>
                <th
                  className="border border-gray-400 bg-gray-200 text-xs font-bold text-center sticky left-0 z-20"
                  style={{
                    width: "40px",
                    minWidth: "40px",
                    maxWidth: "40px",
                    height: "20px",
                    padding: "2px",
                    backgroundColor: "#e5e7eb",
                    borderColor: "#9ca3af",
                  }}
                />
                {columnHeaders.map((header) => (
                  <th
                    key={header}
                    className="border border-gray-400 bg-gray-200 text-xs font-bold text-center z-10"
                    style={{
                      width: "120px",
                      minWidth: "120px",
                      maxWidth: "120px",
                      height: "20px",
                      padding: "2px",
                      backgroundColor: "#e5e7eb",
                      borderColor: "#9ca3af",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td
                    className="border border-gray-400 bg-gray-200 text-xs font-bold text-center sticky left-0 z-10"
                    style={{
                      width: "40px",
                      minWidth: "40px",
                      maxWidth: "40px",
                      height: "20px",
                      padding: "2px",
                      backgroundColor: "#e5e7eb",
                      borderColor: "#9ca3af",
                    }}
                  >
                    {rowIndex + 1}
                  </td>
                  {row.map((cell, colIndex) => (
                    <SpreadsheetCell
                      key={`${rowIndex}-${colIndex}`}
                      value={cell}
                      onChange={handleCellChange}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      data={data}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ステータスバー */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 border-t border-gray-300 text-sm">
        <div className="text-gray-700">
          選択セル:{" "}
          {selectedCell.row >= 0
            ? `${columnHeaders[selectedCell.col]}${selectedCell.row + 1}`
            : "なし"}
        </div>
        <div className="text-gray-700">行数: {data.length}</div>
        <div className="text-gray-700">列数: {data[0]?.length || 0}</div>
      </div>
    </div>
  );
};
