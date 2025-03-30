
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Subscription } from './types';
import { isSubscriptionActive, parseSubscriptionData } from './utils';
import { saveSubscriptionToCache, getSubscriptionFromCache, clearSubscriptionCache } from './cache';

// Global in-memory cache to prevent duplicate requests across components
let globalFetchPromise: Promise<any> | null = null;
let lastFetchTime = 0;
const FETCH_COOLDOWN = 2000; // 2 seconds cooldown between fetches

export const useSubscriptionData = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const mountedRef = useRef(true);

  const fetchSubscription = async (skipCache = false) => {
    if (!user) {
      if (mountedRef.current) {
        setSubscription(null);
        setHasActiveSubscription(false);
        setLoading(false);
      }
      return;
    }

    try {
      console.log("Fetching subscription for user:", user.id);
      
      // Check for cached subscription data first (only use if it's recent)
      const { subscription: cachedSubscription, isCacheValid } = getSubscriptionFromCache();
      
      // If we have fresh cached data and we're not skipping cache
      if (cachedSubscription && isCacheValid && !skipCache) {
        console.log("Using cached subscription data");
        
        if (mountedRef.current) {
          setSubscription(cachedSubscription);
          
          // Use the helper function to determine active status
          setHasActiveSubscription(isSubscriptionActive(cachedSubscription));
          console.log("Calculated hasActiveSubscription from cache:", isSubscriptionActive(cachedSubscription));
        }
      }
      
      // Check if we should fetch from the server
      const shouldFetch = !cachedSubscription || !isCacheValid || skipCache;
      
      // Check if we're within cooldown period
      const now = Date.now();
      const isWithinCooldown = now - lastFetchTime < FETCH_COOLDOWN;
      
      // Always fetch fresh data if we're skipping cache or cache is invalid
      if (shouldFetch) {
        // If there's already a fetch in progress, use that promise
        if (globalFetchPromise && !skipCache && isWithinCooldown) {
          console.log("Using existing fetch promise");
          const data = await globalFetchPromise;
          
          if (data && mountedRef.current) {
            // Create the subscription data object
            const subscriptionData = parseSubscriptionData(data);
            setSubscription(subscriptionData);
            
            // Use the helper function to determine active status
            const isActive = isSubscriptionActive(subscriptionData);
            setHasActiveSubscription(isActive);
          }
        } else {
          // Start a new fetch
          lastFetchTime = now;
          
          // Create a new promise for this fetch
          globalFetchPromise = supabase
            .from('user_subscriptions')
            .select('*')
            .eq('auth_user_id', user.id)
            .maybeSingle()
            .then(({ data, error }) => {
              if (error) {
                console.error('Error fetching subscription:', error);
                if (mountedRef.current) {
                  toast({
                    title: 'Error',
                    description: 'Failed to fetch subscription status.',
                    variant: 'destructive',
                  });
                }
                return null;
              }
              
              if (data) {
                console.log("Fresh subscription data:", data);
                // Cache the subscription data
                saveSubscriptionToCache(data);
                return data;
              }
              
              console.log("No subscription found for user");
              // Clear cached data if no subscription found
              clearSubscriptionCache();
              return null;
            });
          
          // Wait for the promise to resolve
          const data = await globalFetchPromise;
          
          // After a while, clear the global promise to allow new fetches
          setTimeout(() => {
            globalFetchPromise = null;
          }, FETCH_COOLDOWN);
          
          if (mountedRef.current) {
            if (data) {
              // Create the subscription data object
              const subscriptionData = parseSubscriptionData(data);
              setSubscription(subscriptionData);
              
              // Use the helper function to determine active status
              const isActive = isSubscriptionActive(subscriptionData);
              setHasActiveSubscription(isActive);
              console.log("Calculated hasActiveSubscription:", isActive, "Period end:", data.current_period_end, "Current date:", new Date().toISOString());
            } else {
              setSubscription(null);
              setHasActiveSubscription(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      
      // Only set to null if we don't have cached data or we're skipping cache
      const { subscription: cachedSubscription, isCacheValid } = getSubscriptionFromCache();
      const longCacheValid = isCacheValid || (cachedSubscription && Date.now() - parseInt(localStorage.getItem('subscription_data_time') || '0') < 300000); // 5 minutes
      
      if ((!cachedSubscription || !longCacheValid || skipCache) && mountedRef.current) {
        setSubscription(null);
        setHasActiveSubscription(false);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
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
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
