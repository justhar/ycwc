/**
 * Task Repository
 * Handles all database operations related to tasks and subtasks tables
 */

import { db } from "../db/db.js";
import { tasks, subtasks } from "../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import type { Task, Subtask, TaskPriority, TaskStatus } from "../types/index.js";

export class TaskRepository {
  /**
   * Find all tasks for a user
   */
  async findByUserId(userId: number) {
    const userTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        priority: tasks.priority,
        groupIds: tasks.groupIds,
        dueDate: tasks.dueDate,
        status: tasks.status,
        notes: tasks.notes,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));

    return userTasks;
  }

  /**
   * Find task by ID
   */
  async findById(taskId: string, userId: number) {
    const result = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    return result[0] || null;
  }

  /**
   * Create new task
   */
  async create(userId: number, taskData: {
    title: string;
    priority: TaskPriority;
    groupIds?: string[];
    dueDate?: string | null;
    notes?: string | null;
  }) {
    const result = await db
      .insert(tasks)
      .values({
        userId,
        title: taskData.title.trim(),
        priority: taskData.priority,
        groupIds: taskData.groupIds || [],
        dueDate: taskData.dueDate || null,
        notes: taskData.notes?.trim() || null,
        status: "todo",
      })
      .returning();

    return result[0];
  }

  /**
   * Update task
   */
  async update(taskId: string, userId: number, updates: Partial<Task>) {
    // Remove read-only fields
    const { id, userId: _, createdAt, updatedAt, subtasks, ...updateData } = updates as any;
    
    const result = await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return result[0];
  }

  /**
   * Delete task
   */
  async delete(taskId: string, userId: number) {
    await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
  }

  /**
   * Find subtasks by task ID
   */
  async findSubtasksByTaskId(taskId: string) {
    return await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, taskId))
      .orderBy(desc(subtasks.createdAt));
  }

  /**
   * Create subtask
   */
  async createSubtask(taskId: string, subtaskData: {
    title: string;
    description?: string;
    priority?: string;
  }) {
    const result = await db
      .insert(subtasks)
      .values({
        taskId,
        title: subtaskData.title.trim(),
        description: subtaskData.description?.trim() || null,
        priority: (subtaskData.priority || "medium") as any,
        completed: false as any,
      })
      .returning();

    return result[0];
  }

  /**
   * Update subtask
   */
  async updateSubtask(subtaskId: string, updates: Partial<Subtask>) {
    // Remove read-only fields
    const { id, taskId, createdAt, ...updateData } = updates as any;
    
    const result = await db
      .update(subtasks)
      .set(updateData)
      .where(eq(subtasks.id, subtaskId))
      .returning();

    return result[0];
  }

  /**
   * Delete subtask
   */
  async deleteSubtask(subtaskId: string) {
    await db.delete(subtasks).where(eq(subtasks.id, subtaskId));
  }

  /**
   * Get tasks with subtasks
   */
  async findWithSubtasks(userId: number) {
    const userTasks = await this.findByUserId(userId);

    const tasksWithSubtasks = await Promise.all(
      userTasks.map(async (task) => {
        const taskSubtasks = await this.findSubtasksByTaskId(task.id);
        return {
          ...task,
          subtasks: taskSubtasks,
        };
      })
    );

    return tasksWithSubtasks;
  }
}

export const taskRepository = new TaskRepository();
