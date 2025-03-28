import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";

export interface DashboardStats {
  portfolios: string;
  projects: string;
  totalHours: string;
  tasksDue: string;
}

export interface RecentProject {
  id: string;
  title: string;
  description: string;
  progress: number;
  hoursLogged: number;
  dueDate: string;
}

export interface WeeklySummary {
  hoursTarget: number;
  hoursLogged: number;
  completion: number;
  mostActiveProject: string;
  mostActiveHours: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  projectName: string;
  status: 'in_progress' | 'completed' | 'not_started';
  time: string;
  timestamp: Date;
}

// Fetch dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Get portfolio count
    const { count: portfolioCount } = await supabase
      .from("portfolios")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("archived", false);

    // Get project count
    const { count: projectCount } = await supabase
      .from("projects")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId);

    // Get total hours from all tasks
    const { data: hoursData } = await supabase
      .from("tasks")
      .select("hours_logged")
      .eq("user_id", userId);

    const totalHours = hoursData?.reduce((sum, task) => sum + (parseFloat(String(task.hours_logged)) || 0), 0) || 0;

    // Get tasks due this week
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const { count: tasksDueCount } = await supabase
      .from("tasks")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .neq("status", "completed")
      .lte("due_date", nextWeek.toISOString().split('T')[0])
      .gte("due_date", today.toISOString().split('T')[0]);

    return {
      portfolios: String(portfolioCount || 0),
      projects: String(projectCount || 0),
      totalHours: totalHours.toFixed(1),
      tasksDue: String(tasksDueCount || 0)
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      portfolios: "0",
      projects: "0",
      totalHours: "0",
      tasksDue: "0"
    };
  }
};

// Fetch recent projects
export const getRecentProjects = async (limit = 3): Promise<RecentProject[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const { data: projects } = await supabase
      .from("projects")
      .select("*, tasks(id, status, hours_logged, estimated_hours)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (!projects || projects.length === 0) {
      return [];
    }

    return projects.map(project => {
      // Format the due date
      const dueDate = project.due_date 
        ? format(new Date(project.due_date), "MMM d")
        : "No date";

      return {
        id: project.id,
        title: project.name,
        description: project.description || "",
        progress: project.progress || 0,
        hoursLogged: project.total_hours || 0,
        dueDate: dueDate
      };
    });
  } catch (error) {
    console.error("Error fetching recent projects:", error);
    return [];
  }
};

// Get weekly summary
export const getWeeklySummary = async (): Promise<WeeklySummary> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Set target hours (40 hours per week)
    const hoursTarget = 40.0;
    
    // Get start and end of current week
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
    
    // Get all tasks with time logged this week
    const { data: weeklyTasks } = await supabase
      .from("tasks")
      .select("hours_logged, project_id, projects(name)")
      .eq("user_id", userId)
      .gte("updated_at", weekStart.toISOString())
      .lte("updated_at", weekEnd.toISOString());
    
    // Calculate total hours logged this week
    const hoursLogged = weeklyTasks?.reduce((sum, task) => 
      sum + (parseFloat(String(task.hours_logged)) || 0), 0) || 0;
    
    // Calculate completion percentage
    const completion = Math.min(Math.round((hoursLogged / hoursTarget) * 100), 100);
    
    // Find most active project
    const projectHours = weeklyTasks?.reduce((acc, task) => {
      const projectId = task.project_id;
      const hours = parseFloat(String(task.hours_logged)) || 0;
      const projectName = task.projects?.name || 'Unknown Project';
      
      if (!acc[projectId]) {
        acc[projectId] = { 
          name: projectName, 
          hours: 0 
        };
      }
      
      acc[projectId].hours += hours;
      return acc;
    }, {} as Record<string, { name: string, hours: number }>);
    
    // Get the project with most hours
    let mostActiveProject = 'None';
    let mostActiveHours = 0;
    
    if (projectHours) {
      Object.values(projectHours).forEach(project => {
        if (project.hours > mostActiveHours) {
          mostActiveProject = project.name;
          mostActiveHours = project.hours;
        }
      });
    }
    
    return {
      hoursTarget,
      hoursLogged,
      completion,
      mostActiveProject,
      mostActiveHours
    };
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    return {
      hoursTarget: 40.0,
      hoursLogged: 0,
      completion: 0,
      mostActiveProject: 'None',
      mostActiveHours: 0
    };
  }
};

// Get recent activity
export const getRecentActivity = async (limit = 4): Promise<ActivityItem[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Get recent task updates
    const { data: recentTasks } = await supabase
      .from("tasks")
      .select("id, title, status, updated_at, projects(name)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (!recentTasks || recentTasks.length === 0) {
      return [];
    }

    return recentTasks.map((task) => {
      // Map task status to our component status
      let status: 'in_progress' | 'completed' | 'not_started';
      
      if (task.status === 'completed') {
        status = 'completed';
      } else if (task.status === 'in_progress') {
        status = 'in_progress';
      } else {
        status = 'not_started';
      }

      // Calculate relative time
      const updatedAt = new Date(task.updated_at);
      const now = new Date();
      const diffMs = now.getTime() - updatedAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo;
      if (diffMins < 60) {
        timeAgo = `${diffMins} mins ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hours ago`;
      } else {
        timeAgo = `${diffDays} days ago`;
      }

      return {
        id: task.id,
        title: task.title,
        projectName: task.projects?.name || 'Unknown Project',
        status,
        time: timeAgo,
        timestamp: updatedAt
      };
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};
