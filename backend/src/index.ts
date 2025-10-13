import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

const app = new Hono();

// Enable CORS for frontend communication
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
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

// Start the server
const port = process.env.PORT || 3001;

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
