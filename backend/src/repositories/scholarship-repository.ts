/**
 * Scholarship Repository
 * Handles all database operations related to scholarships and favorites
 */

import { db } from "../db/db.js";
import { scholarships, userScholarshipFavorites } from "../db/schema.js";
import { eq, and, desc, ilike } from "drizzle-orm";
import type { Scholarship, ScholarshipSearchParams } from "../types/index.js";

export class ScholarshipRepository {
  /**
   * Find all scholarships with optional filters and pagination
   */
  async findAll(params?: ScholarshipSearchParams & { offset?: number }) {
    let query = db.select().from(scholarships);
    let countQuery = db.select().from(scholarships);

    // Apply filters if provided
    if (params?.type) {
      query = query.where(eq(scholarships.type, params.type)) as any;
      countQuery = countQuery.where(eq(scholarships.type, params.type)) as any;
    }

    if (params?.country) {
      query = query.where(eq(scholarships.country, params.country)) as any;
      countQuery = countQuery.where(
        eq(scholarships.country, params.country)
      ) as any;
    }

    // Get total count before pagination
    const countResult = await countQuery;
    const total = countResult.length;

    // Apply pagination using offset/limit
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    const results = await query.limit(limit).offset(offset);

    // Calculate pagination metadata
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data: results,
      pagination: {
        total,
        limit,
        offset,
        totalPages,
        currentPage,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  }

  /**
   * Find scholarship by ID
   */
  async findById(scholarshipId: string) {
    const result = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.id, scholarshipId));

    return result[0] || null;
  }

  /**
   * Search scholarships by name
   */
  async searchByName(searchTerm: string, limit: number = 10) {
    return await db
      .select()
      .from(scholarships)
      .where(ilike(scholarships.name, `%${searchTerm}%`))
      .limit(limit);
  }

  /**
   * Create new scholarship
   */
  async create(scholarshipData: Partial<Scholarship>) {
    const result = await db
      .insert(scholarships)
      .values({
        name: scholarshipData.name!,
        country: scholarshipData.country!,
        type: scholarshipData.type!,
        amount: scholarshipData.amount!,
        description: scholarshipData.description!,
        requirements: scholarshipData.requirements || [],
        deadline: scholarshipData.deadline!,
        provider: scholarshipData.provider!,
        applicationUrl: scholarshipData.applicationUrl || null,
        eligiblePrograms: scholarshipData.eligiblePrograms || [],
        maxRecipients: scholarshipData.maxRecipients || null,
      })
      .returning();

    return result[0];
  }

  /**
   * Update scholarship
   */
  async update(scholarshipId: string, updates: Partial<Scholarship>) {
    // Remove read-only fields
    const { id, createdAt, updatedAt, universityId, ...updateData } =
      updates as any;

    const result = await db
      .update(scholarships)
      .set(updateData)
      .where(eq(scholarships.id, scholarshipId))
      .returning();

    return result[0];
  }

  /**
   * Delete scholarship
   */
  async delete(scholarshipId: string) {
    await db.delete(scholarships).where(eq(scholarships.id, scholarshipId));
  }

  /**
   * Get user's favorite scholarships
   */
  async findFavoritesByUserId(userId: number) {
    return await db
      .select({
        id: userScholarshipFavorites.id,
        scholarshipId: userScholarshipFavorites.scholarshipId,
        scholarship: scholarships,
        createdAt: userScholarshipFavorites.createdAt,
      })
      .from(userScholarshipFavorites)
      .innerJoin(
        scholarships,
        eq(userScholarshipFavorites.scholarshipId, scholarships.id)
      )
      .where(eq(userScholarshipFavorites.userId, userId))
      .orderBy(desc(userScholarshipFavorites.createdAt));
  }

  /**
   * Add scholarship to favorites
   */
  async addToFavorites(userId: number, scholarshipId: string) {
    const result = await db
      .insert(userScholarshipFavorites)
      .values({
        userId,
        scholarshipId,
      })
      .returning();

    return result[0];
  }

  /**
   * Remove scholarship from favorites
   */
  async removeFromFavorites(userId: number, scholarshipId: string) {
    await db
      .delete(userScholarshipFavorites)
      .where(
        and(
          eq(userScholarshipFavorites.userId, userId),
          eq(userScholarshipFavorites.scholarshipId, scholarshipId)
        )
      );
  }

  /**
   * Check if scholarship is favorited by user
   */
  async isFavorited(userId: number, scholarshipId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userScholarshipFavorites)
      .where(
        and(
          eq(userScholarshipFavorites.userId, userId),
          eq(userScholarshipFavorites.scholarshipId, scholarshipId)
        )
      );

    return result.length > 0;
  }
}

export const scholarshipRepository = new ScholarshipRepository();
