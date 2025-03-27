import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  total_hours: number;
  tasks_count: number;
  tasks_completed: number;
  due_date: string;
  status: string;
  portfolio_id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectFormData {
  id?: string;
  name: string;
  description: string;
  portfolioId: string;
  dueDate: string;
}

export const getProjects = async (): Promise<Project[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  const { data, error } = await supabase
    .from("projects")
    .select("*, tasks(id, status, hours_logged, estimated_hours)")
    .order("name");
  
  if (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }

  // Transform the data to match our frontend model
  return data.map((item) => {
    // Calculate task statistics if tasks are available
    const tasks = item.tasks || [];
    const tasksCount = tasks.length;
    const tasksCompleted = tasks.filter(task => task.status === 'completed').length;
    const totalHours = tasks.reduce((total, task) => total + (parseFloat(String(task.hours_logged)) || 0), 0);
    const totalEstimatedHours = tasks.reduce((total, task) => total + (parseFloat(String(task.estimated_hours)) || 0), 0);
    
    // Calculate progress based on hours tracked vs estimated hours
    let progress = 0;
    if (totalEstimatedHours > 0) {
      progress = Math.min(Math.round((totalHours / totalEstimatedHours) * 100), 100); // Cap at 100%
    } else if (tasksCount > 0) {
      // Fallback to task completion if no estimated hours
      progress = Math.round((tasksCompleted / tasksCount) * 100);
    }

    return {
      id: item.id,
      name: item.name,
      description: item.description || "",
      progress: progress,
      total_hours: totalHours,
      tasks_count: tasksCount,
      tasks_completed: tasksCompleted,
      due_date: formatDueDate(item.due_date),
      status: item.status || "active",
      portfolio_id: item.portfolio_id,
      user_id: item.user_id,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  });
};

export const createProject = async (project: ProjectFormData): Promise<Project> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: project.name,
      description: project.description,
      portfolio_id: project.portfolioId,
      due_date: project.dueDate,
      user_id: userId,
      progress: 0,
      total_hours: 0,
      tasks_count: 0,
      tasks_completed: 0,
      status: "active"
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw error;
  }

  // Update the portfolio statistics after creating a project
  await updatePortfolioStatistics(project.portfolioId);

  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
    progress: data.progress,
    total_hours: data.total_hours,
    tasks_count: data.tasks_count,
    tasks_completed: data.tasks_completed,
    due_date: formatDueDate(data.due_date),
    status: data.status,
    portfolio_id: data.portfolio_id,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const updateProject = async (project: ProjectFormData): Promise<Project> => {
  if (!project.id) {
    throw new Error("Project ID is required for updates");
  }

  // Get the current project to check if portfolio has changed
  const { data: currentProject } = await supabase
    .from("projects")
    .select("portfolio_id")
    .eq("id", project.id)
    .single();

  const oldPortfolioId = currentProject?.portfolio_id;

  const { data, error } = await supabase
    .from("projects")
    .update({
      name: project.name,
      description: project.description,
      portfolio_id: project.portfolioId,
      due_date: project.dueDate,
      updated_at: new Date().toISOString()
    })
    .eq("id", project.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    throw error;
  }

  // If portfolio has changed, update statistics for both old and new portfolios
  if (oldPortfolioId !== project.portfolioId) {
    if (oldPortfolioId) {
      await updatePortfolioStatistics(oldPortfolioId);
    }
    await updatePortfolioStatistics(project.portfolioId);
  } else {
    // Otherwise just update the current portfolio
    await updatePortfolioStatistics(project.portfolioId);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
    progress: data.progress,
    total_hours: data.total_hours,
    tasks_count: data.tasks_count,
    tasks_completed: data.tasks_completed,
    due_date: formatDueDate(data.due_date),
    status: data.status,
    portfolio_id: data.portfolio_id,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const deleteProject = async (id: string): Promise<void> => {
  // Get the portfolio ID before deleting the project
  const { data: project } = await supabase
    .from("projects")
    .select("portfolio_id")
    .eq("id", id)
    .single();

  const portfolioId = project?.portfolio_id;

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting project:", error);
    throw error;
  }

  // Update portfolio statistics after deleting a project
  if (portfolioId) {
    await updatePortfolioStatistics(portfolioId);
  }
};

// Helper function to update portfolio statistics
async function updatePortfolioStatistics(portfolioId: string) {
  try {
    // Get all projects for this portfolio
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id")
      .eq("portfolio_id", portfolioId);

    if (projectsError) {
      console.error("Error fetching projects for portfolio:", projectsError);
      return;
    }

    const projectCount = projects?.length || 0;

    // Get total hours across all tasks in all projects for this portfolio
    const { data: hours, error: hoursError } = await supabase
      .from("tasks")
      .select("hours_logged")
      .in("project_id", projects?.map(p => p.id) || []);

    if (hoursError) {
      console.error("Error fetching hours for portfolio:", hoursError);
      return;
    }

    const totalHours = hours?.reduce((sum, task) => sum + (parseFloat(String(task.hours_logged)) || 0), 0) || 0;

    // Update the portfolio with the new statistics
    const { error: updateError } = await supabase
      .from("portfolios")
      .update({
        project_count: projectCount,
        total_hours: totalHours,
        last_updated: new Date().toISOString()
      })
      .eq("id", portfolioId);

    if (updateError) {
      console.error("Error updating portfolio statistics:", updateError);
    }
  } catch (error) {
    console.error("Error in updatePortfolioStatistics:", error);
  }
}

// Helper function to format the due date in a user-friendly way
const formatDueDate = (date: string | null): string => {
  if (!date) return "";
  
  const dueDate = new Date(date);
  const month = dueDate.toLocaleString('default', { month: 'short' });
  const day = dueDate.getDate();
  
  return `${month} ${day}`;
};

// Helper function to get the ISO date string for editing
export const getISODateString = (date: string | null): string => {
  if (!date) return "";
  
  // If it's already in ISO format (yyyy-MM-dd), return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // If it's in "Month Day" format (e.g., "Mar 15"), convert it to ISO
  try {
    const [month, day] = date.split(' ');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = monthNames.indexOf(month);
    
    if (monthIndex !== -1) {
      const today = new Date();
      const dateObj = new Date(today.getFullYear(), monthIndex, parseInt(day));
      return dateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
  } catch (e) {
    console.error("Error parsing date:", e);
  }
  
  return "";
};
