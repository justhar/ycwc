"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Users,
  Star,
  Calendar,
  GraduationCap,
  Building,
  Globe,
  Filter,
  SortAsc,
  X,
  ExternalLink,
  Heart,
  Bookmark,
  Sparkles,
  DollarSign,
  TrendingUp,
  Coffee,
  Home,
  Utensils,
  Wifi,
  BookOpen,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
  Favorite,
  addScholarshipToFavorites,
  removeScholarshipFromFavorites,
  getScholarshipFavorites,
  ScholarshipFavorite,
} from "@/lib/api";
import UnivCard from "@/components/UnivCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScholarshipCard from "@/components/ScholarshipCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { debounce } from "lodash";

// Types
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
  acceptanceRate: string; // decimal stored as string
  description: string;
  website: string;
  imageUrl?: string;
  specialties: string[];
  campusSize?: string;
  source?: string; // Added for AI-generated vs manual entries
  // Additional backend fields
  roomBoardCost?: string;
  booksSuppliesCost?: string;
  personalExpensesCost?: string;
  facilitiesInfo?: Record<string, string | undefined>;
  housingOptions?: string[];
  studentOrganizations?: string[];
  diningOptions?: string[];
  transportationInfo?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Program {
  id: string;
  name: string;
  degree?: "bachelor" | "master" | "phd";
  duration?: string;
  tuition?: string;
  description?: string;
  requirements?: string[];
  careerProspects?: string[];
  universityId?: string;
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
}

