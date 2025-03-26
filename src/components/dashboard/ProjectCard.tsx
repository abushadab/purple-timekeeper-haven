
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DropdownActions } from "@/components/ui/dropdown-actions";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { ProjectDialog } from "@/components/projects/project-dialog";

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  hoursLogged: number;
  dueDate: string;
  id?: string;
  team?: any[]; // Keep for backwards compatibility but not used anymore
}

// Sample portfolio data for the dropdown - using string IDs
const portfoliosData = [
  { id: "1", name: "Client Work" },
  { id: "2", name: "Personal Projects" },
  { id: "3", name: "Learning & Development" },
  { id: "4", name: "Administrative" },
];

const ProjectCard = ({
  title,
  description,
  progress,
  hoursLogged,
  dueDate,
  id = "1", // Default to "1" if not provided
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Create a project object for the dialog
  const projectData = {
    id,
    name: title,
    description,
    portfolioId: "1", // Default portfolio
    dueDate,
  };

  const handleEditSave = (updatedProject) => {
    // This would be implemented with the WordPress API integration
    console.log("Saving project changes for ID:", id, updatedProject);
    toast({
      title: "Project updated",
      description: `${updatedProject.name} has been successfully updated.`,
    });
  };

  const handleDelete = () => {
    // This would be implemented with the WordPress API integration
    console.log("Deleting project:", id);
    toast({
      title: "Project deleted",
      description: `${title} has been successfully deleted.`,
    });
  };

  // Properly type the actions to match the Action interface
  const actions = [
    {
      label: "View Tasks",
      onClick: () => navigate(`/projects/${id}/tasks`),
      icon: <ExternalLink size={16} />
    },
    {
      label: "Edit",
      onClick: () => setEditDialogOpen(true),
      icon: <Edit size={16} />
    },
    {
      label: "Delete",
      onClick: () => setConfirmOpen(true),
      variant: "destructive" as const, // Use const assertion to make this a literal type
      icon: <Trash2 size={16} />
    }
  ];

  return (
    <>
      <Card className="overflow-hidden card-glass hover-scale shadow-md hover:shadow-lg transition-shadow">
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
      />

      {/* Edit Project Dialog */}
      <ProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={projectData}
        portfolios={portfoliosData}
        onSave={handleEditSave}
      />
    </>
  );
};

export default ProjectCard;
