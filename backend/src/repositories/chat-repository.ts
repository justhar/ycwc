/**
 * Chat Repository
 * Handles all database operations related to chats and messages
 */

import { db } from "../db/db.js";
import { chats, messages } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import type { Chat, ChatMessage, MessageRole } from "../types/index.js";

export class ChatRepository {
  /**
   * Find all chats for a user (limited to recent chats)
   */
  async findByUserId(userId: number, limit: number = 5) {
    return await db
      .select({
        id: chats.id,
        title: chats.title,
        createdAt: chats.createdAt,
        updatedAt: chats.updatedAt,
      })
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.updatedAt))
      .limit(limit);
  }

  /**
   * Find chat by ID
   */
  async findById(chatId: string, userId: number) {
    const result = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));

    return result[0] || null;
  }

  /**
   * Create new chat
   */
  async create(userId: number, title?: string) {
    const result = await db
      .insert(chats)
      .values({
        userId,
        title: title || null,
      })
      .returning({
        id: chats.id,
        title: chats.title,
        createdAt: chats.createdAt,
        updatedAt: chats.updatedAt,
      });

    return result[0];
  }

  /**
   * Update chat
   */
  async update(chatId: string, userId: number, updates: Partial<Chat>) {
    // Remove read-only fields
    const { id, userId: _, createdAt, updatedAt, messages, ...updateData } = updates as any;
    
    const result = await db
      .update(chats)
      .set(updateData)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .returning();

    return result[0];
  }

  /**
   * Delete chat
   */
  async delete(chatId: string, userId: number) {
    await db
      .delete(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));
  }

  /**
   * Find all messages for a chat
   */
  async findMessagesByChatId(chatId: string) {
    return await db
      .select({
        id: messages.id,
        chatId: messages.chatId,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);
  }

  /**
   * Create new message
   */
  async createMessage(chatId: string, role: MessageRole, content: string) {
    const result = await db
      .insert(messages)
      .values({
        chatId,
        role,
        content,
      })
      .returning({
        id: messages.id,
        chatId: messages.chatId,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      });

    return result[0];
  }

  /**
   * Get recent messages for chat context (for AI)
   */
  async getRecentMessages(chatId: string, limit: number = 10) {
    return await db
      .select({
        role: messages.role,
        content: messages.content,
      })
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  /**
   * Update chat title from first message
   */
  async updateTitleFromMessage(chatId: string, userId: number, messageContent: string) {
    // Generate title from first 50 characters of message
    const title = messageContent.length > 50 
      ? messageContent.substring(0, 50) + "..."
      : messageContent;

    await this.update(chatId, userId, { title });
  }
}

export const chatRepository = new ChatRepository();
