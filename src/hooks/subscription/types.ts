
import { SubscriptionStatus } from "../useSubscription";

export type { SubscriptionStatus };

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  subscriptionType: string;
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  priceId?: string;
}

