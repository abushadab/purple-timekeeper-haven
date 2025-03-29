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
  type: 'started' | 'paused' | 'completed' | 'updated';
  title: string;
  projectName: string;
  status: 'in_progress' | 'completed' | 'not_started';
  time: string;
  timestamp: Date;
}

// Helper function to get the WordPress user ID from local storage
const getWordpressUserId = async (): Promise<string | null> => {
  try {
    // First try to get user from session
    const { data: sessionData } = await supabase.auth.getSession();
    
    // If we have a session with a user, return it
    if (sessionData.session?.user?.id) {
      return sessionData.session.user.id;
    }

    // Otherwise, check if we have a token stored in cookies
    const token = getCookie('token');
    if (!token) {
      return null;
    }

    // If we have a token, validate it
    const response = await fetch('https://tabtracker.ai/wp-json/digits/v1/validate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: token,
      }),
    });

    const data = await response.json();
    if (data.success && data.user_id) {
      return data.user_id;
    }

    return null;
  } catch (error) {
    console.error("Error getting WordPress user ID:", error);
    return null;
  }
};

// Helper function to get cookie
const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

// Fetch dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const userId = await getWordpressUserId();

  if (!userId) {
    console.warn("User not authenticated, returning demo data");
    // Return demo data when not authenticated
    return {
      portfolios: "3",
      projects: "7",
      totalHours: "42.5",
      tasksDue: "5"
    };
  }

  try {
    console.log("Fetching dashboard stats for user:", userId);
    
    // Get portfolio count
    const { count: portfolioCount, error: portfolioError } = await supabase
      .from("portfolios")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("archived", false);
      
    if (portfolioError) {
      console.error("Error fetching portfolios:", portfolioError);
    }

    // Get project count
    const { count: projectCount, error: projectError } = await supabase
      .from("projects")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId);
      
    if (projectError) {
      console.error("Error fetching projects:", projectError);
    }

    // Get total hours from all tasks
    const { data: hoursData, error: hoursError } = await supabase
      .from("tasks")
      .select("hours_logged")
      .eq("user_id", userId);
      
    if (hoursError) {
      console.error("Error fetching hours:", hoursError);
    }

    const totalHours = hoursData?.reduce((sum, task) => sum + (parseFloat(String(task.hours_logged)) || 0), 0) || 0;

    // Get tasks due this week
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const { count: tasksDueCount, error: tasksError } = await supabase
      .from("tasks")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .neq("status", "completed")
      .lte("due_date", nextWeek.toISOString().split('T')[0])
      .gte("due_date", today.toISOString().split('T')[0]);
      
    if (tasksError) {
      console.error("Error fetching tasks due:", tasksError);
    }

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
  const userId = await getWordpressUserId();

  if (!userId) {
    console.warn("User not authenticated, returning demo project data");
    // Return demo data when not authenticated
    return [
      {
        id: "demo-1",
        title: "Website Redesign",
        description: "Modern redesign of company website",
        progress: 75,
        hoursLogged: 24.5,
        dueDate: "Jun 15"
      },
      {
        id: "demo-2",
        title: "Mobile App Development",
        description: "Native app for iOS and Android",
        progress: 40,
        hoursLogged: 18.0,
        dueDate: "Jul 10"
      },
      {
        id: "demo-3",
        title: "Marketing Campaign",
        description: "Q3 product launch promotion",
        progress: 15,
        hoursLogged: 6.5,
        dueDate: "Aug 1"
      }
    ];
  }

  try {
    console.log("Fetching recent projects for user:", userId);
    
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*, tasks(id, status, hours_logged, estimated_hours)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error("Error fetching recent projects:", error);
      return [];
    }

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
  const userId = await getWordpressUserId();

  if (!userId) {
    console.warn("User not authenticated, returning demo weekly summary");
    // Return demo data when not authenticated
    return {
      hoursTarget: 40.0,
      hoursLogged: 28.5,
      completion: 71,
      mostActiveProject: 'Website Redesign',
      mostActiveHours: 12.5
    };
  }

  try {
    console.log("Fetching weekly summary for user:", userId);
    
    // Set target hours (40 hours per week)
    const hoursTarget = 40.0;
    
    // Get start and end of current week
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
    
    // Get all tasks with time logged this week
    const { data: weeklyTasks, error } = await supabase
      .from("tasks")
      .select("hours_logged, project_id, projects(name)")
      .eq("user_id", userId)
      .gte("updated_at", weekStart.toISOString())
      .lte("updated_at", weekEnd.toISOString());
      
    if (error) {
      console.error("Error fetching weekly tasks:", error);
      return {
        hoursTarget: 40.0,
        hoursLogged: 0,
        completion: 0,
        mostActiveProject: 'None',
        mostActiveHours: 0
      };
    }
    
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
  const userId = await getWordpressUserId();

  if (!userId) {
    console.warn("User not authenticated, returning demo activity data");
    // Return demo data when not authenticated
    return [
      {
        id: "demo-act-1",
        type: 'completed',
        title: 'Homepage Design',
        projectName: 'Website Redesign',
        status: 'completed',
        time: '2 hours ago',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: "demo-act-2",
        type: 'started',
        title: 'User Authentication',
        projectName: 'Mobile App Development',
        status: 'in_progress',
        time: '4 hours ago',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: "demo-act-3",
        type: 'updated',
        title: 'Social Media Posts',
        projectName: 'Marketing Campaign',
        status: 'in_progress',
        time: '1 day ago',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: "demo-act-4",
        type: 'paused',
        title: 'About Page Content',
        projectName: 'Website Redesign',
        status: 'not_started',
        time: '2 days ago',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
      }
    ];
  }

  try {
    console.log("Fetching recent activity for user:", userId);
    
    // Get recent task updates
    const { data: recentTasks, error } = await supabase
      .from("tasks")
      .select("id, title, status, updated_at, projects(name)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error("Error fetching recent tasks:", error);
      return [];
    }

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
      
      // Determine activity type based on task status for backward compatibility
      let type: 'started' | 'paused' | 'completed' | 'updated';
      
      if (task.status === 'completed') {
        type = 'completed';
      } else if (task.status === 'in_progress') {
        type = 'started';
      } else {
        type = 'updated';
      }

      // Calculate relative time
      const updatedAt = new Date(task.updated_at);
      const now = new Date();
      const diffMs = now.getTime() - updatedAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo;
      if (diffMins < 60) {
        timeAgo = `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else {
        timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      }

      return {
        id: task.id,
        type,
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
