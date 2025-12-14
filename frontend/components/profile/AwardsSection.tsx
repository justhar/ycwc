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

interface Award {
  id: string;
  title: string;
  year: string;
  level: string;
}

interface AwardsSectionProps {
  awards: Award[];
  editingSection: string | null;
  profileLoading: boolean;
  awardTitle: string;
  awardYear: string;
  awardLevel: string;
  onEdit: (section: string | null) => void;
  onTitleChange: (title: string) => void;
  onYearChange: (year: string) => void;
  onLevelChange: (level: string) => void;
  onAddAward: () => Promise<void>;
  onRemoveAward: (awardId: string) => Promise<void>;
  t: (key: string) => string;
}

export function AwardsSection({
  awards,
  editingSection,
  profileLoading,
  awardTitle,
  awardYear,
  awardLevel,
  onEdit,
  onTitleChange,
  onYearChange,
  onLevelChange,
  onAddAward,
  onRemoveAward,
  t,
}: AwardsSectionProps) {
  return (
    <>
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="font-semibold text-xl">{t("awardsAchievements")}</h2>
        <Dialog
          open={editingSection === "awards"}
          onOpenChange={(open: boolean) => {
            onEdit(open ? "awards" : null);
            if (!open) {
              onTitleChange("");
              onYearChange("");
              onLevelChange("");
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
              <DialogTitle>{t("addAward")}</DialogTitle>
              <DialogDescription>
                {t("addPublicationsCompetitions")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="mb-2">Title</Label>
                <ControlledInput
                  placeholder="e.g., National Math Olympiad"
                  value={awardTitle}
                  onUpdate={onTitleChange}
                />
              </div>
              <div>
                <Label className="mb-2">Year</Label>
                <ControlledInput
                  placeholder="2023"
                  value={awardYear}
                  onUpdate={onYearChange}
                />
              </div>
              <div>
                <Label className="mb-2">Level</Label>
                <ControlledSelect
                  value={awardLevel}
                  onUpdate={onLevelChange}
                  placeholder="Select level"
                >
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </ControlledSelect>
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={onAddAward}
              disabled={profileLoading}
            >
              {profileLoading ? "Adding..." : "Add Award"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <Separator className="my-2" />
      <div className="space-y-2 mb-4">
        {awards.map((award) => (
          <Card key={award.id} className="p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{award.title}</div>
                <div className="text-sm text-gray-500">
                  {award.year} • {award.level}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveAward(award.id)}
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
