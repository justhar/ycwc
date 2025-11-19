/**
 * Chat and message types for AI chat functionality
 */

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface ChatResponse {
  chat: Chat;
  messages: ChatMessage[];
}

export interface CreateChatRequest {
  title?: string;
  initialMessage?: string;
}

export interface SendMessageRequest {
  content: string;
}
