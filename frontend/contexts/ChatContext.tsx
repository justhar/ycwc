"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "../app/contexts/AuthContext";
import {
  Chat,
  ChatMessage,
  getUserChats,
  createChat,
  deleteChat,
  getChatMessages,
  sendChatMessage,
  ChatResponse,
} from "@/lib/api";

interface ChatContextType {
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

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load chats when user is authenticated
  useEffect(() => {
    if (user && token) {
      loadChats();
    } else {
      setChats([]);
      setCurrentChatId(null);
      setCurrentMessages([]);
    }
  }, [user, token]);

  const loadChats = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const userChats = await getUserChats(token);
      setChats(userChats);

      // If no current chat is selected and we have chats, select the most recent one
      if (!currentChatId && userChats.length > 0) {
        await selectChat(userChats[0].id);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async (): Promise<string> => {
    if (!token) throw new Error("Not authenticated");

    const newChat = await createChat(token);
    setChats((prev) => [newChat, ...prev]);
    await selectChat(newChat.id);
    return newChat.id;
  };

  const selectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    if (!token) return;

    setLoading(true);
    try {
      const messages = await getChatMessages(token, chatId);
      setCurrentMessages(messages);
    } catch (error) {
      console.error("Failed to load chat messages:", error);
      setCurrentMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteChatById = async (chatId: string) => {
    if (!token) return;

    await deleteChat(token, chatId);
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));

    // If we deleted the current chat, select another one
    if (currentChatId === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      if (remainingChats.length > 0) {
        await selectChat(remainingChats[0].id);
      } else {
        setCurrentChatId(null);
        setCurrentMessages([]);
      }
    }
  };

  const sendMessage = async (message: string) => {
    if (!token || !currentChatId) return;

    // Optimistically add user message
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setCurrentMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await sendChatMessage(token, currentChatId, message);

      // Replace temp message with real one and add AI response
      setCurrentMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempUserMessage.id);
        return [...filtered, response.userMessage, response.aiMessage];
      });

      // Update chat title if it was just created
      if (response.userMessage.content.length > 0) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  title:
                    response.userMessage.content.length > 50
                      ? response.userMessage.content.substring(0, 50) + "..."
                      : response.userMessage.content,
                }
              : chat
          )
        );
      }

      return response;
    } catch (error) {
      // Remove temp message on error
      setCurrentMessages((prev) =>
        prev.filter((msg) => msg.id !== tempUserMessage.id)
      );
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        currentMessages,
        loading,
        loadChats,
        createNewChat,
        selectChat,
        deleteChatById,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
