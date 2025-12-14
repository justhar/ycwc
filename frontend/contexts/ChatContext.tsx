"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "../app/contexts/AuthContext";
import {
  getUserChats,
  createChat,
  deleteChat,
  getChatMessages,
  sendChatMessage,
} from "@/lib/api";
import type { Chat, ChatMessage, ChatResponse, ChatContextType } from "@/types";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
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

      // Don't auto-select a chat - let the component/route handle that
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

    // Load messages without navigation (we'll handle navigation in the caller)
    setCurrentChatId(newChat.id);
    setLoading(true);
    try {
      const messages = await getChatMessages(token, newChat.id);
      setCurrentMessages(messages);
    } catch (error) {
      console.error("Failed to load chat messages:", error);
      setCurrentMessages([]);
    } finally {
      setLoading(false);
    }

    // Navigate to the new chat
    router.push(`/${locale}/chat/${newChat.id}`);

    return newChat.id;
  };

  const selectChat = async (
    chatId: string,
    shouldNavigate: boolean = false
  ) => {
    setCurrentChatId(chatId);
    if (!token) return;

    setLoading(true);
    try {
      const messages = await getChatMessages(token, chatId);
      setCurrentMessages(messages);

      // Navigate to the chat detail page only if specified
      if (shouldNavigate) {
        router.push(`/${locale}/chat/${chatId}`);
      }
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
        // Redirect to /chat when no chats remain
        router.push(`/${locale}/chat`);
      }
    }
  };

  const sendMessage = async (message: string) => {
    if (!token || !currentChatId) return;

    // Optimistically add user message with chatId
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      chatId: currentChatId,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    // Add typing indicator (temporary AI message showing it's thinking)
    const typingMessage: ChatMessage = {
      id: `typing-${Date.now()}`,
      chatId: currentChatId,
      role: "assistant",
      content: "...",
      createdAt: new Date().toISOString(),
    };

    setCurrentMessages((prev) => [...prev, tempUserMessage, typingMessage]);

    try {
      const response = await sendChatMessage(token, currentChatId, message);

      // Replace temp messages with real ones
      setCurrentMessages((prev) => {
        const filtered = prev.filter(
          (msg) => msg.id !== tempUserMessage.id && msg.id !== typingMessage.id
        );
        const messagesToAdd = [response.userMessage];

        // Add AI message if it exists (AI response generated)
        if (response.aiMessage) {
          messagesToAdd.push(response.aiMessage);
        }

        return [...filtered, ...messagesToAdd];
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
      // Remove temp messages on error
      setCurrentMessages((prev) =>
        prev.filter(
          (msg) => msg.id !== tempUserMessage.id && msg.id !== typingMessage.id
        )
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
