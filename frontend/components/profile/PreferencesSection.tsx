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

interface PreferencesSectionProps {
  profileData: {
    targetLevel: string;
    intendedMajor: string;
    intendedCountry: string;
    budgetMin: string;
    budgetMax: string;
  };
  editingSection: string | null;
  profileLoading: boolean;
  onEdit: (section: string | null) => void;
  onProfileChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  t: (key: string) => string;
}

export function PreferencesSection({
  profileData,
  editingSection,
  profileLoading,
  onEdit,
  onProfileChange,
  onSave,
  t,
}: PreferencesSectionProps) {
  return (
    <>
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="font-semibold text-xl">{t("studyAbroadPreferences")}</h2>
        <Dialog
          open={editingSection === "preferences"}
          onOpenChange={(open: boolean) => onEdit(open ? "preferences" : null)}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <SquarePen className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("editStudyAbroadPreferences")}</DialogTitle>
              <DialogDescription>
                {t("updateStudyAbroadPreferences")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="mb-2">
                  {t("targetLevel")} <span className="text-red-600">*</span>
                </Label>
                <ControlledSelect
                  value={profileData.targetLevel}
                  onUpdate={(value) => onProfileChange("targetLevel", value)}
                  placeholder={t("selectLevel")}
                >
                  <SelectContent>
                    <SelectItem value="undergraduate">{t("undergraduate")}</SelectItem>
                    <SelectItem value="master">{t("masters")}</SelectItem>
                    <SelectItem value="phd">{t("phd")}</SelectItem>
                    <SelectItem value="exchange">{t("exchange")}</SelectItem>
                  </SelectContent>
                </ControlledSelect>
              </div>
              <div>
                <Label className="mb-2">
                  {t("intendedMajor")} <span className="text-red-600">*</span>
                </Label>
                <ControlledInput
                  value={profileData.intendedMajor}
                  onUpdate={(value) => onProfileChange("intendedMajor", value)}
                  placeholder={t("computerScience")}
                />
              </div>
              <div>
                <Label className="mb-2">
                  {t("intendedCountry")} <span className="text-red-600">*</span>
                </Label>
                <ControlledInput
                  value={profileData.intendedCountry}
                  onUpdate={(value) => onProfileChange("intendedCountry", value)}
                  placeholder={t("unitedStates")}
                />
              </div>
              <div>
                <Label className="mb-2">{t("budgetRange")}</Label>
                <div className="flex gap-2">
                  <ControlledInput
                    type="number"
                    value={profileData.budgetMin}
                    onUpdate={(value) => onProfileChange("budgetMin", value)}
                    placeholder={t("min")}
                  />
                  <ControlledInput
                    type="number"
                    value={profileData.budgetMax}
                    onUpdate={(value) => onProfileChange("budgetMax", value)}
                    placeholder={t("max")}
                  />
                </div>
              </div>
            </div>
            <Button className="mt-4" onClick={onSave} disabled={profileLoading}>
              {profileLoading ? "Saving..." : "Save Changes"}
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              * {t("requiredFieldsLegend")}
            </p>
          </DialogContent>
        </Dialog>
      </div>
      <Separator className="my-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <strong>Target Level:</strong>{" "}
          {profileData.targetLevel || "Not set"}
        </div>
        <div>
          <strong>Intended Major:</strong>{" "}
          {profileData.intendedMajor || "Not set"}
        </div>
        <div>
          <strong>Intended Country:</strong>{" "}
          {profileData.intendedCountry || "Not set"}
        </div>
        <div>
          <strong>Budget Range (Rp):</strong>{" "}
          {profileData.budgetMin && profileData.budgetMax
            ? `${profileData.budgetMin} - ${profileData.budgetMax}`
            : "Not set"}
        </div>
      </div>
    </>
  );
}
