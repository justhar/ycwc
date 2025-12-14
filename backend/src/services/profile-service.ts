/**
 * Profile Service
 * Handles business logic for user profile management
 */

import { profileRepository, userRepository } from "../repositories/index.js";
import type { ProfileData } from "../types/index.js";

class ProfileService {
  /**
   * Get user profile with user data
   */
  async getProfileWithUser(userId: number) {
    const user = await userRepository.findById(userId);
    const profile = await profileRepository.findByUserId(userId);

    return {
      user,
      profile: profile || this.getDefaultProfile(),
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: number) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      // Return default empty profile if not found
      return this.getDefaultProfile();
    }

    return profile;
  }

  /**
   * Create or update user profile
   */
  async upsertProfile(userId: number, profileData: Partial<ProfileData>) {
    // Validate profile data
    this.validateProfileData(profileData);

    // Check if profile exists
    const existingProfile = await profileRepository.findByUserId(userId);

    if (existingProfile) {
      // Update existing profile
      return await profileRepository.update(userId, profileData);
    } else {
      // Create new profile
      return await profileRepository.create(userId, profileData);
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: number) {
    await profileRepository.delete(userId);
  }

  /**
   * Validate profile data before saving
   */
  private validateProfileData(data: Partial<ProfileData>) {
    // Validate budget range
    if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
      if (data.budgetMin > data.budgetMax) {
        throw new Error("Minimum budget cannot be greater than maximum budget");
      }
    }

    // Validate academic score
    if (data.academicScore !== undefined) {
      const score = parseFloat(data.academicScore);
      if (isNaN(score) || score < 0) {
        throw new Error("Academic score must be a positive number");
      }

      // Validate based on score scale
      if (data.scoreScale === "gpa4" && score > 4.0) {
        throw new Error("GPA on 4.0 scale cannot exceed 4.0");
      } else if (data.scoreScale === "percentage" && score > 100) {
        throw new Error("Percentage score cannot exceed 100");
      }
    }

    // Validate graduation year
    if (data.graduationYear !== undefined) {
      const year =
        typeof data.graduationYear === "string"
          ? parseInt(data.graduationYear)
          : data.graduationYear;
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1950 || year > currentYear + 10) {
        throw new Error("Invalid graduation year");
      }
    }

    // Validate arrays
    if (data.englishTests && !Array.isArray(data.englishTests)) {
      throw new Error("English tests must be an array");
    }
    if (data.standardizedTests && !Array.isArray(data.standardizedTests)) {
      throw new Error("Standardized tests must be an array");
    }
    if (data.awards && !Array.isArray(data.awards)) {
      throw new Error("Awards must be an array");
    }
    if (data.extracurriculars && !Array.isArray(data.extracurriculars)) {
      throw new Error("Extracurriculars must be an array");
    }
  }

  /**
   * Get default empty profile
   */
  private getDefaultProfile(): Partial<ProfileData> {
    return {
      dateOfBirth: undefined,
      nationality: "Indonesia",
      targetLevel: "undergraduate",
      intendedMajor: undefined,
      intendedCountry: undefined,
      budgetMin: undefined,
      budgetMax: undefined,
      institution: undefined,
      graduationYear: undefined,
      academicScore: undefined,
      scoreScale: "gpa4",
      englishTests: [],
      standardizedTests: [],
      awards: [],
      extracurriculars: [],
    };
  }

  /**
   * Get user's favorite universities
   */
  async getFavoriteUniversities(userId: number) {
    return await profileRepository.getFavoriteUniversities(userId);
  }

  /**
   * Get user's favorite scholarships
   */
  async getFavoriteScholarships(userId: number) {
    return await profileRepository.getFavoriteScholarships(userId);
  }

  /**
   * Add university to favorites
   */
  async addFavoriteUniversity(userId: number, universityId: string) {
    // Check if already favorited
    const isFavorited = await profileRepository.checkFavoriteUniversity(
      userId,
      universityId
    );
    if (isFavorited) {
      throw new Error("University is already in favorites");
    }

    return await profileRepository.addFavoriteUniversity(userId, universityId);
  }

  /**
   * Add scholarship to favorites
   */
  async addFavoriteScholarship(userId: number, scholarshipId: string) {
    // Check if already favorited
    const isFavorited = await profileRepository.checkFavoriteScholarship(
      userId,
      scholarshipId
    );
    if (isFavorited) {
      throw new Error("Scholarship is already in favorites");
    }

    return await profileRepository.addFavoriteScholarship(
      userId,
      scholarshipId
    );
  }

  /**
   * Remove university from favorites
   */
  async removeFavoriteUniversity(userId: number, universityId: string) {
    await profileRepository.removeFavoriteUniversity(userId, universityId);
  }

  /**
   * Remove scholarship from favorites
   */
  async removeFavoriteScholarship(userId: number, scholarshipId: string) {
    await profileRepository.removeFavoriteScholarship(userId, scholarshipId);
  }

  /**
   * Check if university is favorited
   */
  async checkFavoriteUniversity(userId: number, universityId: string) {
    return await profileRepository.checkFavoriteUniversity(
      userId,
      universityId
    );
  }

  /**
   * Check if scholarship is favorited
   */
  async checkFavoriteScholarship(userId: number, scholarshipId: string) {
    return await profileRepository.checkFavoriteScholarship(
      userId,
      scholarshipId
    );
  }

  /**
   * Update user basic information (fullName)
   */
  async updateUserInfo(userId: number, data: { fullName?: string }) {
    if (data.fullName && data.fullName.trim().length < 2) {
      throw new Error("Full name must be at least 2 characters");
    }

    return await profileRepository.updateUserInfo(userId, data);
  }
}

export const profileService = new ProfileService();
