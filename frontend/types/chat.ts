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
  userId?: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface ChatResponse {
  userMessage: ChatMessage;
  aiMessage: ChatMessage | null;
  suggestedTasks?: any[];
  error?: string;
}

export interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentMessages: ChatMessage[];
  loading: boolean;
  loadChats: () => Promise<void>;
  createNewChat: () => Promise<string>;
  selectChat: (chatId: string) => Promise<void>;
  deleteChatById: (chatId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<ChatResponse | undefined>;
}
