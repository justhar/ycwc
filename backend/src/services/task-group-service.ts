/**
 * Task Group Service
 * Handles business logic for task group management
 */

import { taskGroupRepository } from "../repositories/index.js";
import type { TaskGroup } from "../types/index.js";

class TaskGroupService {
  /**
   * Get all task groups for a user
   */
  async getUserGroups(userId: number) {
    return await taskGroupRepository.findByUserId(userId);
  }

  /**
   * Get single task group by ID
   */
  async getGroupById(groupId: string, userId: number) {
    const group = await taskGroupRepository.findById(groupId, userId);

    if (!group) {
      throw new Error("Task group not found");
    }

    return group;
  }

  /**
   * Create new task group
   */
  async createGroup(
    userId: number,
    groupData: {
      name: string;
      color?: string;
      description?: string;
    }
  ) {
    // Validate required fields
    if (!groupData.name || groupData.name.trim().length === 0) {
      throw new Error("Group name is required");
    }

    if (groupData.name.length > 100) {
      throw new Error("Group name is too long (max 100 characters)");
    }

    // Validate color format if provided
    if (groupData.color && !this.isValidColor(groupData.color)) {
      throw new Error(
        "Invalid color format (use Tailwind classes like 'bg-blue-500')"
      );
    }

    return await taskGroupRepository.create(userId, groupData);
  }

  /**
   * Update task group
   */
  async updateGroup(
    groupId: string,
    userId: number,
    updates: Partial<TaskGroup>
  ) {
    // Verify group exists and user owns it
    await this.getGroupById(groupId, userId);

    // Validate updates
    if (updates.name !== undefined) {
      if (updates.name.trim().length === 0) {
        throw new Error("Group name cannot be empty");
      }
      if (updates.name.length > 100) {
        throw new Error("Group name is too long (max 100 characters)");
      }
    }

    if (updates.color && !this.isValidColor(updates.color)) {
      throw new Error(
        "Invalid color format (use Tailwind classes like 'bg-blue-500')"
      );
    }

    return await taskGroupRepository.update(groupId, userId, updates);
  }

  /**
   * Delete task group
   */
  async deleteGroup(groupId: string, userId: number) {
    // Verify group exists and user owns it
    await this.getGroupById(groupId, userId);

    await taskGroupRepository.delete(groupId, userId);
  }

  /**
   * Validate color format (Tailwind CSS classes)
   */
  private isValidColor(color: string): boolean {
    // Accept Tailwind color classes (bg-color-shade) or hex colors
    const tailwindPattern =
      /^bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/;
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    return tailwindPattern.test(color) || hexPattern.test(color);
  }
}

export const taskGroupService = new TaskGroupService();
