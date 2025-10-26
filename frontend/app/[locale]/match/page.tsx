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
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<UniversityMatch[]>([]);
  const [suggestedUniversities, setSuggestedUniversities] = useState<
    SuggestedUniversity[]
  >([]);
  const [savedItems, setSavedItems] = useState<string[]>([]);

  // Backend favorites instead of local savedItems
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

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
        // Profile has changed, redirect to results with flag
        router.push("/match?profileChanged=true");
      } else {
        // Profile hasn't changed, load existing results into state
        setMatches(existingResults.matches);
        setSuggestedUniversities(existingResults.suggestedUniversities);
        setHasStarted(true);
        setProgress(100);
      }
    }
    setIsLoading(false);
  }, [profile, router]);

  // Load user's favorites when authenticated
  useEffect(() => {
    const loadFavorites = async () => {
      if (user && token) {
        try {
          const userFavorites = await getUserFavorites(token);
          setFavorites(userFavorites);

          // Create favoriteIds set, converting AI-suggested universities back to their generated IDs
          const favoriteIdsSet = new Set<string>();
          userFavorites.forEach((fav) => {
            if (fav.university.source === "ai_suggested") {
              // Generate the AI-suggested ID based on the university name
              const generatedId = `ai-suggested-${fav.university.name
                .replace(/\s+/g, "-")
                .toLowerCase()}`;
              favoriteIdsSet.add(generatedId);
            } else {
              favoriteIdsSet.add(fav.university.id);
            }
          });

          setFavoriteIds(favoriteIdsSet);
        } catch (error) {
          console.error("Failed to load favorites:", error);
        }
      }
    };

    loadFavorites();
  }, [user, token]);

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
    setHasStarted(true);
    setProgress(10);

    try {
      const result = await getUserMatches(token, profile);

      if (result.success && result.data) {
        const { matches, suggestedUniversities } = result.data;
        setMatches(matches);
        setSuggestedUniversities(suggestedUniversities);
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

  const toggleSaved = async (universityId: string, university?: any) => {
    if (!user || !token) {
      // If user is not authenticated, could show login prompt
      return;
    }

    try {
      if (favoriteIds.has(universityId)) {
        // Remove from favorites
        await removeFromFavorites(token, universityId);
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(universityId);
          return newSet;
        });

        // For AI-suggested universities, filter by name since the ID is generated
        if (universityId.startsWith("ai-suggested-")) {
          setFavorites((prev) =>
            prev.filter((fav) => fav.university.name !== university?.name)
          );
        } else {
          setFavorites((prev) =>
            prev.filter((fav) => fav.university.id !== universityId)
          );
        }
      } else {
        // Add to favorites - pass university data for AI-suggested universities
        const result = await addToFavorites(token, universityId, university);

        // Reload favorites to update the IDs properly
        const userFavorites = await getUserFavorites(token);
        setFavorites(userFavorites);

        // Create favoriteIds set, converting AI-suggested universities back to their generated IDs
        const favoriteIdsSet = new Set<string>();
        userFavorites.forEach((fav) => {
          if (fav.university.source === "ai_suggested") {
            // Generate the AI-suggested ID based on the university name
            const generatedId = `ai-suggested-${fav.university.name
              .replace(/\s+/g, "-")
              .toLowerCase()}`;
            favoriteIdsSet.add(generatedId);
          } else {
            favoriteIdsSet.add(fav.university.id);
          }
        });
        setFavoriteIds(favoriteIdsSet);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
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

  // Show results if matching is complete and has results
  if (!isMatching && hasStarted && matches.length > 0) {
    return (
      <div className="w-full px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-semibold mb-4">
              Your University Matches
            </h2>
            <p className="text-gray-600">
              Found {matches.length} universities that match your profile
            </p>
          </div>

          <div className="grid gap-6 mb-12">
            {matches.map((match, index) => (
              <div
                key={match.university.id}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-purple-600">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {match.university.name}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {match.university.location}, {match.university.country}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {match.matchScore}%
                    </div>
                    <p className="text-sm text-gray-500">{t("matchScore")}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">{t("whyGoodMatch")}</h4>
                  <p className="text-gray-700">{match.reasoning}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {t("strengths")}
                    </h4>
                    <ul className="text-sm space-y-1">
                      {match.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      {t("considerations")}
                    </h4>
                    <ul className="text-sm space-y-1">
                      {match.concerns.map((concern, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <UnivCard
                  university={match.university}
                  savedItems={Array.from(favoriteIds)}
                  onToggleSaved={(id) => toggleSaved(id, match.university)}
                  onSelectUniversity={() => {}}
                  userToken={token ? token : undefined}
                />
              </div>
            ))}
          </div>

          {suggestedUniversities.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-4">
                AI Suggested Universities
              </h3>
              <p className="text-gray-600 mb-6">
                Universities not in our database that might be perfect matches
                for you
              </p>
              <div className="grid gap-6">
                {suggestedUniversities.map((uni, index) => {
                  // Convert SuggestedUniversity to University format for UnivCard
                  const universityForCard = {
                    id: `ai-suggested-${uni.name
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`,
                    name: uni.name,
                    location: uni.location,
                    country: uni.country,
                    ranking: uni.ranking || 0,
                    studentCount: uni.studentCount || 0,
                    establishedYear: uni.establishedYear || 0,
                    type: uni.type as "public" | "private",
                    tuitionRange: uni.tuitionRange || "Not specified",
                    acceptanceRate: uni.acceptanceRate || "Not specified",
                    description: uni.description || uni.reasoning,
                    website: uni.website || "",
                    source: "AI Generated",
                    imageUrl: undefined,
                    specialties: uni.specialties,
                    campusSize: uni.campusSize,
                    roomBoardCost: uni.roomBoardCost,
                    booksSuppliesCost: uni.booksSuppliesCost,
                    personalExpensesCost: uni.personalExpensesCost,
                    facilitiesInfo: uni.facilitiesInfo,
                    housingOptions: uni.housingOptions,
                    studentOrganizations: uni.studentOrganizations,
                    diningOptions: uni.diningOptions,
                    transportationInfo: uni.transportationInfo,
                  };

                  return (
                    <div key={index} className="relative">
                      <UnivCard
                        university={universityForCard}
                        savedItems={Array.from(favoriteIds)}
                        onToggleSaved={(id) =>
                          toggleSaved(id, universityForCard)
                        }
                        onSelectUniversity={() => {}}
                        userToken={token ? token : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <Button
              onClick={() => {
                setHasStarted(false);
                setMatches([]);
                setSuggestedUniversities([]);
                setProgress(0);
              }}
            >
              {t("searchAgain")}
            </Button>
          </div>
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
              {!hasStarted ? (
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
                      <ItemTitle>{t("matching")}</ItemTitle>
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
                          setHasStarted(false);
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
