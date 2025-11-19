"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "sonner";
import {
  getUserFavorites,
  removeFromFavorites,
  getScholarshipFavorites,
  removeScholarshipFromFavorites,
  API_BASE_URL,
} from "@/lib/api";
import type { Favorite, ScholarshipFavorite } from "@/types";
import { useTranslations } from "next-intl";
import type { University } from "@/types";
import {
  CVUploadSection,
  IdentitySection,
  AcademicSection,
  PreferencesSection,
  EnglishTestSection,
  StandardizedTestSection,
  AwardsSection,
  ExtracurricularsSection,
  FavoritesPanel,
} from "@/components/profile";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const {
    user,
    profile,
    updateProfile,
    updateUserInformation,
    fetchProfile,
    profileLoading,
    token,
  } = useAuth();

  // Favorites state
  const [savedItems, setSavedItems] = useState<string[]>([]);
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

  // Update local state when profile changes
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

  // AI autofill section visibility state
  const [showAISection, setShowAISection] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const toggleSaved = async (id: string) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      const isSaved = savedItems.includes(id);

      if (isSaved) {
        await removeFromFavorites(token, id);
        setSavedItems((prev) => prev.filter((item) => item !== id));
        setFavorites((prev) => prev.filter((fav) => fav.university.id !== id));
        toast.success("University removed from favorites");
      } else {
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

  const handleDrop = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const file = files[0];

      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setIsAIProcessing(true);

      const processingToast = toast.loading("Analyzing CV with AI...", {
        description: "Extracting profile information from your PDF",
      });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/ai/profile-autofill`, {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to process CV");
        }

        if (result.success && result.data) {
          const aiData = result.data;

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

          try {
            if (aiData.fullName && aiData.fullName !== user?.fullName) {
              const userResult = await updateUserInformation({
                fullName: aiData.fullName,
              });
              if (userResult.success) {
                // Update local profileData with new fullName immediately
                setProfileData((prev) => ({
                  ...prev,
                  fullName: aiData.fullName,
                }));
              } else {
                console.warn("Failed to update user info:", userResult.error);
              }
            }

            const updatedData = {
              dateOfBirth: aiData.dateOfBirth || profile?.dateOfBirth,
              nationality:
                aiData.nationality || profile?.nationality || "Indonesia",
              targetLevel: aiData.targetLevel || profile?.targetLevel,
              intendedMajor: aiData.intendedMajor || profile?.intendedMajor,
              intendedCountry:
                aiData.intendedCountry || profile?.intendedCountry,
              budgetMin: aiData.budgetMin || profile?.budgetMin,
              budgetMax: aiData.budgetMax || profile?.budgetMax,
              institution: aiData.institution || profile?.institution,
              graduationYear: aiData.graduationYear || profile?.graduationYear,
              academicScore: aiData.gpa || profile?.academicScore,
              scoreScale: profile?.scoreScale || "gpa4",
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

            const profileResult = await updateProfile(updatedData);

            if (profileResult.success) {
              toast.success("Profile data extracted and saved successfully!");
              await fetchProfile();
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

          // Keep AI section visible so user can see uploaded data persisted
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
        toast.dismiss();
      }
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
      fetchProfile,
      token,
    ]
  );

  const handleProfileChange = useCallback((field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const createProfileUpdate = useCallback(
    (updates: Partial<typeof profile>) => {
      return {
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
        ...updates,
      };
    },
    [profile, englishTests, standardizedTests, awards, extracurriculars]
  );

  const handleSaveIdentity = useCallback(async () => {
    try {
      if (profileData.fullName !== user?.fullName) {
        const userResult = await updateUserInformation({
          fullName: profileData.fullName,
        });
        if (!userResult.success) {
          toast.error(userResult.error || "Failed to update user information");
          return;
        }
      }

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
          <div className="rounded-lg p-4 col-span-2">
            <CVUploadSection
              showAISection={showAISection}
              isAIProcessing={isAIProcessing}
              onToggleAISection={() => setShowAISection(!showAISection)}
              onDrop={handleDrop}
              token={token || undefined}
              t={t}
            />

            <IdentitySection
              profileData={{
                fullName: profileData.fullName,
                dateOfBirth: profileData.dateOfBirth,
                nationality: profileData.nationality,
              }}
              editingSection={editingSection}
              profileLoading={profileLoading}
              onEdit={setEditingSection}
              onProfileChange={handleProfileChange}
              onSave={handleSaveIdentity}
              t={t}
            />

            <AcademicSection
              profileData={{
                institution: profileData.institution,
                graduationYear: profileData.graduationYear,
                academicScore: profileData.academicScore,
                scoreScale: profileData.scoreScale,
              }}
              editingSection={editingSection}
              profileLoading={profileLoading}
              onEdit={setEditingSection}
              onProfileChange={handleProfileChange}
              onSave={handleSaveAcademic}
              t={t}
            />

            <PreferencesSection
              profileData={{
                targetLevel: profileData.targetLevel,
                intendedMajor: profileData.intendedMajor,
                intendedCountry: profileData.intendedCountry,
                budgetMin: profileData.budgetMin,
                budgetMax: profileData.budgetMax,
              }}
              editingSection={editingSection}
              profileLoading={profileLoading}
              onEdit={setEditingSection}
              onProfileChange={handleProfileChange}
              onSave={handleSavePreferences}
              t={t}
            />

            <EnglishTestSection
              englishTests={englishTests}
              editingSection={editingSection}
              profileLoading={profileLoading}
              selectedEnglishTestType={selectedEnglishTestType}
              customEnglishTestTitle={customEnglishTestTitle}
              englishTestScore={englishTestScore}
              englishTestDate={englishTestDate}
              onEdit={setEditingSection}
              onSelectTestType={setSelectedEnglishTestType}
              onCustomTitleChange={setCustomEnglishTestTitle}
              onScoreChange={setEnglishTestScore}
              onDateChange={setEnglishTestDate}
              onAddTest={handleAddEnglishTest}
              onRemoveTest={handleRemoveEnglishTest}
              t={t}
            />

            <StandardizedTestSection
              standardizedTests={standardizedTests}
              editingSection={editingSection}
              profileLoading={profileLoading}
              selectedStandardizedTestType={selectedStandardizedTestType}
              customStandardizedTestTitle={customStandardizedTestTitle}
              standardizedTestScore={standardizedTestScore}
              standardizedTestDate={standardizedTestDate}
              onEdit={setEditingSection}
              onSelectTestType={setSelectedStandardizedTestType}
              onCustomTitleChange={setCustomStandardizedTestTitle}
              onScoreChange={setStandardizedTestScore}
              onDateChange={setStandardizedTestDate}
              onAddTest={handleAddStandardizedTest}
              onRemoveTest={handleRemoveStandardizedTest}
              t={t}
            />

            <AwardsSection
              awards={awards}
              editingSection={editingSection}
              profileLoading={profileLoading}
              awardTitle={awardTitle}
              awardYear={awardYear}
              awardLevel={awardLevel}
              onEdit={setEditingSection}
              onTitleChange={setAwardTitle}
              onYearChange={setAwardYear}
              onLevelChange={setAwardLevel}
              onAddAward={handleAddAward}
              onRemoveAward={handleRemoveAward}
              t={t}
            />

            <ExtracurricularsSection
              extracurriculars={extracurriculars}
              editingSection={editingSection}
              profileLoading={profileLoading}
              activityName={activityName}
              activityPeriod={activityPeriod}
              activityDescription={activityDescription}
              onEdit={setEditingSection}
              onActivityNameChange={setActivityName}
              onActivityPeriodChange={setActivityPeriod}
              onActivityDescriptionChange={setActivityDescription}
              onAddActivity={handleAddExtracurricular}
              onRemoveActivity={handleRemoveExtracurricular}
              t={t}
            />
          </div>

          <FavoritesPanel
            favorites={favorites}
            scholarshipFavorites={scholarshipFavorites}
            favoritesLoading={favoritesLoading}
            scholarshipFavoritesLoading={scholarshipFavoritesLoading}
            savedItems={savedItems}
            token={token || undefined}
            onToggleSaved={toggleSaved}
            onToggleScholarshipSaved={toggleScholarshipSaved}
            onSelectUniversity={() => {}}
            t={t}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
