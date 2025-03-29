
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";

const FloatingUserMenu = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <UserMenu />
    </div>
  );
};

export default FloatingUserMenu;
