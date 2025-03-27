
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { PortfolioFormData } from "@/types/portfolio";

interface PortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio?: any; // Using any for backward compatibility
  onSave: (portfolio: PortfolioFormData) => void;
}

export function PortfolioDialog({
  open,
  onOpenChange,
  portfolio,
  onSave,
}: PortfolioDialogProps) {
  const isEditing = !!portfolio?.id;
  
  const [formData, setFormData] = useState<PortfolioFormData>(
    portfolio || { name: "", description: "", color: "#9b87f5" }
  );

  // Update form data when portfolio prop changes
  useEffect(() => {
    if (portfolio) {
      setFormData({
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description || "",
        color: portfolio.color,
      });
    } else {
      // Reset form when adding a new portfolio
      setFormData({ name: "", description: "", color: "#9b87f5" });
    }
  }, [portfolio, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Portfolio name is required",
        variant: "destructive",
      });
      return;
    }
    
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Portfolio" : "Add New Portfolio"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Make changes to your portfolio here. Click save when you're done."
              : "Fill in the details for your new portfolio. Click create when you're done."
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
              placeholder="Portfolio name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this portfolio"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                name="color"
                type="color"
                value={formData.color}
                onChange={handleChange}
                className="w-12 h-10 p-1"
              />
              <span className="text-sm text-muted-foreground">
                Choose a color for this portfolio
              </span>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="purple-gradient text-white border-none">
              {isEditing ? "Save Changes" : "Create Portfolio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
