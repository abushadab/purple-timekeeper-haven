
import { useSubscriptionData } from './subscription/useSubscriptionData';
import { isSubscriptionActive, isSubscriptionExpired, getUISubscriptionStatus } from './subscription/utils';
import { Subscription } from './subscription/types';

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';

export type { Subscription };

export const useSubscription = () => {
  const subscriptionData = useSubscriptionData();

  return {
    ...subscriptionData,
    isSubscriptionActive, // Export the helper function for use in other components
    isSubscriptionExpired, // Export helper to check if subscription is expired
    getUISubscriptionStatus // Export the function to get UI-friendly status
  };
};

