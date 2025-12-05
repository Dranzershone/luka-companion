import Header from "@/components/luka/Header";
import ChatContainer from "@/components/luka/ChatContainer";
import AnimatedBackground from "@/components/luka/AnimatedBackground";

const ChatPage = () => {
  return (
    <div className="relative flex h-screen flex-col bg-background">
      <AnimatedBackground />
      
      <div className="relative z-10 flex h-full flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          <ChatContainer />
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
