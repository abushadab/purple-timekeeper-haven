
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Images,
  Edit,
  Trash
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
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { 
  getTasksByProject, 
  createTask, 
  updateTask, 
  deleteTask,
  getTaskScreenshots,
  TaskFormData, 
  Task
} from "@/services/taskService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
            <span>Due: {formatDateForDisplay(task.due_date)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>{task.hours_logged}/{task.estimated_hours} hrs</span>
          </div>
          
          {(task.status === "completed" || task.status === "in_progress") && (
            <div className="col-span-2 mt-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span>
                  {Math.min(Math.round((task.hours_logged / task.estimated_hours) * 100), 100)}%
                </span>
              </div>
              <Progress 
                value={(task.hours_logged / task.estimated_hours) * 100} 
                capAt100={true}
                className="h-1" 
              />
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
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [screenshotsOpen, setScreenshotsOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  const [sortOption, setSortOption] = useState("dueDate");
  const [filterOptions, setFilterOptions] = useState({
    priority: "all",
  });

  const [calculatedProgress, setCalculatedProgress] = useState(0);

  const { 
    data: tasks = [], 
    isLoading: tasksLoading,
    error: tasksError
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId && !!user,
  });

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, portfolios(id, name)')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId && !!user,
  });

  const {
    data: screenshots = [],
    isLoading: screenshotsLoading,
    refetch: refetchScreenshots
  } = useQuery({
    queryKey: ['screenshots', currentTask?.id],
    queryFn: () => getTaskScreenshots(currentTask.id),
    enabled: !!currentTask && screenshotsOpen,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
  
  const handleAddTask = (taskData: TaskFormData) => {
    createTaskMutation.mutate({
      ...taskData,
      project_id: projectId,
    }, {
      onSuccess: () => {
        toast({
          title: "Task created",
          description: `"${taskData.title}" has been added to your tasks.`
        });
        setAddTaskOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error creating task",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleEditTask = (taskData: TaskFormData) => {
    updateTaskMutation.mutate({
      ...taskData,
      project_id: projectId,
    }, {
      onSuccess: () => {
        toast({
          title: "Task updated",
          description: `"${taskData.title}" has been updated.`
        });
        setEditTaskOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error updating task",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleDeleteTask = () => {
    if (!currentTask) return;
    
    deleteTaskMutation.mutate(currentTask.id, {
      onSuccess: () => {
        toast({
          title: "Task deleted",
          description: `"${currentTask.title}" has been deleted.`
        });
        setDeleteTaskOpen(false);
        setCurrentTask(null);
      },
      onError: (error) => {
        toast({
          title: "Error deleting task",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  const openEditTaskDialog = (task: Task) => {
    setCurrentTask(task);
    setEditTaskOpen(true);
  };
  
  const openDeleteTaskDialog = (task: Task) => {
    setCurrentTask(task);
    setDeleteTaskOpen(true);
  };
  
  const openScreenshotsDialog = (task: Task) => {
    setCurrentTask(task);
    setScreenshotsOpen(true);
  };
  
  const filteredTasks = tasks.filter(task => {
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
        return String(a.due_date).localeCompare(String(b.due_date));
      case "priority":
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const totalHoursLogged = tasks.reduce((sum, task) => sum + (task.hours_logged || 0), 0);
      const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
      
      let newProgress = 0;
      if (totalEstimatedHours > 0) {
        newProgress = Math.min(Math.round((totalHoursLogged / totalEstimatedHours) * 100), 100);
      } else if (tasks.length > 0) {
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        newProgress = Math.round((completedTasks / tasks.length) * 100);
      }
      
      setCalculatedProgress(newProgress);
    } else {
      setCalculatedProgress(0);
    }
  }, [tasks]);

  if (tasksError || projectError) {
    toast({
      title: "Error loading data",
      description: "There was an error loading the project or tasks. Please try again.",
      variant: "destructive",
    });
  }

  const handleBackNavigation = () => {
    const searchParams = new URLSearchParams(location.search);
    const portfolioId = searchParams.get('portfolioId');
    
    const portfolioIdToUse = project?.portfolio_id || portfolioId;
    
    if (portfolioIdToUse) {
      navigate(`/projects?portfolioId=${portfolioIdToUse}`);
    } else {
      navigate('/projects');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-6 sm:py-8">
          {project && !projectLoading && (
            <BreadcrumbNavigation 
              items={[
                { label: "Portfolios", href: "/portfolios" },
                { 
                  label: project.portfolios?.name || "Projects", 
                  href: project.portfolio_id ? `/projects?portfolioId=${project.portfolio_id}` : "/projects"
                },
                { label: project.name }
              ]}
            />
          )}
          
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8"
              onClick={handleBackNavigation}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Project: {projectLoading ? "Loading..." : project?.name}
              </h1>
            </div>
          </div>
          
          {projectLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
            </div>
          ) : project ? (
            <Card className="mb-8 card-glass">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                  <div className="lg:max-w-[60%]">
                    <h2 className="font-semibold mb-2">Description</h2>
                    <p className="text-muted-foreground text-sm">{project.description}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Due Date</p>
                        <p className="font-medium">{formatDateForDisplay(project.due_date)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="text-sm font-medium mb-1">Tasks</h3>
                      <p className="text-2xl font-semibold">{tasks.filter(task => task.status === 'completed').length}/{tasks.length}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="text-sm font-medium mb-1">Hours</h3>
                      <p className="text-2xl font-semibold">{tasks.reduce((sum, task) => sum + (task.hours_logged || 0), 0).toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Logged</p>
                    </div>
                    
                    <div className="col-span-2 mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{calculatedProgress}%</span>
                      </div>
                      <Progress value={calculatedProgress} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
          
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
          
          {tasksLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
            </div>
          ) : sortedTasks.length > 0 ? (
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
        projectId={projectId}
      />
      
      {currentTask && (
        <TaskDialog
          open={editTaskOpen}
          onOpenChange={setEditTaskOpen}
          task={currentTask}
          onSave={handleEditTask}
          projectId={projectId}
        />
      )}
      
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
          screenshots={screenshots}
          taskId={currentTask.id}
          onScreenshotsUpdated={() => refetchScreenshots()}
        />
      )}
    </div>
  );
};

export default Tasks;
