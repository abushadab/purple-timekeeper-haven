
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
      throw new Error("User not authenticated");
    }

    // Parse the request body
    const { priceId, cancelUrl } = await req.json();
    
    if (!priceId) {
      throw new Error("Price ID is required");
    }

    console.log(`Processing subscription for user: ${user.id}, plan: ${priceId}`);

    // Check if the user already has a subscription
    const { data: existingSubscriptions } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("auth_user_id", user.id);

    console.log(`Existing subscriptions: ${existingSubscriptions?.length ? 'Yes' : 'No'}`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create or get the customer
    let customerId;
    const { data: customerData } = await supabaseClient
      .from("customers")
      .select("stripe_customer_id")
      .eq("auth_user_id", user.id)
      .single();

    if (customerData?.stripe_customer_id) {
      customerId = customerData.stripe_customer_id;
    } else {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_id: user.id,
        },
      });
      customerId = customer.id;

      // Store the customer ID in Supabase
      await supabaseClient.from("customers").insert({
        auth_user_id: user.id,
        stripe_customer_id: customer.id,
        email: user.email,
      });
    }

    // Get the origin to set success and cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    // Use the provided cancelUrl or default to the origin
    const defaultCancelUrl = `${origin}/pricing`;
    const effectiveCancelUrl = cancelUrl || defaultCancelUrl;
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId === "free_trial" ? "price_1R7r1APrcqwIuKqXZ12M3hdy" : priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: effectiveCancelUrl,
      subscription_data: {
        trial_period_days: priceId === "free_trial" ? 7 : undefined,
        metadata: {
          auth_user_id: user.id,
        },
      },
      metadata: {
        auth_user_id: user.id,
      },
    });

    console.log(`Checkout session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
