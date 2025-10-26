import { Hono } from "hono";
import { eq, like, and, sql, or, ilike, gte, lte } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  scholarships,
  universities,
  universityScholarships,
} from "../db/schema.js";

const app = new Hono();

// GET /scholarships - List all scholarships with filtering
app.get("/", async (c) => {
  try {
    const {
      country,
      type,
      provider,
      minAmount,
      maxAmount,
      search,
      limit = "50",
      offset = "0",
    } = c.req.query();

    const conditions = [];

    // Apply filters
    if (country) {
      conditions.push(eq(scholarships.country, country));
    }

    if (type) {
      conditions.push(
        eq(
          scholarships.type,
          type as "fully-funded" | "partially-funded" | "tuition-only"
        )
      );
    }

    if (provider) {
      conditions.push(ilike(scholarships.provider, `%${provider}%`));
    }

    // Amount range filters (parse scholarship amounts like "$50,000", "$25,000 - $30,000", "Full tuition")
    if (minAmount) {
      conditions.push(
        sql`CASE 
          WHEN ${scholarships.amount} ~ '^[0-9,]+$' THEN CAST(REPLACE(${
          scholarships.amount
        }, ',', '') AS INTEGER) >= ${parseInt(minAmount)}
          WHEN ${
            scholarships.amount
          } ~ '^\\$[0-9,]+$' THEN CAST(REPLACE(SUBSTRING(${
          scholarships.amount
        } FROM 2), ',', '') AS INTEGER) >= ${parseInt(minAmount)}
          WHEN ${
            scholarships.amount
          } ~ '^\\$[0-9,]+ - \\$[0-9,]+$' THEN CAST(REPLACE(SUBSTRING(SPLIT_PART(${
          scholarships.amount
        }, ' - ', 1) FROM 2), ',', '') AS INTEGER) >= ${parseInt(minAmount)}
          ELSE TRUE
        END`
      );
    }

    if (maxAmount) {
      conditions.push(
        sql`CASE 
          WHEN ${scholarships.amount} ~ '^[0-9,]+$' THEN CAST(REPLACE(${
          scholarships.amount
        }, ',', '') AS INTEGER) <= ${parseInt(maxAmount)}
          WHEN ${
            scholarships.amount
          } ~ '^\\$[0-9,]+$' THEN CAST(REPLACE(SUBSTRING(${
          scholarships.amount
        } FROM 2), ',', '') AS INTEGER) <= ${parseInt(maxAmount)}
          WHEN ${
            scholarships.amount
          } ~ '^\\$[0-9,]+ - \\$[0-9,]+$' THEN CAST(REPLACE(SUBSTRING(SPLIT_PART(${
          scholarships.amount
        }, ' - ', 2) FROM 2), ',', '') AS INTEGER) <= ${parseInt(maxAmount)}
          ELSE TRUE
        END`
      );
    }

    if (search) {
      // Enhanced search across multiple fields
      const searchTerm = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(scholarships.name, searchTerm),
          ilike(scholarships.description, searchTerm),
          ilike(scholarships.provider, searchTerm),
          sql`LOWER(${scholarships.requirements}::text) LIKE ${searchTerm}`,
          sql`LOWER(${scholarships.eligiblePrograms}::text) LIKE ${searchTerm}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const countQuery = db.select({ count: sql`COUNT(*)` }).from(scholarships);

    if (whereClause) {
      countQuery.where(whereClause);
    }

    const [countResult] = await countQuery;
    const totalCount = parseInt(countResult.count as string);

    const results = await db
      .select()
      .from(scholarships)
      .where(whereClause)
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderBy(scholarships.name);

    // Return pagination metadata along with results
    return c.json({
      scholarships: results,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        currentPage: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        hasNext: parseInt(offset) + parseInt(limit) < totalCount,
        hasPrev: parseInt(offset) > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return c.json({ error: "Failed to fetch scholarships" }, 500);
  }
});

// GET /scholarships/favorites - Get user's favorite scholarships (protected)
app.get("/favorites", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Authorization required" }, 401);
    }

    const { userScholarshipFavorites, users } = await import("../db/schema.js");

    // For now, let's get the first user from the database
    // TODO: Replace this with proper JWT token verification
    const user = await db.select().from(users).limit(1);

    if (user.length === 0) {
      return c.json({ error: "No users found" }, 404);
    }

    const userId = user[0].id;

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
      .where(eq(userScholarshipFavorites.userId, userId));

    return c.json(favorites);
  } catch (error) {
    console.error("Error fetching favorite scholarships:", error);
    return c.json({ error: "Failed to fetch favorite scholarships" }, 500);
  }
});

// GET /scholarships/:id - Get a specific scholarship
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const result = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.id, id))
      .limit(1);

    if (result.length === 0) {
      return c.json({ error: "Scholarship not found" }, 404);
    }

    return c.json({ scholarship: result[0] });
  } catch (error) {
    console.error("Error fetching scholarship:", error);
    return c.json({ error: "Failed to fetch scholarship" }, 500);
  }
});

// POST /scholarships - Create a new scholarship
app.post("/", async (c) => {
  try {
    const body = await c.req.json();

    const result = await db.insert(scholarships).values(body).returning();

    return c.json(
      {
        message: "Scholarship created successfully",
        scholarship: result[0],
      },
      201
    );
  } catch (error) {
    console.error("Error creating scholarship:", error);
    return c.json({ error: "Failed to create scholarship" }, 500);
  }
});

// DELETE /scholarships/:id - Delete a scholarship
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Check if scholarship exists
    const existing = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "Scholarship not found" }, 404);
    }

    // Delete the scholarship (cascade will handle relationships)
    await db.delete(scholarships).where(eq(scholarships.id, id));

    return c.json({ message: "Scholarship deleted successfully" });
  } catch (error) {
    console.error("Error deleting scholarship:", error);
    return c.json({ error: "Failed to delete scholarship" }, 500);
  }
});

// POST /scholarships/:id/universities - Add university relationship to scholarship
app.post("/:id/universities", async (c) => {
  try {
    const scholarshipId = c.req.param("id");
    const { universityId } = await c.req.json();

    // Check if scholarship exists
    const scholarship = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.id, scholarshipId))
      .limit(1);

    if (scholarship.length === 0) {
      return c.json({ error: "Scholarship not found" }, 404);
    }

    // Check if university exists
    const university = await db
      .select()
      .from(universities)
      .where(eq(universities.id, universityId))
      .limit(1);

    if (university.length === 0) {
      return c.json({ error: "University not found" }, 404);
    }

    // Check if relationship already exists
    const existingRelation = await db
      .select()
      .from(universityScholarships)
      .where(
        and(
          eq(universityScholarships.scholarshipId, scholarshipId),
          eq(universityScholarships.universityId, universityId)
        )
      )
      .limit(1);

    if (existingRelation.length > 0) {
      return c.json({ error: "Relationship already exists" }, 400);
    }

    // Create the relationship
    const result = await db
      .insert(universityScholarships)
      .values({
        scholarshipId,
        universityId,
      })
      .returning();

    return c.json(
      {
        message: "University relationship added successfully",
        relationship: result[0],
      },
      201
    );
  } catch (error) {
    console.error("Error adding university relationship:", error);
    return c.json({ error: "Failed to add university relationship" }, 500);
  }
});

// GET /scholarships/:id/universities - Get universities for a specific scholarship
app.get("/:id/universities", async (c) => {
  try {
    const id = c.req.param("id");

    // Check if scholarship exists
    const scholarship = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.id, id))
      .limit(1);

    if (scholarship.length === 0) {
      return c.json({ error: "Scholarship not found" }, 404);
    }

    // Get universities for this scholarship
    const results = await db
      .select({
        university: universities,
        relationCreatedAt: universityScholarships.createdAt,
      })
      .from(universities)
      .innerJoin(
        universityScholarships,
        eq(universities.id, universityScholarships.universityId)
      )
      .where(eq(universityScholarships.scholarshipId, id))
      .orderBy(universities.name);

    return c.json({
      scholarship: scholarship[0],
      universities: results.map((r: any) => ({
        ...r.university,
        relationCreatedAt: r.relationCreatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching scholarship universities:", error);
    return c.json({ error: "Failed to fetch scholarship universities" }, 500);
  }
});

// POST /scholarships/:id/favorite - Add scholarship to favorites (protected)
app.post("/:id/favorite", async (c) => {
  try {
    const scholarshipId = c.req.param("id");
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Authorization required" }, 401);
    }

    // Import userScholarshipFavorites from schema
    const { userScholarshipFavorites, users } = await import("../db/schema.js");

    // For now, let's get the first user from the database
    // TODO: Replace this with proper JWT token verification
    const user = await db.select().from(users).limit(1);

    if (user.length === 0) {
      return c.json({ error: "No users found" }, 404);
    }

    const userId = user[0].id;

    // Check if scholarship exists
    const scholarship = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.id, scholarshipId))
      .limit(1);

    if (scholarship.length === 0) {
      return c.json({ error: "Scholarship not found" }, 404);
    }

    // Check if already favorited
    const existing = await db
      .select()
      .from(userScholarshipFavorites)
      .where(
        and(
          eq(userScholarshipFavorites.userId, userId),
          eq(userScholarshipFavorites.scholarshipId, scholarshipId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "Scholarship already in favorites" }, 400);
    }

    // Add to favorites
    await db.insert(userScholarshipFavorites).values({
      userId: userId,
      scholarshipId: scholarshipId,
    });

    return c.json({ message: "Scholarship added to favorites" });
  } catch (error) {
    console.error("Error adding scholarship to favorites:", error);
    return c.json({ error: "Failed to add scholarship to favorites" }, 500);
  }
});

// DELETE /scholarships/:id/favorite - Remove scholarship from favorites (protected)
app.delete("/:id/favorite", async (c) => {
  try {
    const scholarshipId = c.req.param("id");
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Authorization required" }, 401);
    }

    const { userScholarshipFavorites, users } = await import("../db/schema.js");

    // For now, let's get the first user from the database
    // TODO: Replace this with proper JWT token verification
    const user = await db.select().from(users).limit(1);

    if (user.length === 0) {
      return c.json({ error: "No users found" }, 404);
    }

    const userId = user[0].id;

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
    return c.json(
      { error: "Failed to remove scholarship from favorites" },
      500
    );
  }
});

export default app;
