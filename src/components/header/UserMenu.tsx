
import React from "react";
import { useNavigate } from "react-router-dom";
import { Edit, LogOut, CreditCard, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useSubscription } from "@/hooks/useSubscription";

interface UserMenuProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };
  hasActiveSubscription: boolean;
  isPricingPage: boolean;
  isSubscriptionPage: boolean;
  onLogout: () => void;
}

const UserMenu = ({ 
  userData, 
  hasActiveSubscription, 
  isPricingPage, 
  isSubscriptionPage, 
  onLogout 
}: UserMenuProps) => {
  const navigate = useNavigate();
  const { subscription, isSubscriptionExpired } = useSubscription();
  const showSubscriptionExpired = subscription && isSubscriptionExpired(subscription);

  return (
    <div className="ml-auto flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={userData?.avatar || undefined} alt="Profile" />
              <AvatarFallback className="bg-purple-100 text-purple-700">
                {userData?.firstName?.[0]}{userData?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium">{userData?.firstName} {userData?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{userData?.email}</p>
          </div>
          <div className="border-t my-1"></div>
          
          {(hasActiveSubscription || !isPricingPage) && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm px-2 py-1.5 h-auto"
              onClick={() => navigate('/edit-profile')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm px-2 py-1.5 h-auto"
            onClick={() => navigate('/my-subscription')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            My Subscription
            {showSubscriptionExpired && (
              <Badge className="ml-2 bg-red-100 text-red-800 text-xs px-1">Expired</Badge>
            )}
          </Button>
          
          {!hasActiveSubscription && !isPricingPage && !isSubscriptionPage && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm px-2 py-1.5 h-auto"
              onClick={() => navigate('/pricing')}
            >
              <Package className="h-4 w-4 mr-2" />
              View Plans
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm px-2 py-1.5 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default UserMenu;
