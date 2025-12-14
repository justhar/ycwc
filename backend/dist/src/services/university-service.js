/**
 * University Service
 * Handles business logic for university data and matching
 */
import { universityRepository } from "../repositories/index.js";
class UniversityService {
    /**
     * Get all universities with filters and pagination
     */
    async getAllUniversities(params) {
        // Validate pagination parameters
        if (params?.page && params.page < 1) {
            throw new Error("Page number must be at least 1");
        }
        if (params?.limit && (params.limit < 1 || params.limit > 100)) {
            throw new Error("Limit must be between 1 and 100");
        }
        if (params?.minRanking && params?.maxRanking) {
            if (params.minRanking > params.maxRanking) {
                throw new Error("Minimum ranking cannot be greater than maximum ranking");
            }
        }
        return await universityRepository.findAll(params);
    }
    /**
     * Get all universities with pagination (using offset/limit)
     */
    async getAllUniversitiesWithPagination(params) {
        const { limit = 20, offset = 0, ...filters } = params;
        if (limit < 1 || limit > 100) {
            throw new Error("Limit must be between 1 and 100");
        }
        if (filters.minRanking && filters.maxRanking) {
            if (filters.minRanking > filters.maxRanking) {
                throw new Error("Minimum ranking cannot be greater than maximum ranking");
            }
        }
        return await universityRepository.findAllWithPagination({
            ...filters,
            limit,
            offset,
        });
    }
    /**
     * Search universities by name with additional filters
     */
    async searchUniversitiesWithFilters(searchTerm, params) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            throw new Error("Search term is required");
        }
        const { limit = 20, offset = 0, ...filters } = params;
        if (limit < 1 || limit > 100) {
            throw new Error("Limit must be between 1 and 100");
        }
        return await universityRepository.searchWithFilters(searchTerm, {
            ...filters,
            limit,
            offset,
        });
    }
    /**
     * Get university by ID
     */
    async getUniversityById(universityId) {
        const university = await universityRepository.findById(universityId);
        if (!university) {
            throw new Error("University not found");
        }
        return university;
    }
    /**
     * Get scholarships for a university
     */
    async getUniversityScholarships(universityId) {
        // Verify university exists
        await this.getUniversityById(universityId);
        return await universityRepository.findScholarshipsByUniversityId(universityId);
    }
    /**
     * Search universities by name
     */
    async searchUniversities(searchTerm, limit = 10) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            throw new Error("Search term is required");
        }
        if (limit < 1 || limit > 50) {
            throw new Error("Limit must be between 1 and 50");
        }
        return await universityRepository.searchByName(searchTerm, limit);
    }
    /**
     * Add university to user favorites
     */
    async addToFavorites(userId, universityId) {
        // Verify university exists
        await this.getUniversityById(universityId);
        return await universityRepository.addToFavorites(userId, universityId);
    }
    /**
     * Remove university from user favorites
     */
    async removeFromFavorites(userId, universityId) {
        await universityRepository.removeFromFavorites(userId, universityId);
    }
    /**
     * Get user's favorite universities
     */
    async getUserFavorites(userId) {
        return await universityRepository.findFavoritesByUserId(userId);
    }
}
export const universityService = new UniversityService();
