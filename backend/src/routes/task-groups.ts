import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { taskGroupController } from "../controllers/index.js";

const app = new Hono();

// All routes require authentication
app.use("*", authMiddleware);

// Task group routes
app.get("/", (c) => taskGroupController.getTaskGroups(c));
app.get("/:id", (c) => taskGroupController.getTaskGroup(c));
app.post("/", (c) => taskGroupController.createTaskGroup(c));
app.put("/:id", (c) => taskGroupController.updateTaskGroup(c));
app.delete("/:id", (c) => taskGroupController.deleteTaskGroup(c));

export default app;
