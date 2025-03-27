import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Clock, 
  CheckSquare, 
  SlidersHorizontal,
  Filter,
  Eye,
  Edit,
  Trash
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownActions } from "@/components/ui/dropdown-actions";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getProjects, createProject, updateProject, deleteProject, Project, ProjectFormData } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { getPortfolios } from "@/services/portfolioService";

const ProjectCard = ({ project, onViewTasks, onEdit, onDelete }) => {
  const actions = [
    { 
      label: "View Tasks", 
      onClick: () => onViewTasks(project),
      icon: <Eye size={16} />
    },
    { 
      label: "Edit", 
      onClick: () => onEdit(project),
      icon: <Edit size={16} />
    },
    { 
      label: "Delete", 
      onClick: () => onDelete(project),
      variant: "destructive" as const,
      icon: <Trash size={16} />
    },
  ];

  return (
    <Card className="overflow-hidden card-glass hover-scale">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <Badge variant="outline" className={`
                  ${project.status === 'active' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : 
                   project.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                   'bg-amber-100 text-amber-700 hover:bg-amber-100'}
                `}>
                  {project.status === 'active' ? 'Active' : 
                   project.status === 'completed' ? 'Completed' : 'On Hold'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
            </div>
            <DropdownActions actions={actions} />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Progress: <span className="font-medium text-foreground">{project.progress}%</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {project.tasks_completed}/{project.tasks_count} Tasks
            </div>
          </div>
          
          <Progress value={project.progress} className="h-1.5" />
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-4 border-t border-border/50 flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-purple-500" />
          <span>{project.total_hours} hours</span>
        </div>
        
        <div className="flex items-center gap-1">
          <CheckSquare className="w-4 h-4 text-purple-500" />
          <span>{project.tasks_completed} tasks done</span>
        </div>
      </CardFooter>
    </Card>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  
  const [sortOption, setSortOption] = useState("name");
  const [filterOptions, setFilterOptions] = useState({
    portfolio: "all",
  });
  
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    enabled: !!user,
  });

  const { data: portfolios = [], isLoading: portfoliosLoading } = useQuery({
    queryKey: ['portfolios'],
    queryFn: getPortfolios,
    enabled: !!user,
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
  
  const handleAddProject = (projectData: ProjectFormData) => {
    createProjectMutation.mutate(projectData, {
      onSuccess: () => {
        toast({
          title: "Project created",
          description: `"${projectData.name}" has been added to your projects.",
        });
        setAddProjectOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error creating project",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleEditProject = (projectData: ProjectFormData) => {
    updateProjectMutation.mutate(projectData, {
      onSuccess: () => {
        toast({
          title: "Project updated",
          description: `"${projectData.name}" has been updated.`,
        });
        setEditProjectOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error updating project",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleDeleteProject = () => {
    if (!currentProject) return;
    
    deleteProjectMutation.mutate(currentProject.id, {
      onSuccess: () => {
        toast({
          title: "Project deleted",
          description: `"${currentProject.name}" has been deleted.`,
        });
        setDeleteProjectOpen(false);
        setCurrentProject(null);
      },
      onError: (error) => {
        toast({
          title: "Error deleting project",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleViewTasks = (project: Project) => {
    navigate(`/projects/${project.id}/tasks`);
  };
  
  const openEditProjectDialog = (project: Project) => {
    setCurrentProject(project);
    setEditProjectOpen(true);
  };
  
  const openDeleteProjectDialog = (project: Project) => {
    setCurrentProject(project);
    setDeleteProjectOpen(true);
  };
  
  const filteredProjects = projects.filter((project: Project) => {
    if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (activeTab === "active" && project.status !== "active") {
      return false;
    }
    if (activeTab === "completed" && project.status !== "completed") {
      return false;
    }
    
    if (filterOptions.portfolio !== "all" && project.portfolio_id !== filterOptions.portfolio) {
      return false;
    }
    
    return true;
  });
  
  const sortedProjects = [...filteredProjects].sort((a: Project, b: Project) => {
    switch (sortOption) {
      case "name":
        return a.name.localeCompare(b.name);
      case "dueDate":
        return String(a.due_date).localeCompare(String(b.due_date));
      case "progress":
        return b.progress - a.progress;
      default:
        return 0;
    }
  });

  if (projectsError) {
    toast({
      title: "Error loading projects",
      description: "There was an error loading your projects. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-7 w-7 text-purple-600" />
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            </div>
            
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter size={16} />
                    <span className="hidden sm:inline">Filters</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Filter Projects</h4>
                    <div className="pt-2">
                      <h5 className="text-sm font-medium mb-1.5">Portfolio</h5>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="portfolio"
                            checked={filterOptions.portfolio === "all"}
                            onChange={() => setFilterOptions(prev => ({ ...prev, portfolio: "all" }))}
                          />
                          All Portfolios
                        </label>
                        {portfolios.map(portfolio => (
                          <label key={portfolio.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name="portfolio"
                              checked={filterOptions.portfolio === portfolio.id}
                              onChange={() => setFilterOptions(prev => ({ ...prev, portfolio: portfolio.id }))}
                            />
                            {portfolio.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <SlidersHorizontal size={16} />
                    <span className="hidden sm:inline">Sort</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Sort Projects</h4>
                    <div className="pt-2">
                      <h5 className="text-sm font-medium mb-1.5">Sort by</h5>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="sort"
                            checked={sortOption === "name"}
                            onChange={() => setSortOption("name")}
                          />
                          Name
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="sort"
                            checked={sortOption === "dueDate"}
                            onChange={() => setSortOption("dueDate")}
                          />
                          Due Date
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="sort"
                            checked={sortOption === "progress"}
                            onChange={() => setSortOption("progress")}
                          />
                          Progress
                        </label>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                className="purple-gradient text-white border-none gap-1"
                onClick={() => setAddProjectOpen(true)}
              >
                <Plus size={16} />
                <span>New Project</span>
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {projectsLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
            </div>
          ) : sortedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onViewTasks={() => handleViewTasks(project)}
                  onEdit={() => openEditProjectDialog(project)}
                  onDelete={() => openDeleteProjectDialog(project)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground">
              <FolderKanban className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
              <p className="text-lg">No projects found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
      
      <ProjectDialog
        open={addProjectOpen}
        onOpenChange={setAddProjectOpen}
        portfolios={portfolios}
        onSave={handleAddProject}
      />
      
      <ProjectDialog
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={currentProject && {
          id: currentProject.id,
          name: currentProject.name,
          description: currentProject.description || "",
          portfolioId: currentProject.portfolio_id,
          dueDate: currentProject.due_date ? currentProject.due_date.split(' ')[0] : ""
        }}
        portfolios={portfolios}
        onSave={handleEditProject}
      />
      
      <ConfirmDialog
        open={deleteProjectOpen}
        onOpenChange={setDeleteProjectOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${currentProject?.name}"? This action cannot be undone and will delete all tasks associated with this project.`}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
};

export default Projects;
