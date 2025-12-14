"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Award, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import UnivCard from "@/components/UnivCard";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UniversityMatch,
  SuggestedUniversity,
  University,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  Favorite,
} from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/contexts/AuthContext";

// localStorage utilities
const MATCH_RESULTS_KEY = "match_results";

interface MatchResultsData {
  matches: UniversityMatch[];
  suggestedUniversities: SuggestedUniversity[];
  timestamp: number;
}

const getMatchResults = (): MatchResultsData | null => {
  try {
    const stored = localStorage.getItem(MATCH_RESULTS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading match results:", error);
    return null;
  }
};

export default function MatchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileChanged = searchParams.get("profileChanged") === "true";
  const { user, token } = useAuth();

  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [matches, setMatches] = useState<UniversityMatch[]>([]);
  const [suggestedUniversities, setSuggestedUniversities] = useState<
    SuggestedUniversity[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Backend favorites instead of local savedItems
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Load match results from localStorage
  useEffect(() => {
    const savedResults = getMatchResults();
    if (savedResults) {
      setMatches(savedResults.matches);
      setSuggestedUniversities(savedResults.suggestedUniversities);
    } else {
      // No results found, redirect back to match page
      router.push("/match");
    }
    setLoading(false);
  }, [router]);

  // Load user's favorites when authenticated
  useEffect(() => {
    const loadFavorites = async () => {
      if (user && token) {
        try {
          const userFavorites = await getUserFavorites(token);
          setFavorites(userFavorites);

          // Create favoriteIds set from actual database IDs
          const favoriteIdsSet = new Set<string>();
          userFavorites.forEach((fav: any) => {
            // Always use the actual university ID from the database
            favoriteIdsSet.add(fav.university.id);
          });

          setFavoriteIds(favoriteIdsSet);
        } catch (error) {
          console.error("Failed to load favorites:", error);
        }
      }
    };

    loadFavorites();
  }, [user, token]);

  // Handle new match request
  const handleNewMatch = () => {
    // Clear localStorage and redirect to match page
    localStorage.removeItem(MATCH_RESULTS_KEY);
    localStorage.removeItem("ycwc_profile_snapshot");
    router.push("/match");
  };

  const toggleSaved = async (universityId: string, university?: any) => {
    if (!user || !token) {
      // If user is not authenticated, could show login prompt
      console.log("Please log in to save favorites");
      return;
    }

    const isCurrentlyFavorited = favoriteIds.has(universityId);

    try {
      if (isCurrentlyFavorited) {
        // Remove from favorites - update state optimistically
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(universityId);
          return newSet;
        });

        // Remove from favorites list
        setFavorites((prev) =>
          prev.filter((fav) => fav.university.id !== universityId)
        );

        // Call backend to remove favorite
        try {
          await removeFromFavorites(token, universityId);
        } catch (error) {
          console.error("Failed to remove from favorites, reverting:", error);
          // Revert optimistic update on error
          setFavoriteIds((prev) => new Set([...prev, universityId]));
          if (university) {
            setFavorites((prev) => [
              ...prev,
              {
                id: `fav_${universityId}`,
                userId: "",
                university,
                createdAt: new Date().toISOString(),
              },
            ]);
          }
        }
      } else {
        // Add to favorites - update state optimistically
        setFavoriteIds((prev) => new Set([...prev, universityId]));

        // Call backend to add favorite
        try {
          await addToFavorites(token, universityId, university);
          // On success, reload to ensure sync
          const userFavorites = await getUserFavorites(token);
          setFavorites(userFavorites);

          // Rebuild favoriteIds from backend response to ensure accuracy
          const favoriteIdsSet = new Set<string>();
          userFavorites.forEach((fav: any) => {
            favoriteIdsSet.add(fav.university.id);
          });
          setFavoriteIds(favoriteIdsSet);
        } catch (error) {
          console.error("Failed to add to favorites, reverting:", error);
          // Revert optimistic update on error
          setFavoriteIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(universityId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // Reload favorites to revert to correct state on any error
      try {
        const userFavorites = await getUserFavorites(token);
        const favoriteIdsSet = new Set<string>();
        userFavorites.forEach((fav: any) => {
          favoriteIdsSet.add(fav.university.id);
        });
        setFavoriteIds(favoriteIdsSet);
      } catch (reloadError) {
        console.error("Failed to reload favorites after error:", reloadError);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your matches...</p>
          </div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="w-full px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any university matches for your profile.
            </p>
            <Button onClick={handleNewMatch} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="w-full px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Changed Banner */}
          {profileChanged && (
            <div className="mb-6">
              <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <span className="font-medium">Profile Updated:</span> Your
                      academic profile has been modified since your last match.
                      These results may no longer be accurate based on your
                      current information.
                    </p>
                  </div>
                  <Button
                    onClick={handleNewMatch}
                    size="sm"
                    className="ml-4 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Get New Matches
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-4xl font-semibold mb-4">
              Your University Matches
            </h2>
            <p className="text-gray-600">
              Found {matches.length} universities that match your profile
            </p>
            <div className="mt-6">
              <Button onClick={handleNewMatch} variant="outline">
                Search Again
              </Button>
            </div>
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
                    <p className="text-sm text-gray-500">Match Score</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">
                    Why this is a good match:
                  </h4>
                  <p className="text-gray-700">{match.reasoning}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="text-sm space-y-1">
                      {match.strengths.map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Considerations
                    </h4>
                    <ul className="text-sm space-y-1">
                      {match.concerns.map((concern: string, i: number) => (
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
                  // Use actual database ID if available (for inserted universities)
                  const universityForCard = {
                    id:
                      uni.id ||
                      `ai-suggested-${uni.name
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
                    source: uni.source || "ai_suggested",
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
        </div>
      </div>
    </ProtectedRoute>
  );
}
