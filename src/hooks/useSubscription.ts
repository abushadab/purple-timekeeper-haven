
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'none';

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

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
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
          setSubscription(null);
        } else if (data) {
          setSubscription({
            id: data.id,
            status: data.status as SubscriptionStatus,
            subscriptionType: data.subscription_type,
            currentPeriodEnd: data.current_period_end,
            currentPeriodStart: data.current_period_start,
            priceId: data.price_id,
          });
        } else {
          setSubscription(null);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, toast]);

  const hasActiveSubscription = subscription && 
    (subscription.status === 'active' || 
     subscription.status === 'trialing' || 
     (subscription.status === 'canceled' && subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) > new Date()));

  return {
    subscription,
    loading,
    hasActiveSubscription
  };
};
