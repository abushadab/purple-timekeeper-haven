
import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionProtectedRouteProps {
  children: React.ReactNode;
}

const SubscriptionProtectedRoute: React.FC<SubscriptionProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subscriptionLoading, subscription } = useSubscription();
  const { toast } = useToast();
  const toastShownRef = useRef<boolean>(false);
  
  // Debug log
  useEffect(() => {
    console.log("SubscriptionProtectedRoute - Auth:", !!user, "Loading:", authLoading);
    console.log("SubscriptionProtectedRoute - Subscription:", subscription, "HasActive:", hasActiveSubscription, "Loading:", subscriptionLoading);
  }, [user, authLoading, subscription, hasActiveSubscription, subscriptionLoading]);
  
  // Handle toast notifications in an effect instead of in the render function
  useEffect(() => {
    // Only proceed if not loading and the toast hasn't been shown yet
    if (!authLoading && !subscriptionLoading && !toastShownRef.current) {
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to access this page",
        });
        toastShownRef.current = true;
      } else if (!hasActiveSubscription) {
        // Check if trial has expired
        const hasExpiredTrial = subscription?.status === 'trialing' && 
          subscription?.currentPeriodEnd && 
          new Date(subscription.currentPeriodEnd) < new Date();
        
        if (hasExpiredTrial) {
          toast({
            title: "Trial Expired",
            description: "Your free trial has expired. Please upgrade to continue using this feature.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Subscription Required",
            description: "You need an active subscription to access this feature",
          });
        }
        toastShownRef.current = true;
      }
    }
  }, [user, authLoading, hasActiveSubscription, subscriptionLoading, toast, subscription]);
  
  // Show loading state while checking authentication and subscription
  if (authLoading || subscriptionLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if subscription exists but is expired (specifically for trials)
  const hasExpiredTrial = subscription?.status === 'trialing' && 
    subscription?.currentPeriodEnd && 
    new Date(subscription.currentPeriodEnd) < new Date();
  
  // Redirect to pricing page if no active subscription or trial has expired
  if (!hasActiveSubscription || hasExpiredTrial) {
    return <Navigate to="/pricing" replace />;
  }
  
  // User is authenticated and has an active subscription
  return <>{children}</>;
};

export default SubscriptionProtectedRoute;
