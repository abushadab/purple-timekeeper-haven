
import React from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import TimelineItem from "@/components/dashboard/TimelineItem";
import ProjectCard from "@/components/dashboard/ProjectCard";
import TeamMember from "@/components/dashboard/TeamMember";
import { 
  BarChart3, 
  Clock, 
  Folder,
  FolderKanban,
  CheckSquare,
  Calendar,
  Play,
  Pause,
  CheckCircle,
  FileEdit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Welcome back,</div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline">Export</Button>
              <Button className="purple-gradient text-white border-none">Start Timer</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Portfolios"
              value="8"
              icon={Folder}
              trend={{ value: 2, isPositive: true }}
            />
            <StatCard
              title="Projects"
              value="24"
              icon={FolderKanban}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Total Hours"
              value="187.5"
              icon={Clock}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Tasks Due This Week"
              value="12"
              icon={Calendar}
              trend={{ value: 4, isPositive: false }}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="ongoing" className="w-full">
                    <div className="px-6">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="ongoing" className="mt-0 p-6 space-y-6">
                      <ProjectCard
                        title="Website Redesign"
                        description="Complete overhaul of company website with new UI/UX design system"
                        progress={75}
                        hoursLogged={42.5}
                        dueDate="Oct 15"
                        team={[
                          { name: "Alex Johnson", initials: "AJ" },
                          { name: "Maria Garcia", initials: "MG" },
                          { name: "David Kim", initials: "DK" },
                          { name: "Sara Wilson", initials: "SW" },
                        ]}
                      />
                      
                      <ProjectCard
                        title="Mobile App Development"
                        description="Building a native app for iOS and Android platforms"
                        progress={45}
                        hoursLogged={68}
                        dueDate="Nov 30"
                        team={[
                          { name: "James Smith", initials: "JS" },
                          { name: "Emily Brown", initials: "EB" },
                          { name: "Robert Davis", initials: "RD" },
                        ]}
                      />
                    </TabsContent>
                    
                    <TabsContent value="completed" className="mt-0 p-6">
                      <div className="flex items-center justify-center h-40 text-muted-foreground">
                        No completed projects to display
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="all" className="mt-0 p-6">
                      <div className="flex items-center justify-center h-40 text-muted-foreground">
                        Loading all projects...
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Hours Target</p>
                        <p className="text-lg font-semibold">40.0 hrs</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Hours Logged</p>
                        <p className="text-lg font-semibold">32.5 hrs</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completion</p>
                        <p className="text-lg font-semibold text-purple-600">81%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">32.5/40.0 hrs</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: '81%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <p className="font-medium mb-2">Most Active Project</p>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                        <p className="text-muted-foreground">Website Redesign (14.5 hrs)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="overflow-hidden card-glass h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    <TimelineItem
                      icon={Play}
                      iconClassName="bg-green-100"
                      title="Started tracking"
                      description="Website Redesign - Frontend Development"
                      time="2 mins ago"
                    />
                    
                    <TimelineItem
                      icon={Pause}
                      iconClassName="bg-orange-100"
                      title="Paused tracking"
                      description="Website Redesign - UI Components"
                      time="15 mins ago"
                    />
                    
                    <TimelineItem
                      icon={CheckCircle}
                      iconClassName="bg-blue-100"
                      title="Completed task"
                      description="Project Planning and Requirements Gathering"
                      time="1 hour ago"
                    />
                    
                    <TimelineItem
                      icon={FileEdit}
                      iconClassName="bg-purple-100"
                      title="Updated time log"
                      description="Added 2h 30m to API Development"
                      time="2 hours ago"
                      isLast={true}
                    />
                  </div>
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
