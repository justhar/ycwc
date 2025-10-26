import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db/db.js";
import {
  users,
  profiles,
  userFavorites,
  universities,
  userScholarshipFavorites,
  scholarships,
} from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { getLocalizedMessage, getLanguageFromHeader } from "../utils/i18n.js";

const user = new Hono();

// Protected route - Get current user profile
user.get("/profile", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const lang = getLanguageFromHeader(c);

    // Get basic user info
    const userInfo = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (userInfo.length === 0) {
      return c.json(
        { error: getLocalizedMessage("userNotFound", "errors", lang) },
        404
      );
    }

    // Get detailed profile info (if exists)
    const profileInfo = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    return c.json({
      user: userInfo[0],
      profile: profileInfo.length > 0 ? profileInfo[0] : null,
    });
  } catch (error) {
    console.error("Profile error:", error);
    const lang = getLanguageFromHeader(c);
    return c.json(
      { error: getLocalizedMessage("internalServerError", "errors", lang) },
      500
    );
  }
});

// Protected route - Update user profile
user.put("/profile", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const profileData = await c.req.json();

    // Validate required fields and prepare data
    const {
      // Identity information
      dateOfBirth,
      nationality,
      // Academic information
      targetLevel,
      intendedMajor,
      intendedCountry,
      budgetMin,
      budgetMax,
      institution,
      graduationYear,
      academicScore,
      scoreScale,
      // JSON arrays
      englishTests = [],
      standardizedTests = [],
      awards = [],
      extracurriculars = [],
    } = profileData;

    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    let updatedProfile;

    if (existingProfile.length > 0) {
      // Update existing profile
      updatedProfile = await db
        .update(profiles)
        .set({
          dateOfBirth: dateOfBirth || null,
          nationality: nationality || "Indonesia",
          targetLevel,
          intendedMajor,
          intendedCountry,
          budgetMin,
          budgetMax,
          institution,
          graduationYear,
          academicScore,
          scoreScale,
          englishTests,
          standardizedTests,
          awards,
          extracurriculars,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId))
        .returning();
    } else {
      // Create new profile
      updatedProfile = await db
        .insert(profiles)
        .values({
          userId,
          dateOfBirth: dateOfBirth || null,
          nationality: nationality || "Indonesia",
          targetLevel,
          intendedMajor,
          intendedCountry,
          budgetMin,
          budgetMax,
          institution,
          graduationYear,
          academicScore,
          scoreScale,
          englishTests,
          standardizedTests,
          awards,
          extracurriculars,
        })
        .returning();
    }
    const lang = getLanguageFromHeader(c);

    return c.json({
      message: getLocalizedMessage("profileUpdated", "success", lang),
      profile: updatedProfile[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);
    const lang = getLanguageFromHeader(c);
    return c.json(
      { error: getLocalizedMessage("internalServerError", "errors", lang) },
      500
    );
  }
});

