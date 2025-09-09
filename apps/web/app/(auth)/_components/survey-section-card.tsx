import { Lock } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type Option = {
  id: string;
  label: string;
};

export type Question = {
  id: string;
  number: string;
  type: string;
  isFixed: boolean;
  question: string;
  options?: Option[];
  suffix?: string;
  placeholder?: string;
};

export type Section = {
  id: string;
  title: string;
  questions: Question[];
};

type SurveySectionCardProps = {
  section: Section;
  control: Control<any>;
  watch: (name: string) => any;
  setValue: (name: string, value: any) => void;
  getValues: (name?: string) => any;
};

export const SurveySectionCard = ({
  section,
  control,
  watch,
  setValue,
  getValues,
}: SurveySectionCardProps) => {
  const handleCheckboxChange = (
    questionId: string,
    optionId: string,
    checked: boolean,
  ) => {
    const currentValues = (getValues(questionId) as string[]) || [];
    let newValues: string[];

    if (checked) {
      newValues = [...currentValues, optionId];
    } else {
      newValues = currentValues.filter((id) => id !== optionId);
    }

    setValue(questionId, newValues);
  };

  return (
    <Card
      key={section.id}
      className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]"
    >
      <div className="inline-flex items-start gap-2 relative">
        <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs leading-6 whitespace-nowrap">
          {section.title}
        </div>
      </div>

      {section.questions.map((question) => (
        <Card
          key={question.id}
          className="flex flex-col items-start relative self-stretch w-full bg-white rounded-lg border border-solid border-[#dcdcdc]"
        >
          <div className="flex items-center gap-3 relative self-stretch w-full bg-[#f8f9fa] rounded-[8px_8px_0px_0px] border border-solid border-[#dcdcdc]">
            <div className="inline-flex items-center justify-center px-4 py-2 relative bg-[#138FB5] rounded-[8px_0px_0px_0px]">
              <div className="relative w-fit mt-[-1.00px] font-medium text-white text-xs text-center leading-6 whitespace-nowrap">
                {question.number}
              </div>
            </div>

            <div className="inline-flex items-center gap-3 relative">
              {question.isFixed && (
                <div className="inline-flex items-center justify-center gap-1 relative">
                  <div className="relative w-fit mt-[-1.00px] font-medium text-[#333333] text-xs text-center leading-6 whitespace-nowrap">
                    固定設問
                  </div>
                  <Lock className="w-4 h-4 text-[#333333]" />
                </div>
              )}

              <div className="relative w-fit mt-[-1.00px] font-medium text-[#333333] text-xs text-center leading-6 whitespace-nowrap">
                {question.type}
              </div>
            </div>
          </div>

          <CardContent className="flex flex-col items-start gap-4 pt-4 pb-6 px-12 relative self-stretch w-full">
            <div className="flex items-center gap-2 relative self-stretch w-full">
              <div className="flex items-center relative flex-1 grow">
                <div className="flex-1 mt-[-1.00px] font-medium text-[#333333] text-sm leading-6">
                  {question.question}
                </div>
              </div>
            </div>

            {question.type.includes("SA") && question.options && (
              <Controller
                name={question.id}
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value as string}
                    onValueChange={field.onChange}
                    className="flex flex-col items-start gap-2 relative self-stretch w-full"
                  >
                    {question.options?.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-2 relative self-stretch w-full"
                      >
                        <div className="flex w-10 items-center justify-end relative">
                          <RadioGroupItem
                            value={option.id}
                            id={`${question.id}-${option.id}`}
                            className="relative w-4 h-4"
                          />
                          <div className="flex flex-col w-6 items-center justify-center gap-2.5 relative">
                            <div className="relative w-fit mt-[-1.00px] font-medium text-[#333333] text-sm text-center leading-6 whitespace-nowrap">
                              {option.id}
                            </div>
                          </div>
                        </div>
                        <div className="rounded flex items-center px-2 py-0 relative flex-1 grow">
                          <Label
                            htmlFor={`${question.id}-${option.id}`}
                            className="flex items-start gap-2.5 relative flex-1 grow cursor-pointer"
                          >
                            <div className="flex-1 mt-[-1.00px] font-normal text-[#333333] text-sm leading-6">
                              {option.label}
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            )}

            {question.type.includes("NU") && (
              <div className="flex flex-col items-start relative self-stretch w-full">
                <div className="flex items-center gap-2 relative self-stretch w-full">
                  <div className="flex w-10 items-center justify-end relative">
                    <div className="flex flex-col w-6 items-center justify-center gap-2.5 relative">
                      <div className="relative w-fit mt-[-1.00px] font-medium text-[#333333] text-sm text-center leading-6 whitespace-nowrap">
                        1
                      </div>
                    </div>
                  </div>
                  <div className="gap-2 flex items-center px-2 py-0 relative flex-1 grow">
                    <Controller
                      name={question.id}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          className="relative w-[104px] h-6 rounded border border-solid border-[#dcdcdc]"
                        />
                      )}
                    />
                    <div className="w-fit mt-[-1.00px] font-normal text-[#333333] text-xs whitespace-nowrap leading-6">
                      {question.suffix}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {question.placeholder && (
              <div className="flex flex-col items-start relative self-stretch w-full">
                <div className="flex items-center gap-4 relative self-stretch w-full">
                  <div className="flex w-10 items-center justify-end relative">
                    <div className="flex flex-col w-6 items-center justify-center gap-2.5 relative">
                      <div className="relative w-fit mt-[-1.00px] font-medium text-[#333333] text-sm text-center leading-6 whitespace-nowrap">
                        1
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center relative flex-1 grow">
                    <Controller
                      name={question.id}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={question.placeholder}
                          className="flex w-[200px] items-center justify-center gap-2.5 relative rounded border border-solid border-[#dcdcdc] px-3 py-1"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {(question.type.includes("MA") || question.type.includes("GR")) &&
              question.options && (
                <div className="flex flex-col items-start gap-2 relative self-stretch w-full">
                  {question.options?.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 relative self-stretch w-full"
                    >
                      <div className="flex w-10 items-center justify-end relative">
                        <Checkbox
                          id={`${question.id}-${option.id}`}
                          className="relative w-4 h-4"
                          checked={(
                            (watch(question.id) as string[]) || []
                          ).includes(option.id)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              question.id,
                              option.id,
                              checked as boolean,
                            )
                          }
                        />
                        <div className="flex flex-col w-6 items-center justify-center gap-2.5 relative">
                          <div className="relative w-fit mt-[-1.00px] font-medium text-[#333333] text-sm text-center leading-6 whitespace-nowrap">
                            {option.id}
                          </div>
                        </div>
                      </div>
                      <div className="rounded flex items-center px-2 py-0 relative flex-1 grow">
                        <Label
                          htmlFor={`${question.id}-${option.id}`}
                          className="flex items-start gap-2.5 relative flex-1 grow cursor-pointer"
                        >
                          <div className="flex-1 mt-[-1.00px] font-normal text-[#333333] text-sm leading-6">
                            {option.label}
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      ))}
    </Card>
  );
};
