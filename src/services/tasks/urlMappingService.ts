
import { supabase } from "@/integrations/supabase/client";
import { UrlMapping } from "./types";

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
