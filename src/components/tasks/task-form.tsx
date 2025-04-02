
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { UrlMappingList } from "./url-mapping-list";
import { TaskFormData, UrlMapping } from "@/services/tasks";

interface TaskFormProps {
  formData: TaskFormData;
  isEditing: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
  handleUrlMappingChange: (index: number, field: keyof UrlMapping, value: string) => void;
  addUrlMapping: () => void;
  removeUrlMapping: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleDialogClose: () => void;
}

export function TaskForm({
  formData,
  isEditing,
  handleChange,
  handleSelectChange,
  handleUrlMappingChange,
  addUrlMapping,
  removeUrlMapping,
  handleSubmit,
  handleDialogClose
}: TaskFormProps) {
  return (
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
      
      <UrlMappingList 
        urlMappings={formData.url_mappings}
        onUrlMappingChange={handleUrlMappingChange}
        onAddUrlMapping={addUrlMapping}
        onRemoveUrlMapping={removeUrlMapping}
      />
      
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={handleDialogClose}>
          Cancel
        </Button>
        <Button type="submit" className="purple-gradient text-white border-none">
          {isEditing ? "Save Changes" : "Create Task"}
        </Button>
      </DialogFooter>
    </form>
  );
}
