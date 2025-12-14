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
import { SelectContent, SelectItem } from "@/components/ui/select";
import { SquarePen } from "lucide-react";
import { ControlledInput, ControlledSelect } from "./index";

interface IdentitySectionProps {
  profileData: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
  };
  editingSection: string | null;
  profileLoading: boolean;
  onEdit: (section: string | null) => void;
  onProfileChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  t: (key: string) => string;
}

export function IdentitySection({
  profileData,
  editingSection,
  profileLoading,
  onEdit,
  onProfileChange,
  onSave,
  t,
}: IdentitySectionProps) {
  return (
    <>
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="font-semibold text-xl">{t("identity")}</h2>
        <Dialog
          open={editingSection === "identitas"}
          onOpenChange={(open: boolean) => onEdit(open ? "identitas" : null)}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <SquarePen className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("editIdentity")}</DialogTitle>
              <DialogDescription>{t("updatePersonalInfo")}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="mb-2">{t("fullName")}</Label>
                <ControlledInput
                  value={profileData.fullName}
                  onUpdate={(value) => onProfileChange("fullName", value)}
                  placeholder={t("enterFullName")}
                />
              </div>
              <div>
                <Label className="mb-2">{t("dateOfBirth")}</Label>
                <ControlledInput
                  type="date"
                  value={profileData.dateOfBirth}
                  onUpdate={(value) => onProfileChange("dateOfBirth", value)}
                />
              </div>
              <div>
                <Label className="mb-2">{t("nationality")}</Label>
                <ControlledSelect
                  value={profileData.nationality}
                  onUpdate={(value) => onProfileChange("nationality", value)}
                  placeholder={t("selectNationality")}
                >
                  <SelectContent>
                    <SelectItem value="Indonesia">Indonesia</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </ControlledSelect>
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
          <strong>{t("fullName")}:</strong>{" "}
          {profileData.fullName || t("notSet")}
        </div>
        <div>
          <strong>{t("dateOfBirth")}:</strong>{" "}
          {profileData.dateOfBirth || t("notSet")}
        </div>
        <div>
          <strong>{t("nationality")}:</strong> {profileData.nationality}
        </div>
      </div>
    </>
  );
}
