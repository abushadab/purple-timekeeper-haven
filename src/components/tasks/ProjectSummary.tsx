
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/services/tasks";
import { formatDateForDisplay } from "@/utils/date-utils";

interface ProjectSummaryProps {
  project: any;
  tasks: Task[];
  calculatedProgress: number;
  isLoading: boolean;
}

export const ProjectSummary = ({ 
  project, 
  tasks, 
  calculatedProgress, 
  isLoading 
}: ProjectSummaryProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <Card className="mb-8 card-glass">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 justify-between">
          <div className="lg:max-w-[60%]">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground text-sm">{project.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDateForDisplay(project.due_date)}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-medium mb-1">Tasks</h3>
              <p className="text-2xl font-semibold">{tasks.filter(task => task.status === 'completed').length}/{tasks.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-medium mb-1">Hours</h3>
              <p className="text-2xl font-semibold">{tasks.reduce((sum, task) => sum + (task.hours_logged || 0), 0).toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Logged</p>
            </div>
            
            <div className="col-span-2 mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="font-medium">{calculatedProgress}%</span>
              </div>
              <Progress value={calculatedProgress} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
