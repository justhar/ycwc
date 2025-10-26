import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/db.js";
import { taskGroups, tasks } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";

const app = new Hono();

// GET /task-groups - Get all task groups for authenticated user
app.get("/", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    const userGroups = await db
      .select()
      .from(taskGroups)
      .where(eq(taskGroups.userId, userId))
      .orderBy(desc(taskGroups.createdAt));

    // Get task count for each group
    const groupsWithTaskCount = await Promise.all(
      userGroups.map(async (group) => {
        const allUserTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.userId, userId));

        // Count tasks that include this group in their groupIds array
        const taskCount = allUserTasks.filter(
          (task) =>
            task.groupIds &&
            Array.isArray(task.groupIds) &&
            task.groupIds.includes(group.id)
        ).length;

        return {
          ...group,
          taskCount,
        };
      })
    );

    return c.json(groupsWithTaskCount);
  } catch (error) {
    console.error("Error fetching task groups:", error);
    return c.json({ error: "Failed to fetch task groups" }, 500);
  }
});

// POST /task-groups - Create a new task group
app.post("/", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const groupData = await c.req.json();

    const { name, description, color = "#3b82f6" } = groupData;

    if (!name?.trim()) {
      return c.json({ error: "Group name is required" }, 400);
    }

    const newGroup = await db
      .insert(taskGroups)
      .values({
        userId,
        name: name.trim(),
        description: description?.trim() || null,
        color,
      })
      .returning();

    return c.json(newGroup[0], 201);
  } catch (error) {
    console.error("Error creating task group:", error);
    return c.json({ error: "Failed to create task group" }, 500);
  }
});

// GET /task-groups/:id - Get a specific task group with tasks
app.get("/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const groupId = c.req.param("id");

    // Get group
    const group = await db
      .select()
      .from(taskGroups)
      .where(and(eq(taskGroups.id, groupId), eq(taskGroups.userId, userId)))
      .limit(1);

    if (group.length === 0) {
      return c.json({ error: "Task group not found" }, 404);
    }

    // Get tasks in this group
    const allUserTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));

    // Filter tasks that include this group in their groupIds array
    const groupTasks = allUserTasks.filter(
      (task) =>
        task.groupIds &&
        Array.isArray(task.groupIds) &&
        task.groupIds.includes(groupId)
    );

    return c.json({
      ...group[0],
      tasks: groupTasks,
    });
  } catch (error) {
    console.error("Error fetching task group:", error);
    return c.json({ error: "Failed to fetch task group" }, 500);
  }
});

// PUT /task-groups/:id - Update a task group
app.put("/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const groupId = c.req.param("id");
    const updates = await c.req.json();

    // Verify group ownership
    const existingGroup = await db
      .select()
      .from(taskGroups)
      .where(and(eq(taskGroups.id, groupId), eq(taskGroups.userId, userId)))
      .limit(1);

    if (existingGroup.length === 0) {
      return c.json({ error: "Task group not found" }, 404);
    }

    const updatedGroup = await db
      .update(taskGroups)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(taskGroups.id, groupId))
      .returning();

    return c.json(updatedGroup[0]);
  } catch (error) {
    console.error("Error updating task group:", error);
    return c.json({ error: "Failed to update task group" }, 500);
  }
});

// DELETE /task-groups/:id - Delete a task group
app.delete("/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const groupId = c.req.param("id");

    // Verify group ownership
    const existingGroup = await db
      .select()
      .from(taskGroups)
      .where(and(eq(taskGroups.id, groupId), eq(taskGroups.userId, userId)))
      .limit(1);

    if (existingGroup.length === 0) {
      return c.json({ error: "Task group not found" }, 404);
    }

    // Update tasks to remove group reference from groupIds array
    const allUserTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    // Update tasks that contain this group ID in their groupIds array
    for (const task of allUserTasks) {
      if (
        task.groupIds &&
        Array.isArray(task.groupIds) &&
        task.groupIds.includes(groupId)
      ) {
        const updatedGroupIds = task.groupIds.filter((id) => id !== groupId);
        await db
          .update(tasks)
          .set({ groupIds: updatedGroupIds })
          .where(eq(tasks.id, task.id));
      }
    }

    // Delete group
    await db.delete(taskGroups).where(eq(taskGroups.id, groupId));

    return c.json({ message: "Task group deleted successfully" });
  } catch (error) {
    console.error("Error deleting task group:", error);
    return c.json({ error: "Failed to delete task group" }, 500);
  }
});

export default app;
