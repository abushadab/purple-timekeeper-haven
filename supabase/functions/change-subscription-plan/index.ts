
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

    // Get user's subscription from the database
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, price_id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      throw new Error(`Error fetching subscription: ${subscriptionError.message}`);
    }

    if (!subscriptionData?.stripe_subscription_id) {
      throw new Error('No active subscription found');
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

    // Get the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionData.stripe_subscription_id);
    
    // Determine subscription type
    const subscriptionType = newPriceId === "price_monthly" ? "monthly" : "yearly";
    
    // Update the subscription to the new price
    await stripe.subscriptions.update(
      subscriptionData.stripe_subscription_id,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
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
