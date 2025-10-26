"use client";

import React from "react";
import {
  Award,
  Heart,
  ExternalLink,
  DollarSign,
  Calendar,
  Users,
  Building,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Scholarship {
  id: string;
  name: string;
  type: "fully-funded" | "partially-funded" | "tuition-only";
  amount: string;
  description: string;
  requirements: string[];
  deadline: string;
  provider: string;
  country: string;
  applicationUrl?: string;
  eligiblePrograms: string[];
  maxRecipients?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ScholarshipCardProps {
  scholarship: Scholarship;
  savedItems: string[];
  onToggleSaved: (id: string) => void;
  onSelectScholarship?: (scholarship: Scholarship) => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "fully-funded":
      return "bg-green-100 text-green-800 border-green-300";
    case "partially-funded":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "tuition-only":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "fully-funded":
      return <CheckCircle className="w-4 h-4" />;
    case "partially-funded":
      return <AlertCircle className="w-4 h-4" />;
    case "tuition-only":
      return <DollarSign className="w-4 h-4" />;
    default:
      return <Award className="w-4 h-4" />;
  }
};

export default function ScholarshipCard({
  scholarship,
  savedItems,
  onToggleSaved,
  onSelectScholarship,
}: ScholarshipCardProps) {
  const isSaved = savedItems.includes(scholarship.id);

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-2">
            <div className="flex mr-2 items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                {scholarship.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {scholarship.provider}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSaved(scholarship.id);
            }}
          >
            <Heart
              className={`w-4 h-4 ${
                isSaved ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{scholarship.country}</span>
        </div>

        <div className="space-y-3">
          {/* Type and Amount */}
          <Badge
            variant="outline"
            className={`${getTypeColor(
              scholarship.type
            )} flex items-center gap-1`}
          >
            {getTypeIcon(scholarship.type)}
            {scholarship.type.replace("-", " ")}
          </Badge>
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{scholarship.amount}</span>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Deadline: {scholarship.deadline}
            </span>
          </div>

          {/* Max Recipients */}
          {scholarship.maxRecipients && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Max Recipients: {scholarship.maxRecipients}
              </span>
            </div>
          )}

          {/* Eligible Programs Preview */}
          {scholarship.eligiblePrograms.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {scholarship.eligiblePrograms
                .slice(0, 3)
                .map((program, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {program}
                  </Badge>
                ))}
              {scholarship.eligiblePrograms.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{scholarship.eligiblePrograms.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  {scholarship.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Provider:</span>
                      <span>{scholarship.provider}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Country:</span>
                      <span>{scholarship.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Deadline:</span>
                      <span>{scholarship.deadline}</span>
                    </div>
                    {scholarship.maxRecipients && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Max Recipients:</span>
                        <span>{scholarship.maxRecipients}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${getTypeColor(
                          scholarship.type
                        )} flex items-center gap-1`}
                      >
                        {getTypeIcon(scholarship.type)}
                        {scholarship.type.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Amount:</span>
                      <span className="text-green-600 font-semibold">
                        {scholarship.amount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {scholarship.description}
                  </p>
                </div>

                {/* Requirements */}
                {scholarship.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Requirements</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {scholarship.requirements.map((requirement, index) => (
                        <li key={index} className="text-gray-700">
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Eligible Programs */}
                {scholarship.eligiblePrograms.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Eligible Programs</h4>
                    <div className="flex flex-wrap gap-2">
                      {scholarship.eligiblePrograms.map((program, index) => (
                        <Badge key={index} variant="secondary">
                          {program}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                {scholarship.applicationUrl && (
                  <div className="pt-4 border-t">
                    <Button
                      asChild
                      className="w-full"
                      onClick={() => onSelectScholarship?.(scholarship)}
                    >
                      <a
                        href={scholarship.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Apply Now
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {scholarship.applicationUrl && (
            <Button
              size="sm"
              asChild
              onClick={() => onSelectScholarship?.(scholarship)}
            >
              <a
                href={scholarship.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Apply
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
