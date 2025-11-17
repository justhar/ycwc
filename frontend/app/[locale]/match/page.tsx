"use client";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle,
  Sparkles,
  Star,
  MapPin,
  Users,
  Award,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getUserMatches,
  UniversityMatch,
  SuggestedUniversity,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  Favorite,
} from "@/lib/api";
import { toast } from "sonner";
import UnivCard from "@/components/UnivCard";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTranslations } from "next-intl";

// localStorage utilities
const MATCH_RESULTS_KEY = "match_results";
const PROFILE_SNAPSHOT_KEY = "profile_snapshot";

interface MatchResultsData {
  matches: UniversityMatch[];
  suggestedUniversities: SuggestedUniversity[];
  timestamp: number;
}

interface ProfileSnapshot {
  // Academic information (excluding identity fields)
  targetLevel?: string;
  intendedMajor?: string;
  institution?: string;
  graduationYear?: number;
  academicScore?: string;
  scoreScale?: string;
  englishTests?: any[];
  standardizedTests?: any[];
  awards?: any[];
  extracurriculars?: any[];
}

const saveMatchResults = (data: MatchResultsData) => {
  try {
    localStorage.setItem(MATCH_RESULTS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving match results:", error);
  }
};

const getMatchResults = (): MatchResultsData | null => {
  try {
    const stored = localStorage.getItem(MATCH_RESULTS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading match results:", error);
    return null;
  }
};

const saveProfileSnapshot = (profile: ProfileSnapshot) => {
  try {
    localStorage.setItem(PROFILE_SNAPSHOT_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving profile snapshot:", error);
  }
};

const getProfileSnapshot = (): ProfileSnapshot | null => {
  try {
    const stored = localStorage.getItem(PROFILE_SNAPSHOT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading profile snapshot:", error);
    return null;
  }
};

const hasProfileChanged = (
  currentProfile: ProfileSnapshot,
  storedProfile: ProfileSnapshot
): boolean => {
  const keys = [
    "targetLevel",
    "intendedMajor",
    "institution",
    "graduationYear",
    "academicScore",
    "scoreScale",
    "englishTests",
    "standardizedTests",
    "awards",
    "extracurriculars",
  ];

  return keys.some((key) => {
    const current = JSON.stringify(
      currentProfile[key as keyof ProfileSnapshot]
    );
    const stored = JSON.stringify(storedProfile[key as keyof ProfileSnapshot]);
    return current !== stored;
  });
};

export default function ExplorePage() {
  const { user, profile, token } = useAuth();
  const router = useRouter();
  const t = useTranslations("match");
  const [matchingText, setMatchingText] = useState(t("matching"));
  const [progress, setProgress] = useState(0);
  const [isMatching, setIsMatching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing results on mount
  useEffect((): void => {
    if (!profile) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const existingResults = getMatchResults();
    if (existingResults) {
      // Check if profile has changed
      const storedProfileSnapshot = getProfileSnapshot();
      const currentProfileSnapshot: ProfileSnapshot = {
        targetLevel: profile.targetLevel,
        intendedMajor: profile.intendedMajor,
        institution: profile.institution,
        graduationYear: profile.graduationYear,
        academicScore: profile.academicScore,
        scoreScale: profile.scoreScale,
        englishTests: profile.englishTests,
        standardizedTests: profile.standardizedTests,
        awards: profile.awards,
        extracurriculars: profile.extracurriculars,
      };

      if (
        storedProfileSnapshot &&
        hasProfileChanged(currentProfileSnapshot, storedProfileSnapshot)
      ) {
        // Profile has changed, show banner on results page
        router.push("/match/results?profileChanged=true");
      } else {
        // Profile hasn't changed, go to results page
        router.push("/match/results");
      }
    }
    setIsLoading(false);
  }, [profile, router]);

  // Animation effect for matching text and progress
  useEffect(() => {
    if (!isMatching) return;

    const matchingStates = [
      "Matching",
      "Matching.",
      "Matching..",
      "Matching...",
    ];
    let currentIndex = 0;

    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % matchingStates.length;
      setMatchingText(matchingStates[currentIndex]);
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 3;
        return newProgress > 100 ? 10 : newProgress;
      });
    }, 150);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [isMatching]);

  // Start matching process
  const startMatching = async () => {
    if (!user || !profile || !token) {
      toast.error(t("completeProfile"));
      return;
    }

    setIsMatching(true);
    setProgress(10);

    try {
      const result = await getUserMatches(token, profile);

      if (result.success && result.data) {
        const { matches, suggestedUniversities } = result.data;
        setProgress(100);

        // Save results and profile snapshot to localStorage
        const resultsData: MatchResultsData = {
          matches,
          suggestedUniversities,
          timestamp: Date.now(),
        };
        saveMatchResults(resultsData);

        const currentProfileSnapshot: ProfileSnapshot = {
          targetLevel: profile.targetLevel,
          intendedMajor: profile.intendedMajor,
          institution: profile.institution,
          graduationYear: profile.graduationYear,
          academicScore: profile.academicScore,
          scoreScale: profile.scoreScale,
          englishTests: profile.englishTests,
          standardizedTests: profile.standardizedTests,
          awards: profile.awards,
          extracurriculars: profile.extracurriculars,
        };
        saveProfileSnapshot(currentProfileSnapshot);

        // Stop matching animation after a brief delay
        setTimeout(() => {
          setIsMatching(false);
          toast.success(t("matchesFound", { count: matches.length }));
          router.push("/match/results");
        }, 1000);
      } else {
        throw new Error(result.error || "Failed to get matches");
      }
    } catch (error) {
      console.error("Matching error:", error);
      setIsMatching(false);
      toast.error(
        error instanceof Error ? error.message : "Failed to find matches"
      );
    }
  };

  // Show loading while checking for existing results
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="w-full flex pb-20 md:pb-0 justify-center overflow-x-hidden md:-mt-8">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center mx-auto px-10 gap-8">
          <div className="flex flex-col justify-center py-8 md:mt-20">
            <h2 className="text-5xl font-semibold">{t("title")}</h2>
            <p className="mt-4">{t("description")}</p>
            <div className="mt-4">
              {!isMatching ? (
                <Button
                  size="lg"
                  onClick={startMatching}
                  className="text-zinc-900 hover:bg-transparent cursor-pointer hover:shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
                >
                  {t("startSearch")} <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className="flex w-full max-w-md flex-col gap-4 [--radius:1rem]">
                  <Item
                    variant="outline"
                    className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
                  >
                    <ItemMedia variant="icon">
                      <Spinner />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{matchingText}</ItemTitle>
                      <ItemDescription>
                        {t("searchingDescription")}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions className="hidden sm:flex">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsMatching(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </ItemActions>
                    <ItemFooter>
                      <Progress value={progress} />
                    </ItemFooter>
                  </Item>
                </div>
              )}
            </div>
            <div className="flex gap-8 text-sm text-neutral-400 mt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Lebih dari 100+ Universitas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Rekomendasi yang Dipersonalisasi</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-[5/4] mt-10">
            <Image
              src="/harvard.jpg"
              alt="Browsing"
              priority
              fetchPriority="high"
              width={720}
              height={500}
              className="absolute md:-right-20 top-0 w-[120%] h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
