"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash } from "lucide-react";
import { useId, useState } from "react";
import { QuestionForm, type QuestionType } from "@/components/question-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { QuestionConditionSettingDialog } from "./question-condition-setting-dialog";
import { RandomizeSettingDialog } from "./randomize-setting-dialog";

type Question = {
  id: string;
  type: QuestionType;
  questionNumber: string;
  questionText: string;
  options?: { id: string | number; label: string }[];
  isFixed?: boolean;
  suffix?: string;
  placeholder?: string;
  isMultiline?: boolean;
  isRequired?: boolean;
  pipingQuestionId?: string;
};

type Section = {
  id: string;
  title: string;
  questions: Question[];
};

type TabType = "screening" | "main";

// Sortable Section Component
const SortableSection = ({
  section,
  children,
}: {
  section: Section;
  children: React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full flex-[0_0_auto] bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc]"
    >
      <div className="items-start inline-flex gap-2 relative flex-[0_0_auto]">
        <div
          className="cursor-move hover:bg-gray-100 p-1 rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-[#556064]" />
        </div>
        <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs whitespace-nowrap">
          {section.title}
        </div>
      </div>
      {children}
    </Card>
  );
};

// Sortable Question Item Component
const SortableQuestionItem = ({
  question,
  isEditable,
  onQuestionChange,
  onDelete,
  onSettingsClick,
  previousQuestions,
}: {
  question: Question;
  isEditable: boolean;
  onQuestionChange: (id: string, updates: Partial<Question>) => void;
  onDelete: (id: string) => void;
  onSettingsClick: (id: string) => void;
  previousQuestions?: Array<{
    id: string;
    questionNumber: string;
    questionText: string;
  }>;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full relative">
      <QuestionForm
        type={question.type}
        questionNumber={question.questionNumber}
        questionText={question.questionText}
        options={question.options}
        isFixed={question.isFixed}
        isEditable={isEditable}
        isRequired={question.isRequired}
        suffix={question.suffix}
        placeholder={question.placeholder}
        isMultiline={question.isMultiline}
        onQuestionChange={(text) =>
          onQuestionChange(question.id, { questionText: text })
        }
        onOptionsChange={(options) =>
          onQuestionChange(question.id, { options })
        }
        onRequiredChange={(required) =>
          onQuestionChange(question.id, { isRequired: required })
        }
        onPipingChange={(pipingQuestionId) =>
          onQuestionChange(question.id, { pipingQuestionId })
        }
        dragHandleProps={
          isEditable ? { ...attributes, ...listeners } : undefined
        }
        previousQuestions={previousQuestions}
        selectedPipingQuestionId={question.pipingQuestionId}
      />
      {isEditable && !question.isFixed && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-1  hover:bg-red-50"
          onClick={() => onDelete(question.id)}
        >
          <Trash className="w-3 h-3 text-red-500" />
        </Button>
      )}
      {isEditable && (
        <Button
          className={cn(
            "absolute top-0 inline-flex h-6 my-1 px-2 bg-[#138fb5] hover:bg-[#138fb5]/80",
            question.isFixed ? "right-1" : "right-10",
          )}
          onClick={() => onSettingsClick(question.id)}
        >
          <div className="relative w-fit mt-[-1.00px] font-medium text-white text-xs text-center whitespace-nowrap">
            設定へ
          </div>
        </Button>
      )}
    </div>
  );
};

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

