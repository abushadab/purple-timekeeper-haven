
import React, { useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
        toast({
          title: "Subscription Required",
          description: "You need an active subscription to access this feature",
        });
        toastShownRef.current = true;
      }
    }
  }, [user, authLoading, hasActiveSubscription, subscriptionLoading, toast]);
  
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
  
  // Redirect to pricing page if no active subscription
  if (!hasActiveSubscription) {
    return <Navigate to="/pricing" replace />;
  }
  
  // User is authenticated and has an active subscription
  return <>{children}</>;
};

export default SubscriptionProtectedRoute;
