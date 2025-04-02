import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  hours_logged: number;
  estimated_hours: number;
  project_id: string;
  auth_user_id?: string;
  created_at?: string;
  updated_at?: string;
  url_mapping?: string;
}

export interface Screenshot {
  id: string;
  task_id: string;
  url: string;
  thumbnail_url?: string;
  timestamp: string;
  auth_user_id?: string;
  created_at?: string;
}

export interface UrlMapping {
  id?: string;
  task_id: string;
  title: string;
  url: string;
  auth_user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskFormData {
  id?: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  estimated_hours: number;
  url_mapping?: string;
  project_id: string;
  url_mappings?: UrlMapping[];
}

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .eq("auth_user_id", userId)
    .order("due_date", { ascending: true });
  
  if (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || "",
    status: item.status as 'not_started' | 'in_progress' | 'completed',
    priority: item.priority as 'low' | 'medium' | 'high',
    due_date: item.due_date || "",
    hours_logged: Number(item.hours_logged) || 0,
    estimated_hours: Number(item.estimated_hours) || 0,
    project_id: item.project_id,
    auth_user_id: item.auth_user_id,
    created_at: item.created_at,
    updated_at: item.updated_at,
    url_mapping: item.url_mapping
  }));
};

export const getUrlMappingsByTask = async (taskId: string): Promise<UrlMapping[]> => {
  const { data, error } = await supabase
    .from("url_mappings")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  
  if (error) {
    console.error("Error fetching URL mappings:", error);
    throw error;
  }

  return data as UrlMapping[];
};

export const saveUrlMappings = async (taskId: string, urlMappings: UrlMapping[]): Promise<void> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { error: deleteError } = await supabase
    .from("url_mappings")
    .delete()
    .eq("task_id", taskId);

  if (deleteError) {
    console.error("Error deleting existing URL mappings:", deleteError);
    throw deleteError;
  }

  if (urlMappings && urlMappings.length > 0) {
    const mappingsToInsert = urlMappings.filter(m => m.title && m.url).map(mapping => ({
      task_id: taskId,
      title: mapping.title,
      url: mapping.url,
      auth_user_id: userId
    }));

    if (mappingsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("url_mappings")
        .insert(mappingsToInsert);
      
      if (insertError) {
        console.error("Error inserting URL mappings:", insertError);
        throw insertError;
      }
    }
  }
};

export const createTask = async (task: TaskFormData): Promise<Task> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (!task.project_id) {
    throw new Error("Project ID is required");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      estimated_hours: task.estimated_hours,
      url_mapping: task.url_mapping,
      project_id: task.project_id,
      auth_user_id: userId,
      hours_logged: 0
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }

  if (task.url_mappings && task.url_mappings.length > 0) {
    await saveUrlMappings(data.id, task.url_mappings.map(mapping => ({
      ...mapping,
      task_id: data.id
    })));
  }

  await updateProjectTaskStats(task.project_id);

  return {
    id: data.id,
    title: data.title,
    description: data.description || "",
    status: data.status as 'not_started' | 'in_progress' | 'completed',
    priority: data.priority as 'low' | 'medium' | 'high',
    due_date: data.due_date || "",
    hours_logged: Number(data.hours_logged) || 0,
    estimated_hours: Number(data.estimated_hours) || 0,
    project_id: data.project_id,
    auth_user_id: data.auth_user_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    url_mapping: data.url_mapping
  };
};

