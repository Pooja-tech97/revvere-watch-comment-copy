import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavLink } from "@/components/NavLink";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    description: "Perfect for getting started with wellness journaling",
    features: [
      "Unlimited journal entries",
      "Voice-to-text support",
      "Basic mood tracking",
      "7-day history",
    ],
    icon: <Star className="h-6 w-6" />,
  },
  {
    id: "premium",
    name: "Premium",
    price: 19,
    description: "Everything you need for your wellness journey",
    features: [
      "All Starter features",
      "AI-powered insights",
      "Unlimited history",
      "Custom templates",
      "Priority support",
    ],
    icon: <Sparkles className="h-6 w-6" />,
    popular: true,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: 39,
    description: "The complete wellness experience",
    features: [
      "All Premium features",
      "1-on-1 coaching sessions",
      "Personalized wellness plan",
      "Community access",
      "Early feature access",
      "Custom integrations",
    ],
    icon: <Crown className="h-6 w-6" />,
  },
];

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePurchase = async (plan: PricingPlan) => {
    setLoadingPlan(plan.id);

    try {
      // Get Supabase authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Also check localStorage for simulated auth (for demo purposes)
      const storedUser = localStorage.getItem("user");

      if (!user && !storedUser) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to make a purchase.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      let paymentId: string | null = null;

      // Only create payment record for Supabase authenticated users
      // localStorage users (demo) will skip this step due to RLS restrictions
      if (user) {
        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .insert({
            user_id: user.id,
            amount: plan.price * 100,
            currency: "usd",
            plan_name: plan.name,
            status: "pending",
          })
          .select()
          .single();

        if (paymentError) throw paymentError;
        paymentId = payment.id;
      } else {
        // For demo users, generate a temporary ID
        paymentId = crypto.randomUUID();
      }

      // Call edge function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          paymentId: paymentId,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-serif text-primary">Wellness</h1>
          <div className="flex items-center gap-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/journal">Journal</NavLink>
            <NavLink to="/videos">Videos</NavLink>
            <NavLink to="/pricing">Pricing</NavLink>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">
            Choose Your Journey
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Invest in your wellness with a plan that fits your needs. All plans include a 7-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col animate-slide-up border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg ${
                plan.popular ? "border-primary/50 shadow-lg ring-1 ring-primary/20" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary w-fit">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-serif text-foreground">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-foreground/80">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(plan)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === plan.id ? "Processing..." : "Get Started"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12">
          All prices are in USD. Cancel anytime. No questions asked.
        </p>
      </main>
    </div>
  );
};

export default Pricing;
