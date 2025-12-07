import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cream/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-rose-soft/5 rounded-full blur-3xl" />
        
        {/* Header */}
        <header className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-serif text-cream tracking-wide">revvere</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/pricing")}
            >
              Pricing
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
            >
              Login
            </Button>
            <Button
              variant="cream-outline"
              size="sm"
              onClick={() => navigate("/auth")}
            >
              Join Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 container mx-auto px-4 flex items-center">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <p className="text-cream/70 text-sm font-medium tracking-widest uppercase mb-6">
              Coaching & Wellness
            </p>
            <h2 className="text-5xl md:text-7xl font-serif text-foreground leading-tight mb-6">
              return to your{" "}
              <span className="italic text-cream">Self</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Access exclusive video content, guided practices, and connect with a 
              community of mindful women on their wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="cream"
                size="xl"
                onClick={() => navigate("/auth")}
                className="min-w-[200px]"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate("/auth")}
                className="min-w-[200px]"
              >
                <Play className="w-5 h-5" />
                Watch Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 pb-8 flex justify-center">
          <div className="w-6 h-10 border-2 border-cream/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-cream/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h3 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              What awaits <span className="italic text-cream">you</span>
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Curated content designed for the modern woman seeking balance and growth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Play,
                title: "Guided Practices",
                description: "Video content for meditation, movement, and mindfulness tailored to your schedule.",
              },
              {
                icon: Heart,
                title: "Community",
                description: "Connect with like-minded women and share your journey through comments and discussions.",
              },
              {
                icon: Sparkles,
                title: "Personal Growth",
                description: "Tools and techniques for self-discovery and transforming your daily routines.",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-cream/30 transition-all duration-300 hover:shadow-lg group animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-14 h-14 mx-auto mb-6 rounded-xl bg-cream/10 flex items-center justify-center group-hover:bg-cream/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-cream" />
                </div>
                <h4 className="text-xl font-serif text-foreground mb-3">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h3 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
              Begin your journey <span className="italic text-cream">today</span>
            </h3>
            <p className="text-muted-foreground mb-8">
              Join thousands of women who have transformed their daily practices 
              and reconnected with their authentic selves.
            </p>
            <Button
              variant="cream"
              size="xl"
              onClick={() => navigate("/auth")}
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Revvere. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
