import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const projectsData = [
  {
    id: 1,
    name: "Website Redesign",
    description: "Complete overhaul of company website with new UI/UX design system",
    progress: 75,
    totalHours: 42.5,
    tasksCount: 12,
    tasksCompleted: 9,
    dueDate: "Oct 15",
    status: "active",
    portfolioId: 1
  },
  {
    id: 2,
    name: "Mobile App Development",
    description: "Building a native app for iOS and Android platforms",
    progress: 45,
    totalHours: 68,
    tasksCount: 24,
    tasksCompleted: 10,
    dueDate: "Nov 30",
    status: "active",
    portfolioId: 2
  },
  {
    id: 3,
    name: "E-commerce Integration",
    description: "Integrating payment gateway and shopping cart functionality",
    progress: 30,
    totalHours: 24.5,
    tasksCount: 18,
    tasksCompleted: 5,
    dueDate: "Dec 10",
    status: "active",
    portfolioId: 3
  },
  {
    id: 4,
    name: "Marketing Campaign",
    description: "Q4 digital marketing campaign for product launch",
    progress: 100,
    totalHours: 56,
    tasksCount: 15,
    tasksCompleted: 15,
    dueDate: "Sep 30",
    status: "completed",
    portfolioId: 1
  },
  {
    id: 5,
    name: "Data Analytics Dashboard",
    description: "Creating interactive data visualization dashboard",
    progress: 60,
    totalHours: 32,
    tasksCount: 10,
    tasksCompleted: 6,
    dueDate: "Oct 25",
    status: "active",
    portfolioId: 2
  },
];

const portfoliosData = [
  { id: "1", name: "Client Work" },
  { id: "2", name: "Personal Projects" },
  { id: "3", name: "Learning & Development" },
  { id: "4", name: "Administrative" },
  { id: "5", name: "Content Creation" },
];

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
              {project.tasksCompleted}/{project.tasksCount} Tasks
            </div>
          </div>
          
          <Progress value={project.progress} className="h-1.5" />
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-4 border-t border-border/50 flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-purple-500" />
          <span>{project.totalHours} hours</span>
        </div>
        
        <div className="flex items-center gap-1">
          <CheckSquare className="w-4 h-4 text-purple-500" />
          <span>{project.tasksCompleted} tasks done</span>
        </div>
      </CardFooter>
    </Card>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  
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
  
  const handleAddProject = (projectData) => {
    toast({
      title: "Project created",
      description: `"${projectData.name}" has been added to your projects.`,
    });
  };
  
  const handleEditProject = (projectData) => {
    toast({
      title: "Project updated",
      description: `"${projectData.name}" has been updated.`,
    });
  };
  
  const handleDeleteProject = () => {
    toast({
      title: "Project deleted",
      description: `"${currentProject?.name}" has been deleted.`,
    });
    setDeleteProjectOpen(false);
  };
  
  const handleViewTasks = (project) => {
    navigate(`/projects/${project.id}/tasks`);
  };
  
  const openEditProjectDialog = (project) => {
    setCurrentProject(project);
    setEditProjectOpen(true);
  };
  
  const openDeleteProjectDialog = (project) => {
    setCurrentProject(project);
    setDeleteProjectOpen(true);
  };
  
  const filteredProjects = projectsData.filter(project => {
    if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (activeTab === "active" && project.status !== "active") {
      return false;
    }
    if (activeTab === "completed" && project.status !== "completed") {
      return false;
    }
    
    if (filterOptions.portfolio !== "all" && project.portfolioId !== parseInt(filterOptions.portfolio)) {
      return false;
    }
    
    return true;
  });
  
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortOption) {
      case "name":
        return a.name.localeCompare(b.name);
      case "dueDate":
        return String(a.dueDate).localeCompare(String(b.dueDate));
      case "progress":
        return b.progress - a.progress;
      default:
        return 0;
    }
  });

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
                        {portfoliosData.map(portfolio => (
                          <label key={portfolio.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name="portfolio"
                              checked={filterOptions.portfolio === portfolio.id.toString()}
                              onChange={() => setFilterOptions(prev => ({ ...prev, portfolio: portfolio.id.toString() }))}
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
          
          {sortedProjects.length > 0 ? (
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
        portfolios={portfoliosData}
        onSave={handleAddProject}
      />
      
      <ProjectDialog
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={currentProject}
        portfolios={portfoliosData}
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
