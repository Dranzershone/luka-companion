import { Link } from "react-router-dom";
import { Heart, MessageCircle, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/luka/AnimatedBackground";

const HomePage = () => {
  const features = [
    {
      icon: Heart,
      title: "Empathetic Listening",
      description: "Luka is here to listen without judgment, offering a safe space for your thoughts and feelings.",
    },
    {
      icon: Shield,
      title: "Always Confidential",
      description: "Your conversations are private and secure. We prioritize your mental wellness journey.",
    },
    {
      icon: Sparkles,
      title: "Personalized Support",
      description: "Get tailored responses and coping strategies that resonate with your unique experiences.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AnimatedBackground />
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 md:px-12">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">Luka</span>
          </div>
          <Link to="/chat">
            <Button variant="ghost" size="sm" className="rounded-full">
              Sign In
            </Button>
          </Link>
        </header>

        {/* Hero Section */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="animate-slide-up space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Your AI Mental Health Companion</span>
            </div>

            {/* Main Heading */}
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              A calm space for your
              <span className="block bg-gradient-to-r from-primary to-sage-300 bg-clip-text text-transparent">
                mental wellness
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-xl text-lg text-muted-foreground md:text-xl">
              Luka is here to listen, support, and guide you through life's moments. 
              Experience compassionate AI that understands.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center">
              <Link to="/chat">
                <Button 
                  size="lg" 
                  className="group rounded-full bg-primary px-8 py-6 text-lg font-medium text-primary-foreground shadow-medium transition-all hover:shadow-lifted hover:scale-105"
                >
                  <MessageCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Start Chatting
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 py-6 text-lg font-medium border-primary/20 hover:bg-primary/5"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Floating Bot Avatar */}
          <div className="mt-12 animate-float">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sage-100 to-sage-200 shadow-lifted md:h-32 md:w-32">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 md:h-20 md:w-20">
                  <Heart className="h-8 w-8 text-primary md:h-10 md:w-10" />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="px-6 pb-16 md:px-12">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-3xl bg-card/60 p-6 shadow-soft backdrop-blur-sm transition-all duration-300 hover:shadow-medium hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-card/30 px-6 py-6 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2024 Luka. Your mental wellness matters.
            </p>
            <p className="text-xs text-muted-foreground">
              If you're in crisis, please call <span className="font-medium text-secondary">112</span> (Emergency Line)
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
