
import { useState, useEffect } from "react";
import { Task, TaskFormData, UrlMapping } from "@/services/tasks";
import { formatDateForInput } from "@/utils/date-utils";
import { toast } from "@/hooks/use-toast";

export const useTaskForm = (
  task: Task | undefined,
  projectId: string | undefined,
  urlMappings: UrlMapping[],
  open: boolean,
  onSave: (task: TaskFormData) => void
) => {
  const isEditing = !!task?.id;
  
  const defaultTask = {
    title: "",
    description: "",
    status: "not_started" as const,
    priority: "medium" as const,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimated_hours: 0,
    url_mapping: "",
    project_id: projectId || "",
    url_mappings: [{
      task_id: "",
      title: "",
      url: ""
    }]
  };
  
  const [formData, setFormData] = useState<TaskFormData>(
    task ? { 
      ...task, 
      project_id: projectId || task.project_id,
      url_mappings: [] 
    } : defaultTask
  );

  // Effect to update form data when the dialog opens/closes or task changes
  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setFormData(task ? { 
        ...task, 
        due_date: formatDateForInput(task.due_date),
        url_mapping: task.url_mapping || "",
        project_id: projectId || task.project_id,
        url_mappings: [] 
      } : defaultTask);
      return;
    }

    if (task) {
      setFormData({
        ...task,
        due_date: formatDateForInput(task.due_date),
        url_mapping: task.url_mapping || "",
        project_id: projectId || task.project_id,
        url_mappings: urlMappings.length > 0 ? urlMappings : [{ task_id: task.id, title: "", url: "" }]
      });
    } else {
      setFormData({
        ...defaultTask,
        project_id: projectId || "",
        url_mappings: [{ task_id: "", title: "", url: "" }]
      });
    }
  }, [task, open, projectId, urlMappings.length]); // Only depend on length, not the entire array

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newValue = name === "estimated_hours" ? parseFloat(value) : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUrlMappingChange = (index: number, field: keyof UrlMapping, value: string) => {
    setFormData(prev => {
      const updatedMappings = [...prev.url_mappings];
      updatedMappings[index] = {
        ...updatedMappings[index],
        [field]: value
      };
      return {
        ...prev,
        url_mappings: updatedMappings
      };
    });
  };

  const addUrlMapping = () => {
    setFormData(prev => ({
      ...prev,
      url_mappings: [
        ...prev.url_mappings,
        { task_id: task?.id || "", title: "", url: "" }
      ]
    }));
  };

  const removeUrlMapping = (index: number) => {
    if (formData.url_mappings.length <= 1) {
      return;
    }
    
    setFormData(prev => {
      const updatedMappings = [...prev.url_mappings];
      updatedMappings.splice(index, 1);
      return {
        ...prev,
        url_mappings: updatedMappings
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure project_id is set correctly
    const finalProjectId = formData.project_id || projectId || "";
    
    // Filter out empty URL mappings
    const filteredUrlMappings = formData.url_mappings.filter(
      mapping => mapping.title.trim() !== "" && mapping.url.trim() !== ""
    );
    
    onSave({
      ...formData,
      project_id: finalProjectId,
      url_mappings: filteredUrlMappings
    });
  };

  return {
    formData,
    isEditing,
    handleChange,
    handleSelectChange,
    handleUrlMappingChange,
    addUrlMapping,
    removeUrlMapping,
    handleSubmit
  };
};
