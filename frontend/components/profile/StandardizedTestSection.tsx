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

interface StandardizedTest {
  id: string;
  type: string;
  score: string;
  date: string;
}

interface StandardizedTestSectionProps {
  standardizedTests: StandardizedTest[];
  editingSection: string | null;
  profileLoading: boolean;
  selectedStandardizedTestType: string;
  customStandardizedTestTitle: string;
  standardizedTestScore: string;
  standardizedTestDate: string;
  onEdit: (section: string | null) => void;
  onSelectTestType: (type: string) => void;
  onCustomTitleChange: (title: string) => void;
  onScoreChange: (score: string) => void;
  onDateChange: (date: string) => void;
  onAddTest: () => Promise<void>;
  onRemoveTest: (testId: string) => Promise<void>;
  t: (key: string) => string;
}

export function StandardizedTestSection({
  standardizedTests,
  editingSection,
  profileLoading,
  selectedStandardizedTestType,
  customStandardizedTestTitle,
  standardizedTestScore,
  standardizedTestDate,
  onEdit,
  onSelectTestType,
  onCustomTitleChange,
  onScoreChange,
  onDateChange,
  onAddTest,
  onRemoveTest,
  t,
}: StandardizedTestSectionProps) {
  return (
    <>
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="font-semibold text-xl">{t("standardizedTests")}</h2>
        <Dialog
          open={editingSection === "standardized"}
          onOpenChange={(open: boolean) => {
            onEdit(open ? "standardized" : null);
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
              <DialogTitle>{t("addStandardizedTest")}</DialogTitle>
              <DialogDescription>
                {t("addStandardizedTestDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="mb-2">Test Type</Label>
                <ControlledSelect
                  value={selectedStandardizedTestType}
                  onUpdate={onSelectTestType}
                  placeholder="Select test"
                >
                  <SelectContent>
                    <SelectItem value="sat">SAT</SelectItem>
                    <SelectItem value="act">ACT</SelectItem>
                    <SelectItem value="gre">GRE</SelectItem>
                    <SelectItem value="gmat">GMAT</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </ControlledSelect>
              </div>
              {selectedStandardizedTestType === "other" && (
                <div>
                  <Label className="mb-2">Test Title</Label>
                  <ControlledInput
                    value={customStandardizedTestTitle}
                    onUpdate={onCustomTitleChange}
                    placeholder="Enter test name"
                  />
                </div>
              )}
              <div>
                <Label className="mb-2">Score</Label>
                <ControlledInput
                  placeholder="1400 / 32 / 320 / 700"
                  value={standardizedTestScore}
                  onUpdate={onScoreChange}
                />
              </div>
              <div>
                <Label className="mb-2">Test Date</Label>
                <ControlledInput
                  type="date"
                  value={standardizedTestDate}
                  onUpdate={onDateChange}
                />
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={onAddTest}
              disabled={profileLoading}
            >
              {profileLoading ? "Adding..." : "Add Test"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <Separator className="my-2" />
      <div className="space-y-2 mb-4">
        {standardizedTests.map((test) => (
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
