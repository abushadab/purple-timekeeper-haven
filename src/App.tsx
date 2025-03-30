
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Portfolios from "./pages/Portfolios";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import EditProfile from "./pages/EditProfile";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SubscriptionProtectedRoute from "./components/auth/SubscriptionProtectedRoute";
import Pricing from "./pages/Pricing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import MySubscription from "./pages/MySubscription";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider delayDuration={0}>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Pricing page with normal Header */}
              <Route 
                path="/pricing" 
                element={
                  <ProtectedRoute>
                    <Pricing />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              
              {/* Apply subscription protection to feature routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <SubscriptionProtectedRoute>
                      <Index />
                    </SubscriptionProtectedRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/portfolios" 
                element={
                  <ProtectedRoute>
                    <SubscriptionProtectedRoute>
                      <Portfolios />
                    </SubscriptionProtectedRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <SubscriptionProtectedRoute>
                      <Projects />
                    </SubscriptionProtectedRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects/:projectId/tasks" 
                element={
                  <ProtectedRoute>
                    <SubscriptionProtectedRoute>
                      <Tasks />
                    </SubscriptionProtectedRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <SubscriptionProtectedRoute>
                      <Reports />
                    </SubscriptionProtectedRoute>
                  </ProtectedRoute>
                } 
              />
              
              {/* Profile doesn't require subscription */}
              <Route 
                path="/edit-profile" 
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect new users without subscription history to pricing */}
              <Route 
                path="/my-subscription" 
                element={
                  <ProtectedRoute>
                    <MySubscription />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
