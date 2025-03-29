
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, Crown, ArrowUpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SubscriptionManagement = () => {
  const { subscription, loading, hasActiveSubscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  const getStatusBadge = () => {
    if (!subscription) return null;

    switch (subscription.status) {
      case "active":
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
            <CheckCircle size={16} />
            <span>Active</span>
          </div>
        );
      case "trialing":
        return (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
            <Clock size={16} />
            <span>Trial</span>
          </div>
        );
      case "canceled":
        return (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
            <AlertTriangle size={16} />
            <span>Canceled</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
            <span>{subscription.status}</span>
          </div>
        );
    }
  };

  const handleUpgrade = async () => {
    if (!subscription) return;
    
    setIsLoading(true);
    try {
      // Redirect to pricing page if the user doesn't have a paid plan
      if (subscription.subscriptionType === "free_trial") {
        navigate("/pricing");
        return;
      }
      
      // For paid plans that want to upgrade/downgrade, create a checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId: "price_monthly", isUpgrade: true }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast({
        title: "Upgrade failed",
        description: error.message || "Failed to upgrade subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("cancel-subscription", {
        body: { subscriptionId: subscription.id }
      });

      if (error) throw new Error(error.message);
      
      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled. You'll have access until the end of your current billing period.",
      });
      
      setCancelDialogOpen(false);
      
      // Refresh subscription data
      window.location.reload();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 container py-12 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Subscription Management</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                You don't have an active subscription yet.
              </p>
            </div>
            
            <Card className="w-full shadow-lg border-purple-200">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-xl font-bold">Get Started Today</CardTitle>
                <CardDescription>Choose a plan to unlock all features</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button onClick={() => navigate('/pricing')} className="flex items-center gap-2">
                  <Crown size={18} />
                  View Pricing Plans
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 container py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Subscription Management</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your TimeTrack subscription
            </p>
          </div>
          
          <Card className="w-full shadow-lg border-purple-200">
            <CardHeader className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-xl font-bold">
                  {subscription.subscriptionType.charAt(0).toUpperCase() + subscription.subscriptionType.slice(1).replace('_', ' ')} Plan
                </CardTitle>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Current Period Started</p>
                    <p>{formatDate(subscription.currentPeriodStart)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Current Period Ends</p>
                    <p>{formatDate(subscription.currentPeriodEnd)}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Subscription ID</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{subscription.id}</p>
                </div>
                
                {subscription.status === "canceled" && (
                  <div className="rounded-lg bg-amber-50 p-4 text-amber-800 border border-amber-200">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Subscription Canceled
                    </h4>
                    <p className="text-sm mt-1">
                      Your subscription has been canceled and will not renew. You'll have access until {formatDate(subscription.currentPeriodEnd)}.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              {subscription.status !== "canceled" && (
                <>
                  {subscription.subscriptionType === "free_trial" ? (
                    <Button 
                      onClick={handleUpgrade} 
                      disabled={isLoading}
                      className="flex-1 flex items-center gap-2"
                    >
                      <Crown size={18} />
                      Upgrade to Paid Plan
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleUpgrade} 
                      disabled={isLoading} 
                      className="flex-1 flex items-center gap-2"
                      variant="outline"
                    >
                      <ArrowUpCircle size={18} />
                      Change Plan
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => setCancelDialogOpen(true)} 
                    disabled={isLoading} 
                    variant="outline" 
                    className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
              
              {subscription.status === "canceled" && (
                <Button 
                  onClick={handleUpgrade} 
                  disabled={isLoading}
                  className="flex-1 flex items-center gap-2"
                >
                  <Crown size={18} />
                  Resubscribe
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="text-center mt-8 text-muted-foreground">
            <p>Have questions about your subscription?</p>
            <Button variant="link" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
      
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You'll have access to all features until the end of your current billing period on {formatDate(subscription.currentPeriodEnd)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep my subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelSubscription();
              }}
              className="bg-red-500 hover:bg-red-600"
              disabled={isLoading}
            >
              {isLoading ? "Canceling..." : "Yes, cancel subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionManagement;
