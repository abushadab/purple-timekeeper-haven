
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import TimelineItem from "@/components/dashboard/TimelineItem";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { 
  Clock, 
  Folder,
  FolderKanban,
  Calendar,
  Play,
  Pause,
  CheckCircle,
  FileEdit,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getDashboardStats, 
  getRecentProjects,
  getWeeklySummary,
  getRecentActivity,
  type DashboardStats,
  type RecentProject,
  type WeeklySummary,
  type ActivityItem
} from "@/services/dashboardService";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    portfolios: "0",
    projects: "0",
    totalHours: "0",
    tasksDue: "0"
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklySummary>({
    hoursTarget: 40.0,
    hoursLogged: 0,
    completion: 0,
    mostActiveProject: 'None',
    mostActiveHours: 0
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsData, projectsData, weeklyData, activitiesData] = await Promise.all([
        getDashboardStats(),
        getRecentProjects(),
        getWeeklySummary(),
        getRecentActivity()
      ]);
      
      setStats(statsData);
      setRecentProjects(projectsData);
      setWeeklyData(weeklyData);
      setActivities(activitiesData);
      
      console.log("Weekly data fetched:", weeklyData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'started':
        return Play;
      case 'paused':
        return Pause;
      case 'completed':
        return CheckCircle;
      case 'updated':
        return FileEdit;
      default:
        return FileEdit;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Welcome back,</div>
              <h1 className="text-3xl font-bold tracking-tight">{user?.user_metadata?.first_name || 'User'}</h1>
            </div>
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-md">
                {error}
                <Button variant="outline" size="sm" className="ml-2" onClick={fetchDashboardData}>
                  Retry
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Portfolios"
              value={loading ? "..." : stats.portfolios}
              icon={Folder}
              trend={{ value: 0, isPositive: true }}
            />
            <StatCard
              title="Projects"
              value={loading ? "..." : stats.projects}
              icon={FolderKanban}
              trend={{ value: 0, isPositive: true }}
            />
            <StatCard
              title="Total Hours"
              value={loading ? "..." : stats.totalHours}
              icon={Clock}
              trend={{ value: 0, isPositive: true }}
            />
            <StatCard
              title="Tasks Due This Week"
              value={loading ? "..." : stats.tasksDue}
              icon={Calendar}
              trend={{ value: 0, isPositive: true }}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Recent Projects</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {loading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : recentProjects.length > 0 ? (
                    recentProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        description={project.description}
                        progress={project.progress}
                        hoursLogged={project.hoursLogged}
                        dueDate={project.dueDate}
                      />
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No projects found. Create your first project to get started.
                      <div className="mt-4">
                        <Button 
                          onClick={() => navigate('/projects')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Create Project
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                      <div className="pt-4 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-60" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Hours Estimated</p>
                          <p className="text-lg font-semibold">{weeklyData.hoursTarget.toFixed(1)} hrs</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Hours Logged</p>
                          <p className="text-lg font-semibold">{weeklyData.hoursLogged.toFixed(1)} hrs</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Completion</p>
                          <p className="text-lg font-semibold text-purple-600">{weeklyData.completion}%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{weeklyData.hoursLogged.toFixed(1)}/{weeklyData.hoursTarget.toFixed(1)} hrs</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${weeklyData.completion}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <p className="font-medium mb-2">Most Active Project</p>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                          <p className="text-muted-foreground">
                            {weeklyData.mostActiveProject} ({weeklyData.mostActiveHours.toFixed(1)} hrs)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="overflow-hidden card-glass h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : activities.length > 0 ? (
                    <div>
                      {activities.map((activity, index) => (
                        <TimelineItem
                          key={activity.id}
                          title={activity.title}
                          projectName={activity.projectName}
                          time={activity.time}
                          status={activity.status}
                          isLast={index === activities.length - 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No recent activity found. Start working on tasks to see your activity here.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
