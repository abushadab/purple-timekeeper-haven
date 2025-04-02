
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Task, UrlMapping, getUrlMappingsByTask } from "@/services/taskService";
import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const formatDateForInput = (dateString: string): string => {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

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
  
  const [formData, setFormData] = useState<TaskFormData>(task ? { 
    ...task, 
    project_id: projectId || task.project_id,
    url_mappings: [] 
  } : defaultTask);

  const { 
    data: urlMappings = [], 
    isLoading: urlMappingsLoading 
  } = useQuery({
    queryKey: ['urlMappings', task?.id],
    queryFn: () => task?.id ? getUrlMappingsByTask(task.id) : Promise.resolve([]),
    enabled: !!task?.id && open,
  });

  // Fix the infinite loop by adding proper dependency array and condition
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

  const handleDialogClose = () => {
    onOpenChange(false);
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
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this task"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                name="estimated_hours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimated_hours}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>URL Mappings</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addUrlMapping}
                className="h-8 px-2"
              >
                <Plus className="w-4 h-4 mr-1" /> Add URL
              </Button>
            </div>
            <div className="space-y-3">
              {formData.url_mappings.map((mapping, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <Input
                      placeholder="Title (e.g., Login Page)"
                      value={mapping.title}
                      onChange={(e) => handleUrlMappingChange(index, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="URL (e.g., /login)"
                      value={mapping.url}
                      onChange={(e) => handleUrlMappingChange(index, 'url', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUrlMapping(index)}
                    disabled={formData.url_mappings.length <= 1}
                    className="px-2"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button type="submit" className="purple-gradient text-white border-none">
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
