
import React from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import TimelineItem from "@/components/dashboard/TimelineItem";
import ProjectCard from "@/components/dashboard/ProjectCard";
import TeamMember from "@/components/dashboard/TeamMember";
import { 
  BarChart3, 
  Clock, 
  DollarSign, 
  Users,
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
              title="Total Hours"
              value="187.5"
              icon={Clock}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Team Members"
              value="16"
              icon={Users}
              trend={{ value: 2, isPositive: true }}
            />
            <StatCard
              title="Projects"
              value="24"
              icon={BarChart3}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Budget Used"
              value="$8,521"
              icon={DollarSign}
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
                  <CardTitle className="text-lg font-semibold">Team Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TeamMember
                      name="Alex Johnson"
                      initials="AJ"
                      role="UI/UX Designer"
                      hoursThisWeek={32.5}
                      utilization={85}
                      project="Website Redesign"
                    />
                    
                    <TeamMember
                      name="Maria Garcia"
                      initials="MG"
                      role="Frontend Developer"
                      hoursThisWeek={36}
                      utilization={92}
                      project="Website Redesign"
                    />
                    
                    <TeamMember
                      name="David Kim"
                      initials="DK"
                      role="Project Manager"
                      hoursThisWeek={28}
                      utilization={70}
                      project="Mobile App Development"
                    />
                    
                    <TeamMember
                      name="Sara Wilson"
                      initials="SW"
                      role="Backend Developer"
                      hoursThisWeek={34}
                      utilization={88}
                      project="Website Redesign"
                    />
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
                      title="Maria started tracking"
                      description="Website Redesign - Frontend Development"
                      time="2 mins ago"
                    />
                    
                    <TimelineItem
                      icon={Pause}
                      iconClassName="bg-orange-100"
                      title="Alex paused tracking"
                      description="Website Redesign - UI Components"
                      time="15 mins ago"
                    />
                    
                    <TimelineItem
                      icon={CheckCircle}
                      iconClassName="bg-blue-100"
                      title="David completed task"
                      description="Project Planning and Requirements Gathering"
                      time="1 hour ago"
                    />
                    
                    <TimelineItem
                      icon={FileEdit}
                      iconClassName="bg-purple-100"
                      title="Sara updated time log"
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
