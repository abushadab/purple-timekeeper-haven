
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth } from "date-fns";

export interface TimeDataPoint {
  name: string;
  hours: number;
}

export interface ProjectDataPoint {
  name: string;
  hours: number;
  color: string;
}

export interface PortfolioDataPoint {
  name: string;
  hours: number;
  color: string;
}

export interface TaskStatusData {
  name: string;
  value: number;
  color: string;
}

export interface TaskEfficiencyData {
  name: string;
  estimate: number;
  actual: number;
}

export interface ProductivityData {
  hour: string;
  productivity: number;
}

// Color palette for charts
const chartColors = [
  '#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA', '#E5DEFF',
  '#f97316', '#4ade80', '#0ea5e9', '#d946ef'
];

// Get time data (hours logged per day/month) based on period
export const getTimeData = async (period: string): Promise<TimeDataPoint[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Set date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    let interval: 'day' | 'month';
    
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        interval = 'day';
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        interval = 'day';
        break;
      case 'month':
        startDate = startOfMonth(now);
        interval = 'day';
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        interval = 'month';
        break;
      case 'year':
      default:
        startDate = startOfYear(now);
        interval = 'month';
        break;
    }
    
    // Get all tasks with time logged in this period
    const { data: tasksData } = await supabase
      .from("tasks")
      .select("hours_logged, updated_at")
      .eq("user_id", userId)
      .gte("updated_at", startDate.toISOString())
      .lte("updated_at", endDate.toISOString());
    
    if (!tasksData || tasksData.length === 0) {
      // Return empty data structure
      if (interval === 'day') {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        return days.map(day => ({
          name: format(day, period === 'today' ? 'ha' : 'EEE'),
          hours: 0
        }));
      } else {
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        return months.map(month => ({
          name: format(month, 'MMM'),
          hours: 0
        }));
      }
    }
    
    // Create date intervals
    const intervals = interval === 'day' 
      ? eachDayOfInterval({ start: startDate, end: endDate })
      : eachMonthOfInterval({ start: startDate, end: endDate });
    
    // Map data to intervals
    return intervals.map(date => {
      // Sum hours for this interval
      const hoursLogged = tasksData.reduce((sum, task) => {
        const taskDate = new Date(task.updated_at);
        const isInInterval = interval === 'day'
          ? isSameDay(taskDate, date)
          : isSameMonth(taskDate, date);
        
        return isInInterval
          ? sum + (parseFloat(String(task.hours_logged)) || 0)
          : sum;
      }, 0);
      
      return {
        name: interval === 'day'
          ? format(date, period === 'today' ? 'ha' : 'EEE')
          : format(date, 'MMM'),
        hours: hoursLogged
      };
    });
  } catch (error) {
    console.error("Error fetching time data:", error);
    return [];
  }
};

// Get project data (hours by project)
export const getProjectData = async (): Promise<ProjectDataPoint[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Get all projects with tasks and hours
    const { data: projects } = await supabase
      .from("projects")
      .select(`
        id, 
        name, 
        total_hours
      `)
      .eq("user_id", userId)
      .is("archived", null);
    
    if (!projects || projects.length === 0) {
      return [];
    }
    
    // Format project data with colors
    return projects.map((project, index) => ({
      name: project.name,
      hours: parseFloat(String(project.total_hours)) || 0,
      color: chartColors[index % chartColors.length]
    }));
  } catch (error) {
    console.error("Error fetching project data:", error);
    return [];
  }
};

// Get portfolio data (hours by portfolio)
export const getPortfolioData = async (): Promise<PortfolioDataPoint[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Get all portfolios with hours
    const { data: portfolios } = await supabase
      .from("portfolios")
      .select(`
        id, 
        name, 
        total_hours,
        color
      `)
      .eq("user_id", userId)
      .eq("archived", false);
    
    if (!portfolios || portfolios.length === 0) {
      return [];
    }
    
    // Format portfolio data with colors
    return portfolios.map((portfolio, index) => ({
      name: portfolio.name,
      hours: parseFloat(String(portfolio.total_hours)) || 0,
      color: portfolio.color || chartColors[index % chartColors.length]
    }));
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return [];
  }
};

// Get task status data (completed, in progress, not started)
export const getTaskStatusData = async (): Promise<TaskStatusData[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // First get count of completed tasks
    const { count: completedCount } = await supabase
      .from("tasks")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("status", "completed");
    
    // Then get count of in-progress tasks
    const { count: inProgressCount } = await supabase
      .from("tasks")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("status", "in_progress");
    
    // Then get count of not-started tasks
    const { count: notStartedCount } = await supabase
      .from("tasks")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("status", "not_started");
    
    const total = (completedCount || 0) + (inProgressCount || 0) + (notStartedCount || 0);
    
    // If no tasks, return empty data
    if (total === 0) {
      return [
        { name: 'Completed', value: 0, color: '#4ade80' },
        { name: 'In Progress', value: 0, color: '#f97316' },
        { name: 'Not Started', value: 0, color: '#9b87f5' }
      ];
    }
    
    // Return task status data with percentages
    return [
      { 
        name: 'Completed', 
        value: Math.round(((completedCount || 0) / total) * 100), 
        color: '#4ade80' 
      },
      { 
        name: 'In Progress', 
        value: Math.round(((inProgressCount || 0) / total) * 100), 
        color: '#f97316' 
      },
      { 
        name: 'Not Started', 
        value: Math.round(((notStartedCount || 0) / total) * 100), 
        color: '#9b87f5' 
      }
    ];
  } catch (error) {
    console.error("Error fetching task status data:", error);
    return [];
  }
};

