
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    // Parse the request body
    const { newPriceId } = await req.json();
    
    if (!newPriceId) {
      throw new Error('New price ID is required');
    }
    
    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Map internal price IDs to Stripe product IDs
    const productIdMap = {
      'price_monthly': 'prod_S1uqDkwAwdTUij',
      'price_yearly': 'prod_S1urWnWxmsyUxd'
    };
    
    // Get the product ID based on the internal price ID
    const productId = productIdMap[newPriceId];
    
    if (!productId) {
      throw new Error(`Unknown price ID: ${newPriceId}`);
    }
    
    console.log(`Looking up price for product: ${productId}`);
    
    // Fetch the active price for the selected product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1
    });
    
    if (prices.data.length === 0) {
      throw new Error(`No active price found for product: ${productId}`);
    }
    
    // Get the actual Stripe price ID
    const stripePriceId = prices.data[0].id;
    console.log(`Found price ID: ${stripePriceId} for product: ${productId}`);
    
    // Determine the subscription type based on the internal price ID
    const subscriptionType = newPriceId === "price_monthly" ? "monthly" : "yearly";
    
    // Get user's subscription from the database
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      throw new Error(`Error fetching subscription: ${subscriptionError.message}`);
    }

    // Create a Stripe checkout session for new subscribers or users without a Stripe subscription ID
    if (!subscriptionData || !subscriptionData.stripe_subscription_id) {
      console.log("Creating new Stripe checkout session");
      
      // Create a Stripe checkout session for the new plan
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.get('origin')}/subscription-success?type=${subscriptionType}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/my-subscription`,
      });
      
      console.log("Checkout session created:", session.id);
      
      return new Response(
        JSON.stringify({ url: session.url }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    // If trying to change to the same price, just return success
    if (subscriptionData.price_id === newPriceId) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Already subscribed to this plan',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // For regular subscriptions with a Stripe subscription ID
    if (subscriptionData.stripe_subscription_id) {
      // Get the subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionData.stripe_subscription_id);
      
      console.log(`Updating subscription ${subscriptionData.stripe_subscription_id} to price ${stripePriceId}`);
      
      // Update the subscription to the new price
      await stripe.subscriptions.update(
        subscriptionData.stripe_subscription_id,
        {
          items: [
            {
              id: subscription.items.data[0].id,
              price: stripePriceId,
            },
          ],
          proration_behavior: 'create_prorations',
        }
      );

      // Update the subscription in the database
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          price_id: newPriceId,
          subscription_type: subscriptionType,
          updated_at: new Date().toISOString(),
        })
        .eq('auth_user_id', user.id);

      if (updateError) {
        throw new Error(`Error updating subscription: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Subscription plan has been updated successfully',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // If we have a subscription record but no Stripe ID (could happen with trials)
      throw new Error('No active Stripe subscription found');
    }
  } catch (error) {
    console.error('Error changing subscription plan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
