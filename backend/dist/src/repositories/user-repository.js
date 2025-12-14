/**
 * User Repository
 * Handles all database operations related to users table
 */
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
export class UserRepository {
    /**
     * Find user by ID
     */
    async findById(userId) {
        const result = await db
            .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            createdAt: users.createdAt,
        })
            .from(users)
            .where(eq(users.id, userId));
        return result[0] || null;
    }
    /**
     * Find user by email
     */
    async findByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email));
        return result[0] || null;
    }
    /**
     * Create new user
     */
    async create(userData) {
        const result = await db
            .insert(users)
            .values({
            fullName: userData.fullName.trim(),
            email: userData.email,
            password: userData.password,
        })
            .returning({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
        });
        return result[0];
    }
    /**
     * Update user information
     */
    async update(userId, updates) {
        const result = await db
            .update(users)
            .set({
            fullName: updates.fullName,
            updatedAt: new Date(),
        })
            .where(eq(users.id, userId))
            .returning({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
        });
        return result[0];
    }
    /**
     * Delete user
     */
    async delete(userId) {
        await db.delete(users).where(eq(users.id, userId));
    }
}
export const userRepository = new UserRepository();
