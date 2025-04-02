
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Images, Edit, Trash } from "lucide-react";
import { DropdownActions } from "@/components/ui/dropdown-actions";
import { Task } from "@/services/tasks";
import { formatDateForDisplay } from "@/utils/date-utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onView: (task: Task) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onView }: TaskCardProps) => {
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "in_progress":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "not_started":
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  const getPriorityBadgeClasses = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      case "medium":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100";
      case "low":
      default:
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "not_started":
      default:
        return "Not Started";
    }
  };

  const actions = [
    { 
      label: "View Screenshots", 
      onClick: () => onView(task),
      icon: <Images size={16} />
    },
    { 
      label: "Edit", 
      onClick: () => onEdit(task),
      icon: <Edit size={16} />
    },
    { 
      label: "Delete", 
      onClick: () => onDelete(task),
      variant: "destructive" as const,
      icon: <Trash size={16} />
    },
  ];

  return (
    <Card className="overflow-hidden card-glass hover-scale">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{task.title}</h3>
              <Badge variant="outline" className={getStatusBadgeClasses(task.status)}>
                {formatStatus(task.status)}
              </Badge>
              <Badge variant="outline" className={getPriorityBadgeClasses(task.priority)}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          </div>
          <DropdownActions actions={actions} />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-y-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>Due: {formatDateForDisplay(task.due_date)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>{task.hours_logged}/{task.estimated_hours} hrs</span>
          </div>
          
          {(task.status === "completed" || task.status === "in_progress") && (
            <div className="col-span-2 mt-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span>
                  {Math.min(Math.round((task.hours_logged / task.estimated_hours) * 100), 100)}%
                </span>
              </div>
              <Progress 
                value={(task.hours_logged / task.estimated_hours) * 100} 
                capAt100={true}
                className="h-1" 
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
