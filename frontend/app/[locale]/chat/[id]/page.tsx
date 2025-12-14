"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Bot,
  User,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  Target,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { getChatMessages, sendChatMessage } from "@/lib/api";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const ChatPageDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const t = useTranslations("chat");
  const locale = useLocale();

  const chatId = params?.id as string;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to scroll to bottom using messagesEndRef
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load chat messages on mount
  useEffect(() => {
    if (!chatId || !token) return;

    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const msgs = await getChatMessages(token, chatId);
        setMessages(msgs);
        // Auto-scroll to bottom after messages load
        scrollToBottom();
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load chat messages");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [chatId, token, scrollToBottom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!input.trim() || loading || !token || !chatId) return;

      const userMessage = input;
      setInput("");
      setLoading(true);

      try {
        // Add user message + typing indicator immediately
        const tempUserMsg: ChatMessage = {
          id: `temp-user-${Date.now()}`,
          role: "user",
          content: userMessage,
          createdAt: new Date().toISOString(),
        };

        const typingMsg: ChatMessage = {
          id: `typing-${Date.now()}`,
          role: "assistant",
          content: "...",
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, tempUserMsg, typingMsg]);

        // Send to API
        const response = await sendChatMessage(token, chatId, userMessage);

        console.log("Chat response received:", response);

        if (!response) {
          throw new Error("No response from server");
        }

        // Validate response structure
        if (!response.userMessage) {
          console.error("Response missing userMessage:", response);
          throw new Error("Invalid response: missing userMessage");
        }

        console.log("User message from response:", response.userMessage);
        console.log("AI message from response:", response.aiMessage);

        // Replace temp messages with real ones
        setMessages((prev) => {
          console.log("Current messages before update:", prev);

          const filtered = prev.filter(
            (msg) =>
              !msg.id.startsWith("temp-user-") && !msg.id.startsWith("typing-")
          );

          console.log("Filtered messages (temp removed):", filtered);

          const messagesToAdd: ChatMessage[] = [];

          // Always add user message if it exists
          if (response.userMessage) {
            // Ensure message has all required fields
            const userMsg: ChatMessage = {
              id: response.userMessage.id || `user-${Date.now()}`,
              role: "user",
              content: response.userMessage.content || "",
              createdAt:
                response.userMessage.createdAt || new Date().toISOString(),
            };
            messagesToAdd.push(userMsg);
            console.log("Added user message:", userMsg);
          }

          // Add AI message if it exists
          if (response.aiMessage) {
            const aiMsg: ChatMessage = {
              id: response.aiMessage.id || `ai-${Date.now()}`,
              role: "assistant",
              content: response.aiMessage.content || "",
              createdAt:
                response.aiMessage.createdAt || new Date().toISOString(),
            };
            messagesToAdd.push(aiMsg);
            console.log("Added AI message:", aiMsg);
          }

          if (messagesToAdd.length === 0) {
            console.warn("No valid messages to add from response");
            return prev;
          }

          const updatedMessages = [...filtered, ...messagesToAdd];
          console.log("Final messages state:", updatedMessages);
          console.log("Message count:", updatedMessages.length);

          return updatedMessages;
        });
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
        // Remove the temp messages if it failed
        setMessages((prev) =>
          prev.filter(
            (msg) =>
              !msg.id.startsWith("temp-user-") && !msg.id.startsWith("typing-")
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [input, loading, token, chatId, locale]
  );

  if (!token) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Messages Area - Flex grow to take available space */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="text-muted-foreground">{t("loading")}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 px-4 max-w-2xl">
              <div>
                <Sparkles className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <h2 className="text-2xl font-semibold mb-2">{t("greeting")}</h2>
                <p className="text-muted-foreground">
                  {t("greetingDescription")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setInput(t("question1Text"))}
                  className="p-4 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                >
                  <p className="font-medium text-sm">{t("question1Title")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("question1Description")}
                  </p>
                </button>

                <button
                  onClick={() => setInput(t("question2Text"))}
                  className="p-4 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                >
                  <p className="font-medium text-sm">{t("question2Title")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("question2Description")}
                  </p>
                </button>

                <button
                  onClick={() => setInput(t("question3Text"))}
                  className="p-4 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                >
                  <p className="font-medium text-sm">{t("question3Title")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("question3Description")}
                  </p>
                </button>

                <button
                  onClick={() => setInput(t("question4Text"))}
                  className="p-4 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                >
                  <p className="font-medium text-sm">{t("question4Title")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("question4Description")}
                  </p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 md:p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 md:gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-orange-100">
                        <Bot className="w-4 h-4 text-orange-600" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-xs md:max-w-xl px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-orange-500 text-white rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    }`}
                  >
                    {message.content === "..." ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs ml-2">Typing...</span>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </Markdown>
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-orange-100">
                        <User className="w-4 h-4 text-orange-600" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {/* Scroll anchor for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Sticky at bottom */}
      <div className="sticky bottom-0 z-50 shrink-0 border-t bg-card p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-start">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("typeMessage")}
            className="resize-none break-words min-h-[44px] max-h-[120px] overflow-y-auto"
            rows={1}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSendMessage(e as any);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            size="icon"
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPageDetail;
