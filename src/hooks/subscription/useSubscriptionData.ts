
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Subscription } from './types';
import { isSubscriptionActive, parseSubscriptionData } from './utils';
import { saveSubscriptionToCache, getSubscriptionFromCache, clearSubscriptionCache } from './cache';

export const useSubscriptionData = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const fetchSubscription = async (skipCache = false) => {
    if (!user) {
      setSubscription(null);
      setHasActiveSubscription(false);
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching subscription for user:", user.id);
      
      // Check for cached subscription data first (only use if it's recent)
      const { subscription: cachedSubscription, isCacheValid } = getSubscriptionFromCache();
      
      // If we have fresh cached data and we're not on the subscription page and we're not skipping cache
      const isSubscriptionPage = window.location.pathname.includes('subscription');
      if (cachedSubscription && isCacheValid && !isSubscriptionPage && !skipCache) {
        console.log("Using cached subscription data");
        
        setSubscription(cachedSubscription);
        
        // Use the helper function to determine active status
        setHasActiveSubscription(isSubscriptionActive(cachedSubscription));
        console.log("Calculated hasActiveSubscription from cache:", isSubscriptionActive(cachedSubscription));
      }
      
      // Always fetch fresh data if we're skipping cache, on subscription pages, or cache is invalid
      if (!cachedSubscription || !isCacheValid || isSubscriptionPage || skipCache) {
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
          
          if (!cachedSubscription || !isCacheValid) {
            setSubscription(null);
            setHasActiveSubscription(false);
          }
        } else if (data) {
          console.log("Fresh subscription data:", data);
          
          // Create the subscription data object
          const subscriptionData = parseSubscriptionData(data);
          
          // Cache the subscription data
          saveSubscriptionToCache(data);
          
          setSubscription(subscriptionData);
          
          // Use the helper function to determine active status
          const isActive = isSubscriptionActive(subscriptionData);
          setHasActiveSubscription(isActive);
          console.log("Calculated hasActiveSubscription:", isActive, "Period end:", data.current_period_end, "Current date:", new Date().toISOString());
        } else {
          console.log("No subscription found for user");
          
          // Clear cached data if no subscription found
          clearSubscriptionCache();
          
          setSubscription(null);
          setHasActiveSubscription(false);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      
      // Only set to null if we don't have cached data or we're skipping cache
      const { subscription: cachedSubscription, isCacheValid } = getSubscriptionFromCache();
      const longCacheValid = isCacheValid || (cachedSubscription && Date.now() - parseInt(localStorage.getItem('subscription_data_time') || '0') < 300000); // 5 minutes
      
      if (!cachedSubscription || !longCacheValid || skipCache) {
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
      clearSubscriptionCache();
      setLoading(true);
      fetchSubscription(true); // Skip cache when manually refreshing
    }
  };
};

