import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { chatController } from "../controllers/index.js";

const chat = new Hono();

// All routes require authentication
chat.use("*", authMiddleware);

// Chat routes
chat.get("/", (c) => chatController.getChats(c));
chat.get("/:id", (c) => chatController.getChat(c));
chat.post("/", (c) => chatController.createChat(c));
chat.put("/:id", (c) => chatController.updateChat(c));
chat.delete("/:id", (c) => chatController.deleteChat(c));

// Message routes
chat.get("/:id/messages", (c) => chatController.getMessages(c));
chat.post("/:id/messages", (c) => chatController.addMessage(c));

export default chat;
