
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DropdownActions } from "@/components/ui/dropdown-actions";
import { Edit, Trash2, ExternalLink } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  hoursLogged: number;
  dueDate: string;
  team?: any[]; // Keep for backwards compatibility but not used anymore
}

const ProjectCard = ({
  title,
  description,
  progress,
  hoursLogged,
  dueDate,
}: ProjectCardProps) => {
  // Properly type the actions to match the Action interface
  const actions = [
    {
      label: "View Details",
      onClick: () => console.log("View details"),
      icon: <ExternalLink size={16} />
    },
    {
      label: "Edit",
      onClick: () => console.log("Edit project"),
      icon: <Edit size={16} />
    },
    {
      label: "Delete",
      onClick: () => console.log("Delete project"),
      variant: "destructive" as const, // Use const assertion to make this a literal type
      icon: <Trash2 size={16} />
    }
  ];

  return (
    <Card className="overflow-hidden card-glass hover-scale">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                  {progress}%
                </span>
                <DropdownActions actions={actions} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          
          <Progress value={progress} className="h-1.5" />
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-4 flex justify-between border-t border-border/50 text-sm text-muted-foreground">
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
