"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  GraduationCap,
  Heart,
  ExternalLink,
  Sparkles,
  DollarSign,
  TrendingUp,
  Coffee,
  Home,
  Wifi,
  BookOpen,
  Award,
  Building,
  University,
  ChevronDown,
  ChevronUp,
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
import ScholarshipCard from "./ScholarshipCard";
import {
  addScholarshipToFavorites,
  removeScholarshipFromFavorites,
  getScholarshipFavorites,
} from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface University {
  id: string;
  name: string;
  location: string;
  country: string;
  ranking: number;
  studentCount: number;
  establishedYear: number;
  type: "public" | "private";
  tuitionRange: string;
  acceptanceRate: string; // Changed from number to string to match backend decimal
  description: string;
  website: string;
  source?: string;
  imageUrl?: string;
  specialties?: string[];
  campusSize?: string;
  // Additional backend fields
  roomBoardCost?: string;
  booksSuppliesCost?: string;
  personalExpensesCost?: string;
  facilitiesInfo?: {
    library?: string;
    recreationCenter?: string;
    researchLabs?: string;
    healthServices?: string;
    [key: string]: string | undefined;
  };
  housingOptions?: string[];
  studentOrganizations?: string[];
  diningOptions?: string[];
  transportationInfo?: string[];
  createdAt?: string;
  updatedAt?: string;
}

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

interface UnivCardProps {
  university: University;
  savedItems: string[];
  onToggleSaved: (id: string) => void;
  onSelectUniversity?: (university: University) => void;
  userToken?: string;
}

