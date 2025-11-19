"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Cloud, Sparkles, WandSparkles, X } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface CVUploadSectionProps {
  showAISection: boolean;
  isAIProcessing: boolean;
  onToggleAISection: () => void;
  onDrop: (files: File[]) => Promise<void>;
  token?: string;
  t: (key: string) => string;
}

export function CVUploadSection({
  showAISection,
  isAIProcessing,
  onToggleAISection,
  onDrop,
  token,
  t,
}: CVUploadSectionProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = useCallback(
    async (droppedFiles: File[]) => {
      setFiles(droppedFiles);
      await onDrop(droppedFiles);
    },
    [onDrop]
  );

  return (
    <>
      <h2 className="font-semibold text-2xl my-2 flex gap-4 items-center flex-row">
        {t("yourProfile")}{" "}
        <Button
          onClick={onToggleAISection}
          className="text-zinc-900 hover:bg-transparent cursor-pointer hover:shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
        >
          {t("autofill")} <Sparkles className="h-4 w-4 ml-2" />
        </Button>
      </h2>
      <p className="text-zinc-500">{t("completeProfile")}</p>

      {showAISection && (
        <div className="border border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 mb-5 mt-2 p-6 flex items-center flex-col rounded-xl relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={onToggleAISection}
          >
            <X className="size-4" />
          </Button>
          <div className="items-center flex flex-col mb-5">
            <h4 className="text-xl font-semibold items-center gap-2 flex flex-row">
              {t("autofillWithAI")} <WandSparkles className="size-5" />
            </h4>
            <p className="text-sm text-zinc-500">{t("autofillDescription")}</p>
          </div>
          <Dropzone
            accept={{ "application/pdf": [".pdf"] }}
            onDrop={handleDrop}
            onError={console.error}
            className="border-dashed hover:cursor-pointer"
            src={files}
            disabled={isAIProcessing}
          >
            {isAIProcessing ? (
              <div className="flex flex-col items-center gap-2 p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-sm text-zinc-600">{t("processingCV")}</p>
              </div>
            ) : (
              <>
                <DropzoneEmptyState>
                  <div className="flex flex-col items-center gap-2">
                    <Cloud className="size-8 text-zinc-400" />
                    <p className="text-sm text-zinc-600">{t("dragDropCV")}</p>
                    <p className="text-xs text-zinc-400">{t("pdfOnly")}</p>
                  </div>
                </DropzoneEmptyState>
                <DropzoneContent />
              </>
            )}
          </Dropzone>
        </div>
      )}
    </>
  );
}
