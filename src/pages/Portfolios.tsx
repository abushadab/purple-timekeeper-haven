
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Folder, 
  Plus, 
  Search, 
  Edit,
  Trash,
  Calendar,
  Clock,
  SlidersHorizontal,
  Filter,
  MoreVertical
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

// Sample portfolio data
const portfoliosData = [
  {
    id: 1,
    name: "Client Work",
    description: "Projects for external clients",
    projectCount: 8,
    totalHours: 156.5,
    lastUpdated: "2 days ago",
    color: "#9b87f5",
  },
  {
    id: 2,
    name: "Personal Projects",
    description: "Side projects and experiments",
    projectCount: 5,
    totalHours: 42.5,
    lastUpdated: "1 week ago",
    color: "#f97316",
  },
  {
    id: 3,
    name: "Learning & Development",
    description: "Courses and skill-building activities",
    projectCount: 3,
    totalHours: 28.0,
    lastUpdated: "3 days ago",
    color: "#4ade80",
  },
  {
    id: 4,
    name: "Administrative",
    description: "Internal processes and organization",
    projectCount: 2,
    totalHours: 12.5,
    lastUpdated: "Yesterday",
    color: "#0ea5e9",
  },
  {
    id: 5,
    name: "Content Creation",
    description: "Blog posts, videos, and social media",
    projectCount: 4,
    totalHours: 36.0,
    lastUpdated: "5 days ago",
    color: "#d946ef",
  },
  {
    id: 6,
    name: "Archived",
    description: "Completed and inactive work",
    projectCount: 10,
    totalHours: 246.0,
    lastUpdated: "1 month ago",
    color: "#94a3b8",
    archived: true,
  },
];

const PortfolioCard = ({ portfolio }) => {
  return (
    <Card className="overflow-hidden card-glass hover-scale">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: `${portfolio.color}20` }}
            >
              <Folder className="w-5 h-5" style={{ color: portfolio.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{portfolio.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{portfolio.description}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            {portfolio.archived && (
              <Badge variant="outline" className="bg-gray-100 text-gray-700 mr-2">
                Archived
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MoreVertical size={18} />
            </Button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Projects</span>
            <span className="font-medium">{portfolio.projectCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Hours</span>
            <span className="font-medium">{portfolio.totalHours}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 border-t border-border/50 flex justify-between">
        <div className="text-xs text-muted-foreground">
          Updated {portfolio.lastUpdated}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const Portfolios = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredPortfolios = portfoliosData.filter(portfolio => {
    // Filter by search term
    if (searchTerm && !portfolio.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by status tab
    if (activeTab === "active" && portfolio.archived) {
      return false;
    }
    if (activeTab === "archived" && !portfolio.archived) {
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
              <Folder className="h-7 w-7 text-purple-600" />
              <h1 className="text-3xl font-bold tracking-tight">Portfolios</h1>
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
                <span>New Portfolio</span>
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search portfolios..." 
                className="pl-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList>
              <TabsTrigger value="all">All Portfolios</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {filteredPortfolios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolios.map((portfolio) => (
                <PortfolioCard key={portfolio.id} portfolio={portfolio} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground">
              <Folder className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
              <p className="text-lg">No portfolios found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Portfolios;
