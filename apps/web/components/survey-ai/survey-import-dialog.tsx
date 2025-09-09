"use client";

import { FilePlus2, X } from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SurveyImportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onFileImport: (file: File) => void;
};

const SurveyImportDialog = ({
  isOpen,
  onClose,
  onFileImport,
}: SurveyImportDialogProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = [
    "application/json", // .json
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/plain", // .txt
    "application/pdf", // .pdf
  ];

  const validateFile = (file: File): boolean => {
    if (!allowedTypes.includes(file.type)) {
      setError(
        "対応していないファイル形式です。.json、.pptx、.excel、.txt、.pdf のいずれかを選択してください。",
      );
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files?.[0]) {
        const file = e.dataTransfer.files[0];
        if (validateFile(file)) {
          setSelectedFile(file);
        }
      }
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: validateFile is stable and doesn't depend on changing values
    [validateFile],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      onFileImport(selectedFile);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full"
          type="button"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">
          ファイルから調査を作成する
        </h2>

        {/* Content */}
        <div className="space-y-4">
          {/* Description */}
          <p className="text-sm font-medium text-gray-800 text-center">
            お持ちのファイルからAIが分析し、目的や条件の提案をします。
          </p>

          {/* File upload area */}
          <div className="space-y-2">
            <Button
              className={cn(
                "border-2 border-dashed border-gray-400 bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center gap-4 h-40 transition-colors relative w-full hover:border-[#138FB5] hover:bg-[#E6F2F5]",
                dragActive && "border-blue-400 bg-blue-50",
                selectedFile && "border-green-400 bg-green-50",
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              tabIndex={0}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center">
                  <FilePlus2 className="w-8 h-8 text-[#138FB5]" />
                </div>
                <p className="text-sm text-gray-800 text-center">
                  {selectedFile
                    ? selectedFile.name
                    : "ドラッグ＆ドロップでも追加できます"}
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileInput}
                accept=".json,.pptx,.xlsx,.xls,.txt,.pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Button>

            <p className="text-xs font-medium text-gray-800 text-left">
              ファイル形式：.json .pptx .excel .txt .pdf
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm font-medium text-red-600">{error}</div>
          )}

          {/* Convert button */}
          <Button
            onClick={handleImport}
            disabled={!selectedFile}
            className="w-full h-10 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-[20px]"
          >
            ファイルを取り込む
          </Button>
        </div>
      </div>
    </div>
  );
};

export { SurveyImportDialog };
