
import { supabase } from "@/integrations/supabase/client";
import { Screenshot } from "./types";

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
