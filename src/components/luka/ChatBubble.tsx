import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  isTyping?: boolean;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-1">
    <span className="typing-dot h-2 w-2 rounded-full bg-foreground/40" />
    <span className="typing-dot h-2 w-2 rounded-full bg-foreground/40" />
    <span className="typing-dot h-2 w-2 rounded-full bg-foreground/40" />
  </div>
);

const ChatBubble = ({ message, isUser, isTyping }: ChatBubbleProps) => {
  return (
    <div
      className={cn(
        "animate-slide-up flex items-end gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar for Luka */}
      {!isUser && (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-sage-100 shadow-soft">
          <Bot
            className={cn(
              "h-5 w-5 text-sage-500",
              isTyping && "animate-pulse-soft"
            )}
            strokeWidth={1.5}
          />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[75%] px-5 py-3.5 shadow-soft",
          isUser
            ? "rounded-3xl rounded-br-lg gradient-sage text-primary-foreground"
            : "rounded-3xl rounded-bl-lg bg-cream-100 text-foreground"
        )}
      >
        {isTyping ? (
          <TypingIndicator />
        ) : (
          <p className="text-[15px] leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
