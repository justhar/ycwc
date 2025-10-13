import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const user = new Hono();

// Protected route - Get current user profile
user.get("/profile", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    const userProfile = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (userProfile.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: userProfile[0],
    });
  } catch (error) {
    console.error("Profile error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default user;
