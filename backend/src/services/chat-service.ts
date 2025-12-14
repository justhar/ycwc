/**
 * Chat Service
 * Handles business logic for chat and message management
 */

import { chatRepository } from "../repositories/index.js";
import { aiService } from "../utils/ai-service.js";
import { universityRepository } from "../repositories/index.js";
import { profileRepository } from "../repositories/index.js";
import type { Chat, ChatMessage } from "../types/index.js";

class ChatService {
  /**
   * Get all chats for a user
   */
  async getUserChats(userId: number) {
    return await chatRepository.findByUserId(userId);
  }

  /**
   * Get single chat by ID with messages
   */
  async getChatById(chatId: string, userId: number) {
    const chat = await chatRepository.findById(chatId, userId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Get messages for this chat
    const chatMessages = await chatRepository.findMessagesByChatId(chatId);

    return {
      ...chat,
      messages: chatMessages,
    };
  }

  /**
   * Create new chat
   */
  async createChat(userId: number, title?: string) {
    // Generate default title if not provided
    const chatTitle = title || `Chat ${new Date().toLocaleDateString()}`;

    return await chatRepository.create(userId, chatTitle);
  }

  /**
   * Update chat (e.g., rename)
   */
  async updateChat(chatId: string, userId: number, updates: Partial<Chat>) {
    // Verify chat exists and user owns it
    const chat = await chatRepository.findById(chatId, userId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Validate updates
    if (updates.title !== undefined) {
      if (updates.title.trim().length === 0) {
        throw new Error("Chat title cannot be empty");
      }
      if (updates.title.length > 200) {
        throw new Error("Chat title is too long (max 200 characters)");
      }
    }

    return await chatRepository.update(chatId, userId, updates);
  }

  /**
   * Delete chat
   */
  async deleteChat(chatId: string, userId: number) {
    // Verify chat exists and user owns it
    const chat = await chatRepository.findById(chatId, userId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    await chatRepository.delete(chatId, userId);
  }

  /**
   * Get messages for a chat
   */
  async getChatMessages(chatId: string, userId: number) {
    // Verify chat exists and user owns it
    const chat = await chatRepository.findById(chatId, userId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    return await chatRepository.findMessagesByChatId(chatId);
  }

  /**
   * Add message to chat and generate AI response
   */
  async addMessage(
    chatId: string,
    userId: number,
    messageData: {
      role: "user" | "assistant";
      content: string;
    }
  ) {
    // Verify chat exists and user owns it
    const chat = await chatRepository.findById(chatId, userId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.userId !== userId) {
      throw new Error("Unauthorized to add message to this chat");
    }

    // Validate message
    if (!messageData.content || messageData.content.trim().length === 0) {
      throw new Error("Message content is required");
    }

    if (messageData.content.length > 10000) {
      throw new Error("Message is too long (max 10000 characters)");
    }

    if (!["user", "assistant"].includes(messageData.role)) {
      throw new Error("Invalid message role (must be 'user' or 'assistant')");
    }

    // Store user message
    const userMessage = await chatRepository.createMessage(
      chatId,
      messageData.role as any,
      messageData.content
    );

    // If user sent the message, generate AI response
    if (messageData.role === "user") {
      try {
        // Get chat history for context
        const chatMessages = await chatRepository.findMessagesByChatId(chatId);

        // Get user profile for context
        const userProfile = await profileRepository.findByUserId(userId);

        // Get user's favorite universities for context
        const favoriteUniversities =
          await universityRepository.findFavoritesByUserId(userId);

        // Get user's favorite scholarships for context
        const favoriteScholarships =
          await universityRepository.findFavoriteScholarshipsByUserId(userId);

        // Generate AI response
        const aiResponse = await aiService.generateChatResponse(
          messageData.content,
          userProfile || {},
          favoriteUniversities || [],
          favoriteScholarships || [],
          chatMessages
        );

        // Store AI response
        const assistantMessage = await chatRepository.createMessage(
          chatId,
          "assistant",
          aiResponse.response
        );

        // Return both messages
        return {
          userMessage,
          aiMessage: assistantMessage,
          suggestedTasks: aiResponse.suggestedTasks || [],
        };
      } catch (error) {
        console.error("Failed to generate AI response:", error);
        // Still return the user message even if AI fails
        return {
          userMessage,
          aiMessage: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate AI response",
        };
      }
    }

    return { userMessage };
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string, chatId: string, userId: number) {
    // Verify chat exists and user owns it
    const chat = await chatRepository.findById(chatId, userId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Note: Message deletion not implemented in repository
    throw new Error("Message deletion not supported");
  }
}

export const chatService = new ChatService();