// Protected route - Update basic user information
user.put("/info", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const { fullName } = await c.req.json();
    const lang = getLanguageFromHeader(c);

    if (!fullName || fullName.trim().length < 2) {
      return c.json(
        { error: getLocalizedMessage("fullNameTooShort", "errors", lang) },
        400
      );
    }

    const updatedUser = await db
      .update(users)
      .set({
        fullName: fullName.trim(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      });

    if (updatedUser.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      message: "User information updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("User update error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /user/favorites - Get all favorite universities for the authenticated user
user.get("/favorites", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    const favorites = await db
      .select({
        id: userFavorites.id,
        university: universities,
        createdAt: userFavorites.createdAt,
      })
      .from(userFavorites)
      .innerJoin(universities, eq(userFavorites.universityId, universities.id))
      .where(eq(userFavorites.userId, userId))
      .orderBy(userFavorites.createdAt);

    return c.json(favorites);
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return c.json({ error: "Failed to fetch favorites" }, 500);
  }
});

// POST /user/favorites/:universityId - Add a university to user's favorites
user.post("/favorites/:universityId", authMiddleware, async (c) => {
  try {
    const universityId = c.req.param("universityId");
    const userId = c.get("userId");

    let finalUniversityId = universityId;
    let university;

    // Handle AI-suggested universities differently
    if (universityId.startsWith("ai-suggested-")) {
      // For AI-suggested universities, check if one with same name already exists first
      try {
        const universityData = await c.req.json();

        // Check if university with same name already exists
        const existingUniversity = await db
          .select()
          .from(universities)
          .where(eq(universities.name, universityData.name))
          .limit(1);

        if (existingUniversity.length > 0) {
          // Use existing university
          finalUniversityId = existingUniversity[0].id;
          university = existingUniversity;
        } else {
          // Create new university
          const newUniversity = await db
            .insert(universities)
            .values({
              name: universityData.name,
              location: universityData.location,
              country: universityData.country,
              ranking: universityData.ranking || 0,
              studentCount: universityData.studentCount || 0,
              establishedYear: universityData.establishedYear || 0,
              type: universityData.type || "public",
              tuitionRange: universityData.tuitionRange || "Not specified",
              acceptanceRate: universityData.acceptanceRate || "0.00",
              description: universityData.description || "",
              website: universityData.website || "",
              imageUrl: universityData.imageUrl || null,
              specialties: universityData.specialties || [],
              campusSize: universityData.campusSize || null,
              roomBoardCost: universityData.roomBoardCost || null,
              booksSuppliesCost: universityData.booksSuppliesCost || null,
              personalExpensesCost: universityData.personalExpensesCost || null,
              facilitiesInfo: universityData.facilitiesInfo || {},
              housingOptions: universityData.housingOptions || [],
              studentOrganizations: universityData.studentOrganizations || [],
              diningOptions: universityData.diningOptions || [],
              transportationInfo: universityData.transportationInfo || [],
              source: "ai_suggested",
            })
            .returning();

          finalUniversityId = newUniversity[0].id;
          university = newUniversity;
        }
      } catch (error) {
        return c.json(
          { error: "Invalid university data for AI-suggested university" },
          400
        );
      }
    } else {
      // For regular universities, check if they exist
      university = await db
        .select()
        .from(universities)
        .where(eq(universities.id, universityId))
        .limit(1);

      if (university.length === 0) {
        return c.json({ error: "University not found" }, 404);
      }
    }

    // Check if already favorited
    const existingFavorite = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.universityId, finalUniversityId)
        )
      )
      .limit(1);

    if (existingFavorite.length > 0) {
      return c.json({ error: "University already in favorites" }, 409);
    }

    // Add to favorites
    const result = await db
      .insert(userFavorites)
      .values({
        userId: userId,
        universityId: finalUniversityId,
      })
      .returning();

    return c.json({
      message: "University added to favorites",
      favorite: result[0],
    });
  } catch (error) {
    console.error("Error adding university to favorites:", error);
    return c.json({ error: "Failed to add to favorites" }, 500);
  }
});

// DELETE /user/favorites/:universityId - Remove a university from user's favorites
user.delete("/favorites/:universityId", authMiddleware, async (c) => {
  try {
    const universityId = c.req.param("universityId");
    const userId = c.get("userId");

    let finalUniversityId = universityId;

    // Handle AI-suggested universities
    if (universityId.startsWith("ai-suggested-")) {
      // For AI-suggested universities, we need to find the real UUID
      // Extract name from the generated ID (remove "ai-suggested-" prefix)
      const namePart = universityId.replace(/^ai-suggested-/, "");

      // Find university by name (normalize both sides for comparison)
      const normalizedNameFromId = namePart.replace(/-/g, " ").toLowerCase();

      const universityRecords = await db.select().from(universities);

      // Find university with matching normalized name
      const university = universityRecords.find(
        (uni) => uni.name.toLowerCase() === normalizedNameFromId
      );

      if (!university) {
        return c.json({ error: "AI-suggested university not found" }, 404);
      }

      finalUniversityId = university.id;
    }

    // Check if the favorite exists
    const existingFavorite = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.universityId, finalUniversityId)
        )
      )
      .limit(1);

    if (existingFavorite.length === 0) {
      return c.json({ error: "University not in favorites" }, 404);
    }

    // Remove from favorites
    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.universityId, finalUniversityId)
        )
      );

    return c.json({ message: "University removed from favorites" });
  } catch (error) {
    console.error("Error removing university from favorites:", error);
    return c.json({ error: "Failed to remove from favorites" }, 500);
  }
});

// GET /user/favorites/check/:universityId - Check if a university is favorited
user.get("/favorites/check/:universityId", authMiddleware, async (c) => {
  try {
    const universityId = c.req.param("universityId");
    const userId = c.get("userId");

    let finalUniversityId = universityId;

    // Handle AI-suggested universities
    if (universityId.startsWith("ai-suggested-")) {
      // For AI-suggested universities, we need to find the real UUID
      // Extract name from the generated ID (remove "ai-suggested-" prefix)
      const namePart = universityId.replace(/^ai-suggested-/, "");

      // Find university by name (normalize both sides for comparison)
      const normalizedNameFromId = namePart.replace(/-/g, " ").toLowerCase();

      const universityRecords = await db.select().from(universities);

      // Find university with matching normalized name (more robust matching)
      const university = universityRecords.find((uni) => {
        // Clean and normalize both names for comparison
        const cleanDbName = uni.name
          .toLowerCase()
          .replace(/[^\w\s]/g, "") // Remove special characters
          .replace(/\s+/g, " ")
          .trim();
        const cleanIdName = normalizedNameFromId
          .replace(/[^\w\s]/g, "") // Remove special characters
          .replace(/\s+/g, " ")
          .trim();

        return (
          cleanDbName === cleanIdName ||
          cleanDbName.includes(cleanIdName) ||
          cleanIdName.includes(cleanDbName)
        );
      });

      if (!university) {
        return c.json({ error: "AI-suggested university not found" }, 404);
      }

      finalUniversityId = university.id;
    }

    const favorite = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.universityId, finalUniversityId)
        )
      )
      .limit(1);

    return c.json({ isFavorite: favorite.length > 0 });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return c.json({ error: "Failed to check favorite status" }, 500);
  }
});

