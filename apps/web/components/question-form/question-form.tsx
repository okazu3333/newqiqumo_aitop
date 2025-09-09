"use client";

import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { NumericQuestion } from "./numeric-question";
import { SingleChoiceQuestion } from "./single-choice-question";
import { TextQuestion } from "./text-question";

export type { MultipleChoiceOption } from "./multiple-choice-question";
// Re-export types from individual components for backward compatibility
export type { SingleChoiceOption } from "./single-choice-question";

export type QuestionOption = {
  id: string | number;
  label: string;
};

export type QuestionType = "SA" | "MA" | "NU" | "FA";

export type QuestionFormProps = {
  type: QuestionType;
  questionNumber: string;
  questionText: string;
  options?: QuestionOption[];
  suffix?: string;
  placeholder?: string;
  isFixed?: boolean;
  isEditable?: boolean;
  isRequired?: boolean;
  isMultiline?: boolean;
  value?: string | string[];
  min?: number;
  max?: number;
  includeHeader?: boolean;
  onValueChange?: (value: string | string[]) => void;
  onQuestionChange?: (text: string) => void;
  onOptionsChange?: (options: QuestionOption[]) => void;
  onSuffixChange?: (suffix: string) => void;
  onPlaceholderChange?: (placeholder: string) => void;
  onRequiredChange?: (required: boolean) => void;
  onPipingChange?: (questionId: string | undefined) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  previousQuestions?: Array<{
    id: string;
    questionNumber: string;
    questionText: string;
  }>;
  selectedPipingQuestionId?: string;
};

/**
 * Main QuestionForm Component
 * This component now acts as a wrapper that delegates to the specific question type components.
 * It maintains backward compatibility while using the individual question components.
 *
 * Usage:
 * - For Single Choice (SA): Uses SingleChoiceQuestion component
 * - For Multiple Choice (MA): Uses MultipleChoiceQuestion component
 * - For Numeric (NU): Uses NumericQuestion component
 * - For Free Answer (FA): Uses TextQuestion component
 *
 * Each individual component can also be imported and used directly:
 * import { SingleChoiceQuestion } from "./single-choice-question";
 * import { MultipleChoiceQuestion } from "./multiple-choice-question";
 * import { NumericQuestion } from "./numeric-question";
 * import { TextQuestion } from "./text-question";
 */
export const QuestionForm = ({
  type,
  questionNumber,
  questionText,
  options = [],
  suffix,
  placeholder,
  isFixed = false,
  isEditable = false,
  isRequired = false,
  isMultiline = false,
  includeHeader = true,
  value,
  min,
  max,
  onValueChange,
  onQuestionChange,
  onOptionsChange,
  onSuffixChange,
  onPlaceholderChange,
  onRequiredChange,
  onPipingChange,
  dragHandleProps,
  previousQuestions,
  selectedPipingQuestionId,
}: QuestionFormProps) => {
  // Render the appropriate question component based on type
  switch (type) {
    case "SA":
      return (
        <SingleChoiceQuestion
          includeHeader={includeHeader}
          questionNumber={questionNumber}
          questionText={questionText}
          options={options}
          isFixed={isFixed}
          isEditable={isEditable}
          isRequired={isRequired}
          selectedValue={value as string}
          onValueChange={onValueChange as (value: string) => void}
          onQuestionChange={onQuestionChange}
          onOptionsChange={onOptionsChange}
          onRequiredChange={onRequiredChange}
          onPipingChange={onPipingChange}
          dragHandleProps={dragHandleProps}
          previousQuestions={previousQuestions}
          selectedPipingQuestionId={selectedPipingQuestionId}
        />
      );
    case "MA":
      return (
        <MultipleChoiceQuestion
          includeHeader={includeHeader}
          questionNumber={questionNumber}
          questionText={questionText}
          options={options}
          isFixed={isFixed}
          isEditable={isEditable}
          isRequired={isRequired}
          selectedValues={value as string[]}
          onValuesChange={onValueChange as (values: string[]) => void}
          onQuestionChange={onQuestionChange}
          onOptionsChange={onOptionsChange}
          onRequiredChange={onRequiredChange}
          onPipingChange={onPipingChange}
          dragHandleProps={dragHandleProps}
          previousQuestions={previousQuestions}
          selectedPipingQuestionId={selectedPipingQuestionId}
        />
      );
    case "NU":
      return (
        <NumericQuestion
          includeHeader={includeHeader}
          questionNumber={questionNumber}
          questionText={questionText}
          isFixed={isFixed}
          isEditable={isEditable}
          isRequired={isRequired}
          value={value as string}
          suffix={suffix}
          min={min}
          max={max}
          onValueChange={onValueChange as (value: string) => void}
          onQuestionChange={onQuestionChange}
          onSuffixChange={onSuffixChange}
          onRequiredChange={onRequiredChange}
          onPipingChange={onPipingChange}
          dragHandleProps={dragHandleProps}
          previousQuestions={previousQuestions}
          selectedPipingQuestionId={selectedPipingQuestionId}
        />
      );
    case "FA":
      return (
        <TextQuestion
          includeHeader={includeHeader}
          questionNumber={questionNumber}
          questionText={questionText}
          isFixed={isFixed}
          isEditable={isEditable}
          isRequired={isRequired}
          value={value as string}
          placeholder={placeholder}
          isMultiline={isMultiline}
          onValueChange={onValueChange as (value: string) => void}
          onQuestionChange={onQuestionChange}
          onPlaceholderChange={onPlaceholderChange}
          onRequiredChange={onRequiredChange}
          onPipingChange={onPipingChange}
          dragHandleProps={dragHandleProps}
          previousQuestions={previousQuestions}
          selectedPipingQuestionId={selectedPipingQuestionId}
        />
      );
    default:
      return null;
  }
};
