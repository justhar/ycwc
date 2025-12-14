/**
 * Task Group Repository
 * Handles all database operations related to task groups
 */
import { db } from "../db/db.js";
import { taskGroups } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
export class TaskGroupRepository {
    /**
     * Find all task groups for a user
     */
    async findByUserId(userId) {
        return await db
            .select()
            .from(taskGroups)
            .where(eq(taskGroups.userId, userId))
            .orderBy(taskGroups.createdAt);
    }
    /**
     * Find task group by ID
     */
    async findById(groupId, userId) {
        const result = await db
            .select()
            .from(taskGroups)
            .where(and(eq(taskGroups.id, groupId), eq(taskGroups.userId, userId)));
        return result[0] || null;
    }
    /**
     * Create new task group
     */
    async create(userId, groupData) {
        const result = await db
            .insert(taskGroups)
            .values({
            userId,
            name: groupData.name.trim(),
            description: groupData.description || null,
            color: groupData.color || "bg-blue-500",
        })
            .returning();
        return result[0];
    }
    /**
     * Update task group
     */
    async update(groupId, userId, updates) {
        // Remove read-only fields
        const { id, userId: _, createdAt, updatedAt, taskCount, displayOrder, ...updateData } = updates;
        const result = await db
            .update(taskGroups)
            .set(updateData)
            .where(and(eq(taskGroups.id, groupId), eq(taskGroups.userId, userId)))
            .returning();
        return result[0];
    }
    /**
     * Delete task group
     */
    async delete(groupId, userId) {
        await db
            .delete(taskGroups)
            .where(and(eq(taskGroups.id, groupId), eq(taskGroups.userId, userId)));
    }
}
export const taskGroupRepository = new TaskGroupRepository();
