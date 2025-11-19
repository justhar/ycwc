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
import { Plus, X } from "lucide-react";
import { ControlledInput, ControlledTextarea } from "./index";

interface Extracurricular {
  id: string;
  activity: string;
  period: string;
  description?: string;
}

interface ExtracurricularsSectionProps {
  extracurriculars: Extracurricular[];
  editingSection: string | null;
  profileLoading: boolean;
  activityName: string;
  activityPeriod: string;
  activityDescription: string;
  onEdit: (section: string | null) => void;
  onActivityNameChange: (name: string) => void;
  onActivityPeriodChange: (period: string) => void;
  onActivityDescriptionChange: (description: string) => void;
  onAddActivity: () => Promise<void>;
  onRemoveActivity: (activityId: string) => Promise<void>;
  t: (key: string) => string;
}

export function ExtracurricularsSection({
  extracurriculars,
  editingSection,
  profileLoading,
  activityName,
  activityPeriod,
  activityDescription,
  onEdit,
  onActivityNameChange,
  onActivityPeriodChange,
  onActivityDescriptionChange,
  onAddActivity,
  onRemoveActivity,
  t,
}: ExtracurricularsSectionProps) {
  return (
    <>
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="font-semibold text-xl">{t("extracurriculars")}</h2>
        <Dialog
          open={editingSection === "extracurriculars"}
          onOpenChange={(open: boolean) => {
            onEdit(open ? "extracurriculars" : null);
            if (!open) {
              onActivityNameChange("");
              onActivityPeriodChange("");
              onActivityDescriptionChange("");
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
              <DialogTitle>{t("addExtracurricular")}</DialogTitle>
              <DialogDescription>{t("addLeadershipClubs")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="mb-2">Activity</Label>
                <ControlledInput
                  placeholder="e.g., Student Council President"
                  value={activityName}
                  onUpdate={onActivityNameChange}
                />
              </div>
              <div>
                <Label className="mb-2">Period</Label>
                <ControlledInput
                  placeholder="e.g., 2022-2023"
                  value={activityPeriod}
                  onUpdate={onActivityPeriodChange}
                />
              </div>
              <div>
                <Label className="mb-2">Description (Optional)</Label>
                <ControlledTextarea
                  placeholder="Brief description of your role and achievements"
                  value={activityDescription}
                  onUpdate={onActivityDescriptionChange}
                />
              </div>
            </div>
            <Button className="mt-4" onClick={onAddActivity} disabled={profileLoading}>
              {profileLoading ? "Adding..." : "Add Activity"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <Separator className="my-2" />
      <div className="space-y-2 mb-4">
        {extracurriculars.map((activity) => (
          <Card key={activity.id} className="p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{activity.activity}</div>
                <div className="text-sm text-gray-500">{activity.period}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveActivity(activity.id)}
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
