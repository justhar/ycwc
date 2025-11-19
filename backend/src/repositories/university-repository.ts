/**
 * University Repository
 * Handles all database operations related to universities and favorites
 */

import { db } from "../db/db.js";
import { universities, userFavorites, scholarships, userScholarshipFavorites, universityScholarships } from "../db/schema.js";
import { eq, and, sql, gte, lte, ilike, desc } from "drizzle-orm";
import type { University, UniversitySearchParams } from "../types/index.js";

export class UniversityRepository {
  /**
   * Find all universities with optional filters and pagination
   */
  async findAll(params?: UniversitySearchParams) {
    let query = db.select().from(universities);

    // Apply filters if provided
    if (params?.country) {
      query = query.where(eq(universities.country, params.country)) as any;
    }

    if (params?.type) {
      query = query.where(eq(universities.type, params.type)) as any;
    }

    if (params?.minRanking) {
      query = query.where(gte(universities.ranking, params.minRanking)) as any;
    }

    if (params?.maxRanking) {
      query = query.where(lte(universities.ranking, params.maxRanking)) as any;
    }

    // Apply pagination
    const limit = params?.limit || 20;
    const offset = ((params?.page || 1) - 1) * limit;

    const results = await query.limit(limit).offset(offset);

    return results;
  }

  /**
   * Find all universities with pagination (using offset/limit)
   */
  async findAllWithPagination(params: any) {
    let query = db.select().from(universities);
    const conditions: any[] = [];

    // Apply filters if provided
    if (params.country) {
      conditions.push(eq(universities.country, params.country));
    }

    if (params.type) {
      conditions.push(eq(universities.type, params.type));
    }

    if (params.minRanking) {
      conditions.push(gte(universities.ranking, params.minRanking));
    }

    if (params.maxRanking) {
      conditions.push(lte(universities.ranking, params.maxRanking));
    }

    if (params.minAcceptanceRate) {
      conditions.push(gte(universities.acceptanceRate, params.minAcceptanceRate.toString()));
    }

    if (params.maxAcceptanceRate) {
      conditions.push(lte(universities.acceptanceRate, params.maxAcceptanceRate.toString()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Get total count
    const countQuery = db.select({ count: sql`count(*)` }).from(universities);
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    const countResult = await countQuery;
    const total = parseInt(countResult[0]?.count?.toString() || "0");

    // Apply pagination
    const limit = params.limit || 20;
    const offset = params.offset || 0;

    const results = await query.limit(limit).offset(offset);

    return {
      data: results,
      total,
    };
  }

  /**
   * Search universities by name with filters
   */
  async searchWithFilters(searchTerm: string, params: any) {
    const conditions: any[] = [ilike(universities.name, `%${searchTerm}%`)];

    if (params.country) {
      conditions.push(eq(universities.country, params.country));
    }

    if (params.type) {
      conditions.push(eq(universities.type, params.type));
    }

    if (params.minRanking) {
      conditions.push(gte(universities.ranking, params.minRanking));
    }

    if (params.maxRanking) {
      conditions.push(lte(universities.ranking, params.maxRanking));
    }

    if (params.minAcceptanceRate) {
      conditions.push(gte(universities.acceptanceRate, params.minAcceptanceRate.toString()));
    }

    if (params.maxAcceptanceRate) {
      conditions.push(lte(universities.acceptanceRate, params.maxAcceptanceRate.toString()));
    }

    // Get total count
    const countQuery = db.select({ count: sql`count(*)` }).from(universities);
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    const countResult = await countQuery;
    const total = parseInt(countResult[0]?.count?.toString() || "0");

    // Apply pagination and search
    const limit = params.limit || 20;
    const offset = params.offset || 0;

    const results = await db
      .select()
      .from(universities)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    return {
      data: results,
      total,
    };
  }

  /**
   * Find university by ID
   */
  async findById(universityId: string) {
    const result = await db
      .select()
      .from(universities)
      .where(eq(universities.id, universityId));

    return result[0] || null;
  }

  /**
   * Search universities by name
   */
  async searchByName(searchTerm: string, limit: number = 10) {
    return await db
      .select()
      .from(universities)
      .where(ilike(universities.name, `%${searchTerm}%`))
      .limit(limit);
  }

  /**
   * Create new university
   */
  async create(universityData: Partial<University>) {
    const result = await db
      .insert(universities)
      .values({
        name: universityData.name!,
        location: universityData.location!,
        country: universityData.country!,
        ranking: universityData.ranking!,
        studentCount: universityData.studentCount!,
        establishedYear: universityData.establishedYear!,
        type: universityData.type!,
        tuitionRange: universityData.tuitionRange!,
        acceptanceRate: universityData.acceptanceRate!,
        description: universityData.description!,
        website: universityData.website!,
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
        source: universityData.source || "manual",
      })
      .returning();

    return result[0];
  }

  /**
   * Update university
   */
  async update(universityId: string, updates: Partial<University>) {
    // Remove read-only fields
    const { id, createdAt, updatedAt, ...updateData } = updates as any;
    
    const result = await db
      .update(universities)
      .set(updateData)
      .where(eq(universities.id, universityId))
      .returning();

    return result[0];
  }

  /**
   * Delete university
   */
  async delete(universityId: string) {
    await db.delete(universities).where(eq(universities.id, universityId));
  }

  /**
   * Get user's favorite universities
   */
  async findFavoritesByUserId(userId: number) {
    return await db
      .select({
        id: userFavorites.id,
        universityId: userFavorites.universityId,
        university: universities,
        createdAt: userFavorites.createdAt,
      })
      .from(userFavorites)
      .innerJoin(universities, eq(userFavorites.universityId, universities.id))
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt));
  }

  /**
   * Add university to favorites
   */
  async addToFavorites(userId: number, universityId: string) {
    const result = await db
      .insert(userFavorites)
      .values({
        userId,
        universityId,
      })
      .returning();

    return result[0];
  }

  /**
   * Remove university from favorites
   */
  async removeFromFavorites(userId: number, universityId: string) {
    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.universityId, universityId)
        )
      );
  }

  /**
   * Check if university is favorited by user
   */
  async isFavorited(userId: number, universityId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.universityId, universityId)
        )
      );

    return result.length > 0;
  }

  /**
   * Count total universities with filters
   */
  async count(params?: UniversitySearchParams): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` }).from(universities);

    if (params?.country) {
      query = query.where(eq(universities.country, params.country)) as any;
    }

    if (params?.type) {
      query = query.where(eq(universities.type, params.type)) as any;
    }

    const result = await query;
    return result[0]?.count || 0;
  }

  /**
   * Find favorite scholarships by user ID
   */
  async findFavoriteScholarshipsByUserId(userId: number) {
    return await db
      .select({
        id: userScholarshipFavorites.id,
        scholarshipId: userScholarshipFavorites.scholarshipId,
        scholarship: scholarships,
        createdAt: userScholarshipFavorites.createdAt,
      })
      .from(userScholarshipFavorites)
      .innerJoin(scholarships, eq(userScholarshipFavorites.scholarshipId, scholarships.id))
      .where(eq(userScholarshipFavorites.userId, userId))
      .orderBy(desc(userScholarshipFavorites.createdAt));
  }

  /**
   * Find scholarships by university ID
   */
  async findScholarshipsByUniversityId(universityId: string) {
    return await db
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
      .from(scholarships)
      .innerJoin(
        universityScholarships,
        eq(scholarships.id, universityScholarships.scholarshipId)
      )
      .where(eq(universityScholarships.universityId, universityId));
  }
}

export const universityRepository = new UniversityRepository();
