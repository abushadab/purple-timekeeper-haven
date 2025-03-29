
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useSubscription } from "@/hooks/useSubscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SubscriptionDetails from "@/components/subscription/SubscriptionDetails";
import BillingHistory from "@/components/subscription/BillingHistory";
import PricingOptions from "@/components/subscription/PricingOptions";

const MySubscription = () => {
  const { 
    subscription, 
    loading, 
    hasActiveSubscription, 
    isSubscriptionExpired,
    getUISubscriptionStatus 
  } = useSubscription();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("MySubscription - Subscription data:", subscription);
    if (subscription) {
      console.log("Subscription expired?", isSubscriptionExpired(subscription));
      console.log("UI Status:", getUISubscriptionStatus(subscription));
    }
  }, [subscription, isSubscriptionExpired, getUISubscriptionStatus]);

  useEffect(() => {
    if (subscription?.id) {
      fetchBillingHistory();
    } else {
      setBillingHistoryLoading(false);
    }
  }, [subscription]);

  // Get the UI-friendly status for display
  const uiStatus = subscription ? getUISubscriptionStatus(subscription) : null;
  
  // Determine subscription state for UI display
  const isActuallyExpired = subscription ? isSubscriptionExpired(subscription) : false;
  
  const isTrialActive = subscription?.status === 'trialing' && 
    subscription?.currentPeriodEnd && 
    new Date(subscription.currentPeriodEnd) >= new Date();
    
  const isTrialExpired = subscription?.status === 'trialing' && 
    subscription?.currentPeriodEnd && 
    new Date(subscription.currentPeriodEnd) < new Date();

  const fetchBillingHistory = async () => {
    try {
      setBillingHistoryLoading(true);
      
      const { data, error } = await supabase.functions.invoke("get-billing-history");
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.invoices) {
        setBillingHistory(data.invoices);
      }
    } catch (error) {
      console.error("Error fetching billing history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch billing history",
        variant: "destructive",
      });
    } finally {
      setBillingHistoryLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      
      const { data, error } = await supabase.functions.invoke("cancel-subscription");
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled. You will still have access until the end of your current billing period.",
      });
      
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleChangePlan = async (newPlanId) => {
    try {
      setIsChangingPlan(true);
      
      const { data, error } = await supabase.functions.invoke("change-subscription-plan", {
        body: { newPriceId: newPlanId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      
      toast({
        title: "Plan updated",
        description: "Your subscription plan has been updated successfully.",
      });
      
      window.location.reload();
    } catch (error) {
      console.error("Error changing plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change subscription plan",
        variant: "destructive",
      });
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleCheckout = async (planType) => {
    try {
      setSelectedPlan(planType);
      setIsChangingPlan(true);
      
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { 
          priceId: planType,
          returnUrl: "/my-subscription"
        }
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
      console.error("Error creating checkout session:", error);
      toast({
        title: "Subscription failed",
        description: error.message || "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPlan(false);
      setSelectedPlan(null);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const { data, error } = await supabase.functions.invoke("get-invoice-pdf", {
        body: { invoiceId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      } else {
        throw new Error("No PDF URL returned");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 container py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
            <p className="text-muted-foreground">Manage your subscription and billing</p>
          </div>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Subscription Details</TabsTrigger>
              <TabsTrigger value="history">Billing History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4">
              <SubscriptionDetails 
                subscription={subscription}
                isActuallyExpired={isActuallyExpired}
                isTrialActive={isTrialActive}
                isTrialExpired={isTrialExpired}
                isChangingPlan={isChangingPlan}
                setConfirmDialogOpen={setConfirmDialogOpen}
                handleChangePlan={handleChangePlan}
                isCancelling={isCancelling}
              />
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <BillingHistory 
                billingHistory={billingHistory}
                billingHistoryLoading={billingHistoryLoading}
                handleDownloadInvoice={handleDownloadInvoice}
              />
            </TabsContent>
          </Tabs>
          
          <div className="text-center mt-8 text-muted-foreground">
            <p className="text-sm">Need help with your subscription?</p>
            <Button variant="link" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
      
      <ConfirmDialog 
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription? You'll still have access until the end of your current billing period."
        onConfirm={handleCancelSubscription}
        confirmText="Cancel Subscription"
      />
    </div>
  );
};

export default MySubscription;