interface SearchReturn {
  universities: University[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ScholarshipSearchReturn {
  scholarships: Scholarship[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API client functions
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://ycwc-backend.vercel.app";

const fetchUniversities = async (params?: {
  search?: string;
  country?: string;
  type?: string;
  minRanking?: string;
  maxRanking?: string;
  minTuition?: string;
  maxTuition?: string;
  minAcceptanceRate?: string;
  maxAcceptanceRate?: string;
  limit?: string;
  offset?: string;
}): Promise<SearchReturn> => {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.country && params.country !== "all")
    searchParams.append("country", params.country);
  if (params?.type && params.type !== "all")
    searchParams.append("type", params.type);
  if (params?.minRanking) searchParams.append("minRanking", params.minRanking);
  if (params?.maxRanking) searchParams.append("maxRanking", params.maxRanking);
  if (params?.minTuition) searchParams.append("minTuition", params.minTuition);
  if (params?.maxTuition) searchParams.append("maxTuition", params.maxTuition);
  if (params?.minAcceptanceRate)
    searchParams.append("minAcceptanceRate", params.minAcceptanceRate);
  if (params?.maxAcceptanceRate)
    searchParams.append("maxAcceptanceRate", params.maxAcceptanceRate);
  if (params?.limit) searchParams.append("limit", params.limit);
  if (params?.offset) searchParams.append("offset", params.offset);

  const response = await fetch(`${API_BASE_URL}/universities?${searchParams}`);
  if (!response.ok) {
    throw new Error("Failed to fetch universities");
  }
  return response.json();
};

const fetchScholarships = async (params?: {
  search?: string;
  country?: string;
  type?: string;
  limit?: string;
  offset?: string;
}): Promise<ScholarshipSearchReturn> => {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.country && params.country !== "all")
    searchParams.append("country", params.country);
  if (params?.type && params.type !== "all")
    searchParams.append("type", params.type);
  if (params?.limit) searchParams.append("limit", params.limit);
  if (params?.offset) searchParams.append("offset", params.offset);

  const response = await fetch(`${API_BASE_URL}/scholarships?${searchParams}`);
  if (!response.ok) {
    throw new Error("Failed to fetch scholarships");
  }

  return await response.json();
};

const fetchUniversityScholarships = async (
  universityId: string
): Promise<Scholarship[]> => {
  const response = await fetch(
    `${API_BASE_URL}/universities/${universityId}/scholarships`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch university scholarships");
  }
  return response.json();
};

export default function SearchPage() {
  const { user, token } = useAuth();

  // Controlled input value for the search box
  const [queryInput, setQueryInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("ranking");

  // Advanced filter states
  const [minRanking, setMinRanking] = useState("");
  const [maxRanking, setMaxRanking] = useState("");
  const [minTuition, setMinTuition] = useState("");
  const [maxTuition, setMaxTuition] = useState("");
  const [minAcceptanceRate, setMinAcceptanceRate] = useState("");
  const [maxAcceptanceRate, setMaxAcceptanceRate] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("universities");
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Backend favorites instead of local savedItems
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // API state management
  const [universities, setUniversities] = useState<University[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [universityScholarships, setUniversityScholarships] = useState<
    Record<string, Scholarship[]>
  >({});

  // Scholarship favorites
  const [scholarshipFavorites, setScholarshipFavorites] = useState<string[]>(
    []
  );

  // Pagination state
  const [universityPagination, setUniversityPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    totalPages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [scholarshipPagination, setScholarshipPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    totalPages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Initial load on mount
  useEffect(() => {
    const loadOnMount = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load both universities and scholarships with pagination
        const [universityData, scholarshipData] = await Promise.all([
          fetchUniversities({ limit: "20", offset: "0" }),
          fetchScholarships({ limit: "20", offset: "0" }),
        ]);

        // Set universities and pagination
        setUniversities(universityData.universities);
        setUniversityPagination(universityData.pagination);

        // Set scholarships and pagination
        setScholarships(scholarshipData.scholarships);
        setScholarshipPagination(scholarshipData.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        console.error("Error fetching data on mount:", err);
        setUniversities([]);
        setScholarships([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadOnMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Since we're using server-side pagination, we don't need client-side filtering
  // Just use the universities and scholarships directly from the API
  const filteredUniversities = universities || [];
  const filteredScholarships = scholarships || [];

  // Mock programs for now (will be updated later)
  const mockPrograms: Program[] = [];
  const filteredPrograms = mockPrograms.filter((program) => {
    return (
      program.name.toLowerCase().includes(queryInput.toLowerCase()) ||
      program.description?.toLowerCase().includes(queryInput.toLowerCase())
    );
  });

  // Load user's favorites when authenticated
  useEffect(() => {
    const loadFavorites = async () => {
      if (user && token) {
        try {
          const userFavorites = await getUserFavorites(token);
          setFavorites(userFavorites);
          const favoriteUniversityIds = new Set(
            userFavorites.map((fav) => fav.university.id)
          );
          setFavoriteIds(favoriteUniversityIds);

          // Load scholarship favorites
          const userScholarshipFavorites = await getScholarshipFavorites(token);
          const favoriteScholarshipIds = userScholarshipFavorites.map(
            (scholarship) => scholarship.id
          );
          setScholarshipFavorites(favoriteScholarshipIds);
        } catch (error) {
          console.error("Failed to load favorites:", error);
        }
      }
    };

    loadFavorites();
  }, [user, token]);

  // Load data when tab changes
  useEffect(() => {
    // Reset search to default (no search term)
    if (activeTab === "universities") {
      performSearch(1, "");
    } else if (activeTab === "scholarships") {
      performScholarshipSearch(1, "");
    }
  }, [activeTab]);

  const toggleSaved = async (universityId: string) => {
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
        setFavorites((prev) =>
          prev.filter((fav) => fav.university.id !== universityId)
        );
      } else {
        // Add to favorites
        const result = await addToFavorites(token, universityId);
        setFavoriteIds((prev) => new Set([...prev, universityId]));
        // We could refetch favorites or optimistically update
        const userFavorites = await getUserFavorites(token);
        setFavorites(userFavorites);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const toggleScholarshipSaved = async (scholarshipId: string) => {
    if (!user || !token) {
      return;
    }

    try {
      if (scholarshipFavorites.includes(scholarshipId)) {
        // Remove from favorites
        await removeScholarshipFromFavorites(token, scholarshipId);
        setScholarshipFavorites((prev) =>
          prev.filter((id) => id !== scholarshipId)
        );
      } else {
        // Add to favorites
        await addScholarshipToFavorites(token, scholarshipId);
        setScholarshipFavorites((prev) => [...prev, scholarshipId]);
      }
    } catch (error) {
      console.error("Failed to toggle scholarship favorite:", error);
    }
  };

  // Handle search for both tabs
  const handleSearch = () => {
    if (activeTab === "universities") {
      performSearch(1, queryInput);
    } else if (activeTab === "scholarships") {
      performScholarshipSearch(1, queryInput);
    }
  };

  // Perform search with explicit filter values
  const performSearchWithFilters = async (
    page: number = 1,
    searchTerm: string,
    country: string,
    type: string,
    minRank: string,
    maxRank: string,
    minTuit: string,
    maxTuit: string,
    minAccept: string,
    maxAccept: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const offset = (page - 1) * 20;

      if (activeTab === "universities") {
        const data = await fetchUniversities({
          search: searchTerm || undefined,
          country: country !== "all" ? country : undefined,
          type: type !== "all" ? type : undefined,
          minRanking: minRank || undefined,
          maxRanking: maxRank || undefined,
          minTuition: minTuit || undefined,
          maxTuition: maxTuit || undefined,
          minAcceptanceRate: minAccept || undefined,
          maxAcceptanceRate: maxAccept || undefined,
          limit: "20",
          offset: offset.toString(),
        });

        setUniversities(data.universities);
        setUniversityPagination(data.pagination);
      } else if (activeTab === "scholarships") {
        const data = await fetchScholarships({
          search: searchTerm || undefined,
          country: country !== "all" ? country : undefined,
          type: type !== "all" ? type : undefined,
          limit: "20",
          offset: offset.toString(),
        });

        setScholarships(data.scholarships);
        setScholarshipPagination(data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle real-time search on input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQueryInput(newValue);

    // Only search the active tab
    if (activeTab === "universities") {
      performSearch(1, newValue);
    } else if (activeTab === "scholarships") {
      performScholarshipSearch(1, newValue);
    }
  };

  // Called when the user types or clicks Search; fetches results
  const performSearch = async (page: number = 1, searchTerm?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const offset = (page - 1) * 20;
      // Use provided searchTerm or fall back to queryInput
      const term = searchTerm !== undefined ? searchTerm : queryInput;

      const data = await fetchUniversities({
        search: term || undefined,
        country: selectedCountry !== "all" ? selectedCountry : undefined,
        type: selectedType !== "all" ? selectedType : undefined,
        minRanking: minRanking || undefined,
        maxRanking: maxRanking || undefined,
        minTuition: minTuition || undefined,
        maxTuition: maxTuition || undefined,
        minAcceptanceRate: minAcceptanceRate || undefined,
        maxAcceptanceRate: maxAcceptanceRate || undefined,
        limit: "20",
        offset: offset.toString(),
      });

      setUniversities(data.universities);
      setUniversityPagination(data.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch universities"
      );
      console.error("Error fetching universities on search:", err);
      setUniversities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search scholarships with pagination
  const performScholarshipSearch = async (
    page: number = 1,
    searchTerm?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const offset = (page - 1) * 20;
      // Use provided searchTerm or fall back to queryInput
      const term = searchTerm !== undefined ? searchTerm : queryInput;

      const data = await fetchScholarships({
        search: term || undefined,
        country: selectedCountry !== "all" ? selectedCountry : undefined,
        type: selectedType !== "all" ? selectedType : undefined,
        limit: "20",
        offset: offset.toString(),
      });

      setScholarships(data.scholarships);
      setScholarshipPagination(data.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch scholarships"
      );
      console.error("Error fetching scholarships on search:", err);
      setScholarships([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Explore Universities & Programs
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Discover your ideal university and program match
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved ({favorites.length})
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative flex items-center">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search universities, scholarships..."
                    value={queryInput}
                    onChange={handleSearchInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="pl-10"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={selectedCountry}
                    onValueChange={(value) => {
                      setSelectedCountry(value);
                      // Perform search with new country filter
                      performSearchWithFilters(
                        1,
                        queryInput,
                        value,
                        selectedType,
                        minRanking,
                        maxRanking,
                        minTuition,
                        maxTuition,
                        minAcceptanceRate,
                        maxAcceptanceRate
                      );
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="United States">
                        United States
                      </SelectItem>
                      <SelectItem value="United Kingdom">
                        United Kingdom
                      </SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedType}
                    onValueChange={(value) => {
                      setSelectedType(value);
                      // Perform search with new type filter
                      performSearchWithFilters(
                        1,
                        queryInput,
                        selectedCountry,
                        value,
                        minRanking,
                        maxRanking,
                        minTuition,
                        maxTuition,
                        minAcceptanceRate,
                        maxAcceptanceRate
                      );
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ranking">Ranking</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="acceptance">
                        Acceptance Rate
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Advanced
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                  <h3 className="text-sm font-medium text-foreground">
                    Advanced Filters
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Ranking Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Ranking Range
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Min"
                          value={minRanking}
                          onChange={(e) => setMinRanking(e.target.value)}
                          type="number"
                          className="w-20"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          placeholder="Max"
                          value={maxRanking}
                          onChange={(e) => setMaxRanking(e.target.value)}
                          type="number"
                          className="w-20"
                        />
                      </div>
                    </div>

                    {/* Tuition Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Tuition Range ($)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Min"
                          value={minTuition}
                          onChange={(e) => setMinTuition(e.target.value)}
                          type="number"
                          className="w-24"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          placeholder="Max"
                          value={maxTuition}
                          onChange={(e) => setMaxTuition(e.target.value)}
                          type="number"
                          className="w-24"
                        />
                      </div>
                    </div>

                    {/* Acceptance Rate Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Acceptance Rate (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Min"
                          value={minAcceptanceRate}
                          onChange={(e) => setMinAcceptanceRate(e.target.value)}
                          type="number"
                          step="0.1"
                          className="w-20"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          placeholder="Max"
                          value={maxAcceptanceRate}
                          onChange={(e) => setMaxAcceptanceRate(e.target.value)}
                          type="number"
                          step="0.1"
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMinRanking("");
                        setMaxRanking("");
                        setMinTuition("");
                        setMaxTuition("");
                        setMinAcceptanceRate("");
                        setMaxAcceptanceRate("");
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Advanced Filters
                    </Button>
                    <Button size="sm" onClick={handleSearch}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* Results with Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="universities"
                className="flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                Universities ({filteredUniversities.length})
              </TabsTrigger>
              <TabsTrigger
                value="scholarships"
                className="flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                Scholarships ({filteredScholarships.length})
              </TabsTrigger>
            </TabsList>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Loading data...</h3>
                <p className="text-muted-foreground">
                  Please wait while we fetch the latest information.
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-destructive">
                  Failed to load data
                </h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Universities Tab */}
            <TabsContent value="universities" className="mt-6">
              {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUniversities.map((university) => (
                    <UnivCard
                      key={university.id}
                      university={{
                        ...university,
                        source: university.source || "manual",
                      }}
                      savedItems={Array.from(favoriteIds)}
                      onToggleSaved={toggleSaved}
                      onSelectUniversity={setSelectedUniversity}
                      userToken={token ? token : undefined}
                    />
                  ))}
                </div>
              )}

              {/* University Pagination */}
              {!isLoading && !error && filteredUniversities.length > 0 && (
                <div className="flex items-center justify-center space-x-4 mt-8">
                  <Button
                    variant="outline"
                    disabled={!universityPagination.hasPrev}
                    onClick={() =>
                      performSearch(universityPagination.currentPage - 1)
                    }
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-2">
                    {[
                      ...Array(Math.min(universityPagination.totalPages, 5)),
                    ].map((_, index) => {
                      const startPage = Math.max(
                        1,
                        universityPagination.currentPage - 2
                      );
                      const pageNumber = startPage + index;

                      if (pageNumber > universityPagination.totalPages)
                        return null;

                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            pageNumber === universityPagination.currentPage
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => performSearch(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    disabled={!universityPagination.hasNext}
                    onClick={() =>
                      performSearch(universityPagination.currentPage + 1)
                    }
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Universities Results Info */}
              {!isLoading && !error && filteredUniversities.length > 0 && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  Showing {universityPagination.offset + 1} to{" "}
                  {Math.min(
                    universityPagination.offset + universityPagination.limit,
                    universityPagination.total
                  )}{" "}
                  of {universityPagination.total} universities
                </div>
              )}

              {/* No Universities Results */}
              {!isLoading && !error && filteredUniversities.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No universities found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Scholarships Tab */}
            <TabsContent value="scholarships" className="mt-6">
              {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredScholarships.map((scholarship) => (
                    <ScholarshipCard
                      key={scholarship.id}
                      scholarship={scholarship}
                      savedItems={scholarshipFavorites}
                      onToggleSaved={toggleScholarshipSaved}
                    />
                  ))}
                </div>
              )}

              {/* Scholarship Pagination */}
              {!isLoading && !error && filteredScholarships.length > 0 && (
                <div className="flex items-center justify-center space-x-4 mt-8">
                  <Button
                    variant="outline"
                    disabled={!scholarshipPagination.hasPrev}
                    onClick={() =>
                      performScholarshipSearch(
                        scholarshipPagination.currentPage - 1
                      )
                    }
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-2">
                    {[
                      ...Array(Math.min(scholarshipPagination.totalPages, 5)),
                    ].map((_, index) => {
                      const startPage = Math.max(
                        1,
                        scholarshipPagination.currentPage - 2
                      );
                      const pageNumber = startPage + index;

                      if (pageNumber > scholarshipPagination.totalPages)
                        return null;

                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            pageNumber === scholarshipPagination.currentPage
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => performScholarshipSearch(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    disabled={!scholarshipPagination.hasNext}
                    onClick={() =>
                      performScholarshipSearch(
                        scholarshipPagination.currentPage + 1
                      )
                    }
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Scholarships Results Info */}
              {!isLoading && !error && filteredScholarships.length > 0 && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  Showing {scholarshipPagination.offset + 1} to{" "}
                  {Math.min(
                    scholarshipPagination.offset + scholarshipPagination.limit,
                    scholarshipPagination.total
                  )}{" "}
                  of {scholarshipPagination.total} scholarships
                </div>
              )}

              {/* No Scholarships Results */}
              {!isLoading && !error && filteredScholarships.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No scholarships found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
