import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  users,
  profiles,
  userFavorites,
  userScholarshipFavorites,
  universities,
  scholarships,
} from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { AIService } from "../utils/ai-service.js";

const app = new Hono();

// POST /task-recommendations - Generate AI task recommendations
app.post("/recommendations", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    // Get user profile
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (userProfile.length === 0) {
      return c.json(
        {
          error: "User profile not found. Please complete your profile first.",
        },
        404
      );
    }

    // Get user's favorite universities
    const favoriteUniversities = await db
      .select({
        id: universities.id,
        name: universities.name,
        location: universities.location,
        country: universities.country,
        type: universities.type,
        acceptanceRate: universities.acceptanceRate,
        tuitionRange: universities.tuitionRange,
      })
      .from(userFavorites)
      .leftJoin(universities, eq(userFavorites.universityId, universities.id))
      .where(eq(userFavorites.userId, userId));

    // Get user's favorite scholarships
    const favoriteScholarships = await db
      .select({
        id: scholarships.id,
        name: scholarships.name,
        type: scholarships.type,
        amount: scholarships.amount,
        description: scholarships.description,
        requirements: scholarships.requirements,
        deadline: scholarships.deadline,
        provider: scholarships.provider,
        country: scholarships.country,
      })
      .from(userScholarshipFavorites)
      .leftJoin(
        scholarships,
        eq(userScholarshipFavorites.scholarshipId, scholarships.id)
      )
      .where(eq(userScholarshipFavorites.userId, userId));

    // Use AI service to generate task recommendations
    const aiService = new AIService();
    const recommendations = await aiService.generateTaskRecommendations(
      userProfile[0],
      favoriteUniversities.filter((u) => u.name), // Filter out null joins
      favoriteScholarships.filter((s) => s.name) // Filter out null joins
    );

    return c.json({
      recommendations,
      profile: {
        targetLevel: userProfile[0].targetLevel,
        intendedMajor: userProfile[0].intendedMajor,
        institution: userProfile[0].institution,
      },
      favoriteUniversities: favoriteUniversities
        .filter((u) => u.name)
        .map((u) => u.name),
      favoriteScholarships: favoriteScholarships
        .filter((s) => s.name)
        .map((s) => s.name),
    });
  } catch (error) {
    console.error("Error generating task recommendations:", error);
    return c.json({ error: "Failed to generate recommendations" }, 500);
  }
});

export default app;
