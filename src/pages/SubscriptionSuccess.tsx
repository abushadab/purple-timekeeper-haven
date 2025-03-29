
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const subscriptionType = searchParams.get("type");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateSubscriptionRecord = async () => {
      if (!user || !sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Processing subscription update with session ID:", sessionId);
        console.log("Subscription type from URL:", subscriptionType);
        
        // Get session data from Stripe through our edge function
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke("verify-checkout-session", {
          body: { sessionId }
        });
        
        if (sessionError) {
          throw new Error(`Error verifying checkout session: ${sessionError.message}`);
        }
        
        if (!sessionData) {
          throw new Error("Failed to retrieve session data from Stripe");
        }
        
        console.log("Retrieved session data:", sessionData);
        
        // Determine the subscription type from the session data or URL parameter
        const finalSubscriptionType = sessionData.subscription_type || subscriptionType || 'monthly';
        
        // Check if the user already has a subscription
        const { data: existingSubscription, error: fetchError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          throw new Error(`Error fetching existing subscription: ${fetchError.message}`);
        }

        // Create or update the subscription record with data from the session
        const subscriptionData = {
          auth_user_id: user.id,
          status: sessionData.status || 'active',
          subscription_type: finalSubscriptionType,
          stripe_subscription_id: sessionData.subscription || sessionId,
          price_id: sessionData.price_id || null,
          current_period_start: sessionData.current_period_start || new Date().toISOString(),
          current_period_end: sessionData.current_period_end || new Date(Date.now() + (finalSubscriptionType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
        };

        // Use the service role client to bypass RLS if needed (for troubleshooting)
        let updateResult;

        try {
          if (existingSubscription) {
            console.log("Updating existing subscription:", existingSubscription.id);
            // Update existing subscription
            const { data, error } = await supabase
              .from('user_subscriptions')
              .update(subscriptionData)
              .eq('id', existingSubscription.id)
              .select();
              
            if (error) throw error;
            updateResult = data;
          } else {
            console.log("Creating new subscription record");
            // Create new subscription
            const { data, error } = await supabase
              .from('user_subscriptions')
              .insert([subscriptionData])
              .select();
              
            if (error) throw error;
            updateResult = data;
          }
        } catch (error: any) {
          console.error("Database operation error:", error);
          setError(error.message);
          throw error;
        }
        
        console.log("Subscription updated successfully:", updateResult);
        
        // Clear subscription cache to force a refresh
        localStorage.removeItem('subscription_data');
        localStorage.removeItem('subscription_data_time');

        toast({
          title: "Subscription activated",
          description: "Your subscription has been successfully activated.",
        });
      } catch (error: any) {
        console.error("Error processing subscription:", error);
        setError(error.message);
        toast({
          title: "Subscription update issue",
          description: `There was an error activating your subscription: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    updateSubscriptionRecord();
  }, [user, sessionId, subscriptionType, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 container py-12 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Subscription {isLoading ? "Processing" : "Successful"}!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-muted-foreground">
              {isLoading ? (
                <p>Processing your subscription...</p>
              ) : error ? (
                <>
                  <p className="mb-2 text-red-500">
                    There was a problem with your subscription:
                  </p>
                  <p className="text-sm bg-red-50 p-2 rounded border border-red-200">
                    {error}
                  </p>
                  <p className="mt-2">
                    Please contact support if this issue persists.
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-2">
                    Thank you for subscribing to TimeTrack {subscriptionType === 'monthly' ? 'Monthly' : 'Yearly'} Plan.
                  </p>
                  <p>
                    Your subscription is now active and you have full access to all features.
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-center pt-4">
              <Button 
                onClick={() => navigate('/')}
                className="purple-gradient text-white"
                disabled={isLoading}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
