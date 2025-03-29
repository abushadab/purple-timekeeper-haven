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
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    console.log(`Verifying checkout session: ${sessionId}`);
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Retrieve the checkout session from Stripe with expanded subscription data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.items.data.price.product', 'line_items']
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    console.log(`Session status: ${session.status}`);
    
    if (session.status !== 'complete') {
      throw new Error('Checkout session is not complete');
    }
    
    // Get subscription details if available
    let subscriptionData = null;
    let subscriptionType = 'unknown';
    
    if (session.subscription) {
      const subscription = typeof session.subscription === 'string' 
        ? await stripe.subscriptions.retrieve(session.subscription, {
            expand: ['items.data.price.product']
          })
        : session.subscription;
      
      console.log(`Subscription retrieved: ${subscription.id}`);
      
      // Determine subscription type from metadata or product
      if (session.metadata?.type) {
        subscriptionType = session.metadata.type;
      } else if (subscription.items?.data[0]?.price) {
        // Get product details to determine subscription type
        const priceId = subscription.items.data[0].price.id;
        console.log(`Price ID: ${priceId}`);
        
        // Check if product name or ID contains monthly/yearly indicator
        const product = typeof subscription.items.data[0].price.product === 'string'
          ? await stripe.products.retrieve(subscription.items.data[0].price.product)
          : subscription.items.data[0].price.product;
          
        if (product) {
          const productName = product.name?.toLowerCase() || '';
          const productId = product.id?.toLowerCase() || '';
          
          if (productName.includes('monthly') || productId.includes('monthly') || priceId.includes('monthly')) {
            subscriptionType = 'monthly';
          } else if (productName.includes('yearly') || productId.includes('yearly') || priceId.includes('yearly')) {
            subscriptionType = 'yearly';
          }
        }
      }
      
      console.log(`Subscription type: ${subscriptionType}`);
      
      // Ensure we have the current period dates
      const currentPeriodStart = subscription.current_period_start 
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : new Date().toISOString();
        
      const currentPeriodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : new Date(Date.now() + (subscriptionType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();
      
      // Determine the correct status - only use valid status values from Stripe
      // Valid statuses according to Stripe: 'active', 'trialing', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid'
      let status = subscription.status;
      
      // Make sure we're using a valid status value
      if (!['active', 'trialing', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid'].includes(status)) {
        status = 'active'; // Default to active if we get an unexpected status
      }
      
      // If end date is in the past, set status to 'expired' only if we've validated this is allowed in our schema
      // Otherwise mark as 'canceled' which is a valid Stripe status
      if (new Date(currentPeriodEnd) < new Date()) {
        status = 'canceled';
        console.log("Setting status to 'canceled' because end date is in the past");
      }
      
      subscriptionData = {
        subscription: subscription.id,
        status: status,
        subscription_type: subscriptionType,
        price_id: subscription.items?.data[0]?.price?.id || '',
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        customer: subscription.customer,
      };
      
      console.log("Subscription period:", currentPeriodStart, "to", currentPeriodEnd);
      console.log("Final subscription status:", status);
    }
    
    // Return the session and subscription data
    const defaultPeriodEnd = new Date(Date.now() + (subscriptionType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();
    const currentDate = new Date().toISOString();
    
    // If no subscription data, create a default response
    const responseData = subscriptionData || { 
      subscription: session.id,
      status: 'active',
      subscription_type: session.metadata?.type || subscriptionType,
      current_period_start: currentDate,
      current_period_end: defaultPeriodEnd
    };
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
