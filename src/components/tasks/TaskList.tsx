
import React from "react";
import { Task } from "@/services/tasks";
import { TaskCard } from "./TaskCard";
import { CheckSquare } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onView: (task: Task) => void;
}

export const TaskList = ({ 
  tasks, 
  isLoading, 
  onEdit, 
  onDelete, 
  onView 
}: TaskListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground">
        <CheckSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
        <p className="text-lg">No tasks found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};
