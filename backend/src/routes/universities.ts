import { Hono } from "hono";
import { eq, like, and, gte, lte, sql, or, ilike } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  universities,
  scholarships,
  universityScholarships,
} from "../db/schema.js";

const app = new Hono();

// GET /universities - List all universities with filtering
app.get("/", async (c) => {
  try {
    const {
      country,
      type,
      minRanking,
      maxRanking,
      minTuition,
      maxTuition,
      minAcceptanceRate,
      maxAcceptanceRate,
      search,
      limit = "50",
      offset = "0",
    } = c.req.query();

    let query = db.select().from(universities);
    const conditions = [];

    // Apply filters
    if (country) {
      conditions.push(eq(universities.country, country));
    }

    if (type) {
      conditions.push(eq(universities.type, type as "public" | "private"));
    }

    if (minRanking) {
      conditions.push(gte(universities.ranking, parseInt(minRanking)));
    }

    if (maxRanking) {
      conditions.push(lte(universities.ranking, parseInt(maxRanking)));
    }

    // Tuition range filters (parse tuition ranges like "$57,000 - $60,000")
    if (minTuition) {
      conditions.push(
        sql`CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(${
          universities.tuitionRange
        }, ' - ', 1), '[^0-9]', '', 'g'), '') AS INTEGER) >= ${parseInt(
          minTuition
        )}`
      );
    }

    if (maxTuition) {
      conditions.push(
        sql`CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(${
          universities.tuitionRange
        }, ' - ', 2), '[^0-9]', '', 'g'), '') AS INTEGER) <= ${parseInt(
          maxTuition
        )}`
      );
    }

    // Acceptance rate filters (parse decimal strings like "3.43")
    if (minAcceptanceRate) {
      conditions.push(
        sql`CAST(${universities.acceptanceRate} AS DECIMAL) >= ${parseFloat(
          minAcceptanceRate
        )}`
      );
    }

    if (maxAcceptanceRate) {
      conditions.push(
        sql`CAST(${universities.acceptanceRate} AS DECIMAL) <= ${parseFloat(
          maxAcceptanceRate
        )}`
      );
    }

    if (search) {
      // Improved search: case-insensitive search across multiple fields
      const searchTerm = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(universities.name, searchTerm),
          ilike(universities.location, searchTerm),
          ilike(universities.description, searchTerm),
          sql`LOWER(${universities.specialties}::text) LIKE ${searchTerm}`
        )
      );
    }

    let whereClause = undefined;

    if (conditions.length > 0) {
      whereClause = and(...conditions);
    }

    // Get total count for pagination
    const countQuery = db.select({ count: sql`COUNT(*)` }).from(universities);

    if (whereClause) {
      countQuery.where(whereClause);
    }

    const [countResult] = await countQuery;
    const totalCount = parseInt(countResult.count as string);

    const results = await db
      .select()
      .from(universities)
      .where(whereClause)
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderBy(universities.ranking);

    // Return pagination metadata along with results
    return c.json({
      universities: results,
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
    console.error("Error fetching universities:", error);
    return c.json({ error: "Failed to fetch universities" }, 500);
  }
});

// GET /universities/:id - Get a specific university
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const result = await db
      .select()
      .from(universities)
      .where(eq(universities.id, id))
      .limit(1);

    if (result.length === 0) {
      return c.json({ error: "University not found" }, 404);
    }

    return c.json({ university: result[0] });
  } catch (error) {
    console.error("Error fetching university:", error);
    return c.json({ error: "Failed to fetch university" }, 500);
  }
});

// POST /universities - Create a new university
app.post("/", async (c) => {
  try {
    const body = await c.req.json();

    const result = await db.insert(universities).values(body).returning();

    return c.json(
      {
        message: "University created successfully",
        university: result[0],
      },
      201
    );
  } catch (error) {
    console.error("Error creating university:", error);
    return c.json({ error: "Failed to create university" }, 500);
  }
});

// DELETE /universities/:id - Delete a university
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Check if university exists
    const existing = await db
      .select()
      .from(universities)
      .where(eq(universities.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "University not found" }, 404);
    }

    // Delete the university (cascade will handle relationships)
    await db.delete(universities).where(eq(universities.id, id));

    return c.json({ message: "University deleted successfully" });
  } catch (error) {
    console.error("Error deleting university:", error);
    return c.json({ error: "Failed to delete university" }, 500);
  }
});

// GET /universities/:id/scholarships - Get scholarships for a specific university
app.get("/:id/scholarships", async (c) => {
  try {
    const id = c.req.param("id");

    // Check if university exists
    const university = await db
      .select()
      .from(universities)
      .where(eq(universities.id, id))
      .limit(1);

    if (university.length === 0) {
      return c.json({ error: "University not found" }, 404);
    }

    // Get scholarships for this university
    const results = await db
      .select({
        scholarship: scholarships,
        relationCreatedAt: universityScholarships.createdAt,
      })
      .from(scholarships)
      .innerJoin(
        universityScholarships,
        eq(scholarships.id, universityScholarships.scholarshipId)
      )
      .where(eq(universityScholarships.universityId, id))
      .orderBy(scholarships.name);

    return c.json({
      university: university[0],
      scholarships: results.map((r: any) => ({
        ...r.scholarship,
        relationCreatedAt: r.relationCreatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching university scholarships:", error);
    return c.json({ error: "Failed to fetch university scholarships" }, 500);
  }
});

export default app;
