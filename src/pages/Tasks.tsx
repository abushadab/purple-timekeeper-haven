import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar,
  Clock,
  ArrowLeft,
  SlidersHorizontal,
  Filter,
  Eye,
  Edit,
  Trash,
  Images
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownActions } from "@/components/ui/dropdown-actions";
import ScreenshotsDialog from "@/components/tasks/screenshots-dialog";

// Sample task data for a specific project
const tasksData = [
  {
    id: 1,
    title: "Design homepage wireframes",
    description: "Create low-fidelity wireframes for the new homepage design",
    status: "completed",
    priority: "high",
    dueDate: "2023-10-10",
    hoursLogged: 4.5,
    estimatedHours: 4,
  },
  {
    id: 2,
    title: "Implement navigation component",
    description: "Build the responsive navigation bar according to design specs",
    status: "in_progress",
    priority: "high",
    dueDate: "2023-10-12",
    hoursLogged: 3.2,
    estimatedHours: 6,
  },
  {
    id: 3,
    title: "Create hero section",
    description: "Implement the hero section with animations",
    status: "not_started",
    priority: "medium",
    dueDate: "2023-10-14",
    hoursLogged: 0,
    estimatedHours: 5,
  },
  {
    id: 4,
    title: "Set up image optimization",
    description: "Configure image processing and optimization for better performance",
    status: "not_started",
    priority: "low",
    dueDate: "2023-10-16",
    hoursLogged: 0,
    estimatedHours: 3,
  },
  {
    id: 5,
    title: "Implement footer",
    description: "Build the responsive footer with all required sections",
    status: "not_started",
    priority: "medium",
    dueDate: "2023-10-18",
    hoursLogged: 0,
    estimatedHours: 4,
  },
];

// Sample screenshots data
const screenshotsData = {
  1: [
    { id: "1", url: "https://picsum.photos/id/1/800/600", thumbnailUrl: "https://picsum.photos/id/1/200/150", timestamp: "Oct 10, 2023, 14:30" },
    { id: "2", url: "https://picsum.photos/id/2/800/600", thumbnailUrl: "https://picsum.photos/id/2/200/150", timestamp: "Oct 10, 2023, 15:45" },
  ],
  2: [
    { id: "3", url: "https://picsum.photos/id/3/800/600", thumbnailUrl: "https://picsum.photos/id/3/200/150", timestamp: "Oct 11, 2023, 09:15" },
    { id: "4", url: "https://picsum.photos/id/4/800/600", thumbnailUrl: "https://picsum.photos/id/4/200/150", timestamp: "Oct 11, 2023, 10:30" },
    { id: "5", url: "https://picsum.photos/id/5/800/600", thumbnailUrl: "https://picsum.photos/id/5/200/150", timestamp: "Oct 11, 2023, 11:45" },
  ],
  3: [
    { id: "6", url: "https://picsum.photos/id/6/800/600", thumbnailUrl: "https://picsum.photos/id/6/200/150", timestamp: "Oct 12, 2023, 13:15" },
  ],
  4: [],
  5: [],
};

// Format date for display (convert from YYYY-MM-DD to more readable format)
const formatDateForDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return dateString;
  }
};

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
  portfolio: "Client Work",
  portfolioId: 1
};

