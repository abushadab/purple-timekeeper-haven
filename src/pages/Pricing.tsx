
import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

const PricingTier = ({
  name,
  price,
  billingPeriod,
  description,
  features,
  popularBadge = false,
  onSelect,
  buttonText = "Subscribe",
  disabled = false,
  loading = false
}) => {
  return (
    <Card className={`w-full max-w-sm border relative ${popularBadge ? "border-purple-400 shadow-lg" : "border-gray-200"}`}>
      <CardHeader className="space-y-1 text-center">
        {popularBadge && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-purple-100 text-purple-800">
            Popular
          </Badge>
        )}
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <div className="flex justify-center items-baseline my-2">
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-sm text-muted-foreground ml-1">/{billingPeriod}</span>
        </div>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onSelect}
          disabled={disabled || loading}
          variant={popularBadge ? "default" : "outline"}
        >
          {loading ? "Processing..." : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Pricing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchParams] = useSearchParams();
  const trialStarted = searchParams.get("trial") === "started";
  const { hasActiveSubscription, loading: subscriptionLoading, subscription } = useSubscription();

  // Display a success message if redirected from trial start
  useEffect(() => {
    if (trialStarted) {
      toast({
        title: "Free trial activated",
        description: "Your 7-day free trial has been successfully activated.",
      });
      
      // Navigate to the home page after showing toast
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    }
  }, [trialStarted, toast, navigate]);

  // Redirect if user already has a subscription
  useEffect(() => {
    if (!subscriptionLoading && hasActiveSubscription) {
      navigate('/');
    }
  }, [hasActiveSubscription, subscriptionLoading, navigate]);

  const handleSubscription = async (planType) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to subscribe to a plan",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setSelectedPlan(planType);

    try {
      // Call the Supabase Edge Function to create a Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId: planType }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Subscription failed",
        description: error.message || "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  // Show loading state while checking subscription
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 container py-12 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Display subscription details if user has one
  if (subscription && !trialStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 container py-8 px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Current Subscription</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                You're currently subscribed to the {subscription.subscriptionType} plan.
              </p>
            </div>
            
            <Card className="w-full shadow-lg border-purple-200">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-bold">
                  {subscription.subscriptionType.charAt(0).toUpperCase() + subscription.subscriptionType.slice(1)} Plan
                </CardTitle>
                <CardDescription>
                  Status: <span className="font-medium text-green-600">{subscription.status}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription.currentPeriodEnd && (
                  <div className="text-sm">
                    <span className="font-medium">Current period ends:</span>{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                )}
                <div className="flex justify-center mt-4">
                  <Button onClick={() => navigate('/')}>
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8 text-muted-foreground">
              <p>Need to change your plan or have questions about your subscription?</p>
              <Button variant="link" onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 container py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Choose Your TimeTrack Plan</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the perfect plan to boost your productivity and track your time more efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 py-8">
            <PricingTier
              name="Free Trial"
              price="0"
              billingPeriod="7 days"
              description="Try TimeTrack for free for 7 days"
              features={[
                "Unlimited time tracking",
                "Basic reporting",
                "Basic project management",
                "1 portfolio"
              ]}
              buttonText="Start Free Trial"
              onSelect={() => handleSubscription("free_trial")}
              loading={isLoading && selectedPlan === "free_trial"}
            />

            <PricingTier
              name="Monthly"
              price="7"
              billingPeriod="month"
              description="Best for individuals and small teams"
              features={[
                "Unlimited time tracking",
                "Advanced reporting",
                "Unlimited projects",
                "Unlimited portfolios",
                "Team collaboration features",
                "Priority support"
              ]}
              popularBadge={true}
              onSelect={() => handleSubscription("price_monthly")}
              loading={isLoading && selectedPlan === "price_monthly"}
            />

            <PricingTier
              name="Yearly"
              price="63"
              billingPeriod="year"
              description="Save 25% with annual billing"
              features={[
                "All Monthly plan features",
                "Data export capabilities",
                "API access",
                "Advanced analytics",
                "Custom integrations",
                "Dedicated account manager"
              ]}
              onSelect={() => handleSubscription("price_yearly")}
              loading={isLoading && selectedPlan === "price_yearly"}
            />
          </div>

          <div className="text-center mt-8 space-y-4 bg-muted rounded-lg p-6">
            <div className="flex justify-center">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold">All plans include</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="flex flex-col items-center p-3">
                <Check className="text-green-500 mb-2" />
                <span className="text-sm text-center">Time tracking</span>
              </div>
              <div className="flex flex-col items-center p-3">
                <Check className="text-green-500 mb-2" />
                <span className="text-sm text-center">Project management</span>
              </div>
              <div className="flex flex-col items-center p-3">
                <Check className="text-green-500 mb-2" />
                <span className="text-sm text-center">Task tracking</span>
              </div>
              <div className="flex flex-col items-center p-3">
                <Check className="text-green-500 mb-2" />
                <span className="text-sm text-center">Mobile access</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Enterprise Plan
            </h3>
            <p className="text-muted-foreground mb-4">
              Need a custom plan for your large organization?
            </p>
            <Button variant="outline" onClick={() => navigate("/contact")}>
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