export const updateTask = async (task: TaskFormData): Promise<Task> => {
  if (!task.id) {
    throw new Error("Task ID is required for updates");
  }

  let statusChanged = false;
  let estimatedHoursChanged = false;
  let oldTask = null;

  const { data: existingTask } = await supabase
    .from("tasks")
    .select("status, hours_logged, estimated_hours")
    .eq("id", task.id)
    .single();
  
  oldTask = existingTask;
  statusChanged = existingTask && existingTask.status !== task.status;
  estimatedHoursChanged = existingTask && existingTask.estimated_hours !== task.estimated_hours;
  
  let finalStatus = task.status;

  if (estimatedHoursChanged && existingTask) {
    const currentProgress = (existingTask.hours_logged / existingTask.estimated_hours) * 100;
    const newProgress = (existingTask.hours_logged / task.estimated_hours) * 100;
    
    if (existingTask.status === 'completed' && newProgress < 100) {
      finalStatus = 'in_progress';
      statusChanged = true;
    } else if (existingTask.status !== 'completed' && newProgress >= 100) {
      finalStatus = 'completed';
      statusChanged = true;
    }
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: task.title,
      description: task.description,
      status: finalStatus,
      priority: task.priority,
      due_date: task.due_date,
      estimated_hours: task.estimated_hours,
      url_mapping: task.url_mapping,
      updated_at: new Date().toISOString()
    })
    .eq("id", task.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating task:", error);
    throw error;
  }

  if (task.url_mappings) {
    await saveUrlMappings(task.id, task.url_mappings.map(mapping => ({
      ...mapping,
      task_id: task.id
    })));
  }

  if (statusChanged || estimatedHoursChanged || (oldTask && oldTask.hours_logged !== data.hours_logged)) {
    await updateProjectTaskStats(data.project_id);
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description || "",
    status: data.status as 'not_started' | 'in_progress' | 'completed',
    priority: data.priority as 'low' | 'medium' | 'high',
    due_date: data.due_date || "",
    hours_logged: Number(data.hours_logged) || 0,
    estimated_hours: Number(data.estimated_hours) || 0,
    project_id: data.project_id,
    auth_user_id: data.auth_user_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    url_mapping: data.url_mapping
  };
};

export const deleteTask = async (id: string): Promise<void> => {
  const { data: taskData } = await supabase
    .from("tasks")
    .select("project_id")
    .eq("id", id)
    .single();
  
  const projectId = taskData?.project_id;

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }

  if (projectId) {
    await updateProjectTaskStats(projectId);
  }
};

export const updateTaskHours = async (id: string, hoursLogged: number): Promise<void> => {
  const { data: taskData } = await supabase
    .from("tasks")
    .select("status, estimated_hours, project_id")
    .eq("id", id)
    .single();
  
  if (!taskData) {
    throw new Error("Task not found");
  }
  
  let newStatus = taskData.status;
  const progress = (hoursLogged / taskData.estimated_hours) * 100;
  
  if (progress >= 100 && taskData.status !== 'completed') {
    newStatus = 'completed';
  } else if (progress < 100 && taskData.status === 'completed') {
    newStatus = 'in_progress';
  }
  
  const { data, error } = await supabase
    .from("tasks")
    .update({
      hours_logged: hoursLogged,
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("project_id")
    .single();

  if (error) {
    console.error("Error updating task hours:", error);
    throw error;
  }

  await updateProjectTaskStats(data.project_id);
};

export const getTaskScreenshots = async (taskId: string): Promise<Screenshot[]> => {
  const { data, error } = await supabase
    .from("task_screenshots")
    .select("*")
    .eq("task_id", taskId)
    .order("timestamp", { ascending: false });
  
  if (error) {
    console.error("Error fetching task screenshots:", error);
    throw error;
  }

  return data as Screenshot[];
};

export const addTaskScreenshot = async (
  taskId: string, 
  url: string, 
  thumbnailUrl?: string
): Promise<Screenshot> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("task_screenshots")
    .insert({
      task_id: taskId,
      url: url,
      thumbnail_url: thumbnailUrl || url,
      auth_user_id: userId,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding task screenshot:", error);
    throw error;
  }

  return data as Screenshot;
};

export const deleteTaskScreenshot = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("task_screenshots")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting task screenshot:", error);
    throw error;
  }
};

const updateProjectTaskStats = async (projectId: string): Promise<void> => {
  try {
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("status, hours_logged, estimated_hours")
      .eq("project_id", projectId);
    
    if (error) {
      throw error;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalHours = tasks.reduce((sum, task) => sum + (Number(task.hours_logged) || 0), 0);
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (Number(task.estimated_hours) || 0), 0);
    
    let progress = 0;
    if (totalEstimatedHours > 0) {
      progress = Math.min(Math.round((totalHours / totalEstimatedHours) * 100), 100);
    } else if (totalTasks > 0) {
      progress = Math.round((completedTasks / totalTasks) * 100);
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        tasks_count: totalTasks,
        tasks_completed: completedTasks,
        progress: progress,
        total_hours: totalHours,
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId);
    
    if (updateError) {
      throw updateError;
    }
  } catch (err) {
    console.error("Error updating project stats:", err);
  }
};
