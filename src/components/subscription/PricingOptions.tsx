
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Subscription } from "@/hooks/useSubscription";

interface PricingOptionsProps {
  subscription: Subscription | null;
  isActuallyExpired: boolean;
  isChangingPlan: boolean;
  handleCheckout: (planId: string) => Promise<void>;
}

const PricingOptions = ({ 
  subscription, 
  isActuallyExpired,
  isChangingPlan,
  handleCheckout 
}: PricingOptionsProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const onCheckout = async (planType: string) => {
    setSelectedPlan(planType);
    await handleCheckout(planType);
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="border-t pt-4">
        <h3 className="font-medium mb-4">
          {isActuallyExpired 
            ? "Renew Your Subscription" 
            : subscription?.status === 'trialing' 
            ? "Upgrade Your Trial" 
            : "Subscription Options"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Monthly Plan</CardTitle>
              <CardDescription>$7/month</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="text-sm space-y-1">
                <li>Unlimited time tracking</li>
                <li>Advanced reporting</li>
                <li>Team collaboration</li>
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                onClick={() => onCheckout("price_monthly")} 
                className="w-full"
                disabled={isChangingPlan}
              >
                {selectedPlan === "price_monthly" && isChangingPlan ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Processing...
                  </span>
                ) : (
                  subscription?.subscriptionType === "monthly" && !isActuallyExpired ? "Change to This Plan" : "Subscribe Now"
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Yearly Plan</CardTitle>
                  <CardDescription>$63/year</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800">Save 25%</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="text-sm space-y-1">
                <li>Everything in Monthly</li>
                <li>Priority support</li>
                <li>Advanced features</li>
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                onClick={() => onCheckout("price_yearly")} 
                className="w-full"
                disabled={isChangingPlan}
                variant="default"
              >
                {selectedPlan === "price_yearly" && isChangingPlan ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Processing...
                  </span>
                ) : (
                  subscription?.subscriptionType === "yearly" && !isActuallyExpired ? "Change to This Plan" : "Subscribe Now"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingOptions;
