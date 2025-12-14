/**
 * Profile Repository
 * Handles all database operations related to profiles table
 */
import { db } from "../db/db.js";
import { profiles, userFavorites, universities, userScholarshipFavorites, scholarships, users, } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
export class ProfileRepository {
    /**
     * Find profile by user ID
     */
    async findByUserId(userId) {
        const result = await db
            .select()
            .from(profiles)
            .where(eq(profiles.userId, userId));
        return result[0] || null;
    }
    /**
     * Create new profile
     */
    async create(userId, profileData) {
        const result = await db
            .insert(profiles)
            .values({
            userId,
            dateOfBirth: profileData.dateOfBirth || null,
            nationality: profileData.nationality || "Indonesia",
            targetLevel: profileData.targetLevel,
            intendedMajor: profileData.intendedMajor || null,
            intendedCountry: profileData.intendedCountry || null,
            budgetMin: profileData.budgetMin || null,
            budgetMax: profileData.budgetMax || null,
            institution: profileData.institution || null,
            graduationYear: profileData.graduationYear || null,
            academicScore: profileData.academicScore || null,
            scoreScale: profileData.scoreScale,
            englishTests: (profileData.englishTests || []),
            standardizedTests: (profileData.standardizedTests || []),
            awards: (profileData.awards || []),
            extracurriculars: (profileData.extracurriculars || []),
        })
            .returning();
        return result[0];
    }
    /**
     * Update existing profile
     */
    async update(userId, profileData) {
        const result = await db
            .update(profiles)
            .set({
            dateOfBirth: profileData.dateOfBirth || null,
            nationality: profileData.nationality || "Indonesia",
            targetLevel: profileData.targetLevel,
            intendedMajor: profileData.intendedMajor,
            intendedCountry: profileData.intendedCountry,
            budgetMin: profileData.budgetMin,
            budgetMax: profileData.budgetMax,
            institution: profileData.institution,
            graduationYear: profileData.graduationYear,
            academicScore: profileData.academicScore,
            scoreScale: profileData.scoreScale,
            englishTests: profileData.englishTests,
            standardizedTests: profileData.standardizedTests,
            awards: profileData.awards,
            extracurriculars: profileData.extracurriculars,
        })
            .where(eq(profiles.userId, userId))
            .returning();
        return result[0];
    }
    /**
     * Delete profile
     */
    async delete(userId) {
        await db.delete(profiles).where(eq(profiles.userId, userId));
    }
    /**
     * Check if profile exists
     */
    async exists(userId) {
        const result = await db
            .select({ userId: profiles.userId })
            .from(profiles)
            .where(eq(profiles.userId, userId));
        return result.length > 0;
    }
    /**
     * Get user's favorite universities with full university data
     */
    async getFavoriteUniversities(userId) {
        const result = await db
            .select({
            id: userFavorites.id,
            userId: userFavorites.userId,
            universityId: userFavorites.universityId,
            createdAt: userFavorites.createdAt,
            university: universities,
        })
            .from(userFavorites)
            .leftJoin(universities, eq(userFavorites.universityId, universities.id))
            .where(eq(userFavorites.userId, userId));
        return result;
    }
    /**
     * Get user's favorite scholarships with full scholarship data
     */
    async getFavoriteScholarships(userId) {
        const result = await db
            .select({
            id: userScholarshipFavorites.id,
            userId: userScholarshipFavorites.userId,
            scholarshipId: userScholarshipFavorites.scholarshipId,
            createdAt: userScholarshipFavorites.createdAt,
            scholarship: scholarships,
        })
            .from(userScholarshipFavorites)
            .leftJoin(scholarships, eq(userScholarshipFavorites.scholarshipId, scholarships.id))
            .where(eq(userScholarshipFavorites.userId, userId));
        return result;
    }
    /**
     * Add university to favorites
     */
    async addFavoriteUniversity(userId, universityId) {
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
     * Add scholarship to favorites
     */
    async addFavoriteScholarship(userId, scholarshipId) {
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
     * Remove university from favorites
     */
    async removeFavoriteUniversity(userId, universityId) {
        await db
            .delete(userFavorites)
            .where(and(eq(userFavorites.userId, userId), eq(userFavorites.universityId, universityId)));
    }
    /**
     * Remove scholarship from favorites
     */
    async removeFavoriteScholarship(userId, scholarshipId) {
        await db
            .delete(userScholarshipFavorites)
            .where(and(eq(userScholarshipFavorites.userId, userId), eq(userScholarshipFavorites.scholarshipId, scholarshipId)));
    }
    /**
     * Check if university is favorited by user
     */
    async checkFavoriteUniversity(userId, universityId) {
        const result = await db
            .select()
            .from(userFavorites)
            .where(and(eq(userFavorites.userId, userId), eq(userFavorites.universityId, universityId)));
        return result.length > 0;
    }
    /**
     * Check if scholarship is favorited by user
     */
    async checkFavoriteScholarship(userId, scholarshipId) {
        const result = await db
            .select()
            .from(userScholarshipFavorites)
            .where(and(eq(userScholarshipFavorites.userId, userId), eq(userScholarshipFavorites.scholarshipId, scholarshipId)));
        return result.length > 0;
    }
    /**
     * Update user basic information (fullName, email)
     */
    async updateUserInfo(userId, data) {
        const updateData = {};
        if (data.fullName) {
            updateData.fullName = data.fullName;
        }
        if (data.email) {
            updateData.email = data.email;
        }
        const result = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            createdAt: users.createdAt,
        });
        return result[0] || null;
    }
}
export const profileRepository = new ProfileRepository();
