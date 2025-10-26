"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Cloud,
  GraduationCap,
  WandSparkles,
  SquarePen,
  Plus,
  X,
  Sparkles,
  Star,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UnivCard from "@/components/UnivCard";
import { debounce } from "lodash";
import {
  getUserFavorites,
  removeFromFavorites,
  Favorite,
  getScholarshipFavorites,
  removeScholarshipFromFavorites,
  ScholarshipFavorite,
} from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScholarshipCard from "@/components/ScholarshipCard";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Isolated Input Components
interface ControlledInputProps {
  value?: string;
  placeholder?: string;
  type?: string;
  onUpdate: (value: string) => void;
  className?: string;
}

function ControlledInput({
  value: initialValue = "",
  placeholder,
  type = "text",
  onUpdate,
  className,
}: ControlledInputProps) {
  const [value, setValue] = useState(initialValue);
  const updateRef = useRef<string>(initialValue);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((val: string) => {
      onUpdate(val);
    }, 300),
    [onUpdate]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      updateRef.current = newValue;
      debouncedUpdate(newValue);
    },
    [debouncedUpdate]
  );

  // Update local state when external value changes
  useEffect(() => {
    if (initialValue !== updateRef.current) {
      setValue(initialValue);
      updateRef.current = initialValue;
    }
  }, [initialValue]);

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      type={type}
      className={className}
    />
  );
}

interface ControlledSelectProps {
  value?: string;
  onUpdate: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

function ControlledSelect({
  value: initialValue = "",
  onUpdate,
  placeholder,
  children,
  className,
}: ControlledSelectProps) {
  const [value, setValue] = useState(initialValue);
  const updateRef = useRef<string>(initialValue);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((val: string) => {
      onUpdate(val);
    }, 300),
    [onUpdate]
  );

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      updateRef.current = newValue;
      debouncedUpdate(newValue);
    },
    [debouncedUpdate]
  );

  // Update local state when external value changes
  useEffect(() => {
    if (initialValue !== updateRef.current) {
      setValue(initialValue);
      updateRef.current = initialValue;
    }
  }, [initialValue]);

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      {children}
    </Select>
  );
}

interface ControlledTextareaProps {
  value?: string;
  placeholder?: string;
  onUpdate: (value: string) => void;
  className?: string;
}

function ControlledTextarea({
  value: initialValue = "",
  placeholder,
  onUpdate,
  className,
}: ControlledTextareaProps) {
  const [value, setValue] = useState(initialValue);
  const updateRef = useRef<string>(initialValue);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((val: string) => {
      onUpdate(val);
    }, 300),
    [onUpdate]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      updateRef.current = newValue;
      debouncedUpdate(newValue);
    },
    [debouncedUpdate]
  );

  // Update local state when external value changes
  useEffect(() => {
    if (initialValue !== updateRef.current) {
      setValue(initialValue);
      updateRef.current = initialValue;
    }
  }, [initialValue]);

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}

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
  imageUrl?: string;
  specialties: string[];
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

interface Program {
  id: string;
  name: string;
  degree: "bachelor" | "master" | "phd";
  duration: string;
  tuition: string;
  description: string;
  requirements: string[];
  careerProspects: string[];
  universityId: string;
}