export default function UnivCard({
  university,
  savedItems,
  onToggleSaved,
  onSelectUniversity,
  userToken,
}: UnivCardProps) {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoadingScholarships, setIsLoadingScholarships] = useState(false);
  const [showScholarships, setShowScholarships] = useState(false);
  const [scholarshipFavorites, setScholarshipFavorites] = useState<string[]>(
    []
  );

  // Load user's scholarship favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (!userToken) return;

      try {
        const favorites = await getScholarshipFavorites(userToken);
        setScholarshipFavorites(favorites.map((fav) => fav.scholarshipId));
      } catch (error) {
        console.error("Error loading scholarship favorites:", error);
      }
    };

    loadFavorites();
  }, [userToken]);

  // Fetch scholarships for this university
  useEffect(() => {
    const fetchScholarships = async () => {
      if (!showScholarships) return;

      setIsLoadingScholarships(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/universities/${university.id}/scholarships`
        );
        if (response.ok) {
          const data = await response.json();
          setScholarships(data.scholarships);
        }
      } catch (error) {
        console.error("Error fetching scholarships:", error);
      } finally {
        setIsLoadingScholarships(false);
      }
    };

    fetchScholarships();
  }, [university.id, showScholarships]);

  const toggleScholarshipSaved = async (scholarshipId: string) => {
    if (!userToken) {
      return;
    }

    try {
      if (scholarshipFavorites.includes(scholarshipId)) {
        await removeScholarshipFromFavorites(userToken, scholarshipId);
        setScholarshipFavorites((prev) =>
          prev.filter((id) => id !== scholarshipId)
        );
      } else {
        await addScholarshipToFavorites(userToken, scholarshipId);
        setScholarshipFavorites((prev) => [...prev, scholarshipId]);
      }
    } catch (error) {
      console.error("Failed to toggle scholarship favorite:", error);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="h-full">
        <Dialog>
          <DialogTrigger asChild>
            <div className="h-full justify-between flex flex-col">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2">
                    <div className=" flex mr-2 items-center justify-center">
                      <University className="w-6 h-6" />
                    </div>
                    <div className="flex flex-row items-center justify-center gap-2">
                      {/* <Badge variant="secondary" className="text-xs w-12 h-12">
                #{university.ranking}
              </Badge> */}
                      <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                        {university.name}
                      </h3>
                      {university.source === "AI Generated" && (
                        <Badge
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSaved(university.id);
                    }}
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        savedItems.includes(university.id)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-400 hover:text-yellow-400"
                      }`}
                    />
                  </Button>
                </div>
                <div onClick={() => onSelectUniversity?.(university)}>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    {university.location}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Students:</span>
                      <span>{university.studentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Acceptance Rate:
                      </span>
                      <span>{university.acceptanceRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {university.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {(university.specialties || []).slice(0, 3).map((specialty) => (
                      <Badge
                        key={specialty}
                        variant="secondary"
                        className="text-xs"
                      >
                        {specialty}
                      </Badge>
                    ))}
                    {(university.specialties?.length || 0) > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(university.specialties?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building className="w-3 h-3" />
                  <span>
                    {university.type === "public" ? "Public" : "Private"}
                  </span>
                  {university.campusSize && (
                    <>
                      <span>•</span>
                      <span>{university.campusSize}</span>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  View Details
                </Button>
              </div>
            </div>
          </DialogTrigger>

          <DialogContent className="max-h-[80vh] w-full overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-6 h-6 mr-2 flex items-center justify-center">
                  <University className="w-6 h-6 " />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{university.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {university.location}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8">
              {university.source === "ai_suggested" && (
                <div className="border rounded-lg p-2 text-center font-medium bg-gradient-to-r from-purple-50 to-pink-100">
                  Data yang tertera pada universitas ini belum melewati
                  verifikasi, harap cek kembali informasi yang ada.
                </div>
              )}
              {/* AI Analysis Section */}
              {/* <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-foreground">
                    AI Profile Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    - Personalized insights for {university.name}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="border border-purple-900 bg-white rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2 text-foreground">
                      🎯 Match Score: 85%
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Based on your academic profile and interests,{" "}
                      {university.name} is an excellent match. Your strong
                      performance in STEM subjects aligns well with their
                      top-ranked engineering programs.
                    </p>
                  </div>
                  <div className="border border-purple-900 bg-white rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2 text-foreground">
                      💡 Key Recommendations
                    </h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        • Focus on strengthening your research experience for
                        better admission chances
                      </p>
                      <p>
                        • Consider applying for their early decision program
                        (acceptance rate: {university.acceptanceRate}%)
                      </p>
                      <p>
                        • Your extracurricular profile shows leadership
                        potential - highlight this in essays
                      </p>
                    </div>
                  </div>
                  <div className="border border-purple-900 bg-white rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2 text-foreground">
                      ⚠️ Areas to Improve
                    </h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        • Consider retaking SAT to reach their average score of
                        1520+
                      </p>
                      <p>
                        • Add more community service hours to strengthen your
                        application
                      </p>
                      <p>
                        • Connect with current students or alumni for networking
                        opportunities
                      </p>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Overview Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  University Overview
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">World Ranking</p>
                  <p className="text-2xl font-bold text-primary">
                    #{university.ranking}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Acceptance Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {university.acceptanceRate}%
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-sm text-muted-foreground">
                  {university.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Quick Facts</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Established:
                      </span>
                      <span>{university.establishedYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Students:</span>
                      <span>{university.studentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Campus Size:
                      </span>
                      <span>{university.campusSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {university.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {(university.specialties || []).map((specialty) => (
                      <Badge
                        key={specialty}
                        variant="secondary"
                        className="text-xs"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Budget & Costs
                </h3>
              </div>
              <div className="grid grid-cols-1  gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold">Tuition & Fees</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">
                        Annual Tuition
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {university.tuitionRange}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {university.roomBoardCost && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Room & Board:
                          </span>
                          <span>{university.roomBoardCost}</span>
                        </div>
                      )}
                      {university.booksSuppliesCost && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Books & Supplies:
                          </span>
                          <span>{university.booksSuppliesCost}</span>
                        </div>
                      )}
                      {university.personalExpensesCost && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Personal Expenses:
                          </span>
                          <span>{university.personalExpensesCost}</span>
                        </div>
                      )}
                      {(university.roomBoardCost ||
                        university.booksSuppliesCost ||
                        university.personalExpensesCost) && (
                        <div className="flex justify-between border-t pt-2 font-medium">
                          <span>
                            Contact university for total cost estimate
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement Section */}
            {/* <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    Improvement Plan
                  </h3>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold">
                      AI-Powered Improvement Plan
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <h5 className="font-medium mb-3">
                        📈 Academic Enhancement (Priority: High)
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-green-600">✓</span>
                          <span>
                            Take advanced courses in your intended major area
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-blue-600">→</span>
                          <span>
                            Aim for SAT score of 1520+ (current average: 1510)
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-blue-600">→</span>
                          <span>
                            Maintain GPA above 3.8 for competitive standing
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <h5 className="font-medium mb-3">
                        🏆 Extracurricular Development (Priority: Medium)
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-blue-600">→</span>
                          <span>
                            Join or lead research projects in your field of
                            interest
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-blue-600">→</span>
                          <span>
                            Participate in relevant competitions (Science
                            Olympiad, Math competitions)
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-blue-600">→</span>
                          <span>
                            Volunteer for 150+ hours in meaningful causes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <h5 className="font-medium mb-3">
                        📝 Application Strategy (Priority: High)
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-blue-600">→</span>
                          <span>
                            Start essay drafts 6 months before deadline
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-blue-600">→</span>
                          <span>
                            Connect with {university.name} admissions officers
                            at college fairs
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-blue-600">→</span>
                          <span>
                            Consider applying Early Decision for better chances
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}

            {/* Lifestyle Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-orange-600" />
                  Campus & Lifestyle
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold">Campus Life</h4>
                  </div>
                  <div className="space-y-3">
                    {university.housingOptions &&
                      university.housingOptions.length > 0 && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">
                            Housing Options
                          </h5>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {university.housingOptions.map((option, index) => (
                              <p key={index}>• {option}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    {university.studentOrganizations &&
                      university.studentOrganizations.length > 0 && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">
                            Student Organizations
                          </h5>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {university.studentOrganizations
                              .slice(0, 4)
                              .map((org, index) => (
                                <p key={index}>• {org}</p>
                              ))}
                            {university.studentOrganizations.length > 4 && (
                              <p className="text-xs italic">
                                And {university.studentOrganizations.length - 4}{" "}
                                more organizations
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Coffee className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold">Campus Services</h4>
                  </div>
                  <div className="space-y-3">
                    {university.diningOptions &&
                      university.diningOptions.length > 0 && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">
                            Dining Options
                          </h5>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {university.diningOptions.map((option, index) => (
                              <p key={index}>• {option}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    {university.transportationInfo &&
                      university.transportationInfo.length > 0 && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">
                            Transportation
                          </h5>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {university.transportationInfo.map(
                              (info, index) => (
                                <p key={index}>• {info}</p>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {university.facilitiesInfo &&
                Object.keys(university.facilitiesInfo).length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Wifi className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold">Campus Facilities</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {university.facilitiesInfo.library && (
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <p className="font-medium">Library</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {university.facilitiesInfo.library}
                          </p>
                        </div>
                      )}
                      {university.facilitiesInfo.recreationCenter && (
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <GraduationCap className="h-4 w-4 text-green-600" />
                            <p className="font-medium">Recreation Center</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {university.facilitiesInfo.recreationCenter}
                          </p>
                        </div>
                      )}
                      {university.facilitiesInfo.researchLabs && (
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="h-4 w-4 text-purple-600" />
                            <p className="font-medium">Research Labs</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {university.facilitiesInfo.researchLabs}
                          </p>
                        </div>
                      )}
                      {university.facilitiesInfo.healthServices && (
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Heart className="h-4 w-4 text-red-600" />
                            <p className="font-medium">Health Services</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {university.facilitiesInfo.healthServices}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Scholarships Section */}
              <div>
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-gray-50"
                  onClick={() => setShowScholarships(!showScholarships)}
                >
                  <h4 className="font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    Available Scholarships
                  </h4>
                  {showScholarships ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>

                {showScholarships && (
                  <div className="mt-3">
                    {isLoadingScholarships ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          Loading scholarships...
                        </p>
                      </div>
                    ) : scholarships.length > 0 ? (
                      <div className="space-y-3 ">
                        {scholarships.map((scholarship) => (
                          <div
                            key={scholarship.id}
                            className="border rounded-lg p-3"
                          >
                            <ScholarshipCard
                              scholarship={scholarship}
                              savedItems={scholarshipFavorites}
                              onToggleSaved={toggleScholarshipSaved}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          No scholarships available for this university.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onToggleSaved(university.id)}
                  className="flex-1"
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      savedItems.includes(university.id)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                  {savedItems.includes(university.id) ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
