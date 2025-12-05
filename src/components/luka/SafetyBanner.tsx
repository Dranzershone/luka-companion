import { Heart } from "lucide-react";

const SafetyBanner = () => {
  return (
    <div className="animate-fade-in">
      <a
        href="tel:988"
        className="group flex items-center gap-3 rounded-3xl bg-gradient-to-r from-coral-100 to-coral-200 px-5 py-4 shadow-soft transition-all duration-300 hover:shadow-medium hover:scale-[1.01]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coral-300/50">
          <Heart className="h-5 w-5 text-foreground/70" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground/90">
            Support is always here
          </p>
          <p className="text-xs text-foreground/60">
            Tap for the 988 Crisis Lifeline
          </p>
        </div>
        <div className="rounded-full bg-coral-300/40 px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors group-hover:bg-coral-300/60">
          988
        </div>
      </a>
    </div>
  );
};

export default SafetyBanner;
