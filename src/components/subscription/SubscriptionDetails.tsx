
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { Subscription } from "@/hooks/useSubscription";
import PricingOptions from "./PricingOptions";

interface SubscriptionDetailsProps {
  subscription: Subscription | null;
  isActuallyExpired: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isChangingPlan: boolean;
  setConfirmDialogOpen: (open: boolean) => void;
  handleChangePlan: (planId: string) => Promise<void>;
  isCancelling: boolean;
}

const SubscriptionDetails = ({
  subscription,
  isActuallyExpired,
  isTrialActive,
  isTrialExpired,
  isChangingPlan,
  setConfirmDialogOpen,
  handleChangePlan,
  isCancelling
}: SubscriptionDetailsProps) => {
  return (
    <Card className="w-full shadow">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            {subscription ? 
              `${subscription.subscriptionType?.charAt(0).toUpperCase() + subscription.subscriptionType?.slice(1)} Plan`
              : "No Active Subscription"}
          </CardTitle>
          <Badge className={
            subscription?.status === 'active' && !isActuallyExpired ? 'bg-green-100 text-green-800' : 
            isTrialActive ? 'bg-amber-100 text-amber-800' :
            isActuallyExpired ? 'bg-red-100 text-red-800' :
            'bg-red-100 text-red-800'
          }>
            {isActuallyExpired 
              ? "Expired" 
              : subscription?.status === 'canceled' && !isActuallyExpired
              ? "Canceled"
              : subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1)}
          </Badge>
        </div>
        <CardDescription>
          {subscription?.status === 'canceled' && !isActuallyExpired
            ? "Your subscription has been cancelled but you still have access until the end of your current billing period."
            : isActuallyExpired
            ? "Your subscription has expired. Please renew to continue using premium features."
            : isTrialExpired
            ? "Your free trial has expired. Please upgrade to a paid plan to continue using premium features."
            : isTrialActive
            ? "Your free trial is currently active. Consider upgrading to a paid plan to continue using premium features after your trial ends."
            : subscription?.status === 'active'
            ? "Your subscription is currently active."
            : "You don't currently have an active subscription."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription?.currentPeriodEnd && (
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {isActuallyExpired
                  ? "Expired on" 
                  : isTrialActive
                  ? "Trial ends on"
                  : subscription?.status === 'canceled'
                  ? "Access until"
                  : "Current period ends"}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(subscription.currentPeriodEnd), 'PPP')}
              </p>
            </div>
          </div>
        )}
        
        {(isActuallyExpired || isTrialExpired || isTrialActive || !subscription) && 
          <PricingOptions 
            subscription={subscription} 
            isActuallyExpired={isActuallyExpired} 
            isChangingPlan={isChangingPlan}
            handleCheckout={(planId) => {}} // This will be passed from parent
          />
        }
        
        {subscription?.status === 'active' && !isActuallyExpired && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Change Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant={subscription?.subscriptionType === 'monthly' ? "secondary" : "outline"} 
                  onClick={() => handleChangePlan("price_monthly")}
                  disabled={subscription?.subscriptionType === 'monthly' || isChangingPlan}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-medium">Monthly Plan</div>
                    <div className="text-sm text-muted-foreground">$7/month</div>
                  </div>
                </Button>
                
                <Button 
                  variant={subscription?.subscriptionType === 'yearly' ? "secondary" : "outline"} 
                  onClick={() => handleChangePlan("price_yearly")}
                  disabled={subscription?.subscriptionType === 'yearly' || isChangingPlan}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-medium">Yearly Plan</div>
                    <div className="text-sm text-muted-foreground">$63/year (save 25%)</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        {subscription?.status === 'active' && !isActuallyExpired && (
          <Button 
            variant="destructive"
            onClick={() => setConfirmDialogOpen(true)}
            disabled={isCancelling}
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Cancel Subscription
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionDetails;
