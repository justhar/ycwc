import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { universityController } from "../controllers/index.js";

const app = new Hono();

// Public routes
app.get("/", (c) => universityController.getUniversities(c));
app.get("/:id", (c) => universityController.getUniversity(c));
app.get("/:id/scholarships", (c) => universityController.getUniversityScholarships(c));

// Protected routes
app.post("/:id/favorite", authMiddleware, (c) => universityController.addToFavorites(c));
app.delete("/:id/favorite", authMiddleware, (c) => universityController.removeFromFavorites(c));

export default app;
