import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  tasks,
  subtasks,
  taskGroups,
  users,
  profiles,
  userFavorites,
  userScholarshipFavorites,
  universities,
  scholarships,
} from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";

const app = new Hono();

// GET /tasks - Get all tasks for authenticated user
app.get("/", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    // Get tasks with their subtasks
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

    // Get subtasks for each task
    const tasksWithSubtasks = await Promise.all(
      userTasks.map(async (task) => {
        const taskSubtasks = await db
          .select()
          .from(subtasks)
          .where(eq(subtasks.taskId, task.id))
          .orderBy(desc(subtasks.createdAt));

        return {
          ...task,
          subtasks: taskSubtasks,
        };
      })
    );

    return c.json(tasksWithSubtasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return c.json({ error: "Failed to fetch tasks" }, 500);
  }
});

// POST /tasks - Create a new task
app.post("/", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const taskData = await c.req.json();

    const {
      title,
      priority = "MUST",
      groupIds = [],
      dueDate,
      notes,
    } = taskData;

    if (!title?.trim()) {
      return c.json({ error: "Task title is required" }, 400);
    }

    const newTask = await db
      .insert(tasks)
      .values({
        userId,
        title: title.trim(),
        priority,
        groupIds: groupIds || [],
        dueDate: dueDate || null,
        notes: notes?.trim() || null,
        status: "todo",
      })
      .returning();

    return c.json(newTask[0], 201);
  } catch (error) {
    console.error("Error creating task:", error);
    return c.json({ error: "Failed to create task" }, 500);
  }
});

// GET /tasks/:id - Get a specific task with subtasks
app.get("/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const taskId = c.req.param("id");

    // Get task
    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (task.length === 0) {
      return c.json({ error: "Task not found" }, 404);
    }

    // Get subtasks
    const taskSubtasks = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, taskId))
      .orderBy(desc(subtasks.createdAt));

    return c.json({
      ...task[0],
      subtasks: taskSubtasks,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return c.json({ error: "Failed to fetch task" }, 500);
  }
});

// PUT /tasks/:id - Update a task
app.put("/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const taskId = c.req.param("id");
    const updates = await c.req.json();

    // Verify task ownership
    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (existingTask.length === 0) {
      return c.json({ error: "Task not found" }, 404);
    }

    const updatedTask = await db
      .update(tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return c.json(updatedTask[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    return c.json({ error: "Failed to update task" }, 500);
  }
});

// DELETE /tasks/:id - Delete a task
app.delete("/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const taskId = c.req.param("id");

    // Verify task ownership
    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (existingTask.length === 0) {
      return c.json({ error: "Task not found" }, 404);
    }

    // Delete task (subtasks will be cascade deleted)
    await db.delete(tasks).where(eq(tasks.id, taskId));

    return c.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return c.json({ error: "Failed to delete task" }, 500);
  }
});

// POST /tasks/:id/subtasks - Add a subtask
app.post("/:id/subtasks", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const taskId = c.req.param("id");
    const subtaskData = await c.req.json();

    // Verify task ownership
    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (task.length === 0) {
      return c.json({ error: "Task not found" }, 404);
    }

    const { title, description, priority = "medium" } = subtaskData;

    if (!title?.trim()) {
      return c.json({ error: "Subtask title is required" }, 400);
    }

    const newSubtask = await db
      .insert(subtasks)
      .values({
        taskId,
        title: title.trim(),
        description: description?.trim() || null,
        priority,
        completed: false,
      })
      .returning();

    return c.json(newSubtask[0], 201);
  } catch (error) {
    console.error("Error creating subtask:", error);
    return c.json({ error: "Failed to create subtask" }, 500);
  }
});

// PUT /tasks/:id/subtasks/:subtaskId - Update a subtask
app.put("/:id/subtasks/:subtaskId", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const taskId = c.req.param("id");
    const subtaskId = c.req.param("subtaskId");
    const updates = await c.req.json();

    // Verify task ownership
    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (task.length === 0) {
      return c.json({ error: "Task not found" }, 404);
    }

    // Verify subtask exists
    const existingSubtask = await db
      .select()
      .from(subtasks)
      .where(and(eq(subtasks.id, subtaskId), eq(subtasks.taskId, taskId)))
      .limit(1);

    if (existingSubtask.length === 0) {
      return c.json({ error: "Subtask not found" }, 404);
    }

    const updatedSubtask = await db
      .update(subtasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(subtasks.id, subtaskId))
      .returning();

    return c.json(updatedSubtask[0]);
  } catch (error) {
    console.error("Error updating subtask:", error);
    return c.json({ error: "Failed to update subtask" }, 500);
  }
});

// DELETE /tasks/:id/subtasks/:subtaskId - Delete a subtask
app.delete("/:id/subtasks/:subtaskId", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const taskId = c.req.param("id");
    const subtaskId = c.req.param("subtaskId");

    // Verify task ownership
    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (task.length === 0) {
      return c.json({ error: "Task not found" }, 404);
    }

    // Delete subtask
    const result = await db
      .delete(subtasks)
      .where(and(eq(subtasks.id, subtaskId), eq(subtasks.taskId, taskId)))
      .returning();

    if (result.length === 0) {
      return c.json({ error: "Subtask not found" }, 404);
    }

    return c.json({ message: "Subtask deleted successfully" });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return c.json({ error: "Failed to delete subtask" }, 500);
  }
});

export default app;