// Get task efficiency data (estimated vs actual hours)
export const getTaskEfficiencyData = async (): Promise<TaskEfficiencyData[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Get all projects with tasks and estimated/actual hours
    const { data: projects } = await supabase
      .from("projects")
      .select(`
        id, 
        name,
        tasks!inner(estimated_hours, hours_logged)
      `)
      .eq("user_id", userId)
      .is("archived", null)
      .limit(5);  // Limit to 5 projects for readability
    
    if (!projects || projects.length === 0) {
      return [];
    }
    
    // Calculate total estimated and actual hours for each project
    return projects.map(project => {
      const estimatedHours = project.tasks.reduce(
        (sum, task) => sum + (parseFloat(String(task.estimated_hours)) || 0), 
        0
      );
      
      const actualHours = project.tasks.reduce(
        (sum, task) => sum + (parseFloat(String(task.hours_logged)) || 0), 
        0
      );
      
      return {
        name: project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name,
        estimate: Math.round(estimatedHours * 10) / 10,
        actual: Math.round(actualHours * 10) / 10
      };
    });
  } catch (error) {
    console.error("Error fetching task efficiency data:", error);
    return [];
  }
};

// Productivity data (can be based on hours logged per hour of day)
export const getProductivityData = async (): Promise<ProductivityData[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  try {
    // Get all tasks updated in the last week (for a sample of productivity)
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    
    const { data: tasksData } = await supabase
      .from("tasks")
      .select("hours_logged, updated_at")
      .eq("user_id", userId)
      .gte("updated_at", lastWeek.toISOString())
      .lte("updated_at", now.toISOString());
    
    if (!tasksData || tasksData.length === 0) {
      // Return default productivity curve if no data
      return [
        { hour: '6am', productivity: 20 },
        { hour: '7am', productivity: 40 },
        { hour: '8am', productivity: 65 },
        { hour: '9am', productivity: 90 },
        { hour: '10am', productivity: 95 },
        { hour: '11am', productivity: 85 },
        { hour: '12pm', productivity: 70 },
        { hour: '1pm', productivity: 60 },
        { hour: '2pm', productivity: 80 },
        { hour: '3pm', productivity: 85 },
        { hour: '4pm', productivity: 75 },
        { hour: '5pm', productivity: 60 },
        { hour: '6pm', productivity: 50 },
        { hour: '7pm', productivity: 40 },
        { hour: '8pm', productivity: 30 },
      ];
    }
    
    // Group tasks by hour of the day
    const hourData: Record<number, number> = {};
    
    tasksData.forEach(task => {
      const date = new Date(task.updated_at);
      const hour = date.getHours();
      
      if (!hourData[hour]) {
        hourData[hour] = 0;
      }
      
      hourData[hour] += parseFloat(String(task.hours_logged)) || 0;
    });
    
    // Find max hours in any hour to normalize productivity
    const maxHours = Math.max(...Object.values(hourData));
    
    // Create productivity data points for each hour (6am to 8pm)
    const productivityData: ProductivityData[] = [];
    
    for (let i = 6; i <= 20; i++) {
      const formattedHour = i <= 12 
        ? `${i}am` 
        : `${i - 12}pm`;
      
      const hoursLogged = hourData[i] || 0;
      
      // Convert hours to productivity percentage (0-100)
      const productivity = maxHours > 0 
        ? Math.round((hoursLogged / maxHours) * 100)
        : 0;
      
      productivityData.push({
        hour: formattedHour,
        productivity: productivity
      });
    }
    
    return productivityData;
  } catch (error) {
    console.error("Error fetching productivity data:", error);
    return [];
  }
};

// Export data functions
export const exportReportData = (
  reportType: string, 
  period: string, 
  format: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Collect data based on report type
      let reportData;
      
      switch (reportType) {
        case 'time':
          reportData = {
            timeData: await getTimeData(period),
            portfolioData: await getPortfolioData(),
            projectData: await getProjectData()
          };
          break;
        case 'tasks':
          reportData = {
            taskStatusData: await getTaskStatusData(),
            taskEfficiencyData: await getTaskEfficiencyData()
          };
          break;
        case 'productivity':
          reportData = {
            productivityData: await getProductivityData(),
            projectData: await getProjectData()
          };
          break;
        default:
          reportData = {
            timeData: await getTimeData(period)
          };
      }
      
      // Format report name
      const reportName = `${reportType}_report_${period}_${format}`;
      
      resolve(reportName);
      
      // In a real implementation, we would actually create and download the file
      // Return the filename for now as a placeholder
    } catch (error) {
      console.error("Error exporting report:", error);
      reject(error);
    }
  });
};
