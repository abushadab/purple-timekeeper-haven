
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task, UrlMapping, getUrlMappingsByTask } from "@/services/tasks";
import { useQuery } from "@tanstack/react-query";
import { TaskForm } from "./task-form";
import { useTaskForm } from "@/hooks/use-task-form";

interface TaskFormData {
  id?: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string;
  estimated_hours: number;
  url_mapping?: string;
  project_id: string;
  url_mappings: UrlMapping[];
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSave: (task: TaskFormData) => void;
  projectId?: string;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  onSave,
  projectId
}: TaskDialogProps) {
  const { 
    data: urlMappings = [], 
    isLoading: urlMappingsLoading 
  } = useQuery({
    queryKey: ['urlMappings', task?.id],
    queryFn: () => task?.id ? getUrlMappingsByTask(task.id) : Promise.resolve([]),
    enabled: !!task?.id && open,
  });

  const {
    formData,
    isEditing,
    handleChange,
    handleSelectChange,
    handleUrlMappingChange,
    addUrlMapping,
    removeUrlMapping,
    handleSubmit
  } = useTaskForm(task, projectId, urlMappings, open, onSave);

  const handleDialogClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Make changes to your task here. Click save when you're done."
              : "Fill in the details for your new task. Click create when you're done."
            }
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          formData={formData}
          isEditing={isEditing}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleUrlMappingChange={handleUrlMappingChange}
          addUrlMapping={addUrlMapping}
          removeUrlMapping={removeUrlMapping}
          handleSubmit={handleSubmit}
          handleDialogClose={handleDialogClose}
        />
      </DialogContent>
    </Dialog>
  );
}
