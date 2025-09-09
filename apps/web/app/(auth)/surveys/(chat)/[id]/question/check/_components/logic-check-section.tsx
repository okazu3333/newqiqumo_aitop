import { AnimatePresence, motion } from "framer-motion";
import { FileSpreadsheet, Maximize, Network, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { GoogleSheetViewer } from "@/components/google-sheet-viewer";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { SurveyContent } from "./survey-content";

type QuestionFormData = {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string[];
};

type LogicCheckSectionProps = {
  surveyId: number;
};

export const LogicCheckSection = ({ surveyId }: LogicCheckSectionProps) => {
  const { handleSubmit } = useForm<QuestionFormData>({
    defaultValues: {
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: [],
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    console.log("Form submitted:", data);
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"spreadsheet" | "nodeGraph">(
    "spreadsheet",
  );

  return (
    <div className="flex flex-col items-start relative self-stretch w-full">
      <motion.div
        layoutId="survey-card"
        className="flex flex-col items-start relative self-stretch w-full"
      >
        <Card className="relative overflow-hidden self-stretch w-full bg-[#138FB5] rounded-lg h-[650px]">
          {/* Control Buttons */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
            {/* Maximize Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Maximize size={16} className="text-[#138FB5]" />
            </button>

            {/* View Mode Switch */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
              <FileSpreadsheet
                size={16}
                className={
                  viewMode === "spreadsheet"
                    ? "text-[#138FB5]"
                    : "text-gray-400"
                }
              />
              <Switch
                checked={viewMode === "nodeGraph"}
                onCheckedChange={(checked) =>
                  setViewMode(checked ? "nodeGraph" : "spreadsheet")
                }
              />
              <Network
                size={16}
                className={
                  viewMode === "nodeGraph" ? "text-[#138FB5]" : "text-gray-400"
                }
              />
            </div>
          </div>

          {viewMode === "spreadsheet" ? (
            <div className="w-full h-full">
              <GoogleSheetViewer surveyId={surveyId} />
            </div>
          ) : (
            <ScrollArea className="w-full h-full">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col items-start gap-4 relative p-4"
              >
                <SurveyContent />
              </form>
            </ScrollArea>
          )}
        </Card>
      </motion.div>

      {/* Expanded View Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              layoutId="survey-card"
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-full overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-30"
              >
                <X size={20} className="text-gray-600" />
              </button>

              {/* View Mode Switch in Modal */}
              <div className="absolute top-4 right-20 flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm z-20">
                <FileSpreadsheet
                  size={16}
                  className={
                    viewMode === "spreadsheet"
                      ? "text-[#138FB5]"
                      : "text-gray-400"
                  }
                />
                <Switch
                  checked={viewMode === "nodeGraph"}
                  onCheckedChange={(checked) =>
                    setViewMode(checked ? "nodeGraph" : "spreadsheet")
                  }
                />
                <Network
                  size={16}
                  className={
                    viewMode === "nodeGraph"
                      ? "text-[#138FB5]"
                      : "text-gray-400"
                  }
                />
              </div>

              {/* Expanded Content */}
              <div className="overflow-auto h-full">
                <div className="p-6 h-full">
                  {viewMode === "spreadsheet" ? (
                    <div className="h-[calc(100vh-120px)]">
                      <GoogleSheetViewer surveyId={surveyId} />
                    </div>
                  ) : (
                    <SurveyContent />
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