const TaskCard = ({ task, onEdit, onDelete, onView }) => {
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

  const actions = [
    { 
      label: "View Screenshots", 
      onClick: () => onView(task),
      icon: <Images size={16} />
    },
    { 
      label: "Edit", 
      onClick: () => onEdit(task),
      icon: <Edit size={16} />
    },
    { 
      label: "Delete", 
      onClick: () => onDelete(task),
      variant: "destructive" as const,
      icon: <Trash size={16} />
    },
  ];

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
          <DropdownActions actions={actions} />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-y-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>Due: {formatDateForDisplay(task.dueDate)}</span>
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
  
  // State for dialogs
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [screenshotsOpen, setScreenshotsOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  
  // State for sorting and filtering
  const [sortOption, setSortOption] = useState("dueDate");
  const [filterOptions, setFilterOptions] = useState({
    priority: "all",
  });
  
  // Handlers for task actions
  const handleAddTask = (taskData) => {
    toast({
      title: "Task created",
      description: `"${taskData.title}" has been added to your tasks.",
    });
  };
  
  const handleEditTask = (taskData) => {
    toast({
      title: "Task updated",
      description: `"${taskData.title}" has been updated.`,
    });
  };
  
  const handleDeleteTask = () => {
    toast({
      title: "Task deleted",
      description: `"${currentTask?.title}" has been deleted.`,
    });
    setDeleteTaskOpen(false);
  };
  
  const openEditTaskDialog = (task) => {
    setCurrentTask(task);
    setEditTaskOpen(true);
  };
  
  const openDeleteTaskDialog = (task) => {
    setCurrentTask(task);
    setDeleteTaskOpen(true);
  };
  
  const openScreenshotsDialog = (task) => {
    setCurrentTask(task);
    setScreenshotsOpen(true);
  };
  
  const filteredTasks = tasksData.filter(task => {
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (activeTab === "completed" && task.status !== "completed") {
      return false;
    }
    if (activeTab === "in_progress" && task.status !== "in_progress") {
      return false;
    }
    if (activeTab === "not_started" && task.status !== "not_started") {
      return false;
    }
    
    if (filterOptions.priority !== "all" && task.priority !== filterOptions.priority) {
      return false;
    }
    
    return true;
  });
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortOption) {
      case "dueDate":
        return String(a.dueDate).localeCompare(String(b.dueDate));
      case "priority":
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
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
              <h1 className="text-2xl font-bold tracking-tight">Project: {project.name}</h1>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter size={16} />
                    <span className="hidden sm:inline">Filters</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Filter Tasks</h4>
                    <div className="pt-2">
                      <h5 className="text-sm font-medium mb-1.5">Priority</h5>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="priority"
                            checked={filterOptions.priority === "all"}
                            onChange={() => setFilterOptions(prev => ({ ...prev, priority: "all" }))}
                          />
                          All
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="priority"
                            checked={filterOptions.priority === "high"}
                            onChange={() => setFilterOptions(prev => ({ ...prev, priority: "high" }))}
                          />
                          High
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="priority"
                            checked={filterOptions.priority === "medium"}
                            onChange={() => setFilterOptions(prev => ({ ...prev, priority: "medium" }))}
                          />
                          Medium
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="priority"
                            checked={filterOptions.priority === "low"}
                            onChange={() => setFilterOptions(prev => ({ ...prev, priority: "low" }))}
                          />
                          Low
                        </label>
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
                    <h4 className="font-medium">Sort Tasks</h4>
                    <div className="pt-2">
                      <h5 className="text-sm font-medium mb-1.5">Sort by</h5>
                      <div className="flex flex-col gap-2">
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
                            checked={sortOption === "priority"}
                            onChange={() => setSortOption("priority")}
                          />
                          Priority
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="sort"
                            checked={sortOption === "title"}
                            onChange={() => setSortOption("title")}
                          />
                          Title
                        </label>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                className="purple-gradient text-white border-none gap-1"
                onClick={() => setAddTaskOpen(true)}
              >
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
          
          {sortedTasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={openEditTaskDialog}
                  onDelete={openDeleteTaskDialog}
                  onView={openScreenshotsDialog}
                />
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
      
      <TaskDialog
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        onSave={handleAddTask}
      />
      
      <TaskDialog
        open={editTaskOpen}
        onOpenChange={setEditTaskOpen}
        task={currentTask}
        onSave={handleEditTask}
      />
      
      <ConfirmDialog
        open={deleteTaskOpen}
        onOpenChange={setDeleteTaskOpen}
        title="Delete Task"
        description={`Are you sure you want to delete "${currentTask?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteTask}
      />

      {currentTask && (
        <ScreenshotsDialog
          open={screenshotsOpen}
          onOpenChange={setScreenshotsOpen}
          taskName={currentTask.title}
          screenshots={screenshotsData[currentTask.id] || []}
        />
      )}
    </div>
  );
};

export default Tasks;
