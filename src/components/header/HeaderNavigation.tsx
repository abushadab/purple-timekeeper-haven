
import React from "react";
import HeaderLink from "./HeaderLink";
import { LayoutDashboard, Folder, BarChart3 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface HeaderNavigationProps {
  currentPath: string;
  isPricingPage: boolean;
}

const HeaderNavigation = ({ currentPath, isPricingPage }: HeaderNavigationProps) => {
  const { subscription } = useSubscription();
  
  if (isPricingPage) {
    return null;
  }

  return (
    <nav className="flex items-center gap-1 lg:gap-2">
      <HeaderLink
        href="/"
        icon={LayoutDashboard}
        label="Dashboard"
        active={currentPath === "/"}
      />
      <HeaderLink
        href="/portfolios"
        icon={Folder}
        label="Portfolios"
        active={currentPath === "/portfolios"}
      />
      <HeaderLink
        href="/reports"
        icon={BarChart3}
        label="Reports"
        active={currentPath === "/reports"}
      />
      {/* Subscription link has been removed */}
    </nav>
  );
};

export default HeaderNavigation;
