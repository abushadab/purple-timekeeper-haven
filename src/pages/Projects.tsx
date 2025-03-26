
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Clock, 
  CheckSquare, 
  MoreVertical,
  SlidersHorizontal,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample project data (would be fetched from an API in a real app)
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
    team: [
      { name: "Alex Johnson", initials: "AJ" },
      { name: "Maria Garcia", initials: "MG" },
      { name: "David Kim", initials: "DK" },
    ],
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
    team: [
      { name: "James Smith", initials: "JS" },
      { name: "Emily Brown", initials: "EB" },
    ],
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
    team: [
      { name: "Sara Wilson", initials: "SW" },
      { name: "Robert Davis", initials: "RD" },
      { name: "Lisa Chen", initials: "LC" },
    ],
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
    team: [
      { name: "Michael Johnson", initials: "MJ" },
      { name: "Jennifer Lopez", initials: "JL" },
    ],
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
    team: [
      { name: "Andrew Wilson", initials: "AW" },
      { name: "Sophia Rodriguez", initials: "SR" },
    ],
  },
];

const ProjectCard = ({ project }) => {
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
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MoreVertical size={18} />
            </Button>
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
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map((member, i) => (
                <Avatar key={i} className="border-2 border-background h-8 w-8">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
              
              {project.team.length > 3 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{project.team.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 border-t border-border/50 flex justify-between text-sm text-muted-foreground">
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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredProjects = projectsData.filter(project => {
    // Filter by search term
    if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by status tab
    if (activeTab === "active" && project.status !== "active") {
      return false;
    }
    if (activeTab === "completed" && project.status !== "completed") {
      return false;
    }
    
    return true;
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
              <Button variant="outline" className="gap-1">
                <Filter size={16} />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <Button variant="outline" className="gap-1">
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Sort</span>
              </Button>
              <Button className="purple-gradient text-white border-none gap-1">
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
          
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
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
    </div>
  );
};

export default Projects;
