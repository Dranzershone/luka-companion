import { Sparkles, Settings } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-300 to-sage-400 shadow-soft">
          <Sparkles className="h-5 w-5 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Luka</h1>
          <p className="text-xs text-muted-foreground">Your wellness companion</p>
        </div>
      </div>

      <button className="flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground">
        <Settings className="h-5 w-5" strokeWidth={1.5} />
      </button>
    </header>
  );
};

export default Header;
