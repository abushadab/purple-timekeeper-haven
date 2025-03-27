
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Folder, 
  Plus, 
  Search, 
  Edit,
  Trash,
  SlidersHorizontal,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PortfolioDialog } from "@/components/portfolios/portfolio-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Portfolio } from "@/types/portfolio";
import { getPortfolios, createPortfolio, updatePortfolio, deletePortfolio } from "@/services/portfolioService";

const PortfolioCard = ({ portfolio, onEdit, onDelete, onClick }) => {
  const handleCardClick = (e) => {
    // Prevent clicking if it was on the action buttons
    if (!e.target.closest('button')) {
      onClick(portfolio);
    }
  };

  return (
    <Card 
      className="overflow-hidden card-glass hover-scale cursor-pointer"
      onClick={handleCardClick}
    >
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
      
      <CardFooter className="p-6 pt-4 border-t border-border/50 flex justify-between">
        <div className="text-xs text-muted-foreground">
          Updated {portfolio.lastUpdated}
        </div>
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(portfolio);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(portfolio);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const Portfolios = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const [addPortfolioOpen, setAddPortfolioOpen] = useState(false);
  const [editPortfolioOpen, setEditPortfolioOpen] = useState(false);
  const [deletePortfolioOpen, setDeletePortfolioOpen] = useState(false);
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  
  const [sortOption, setSortOption] = useState("name");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchPortfolios();
  }, []);
  
  const fetchPortfolios = async () => {
    setIsLoading(true);
    try {
      const data = await getPortfolios();
      setPortfolios(data);
    } catch (error) {
      console.error("Failed to fetch portfolios:", error);
      toast({
        title: "Error",
        description: "Failed to load portfolios. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddPortfolio = async (portfolioData) => {
    try {
      const newPortfolio = await createPortfolio(portfolioData);
      setPortfolios([...portfolios, newPortfolio]);
      toast({
        title: "Portfolio created",
        description: `"${portfolioData.name}" has been added to your portfolios.`,
      });
    } catch (error) {
      console.error("Failed to create portfolio:", error);
      toast({
        title: "Error",
        description: "Failed to create portfolio. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditPortfolio = async (portfolioData) => {
    try {
      const updatedPortfolio = await updatePortfolio(portfolioData);
      setPortfolios(portfolios.map(p => p.id === updatedPortfolio.id ? updatedPortfolio : p));
      toast({
        title: "Portfolio updated",
        description: `"${portfolioData.name}" has been updated.`,
      });
    } catch (error) {
      console.error("Failed to update portfolio:", error);
      toast({
        title: "Error",
        description: "Failed to update portfolio. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeletePortfolio = async () => {
    if (!currentPortfolio) return;
    
    try {
      await deletePortfolio(currentPortfolio.id);
      setPortfolios(portfolios.filter(p => p.id !== currentPortfolio.id));
      toast({
        title: "Portfolio deleted",
        description: `"${currentPortfolio.name}" has been deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete portfolio:", error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletePortfolioOpen(false);
    }
  };
  
  const openEditPortfolioDialog = (portfolio) => {
    setCurrentPortfolio(portfolio);
    setEditPortfolioOpen(true);
  };
  
  const openDeletePortfolioDialog = (portfolio) => {
    setCurrentPortfolio(portfolio);
    setDeletePortfolioOpen(true);
  };
  
  const navigateToProjects = (portfolio) => {
    navigate(`/projects?portfolioId=${portfolio.id}`);
  };
  
  const filteredPortfolios = portfolios.filter(portfolio => {
    if (searchTerm && !portfolio.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (activeTab === "active" && portfolio.archived) {
      return false;
    }
    if (activeTab === "archived" && !portfolio.archived) {
      return false;
    }
    
    return true;
  });
  
  const sortedPortfolios = [...filteredPortfolios].sort((a, b) => {
    switch (sortOption) {
      case "name":
        return a.name.localeCompare(b.name);
      case "projectCount":
        return b.projectCount - a.projectCount;
      case "totalHours":
        return b.totalHours - a.totalHours;
      default:
        return 0;
    }
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <SlidersHorizontal size={16} />
                    <span className="hidden sm:inline">Sort</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Sort Portfolios</h4>
                    <div className="pt-2">
                      <h5 className="text-sm font-medium mb-1.5">Sort by</h5>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="sort"
                            checked={sortOption === "name"}
                            onChange={() => setSortOption("name")}
                          />
                          Name
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="sort"
                            checked={sortOption === "projectCount"}
                            onChange={() => setSortOption("projectCount")}
                          />
                          Project Count
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="sort"
                            checked={sortOption === "totalHours"}
                            onChange={() => setSortOption("totalHours")}
                          />
                          Total Hours
                        </label>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                className="purple-gradient text-white border-none gap-1"
                onClick={() => setAddPortfolioOpen(true)}
              >
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
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[40vh]">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading portfolios...</p>
            </div>
          ) : sortedPortfolios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPortfolios.map((portfolio) => (
                <PortfolioCard 
                  key={portfolio.id} 
                  portfolio={portfolio} 
                  onEdit={openEditPortfolioDialog}
                  onDelete={openDeletePortfolioDialog}
                  onClick={navigateToProjects}
                />
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
      
      <PortfolioDialog
        open={addPortfolioOpen}
        onOpenChange={setAddPortfolioOpen}
        onSave={handleAddPortfolio}
      />
      
      <PortfolioDialog
        open={editPortfolioOpen}
        onOpenChange={setEditPortfolioOpen}
        portfolio={currentPortfolio}
        onSave={handleEditPortfolio}
      />
      
      <ConfirmDialog
        open={deletePortfolioOpen}
        onOpenChange={setDeletePortfolioOpen}
        title="Delete Portfolio"
        description={`Are you sure you want to delete "${currentPortfolio?.name}"? This action cannot be undone and will delete all projects associated with this portfolio.`}
        onConfirm={handleDeletePortfolio}
      />
    </div>
  );
};

export default Portfolios;
