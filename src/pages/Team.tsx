
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  Mail,
  Phone,
  SlidersHorizontal,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample team data
const teamData = [
  {
    id: 1,
    name: "Alex Johnson",
    initials: "AJ",
    avatar: "",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    role: "UI/UX Designer",
    department: "Design",
    hoursThisWeek: 32.5,
    utilization: 85,
    currentProject: "Website Redesign",
    status: "active",
  },
  {
    id: 2,
    name: "Maria Garcia",
    initials: "MG",
    avatar: "",
    email: "maria.garcia@example.com",
    phone: "+1 (555) 234-5678",
    role: "Frontend Developer",
    department: "Engineering",
    hoursThisWeek: 36,
    utilization: 92,
    currentProject: "Website Redesign",
    status: "active",
  },
  {
    id: 3,
    name: "David Kim",
    initials: "DK",
    avatar: "",
    email: "david.kim@example.com",
    phone: "+1 (555) 345-6789",
    role: "Project Manager",
    department: "Operations",
    hoursThisWeek: 28,
    utilization: 70,
    currentProject: "Mobile App Development",
    status: "active",
  },
  {
    id: 4,
    name: "Sara Wilson",
    initials: "SW",
    avatar: "",
    email: "sara.wilson@example.com",
    phone: "+1 (555) 456-7890",
    role: "Backend Developer",
    department: "Engineering",
    hoursThisWeek: 34,
    utilization: 88,
    currentProject: "Website Redesign",
    status: "active",
  },
  {
    id: 5,
    name: "Michael Brown",
    initials: "MB",
    avatar: "",
    email: "michael.brown@example.com",
    phone: "+1 (555) 567-8901",
    role: "Data Analyst",
    department: "Analytics",
    hoursThisWeek: 30,
    utilization: 78,
    currentProject: "Data Analytics Dashboard",
    status: "active",
  },
  {
    id: 6,
    name: "Jennifer Lopez",
    initials: "JL",
    avatar: "",
    email: "jennifer.lopez@example.com",
    phone: "+1 (555) 678-9012",
    role: "Content Strategist",
    department: "Marketing",
    hoursThisWeek: 25,
    utilization: 65,
    currentProject: "Marketing Campaign",
    status: "on_leave",
  },
];

const TeamMemberCard = ({ member }) => {
  return (
    <Card className="overflow-hidden card-glass hover-scale">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div className="flex space-x-4 items-center">
            <Avatar className="h-12 w-12 border-2 border-background">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-purple-100 text-purple-700">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <Badge variant="outline" className={`
                  ${member.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                   member.status === 'on_leave' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 
                   'bg-red-100 text-red-700 hover:bg-red-100'}
                `}>
                  {member.status === 'active' ? 'Active' : 
                   member.status === 'on_leave' ? 'On Leave' : 
                   'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical size={18} />
          </Button>
        </div>
        
        <div className="mt-6 space-y-3">
          <div className="flex text-sm space-x-4">
            <div className="flex items-center text-muted-foreground">
              <Mail className="w-4 h-4 mr-1" />
              <span className="truncate max-w-[140px]">{member.email}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Phone className="w-4 h-4 mr-1" />
              <span>{member.phone}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Utilization</span>
              <span className={`font-medium ${
                member.utilization >= 85 ? 'text-green-600' : 
                member.utilization >= 70 ? 'text-amber-600' : 
                'text-red-600'
              }`}>{member.utilization}%</span>
            </div>
            <Progress value={member.utilization} className="h-1.5" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 border-t border-border/50 flex justify-between text-sm">
        <div className="text-muted-foreground">
          <span className="font-medium text-foreground">{member.hoursThisWeek}</span> hrs this week
        </div>
        <div className="text-muted-foreground">
          On: <span className="text-purple-600 font-medium">{member.currentProject}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredTeam = teamData.filter(member => {
    // Filter by search term
    if (searchTerm && !member.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !member.role.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by status tab
    if (activeTab === "active" && member.status !== "active") {
      return false;
    }
    if (activeTab === "on_leave" && member.status !== "on_leave") {
      return false;
    }
    
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center gap-2">
              <Users className="h-7 w-7 text-purple-600" />
              <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="gap-1">
                <Filter size={16} />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <Button variant="outline" className="gap-1">
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Sort</span>
              </Button>
              <Button className="purple-gradient text-white border-none gap-1">
                <Plus size={16} />
                <span>Add Member</span>
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search team members..." 
                className="pl-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList>
              <TabsTrigger value="all">All Members</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="on_leave">On Leave</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {filteredTeam.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeam.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground">
              <Users className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
              <p className="text-lg">No team members found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Team;
