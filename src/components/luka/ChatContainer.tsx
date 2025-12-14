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
 * This avoids using `any` and satisfies @typescript-eslint/no-explicit-any.
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

  // session id persisted in localStorage so conversation continues across reloads
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

  // typed access to Vite env (no any)
  const configuredUrl = import.meta.env.VITE_API_URL;
  const API_URL = configuredUrl ?? "http://127.0.0.1:8000/chat";

  
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info("[ChatContainer] API_URL =", API_URL, "(VITE_API_URL:", configuredUrl, ")");
  }, [API_URL, configuredUrl]);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const payload: { message: string; session_id?: string } = { message: text };
      if (sessionIdRef.current) payload.session_id = sessionIdRef.current;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // attempt to read body text for debugging
        let serverBody: string | null = null;
        try {
          serverBody = await response.text();
        } catch (err) {
          // ignore
        }
        const errMsg =
          `Server responded ${response.status} ${response.statusText}` +
          (serverBody ? `: ${serverBody}` : "");
        throw new Error(errMsg);
      }

      const data = (await response.json()) as BackendResponse;

      setIsTyping(false);

      const replyText =
        typeof data.reply === "string" ? data.reply : "Sorry — I couldn't generate a reply right now.";
      const lukaReply: Message = {
        id: Date.now() + 1,
        text: replyText,
        isUser: false,
      };

      setMessages((prev) => [...prev, lukaReply]);

      if (data.session_id && typeof data.session_id === "string") {
        sessionIdRef.current = data.session_id;
        try {
          localStorage.setItem("luka_session_id", data.session_id);
        } catch (e) {
          // ignore storage errors
        }
      }

      // LINT-SAFE: use type guard instead of casting to `any`
      if (data.music && isMusicObject(data.music)) {
        setMoodRecommendation(data.music.url);
      } else {
        // clear previous recommendation when none returned
        setMoodRecommendation(null);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Connection Error:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Oops — I'm having trouble connecting right now. Please check your network or try again later.",
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
            <ChatBubble key={message.id} message={message.text} isUser={message.isUser} />
          ))}
          {isTyping && <ChatBubble message="" isUser={false} isTyping />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Mood Widget */}
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
