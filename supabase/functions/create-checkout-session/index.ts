
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Extract the token from the header
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    // Fetch the request body
    const { priceId } = await req.json();
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
      apiVersion: "2023-10-16",
    });

    // Fetch the user details from Supabase
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": supabaseAnonKey,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user');
    }

    const userData = await userResponse.json();
    const userEmail = userData.email;
    const userId = userData.id;

    if (!userEmail) {
      throw new Error('User email not found');
    }

    console.log(`Processing subscription for user: ${userId}, plan: ${priceId}`);

    // Check if user already has a subscription in our database
    const checkSubscriptionResponse = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?auth_user_id=eq.${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": supabaseAnonKey,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
    });
    
    const existingSubscriptions = await checkSubscriptionResponse.json();
    console.log("Existing subscriptions:", existingSubscriptions.length > 0 ? "Yes" : "No");
    
    // If it's a free trial, create a subscription record in our database without going to Stripe
    if (priceId === "free_trial") {
      // Only create a trial if the user doesn't already have a subscription
      if (existingSubscriptions.length === 0) {
        const currentDate = new Date();
        const trialEndDate = new Date(currentDate);
        trialEndDate.setDate(currentDate.getDate() + 7); // 7-day trial
        
        console.log("Creating free trial subscription record");
        
        // Create a subscription record for the trial - use service role token to bypass RLS
        const createSubscriptionResponse = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions`, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${supabaseServiceRoleKey}`,
            "apikey": supabaseServiceRoleKey,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify({
            auth_user_id: userId,
            status: 'trialing',
            subscription_type: 'free_trial',
            current_period_start: currentDate.toISOString(),
            current_period_end: trialEndDate.toISOString()
          })
        });
        
        if (!createSubscriptionResponse.ok) {
          const error = await createSubscriptionResponse.json();
          console.error("Error creating trial subscription:", error);
          throw new Error(`Failed to create trial subscription: ${JSON.stringify(error)}`);
        }
        
        const result = await createSubscriptionResponse.json();
        console.log("Trial subscription created:", result);
        
        // Redirect back to app
        return new Response(
          JSON.stringify({ url: `${req.headers.get("origin")}/?trial=started` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        throw new Error("You already have an active subscription");
      }
    }
    
    // Map the price ID to the actual Stripe price ID
    let stripePriceId;
    let subscriptionType;
    
    switch (priceId) {
      case "price_monthly":
        // List all prices for the monthly product to find the active price
        const monthlyPrices = await stripe.prices.list({
          product: 'prod_S1uqDkwAwdTUij',
          active: true,
          limit: 1
        });
        
        if (monthlyPrices.data.length === 0) {
          throw new Error("No active price found for monthly product");
        }
        
        stripePriceId = monthlyPrices.data[0].id;
        subscriptionType = 'monthly';
        break;
      case "price_yearly":
        // List all prices for the yearly product to find the active price
        const yearlyPrices = await stripe.prices.list({
          product: 'prod_S1urWnWxmsyUxd',
          active: true,
          limit: 1
        });
        
        if (yearlyPrices.data.length === 0) {
          throw new Error("No active price found for yearly product");
        }
        
        stripePriceId = yearlyPrices.data[0].id;
        subscriptionType = 'yearly';
        break;
      default:
        throw new Error("Invalid price ID");
    }

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabaseUserId: userData.id,
        },
      });
      customerId = customer.id;
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}&type=${subscriptionType}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        userId: userId,
        subscriptionType: subscriptionType,
        priceId: stripePriceId
      }
    });

    console.log("Checkout session created:", session.id);

    // Return the checkout URL
    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
