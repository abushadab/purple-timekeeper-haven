
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

    if (!userEmail) {
      throw new Error('User email not found');
    }

    // Map the price ID to the actual Stripe price ID
    let stripePriceId;
    switch (priceId) {
      case "free_trial":
        // Implement free trial logic here
        // For now, just redirect back to app
        return new Response(
          JSON.stringify({ url: `${req.headers.get("origin")}/?trial=started` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      case "price_monthly":
        stripePriceId = "price_1R9tqKPrcqwIuKqXxZEeKKBi"; // Replace with your actual monthly price ID
        break;
      case "price_yearly":
        stripePriceId = "price_1R9trdPrcqwIuKqXoakGLFnS"; // Replace with your actual yearly price ID
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
      success_url: `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
    });

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
