
import { Subscription } from "./types";

// Helper function to determine if a subscription is active
export const isSubscriptionActive = (sub: Subscription | null): boolean => {
  if (!sub) return false;
  
  // Check both status and expiration date
  const validStatus = ['active', 'trialing', 'canceled'].includes(sub.status);
  const notExpired = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) > new Date() : false;
  
  return validStatus && notExpired;
};

// Helper function to check if a subscription is expired
export const isSubscriptionExpired = (sub: Subscription | null): boolean => {
  if (!sub) return false;
  return sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) < new Date() : false;
};

// Function to handle expired subscriptions in the UI without changing database status
export const getUISubscriptionStatus = (sub: Subscription | null): string => {
  if (!sub) return 'canceled';
  
  // If the period end date is in the past, treat as expired in the UI regardless of status
  if (isSubscriptionExpired(sub)) {
    return 'canceled'; // Use 'canceled' in the UI when expired
  }
  
  return sub.status;
};

// Parse database subscription data into Subscription interface
export const parseSubscriptionData = (data: any): Subscription => {
  return {
    id: data.id,
    status: data.status,
    subscriptionType: data.subscription_type,
    currentPeriodEnd: data.current_period_end,
    currentPeriodStart: data.current_period_start,
    priceId: data.price_id,
  };
};

