
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectFormData, getISODateString } from "@/services/projectService";
import { Portfolio } from "@/types/portfolio";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectFormData;
  portfolios: Portfolio[];
  onSave: (project: ProjectFormData) => void;
  defaultPortfolioId?: string;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  portfolios,
  onSave,
  defaultPortfolioId,
}: ProjectDialogProps) {
  const isEditing = !!project?.id;
  
  const [formData, setFormData] = useState<ProjectFormData>(
    project || {
      name: "",
      description: "",
      portfolioId: defaultPortfolioId || portfolios[0]?.id || "",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
    }
  );

  useEffect(() => {
    if (project) {
      // Convert due date to ISO format for the date input
      const isoDate = getISODateString(project.dueDate);
      
      setFormData({
        ...project,
        dueDate: isoDate
      });
    } else {
      setFormData({
        name: "",
        description: "",
        portfolioId: defaultPortfolioId || portfolios[0]?.id || "",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
      });
    }
  }, [project, portfolios, open, defaultPortfolioId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePortfolioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, portfolioId: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }
    
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Project" : "Add New Project"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Make changes to your project here. Click save when you're done."
              : "Fill in the details for your new project. Click create when you're done."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Project name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this project"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio</Label>
            <Select
              value={formData.portfolioId}
              onValueChange={handlePortfolioChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Portfolio" />
              </SelectTrigger>
              <SelectContent>
                {portfolios.map((portfolio) => (
                  <SelectItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="purple-gradient text-white border-none">
              {isEditing ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
