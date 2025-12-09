import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, planName, price, paymentId } = await req.json();

    console.log("Creating checkout session for:", { planId, planName, price, paymentId });

    // Get the Stripe secret key
    const stripeKey = Deno.env.get("VITE_STRIPE_PUBLIC_KEY");
    if (!stripeKey) {
      throw new Error("Stripe key not configured");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Get user from authorization header (optional for demo users)
    const authHeader = req.headers.get("Authorization");
    let userEmail = "demo@example.com";
    let userId = "demo-user";

    if (authHeader && authHeader !== "Bearer null") {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

      if (!userError && userData.user) {
        userEmail = userData.user.email || "demo@example.com";
        userId = userData.user.id;
      }
    }

    // Check if customer already exists
    let customerId: string | undefined;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = newCustomer.id;
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "http://localhost:8080";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planName} Plan`,
              description: `Monthly subscription to the ${planName} wellness plan`,
            },
            unit_amount: price * 100,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${paymentId}`,
      cancel_url: `${origin}/payment-cancel?payment_id=${paymentId}`,
      metadata: {
        payment_id: paymentId,
        plan_id: planId,
        user_id: userId,
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
