"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  category: string;
}

const predefinedSuggestions: Suggestion[] = [
  { id: "1", text: "Help me with college applications", category: "Academic" },
  { id: "2", text: "What are good study strategies?", category: "Academic" },
  { id: "3", text: "How to improve my essays?", category: "Writing" },
  { id: "4", text: "Scholarship opportunities", category: "Financial" },
  { id: "5", text: "Test preparation tips", category: "Academic" },
  { id: "6", text: "Career guidance advice", category: "Career" },
];

export default function ChatPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fix hydration issue
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const simulateTyping = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);

      // Add typing indicator message
      const typingId = `typing-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: typingId,
          content: "",
          role: "assistant",
          timestamp: new Date(),
          isTyping: true,
        },
      ]);

      // Simulate typing delay
      setTimeout(() => {
        setMessages((prev) =>
          prev
            .filter((msg) => msg.id !== typingId)
            .concat({
              id: `msg-${Date.now()}`,
              content: text,
              role: "assistant",
              timestamp: new Date(),
            })
        );
        setIsTyping(false);
        resolve();
      }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
    });
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = {
      college: [
        "I'd be happy to help with college applications! Here are some key tips:\n\n• Start early and create a timeline\n• Research schools thoroughly\n• Write compelling personal essays\n• Get strong letters of recommendation\n• Prepare for standardized tests\n\nWhat specific aspect would you like to focus on?",
        "College applications can be overwhelming, but breaking them down helps:\n\n1. **Research Phase**: Look into schools that match your interests\n2. **Preparation Phase**: Gather transcripts, test scores, essays\n3. **Application Phase**: Submit everything on time\n4. **Follow-up Phase**: Check application status\n\nWhich phase are you currently in?",
      ],
      study: [
        "Great question about study strategies! Here are proven techniques:\n\n• **Active Recall**: Test yourself instead of just re-reading\n• **Spaced Repetition**: Review material at increasing intervals\n• **Pomodoro Technique**: 25-minute focused study sessions\n• **Feynman Technique**: Explain concepts in simple terms\n\nWhat subject are you focusing on?",
        "Effective studying is about quality over quantity. Try these methods:\n\n1. Create a distraction-free environment\n2. Use multiple learning modalities (visual, auditory, kinesthetic)\n3. Take regular breaks to maintain focus\n4. Form study groups for accountability\n\nWhat's your biggest study challenge right now?",
      ],
      essay: [
        "Essay writing is crucial for academic success! Here's my approach:\n\n• **Planning**: Outline your main points before writing\n• **Hook**: Start with an engaging opening\n• **Structure**: Use clear paragraphs with topic sentences\n• **Evidence**: Support claims with specific examples\n• **Revision**: Always review and refine your work\n\nWhat type of essay are you working on?",
        "Strong essays have a clear voice and purpose. Consider these tips:\n\n1. Know your audience and purpose\n2. Create a compelling thesis statement\n3. Use transitions between paragraphs\n4. Show, don't just tell\n5. End with a memorable conclusion\n\nWould you like help with a specific essay?",
      ],
      scholarship: [
        "Scholarships can significantly reduce college costs! Here's how to find them:\n\n• **Start with your school**: Guidance counselors have local opportunities\n• **Use scholarship databases**: Fastweb, Scholarships.com, College Board\n• **Check with employers**: Many companies offer employee children scholarships\n• **Research your interests**: Subject-specific scholarships exist\n\nWhat are your main areas of interest or achievement?",
        "The scholarship search requires strategy:\n\n1. Apply to many smaller scholarships (less competition)\n2. Start early - some deadlines are 6+ months before college starts\n3. Tailor each application to the specific scholarship\n4. Keep track of deadlines and requirements\n\nWhat's your intended major or field of study?",
      ],
      test: [
        "Test preparation is key to academic success! Here are my recommendations:\n\n• **Know the format**: Understand what to expect\n• **Practice regularly**: Use official practice tests\n• **Time management**: Practice with time limits\n• **Review mistakes**: Learn from incorrect answers\n• **Stay calm**: Use relaxation techniques\n\nWhich test are you preparing for?",
        "Effective test prep involves multiple strategies:\n\n1. Create a study schedule leading up to the test\n2. Use active study methods (flashcards, practice problems)\n3. Get enough sleep before the test\n4. Eat a good breakfast on test day\n5. Arrive early to reduce stress\n\nWhat subject area needs the most focus?",
      ],
      career: [
        "Career guidance is so important for future planning! Let's explore:\n\n• **Self-assessment**: Identify your interests, values, and skills\n• **Research careers**: Use resources like O*NET and BLS\n• **Network**: Connect with professionals in fields of interest\n• **Gain experience**: Internships, volunteering, job shadowing\n• **Stay flexible**: Career paths often evolve\n\nWhat career areas interest you most?",
        "Career planning is a journey of discovery:\n\n1. Take career assessment tests\n2. Informational interviews with professionals\n3. Explore different industries through research\n4. Consider both current and emerging fields\n5. Think about work-life balance preferences\n\nWhat factors are most important to you in a career?",
      ],
      default: [
        "That's an interesting question! I'm here to help with academic and career guidance. Could you tell me more about what specific area you'd like assistance with? I can help with:\n\n• College applications and admissions\n• Study strategies and techniques\n• Essay writing and editing\n• Scholarship searches\n• Test preparation\n• Career planning and guidance\n\nWhat would be most helpful for you right now?",
        "I'd love to help you with that! As your academic assistant, I specialize in supporting students with their educational journey. Whether you need help with college prep, study techniques, or career planning, I'm here to guide you.\n\nWhat specific challenge or goal would you like to work on together?",
      ],
    };

    const lowerMessage = userMessage.toLowerCase();
    let category = "default";

    if (
      lowerMessage.includes("college") ||
      lowerMessage.includes("application") ||
      lowerMessage.includes("university")
    ) {
      category = "college";
    } else if (
      lowerMessage.includes("study") ||
      lowerMessage.includes("learn")
    ) {
      category = "study";
    } else if (
      lowerMessage.includes("essay") ||
      lowerMessage.includes("writ")
    ) {
      category = "essay";
    } else if (
      lowerMessage.includes("scholarship") ||
      lowerMessage.includes("financial aid")
    ) {
      category = "scholarship";
    } else if (
      lowerMessage.includes("test") ||
      lowerMessage.includes("exam") ||
      lowerMessage.includes("sat") ||
      lowerMessage.includes("act")
    ) {
      category = "test";
    } else if (
      lowerMessage.includes("career") ||
      lowerMessage.includes("job") ||
      lowerMessage.includes("profession")
    ) {
      category = "career";
    }

    const categoryResponses = responses[category as keyof typeof responses];
    return categoryResponses[
      Math.floor(Math.random() * categoryResponses.length)
    ];
  };

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText || isLoading) return;

    setIsLoading(true);
    setInputValue("");

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageText,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Generate and add AI response
    const aiResponse = generateAIResponse(messageText);
    await simulateTyping(aiResponse);

    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSendMessage(suggestion.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (timestamp: Date) => {
    // Prevent hydration mismatch by ensuring consistent formatting
    if (!isMounted) {
      return ""; // Return empty string during SSR
    }

    // Use consistent formatting that works across timezones
    const hours = timestamp.getHours().toString().padStart(2, "0");
    const minutes = timestamp.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 min-h-0 px-4">
        <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
          {messages.length === 0 ? (
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
                        disabled={isLoading}
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
              {messages.map((message) => (
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
                        <AvatarImage src="/ai-avatar.png" />
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="" />
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
                      {message.isTyping ? (
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
                            AI is typing...
                          </span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      )}
                    </div>

                    {!message.isTyping && (
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
                            {isMounted ? formatTime(message.timestamp) : ""}
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
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about academics, college prep, or career guidance..."
                disabled={isLoading}
                className="min-h-[40px] resize-none"
              />
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => {
                setMessages([]);
                setInputValue("");
              }}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
