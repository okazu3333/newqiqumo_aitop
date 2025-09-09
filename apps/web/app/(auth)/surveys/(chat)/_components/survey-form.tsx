"use client";

import { CircleHelp } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

export type SurveyFormData = {
  title: string;
  purpose: string;
  targetCondition: string;
  analysisCondition: string;
  researchMethod: string;
  researchScale: string;
};

export const surveyFields = [
  {
    id: "title" as const,
    label: "調査タイトル",
    defaultValue: "",
    placeholder: "男性化粧品についての調査",
    isTextarea: false,
  },
  {
    id: "purpose" as const,
    label: "調査目的",
    defaultValue: "",
    placeholder: "男性の使用率と使用している化粧品とその理由",
    isTextarea: false,
  },
  {
    id: "targetCondition" as const,
    label: "調査対象者条件",
    defaultValue: "",
    placeholder: "東京都\n20代\n男性\n結婚の有無\n子どもの有無",
    isTextarea: true,
  },
  {
    id: "analysisCondition" as const,
    label: "分析対象者条件",
    defaultValue: "",
    placeholder:
      "男性化粧品の使用状況（使用有無、頻度）\n使用している化粧品の種類とブランド\n化粧品を使用している理由（目的や期待する効果）\n化粧品購入チャネル（購入方法、購入場所）\n化粧品に期待する改善点や要望\n今後も化粧品を使いたいと考えるか、その理由",
    isTextarea: true,
  },
  {
    id: "researchMethod" as const,
    label: "調査手法",
    defaultValue: "",
    placeholder: "想定している調査手法があれば入力してください。",
    isTextarea: false,
  },
  {
    id: "researchScale" as const,
    label: "調査規模（予算）",
    defaultValue: "",
    placeholder: "100万円",
    isTextarea: false,
  },
];

type SurveyFormProps = {
  form: UseFormReturn<SurveyFormData>;
};

export const SurveyForm = ({ form }: SurveyFormProps) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col items-start gap-10 w-full">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex flex-col items-start gap-6 w-full">
          {surveyFields.map((field) => (
            <div key={field.id} className="flex flex-col items-end w-full">
              <div className="flex h-10 items-center gap-4 w-full">
                <div className="flex items-center gap-2">
                  <label
                    className="text-sm font-bold text-[#333333] whitespace-nowrap"
                    htmlFor={field.id}
                  >
                    {field.label}
                    {field.id === "title" && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <CircleHelp className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center gap-2 w-full">
                  {field.isTextarea ? (
                    <textarea
                      {...register(
                        field.id,
                        field.id === "title"
                          ? { required: "タイトルは必須です" }
                          : undefined,
                      )}
                      id={field.id}
                      placeholder={field.placeholder}
                      className={`flex min-h-[96px] items-start px-4 py-3 w-full bg-white rounded border-2 border-solid ${
                        errors[field.id] ? "border-red-500" : "border-[#dcdcdc]"
                      } shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)] text-sm font-medium text-[#333333] placeholder:text-[#ababab] placeholder:text-base placeholder:font-normal resize-none focus:outline-none focus:border-[#138FB5]`}
                      rows={4}
                    />
                  ) : (
                    <input
                      {...register(
                        field.id,
                        field.id === "title"
                          ? { required: "タイトルは必須です" }
                          : undefined,
                      )}
                      id={field.id}
                      type="text"
                      placeholder={field.placeholder}
                      className={`flex h-12 items-center px-4 py-3 w-full bg-white rounded border-2 border-solid ${
                        errors[field.id] ? "border-red-500" : "border-[#dcdcdc]"
                      } shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)] text-sm font-medium text-[#333333] placeholder:text-[#ababab] placeholder:text-base placeholder:font-normal focus:outline-none focus:border-[#138FB5]`}
                    />
                  )}
                </div>
                {errors[field.id] && (
                  <p className="text-red-500 text-sm ml-1">
                    {errors[field.id]?.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
