
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Clock,
  Settings,
  Folder,
  BellRing,
  Moon,
  Sun
} from "lucide-react";

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
  const location = useLocation();
  const path = location.pathname;

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
        </nav>
        
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <BellRing className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Sun className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
