/**
 * University Controller
 * Handles HTTP requests for university endpoints
 */

import type { Context } from "hono";
import { universityService } from "../services/index.js";

export class UniversityController {
  /**
   * GET /api/universities
   * Get all universities with optional filters and search
   */
  async getUniversities(c: Context) {
    try {
      const search = c.req.query("search");
      const country = c.req.query("country");
      const type = c.req.query("type") as "public" | "private" | undefined;
      const minRanking = c.req.query("minRanking")
        ? parseInt(c.req.query("minRanking")!)
        : undefined;
      const maxRanking = c.req.query("maxRanking")
        ? parseInt(c.req.query("maxRanking")!)
        : undefined;
      const minTuition = c.req.query("minTuition");
      const maxTuition = c.req.query("maxTuition");
      const minAcceptanceRate = c.req.query("minAcceptanceRate");
      const maxAcceptanceRate = c.req.query("maxAcceptanceRate");
      const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 20;
      const offset = c.req.query("offset") ? parseInt(c.req.query("offset")!) : 0;

      // If search term provided, use search endpoint
      if (search && search.trim().length > 0) {
        const searchResults = await universityService.searchUniversitiesWithFilters(
          search,
          {
            country: country || undefined,
            type,
            minRanking,
            maxRanking,
            minTuition: minTuition ? parseFloat(minTuition) : undefined,
            maxTuition: maxTuition ? parseFloat(maxTuition) : undefined,
            minAcceptanceRate: minAcceptanceRate ? parseFloat(minAcceptanceRate) : undefined,
            maxAcceptanceRate: maxAcceptanceRate ? parseFloat(maxAcceptanceRate) : undefined,
            limit,
            offset,
          }
        );

        const total = searchResults.total || 0;
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(total / limit);

        return c.json({
          universities: searchResults.data || [],
          pagination: {
            total,
            limit,
            offset,
            totalPages,
            currentPage,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
          },
        });
      }

      // Otherwise, use getAllUniversities with filters
      const results = await universityService.getAllUniversitiesWithPagination({
        country: country || undefined,
        type,
        minRanking,
        maxRanking,
        minTuition: minTuition ? parseFloat(minTuition) : undefined,
        maxTuition: maxTuition ? parseFloat(maxTuition) : undefined,
        minAcceptanceRate: minAcceptanceRate ? parseFloat(minAcceptanceRate) : undefined,
        maxAcceptanceRate: maxAcceptanceRate ? parseFloat(maxAcceptanceRate) : undefined,
        limit,
        offset,
      });

      const total = results.total || 0;
      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(total / limit);

      return c.json({
        universities: results.data || [],
        pagination: {
          total,
          limit,
          offset,
          totalPages,
          currentPage,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
      });
    } catch (error: any) {
      return c.json(
        {
          error: error.message,
        },
        400
      );
    }
  }

  /**
   * GET /api/universities/:id
   * Get single university by ID
   */
  async getUniversity(c: Context) {
    try {
      const universityId = c.req.param("id");

      const university = await universityService.getUniversityById(
        universityId
      );

      return c.json({ university });
    } catch (error: any) {
      const status = error.message.includes("not found") ? 404 : 500;
      return c.json(
        {
          error: error.message,
        },
        status
      );
    }
  }

  /**
   * GET /api/universities/:id/scholarships
   * Get scholarships for a specific university
   */
  async getUniversityScholarships(c: Context) {
    try {
      const universityId = c.req.param("id");

      const scholarships = await universityService.getUniversityScholarships(
        universityId
      );

      return c.json({ scholarships });
    } catch (error: any) {
      const status = error.message.includes("not found") ? 404 : 500;
      return c.json(
        {
          error: error.message,
        },
        status
      );
    }
  }

  /**
   * GET /api/universities/search
   * Search universities by name
   */
  async searchUniversities(c: Context) {
    try {
      const searchTerm = c.req.query("q") || "";
      const limit = c.req.query("limit")
        ? parseInt(c.req.query("limit")!)
        : 10;

      const universities = await universityService.searchUniversities(
        searchTerm,
        limit
      );

      return c.json({ universities });
    } catch (error: any) {
      return c.json(
        {
          error: error.message,
        },
        400
      );
    }
  }

  /**
   * GET /api/universities/favorites
   * Get user's favorite universities
   */
  async getFavorites(c: Context) {
    try {
      const userId = c.get("userId");

      const favorites = await universityService.getUserFavorites(userId);

      return c.json({ favorites });
    } catch (error: any) {
      return c.json(
        {
          error: error.message,
        },
        500
      );
    }
  }

  /**
   * POST /api/universities/:id/favorite
   * Add university to favorites
   */
  async addToFavorites(c: Context) {
    try {
      const userId = c.get("userId");
      const universityId = c.req.param("id");

      await universityService.addToFavorites(userId, universityId);

      return c.json({
        message: "University added to favorites",
      });
    } catch (error: any) {
      return c.json(
        {
          error: error.message || "Failed to add favorite",
        },
        400
      );
    }
  }

  /**
   * DELETE /api/universities/:id/favorite
   * Remove university from favorites
   */
  async removeFromFavorites(c: Context) {
    try {
      const userId = c.get("userId");
      const universityId = c.req.param("id");

      await universityService.removeFromFavorites(userId, universityId);

      return c.json({
        message: "University removed from favorites",
      });
    } catch (error: any) {
      return c.json(
        {
          error: error.message,
        },
        500
      );
    }
  }
}

export const universityController = new UniversityController();
