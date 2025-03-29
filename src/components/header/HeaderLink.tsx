
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const HeaderLink = ({ href, icon: Icon, label, active = false }: HeaderLinkProps) => {
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

export default HeaderLink;
