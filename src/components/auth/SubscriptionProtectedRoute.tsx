
import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionProtectedRouteProps {
  children: React.ReactNode;
}

const SubscriptionProtectedRoute: React.FC<SubscriptionProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { 
    hasActiveSubscription, 
    loading: subscriptionLoading, 
    subscription, 
    isSubscriptionExpired 
  } = useSubscription();
  const { toast } = useToast();
  const toastShownRef = useRef<boolean>(false);
  const location = useLocation(); // Get current location
  
  // Debug log
  useEffect(() => {
    console.log("SubscriptionProtectedRoute - Auth:", !!user, "Loading:", authLoading);
    console.log("SubscriptionProtectedRoute - Subscription:", subscription, "HasActive:", hasActiveSubscription, "Loading:", subscriptionLoading);
    console.log("SubscriptionProtectedRoute - Current path:", location.pathname);
    
    if (subscription) {
      console.log("Subscription period end:", subscription.currentPeriodEnd);
      console.log("Current date:", new Date().toISOString());
      console.log("Is end date in future:", subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) > new Date() : false);
      console.log("Is subscription expired:", isSubscriptionExpired(subscription));
    }
  }, [user, authLoading, subscription, hasActiveSubscription, subscriptionLoading, location, isSubscriptionExpired]);
  
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
        // Check if subscription exists but has expired
        const hasExpiredSubscription = subscription && isSubscriptionExpired(subscription);
          
        if (hasExpiredSubscription) {
          toast({
            title: "Subscription Expired",
            description: "Your subscription has expired. Please renew to continue using this feature.",
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
  }, [user, authLoading, hasActiveSubscription, subscriptionLoading, toast, subscription, isSubscriptionExpired]);
  
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
  
  // If subscription is inactive, redirect appropriately
  if (!hasActiveSubscription) {
    // Check if subscription exists but has expired
    const hasExpiredSubscription = subscription && isSubscriptionExpired(subscription);
      
    // If subscription has expired, always redirect to my-subscription page
    if (hasExpiredSubscription) {
      // Avoid infinite redirect if already on my-subscription
      if (location.pathname === '/my-subscription') {
        return <>{children}</>;
      }
      return <Navigate to="/my-subscription" replace />;
    }
    
    // Always redirect from my-subscription to pricing for new users with no subscription history
    if (location.pathname === '/my-subscription') {
      return <Navigate to="/pricing" replace />;
    }
    
    // For users with no subscription, redirect to pricing
    if (location.pathname === '/pricing') {
      return <>{children}</>;
    }
    return <Navigate to="/pricing" replace />;
  }
  
  // User is authenticated and has an active subscription
  return <>{children}</>;
};

export default SubscriptionProtectedRoute;
