
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FolderKanban, BarChart3, Users, CreditCard } from "lucide-react";

export const useSubscriptionNavigation = () => {
  const navigate = useNavigate();
  
  const goToSubscriptionPage = () => {
    navigate('/subscription');
  };
  
  return { goToSubscriptionPage };
};

const Header = () => {
  const navigate = useNavigate();
  
  const navItems = [
    { label: "Dashboard", icon: Home, path: "/" },
    { label: "Projects", icon: FolderKanban, path: "/projects" },
    { label: "Reports", icon: BarChart3, path: "/reports" },
    { label: "Team", icon: Users, path: "/team" },
    { label: "Subscription", icon: CreditCard, path: "/subscription" }
  ];
  
  return (
    <header className="bg-background border-b border-border/40 py-4">
      <div className="container px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl">TimeTrack</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex items-center gap-1.5"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
};

// Make sure the default export is explicitly defined at the end of the file
export default Header;