const mockUniversities: University[] = [
  {
    id: "1",
    name: "Stanford University",
    location: "Stanford, California",
    country: "United States",
    ranking: 2,
    studentCount: 17249,
    establishedYear: 1885,
    type: "private",
    tuitionRange: "$56,169 - $58,416",
    acceptanceRate: "4.3",
    description:
      "Stanford University is a private research university in Stanford, California. Known for its academic excellence, entrepreneurial spirit, and proximity to Silicon Valley.",
    website: "https://www.stanford.edu",
    imageUrl: "/university-placeholder.jpg",
    specialties: ["Computer Science", "Engineering", "Business", "Medicine"],
    campusSize: "8,180 acres",
  },
  {
    id: "2",
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, Massachusetts",
    country: "United States",
    ranking: 1,
    studentCount: 11858,
    establishedYear: 1861,
    type: "private",
    tuitionRange: "$57,986 - $59,750",
    acceptanceRate: "6.7",
    description:
      "MIT is a private research university in Cambridge, Massachusetts. The institute has an urban campus that extends more than a mile alongside the Charles River.",
    website: "https://www.mit.edu",
    imageUrl: "/university-placeholder.jpg",
    specialties: ["Engineering", "Computer Science", "Physics", "Mathematics"],
    campusSize: "168 acres",
  },
  {
    id: "3",
    name: "Harvard University",
    location: "Cambridge, Massachusetts",
    country: "United States",
    ranking: 3,
    studentCount: 23731,
    establishedYear: 1636,
    type: "private",
    tuitionRange: "$54,002 - $57,261",
    acceptanceRate: "3.4",
    description:
      "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636, Harvard is the oldest institution of higher education in the United States.",
    website: "https://www.harvard.edu",
    imageUrl: "/university-placeholder.jpg",
    specialties: ["Law", "Medicine", "Business", "Liberal Arts"],
    campusSize: "5,076 acres",
  },
  {
    id: "4",
    name: "University of Oxford",
    location: "Oxford, England",
    country: "United Kingdom",
    ranking: 4,
    studentCount: 24515,
    establishedYear: 1096,
    type: "public",
    tuitionRange: "£9,250 - £38,000",
    acceptanceRate: "17.5",
    description:
      "The University of Oxford is a collegiate research university in Oxford, England. There is evidence of teaching as early as 1096, making it the oldest university in the English-speaking world.",
    website: "https://www.ox.ac.uk",
    imageUrl: "/university-placeholder.jpg",
    specialties: ["Philosophy", "Politics", "Economics", "Literature"],
    campusSize: "Collegiate system",
  },
  {
    id: "5",
    name: "University of Cambridge",
    location: "Cambridge, England",
    country: "United Kingdom",
    ranking: 5,
    studentCount: 24450,
    establishedYear: 1209,
    type: "public",
    tuitionRange: "£9,250 - £33,825",
    acceptanceRate: "21.0",
    description:
      "The University of Cambridge is a collegiate research university in Cambridge, United Kingdom. Founded in 1209 and granted a royal charter by Henry III in 1231.",
    website: "https://www.cam.ac.uk",
    imageUrl: "/university-placeholder.jpg",
    specialties: [
      "Mathematics",
      "Natural Sciences",
      "Engineering",
      "Computer Science",
    ],
    campusSize: "Collegiate system",
  },
  {
    id: "6",
    name: "National University of Singapore",
    location: "Singapore",
    country: "Singapore",
    ranking: 11,
    studentCount: 40000,
    establishedYear: 1905,
    type: "public",
    tuitionRange: "S$17,550 - S$45,000",
    acceptanceRate: "5.0",
    description:
      "The National University of Singapore is a national public research university in Singapore. Founded in 1905 as the Straits Settlements and Federated Malay States Government Medical School.",
    website: "https://www.nus.edu.sg",
    imageUrl: "/university-placeholder.jpg",
    specialties: ["Engineering", "Business", "Computer Science", "Medicine"],
    campusSize: "1,200 acres",
  },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export default function DashboardPage() {
  const {
    user,
    profile,
    profileLoading,
    fetchProfile,
    updateProfile,
    updateUserInformation,
    token,
  } = useAuth();
  const t = useTranslations("profile");
  const [files, setFiles] = useState<File[] | undefined>();

  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [savedItems, setSavedItems] = useState<string[]>([]);

  // Favorites state
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [scholarshipFavorites, setScholarshipFavorites] = useState<
    ScholarshipFavorite[]
  >([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [scholarshipFavoritesLoading, setScholarshipFavoritesLoading] =
    useState(false);

  // Profile data state - initialize from context profile
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    dateOfBirth: profile?.dateOfBirth || "",
    nationality: profile?.nationality || "Indonesia",
    email: user?.email || "",
    targetLevel: profile?.targetLevel || "",
    intendedMajor: profile?.intendedMajor || "",
    intendedCountry: profile?.intendedCountry || "",
    budgetMin: profile?.budgetMin?.toString() || "",
    budgetMax: profile?.budgetMax?.toString() || "",
    institution: profile?.institution || "",
    graduationYear: profile?.graduationYear?.toString() || "",
    academicScore: profile?.academicScore || "",
    scoreScale: profile?.scoreScale || "gpa4",
  });

  // State for lists - initialize from context profile
  const [englishTests, setEnglishTests] = useState(profile?.englishTests || []);
  const [standardizedTests, setStandardizedTests] = useState(
    profile?.standardizedTests || []
  );
  const [awards, setAwards] = useState(profile?.awards || []);
  const [extracurriculars, setExtracurriculars] = useState(
    profile?.extracurriculars || []
  );

  // Load profile data on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update local state when profile changes - only once, not on every render
  useEffect(() => {
    if (profile) {
      setProfileData((prev) => ({
        ...prev,
        dateOfBirth: profile.dateOfBirth || "",
        nationality: profile.nationality || "Indonesia",
        targetLevel: profile.targetLevel || "",
        intendedMajor: profile.intendedMajor || "",
        intendedCountry: profile.intendedCountry || "",
        budgetMin: profile.budgetMin?.toString() || "",
        budgetMax: profile.budgetMax?.toString() || "",
        institution: profile.institution || "",
        graduationYear: profile.graduationYear?.toString() || "",
        academicScore: profile.academicScore || "",
        scoreScale: profile.scoreScale || "gpa4",
      }));
      setEnglishTests(profile.englishTests || []);
      setStandardizedTests(profile.standardizedTests || []);
      setAwards(profile.awards || []);
      setExtracurriculars(profile.extracurriculars || []);
    }
  }, [profile]);

  // Update basic user info when user changes
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Load favorites on mount and when user changes
  useEffect(() => {
    const loadFavorites = async () => {
      if (user && token) {
        setFavoritesLoading(true);
        setScholarshipFavoritesLoading(true);
        try {
          // Load university favorites
          const favorites = await getUserFavorites(token);
          setFavorites(favorites);
          // Update savedItems for backward compatibility with UnivCard
          const favoriteIds = favorites.map((fav) => fav.university.id);
          setSavedItems(favoriteIds);

          // Load scholarship favorites
          const scholarshipFavs = await getScholarshipFavorites(token);
          setScholarshipFavorites(scholarshipFavs);
        } catch (error) {
          console.error("Error loading favorites:", error);
          toast.error(t("errorOccurred"));
        } finally {
          setFavoritesLoading(false);
          setScholarshipFavoritesLoading(false);
        }
      }
    };

    loadFavorites();
  }, [user, token]);

  // Edit dialog state
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Test form states
  const [selectedEnglishTestType, setSelectedEnglishTestType] = useState("");
  const [customEnglishTestTitle, setCustomEnglishTestTitle] = useState("");
  const [englishTestScore, setEnglishTestScore] = useState("");
  const [englishTestDate, setEnglishTestDate] = useState("");

  const [selectedStandardizedTestType, setSelectedStandardizedTestType] =
    useState("");
  const [customStandardizedTestTitle, setCustomStandardizedTestTitle] =
    useState("");
  const [standardizedTestScore, setStandardizedTestScore] = useState("");
  const [standardizedTestDate, setStandardizedTestDate] = useState("");

  // Awards form states
  const [awardTitle, setAwardTitle] = useState("");
  const [awardYear, setAwardYear] = useState("");
  const [awardLevel, setAwardLevel] = useState("");

  // Extracurriculars form states
  const [activityName, setActivityName] = useState("");
  const [activityPeriod, setActivityPeriod] = useState("");
  const [activityDescription, setActivityDescription] = useState("");

  const toggleSaved = async (id: string) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      const isSaved = savedItems.includes(id);

      if (isSaved) {
        // Remove from favorites
        await removeFromFavorites(token, id);
        setSavedItems((prev) => prev.filter((item) => item !== id));
        setFavorites((prev) => prev.filter((fav) => fav.university.id !== id));
        toast.success("University removed from favorites");
      } else {
        // This shouldn't happen in the profile page since we only show existing favorites
        // But we'll handle it for consistency
        setSavedItems((prev) => [...prev, id]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Error updating favorites");
    }
  };

  const toggleScholarshipSaved = async (scholarshipId: string) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      // Remove from scholarship favorites (since we're only showing existing favorites in profile)
      await removeScholarshipFromFavorites(token, scholarshipId);
      setScholarshipFavorites((prev) =>
        prev.filter((fav) => fav.id !== scholarshipId)
      );
      toast.success("Scholarship removed from favorites");
    } catch (error) {
      console.error("Error toggling scholarship favorite:", error);
      toast.error("Error updating scholarship favorites");
    }
  };

  // AI autofill section visibility state
  const [showAISection, setShowAISection] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const handleDrop = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const file = files[0];

      // Validate file type
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setIsAIProcessing(true);

      try {
        const formData = new FormData();
        formData.append("cv", file);

        const response = await fetch(`${API_BASE_URL}/ai/profile-autofill`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to process CV");
        }

        if (result.success && result.data) {
          // Map AI response to profile data
          const aiData = result.data;

          // Update profile data with AI results
          setProfileData((prev) => ({
            ...prev,
            fullName: aiData.fullName || prev.fullName,
            email: aiData.email || prev.email,
            dateOfBirth: aiData.dateOfBirth || prev.dateOfBirth,
            nationality: aiData.nationality || prev.nationality,
            targetLevel: aiData.targetLevel || prev.targetLevel,
            intendedMajor: aiData.intendedMajor || prev.intendedMajor,
            intendedCountry: aiData.intendedCountry || prev.intendedCountry,
            budgetMin: aiData.budgetMin?.toString() || prev.budgetMin,
            budgetMax: aiData.budgetMax?.toString() || prev.budgetMax,
            institution: aiData.institution || prev.institution,
            graduationYear: aiData.graduationYear || prev.graduationYear,
            academicScore: aiData.gpa || prev.academicScore,
          }));

          // Update arrays separately, ensuring each item has a unique ID
          if (aiData.englishTests && aiData.englishTests.length > 0) {
            const testsWithIds = aiData.englishTests.map(
              (test: any, index: number) => ({
                ...test,
                id: test.id || `ai_english_${Date.now()}_${index}`,
              })
            );
            setEnglishTests(testsWithIds);
          }

          if (aiData.standardizedTests && aiData.standardizedTests.length > 0) {
            const testsWithIds = aiData.standardizedTests.map(
              (test: any, index: number) => ({
                ...test,
                id: test.id || `ai_standard_${Date.now()}_${index}`,
              })
            );
            setStandardizedTests(testsWithIds);
          }

          if (aiData.awards && aiData.awards.length > 0) {
            const awardsWithIds = aiData.awards.map(
              (award: any, index: number) => ({
                ...award,
                id: award.id || `ai_award_${Date.now()}_${index}`,
              })
            );
            setAwards(awardsWithIds);
          }

          if (aiData.extracurriculars && aiData.extracurriculars.length > 0) {
            const activitiesWithIds = aiData.extracurriculars.map(
              (activity: any, index: number) => ({
                ...activity,
                id: activity.id || `ai_activity_${Date.now()}_${index}`,
              })
            );
            setExtracurriculars(activitiesWithIds);
          }

          // Save all AI-extracted data to the cloud
          try {
            // Update user basic info if changed
            if (aiData.fullName && aiData.fullName !== user?.fullName) {
              const userResult = await updateUserInformation({
                fullName: aiData.fullName,
              });
              if (!userResult.success) {
                console.warn("Failed to update user info:", userResult.error);
              }
            }

            // Prepare the complete profile update with all data
            const updatedData = {
              // Basic profile data
              dateOfBirth: aiData.dateOfBirth || profile?.dateOfBirth,
              nationality:
                aiData.nationality || profile?.nationality || "Indonesia",
              targetLevel: aiData.targetLevel || profile?.targetLevel,
              intendedMajor: aiData.intendedMajor || profile?.intendedMajor,
              institution: aiData.institution || profile?.institution,
              graduationYear: aiData.graduationYear || profile?.graduationYear,
              academicScore: aiData.academicScore || profile?.academicScore,
              scoreScale: aiData.scoreScale || profile?.scoreScale,

              // Arrays with processed data
              englishTests:
                aiData.englishTests && aiData.englishTests.length > 0
                  ? aiData.englishTests.map((test: any, index: number) => ({
                      ...test,
                      id: test.id || `ai_english_${Date.now()}_${index}`,
                    }))
                  : englishTests,
              standardizedTests:
                aiData.standardizedTests && aiData.standardizedTests.length > 0
                  ? aiData.standardizedTests.map(
                      (test: any, index: number) => ({
                        ...test,
                        id: test.id || `ai_standard_${Date.now()}_${index}`,
                      })
                    )
                  : standardizedTests,
              awards:
                aiData.awards && aiData.awards.length > 0
                  ? aiData.awards.map((award: any, index: number) => ({
                      ...award,
                      id: award.id || `ai_award_${Date.now()}_${index}`,
                    }))
                  : awards,
              extracurriculars:
                aiData.extracurriculars && aiData.extracurriculars.length > 0
                  ? aiData.extracurriculars.map(
                      (activity: any, index: number) => ({
                        ...activity,
                        id: activity.id || `ai_activity_${Date.now()}_${index}`,
                      })
                    )
                  : extracurriculars,
            };

            // Save to cloud using existing update function
            const profileResult = await updateProfile(updatedData);

            if (profileResult.success) {
              toast.success("Profile data extracted and saved successfully!");
            } else {
              toast.error(
                profileResult.error || "Failed to save profile data to cloud"
              );
            }
          } catch (saveError) {
            console.error("Error saving AI data to cloud:", saveError);
            toast.error(
              "Data extracted but failed to save to cloud. Please save manually."
            );
          }

          setShowAISection(false); // Hide AI section after success
        } else {
          throw new Error("No data received from AI service");
        }
      } catch (error) {
        console.error("AI autofill error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to process CV"
        );
      } finally {
        setIsAIProcessing(false);
      }

      setFiles(files);
    },
    [
      user?.fullName,
      profile,
      englishTests,
      standardizedTests,
      awards,
      extracurriculars,
      updateUserInformation,
      updateProfile,
    ]
  );

  // Memoized input change handlers to prevent lag
  const handleProfileChange = useCallback((field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Helper function to create complete profile updates
  const createProfileUpdate = useCallback(
    (updates: Partial<typeof profile>) => {
      return {
        // Include all current profile data
        dateOfBirth: profile?.dateOfBirth,
        nationality: profile?.nationality,
        targetLevel: profile?.targetLevel,
        intendedMajor: profile?.intendedMajor,
        intendedCountry: profile?.intendedCountry,
        budgetMin: profile?.budgetMin,
        budgetMax: profile?.budgetMax,
        institution: profile?.institution,
        graduationYear: profile?.graduationYear,
        academicScore: profile?.academicScore,
        scoreScale: profile?.scoreScale,
        englishTests: englishTests,
        standardizedTests: standardizedTests,
        awards: awards,
        extracurriculars: extracurriculars,
        // Override with updates
        ...updates,
      };
    },
    [profile, englishTests, standardizedTests, awards, extracurriculars]
  );

  // Memoized save handlers
  const handleSaveIdentity = useCallback(async () => {
    try {
      // Update user basic info if fullName changed
      if (profileData.fullName !== user?.fullName) {
        const userResult = await updateUserInformation({
          fullName: profileData.fullName,
        });
        if (!userResult.success) {
          toast.error(userResult.error || "Failed to update user information");
          return;
        }
      }

      // Update profile with identity data
      const profileResult = await updateProfile(
        createProfileUpdate({
          dateOfBirth: profileData.dateOfBirth || undefined,
          nationality: profileData.nationality,
        })
      );

      if (profileResult.success) {
        setEditingSection(null);
        toast.success("Identity information saved successfully!");
      } else {
        toast.error(
          profileResult.error || "Failed to save identity information"
        );
      }
    } catch (error) {
      console.error("Save identity error:", error);
      toast.error("An error occurred while saving");
    }
  }, [
    profileData.fullName,
    profileData.dateOfBirth,
    profileData.nationality,
    user?.fullName,
    updateUserInformation,
    updateProfile,
    createProfileUpdate,
  ]);

  const handleSaveAcademic = useCallback(async () => {
    try {
      const profileResult = await updateProfile(
        createProfileUpdate({
          targetLevel: profileData.targetLevel || undefined,
          intendedMajor: profileData.intendedMajor || undefined,
          institution: profileData.institution || undefined,
          graduationYear: profileData.graduationYear
            ? parseInt(profileData.graduationYear)
            : undefined,
          academicScore: profileData.academicScore || undefined,
          scoreScale: profileData.scoreScale || undefined,
        })
      );

      if (profileResult.success) {
        setEditingSection(null);
        toast.success("Academic information saved successfully!");
      } else {
        toast.error(
          profileResult.error || "Failed to save academic information"
        );
      }
    } catch (error) {
      console.error("Save academic error:", error);
      toast.error("An error occurred while saving");
    }
  }, [
    profileData.targetLevel,
    profileData.intendedMajor,
    profileData.institution,
    profileData.graduationYear,
    profileData.academicScore,
    profileData.scoreScale,
    updateProfile,
    createProfileUpdate,
  ]);

  const handleSavePreferences = useCallback(async () => {
    try {
      const profileResult = await updateProfile(
        createProfileUpdate({
          targetLevel: profileData.targetLevel || undefined,
          intendedMajor: profileData.intendedMajor || undefined,
          intendedCountry: profileData.intendedCountry || undefined,
          budgetMin: profileData.budgetMin
            ? parseInt(profileData.budgetMin)
            : undefined,
          budgetMax: profileData.budgetMax
            ? parseInt(profileData.budgetMax)
            : undefined,
        })
      );

      if (profileResult.success) {
        setEditingSection(null);
        toast.success("Study abroad preferences saved successfully!");
      } else {
        toast.error(profileResult.error || "Failed to save preferences");
      }
    } catch (error) {
      console.error("Save preferences error:", error);
      toast.error("An error occurred while saving");
    }
  }, [
    profileData.targetLevel,
    profileData.intendedMajor,
    profileData.intendedCountry,
    profileData.budgetMin,
    profileData.budgetMax,
    updateProfile,
    createProfileUpdate,
  ]);

  // Add test handlers
  const handleAddEnglishTest = useCallback(async () => {
    if (!selectedEnglishTestType || !englishTestScore || !englishTestDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const testType =
      selectedEnglishTestType === "other"
        ? customEnglishTestTitle
        : selectedEnglishTestType;
    const newTest = {
      id: Date.now().toString(),
      type: testType,
      score: englishTestScore,
      date: englishTestDate,
    };

    const updatedTests = [...englishTests, newTest];

    try {
      const profileResult = await updateProfile(
        createProfileUpdate({ englishTests: updatedTests })
      );

      if (profileResult.success) {
        setEnglishTests(updatedTests);
        setEditingSection(null);
        setSelectedEnglishTestType("");
        setCustomEnglishTestTitle("");
        setEnglishTestScore("");
        setEnglishTestDate("");
        toast.success("English test added successfully!");
      } else {
        toast.error(profileResult.error || "Failed to add English test");
      }
    } catch (error) {
      console.error("Add English test error:", error);
      toast.error("An error occurred while adding the test");
    }
  }, [
    selectedEnglishTestType,
    customEnglishTestTitle,
    englishTestScore,
    englishTestDate,
    englishTests,
    updateProfile,
    createProfileUpdate,
  ]);

  const handleAddStandardizedTest = useCallback(async () => {
    if (
      !selectedStandardizedTestType ||
      !standardizedTestScore ||
      !standardizedTestDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const testType =
      selectedStandardizedTestType === "other"
        ? customStandardizedTestTitle
        : selectedStandardizedTestType;
    const newTest = {
      id: Date.now().toString(),
      type: testType,
      score: standardizedTestScore,
      date: standardizedTestDate,
    };

    const updatedTests = [...standardizedTests, newTest];

    try {
      const profileResult = await updateProfile(
        createProfileUpdate({
          standardizedTests: updatedTests,
        })
      );

      if (profileResult.success) {
        setStandardizedTests(updatedTests);
        setEditingSection(null);
        setSelectedStandardizedTestType("");
        setCustomStandardizedTestTitle("");
        setStandardizedTestScore("");
        setStandardizedTestDate("");
        toast.success("Standardized test added successfully!");
      } else {
        toast.error(profileResult.error || "Failed to add standardized test");
      }
    } catch (error) {
      console.error("Add standardized test error:", error);
      toast.error("An error occurred while adding the test");
    }
  }, [
    selectedStandardizedTestType,
    customStandardizedTestTitle,
    standardizedTestScore,
    standardizedTestDate,
    standardizedTests,
    updateProfile,
    createProfileUpdate,
  ]);

  const handleAddAward = useCallback(async () => {
    if (!awardTitle || !awardYear || !awardLevel) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newAward = {
      id: Date.now().toString(),
      title: awardTitle,
      year: awardYear,
      level: awardLevel,
    };

    const updatedAwards = [...awards, newAward];

    try {
      const profileResult = await updateProfile(
        createProfileUpdate({ awards: updatedAwards })
      );

      if (profileResult.success) {
        setAwards(updatedAwards);
        setEditingSection(null);
        setAwardTitle("");
        setAwardYear("");
        setAwardLevel("");
        toast.success("Award added successfully!");
      } else {
        toast.error(profileResult.error || "Failed to add award");
      }
    } catch (error) {
      console.error("Add award error:", error);
      toast.error("An error occurred while adding the award");
    }
  }, [
    awardTitle,
    awardYear,
    awardLevel,
    awards,
    updateProfile,
    createProfileUpdate,
  ]);

  const handleAddExtracurricular = useCallback(async () => {
    if (!activityName || !activityPeriod) {
      toast.error("Please fill in activity name and period");
      return;
    }

    const newActivity = {
      id: Date.now().toString(),
      activity: activityName,
      period: activityPeriod,
      description: activityDescription,
    };

    const updatedActivities = [...extracurriculars, newActivity];

    try {
      const profileResult = await updateProfile(
        createProfileUpdate({
          extracurriculars: updatedActivities,
        })
      );

      if (profileResult.success) {
        setExtracurriculars(updatedActivities);
        setEditingSection(null);
        setActivityName("");
        setActivityPeriod("");
        setActivityDescription("");
        toast.success("Extracurricular activity added successfully!");
      } else {
        toast.error(
          profileResult.error || "Failed to add extracurricular activity"
        );
      }
    } catch (error) {
      console.error("Add extracurricular error:", error);
      toast.error("An error occurred while adding the activity");
    }
  }, [
    activityName,
    activityPeriod,
    activityDescription,
    extracurriculars,
    updateProfile,
    createProfileUpdate,
  ]);

  // Remove handlers
  const handleRemoveEnglishTest = useCallback(
    async (testId: string) => {
      const updatedTests = englishTests.filter((t: any) => t.id !== testId);

      try {
        const profileResult = await updateProfile(
          createProfileUpdate({
            englishTests: updatedTests,
          })
        );

        if (profileResult.success) {
          setEnglishTests(updatedTests);
          toast.success("English test removed successfully!");
        } else {
          toast.error(profileResult.error || "Failed to remove English test");
        }
      } catch (error) {
        console.error("Remove English test error:", error);
        toast.error("An error occurred while removing the test");
      }
    },
    [englishTests, updateProfile, createProfileUpdate]
  );

  const handleRemoveStandardizedTest = useCallback(
    async (testId: string) => {
      const updatedTests = standardizedTests.filter(
        (t: any) => t.id !== testId
      );

      try {
        const profileResult = await updateProfile(
          createProfileUpdate({
            standardizedTests: updatedTests,
          })
        );

        if (profileResult.success) {
          setStandardizedTests(updatedTests);
          toast.success("Standardized test removed successfully!");
        } else {
          toast.error(
            profileResult.error || "Failed to remove standardized test"
          );
        }
      } catch (error) {
        console.error("Remove standardized test error:", error);
        toast.error("An error occurred while removing the test");
      }
    },
    [standardizedTests, updateProfile, createProfileUpdate]
  );

  const handleRemoveAward = useCallback(
    async (awardId: string) => {
      const updatedAwards = awards.filter((a: any) => a.id !== awardId);

      try {
        const profileResult = await updateProfile(
          createProfileUpdate({ awards: updatedAwards })
        );

        if (profileResult.success) {
          setAwards(updatedAwards);
          toast.success("Award removed successfully!");
        } else {
          toast.error(profileResult.error || "Failed to remove award");
        }
      } catch (error) {
        console.error("Remove award error:", error);
        toast.error("An error occurred while removing the award");
      }
    },
    [awards, updateProfile, createProfileUpdate]
  );

  const handleRemoveExtracurricular = useCallback(
    async (activityId: string) => {
      const updatedActivities = extracurriculars.filter(
        (a: { id: string }) => a.id !== activityId
      );

      try {
        const profileResult = await updateProfile(
          createProfileUpdate({
            extracurriculars: updatedActivities,
          })
        );

        if (profileResult.success) {
          setExtracurriculars(updatedActivities);
          toast.success("Extracurricular activity removed successfully!");
        } else {
          toast.error(
            profileResult.error || "Failed to remove extracurricular activity"
          );
        }
      } catch (error) {
        console.error("Remove extracurricular error:", error);
        toast.error("An error occurred while removing the activity");
      }
    },
    [extracurriculars, updateProfile, createProfileUpdate]
  );

  return (
    <ProtectedRoute>
      <div className="mx-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2">
          <div className=" rounded-lg p-4 col-span-2">
            <h2 className="font-semibold text-2xl my-2 flex gap-4 items-center flex-row">
              {t("yourProfile")}{" "}
              <Button
                onClick={() => setShowAISection(!showAISection)}
                className="text-zinc-900 hover:bg-transparent cursor-pointer hover:shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
              >
                {t("autofill")} <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </h2>
            <p className="text-zinc-500">{t("completeProfile")}</p>
            {/* <Separator className="my-2" /> */}

            {showAISection && (
              <div className="border border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 mb-5 mt-2 p-6 flex items-center flex-col rounded-xl relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={() => setShowAISection(false)}
                >
                  <X className="size-4" />
                </Button>
                <div className="items-center flex flex-col mb-5">
                  <h4 className="text-xl font-semibold items-center gap-2 flex flex-row">
                    {t("autofillWithAI")} <WandSparkles className="size-5" />
                  </h4>
                  <p className="text-sm text-zinc-500">
                    {t("autofillDescription")}
                  </p>
                </div>
                <Dropzone
                  accept={{ "application/pdf": [".pdf"] }}
                  onDrop={handleDrop}
                  onError={console.error}
                  className="border-dashed hover:cursor-pointer"
                  src={files}
                  disabled={isAIProcessing}
                >
                  {isAIProcessing ? (
                    <div className="flex flex-col items-center gap-2 p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p className="text-sm text-zinc-600">
                        {t("processingCV")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <DropzoneEmptyState>
                        <div className="flex flex-col items-center gap-2">
                          <Cloud className="size-8 text-zinc-400" />
                          <p className="text-sm text-zinc-600">
                            {t("dragDropCV")}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {t("pdfOnly")}
                          </p>
                        </div>
                      </DropzoneEmptyState>
                      <DropzoneContent />
                    </>
                  )}
                </Dropzone>
              </div>
            )}

            {/* Identitas Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">{t("identity")}</h2>
              <Dialog
                open={editingSection === "identitas"}
                onOpenChange={(open: boolean) =>
                  setEditingSection(open ? "identitas" : null)
                }
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <SquarePen className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t("editIdentity")}</DialogTitle>
                    <DialogDescription>
                      {t("updatePersonalInfo")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="mb-2">{t("fullName")}</Label>
                      <ControlledInput
                        value={profileData.fullName}
                        onUpdate={(value) =>
                          handleProfileChange("fullName", value)
                        }
                        placeholder={t("enterFullName")}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">{t("dateOfBirth")}</Label>
                      <ControlledInput
                        type="date"
                        value={profileData.dateOfBirth}
                        onUpdate={(value) =>
                          handleProfileChange("dateOfBirth", value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="mb-2">{t("nationality")}</Label>
                      <ControlledSelect
                        value={profileData.nationality}
                        onUpdate={(value) =>
                          handleProfileChange("nationality", value)
                        }
                        placeholder={t("selectNationality")}
                      >
                        <SelectContent>
                          <SelectItem value="Indonesia">Indonesia</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </ControlledSelect>
                    </div>
                    <div>
                      <Label className="mb-2">{t("contactEmail")}</Label>
                      <ControlledInput
                        type="email"
                        value={profileData.email}
                        onUpdate={(value) =>
                          handleProfileChange("email", value)
                        }
                        placeholder={t("enterEmail")}
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={handleSaveIdentity}
                    disabled={profileLoading}
                  >
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
              <div>
                <strong>{t("email")}:</strong>{" "}
                {profileData.email || t("notSet")}
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">
                {t("academicInformation")}
              </h2>
              <Dialog
                open={editingSection === "academic"}
                onOpenChange={(open: boolean) =>
                  setEditingSection(open ? "academic" : null)
                }
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <SquarePen className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t("editAcademicInfo")}</DialogTitle>
                    <DialogDescription>
                      {t("updateEducationalBackground")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="mb-2">{t("institution")}</Label>
                      <ControlledInput
                        value={profileData.institution}
                        onUpdate={(value) =>
                          handleProfileChange("institution", value)
                        }
                        placeholder={t("schoolUniversityName")}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">{t("graduationYear")}</Label>
                      <ControlledInput
                        type="number"
                        value={profileData.graduationYear}
                        onUpdate={(value) =>
                          handleProfileChange("graduationYear", value)
                        }
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <Label className="mb-2">{t("academicScore")}</Label>
                      <div className="flex gap-2">
                        <ControlledInput
                          value={profileData.academicScore}
                          onUpdate={(value) =>
                            handleProfileChange("academicScore", value)
                          }
                          placeholder="3.45 or 85"
                        />
                        <ControlledSelect
                          value={profileData.scoreScale}
                          onUpdate={(value) =>
                            handleProfileChange("scoreScale", value)
                          }
                          className="w-40"
                        >
                          <SelectContent>
                            <SelectItem value="gpa4">{t("gpa4")}</SelectItem>
                            <SelectItem value="percentage">
                              {t("percentage")}
                            </SelectItem>
                            <SelectItem value="indo">
                              {t("indoScale")}
                            </SelectItem>
                          </SelectContent>
                        </ControlledSelect>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={handleSaveAcademic}
                    disabled={profileLoading}
                  >
                    {profileLoading ? t("saving") : t("saveChanges")}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <strong>{t("institution")}:</strong>{" "}
                {profileData.institution || t("notSet")}
              </div>
              <div>
                <strong>{t("graduationYear")}:</strong>{" "}
                {profileData.graduationYear || t("notSet")}
              </div>
              <div>
                <strong>{t("academicScore")}:</strong>{" "}
                {profileData.academicScore
                  ? `${profileData.academicScore} (${profileData.scoreScale})`
                  : t("notSet")}
              </div>
            </div>

            {/* Study Abroad Preferences Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">
                {t("studyAbroadPreferences")}
              </h2>
              <Dialog
                open={editingSection === "preferences"}
                onOpenChange={(open: boolean) =>
                  setEditingSection(open ? "preferences" : null)
                }
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
                      <Label className="mb-2">{t("targetLevel")}</Label>
                      <ControlledSelect
                        value={profileData.targetLevel}
                        onUpdate={(value) =>
                          handleProfileChange("targetLevel", value)
                        }
                        placeholder={t("selectLevel")}
                      >
                        <SelectContent>
                          <SelectItem value="undergraduate">
                            {t("undergraduate")}
                          </SelectItem>
                          <SelectItem value="master">{t("masters")}</SelectItem>
                          <SelectItem value="phd">{t("phd")}</SelectItem>
                          <SelectItem value="exchange">
                            {t("exchange")}
                          </SelectItem>
                        </SelectContent>
                      </ControlledSelect>
                    </div>
                    <div>
                      <Label className="mb-2">{t("intendedMajor")}</Label>
                      <ControlledInput
                        value={profileData.intendedMajor}
                        onUpdate={(value) =>
                          handleProfileChange("intendedMajor", value)
                        }
                        placeholder={t("computerScience")}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">{t("intendedCountry")}</Label>
                      <ControlledInput
                        value={profileData.intendedCountry}
                        onUpdate={(value) =>
                          handleProfileChange("intendedCountry", value)
                        }
                        placeholder={t("unitedStates")}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">{t("budgetRange")}</Label>
                      <div className="flex gap-2">
                        <ControlledInput
                          type="number"
                          value={profileData.budgetMin}
                          onUpdate={(value) =>
                            handleProfileChange("budgetMin", value)
                          }
                          placeholder={t("min")}
                        />
                        <ControlledInput
                          type="number"
                          value={profileData.budgetMax}
                          onUpdate={(value) =>
                            handleProfileChange("budgetMax", value)
                          }
                          placeholder={t("max")}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={handleSavePreferences}
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </Button>
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

            {/* English Proficiency Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">
                {t("englishProficiency")}
              </h2>
              <Dialog
                open={editingSection === "english"}
                onOpenChange={(open: boolean) => {
                  setEditingSection(open ? "english" : null);
                  if (!open) {
                    setSelectedEnglishTestType("");
                    setCustomEnglishTestTitle("");
                    setEnglishTestScore("");
                    setEnglishTestDate("");
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
                    <DialogTitle>{t("addEnglishTest")}</DialogTitle>
                    <DialogDescription>
                      {t("addNewEnglishTest")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="mb-2">{t("testType")}</Label>
                      <ControlledSelect
                        value={selectedEnglishTestType}
                        onUpdate={setSelectedEnglishTestType}
                        placeholder={t("selectTestType")}
                      >
                        <SelectContent>
                          <SelectItem value="toefl">{t("toefl")}</SelectItem>
                          <SelectItem value="ielts">{t("ielts")}</SelectItem>
                          <SelectItem value="duolingo">
                            {t("duolingo")}
                          </SelectItem>
                          <SelectItem value="pte">{t("pte")}</SelectItem>
                          <SelectItem value="other">{t("other")}</SelectItem>
                        </SelectContent>
                      </ControlledSelect>
                    </div>
                    {selectedEnglishTestType === "other" && (
                      <div>
                        <Label className="mb-2">{t("testTitle")}</Label>
                        <ControlledInput
                          value={customEnglishTestTitle}
                          onUpdate={setCustomEnglishTestTitle}
                          placeholder={t("enterTestName")}
                        />
                      </div>
                    )}
                    <div>
                      <Label className="mb-2">{t("score")}</Label>
                      <ControlledInput
                        placeholder="110 / 7.5 / 125"
                        value={englishTestScore}
                        onUpdate={setEnglishTestScore}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">{t("testDate")}</Label>
                      <ControlledInput
                        type="date"
                        value={englishTestDate}
                        onUpdate={setEnglishTestDate}
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={handleAddEnglishTest}
                    disabled={profileLoading}
                  >
                    {profileLoading ? t("adding") : t("addTest")}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <Separator className="my-2" />
            <div className="space-y-2 mb-4">
              {englishTests.map((test) => (
                <Card key={test.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{test.type}</div>
                      <div className="text-sm text-gray-500">
                        Score: {test.score} • Date: {test.date}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEnglishTest(test.id)}
                      disabled={profileLoading}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Standardized Tests Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">
                {t("standardizedTests")}
              </h2>
              <Dialog
                open={editingSection === "standardized"}
                onOpenChange={(open: boolean) => {
                  setEditingSection(open ? "standardized" : null);
                  if (!open) {
                    setSelectedStandardizedTestType("");
                    setCustomStandardizedTestTitle("");
                    setStandardizedTestScore("");
                    setStandardizedTestDate("");
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
                    <DialogTitle>{t("addStandardizedTest")}</DialogTitle>
                    <DialogDescription>
                      {t("addStandardizedTestDesc")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="mb-2">Test Type</Label>
                      <ControlledSelect
                        value={selectedStandardizedTestType}
                        onUpdate={setSelectedStandardizedTestType}
                        placeholder="Select test"
                      >
                        <SelectContent>
                          <SelectItem value="sat">SAT</SelectItem>
                          <SelectItem value="act">ACT</SelectItem>
                          <SelectItem value="gre">GRE</SelectItem>
                          <SelectItem value="gmat">GMAT</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </ControlledSelect>
                    </div>
                    {selectedStandardizedTestType === "other" && (
                      <div>
                        <Label className="mb-2">Test Title</Label>
                        <ControlledInput
                          value={customStandardizedTestTitle}
                          onUpdate={setCustomStandardizedTestTitle}
                          placeholder="Enter test name"
                        />
                      </div>
                    )}
                    <div>
                      <Label className="mb-2">Score</Label>
                      <ControlledInput
                        placeholder="1400 / 32 / 320 / 700"
                        value={standardizedTestScore}
                        onUpdate={setStandardizedTestScore}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">Test Date</Label>
                      <ControlledInput
                        type="date"
                        value={standardizedTestDate}
                        onUpdate={setStandardizedTestDate}
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={handleAddStandardizedTest}
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Adding..." : "Add Test"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <Separator className="my-2" />
            <div className="space-y-2 mb-4">
              {standardizedTests.map((test) => (
                <Card key={test.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{test.type}</div>
                      <div className="text-sm text-gray-500">
                        Score: {test.score} • Date: {test.date}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStandardizedTest(test.id)}
                      disabled={profileLoading}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Awards Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">
                {t("awardsAchievements")}
              </h2>
              <Dialog
                open={editingSection === "awards"}
                onOpenChange={(open: boolean) => {
                  setEditingSection(open ? "awards" : null);
                  if (!open) {
                    setAwardTitle("");
                    setAwardYear("");
                    setAwardLevel("");
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
                        onUpdate={setAwardTitle}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">Year</Label>
                      <ControlledInput
                        placeholder="2023"
                        value={awardYear}
                        onUpdate={setAwardYear}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">Level</Label>
                      <ControlledSelect
                        value={awardLevel}
                        onUpdate={setAwardLevel}
                        placeholder="Select level"
                      >
                        <SelectContent>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                          <SelectItem value="national">National</SelectItem>
                          <SelectItem value="international">
                            International
                          </SelectItem>
                        </SelectContent>
                      </ControlledSelect>
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={handleAddAward}
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
                      onClick={() => handleRemoveAward(award.id)}
                      disabled={profileLoading}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Extracurriculars Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">{t("extracurriculars")}</h2>
              <Dialog
                open={editingSection === "extracurriculars"}
                onOpenChange={(open: boolean) => {
                  setEditingSection(open ? "extracurriculars" : null);
                  if (!open) {
                    setActivityName("");
                    setActivityPeriod("");
                    setActivityDescription("");
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
                    <DialogDescription>
                      {t("addLeadershipClubs")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="mb-2">Activity</Label>
                      <ControlledInput
                        placeholder="e.g., Student Council President"
                        value={activityName}
                        onUpdate={setActivityName}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">Period</Label>
                      <ControlledInput
                        placeholder="e.g., 2022-2023"
                        value={activityPeriod}
                        onUpdate={setActivityPeriod}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">Description (Optional)</Label>
                      <ControlledTextarea
                        placeholder="Brief description of your role and achievements"
                        value={activityDescription}
                        onUpdate={setActivityDescription}
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={handleAddExtracurricular}
                    disabled={profileLoading}
                  >
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
                      <div className="text-sm text-gray-500">
                        {activity.period}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExtracurricular(activity.id)}
                      disabled={profileLoading}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="border rounded-lg p-4 md:mr-4">
            <h2 className="font-semibold text-2xl flex flex-row items-center gap-2">
              <Star className="text-yellow-400 " /> {t("myFavorites")}
            </h2>
            <Separator className="my-2" />

            <Tabs defaultValue="universities" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="universities"
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  {t("universities")} ({favorites.length})
                </TabsTrigger>
                <TabsTrigger
                  value="scholarships"
                  className="flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  {t("scholarships")} ({scholarshipFavorites.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="universities" className="mt-4">
                {favoritesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">
                      {t("loadingUniversities")}
                    </span>
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="gap-4 flex flex-col">
                    {favorites.map((favorite) => (
                      <UnivCard
                        key={favorite.university.id}
                        university={favorite.university}
                        savedItems={savedItems}
                        onToggleSaved={toggleSaved}
                        onSelectUniversity={setSelectedUniversity}
                        userToken={token || undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty className="w-full">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <GraduationCap />
                      </EmptyMedia>
                      <EmptyTitle>{t("noFavoriteUniversities")}</EmptyTitle>
                      <EmptyDescription>
                        {t("addFavoriteUniversities")}
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Link href="/match">
                        <Button className="text-zinc-900 hover:bg-transparent cursor-pointer hover:shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          {t("matchWithAI")}{" "}
                          <Sparkles className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                      <p className="text-zinc-500">atau</p>
                      <Link href="/search">
                        <Button variant="outline" size="sm">
                          {t("searchUniversities")}
                        </Button>
                      </Link>
                    </EmptyContent>
                  </Empty>
                )}
              </TabsContent>

              <TabsContent value="scholarships" className="mt-4">
                {scholarshipFavoritesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">
                      {t("loadingScholarships")}
                    </span>
                  </div>
                ) : scholarshipFavorites.length > 0 ? (
                  <div className="gap-4 flex flex-col">
                    {scholarshipFavorites.map((scholarship) => (
                      <ScholarshipCard
                        key={scholarship.id}
                        scholarship={scholarship as any}
                        savedItems={scholarshipFavorites.map((s) => s.id)}
                        onToggleSaved={toggleScholarshipSaved}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty className="w-full">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Star />
                      </EmptyMedia>
                      <EmptyTitle>{t("noFavoriteScholarships")}</EmptyTitle>
                      <EmptyDescription>
                        {t("addFavoriteScholarships")}
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Link href="/search">
                        <Button variant="outline" size="sm">
                          {t("searchScholarships")}
                        </Button>
                      </Link>
                    </EmptyContent>
                  </Empty>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
