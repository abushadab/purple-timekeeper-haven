
import { supabase } from "@/integrations/supabase/client";

export const updateProjectTaskStats = async (projectId: string): Promise<void> => {
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
