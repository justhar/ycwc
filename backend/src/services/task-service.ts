/**
 * Task Service
 * Handles business logic for task and subtask management
 */

import { taskRepository } from "../repositories/index.js";
import type { Task, Subtask } from "../types/index.js";

class TaskService {
  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: number) {
    return await taskRepository.findByUserId(userId);
  }

  /**
   * Get tasks with subtasks
   */
  async getUserTasksWithSubtasks(userId: number) {
    return await taskRepository.findWithSubtasks(userId);
  }

  /**
   * Get single task by ID
   */
  async getTaskById(taskId: string, userId: number) {
    const task = await taskRepository.findById(taskId, userId);
    
    if (!task) {
      throw new Error("Task not found");
    }

    return task;
  }

  /**
   * Create new task
   */
  async createTask(userId: number, taskData: {
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    deadline?: string;
    groupIds?: string[];
  }) {
    // Validate required fields
    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new Error("Task title is required");
    }

    if (taskData.title.length > 200) {
      throw new Error("Task title is too long (max 200 characters)");
    }

    // Validate deadline if provided
    if (taskData.deadline) {
      const deadlineDate = new Date(taskData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error("Invalid deadline date");
      }
    }

    return await taskRepository.create(userId, {
      title: taskData.title,
      priority: (taskData.priority || "NEED") as any,
      groupIds: taskData.groupIds,
      dueDate: taskData.deadline || null,
      notes: taskData.description || null,
    });
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, userId: number, updates: Partial<Task>) {
    // Verify task exists and user owns it
    await this.getTaskById(taskId, userId);

    // Validate updates
    if (updates.title !== undefined) {
      if (updates.title.trim().length === 0) {
        throw new Error("Task title cannot be empty");
      }
      if (updates.title.length > 200) {
        throw new Error("Task title is too long (max 200 characters)");
      }
    }

    if (updates.deadline) {
      const deadlineDate = new Date(updates.deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error("Invalid deadline date");
      }
    }

    return await taskRepository.update(taskId, userId, updates);
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string, userId: number) {
    // Verify task exists and user owns it
    await this.getTaskById(taskId, userId);

    await taskRepository.delete(taskId, userId);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, userId: number, status: "todo" | "in_progress" | "completed") {
    // Verify task exists and user owns it
    await this.getTaskById(taskId, userId);

    return await taskRepository.update(taskId, userId, { status: status as any });
  }

  /**
   * Get subtasks for a task
   */
  async getSubtasks(taskId: string, userId: number) {
    // Verify task exists and user owns it
    await this.getTaskById(taskId, userId);

    return await taskRepository.findSubtasksByTaskId(taskId);
  }

  /**
   * Create subtask
   */
  async createSubtask(taskId: string, userId: number, subtaskData: {
    title: string;
    description?: string;
    priority?: string;
  }) {
    // Verify task exists and user owns it
    await this.getTaskById(taskId, userId);

    // Validate required fields
    if (!subtaskData.title || subtaskData.title.trim().length === 0) {
      throw new Error("Subtask title is required");
    }

    if (subtaskData.title.length > 200) {
      throw new Error("Subtask title is too long (max 200 characters)");
    }

    return await taskRepository.createSubtask(taskId, subtaskData);
  }

  /**
   * Update subtask
   */
  async updateSubtask(subtaskId: string, taskId: string, userId: number, updates: Partial<Subtask>) {
    // Verify task exists and user owns it
    await this.getTaskById(taskId, userId);

    // Validate updates
    if (updates.title !== undefined) {
      if (updates.title.trim().length === 0) {
        throw new Error("Subtask title cannot be empty");
      }
      if (updates.title.length > 200) {
        throw new Error("Subtask title is too long (max 200 characters)");
      }
    }

    return await taskRepository.updateSubtask(subtaskId, updates);
  }

  /**
   * Delete subtask
   */
  async deleteSubtask(subtaskId: string, taskId: string, userId: number) {
    // Verify task exists and user owns it
    await this.getTaskById(taskId, userId);

    await taskRepository.deleteSubtask(subtaskId);
  }

  /**
   * Toggle subtask completion
   */
  async toggleSubtaskComplete(subtaskId: string, taskId: string, userId: number) {
    // Verify task exists and user owns it
    await this.getTaskById(taskId, userId);

    const taskSubtasks = await taskRepository.findSubtasksByTaskId(taskId);
    const subtask = taskSubtasks.find(s => s.id === subtaskId);
    
    if (!subtask) {
      throw new Error("Subtask not found");
    }

    return await taskRepository.updateSubtask(subtaskId, {
      completed: !subtask.completed,
    });
  }
}

export const taskService = new TaskService();
