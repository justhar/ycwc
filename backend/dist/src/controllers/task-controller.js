/**
 * Task Controller
 * Handles HTTP requests for task and subtask endpoints
 */
import { taskService } from "../services/index.js";
export class TaskController {
    /**
     * GET /api/tasks
     * Get all tasks for user
     */
    async getTasks(c) {
        try {
            const userId = c.get("userId");
            const withSubtasks = c.req.query("withSubtasks") === "true";
            const tasks = withSubtasks
                ? await taskService.getUserTasksWithSubtasks(userId)
                : await taskService.getUserTasks(userId);
            return c.json(tasks);
        }
        catch (error) {
            return c.json({
                error: error.message,
            }, 500);
        }
    }
    /**
     * GET /api/tasks/:id
     * Get single task by ID
     */
    async getTask(c) {
        try {
            const userId = c.get("userId");
            const taskId = c.req.param("id");
            const task = await taskService.getTaskById(taskId, userId);
            return c.json({ task });
        }
        catch (error) {
            const status = error.message.includes("not found") ? 404 : 500;
            return c.json({
                error: error.message,
            }, status);
        }
    }
    /**
     * POST /api/tasks
     * Create new task
     */
    async createTask(c) {
        try {
            const userId = c.get("userId");
            const body = await c.req.json();
            const task = await taskService.createTask(userId, body);
            return c.json(task, 201);
        }
        catch (error) {
            return c.json({
                error: error.message || "Failed to create task",
            }, 400);
        }
    }
    /**
     * PUT /api/tasks/:id
     * Update task
     */
    async updateTask(c) {
        try {
            const userId = c.get("userId");
            const taskId = c.req.param("id");
            const body = await c.req.json();
            const task = await taskService.updateTask(taskId, userId, body);
            return c.json(task);
        }
        catch (error) {
            const status = error.message.includes("Unauthorized") ? 403 : 400;
            return c.json({
                error: error.message || "Failed to update task",
            }, status);
        }
    }
    /**
     * DELETE /api/tasks/:id
     * Delete task
     */
    async deleteTask(c) {
        try {
            const userId = c.get("userId");
            const taskId = c.req.param("id");
            await taskService.deleteTask(taskId, userId);
            return c.json({
                message: "Task deleted successfully",
            });
        }
        catch (error) {
            const status = error.message.includes("Unauthorized") ? 403 : 500;
            return c.json({
                error: error.message || "Failed to delete task",
            }, status);
        }
    }
    /**
     * PATCH /api/tasks/:id/status
     * Update task status
     */
    async updateTaskStatus(c) {
        try {
            const userId = c.get("userId");
            const taskId = c.req.param("id");
            const body = await c.req.json();
            const task = await taskService.updateTaskStatus(taskId, userId, body.status);
            return c.json({
                message: "Task status updated successfully",
                task,
            });
        }
        catch (error) {
            return c.json({
                error: error.message,
            }, 400);
        }
    }
    /**
     * GET /api/tasks/:id/subtasks
     * Get subtasks for a task
     */
    async getSubtasks(c) {
        try {
            const userId = c.get("userId");
            const taskId = c.req.param("id");
            const subtasks = await taskService.getSubtasks(taskId, userId);
            return c.json({ subtasks });
        }
        catch (error) {
            return c.json({
                error: error.message,
            }, 500);
        }
    }
    /**
     * POST /api/tasks/:id/subtasks
     * Create subtask
     */
    async createSubtask(c) {
        try {
            const userId = c.get("userId");
            const taskId = c.req.param("id");
            const body = await c.req.json();
            const subtask = await taskService.createSubtask(taskId, userId, body);
            return c.json({
                message: "Subtask created successfully",
                subtask,
            }, 201);
        }
        catch (error) {
            return c.json({
                error: error.message,
            }, 400);
        }
    }
    /**
     * PUT /api/tasks/:taskId/subtasks/:subtaskId
     * Update subtask
     */
    async updateSubtask(c) {
        try {
            const userId = c.get("userId");
            const taskId = c.req.param("taskId");
            const subtaskId = c.req.param("subtaskId");
            const body = await c.req.json();
            const subtask = await taskService.updateSubtask(subtaskId, taskId, userId, body);
            return c.json({
                message: "Subtask updated successfully",
                subtask,
            });
        }
        catch (error) {
            return c.json({
                error: error.message,
            }, 400);
        }
    }
    /**
     * DELETE /api/tasks/:taskId/subtasks/:subtaskId
     * Delete subtask
     */
    async deleteSubtask(c) {
        try {
            const userId = c.get("userId");
            const taskId = c.req.param("taskId");
            const subtaskId = c.req.param("subtaskId");
            await taskService.deleteSubtask(subtaskId, taskId, userId);
            return c.json({
                message: "Subtask deleted successfully",
            });
        }
        catch (error) {
            return c.json({
                error: error.message,
            }, 500);
        }
    }
    /**
     * PATCH /api/tasks/:taskId/subtasks/:subtaskId/toggle
     * Toggle subtask completion
     */
    async toggleSubtask(c) {
        try {
            const userId = c.get("userId");
            const taskId = c.req.param("taskId");
            const subtaskId = c.req.param("subtaskId");
            const subtask = await taskService.toggleSubtaskComplete(subtaskId, taskId, userId);
            return c.json({ subtask });
        }
        catch (error) {
            return c.json({
                error: error.message,
            }, 400);
        }
    }
}
export const taskController = new TaskController();
