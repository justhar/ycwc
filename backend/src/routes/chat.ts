import { Hono } from "hono";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  users,
  profiles,
  userFavorites,
  userScholarshipFavorites,
  universities,
  scholarships,
  chats,
  messages,
} from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { AIService } from "../utils/ai-service.js";

const chat = new Hono();

// GET /chats - Get user's chats (limited to 5 most recent)
chat.get("/", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    const userChats = await db
      .select({
        id: chats.id,
        title: chats.title,
        createdAt: chats.createdAt,
        updatedAt: chats.updatedAt,
      })
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.updatedAt))
      .limit(5);

    return c.json({ chats: userChats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return c.json({ error: "Failed to fetch chats" }, 500);
  }
});

// POST /chats - Create new chat
chat.post("/", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    const newChat = await db
      .insert(chats)
      .values({
        userId,
        title: null, // Will be set from first message
      })
      .returning({
        id: chats.id,
        title: chats.title,
        createdAt: chats.createdAt,
        updatedAt: chats.updatedAt,
      });

    return c.json({ chat: newChat[0] }, 201);
  } catch (error) {
    console.error("Error creating chat:", error);
    return c.json({ error: "Failed to create chat" }, 500);
  }
});

// DELETE /chats/:id - Delete a chat
chat.delete("/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const chatId = c.req.param("id");

    // Verify chat belongs to user
    const chatToDelete = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .limit(1);

    if (chatToDelete.length === 0) {
      return c.json({ error: "Chat not found" }, 404);
    }

    // Delete chat (messages will be cascade deleted due to FK constraint)
    await db.delete(chats).where(eq(chats.id, chatId));

    return c.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return c.json({ error: "Failed to delete chat" }, 500);
  }
});

// GET /chats/:id/messages - Get messages for a chat
chat.get("/:id/messages", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const chatId = c.req.param("id");

    // Verify chat belongs to user
    const chatExists = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .limit(1);

    if (chatExists.length === 0) {
      return c.json({ error: "Chat not found" }, 404);
    }

    const chatMessages = await db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);

    return c.json({ messages: chatMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

// POST /chats/:id/messages - Send message to chat
chat.post("/:id/messages", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const chatId = c.req.param("id");
    const { message } = await c.req.json();

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return c.json({ error: "Message is required" }, 400);
    }

    // Verify chat belongs to user
    const chatExists = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .limit(1);

    if (chatExists.length === 0) {
      return c.json({ error: "Chat not found" }, 404);
    }

    // Save user message
    const userMessage = await db
      .insert(messages)
      .values({
        chatId,
        role: "user",
        content: message.trim(),
      })
      .returning({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      });

    // Update chat title if this is the first message
    if (!chatExists[0].title) {
      const title =
        message.trim().length > 50
          ? message.trim().substring(0, 50) + "..."
          : message.trim();
      await db
        .update(chats)
        .set({ title, updatedAt: new Date() })
        .where(eq(chats.id, chatId));
    } else {
      // Update chat updated_at for existing chats
      await db
        .update(chats)
        .set({ updatedAt: new Date() })
        .where(eq(chats.id, chatId));
    }

    // Get user context for AI
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const favoriteUniversities = await db
      .select({
        id: universities.id,
        name: universities.name,
        location: universities.location,
        country: universities.country,
        type: universities.type,
        acceptanceRate: universities.acceptanceRate,
        tuitionRange: universities.tuitionRange,
      })
      .from(userFavorites)
      .leftJoin(universities, eq(userFavorites.universityId, universities.id))
      .where(eq(userFavorites.userId, userId))
      .limit(5); // Limit to avoid token overflow

    const favoriteScholarships = await db
      .select({
        id: scholarships.id,
        name: scholarships.name,
        type: scholarships.type,
        amount: scholarships.amount,
        description: scholarships.description,
        requirements: scholarships.requirements,
        deadline: scholarships.deadline,
        provider: scholarships.provider,
        country: scholarships.country,
      })
      .from(userScholarshipFavorites)
      .leftJoin(
        scholarships,
        eq(userScholarshipFavorites.scholarshipId, scholarships.id)
      )
      .where(eq(userScholarshipFavorites.userId, userId))
      .limit(5); // Limit to avoid token overflow

    // Get recent chat history (last 10 messages for context)
    const recentMessages = await db
      .select({
        role: messages.role,
        content: messages.content,
      })
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.createdAt))
      .limit(10);

    // Reverse to get chronological order
    recentMessages.reverse();

    // Generate AI response
    const aiService = new AIService();
    const aiResponse = await aiService.generateChatResponse(
      message.trim(),
      userProfile[0] || null,
      favoriteUniversities.filter((u) => u.name),
      favoriteScholarships.filter((s) => s.name),
      recentMessages
    );

    // Save AI response
    const aiMessage = await db
      .insert(messages)
      .values({
        chatId,
        role: "assistant",
        content: aiResponse.response,
      })
      .returning({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      });

    return c.json({
      userMessage: userMessage[0],
      aiMessage: aiMessage[0],
      suggestedTasks: aiResponse.suggestedTasks || [],
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

export default chat;
