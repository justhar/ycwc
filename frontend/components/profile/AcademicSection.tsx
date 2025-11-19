"use client";

import { Button } from "@/components/ui/button";
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
import {
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SquarePen } from "lucide-react";
import { ControlledInput, ControlledSelect } from "./index";

interface AcademicSectionProps {
  profileData: {
    institution: string;
    graduationYear: string;
    academicScore: string;
    scoreScale: string;
  };
  editingSection: string | null;
  profileLoading: boolean;
  onEdit: (section: string | null) => void;
  onProfileChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  t: (key: string) => string;
}

export function AcademicSection({
  profileData,
  editingSection,
  profileLoading,
  onEdit,
  onProfileChange,
  onSave,
  t,
}: AcademicSectionProps) {
  return (
    <>
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="font-semibold text-xl">{t("academicInformation")}</h2>
        <Dialog
          open={editingSection === "academic"}
          onOpenChange={(open: boolean) => onEdit(open ? "academic" : null)}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <SquarePen className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("editAcademicInfo")}</DialogTitle>
              <DialogDescription>
                {t("updateEducationalBackground")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="mb-2">
                  {t("institution")} <span className="text-red-900">*</span>
                </Label>
                <ControlledInput
                  value={profileData.institution}
                  onUpdate={(value) => onProfileChange("institution", value)}
                  placeholder={t("schoolUniversityName")}
                />
              </div>
              <div>
                <Label className="mb-2">{t("graduationYear")}</Label>
                <ControlledInput
                  type="number"
                  value={profileData.graduationYear}
                  onUpdate={(value) => onProfileChange("graduationYear", value)}
                  placeholder="2024"
                />
              </div>
              <div>
                <Label className="mb-2">{t("academicScore")}</Label>
                <div className="flex gap-2">
                  <ControlledInput
                    value={profileData.academicScore}
                    onUpdate={(value) => onProfileChange("academicScore", value)}
                    placeholder="3.45 or 85"
                  />
                  <ControlledSelect
                    value={profileData.scoreScale}
                    onUpdate={(value) => onProfileChange("scoreScale", value)}
                    className="w-40"
                  >
                    <SelectContent>
                      <SelectItem value="gpa4">{t("gpa4")}</SelectItem>
                      <SelectItem value="percentage">{t("percentage")}</SelectItem>
                      <SelectItem value="indo">{t("indoScale")}</SelectItem>
                    </SelectContent>
                  </ControlledSelect>
                </div>
              </div>
            </div>
            <Button className="mt-4" onClick={onSave} disabled={profileLoading}>
              {profileLoading ? t("saving") : t("saveChanges")}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <Separator className="my-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <strong>{t("institution")}:</strong>{" "}
          {profileData.institution || t("notSet")}
        </div>
        <div>
          <strong>{t("graduationYear")}:</strong>{" "}
          {profileData.graduationYear || t("notSet")}
        </div>
        <div>
          <strong>{t("academicScore")}:</strong>{" "}
          {profileData.academicScore
            ? `${profileData.academicScore} (${profileData.scoreScale})`
            : t("notSet")}
        </div>
      </div>
    </>
  );
}
