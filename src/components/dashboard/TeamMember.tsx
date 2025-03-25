
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TeamMemberProps {
  name: string;
  avatar?: string;
  initials: string;
  role: string;
  hoursThisWeek: number;
  utilization: number;
  project?: string;
}

const TeamMember = ({
  name,
  avatar,
  initials,
  role,
  hoursThisWeek,
  utilization,
  project,
}: TeamMemberProps) => {
  return (
    <Card className="overflow-hidden card-glass hover-scale">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{name}</h3>
              <span className="text-xs text-muted-foreground">{hoursThisWeek}h</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{role}</span>
              <span className="text-purple-600 font-medium">{utilization}%</span>
            </div>
            
            <Progress value={utilization} className="h-1.5 mt-1" />
            
            {project && (
              <div className="text-xs text-muted-foreground mt-1">
                Working on <span className="font-medium text-foreground">{project}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMember;
