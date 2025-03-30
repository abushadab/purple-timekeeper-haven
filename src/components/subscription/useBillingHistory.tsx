
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from '@/hooks/useSubscription';

export function useBillingHistory(subscription: Subscription | null) {
  const [billingHistory, setBillingHistory] = useState([]);
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(true);
  const { toast } = useToast();
  const hasAttemptedFetch = useRef(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (subscription?.id && !hasAttemptedFetch.current) {
      fetchBillingHistory();
    } else if (!subscription?.id) {
      setBillingHistoryLoading(false);
      setBillingHistory([]);
    }
  }, [subscription?.id]);

  const fetchBillingHistory = async () => {
    // Prevent multiple concurrent fetches
    if (fetchingRef.current) return;
    
    try {
      setBillingHistoryLoading(true);
      fetchingRef.current = true;
      hasAttemptedFetch.current = true;
      
      const { data, error } = await supabase.functions.invoke("get-billing-history");
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.invoices) {
        setBillingHistory(data.invoices);
      } else {
        setBillingHistory([]);
      }
    } catch (error) {
      console.error("Error fetching billing history:", error);
      // Only show the toast once, not on every failed attempt
      if (!hasAttemptedFetch.current) {
        toast({
          title: "Billing History",
          description: "We couldn't load your billing history at this time. Please try again later.",
          variant: "destructive",
        });
      }
      setBillingHistory([]);
    } finally {
      setBillingHistoryLoading(false);
      fetchingRef.current = false;
    }
  };

  return { billingHistory, billingHistoryLoading, fetchBillingHistory };
}