export const SurveyEditSection = () => {
  const uniqueIdPrefix = useId();
  const [questionIdCounter, setQuestionIdCounter] = useState(1000);
  const [activeTab, setActiveTab] = useState<TabType>("screening");
  const [isRandomizeDialogOpen, setIsRandomizeDialogOpen] = useState(false);
  const [isQuestionSettingsOpen, setIsQuestionSettingsOpen] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    {
      id: "fixed-section",
      title: "固定セクション：性別・年齢・居住地",
      questions: [
        {
          id: "Q1",
          type: "SA" as QuestionType,
          questionNumber: "Q1",
          questionText: "あなたの性別を教えてください。",
          options: [
            { id: 1, label: "男性" },
            { id: 2, label: "女性" },
          ],
          isFixed: true,
        },
        {
          id: "Q2",
          type: "NU" as QuestionType,
          questionNumber: "Q2",
          questionText: "あなたの年齢を教えてください。",
          suffix: "歳",
          isFixed: true,
        },
        {
          id: "Q3",
          type: "SA" as QuestionType,
          questionNumber: "Q3",
          questionText: "あなたのお住まい（都道府県）を教えてください。",
          options: [{ id: 1, label: "47都道府県" }],
          isFixed: true,
        },
      ],
    },
    {
      id: "marriage-section",
      title: "セクション：未既婚",
      questions: [
        {
          id: "Q4",
          type: "SA" as QuestionType,
          questionNumber: "Q4",
          questionText: "あなたは結婚していますか。",
          options: [
            { id: 1, label: "未婚" },
            { id: 2, label: "既婚（離別・死別含む）" },
          ],
        },
      ],
    },
    {
      id: "children-section",
      title: "セクション：子どもの有無",
      questions: [
        {
          id: "Q5",
          type: "MA" as QuestionType,
          questionNumber: "Q5",
          questionText: "あなたと同居している方をお知らせください。",
          options: [
            { id: 1, label: "自分のみ（一人暮らし）" },
            { id: 2, label: "配偶者" },
            { id: 3, label: "こども（未就学児）" },
            { id: 4, label: "こども（小学生）" },
            { id: 5, label: "こども（中高生）" },
            { id: 6, label: "こども（高校生を除く18歳以上）" },
            { id: 7, label: "自分（配偶者）の親" },
            { id: 8, label: "自分（配偶者）の兄弟姉妹" },
            { id: 9, label: "自分（配偶者）の祖父母" },
            { id: 10, label: "その他" },
          ],
        },
      ],
    },
  ]);

  const [mainSections, setMainSections] = useState<Section[]>([
    {
      id: "usage-section",
      title: "セクション：男性化粧品の使用状況（使用有無、頻度）",
      questions: [
        {
          id: "Q8",
          type: "SA" as QuestionType,
          questionNumber: "Q8",
          questionText: "あなたはどのくらいの頻度で化粧品を使用しますか？",
          options: [
            { id: 1, label: "毎日" },
            { id: 2, label: "週に数回" },
            { id: 3, label: "月に数回" },
            { id: 4, label: "ほとんど使用しない" },
          ],
        },
        {
          id: "Q12",
          type: "NU" as QuestionType,
          questionNumber: "Q12",
          questionText: "化粧品に月にどの程度の金額を使いますか？",
          suffix: "円",
        },
      ],
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const currentSections = activeTab === "screening" ? sections : mainSections;
    const setSectionsFunc =
      activeTab === "screening" ? setSections : setMainSections;

    // Check if we're moving sections
    const activeSectionIndex = currentSections.findIndex(
      (section) => section.id === active.id,
    );
    const overSectionIndex = currentSections.findIndex(
      (section) => section.id === over.id,
    );

    if (activeSectionIndex !== -1 && overSectionIndex !== -1) {
      // Moving sections
      const newSections = arrayMove(
        currentSections,
        activeSectionIndex,
        overSectionIndex,
      );
      setSectionsFunc(newSections);
      return;
    }

    // Otherwise, we're moving questions
    const updatedSections = [...currentSections];
    let sourceSection: Section | undefined;
    let sourceQuestionIndex = -1;

    // Find the source question
    for (const section of updatedSections) {
      const index = section.questions.findIndex((q) => q.id === active.id);
      if (index !== -1) {
        sourceSection = section;
        sourceQuestionIndex = index;
        break;
      }
    }

    if (sourceSection && sourceQuestionIndex !== -1) {
      // Find the destination - could be a question or a section
      let destSection: Section | undefined;
      let destQuestionIndex = -1;

      // First check if over.id is a section
      destSection = updatedSections.find((s) => s.id === over.id);
      if (destSection) {
        // Dropped on a section - add to the end
        destQuestionIndex = destSection.questions.length;
      } else {
        // Check if over.id is a question
        for (const section of updatedSections) {
          const index = section.questions.findIndex((q) => q.id === over.id);
          if (index !== -1) {
            destSection = section;
            destQuestionIndex = index;
            break;
          }
        }
      }

      if (destSection) {
        // Remove from source
        const [movedQuestion] = sourceSection.questions.splice(
          sourceQuestionIndex,
          1,
        );

        // Add to destination
        destSection.questions.splice(destQuestionIndex, 0, movedQuestion);

        // Update question numbers
        let questionCounter = 1;
        updatedSections.forEach((section) => {
          section.questions.forEach((question) => {
            question.questionNumber = `Q${questionCounter}`;
            questionCounter++;
          });
        });

        setSectionsFunc(updatedSections);
      }
    }
  };

  const handleQuestionChange = (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>,
  ) => {
    const currentSections = activeTab === "screening" ? sections : mainSections;
    const setSectionsFunc =
      activeTab === "screening" ? setSections : setMainSections;

    const updatedSections = currentSections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((q) =>
            q.id === questionId ? { ...q, ...updates } : q,
          ),
        };
      }
      return section;
    });

    setSectionsFunc(updatedSections);
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    const currentSections = activeTab === "screening" ? sections : mainSections;
    const setSectionsFunc =
      activeTab === "screening" ? setSections : setMainSections;

    const updatedSections = currentSections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter((q) => q.id !== questionId),
        };
      }
      return section;
    });

    setSectionsFunc(updatedSections);
  };

  const handleAddQuestion = (sectionId: string) => {
    const currentSections = activeTab === "screening" ? sections : mainSections;
    const setSectionsFunc =
      activeTab === "screening" ? setSections : setMainSections;

    const totalQuestions = currentSections.reduce(
      (acc, s) => acc + s.questions.length,
      0,
    );
    const newQuestion: Question = {
      id: `${uniqueIdPrefix}-Q${questionIdCounter}`,
      type: "SA",
      questionNumber: `Q${totalQuestions + 1}`,
      questionText: "新しい質問",
      options: [
        { id: 1, label: "選択肢1" },
        { id: 2, label: "選択肢2" },
      ],
    };

    setQuestionIdCounter((prev) => prev + 1);

    const updatedSections = currentSections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [...section.questions, newQuestion],
        };
      }
      return section;
    });

    setSectionsFunc(updatedSections);
  };

  const currentSections = activeTab === "screening" ? sections : mainSections;

  // Build previousQuestions array for piping functionality
  const buildPreviousQuestions = (currentQuestionId: string) => {
    const allQuestions: Array<{
      id: string;
      questionNumber: string;
      questionText: string;
    }> = [];

    for (const section of currentSections) {
      for (const question of section.questions) {
        // Don't include the current question or questions after it
        if (question.id === currentQuestionId) {
          return allQuestions;
        }
        allQuestions.push({
          id: question.id,
          questionNumber: question.questionNumber,
          questionText: question.questionText,
        });
      }
    }

    return allQuestions;
  };

  // Collect all IDs for DnD context
  const sectionIds = currentSections.map((section) => section.id);
  const allQuestionIds = currentSections.flatMap((section) =>
    section.questions.map((q) => q.id),
  );
  const allIds = [...sectionIds, ...allQuestionIds];

  return (
    <div className="flex flex-col items-start relative self-stretch w-full">
      <TabSelectionSection activeTab={activeTab} onTabChange={setActiveTab} />

      <Card className="flex flex-col items-start gap-2 pb-4 pt-2 px-4 relative self-stretch w-full flex-[0_0_auto] bg-[#138fb5] rounded-lg">
        <div className="flex items-center justify-between w-full">
          <div className="inline-flex items-start gap-1 relative flex-[0_0_auto]">
            <div className="inline-flex h-6 items-center gap-2 pl-2 pr-3 py-0 relative flex-[0_0_auto] bg-white rounded border border-solid border-white cursor-pointer">
              <Checkbox className="w-4 h-4" />
              <span className="w-fit font-bold text-[#138fb5] text-xs whitespace-nowrap relative">
                全選択・解除
              </span>
            </div>
            <div className="flex w-6 h-6 items-center justify-center gap-2 relative bg-white rounded border border-solid border-white cursor-pointer">
              <Trash className="w-5 h-5 text-[#556064]" />
            </div>
          </div>
          <Button
            className={cn(
              "top-0 inline-flex h-6 my-1 px-2 bg-white hover:bg-gray-50",
            )}
            onClick={() => setIsRandomizeDialogOpen(true)}
          >
            <div className="relative w-fit mt-[-1.00px] font-medium text-[#138fb5] text-xs text-center whitespace-nowrap">
              ランダム設定
            </div>
          </Button>
        </div>

        <ScrollArea className="flex flex-col h-[580px] items-start gap-4 relative self-stretch rounded-lg">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={allIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-4 w-full">
                {currentSections.map((section) => (
                  <SortableSection key={section.id} section={section}>
                    <SortableContext
                      items={section.questions.map((q) => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {section.questions.map((question) => (
                        <SortableQuestionItem
                          key={question.id}
                          question={question}
                          isEditable={true}
                          onQuestionChange={(id, updates) =>
                            handleQuestionChange(section.id, id, updates)
                          }
                          onDelete={(id) =>
                            handleDeleteQuestion(section.id, id)
                          }
                          onSettingsClick={() => {
                            setIsQuestionSettingsOpen(true);
                          }}
                          previousQuestions={buildPreviousQuestions(
                            question.id,
                          )}
                        />
                      ))}
                    </SortableContext>

                    {!section.questions.some((q) => q.isFixed) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddQuestion(section.id)}
                        className="self-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        質問を追加
                      </Button>
                    )}
                  </SortableSection>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>
      </Card>

      <RandomizeSettingDialog
        isOpen={isRandomizeDialogOpen}
        onClose={() => setIsRandomizeDialogOpen(false)}
      />

      <QuestionConditionSettingDialog
        isOpen={isQuestionSettingsOpen}
        onClose={() => {
          setIsQuestionSettingsOpen(false);
        }}
      />
    </div>
  );
};
