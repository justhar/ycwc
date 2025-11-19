/**
 * Chat Controller
 * Handles HTTP requests for chat and message endpoints
 */

import type { Context } from "hono";
import { chatService } from "../services/index.js";

export class ChatController {
  /**
   * GET /api/chat
   * Get all chats for user
   */
  async getChats(c: Context) {
    try {
      const userId = c.get("userId");

      const chats = await chatService.getUserChats(userId);

      return c.json({ chats });
    } catch (error: any) {
      return c.json(
        {
          error: error.message,
        },
        500
      );
    }
  }

  /**
   * GET /api/chat/:id
   * Get single chat with messages
   */
  async getChat(c: Context) {
    try {
      const userId = c.get("userId");
      const chatId = c.req.param("id");

      const chat = await chatService.getChatById(chatId, userId);

      return c.json({ chat });
    } catch (error: any) {
      const status = error.message.includes("not found") ? 404 : 403;
      return c.json(
        {
          error: error.message,
        },
        status
      );
    }
  }

  /**
   * POST /api/chat
   * Create new chat
   */
  async createChat(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();

      const chat = await chatService.createChat(userId, body?.title);

      return c.json(
        {
          chat,
        },
        201
      );
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : "Failed to create chat",
        },
        400
      );
    }
  }

  /**
   * PUT /api/chat/:id
   * Update chat (e.g., rename)
   */
  async updateChat(c: Context) {
    try {
      const userId = c.get("userId");
      const chatId = c.req.param("id");
      const body = await c.req.json();

      const chat = await chatService.updateChat(chatId, userId, body);

      return c.json({ chat });
    } catch (error: any) {
      const status = error.message.includes("Unauthorized") ? 403 : 400;
      return c.json(
        {
          error: error.message || "Failed to update chat",
        },
        status
      );
    }
  }

  /**
   * DELETE /api/chat/:id
   * Delete chat
   */
  async deleteChat(c: Context) {
    try {
      const userId = c.get("userId");
      const chatId = c.req.param("id");

      await chatService.deleteChat(chatId, userId);

      return c.json({
        success: true,
      });
    } catch (error: any) {
      const status = error.message.includes("Unauthorized") ? 403 : 500;
      return c.json(
        {
          error: error.message || "Failed to delete chat",
        },
        status
      );
    }
  }

  /**
   * GET /api/chat/:id/messages
   * Get messages for a chat
   */
  async getMessages(c: Context) {
    try {
      const userId = c.get("userId");
      const chatId = c.req.param("id");

      const messages = await chatService.getChatMessages(chatId, userId);

      return c.json({ messages });
    } catch (error: any) {
      return c.json(
        {
          error: error.message,
        },
        403
      );
    }
  }

  /**
   * POST /api/chat/:id/messages
   * Add message to chat
   */
  async addMessage(c: Context) {
    try {
      const userId = c.get("userId");
      const chatId = c.req.param("id");
      const body = await c.req.json();

      const result = await chatService.addMessage(chatId, userId, body);

      return c.json(result, 201);
    } catch (error: any) {
      return c.json(
        {
          error: error.message || "Failed to add message",
        },
        400
      );
    }
  }
}

export const chatController = new ChatController();
