
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Clock, 
  Users, 
  FolderKanban, 
  Settings, 
  Bell, 
  Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/projects", label: "Projects", icon: FolderKanban },
    { path: "/team", label: "Team", icon: Users },
    { path: "/reports", label: "Reports", icon: Clock },
  ];
  
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-purple-600" />
            <span className="text-lg font-semibold">TimeTrack</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`nav-link flex items-center gap-1.5 ${isActive ? 'active' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-purple-100 text-purple-800">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
