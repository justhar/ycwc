import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { scholarshipController } from "../controllers/index.js";

const app = new Hono();

// Public routes
app.get("/", (c) => scholarshipController.getScholarships(c));
app.get("/:id", (c) => scholarshipController.getScholarship(c));

// Protected routes  
app.post("/:id/favorite", authMiddleware, (c) => scholarshipController.addToFavorites(c));
app.delete("/:id/favorite", authMiddleware, (c) => scholarshipController.removeFromFavorites(c));

export default app;
