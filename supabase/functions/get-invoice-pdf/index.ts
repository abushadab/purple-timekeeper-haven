
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
    const { invoiceId } = await req.json();
    
    if (!invoiceId) {
      throw new Error('Invoice ID is required');
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

    // Get user's subscription from the database to verify access
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      throw new Error(`Error fetching subscription: ${subscriptionError.message}`);
    }

    if (!subscriptionData?.stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    // Fetch the invoice to ensure it belongs to this user
    const invoice = await stripe.invoices.retrieve(invoiceId);
    
    // Get customer ID from the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionData.stripe_subscription_id);
    const customerId = subscription.customer;
    
    // Verify the invoice belongs to this customer
    if (invoice.customer !== customerId) {
      throw new Error('Unauthorized access to invoice');
    }

    // Generate invoice PDF
    const invoicePdf = await stripe.invoices.retrievePdf(invoiceId);
    
    // Return the PDF URL
    return new Response(
      JSON.stringify({ 
        pdfUrl: invoice.invoice_pdf,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error retrieving invoice PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
