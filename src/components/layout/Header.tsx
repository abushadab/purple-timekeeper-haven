
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import HeaderNavigation from "@/components/header/HeaderNavigation";
import UserMenu from "@/components/header/UserMenu";
import LogoutDialog from "@/components/header/LogoutDialog";

const Header = () => {
  console.log("Rendering Header component");
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { subscription, hasActiveSubscription, isSubscriptionExpired } = useSubscription();
  
  const isPricingPage = location.pathname === "/pricing";
  const isSubscriptionPage = location.pathname === "/my-subscription";
  
  let user = null;
  let signOut = async () => {};
  
  try {
    const auth = useAuth();
    user = auth?.user;
    signOut = auth?.signOut || signOut;
    console.log("Header - Auth context:", !!auth, "User:", !!user);
  } catch (error) {
    console.error("Failed to use auth context:", error);
  }
  
  const path = location.pathname;
  
  const storedUserData = localStorage.getItem('user');
  const userData = storedUserData ? JSON.parse(storedUserData) : { 
    firstName: 'John', 
    lastName: 'Doe', 
    email: user?.email || 'user@example.com',
    avatar: null
  };

  const handleLogout = async () => {
    try {
      if (signOut) {
        await signOut();
      }
      setLogoutDialogOpen(false);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive"
      });
    }
  };

  const handleOpenLogoutDialog = () => {
    setLogoutDialogOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="mr-4 flex items-center gap-2">
          <Clock className="h-6 w-6 text-purple-600" />
          <span className="hidden sm:inline-block font-semibold text-lg">TabTracker</span>
        </div>
        
        <HeaderNavigation 
          currentPath={path} 
          isPricingPage={isPricingPage} 
        />
        
        <UserMenu 
          userData={userData}
          hasActiveSubscription={hasActiveSubscription}
          isPricingPage={isPricingPage}
          isSubscriptionPage={isSubscriptionPage}
          onLogout={handleOpenLogoutDialog}
        />
      </div>
      
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Header;
