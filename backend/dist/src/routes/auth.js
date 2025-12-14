import { Hono } from "hono";
import { authController } from "../controllers/index.js";
const auth = new Hono();
// User Registration
auth.post("/register", (c) => authController.register(c));
// User Login
auth.post("/login", (c) => authController.login(c));
// User Logout (client-side token removal, but kept for API consistency)
auth.post("/logout", (c) => authController.logout(c));
export default auth;
