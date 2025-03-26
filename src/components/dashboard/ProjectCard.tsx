
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface TeamMember {
  name: string;
  avatar?: string;
  initials: string;
}

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  hoursLogged: number;
  dueDate: string;
  team: TeamMember[];
}

const ProjectCard = ({
  title,
  description,
  progress,
  hoursLogged,
  dueDate,
  team,
}: ProjectCardProps) => {
  return (
    <Card className="overflow-hidden card-glass hover-scale">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{title}</h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                {progress}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          
          <Progress value={progress} className="h-1.5" />
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex -space-x-2">
              {team.slice(0, 3).map((member, i) => (
                <Avatar key={i} className="border-2 border-background h-8 w-8">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
              
              {team.length > 3 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{team.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex justify-between border-t border-border/50 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-purple-500"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
              clipRule="evenodd"
            />
          </svg>
          <span>{hoursLogged} hours logged</span>
        </div>
        
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-purple-500"
          >
            <path
              fillRule="evenodd"
              d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
              clipRule="evenodd"
            />
          </svg>
          <span>Due {dueDate}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
