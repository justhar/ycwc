/**
 * Task Group Controller
 * Handles HTTP requests for task group endpoints
 */
import { taskGroupService } from "../services/index.js";
export class TaskGroupController {
    /**
     * GET /api/task-groups
     * Get all task groups for user
     */
    async getTaskGroups(c) {
        try {
            const userId = c.get("userId");
            const groups = await taskGroupService.getUserGroups(userId);
            return c.json(groups);
        }
        catch (error) {
            return c.json({
                error: error.message,
            }, 500);
        }
    }
    /**
     * GET /api/task-groups/:id
     * Get single task group by ID
     */
    async getTaskGroup(c) {
        try {
            const userId = c.get("userId");
            const groupId = c.req.param("id");
            const group = await taskGroupService.getGroupById(groupId, userId);
            return c.json({ group });
        }
        catch (error) {
            const status = error.message.includes("not found") ? 404 : 500;
            return c.json({
                error: error.message,
            }, status);
        }
    }
    /**
     * POST /api/task-groups
     * Create new task group
     */
    async createTaskGroup(c) {
        try {
            const userId = c.get("userId");
            const body = await c.req.json();
            const group = await taskGroupService.createGroup(userId, body);
            return c.json(group, 201);
        }
        catch (error) {
            return c.json({
                error: error.message || "Failed to create task group",
            }, 400);
        }
    }
    /**
     * PUT /api/task-groups/:id
     * Update task group
     */
    async updateTaskGroup(c) {
        try {
            const userId = c.get("userId");
            const groupId = c.req.param("id");
            const body = await c.req.json();
            const group = await taskGroupService.updateGroup(groupId, userId, body);
            return c.json(group);
        }
        catch (error) {
            return c.json({
                error: error.message || "Failed to update task group",
            }, 400);
        }
    }
    /**
     * DELETE /api/task-groups/:id
     * Delete task group
     */
    async deleteTaskGroup(c) {
        try {
            const userId = c.get("userId");
            const groupId = c.req.param("id");
            await taskGroupService.deleteGroup(groupId, userId);
            return c.json({
                message: "Task group deleted successfully",
            });
        }
        catch (error) {
            return c.json({
                error: error.message || "Failed to delete task group",
            }, 500);
        }
    }
}
export const taskGroupController = new TaskGroupController();
