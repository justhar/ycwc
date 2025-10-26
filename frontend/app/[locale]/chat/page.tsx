"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/app/contexts/AuthContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Suggestion {
  id: string;
  text: string;
  category: string;
}

const predefinedSuggestions: Suggestion[] = [
  { id: "1", text: "Help me with college applications", category: "Academic" },
  { id: "2", text: "What are good study strategies?", category: "Academic" },
  { id: "3", text: "Suggest tasks for my profile", category: "Planning" },
  {
    id: "4",
    text: "Evaluate my progress",
    category: "Evaluation",
  },
  { id: "5", text: "Test preparation tips", category: "Academic" },
  { id: "6", text: "What should I do this week?", category: "Planning" },
];

export default function ChatPage() {
  const { currentMessages, loading, sendMessage, createNewChat } = useChat();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [animatingMessageId, setAnimatingMessageId] = useState<string | null>(
    null
  );
  const [completedAnimations, setCompletedAnimations] = useState<Set<string>>(
    new Set()
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [messageDisplayTexts, setMessageDisplayTexts] = useState<
    Record<string, string>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Fix hydration issue
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-scroll to bottom when new messages are added (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 100); // Debounce scroll updates

    return () => clearTimeout(timeoutId);
  }, [currentMessages, Object.keys(messageDisplayTexts).length]); // Only trigger on message count changes, not every character

  // Typewriter effect for AI messages (optimized)
  useEffect(() => {
    if (!animatingMessageId || loading) return;

    const message = currentMessages.find(
      (msg) => msg.id === animatingMessageId
    );
    if (!message || message.role !== "assistant") return;

    const fullText = message.content;
    const lines = fullText.split("\n");
    let currentLineIndex = 0;
    let currentCharIndex = messageDisplayTexts[message.id]?.length || 0;
    let animationId: number;

    const typeNext = () => {
      if (currentLineIndex < lines.length) {
        const currentLine = lines[currentLineIndex];

        if (currentCharIndex < currentLine.length) {
          // Type characters within the current line faster
          const charsToAdd = Math.min(3, currentLine.length - currentCharIndex); // Add 3 chars at a time
          currentCharIndex += charsToAdd;

          const currentText =
            lines.slice(0, currentLineIndex).join("\n") +
            (currentLineIndex < lines.length ? "\n" : "") +
            currentLine.slice(0, currentCharIndex);

          setMessageDisplayTexts((prev) => ({
            ...prev,
            [message.id]: currentText,
          }));

          animationId = requestAnimationFrame(() => {
            setTimeout(typeNext, 20); // 20ms delay for faster animation
          });
        } else {
          // Move to next line
          currentLineIndex++;
          currentCharIndex = 0;

          if (currentLineIndex < lines.length) {
            // Add the newline and start next line immediately
            const currentText =
              lines.slice(0, currentLineIndex).join("\n") + "\n";
            setMessageDisplayTexts((prev) => ({
              ...prev,
              [message.id]: currentText,
            }));

            animationId = requestAnimationFrame(() => {
              setTimeout(typeNext, 50); // 50ms delay between lines
            });
          } else {
            // Animation complete
            setMessageDisplayTexts((prev) => ({
              ...prev,
              [message.id]: fullText,
            }));
            setCompletedAnimations((prev) => new Set([...prev, message.id]));
            setAnimatingMessageId(null);
          }
        }
      }
    };

    typeNext();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animatingMessageId, loading]); // Removed currentMessages dependency to prevent re-triggering

  const handleSendMessage = useCallback(
    async (message?: string) => {
      const messageText = message || inputValue.trim();
      if (!messageText || loading) return;

      setInputValue("");

      try {
        const response = await sendMessage(messageText);

        // Start typewriter effect for the new AI message
        if (response && response.aiMessage) {
          setAnimatingMessageId(response.aiMessage.id);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [inputValue, loading, sendMessage]
  );

  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSendMessage(suggestion.text);
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (timestamp: string | Date) => {
    // Prevent hydration mismatch by ensuring consistent formatting
    if (!isMounted) {
      return ""; // Return empty string during SSR
    }

    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    // Use consistent formatting that works across timezones
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <ProtectedRoute>
      <div className="h-full flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 min-h-0 px-4">
          <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
            {currentMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center py-8">
                <div className="max-w-lg mx-auto text-center space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center justify-center">
                      Start a conversation about your study abroad plans!
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {predefinedSuggestions.map((suggestion) => (
                        <Button
                          key={suggestion.id}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-3 px-4 w-full"
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={loading}
                        >
                          <div className="w-full">
                            <div className="text-sm font-medium">
                              {suggestion.text}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {suggestion.category}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      {message.role === "assistant" ? (
                        <>
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="h-4 w-4 text-primary" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarFallback className="bg-secondary">
                            {user?.fullName?.charAt(0) || (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>

                    <div
                      className={`flex-1 space-y-1 ${
                        message.role === "user" ? "items-end" : "items-start"
                      } flex flex-col`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        {loading &&
                        message ===
                          currentMessages[currentMessages.length - 1] &&
                        message.role === "assistant" ? (
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground ml-2">
                              AI is thinking...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="text-md prose prose-sm max-w-none dark:prose-invert">
                              <Markdown remarkPlugins={[remarkGfm]}>
                                {message.role === "assistant" &&
                                (messageDisplayTexts[message.id] ||
                                  completedAnimations.has(message.id))
                                  ? messageDisplayTexts[message.id] ||
                                    message.content
                                  : message.content}
                              </Markdown>
                            </div>
                          </>
                        )}
                      </div>

                      {!loading && (
                        <div
                          className={`flex items-center space-x-2 text-xs text-muted-foreground ${
                            message.role === "user"
                              ? "flex-row-reverse space-x-reverse"
                              : ""
                          }`}
                        >
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {isMounted ? formatTime(message.createdAt) : ""}
                            </span>
                          </div>

                          {message.role === "assistant" && (
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(message.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Suggestions */}

        {/* Input Area */}
        <div className="border-t bg-background p-4">
          <div className="space-y-3">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about academics, college prep, or career guidance..."
                  disabled={loading}
                  className="min-h-[40px] resize-none"
                />
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || loading}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
