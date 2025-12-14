/**
 * Scholarship Service
 * Handles business logic for scholarship data and user favorites
 */

import { scholarshipRepository } from "../repositories/index.js";
import type { ScholarshipSearchParams } from "../types/index.js";

class ScholarshipService {
  /**
   * Get all scholarships with filters and pagination
   */
  async getAllScholarships(params?: any) {
    // Validate pagination parameters
    if (params?.offset && params.offset < 0) {
      throw new Error("Offset must be at least 0");
    }

    if (params?.limit && (params.limit < 1 || params.limit > 100)) {
      throw new Error("Limit must be between 1 and 100");
    }

    return await scholarshipRepository.findAll(params);
  }

  /**
   * Get scholarship by ID
   */
  async getScholarshipById(scholarshipId: string) {
    const scholarship = await scholarshipRepository.findById(scholarshipId);

    if (!scholarship) {
      throw new Error("Scholarship not found");
    }

    return scholarship;
  }

  /**
   * Search scholarships by name
   */
  async searchScholarships(searchTerm: string, limit: number = 10) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error("Search term is required");
    }

    if (limit < 1 || limit > 50) {
      throw new Error("Limit must be between 1 and 50");
    }

    return await scholarshipRepository.searchByName(searchTerm, limit);
  }

  /**
   * Add scholarship to user favorites
   */
  async addToFavorites(userId: number, scholarshipId: string) {
    // Verify scholarship exists
    await this.getScholarshipById(scholarshipId);

    return await scholarshipRepository.addToFavorites(userId, scholarshipId);
  }

  /**
   * Remove scholarship from user favorites
   */
  async removeFromFavorites(userId: number, scholarshipId: string) {
    await scholarshipRepository.removeFromFavorites(userId, scholarshipId);
  }

  /**
   * Get user's favorite scholarships
   */
  async getUserFavorites(userId: number) {
    return await scholarshipRepository.findFavoritesByUserId(userId);
  }
}

export const scholarshipService = new ScholarshipService();
