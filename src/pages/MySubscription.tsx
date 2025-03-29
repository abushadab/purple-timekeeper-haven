
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useSubscription } from "@/hooks/useSubscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import SubscriptionDetails from "@/components/subscription/SubscriptionDetails";
import BillingHistory from "@/components/subscription/BillingHistory";
import { useSubscriptionActions } from "@/components/subscription/SubscriptionActions";
import { useBillingHistory } from "@/components/subscription/useBillingHistory";

const MySubscription = () => {
  const { 
    subscription, 
    loading, 
    hasActiveSubscription, 
    isSubscriptionExpired,
    getUISubscriptionStatus 
  } = useSubscription();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { 
    isCancelling, 
    isChangingPlan, 
    handleCancelSubscription, 
    handleChangePlan, 
    handleCheckout,
    handleDownloadInvoice 
  } = useSubscriptionActions();
  const { billingHistory, billingHistoryLoading } = useBillingHistory(subscription);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("MySubscription - Subscription data:", subscription);
    if (subscription) {
      console.log("Subscription expired?", isSubscriptionExpired(subscription));
      console.log("UI Status:", getUISubscriptionStatus(subscription));
    }
  }, [subscription, isSubscriptionExpired, getUISubscriptionStatus]);

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

  // Determine subscription state for UI display
  const isActuallyExpired = subscription ? isSubscriptionExpired(subscription) : false;
  
  const isTrialActive = subscription?.status === 'trialing' && 
    subscription?.currentPeriodEnd && 
    new Date(subscription.currentPeriodEnd) >= new Date();
    
  const isTrialExpired = subscription?.status === 'trialing' && 
    subscription?.currentPeriodEnd && 
    new Date(subscription.currentPeriodEnd) < new Date();

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
                handleCheckout={handleCheckout}
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
