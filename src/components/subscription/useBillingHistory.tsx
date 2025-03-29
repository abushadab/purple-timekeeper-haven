
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from '@/hooks/useSubscription';

export function useBillingHistory(subscription: Subscription | null) {
  const [billingHistory, setBillingHistory] = useState([]);
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (subscription?.id) {
      fetchBillingHistory();
    } else {
      setBillingHistoryLoading(false);
    }
  }, [subscription]);

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

  return { billingHistory, billingHistoryLoading, fetchBillingHistory };
}
