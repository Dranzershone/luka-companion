// src/ChatContainer.tsx
import { useState, useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import SafetyBanner from "./SafetyBanner";
import MoodWidget from "./MoodWidget";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface BackendResponse {
  reply?: string;
  mood?: string;
  session_id?: string;
  music?: { url?: string } | null;
  history?: Array<{ role: string; text: string }>;
  [key: string]: unknown;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi there! I'm Luka, your companion for mental wellness. How are you feeling today?",
    isUser: false,
  },
];

/**
 * Type guard to safely assert that an unknown value is the expected music object.
 */
function isMusicObject(obj: unknown): obj is { url: string } {
  if (!obj || typeof obj !== "object") return false;
  const r = obj as Record<string, unknown>;
  return typeof r.url === "string";
}

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [moodRecommendation, setMoodRecommendation] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist session id (future-ready, backend may ignore for now)
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem("luka_session_id");
    if (stored) sessionIdRef.current = stored;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  /**
   * 🔒 ABSOLUTE BACKEND URL RESOLUTION
   * This line PREVENTS `/chat` 404 forever.
   */
  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://luka-companion.onrender.com/chat";

  /**
   * Runtime verification (safe to keep)
   * You SHOULD see the Render URL in production.
   */
  useEffect(() => {
    console.info("[LUKA] Using backend API:", API_URL);
  }, [API_URL]);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const payload: { message: string; session_id?: string } = {
        message: text,
      };

      if (sessionIdRef.current) {
        payload.session_id = sessionIdRef.current;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Backend ${response.status}: ${body}`);
      }

      const data = (await response.json()) as BackendResponse;

      const replyText =
        typeof data.reply === "string"
          ? data.reply
          : "I'm here with you. Could you tell me a bit more?";

      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: replyText,
          isUser: false,
        },
      ]);

      if (data.session_id) {
        sessionIdRef.current = data.session_id;
        try {
          localStorage.setItem("luka_session_id", data.session_id);
        } catch {
          /* ignore */
        }
      }

      if (data.music && isMusicObject(data.music)) {
        setMoodRecommendation(data.music.url);
      } else {
        setMoodRecommendation(null);
      }
    } catch (error) {
      console.error("[LUKA] API error:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text:
            "I'm having trouble connecting right now. Please try again in a moment.",
          isUser: false,
        },
      ]);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Safety Banner */}
      <div className="flex-shrink-0 px-4 pt-4">
        <SafetyBanner />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
            />
          ))}
          {isTyping && <ChatBubble message="" isUser={false} isTyping />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Mood Widget (UI-only for now) */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="mx-auto max-w-2xl">
          <MoodWidget recommendationUrl={moodRecommendation} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border/50 bg-background/80 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
