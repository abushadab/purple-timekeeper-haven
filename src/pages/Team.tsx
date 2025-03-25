
import React from "react";
import Header from "@/components/layout/Header";
import { Users } from "lucide-react";

const Team = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center gap-2">
              <Users className="h-7 w-7 text-purple-600" />
              <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-[70vh] text-muted-foreground text-lg">
            Team management content will be added soon
          </div>
        </div>
      </main>
    </div>
  );
};

export default Team;
