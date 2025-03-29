
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

  useEffect(() => {
    const createSubscriptionRecord = async () => {
      if (!user || !sessionId || !subscriptionType) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if the user already has a subscription
        const { data: existingSubscription } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        // Create a new subscription record or update existing one
        const subscriptionData = {
          auth_user_id: user.id,
          status: 'active',
          subscription_type: subscriptionType,
          stripe_subscription_id: sessionId, // We'll use this for now, it will be updated by the webhook
          price_id: subscriptionType === 'monthly' ? 'price_monthly' : 'price_yearly',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (subscriptionType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
        };

        if (existingSubscription) {
          // Update existing subscription
          await supabase
            .from('user_subscriptions')
            .update(subscriptionData)
            .eq('id', existingSubscription.id);
        } else {
          // Create new subscription
          await supabase
            .from('user_subscriptions')
            .insert([subscriptionData]);
        }

        toast({
          title: "Subscription activated",
          description: "Your subscription has been successfully activated.",
        });
      } catch (error) {
        console.error("Error creating subscription record:", error);
        toast({
          title: "Error",
          description: "There was an error activating your subscription. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    createSubscriptionRecord();
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
            <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-muted-foreground">
              {isLoading ? (
                <p>Processing your subscription...</p>
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
