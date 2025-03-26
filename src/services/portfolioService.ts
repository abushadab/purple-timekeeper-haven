
import { supabase } from "@/integrations/supabase/client";
import { Portfolio, PortfolioFormData } from "@/types/portfolio";

export const getPortfolios = async (): Promise<Portfolio[]> => {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching portfolios:", error);
    throw error;
  }

  // Transform the data to match our frontend model
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    color: item.color,
    projectCount: item.project_count,
    totalHours: item.total_hours,
    lastUpdated: formatLastUpdated(item.last_updated),
    archived: item.archived,
    userId: item.user_id,
    createdAt: item.created_at,
  }));
};

export const createPortfolio = async (portfolio: PortfolioFormData): Promise<Portfolio> => {
  const { data, error } = await supabase
    .from("portfolios")
    .insert({
      name: portfolio.name,
      description: portfolio.description,
      color: portfolio.color,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating portfolio:", error);
    throw error;
  }

  // Transform the data to match our frontend model
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    projectCount: data.project_count,
    totalHours: data.total_hours,
    lastUpdated: formatLastUpdated(data.last_updated),
    archived: data.archived,
    userId: data.user_id,
    createdAt: data.created_at,
  };
};

export const updatePortfolio = async (portfolio: PortfolioFormData): Promise<Portfolio> => {
  if (!portfolio.id) {
    throw new Error("Portfolio ID is required for updates");
  }

  const { data, error } = await supabase
    .from("portfolios")
    .update({
      name: portfolio.name,
      description: portfolio.description,
      color: portfolio.color,
    })
    .eq("id", portfolio.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating portfolio:", error);
    throw error;
  }

  // Transform the data to match our frontend model
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    projectCount: data.project_count,
    totalHours: data.total_hours,
    lastUpdated: formatLastUpdated(data.last_updated),
    archived: data.archived,
    userId: data.user_id,
    createdAt: data.created_at,
  };
};

export const deletePortfolio = async (id: string): Promise<void> => {
  const { error } = await supabase.from("portfolios").delete().eq("id", id);

  if (error) {
    console.error("Error deleting portfolio:", error);
    throw error;
  }
};

// Helper function to format the last updated timestamp in a user-friendly way
const formatLastUpdated = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else {
    const months = Math.floor(diffInDays / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
};
