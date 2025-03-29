
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useSubscriptionActions() {
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      
      const { data, error } = await supabase.functions.invoke("cancel-subscription");
      
      if (error) {
        console.error("Error from cancel-subscription function:", error);
        throw new Error(error.message || "An error occurred while cancelling subscription");
      }
      
      if (data?.success) {
        toast({
          title: "Subscription cancelled",
          description: "Your subscription has been cancelled. You will still have access until the end of your current billing period.",
        });
        
        // Reload the page to reflect changes
        window.location.reload();
      } else if (data?.error) {
        if (data.code === 'subscription_not_found') {
          toast({
            title: "No active subscription",
            description: "You don't currently have an active subscription to cancel.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleChangePlan = async (newPlanId: string) => {
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

  const handleCheckout = async (planType: string) => {
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

  const handleDownloadInvoice = async (invoiceId: string) => {
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

  return {
    isCancelling,
    isChangingPlan,
    selectedPlan,
    handleCancelSubscription,
    handleChangePlan,
    handleCheckout,
    handleDownloadInvoice
  };
}
