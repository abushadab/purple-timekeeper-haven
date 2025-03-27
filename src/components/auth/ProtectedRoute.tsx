
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Use try-catch to handle potential auth context errors
  let authData = { user: null, loading: true };
  try {
    authData = useAuth();
  } catch (error) {
    console.error("Auth context error:", error);
    // Redirect to login on auth error
    return <Navigate to="/login" replace />;
  }
  
  const { user, loading } = authData;
  
  console.log("ProtectedRoute - Auth check:", "loading:", loading, "user:", !!user);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log("ProtectedRoute - No user found, redirecting to login");
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
