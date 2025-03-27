
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Clock,
  Folder,
  Edit,
  LogOut,
  Users
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const HeaderLink = ({ href, icon: Icon, label, active = false }) => {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "gap-2 hover:bg-muted",
          active ? "bg-muted font-medium" : "font-normal"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="hidden md:inline">{label}</span>
      </Button>
    </Link>
  );
};

const Header = () => {
  console.log("Rendering Header component");
  
  // Get all hooks at the top level regardless of any conditions
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Set up auth context with try/catch but call useAuth at top level
  const auth = useAuth();
  const user = auth?.user;
  const signOut = auth?.signOut;
  
  const path = location.pathname;
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  
  // Get cached user data from localStorage for backward compatibility
  const storedUserData = localStorage.getItem('user');
  const userData = storedUserData ? JSON.parse(storedUserData) : { 
    firstName: 'John', 
    lastName: 'Doe', 
    email: user?.email || 'user@example.com',
    avatar: null
  };

  // Handle logout
  const handleLogout = async () => {
    if (signOut) {
      await signOut();
    }
    setLogoutDialogOpen(false);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  console.log("Header - Auth context:", !!auth, "User:", !!user);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="mr-4 flex items-center gap-2">
          <Clock className="h-6 w-6 text-purple-600" />
          <span className="hidden sm:inline-block font-semibold text-lg">TimeTrack</span>
        </div>
        
        <nav className="flex items-center gap-1 lg:gap-2">
          <HeaderLink
            href="/"
            icon={LayoutDashboard}
            label="Dashboard"
            active={path === "/"}
          />
          <HeaderLink
            href="/portfolios"
            icon={Folder}
            label="Portfolios"
            active={path === "/portfolios"}
          />
          <HeaderLink
            href="/projects"
            icon={FolderKanban}
            label="Projects"
            active={path === "/projects" || path.includes("/projects/")}
          />
          <HeaderLink
            href="/reports"
            icon={BarChart3}
            label="Reports"
            active={path === "/reports"}
          />
          <HeaderLink
            href="/team"
            icon={Users}
            label="Team"
            active={path === "/team"}
          />
        </nav>
        
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
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm px-2 py-1.5 h-auto"
                onClick={() => navigate('/edit-profile')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm px-2 py-1.5 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
