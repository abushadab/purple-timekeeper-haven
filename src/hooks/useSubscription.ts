
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'none' | 'expired';

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  subscriptionType: string;
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  priceId?: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Helper function to determine if a subscription is active
  const isSubscriptionActive = (sub: Subscription | null): boolean => {
    if (!sub) return false;
    
    // Check both status and expiration date
    const validStatus = ['active', 'trialing', 'canceled'].includes(sub.status);
    const notExpired = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) > new Date() : false;
    
    return validStatus && notExpired;
  };

  // Helper function to check if a subscription is expired
  const isSubscriptionExpired = (sub: Subscription | null): boolean => {
    if (!sub) return false;
    return sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) < new Date() : false;
  };

  // Function to update the status in the database if needed
  const updateExpiredStatus = async (sub: Subscription) => {
    // Only proceed if the subscription exists, has an end date, and is expired
    if (!sub || !sub.currentPeriodEnd) return;
    
    const isExpired = new Date(sub.currentPeriodEnd) < new Date();
    
    // If expired but status isn't 'expired', update it in the database
    if (isExpired && sub.status !== 'expired') {
      console.log("Subscription expired, updating status in database...");
      
      try {
        const { error } = await supabase
          .from('user_subscriptions')
          .update({ status: 'expired' })
          .eq('id', sub.id);
          
        if (error) {
          console.error("Error updating subscription status:", error);
        } else {
          console.log("Subscription status updated to 'expired'");
          // Update the local state
          setSubscription({
            ...sub,
            status: 'expired'
          });
        }
      } catch (error) {
        console.error("Unexpected error updating status:", error);
      }
    }
  };

  const fetchSubscription = async (skipCache = false) => {
    if (!user) {
      setSubscription(null);
      setHasActiveSubscription(false);
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching subscription for user:", user.id);
      
      // Check for cached subscription data first (but only use if it's recent - within last minute)
      const cachedData = localStorage.getItem('subscription_data');
      const cachedTime = localStorage.getItem('subscription_data_time');
      const now = Date.now();
      const cacheAge = cachedTime ? now - parseInt(cachedTime) : Infinity;
      const cacheValid = cacheAge < 30000; // 30 seconds, reduced from 1 minute for more frequent checks
      
      // If we have fresh cached data and we're not on the subscription success page and we're not skipping cache
      const isSubscriptionPage = window.location.pathname.includes('subscription');
      if (cachedData && cacheValid && !isSubscriptionPage && !skipCache) {
        console.log("Using cached subscription data");
        const data = JSON.parse(cachedData);
        
        const subscriptionData = {
          id: data.id,
          status: data.status as SubscriptionStatus,
          subscriptionType: data.subscription_type,
          currentPeriodEnd: data.current_period_end,
          currentPeriodStart: data.current_period_start,
          priceId: data.price_id,
        };
        
        // Check if subscription is expired and update status if needed
        if (isSubscriptionExpired(subscriptionData) && subscriptionData.status !== 'expired') {
          updateExpiredStatus(subscriptionData);
        } else {
          setSubscription(subscriptionData);
        }
        
        // Use the helper function to determine active status
        setHasActiveSubscription(isSubscriptionActive(subscriptionData));
        console.log("Calculated hasActiveSubscription from cache:", isSubscriptionActive(subscriptionData));
      }
      
      // Always fetch fresh data if we're skipping cache, on subscription pages, or cache is invalid
      if (!cachedData || !cacheValid || isSubscriptionPage || skipCache) {
        // Fetch data from the database
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch subscription status.',
            variant: 'destructive',
          });
          
          if (!cachedData || !cacheValid) {
            setSubscription(null);
            setHasActiveSubscription(false);
          }
        } else if (data) {
          console.log("Fresh subscription data:", data);
          
          // Create the subscription data object
          const subscriptionData = {
            id: data.id,
            status: data.status as SubscriptionStatus,
            subscriptionType: data.subscription_type,
            currentPeriodEnd: data.current_period_end,
            currentPeriodStart: data.current_period_start,
            priceId: data.price_id,
          };
          
          // Check if subscription is expired and update status if needed
          if (isSubscriptionExpired(subscriptionData) && subscriptionData.status !== 'expired') {
            updateExpiredStatus(subscriptionData);
          } else {
            // Cache the subscription data
            localStorage.setItem('subscription_data', JSON.stringify(data));
            localStorage.setItem('subscription_data_time', now.toString());
            
            setSubscription(subscriptionData);
          }
          
          // Use the helper function to determine active status
          const isActive = isSubscriptionActive(subscriptionData);
          setHasActiveSubscription(isActive);
          console.log("Calculated hasActiveSubscription:", isActive, "Period end:", data.current_period_end, "Current date:", new Date().toISOString());
        } else {
          console.log("No subscription found for user");
          
          // Clear cached data if no subscription found
          localStorage.removeItem('subscription_data');
          localStorage.removeItem('subscription_data_time');
          
          setSubscription(null);
          setHasActiveSubscription(false);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      
      // Only set to null if we don't have cached data or we're skipping cache
      const cachedData = localStorage.getItem('subscription_data');
      const cachedTime = localStorage.getItem('subscription_data_time');
      const cacheValid = cachedTime && (Date.now() - parseInt(cachedTime)) < 300000; // 5 minutes
      
      if (!cachedData || !cacheValid || skipCache) {
        setSubscription(null);
        setHasActiveSubscription(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    
    // Set up a subscription listener to refresh data when the table changes
    const channel = supabase
      .channel('subscription-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_subscriptions',
        filter: `auth_user_id=eq.${user?.id}`,
      }, (payload) => {
        console.log('Subscription data changed:', payload);
        fetchSubscription(true); // Skip cache when data changes
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    subscription,
    loading,
    hasActiveSubscription,
    refreshSubscription: () => {
      // Force clear the cache and fetch fresh data
      localStorage.removeItem('subscription_data');
      localStorage.removeItem('subscription_data_time');
      setLoading(true);
      fetchSubscription(true); // Skip cache when manually refreshing
    },
    isSubscriptionActive, // Export the helper function for use in other components
    isSubscriptionExpired // Export helper to check if subscription is expired
  };
};
