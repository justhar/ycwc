import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { taskController } from "../controllers/index.js";

const app = new Hono();

// All routes require authentication
app.use("*", authMiddleware);

// Task routes
app.get("/", (c) => taskController.getTasks(c));
app.get("/:id", (c) => taskController.getTask(c));
app.post("/", (c) => taskController.createTask(c));
app.put("/:id", (c) => taskController.updateTask(c));
app.delete("/:id", (c) => taskController.deleteTask(c));
app.patch("/:id/status", (c) => taskController.updateTaskStatus(c));

// Subtask routes
app.get("/:id/subtasks", (c) => taskController.getSubtasks(c));
app.post("/:id/subtasks", (c) => taskController.createSubtask(c));
app.put("/:taskId/subtasks/:subtaskId", (c) => taskController.updateSubtask(c));
app.delete("/:taskId/subtasks/:subtaskId", (c) => taskController.deleteSubtask(c));
app.patch("/:taskId/subtasks/:subtaskId/toggle", (c) => taskController.toggleSubtask(c));

export default app;
