import Header from "@/components/luka/Header";
import ChatContainer from "@/components/luka/ChatContainer";

const Index = () => {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Subtle background pattern */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sage-50 via-transparent to-transparent opacity-60" />
      
      <div className="relative z-10 flex h-full flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          <ChatContainer />
        </main>
      </div>
    </div>
  );
};

export default Index;
