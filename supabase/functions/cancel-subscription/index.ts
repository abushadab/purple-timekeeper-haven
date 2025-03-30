
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
    // Initialize regular Supabase client for authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('User not authenticated');
    }

    console.log(`Processing cancellation request for user: ${user.id}`);

    // Create a second client with service role key to bypass RLS
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    // Get user's subscription from the database using service role client
    const { data: subscriptionData, error: subscriptionError } = await adminSupabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, status, current_period_end, subscription_type')
      .eq('auth_user_id', user.id)  // Still only allow access to the user's own data
      .maybeSingle();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      throw new Error(`Error fetching subscription: ${subscriptionError.message}`);
    }

    if (!subscriptionData) {
      console.error('No subscription found for user:', user.id);
      return new Response(
        JSON.stringify({ 
          error: 'No subscription found for this user',
          code: 'subscription_not_found'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    if (!subscriptionData.stripe_subscription_id) {
      console.error('No Stripe subscription ID found for subscription');
      return new Response(
        JSON.stringify({ 
          error: 'No Stripe subscription ID found for this subscription',
          code: 'missing_stripe_id'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check if the subscription is already canceled
    if (subscriptionData.status === 'canceled') {
      console.log('Subscription is already canceled');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Subscription is already canceled',
          data: {
            status: 'canceled',
            current_period_end: subscriptionData.current_period_end
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    try {
      // Cancel the subscription at period end in Stripe
      console.log(`Canceling Stripe subscription: ${subscriptionData.stripe_subscription_id}`);
      const canceledSubscription = await stripe.subscriptions.update(
        subscriptionData.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );

      console.log(`Stripe subscription updated. New status: ${canceledSubscription.status}`);

      // Update the subscription status in the database using service role client
      const { error: updateError } = await adminSupabase
        .from('user_subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('auth_user_id', user.id);  // Still only allow update to the user's own data

      if (updateError) {
        console.error('Error updating subscription status:', updateError);
        throw new Error(`Error updating subscription status: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Subscription has been canceled successfully',
          data: {
            status: 'canceled',
            current_period_end: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      
      // Special handling for free trials which might not have a valid Stripe subscription
      if (subscriptionData.subscription_type === 'free_trial') {
        console.log('Handling free trial cancellation');
        
        // Directly update the database for free trials without calling Stripe
        const { error: updateError } = await adminSupabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('auth_user_id', user.id);  // Still only allow update to the user's own data

        if (updateError) {
          console.error('Error updating trial subscription status:', updateError);
          throw new Error(`Error updating trial subscription status: ${updateError.message}`);
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Free trial has been canceled successfully',
            data: {
              status: 'canceled',
              current_period_end: subscriptionData.current_period_end,
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      throw stripeError;
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
