import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Download, ShieldAlert, Package } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MySubscription = () => {
  const { subscription, loading, hasActiveSubscription } = useSubscription();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("MySubscription - Subscription data:", subscription);
  }, [subscription]);

  useEffect(() => {
    if (subscription?.id) {
      fetchBillingHistory();
    } else {
      setBillingHistoryLoading(false);
    }
  }, [subscription]);

  const isTrialExpired = subscription?.status === 'trialing' && 
    subscription?.currentPeriodEnd && 
    new Date(subscription.currentPeriodEnd) < new Date();
    
  const isTrialActive = subscription?.status === 'trialing' && 
    subscription?.currentPeriodEnd && 
    new Date(subscription.currentPeriodEnd) >= new Date();
    
  const isSubscriptionExpired = subscription?.status === 'expired';

  const fetchBillingHistory = async () => {
    try {
      setBillingHistoryLoading(true);
      
      const { data, error } = await supabase.functions.invoke("get-billing-history");
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.invoices) {
        setBillingHistory(data.invoices);
      }
    } catch (error) {
      console.error("Error fetching billing history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch billing history",
        variant: "destructive",
      });
    } finally {
      setBillingHistoryLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      
      const { data, error } = await supabase.functions.invoke("cancel-subscription");
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled. You will still have access until the end of your current billing period.",
      });
      
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleChangePlan = async (newPlanId) => {
    try {
      setIsChangingPlan(true);
      
      const { data, error } = await supabase.functions.invoke("change-subscription-plan", {
        body: { newPriceId: newPlanId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      
      toast({
        title: "Plan updated",
        description: "Your subscription plan has been updated successfully.",
      });
      
      window.location.reload();
    } catch (error) {
      console.error("Error changing plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change subscription plan",
        variant: "destructive",
      });
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleCheckout = async (planType) => {
    try {
      setSelectedPlan(planType);
      setIsChangingPlan(true);
      
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { 
          priceId: planType,
          returnUrl: "/my-subscription"
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Subscription failed",
        description: error.message || "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPlan(false);
      setSelectedPlan(null);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const { data, error } = await supabase.functions.invoke("get-invoice-pdf", {
        body: { invoiceId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      } else {
        throw new Error("No PDF URL returned");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const renderPricingOptions = () => {
    return (
      <div className="space-y-6 mt-4">
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">
            {isSubscriptionExpired 
              ? "Renew Your Subscription" 
              : isTrialExpired 
              ? "Upgrade to a Paid Plan" 
              : isTrialActive 
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
                  onClick={() => handleCheckout("price_monthly")} 
                  className="w-full"
                  disabled={isChangingPlan}
                >
                  {selectedPlan === "price_monthly" && isChangingPlan ? (
                    <span className="flex items-center">
                      <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Processing...
                    </span>
                  ) : (
                    subscription?.subscriptionType === "monthly" && !isSubscriptionExpired ? "Change to This Plan" : "Subscribe Now"
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
                  onClick={() => handleCheckout("price_yearly")} 
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
                    subscription?.subscriptionType === "yearly" && !isSubscriptionExpired ? "Change to This Plan" : "Subscribe Now"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 container py-12 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription && !subscription) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">No Active Subscription</h1>
            <p className="mb-6 text-muted-foreground">You don't currently have an active subscription.</p>
            <Button onClick={() => navigate('/pricing')}>View Plans</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 container py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
            <p className="text-muted-foreground">Manage your subscription and billing</p>
          </div>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Subscription Details</TabsTrigger>
              <TabsTrigger value="history">Billing History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4">
              <Card className="w-full shadow">
                <CardHeader className="space-y-1">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">
                      {subscription?.subscriptionType?.charAt(0).toUpperCase() + subscription?.subscriptionType?.slice(1)} Plan
                    </CardTitle>
                    <Badge className={
                      subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 
                      (subscription?.status === 'trialing' && !isTrialExpired) ? 'bg-amber-100 text-amber-800' :
                      subscription?.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {isTrialExpired 
                        ? "Expired" 
                        : subscription?.status === 'expired'
                        ? "Expired"
                        : subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {subscription?.status === 'canceled' 
                      ? "Your subscription has been cancelled but you still have access until the end of your current billing period."
                      : subscription?.status === 'expired'
                      ? "Your subscription has expired. Please renew to continue using premium features."
                      : isTrialExpired
                      ? "Your free trial has expired. Please upgrade to a paid plan to continue using premium features."
                      : isTrialActive
                      ? "Your free trial is currently active. Consider upgrading to a paid plan to continue using premium features after your trial ends."
                      : "Your subscription is currently active."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {subscription?.currentPeriodEnd && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {isTrialExpired || subscription?.status === 'expired'
                            ? "Expired on" 
                            : isTrialActive
                            ? "Trial ends on"
                            : "Current period ends"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(subscription.currentPeriodEnd), 'PPP')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {subscription?.status !== 'canceled' && !isTrialExpired && !isTrialActive && !isSubscriptionExpired && (
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
                  
                  {(isTrialExpired || isTrialActive || isSubscriptionExpired) && renderPricingOptions()}
                  
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/pricing')}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    View All Plans
                  </Button>
                  
                  {subscription?.status !== 'canceled' && !isTrialActive && !isSubscriptionExpired && (
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
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View and download your past invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  {billingHistoryLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                    </div>
                  ) : billingHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No billing history available</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billingHistory.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>{format(new Date(invoice.created * 1000), 'PP')}</TableCell>
                            <TableCell>{invoice.description || invoice.lines.data[0]?.description}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: invoice.currency.toUpperCase(),
                              }).format(invoice.amount_paid / 100)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(invoice.id)}
                                disabled={invoice.status !== 'paid'}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="text-center mt-8 text-muted-foreground">
            <p className="text-sm">Need help with your subscription?</p>
            <Button variant="link" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
      
      <ConfirmDialog 
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription? You'll still have access until the end of your current billing period."
        onConfirm={handleCancelSubscription}
        confirmText="Cancel Subscription"
      />
    </div>
  );
};

export default MySubscription;