// GET /user/scholarship-favorites - Get all favorite scholarships for the authenticated user
user.get("/scholarship-favorites", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    const favorites = await db
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
        applicationUrl: scholarships.applicationUrl,
        eligiblePrograms: scholarships.eligiblePrograms,
        maxRecipients: scholarships.maxRecipients,
        createdAt: scholarships.createdAt,
        updatedAt: scholarships.updatedAt,
      })
      .from(userScholarshipFavorites)
      .innerJoin(
        scholarships,
        eq(userScholarshipFavorites.scholarshipId, scholarships.id)
      )
      .where(eq(userScholarshipFavorites.userId, userId))
      .orderBy(userScholarshipFavorites.createdAt);

    return c.json(favorites);
  } catch (error) {
    console.error("Error fetching scholarship favorites:", error);
    return c.json({ error: "Failed to fetch scholarship favorites" }, 500);
  }
});

// POST /user/scholarship-favorites/:scholarshipId - Add a scholarship to user's favorites
user.post(
  "/scholarship-favorites/:scholarshipId",
  authMiddleware,
  async (c) => {
    try {
      const scholarshipId = c.req.param("scholarshipId");
      const userId = c.get("userId");

      // Check if the scholarship exists
      const scholarship = await db
        .select()
        .from(scholarships)
        .where(eq(scholarships.id, scholarshipId))
        .limit(1);

      if (scholarship.length === 0) {
        return c.json({ error: "Scholarship not found" }, 404);
      }

      // Check if already favorited
      const existingFavorite = await db
        .select()
        .from(userScholarshipFavorites)
        .where(
          and(
            eq(userScholarshipFavorites.userId, userId),
            eq(userScholarshipFavorites.scholarshipId, scholarshipId)
          )
        )
        .limit(1);

      if (existingFavorite.length > 0) {
        return c.json({ error: "Scholarship already in favorites" }, 409);
      }

      // Add to favorites
      const result = await db
        .insert(userScholarshipFavorites)
        .values({
          userId: userId,
          scholarshipId: scholarshipId,
        })
        .returning();

      return c.json({
        message: "Scholarship added to favorites",
        favorite: result[0],
      });
    } catch (error) {
      console.error("Error adding scholarship to favorites:", error);
      return c.json({ error: "Failed to add to favorites" }, 500);
    }
  }
);

// DELETE /user/scholarship-favorites/:scholarshipId - Remove a scholarship from user's favorites
user.delete(
  "/scholarship-favorites/:scholarshipId",
  authMiddleware,
  async (c) => {
    try {
      const scholarshipId = c.req.param("scholarshipId");
      const userId = c.get("userId");

      // Check if the favorite exists
      const existingFavorite = await db
        .select()
        .from(userScholarshipFavorites)
        .where(
          and(
            eq(userScholarshipFavorites.userId, userId),
            eq(userScholarshipFavorites.scholarshipId, scholarshipId)
          )
        )
        .limit(1);

      if (existingFavorite.length === 0) {
        return c.json({ error: "Scholarship not in favorites" }, 404);
      }

      // Remove from favorites
      await db
        .delete(userScholarshipFavorites)
        .where(
          and(
            eq(userScholarshipFavorites.userId, userId),
            eq(userScholarshipFavorites.scholarshipId, scholarshipId)
          )
        );

      return c.json({ message: "Scholarship removed from favorites" });
    } catch (error) {
      console.error("Error removing scholarship from favorites:", error);
      return c.json({ error: "Failed to remove from favorites" }, 500);
    }
  }
);

// GET /user/scholarship-favorites/check/:scholarshipId - Check if a scholarship is favorited
user.get(
  "/scholarship-favorites/check/:scholarshipId",
  authMiddleware,
  async (c) => {
    try {
      const scholarshipId = c.req.param("scholarshipId");
      const userId = c.get("userId");

      const favorite = await db
        .select()
        .from(userScholarshipFavorites)
        .where(
          and(
            eq(userScholarshipFavorites.userId, userId),
            eq(userScholarshipFavorites.scholarshipId, scholarshipId)
          )
        )
        .limit(1);

      return c.json({ isFavorite: favorite.length > 0 });
    } catch (error) {
      console.error("Error checking scholarship favorite status:", error);
      return c.json({ error: "Failed to check favorite status" }, 500);
    }
  }
);

export default user;
