
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { 
  getTasksByProject, 
  createTask, 
  updateTask, 
  deleteTask,
  getTaskScreenshots,
  TaskFormData, 
  Task
} from "@/services/tasks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ScreenshotsDialog from "@/components/tasks/screenshots-dialog";
import { ProjectSummary } from "@/components/tasks/ProjectSummary";
import { TaskHeader } from "@/components/tasks/TaskHeader";
import { TaskSearchAndFilter } from "@/components/tasks/TaskSearchAndFilter";
import { TaskList } from "@/components/tasks/TaskList";

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
          
          <ProjectSummary 
            project={project} 
            tasks={tasks} 
            calculatedProgress={calculatedProgress} 
            isLoading={projectLoading} 
          />
          
          <TaskHeader 
            onAddTask={() => setAddTaskOpen(true)} 
            sortOption={sortOption} 
            setSortOption={setSortOption} 
            filterOptions={filterOptions} 
            setFilterOptions={setFilterOptions} 
          />
          
          <TaskSearchAndFilter 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          
          <TaskList 
            tasks={sortedTasks} 
            isLoading={tasksLoading} 
            onEdit={openEditTaskDialog} 
            onDelete={openDeleteTaskDialog} 
            onView={openScreenshotsDialog} 
          />
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
