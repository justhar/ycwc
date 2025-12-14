/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */
import { authService } from "../services/index.js";
import { getLocalizedMessage, getLanguageFromHeader } from "../utils/i18n.js";
export class AuthController {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    async register(c) {
        try {
            const body = await c.req.json();
            const result = await authService.register(body);
            return c.json(result);
        }
        catch (error) {
            return c.json({
                error: error.message || "Signup failed",
            }, 400);
        }
    }
    /**
     * POST /api/auth/login
     * Login user
     */
    async login(c) {
        try {
            const body = await c.req.json();
            const result = await authService.login(body);
            return c.json(result);
        }
        catch (error) {
            return c.json({
                error: error.message || "Login failed",
            }, 401);
        }
    }
    /**
     * POST /api/auth/logout
     * Logout user (client-side token removal)
     */
    async logout(c) {
        const lang = getLanguageFromHeader(c);
        return c.json({
            message: getLocalizedMessage("logoutSuccessful", "success", lang),
        });
    }
    /**
     * GET /api/auth/me
     * Get current user info
     */
    async getCurrentUser(c) {
        try {
            const userId = c.get("userId");
            const lang = getLanguageFromHeader(c);
            const user = await authService.getUserById(userId);
            if (!user) {
                return c.json({
                    error: getLocalizedMessage("userNotFound", "errors", lang),
                }, 404);
            }
            return c.json({
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                },
            });
        }
        catch (error) {
            return c.json({
                error: error.message,
            }, 500);
        }
    }
}
export const authController = new AuthController();
