"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { ControlledInput, ControlledSelect } from "./index";

interface EnglishTest {
  id: string;
  type: string;
  score: string;
  date: string;
}

interface EnglishTestSectionProps {
  englishTests: EnglishTest[];
  editingSection: string | null;
  profileLoading: boolean;
  selectedEnglishTestType: string;
  customEnglishTestTitle: string;
  englishTestScore: string;
  englishTestDate: string;
  onEdit: (section: string | null) => void;
  onSelectTestType: (type: string) => void;
  onCustomTitleChange: (title: string) => void;
  onScoreChange: (score: string) => void;
  onDateChange: (date: string) => void;
  onAddTest: () => Promise<void>;
  onRemoveTest: (testId: string) => Promise<void>;
  t: (key: string) => string;
}

export function EnglishTestSection({
  englishTests,
  editingSection,
  profileLoading,
  selectedEnglishTestType,
  customEnglishTestTitle,
  englishTestScore,
  englishTestDate,
  onEdit,
  onSelectTestType,
  onCustomTitleChange,
  onScoreChange,
  onDateChange,
  onAddTest,
  onRemoveTest,
  t,
}: EnglishTestSectionProps) {
  return (
    <>
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="font-semibold text-xl">{t("englishProficiency")}</h2>
        <Dialog
          open={editingSection === "english"}
          onOpenChange={(open: boolean) => {
            onEdit(open ? "english" : null);
            if (!open) {
              onSelectTestType("");
              onCustomTitleChange("");
              onScoreChange("");
              onDateChange("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addEnglishTest")}</DialogTitle>
              <DialogDescription>{t("addNewEnglishTest")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="mb-2">{t("testType")}</Label>
                <ControlledSelect
                  value={selectedEnglishTestType}
                  onUpdate={onSelectTestType}
                  placeholder={t("selectTestType")}
                >
                  <SelectContent>
                    <SelectItem value="toefl">{t("toefl")}</SelectItem>
                    <SelectItem value="ielts">{t("ielts")}</SelectItem>
                    <SelectItem value="duolingo">{t("duolingo")}</SelectItem>
                    <SelectItem value="pte">{t("pte")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </ControlledSelect>
              </div>
              {selectedEnglishTestType === "other" && (
                <div>
                  <Label className="mb-2">{t("testTitle")}</Label>
                  <ControlledInput
                    value={customEnglishTestTitle}
                    onUpdate={onCustomTitleChange}
                    placeholder={t("enterTestName")}
                  />
                </div>
              )}
              <div>
                <Label className="mb-2">{t("score")}</Label>
                <ControlledInput
                  placeholder="110 / 7.5 / 125"
                  value={englishTestScore}
                  onUpdate={onScoreChange}
                />
              </div>
              <div>
                <Label className="mb-2">{t("testDate")}</Label>
                <ControlledInput
                  type="date"
                  value={englishTestDate}
                  onUpdate={onDateChange}
                />
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={onAddTest}
              disabled={profileLoading}
            >
              {profileLoading ? t("adding") : t("addTest")}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <Separator className="my-2" />
      <div className="space-y-2 mb-4">
        {englishTests.map((test) => (
          <Card key={test.id} className="p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{test.type}</div>
                <div className="text-sm text-gray-500">
                  Score: {test.score} • Date: {test.date}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveTest(test.id)}
                disabled={profileLoading}
              >
                <X className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
