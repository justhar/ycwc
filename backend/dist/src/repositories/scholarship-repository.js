/**
 * Scholarship Repository
 * Handles all database operations related to scholarships and favorites
 */
import { db } from "../db/db.js";
import { scholarships, userScholarshipFavorites } from "../db/schema.js";
import { eq, and, desc, ilike } from "drizzle-orm";
export class ScholarshipRepository {
    /**
     * Find all scholarships with optional filters and pagination
     */
    async findAll(params) {
        let query = db.select().from(scholarships);
        let countQuery = db.select().from(scholarships);
        // Apply filters if provided
        if (params?.type) {
            query = query.where(eq(scholarships.type, params.type));
            countQuery = countQuery.where(eq(scholarships.type, params.type));
        }
        if (params?.country) {
            query = query.where(eq(scholarships.country, params.country));
            countQuery = countQuery.where(eq(scholarships.country, params.country));
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
    async findById(scholarshipId) {
        const result = await db
            .select()
            .from(scholarships)
            .where(eq(scholarships.id, scholarshipId));
        return result[0] || null;
    }
    /**
     * Search scholarships by name
     */
    async searchByName(searchTerm, limit = 10) {
        return await db
            .select()
            .from(scholarships)
            .where(ilike(scholarships.name, `%${searchTerm}%`))
            .limit(limit);
    }
    /**
     * Create new scholarship
     */
    async create(scholarshipData) {
        const result = await db
            .insert(scholarships)
            .values({
            name: scholarshipData.name,
            country: scholarshipData.country,
            type: scholarshipData.type,
            amount: scholarshipData.amount,
            description: scholarshipData.description,
            requirements: scholarshipData.requirements || [],
            deadline: scholarshipData.deadline,
            provider: scholarshipData.provider,
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
    async update(scholarshipId, updates) {
        // Remove read-only fields
        const { id, createdAt, updatedAt, universityId, ...updateData } = updates;
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
    async delete(scholarshipId) {
        await db.delete(scholarships).where(eq(scholarships.id, scholarshipId));
    }
    /**
     * Get user's favorite scholarships
     */
    async findFavoritesByUserId(userId) {
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
     * Add scholarship to favorites
     */
    async addToFavorites(userId, scholarshipId) {
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
    async removeFromFavorites(userId, scholarshipId) {
        await db
            .delete(userScholarshipFavorites)
            .where(and(eq(userScholarshipFavorites.userId, userId), eq(userScholarshipFavorites.scholarshipId, scholarshipId)));
    }
    /**
     * Check if scholarship is favorited by user
     */
    async isFavorited(userId, scholarshipId) {
        const result = await db
            .select()
            .from(userScholarshipFavorites)
            .where(and(eq(userScholarshipFavorites.userId, userId), eq(userScholarshipFavorites.scholarshipId, scholarshipId)));
        return result.length > 0;
    }
}
export const scholarshipRepository = new ScholarshipRepository();
