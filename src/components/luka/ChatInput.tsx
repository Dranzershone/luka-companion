import { Send, Mic } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="flex items-center gap-3 rounded-full bg-card px-4 py-2 shadow-medium transition-all duration-300 focus-within:shadow-lifted">
        <button
          type="button"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Mic className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share what's on your mind..."
          className="flex-1 bg-transparent py-2 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-all duration-200 hover:scale-105 hover:shadow-medium active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
