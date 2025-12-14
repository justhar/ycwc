/**
 * Profile Controller
 * Handles HTTP requests for user profile endpoints
 */
import { profileService } from "../services/index.js";
import { getLocalizedMessage, getLanguageFromHeader } from "../utils/i18n.js";
export class ProfileController {
    /**
     * GET /api/user/profile
     * Get user profile with user data
     */
    async getProfile(c) {
        try {
            const userId = c.get("userId");
            const data = await profileService.getProfileWithUser(userId);
            return c.json(data);
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 500);
        }
    }
    /**
     * PUT /api/user/profile
     * Update user profile
     */
    async updateProfile(c) {
        try {
            const userId = c.get("userId");
            const body = await c.req.json();
            const lang = getLanguageFromHeader(c);
            const profile = await profileService.upsertProfile(userId, body);
            return c.json({
                message: getLocalizedMessage("profileUpdated", "success", lang),
                profile,
            });
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 400);
        }
    }
    /**
     * DELETE /api/user/profile
     * Delete user profile
     */
    async deleteProfile(c) {
        try {
            const userId = c.get("userId");
            const lang = getLanguageFromHeader(c);
            await profileService.deleteProfile(userId);
            return c.json({
                message: getLocalizedMessage("profileUpdated", "success", lang),
            });
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 500);
        }
    }
    /**
     * PUT /api/user/info
     * Update user basic information (fullName)
     */
    async updateUserInfo(c) {
        try {
            const userId = c.get("userId");
            const body = await c.req.json();
            const lang = getLanguageFromHeader(c);
            const user = await profileService.updateUserInfo(userId, body);
            return c.json({
                message: getLocalizedMessage("userUpdated", "success", lang),
                user,
            });
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 400);
        }
    }
    /**
     * GET /api/user/favorites/universities
     * Get user's favorite universities
     */
    async getFavoriteUniversities(c) {
        try {
            const userId = c.get("userId");
            const favorites = await profileService.getFavoriteUniversities(userId);
            return c.json(favorites);
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 500);
        }
    }
    /**
     * GET /api/user/favorites/scholarships
     * Get user's favorite scholarships
     */
    async getFavoriteScholarships(c) {
        try {
            const userId = c.get("userId");
            const favorites = await profileService.getFavoriteScholarships(userId);
            return c.json(favorites);
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 500);
        }
    }
    /**
     * POST /api/user/favorites/:universityId
     * Add university to favorites
     */
    async addFavoriteUniversity(c) {
        try {
            const userId = c.get("userId");
            const { universityId } = c.req.param();
            const lang = getLanguageFromHeader(c);
            const favorite = await profileService.addFavoriteUniversity(userId, universityId);
            return c.json({
                message: getLocalizedMessage("addedToFavorites", "success", lang),
                favorite,
            });
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 400);
        }
    }
    /**
     * POST /api/user/favorites/scholarships/:scholarshipId
     * Add scholarship to favorites
     */
    async addFavoriteScholarship(c) {
        try {
            const userId = c.get("userId");
            const { scholarshipId } = c.req.param();
            const lang = getLanguageFromHeader(c);
            const favorite = await profileService.addFavoriteScholarship(userId, scholarshipId);
            return c.json({
                message: getLocalizedMessage("addedToFavorites", "success", lang),
                favorite,
            });
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 400);
        }
    }
    /**
     * DELETE /api/user/favorites/:universityId
     * Remove university from favorites
     */
    async removeFavoriteUniversity(c) {
        try {
            const userId = c.get("userId");
            const { universityId } = c.req.param();
            const lang = getLanguageFromHeader(c);
            await profileService.removeFavoriteUniversity(userId, universityId);
            return c.json({
                message: getLocalizedMessage("removedFromFavorites", "success", lang),
            });
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 500);
        }
    }
    /**
     * DELETE /api/user/favorites/scholarships/:scholarshipId
     * Remove scholarship from favorites
     */
    async removeFavoriteScholarship(c) {
        try {
            const userId = c.get("userId");
            const { scholarshipId } = c.req.param();
            const lang = getLanguageFromHeader(c);
            await profileService.removeFavoriteScholarship(userId, scholarshipId);
            return c.json({
                message: getLocalizedMessage("removedFromFavorites", "success", lang),
            });
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 500);
        }
    }
    /**
     * GET /api/user/favorites/check/:universityId
     * Check if university is favorited
     */
    async checkFavoriteUniversity(c) {
        try {
            const userId = c.get("userId");
            const { universityId } = c.req.param();
            const isFavorite = await profileService.checkFavoriteUniversity(userId, universityId);
            return c.json({ isFavorite });
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 500);
        }
    }
    /**
     * GET /api/user/favorites/scholarships/check/:scholarshipId
     * Check if scholarship is favorited
     */
    async checkFavoriteScholarship(c) {
        try {
            const userId = c.get("userId");
            const { scholarshipId } = c.req.param();
            const isFavorite = await profileService.checkFavoriteScholarship(userId, scholarshipId);
            return c.json({ isFavorite });
        }
        catch (error) {
            const lang = getLanguageFromHeader(c);
            return c.json({
                error: error.message ||
                    getLocalizedMessage("internalServerError", "errors", lang),
            }, 500);
        }
    }
}
export const profileController = new ProfileController();
