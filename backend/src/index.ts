import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import aiRoutes from "./routes/ai.js";
import universitiesRoutes from "./routes/universities.js";
import scholarshipsRoutes from "./routes/scholarships.js";
import tasksRoutes from "./routes/tasks.js";
import taskGroupsRoutes from "./routes/task-groups.js";
import taskRecommendationsRoutes from "./routes/task-recommendations.js";
import chatRoutes from "./routes/chat.js";

const app = new Hono();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Enable CORS for frontend communication
app.use(
  "*",
  cors({
    origin: FRONTEND_URL,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

const welcomeStrings = [
  "Hello Hono!",
  "Authentication API is ready!",
  "Available endpoints:",
  "- POST /auth/register",
  "- POST /auth/login",
  "- POST /auth/logout",
  "- GET /user/profile (protected)",
];

app.get("/", (c) => {
  return c.json({ message: welcomeStrings.join("\n") });
});

// Mount authentication routes
app.route("/auth", authRoutes);
app.route("/user", userRoutes);
app.route("/ai", aiRoutes);
app.route("/universities", universitiesRoutes);
app.route("/scholarships", scholarshipsRoutes);
app.route("/tasks", tasksRoutes);
app.route("/task-groups", taskGroupsRoutes);
app.route("/task-recommendations", taskRecommendationsRoutes);
app.route("/chat", chatRoutes);

// Start the server
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info: any) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

export default app;
