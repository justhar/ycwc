/**
 * Task Group Repository
 * Handles all database operations related to task groups
 */

import { db } from "../db/db.js";
import { taskGroups } from "../db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import type { TaskGroup } from "../types/index.js";

export class TaskGroupRepository {
  /**
   * Find all task groups for a user
   */
  async findByUserId(userId: number) {
    return await db
      .select()
      .from(taskGroups)
      .where(eq(taskGroups.userId, userId))
      .orderBy(taskGroups.createdAt);
  }

  /**
   * Find task group by ID
   */
  async findById(groupId: string, userId: number) {
    const result = await db
      .select()
      .from(taskGroups)
      .where(and(eq(taskGroups.id, groupId), eq(taskGroups.userId, userId)));

    return result[0] || null;
  }

  /**
   * Create new task group
   */
  async create(userId: number, groupData: {
    name: string;
    color?: string;
    description?: string;
  }) {
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
  async update(groupId: string, userId: number, updates: Partial<TaskGroup>) {
    // Remove read-only fields
    const { id, userId: _, createdAt, updatedAt, taskCount, displayOrder, ...updateData } = updates as any;
    
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
  async delete(groupId: string, userId: number) {
    await db
      .delete(taskGroups)
      .where(and(eq(taskGroups.id, groupId), eq(taskGroups.userId, userId)));
  }
}

export const taskGroupRepository = new TaskGroupRepository();
