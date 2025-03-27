
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
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }

  // Transform the data to match our frontend model
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    progress: item.progress,
    total_hours: item.total_hours,
    tasks_count: item.tasks_count,
    tasks_completed: item.tasks_completed,
    due_date: formatDueDate(item.due_date),
    status: item.status || "active",
    portfolio_id: item.portfolio_id,
    user_id: item.user_id,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
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
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// Helper function to format the due date in a user-friendly way
const formatDueDate = (date: string | null): string => {
  if (!date) return "";
  
  const dueDate = new Date(date);
  const month = dueDate.toLocaleString('default', { month: 'short' });
  const day = dueDate.getDate();
  
  return `${month} ${day}`;
};
