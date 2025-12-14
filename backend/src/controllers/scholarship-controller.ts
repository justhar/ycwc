/**
 * Scholarship Controller
 * Handles HTTP requests for scholarship endpoints
 */

import type { Context } from "hono";
import { scholarshipService } from "../services/index.js";

export class ScholarshipController {
  /**
   * GET /api/scholarships
   * Get all scholarships with optional filters
   */
  async getScholarships(c: Context) {
    try {
      const params = {
        type: c.req.query("type") as
          | "fully-funded"
          | "partially-funded"
          | "tuition-only"
          | undefined,
        country: c.req.query("country"),
        limit: c.req.query("limit") ? parseInt(c.req.query("limit")!) : 20,
        offset: c.req.query("offset") ? parseInt(c.req.query("offset")!) : 0,
      };

      const result = await scholarshipService.getAllScholarships(params);

      return c.json({
        scholarships: result.data,
        pagination: result.pagination,
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
   * GET /api/scholarships/:id
   * Get single scholarship by ID
   */
  async getScholarship(c: Context) {
    try {
      const scholarshipId = c.req.param("id");

      const scholarship = await scholarshipService.getScholarshipById(
        scholarshipId
      );

      return c.json({ scholarship });
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
   * GET /api/scholarships/search
   * Search scholarships by name
   */
  async searchScholarships(c: Context) {
    try {
      const searchTerm = c.req.query("q") || "";
      const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 10;

      const scholarships = await scholarshipService.searchScholarships(
        searchTerm,
        limit
      );

      return c.json({ scholarships });
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
   * GET /api/scholarships/favorites
   * Get user's favorite scholarships
   */
  async getFavorites(c: Context) {
    try {
      const userId = c.get("userId");

      const favorites = await scholarshipService.getUserFavorites(userId);

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
   * POST /api/scholarships/:id/favorite
   * Add scholarship to favorites
   */
  async addToFavorites(c: Context) {
    try {
      const userId = c.get("userId");
      const scholarshipId = c.req.param("id");

      await scholarshipService.addToFavorites(userId, scholarshipId);

      return c.json({
        message: "Scholarship added to favorites",
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
   * DELETE /api/scholarships/:id/favorite
   * Remove scholarship from favorites
   */
  async removeFromFavorites(c: Context) {
    try {
      const userId = c.get("userId");
      const scholarshipId = c.req.param("id");

      await scholarshipService.removeFromFavorites(userId, scholarshipId);

      return c.json({
        message: "Scholarship removed from favorites",
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

export const scholarshipController = new ScholarshipController();
