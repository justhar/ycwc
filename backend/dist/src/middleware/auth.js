import { verifyToken } from "../utils/auth.js";
export const authMiddleware = async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "No token provided" }, 401);
    }
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    if (!decoded) {
        return c.json({ error: "Invalid or expired token" }, 401);
    }
    // Add user ID to context for use in protected routes
    c.set("userId", decoded.userId);
    await next();
};
