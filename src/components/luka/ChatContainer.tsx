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

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi there! I'm Luka, your companion for mental wellness. How are you feeling today?",
    isUser: false,
  },
];

const lukaResponses = [
  "I hear you. It takes courage to share how you're feeling. Would you like to explore that a bit more?",
  "Thank you for opening up. Remember, every feeling is valid. What do you think triggered this emotion?",
  "I'm here with you. Sometimes just acknowledging our feelings is the first step toward understanding them.",
  "That sounds challenging. Would you like to try a quick breathing exercise together, or would you prefer to talk more?",
  "I appreciate you trusting me with this. Let's take this one step at a time. What feels most pressing right now?",
];

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    // Simulate Luka's response
    setTimeout(() => {
      setIsTyping(false);
      const randomResponse =
        lukaResponses[Math.floor(Math.random() * lukaResponses.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: randomResponse,
          isUser: false,
        },
      ]);
    }, 1500 + Math.random() * 1000);
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
          {isTyping && (
            <ChatBubble message="" isUser={false} isTyping />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Mood Widget */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="mx-auto max-w-2xl">
          <MoodWidget />
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
