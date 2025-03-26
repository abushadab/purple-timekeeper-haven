
import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  MoreVertical,
  Calendar,
  Clock,
  ArrowLeft,
  SlidersHorizontal,
  Filter,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

// Sample task data for a specific project
const tasksData = [
  {
    id: 1,
    title: "Design homepage wireframes",
    description: "Create low-fidelity wireframes for the new homepage design",
    status: "completed",
    priority: "high",
    dueDate: "Oct 10, 2023",
    hoursLogged: 4.5,
    estimatedHours: 4,
  },
  {
    id: 2,
    title: "Implement navigation component",
    description: "Build the responsive navigation bar according to design specs",
    status: "in_progress",
    priority: "high",
    dueDate: "Oct 12, 2023",
    hoursLogged: 3.2,
    estimatedHours: 6,
  },
  {
    id: 3,
    title: "Create hero section",
    description: "Implement the hero section with animations",
    status: "not_started",
    priority: "medium",
    dueDate: "Oct 14, 2023",
    hoursLogged: 0,
    estimatedHours: 5,
  },
  {
    id: 4,
    title: "Set up image optimization",
    description: "Configure image processing and optimization for better performance",
    status: "not_started",
    priority: "low",
    dueDate: "Oct 16, 2023",
    hoursLogged: 0,
    estimatedHours: 3,
  },
  {
    id: 5,
    title: "Implement footer",
    description: "Build the responsive footer with all required sections",
    status: "not_started",
    priority: "medium",
    dueDate: "Oct 18, 2023",
    hoursLogged: 0,
    estimatedHours: 4,
  },
];

// Sample project data
const project = {
  id: 1,
  name: "Website Redesign",
  description: "Complete overhaul of company website with new UI/UX design system",
  progress: 36,
  totalHours: 7.7,
  estimatedHours: 22,
  tasksCompleted: 1,
  tasksTotal: 5,
  dueDate: "Oct 20, 2023",
  portfolio: "Client Work"
};

const TaskCard = ({ task }) => {
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "in_progress":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "not_started":
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  const getPriorityBadgeClasses = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      case "medium":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100";
      case "low":
      default:
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "not_started":
      default:
        return "Not Started";
    }
  };

  return (
    <Card className="overflow-hidden card-glass hover-scale">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{task.title}</h3>
              <Badge variant="outline" className={getStatusBadgeClasses(task.status)}>
                {formatStatus(task.status)}
              </Badge>
              <Badge variant="outline" className={getPriorityBadgeClasses(task.priority)}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical size={18} />
          </Button>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-y-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>Due: {task.dueDate}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>{task.hoursLogged}/{task.estimatedHours} hrs</span>
          </div>
          
          {(task.status === "completed" || task.status === "in_progress") && (
            <div className="col-span-2 mt-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span>{Math.round((task.hoursLogged / task.estimatedHours) * 100)}%</span>
              </div>
              <Progress value={(task.hoursLogged / task.estimatedHours) * 100} className="h-1" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { projectId } = useParams();
  
  const filteredTasks = tasksData.filter(task => {
    // Filter by search term
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by status tab
    if (activeTab === "completed" && task.status !== "completed") {
      return false;
    }
    if (activeTab === "in_progress" && task.status !== "in_progress") {
      return false;
    }
    if (activeTab === "not_started" && task.status !== "not_started") {
      return false;
    }
    
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/projects">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="text-sm text-muted-foreground">Project</p>
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            </div>
          </div>
          
          <Card className="mb-8 card-glass">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 justify-between">
                <div className="lg:max-w-[60%]">
                  <h2 className="font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground text-sm">{project.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Portfolio</p>
                      <p className="font-medium">{project.portfolio}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="font-medium">{project.dueDate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-sm font-medium mb-1">Tasks</h3>
                    <p className="text-2xl font-semibold">{project.tasksCompleted}/{project.tasksTotal}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-sm font-medium mb-1">Hours</h3>
                    <p className="text-2xl font-semibold">{project.totalHours}/{project.estimatedHours}</p>
                    <p className="text-xs text-muted-foreground">Logged</p>
                  </div>
                  
                  <div className="col-span-2 mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold">Tasks</h2>
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
                <span>Add Task</span>
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="not_started">Not Started</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground">
              <CheckSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
              <p className="text-lg">No tasks found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tasks;
