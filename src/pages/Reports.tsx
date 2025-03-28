import React, { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, Download, PieChart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import DateRangeSelector from "@/components/reports/DateRangeSelector";
import FilterSelector, { FilterOption } from "@/components/reports/FilterSelector";
import ExportOptions from "@/components/reports/ExportOptions";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  getTimeData, 
  getProjectData,
  getPortfolioData,
  getTaskStatusData,
  getTaskEfficiencyData,
  getProductivityData,
  exportReportData,
  type TimeDataPoint,
  type ProjectDataPoint,
  type PortfolioDataPoint,
  type TaskStatusData,
  type TaskEfficiencyData,
  type ProductivityData
} from "@/services/reportsService";

const Reports = () => {
  const [period, setPeriod] = useState("week");
  const [reportType, setReportType] = useState("time");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  
  const [projectFilters, setProjectFilters] = useState<FilterOption[]>([
    { id: "website-redesign", label: "Website Redesign", checked: false },
    { id: "mobile-app", label: "Mobile App Development", checked: false },
    { id: "ecommerce", label: "E-commerce Integration", checked: false },
    { id: "marketing", label: "Marketing Campaign", checked: false },
    { id: "analytics", label: "Data Analytics Dashboard", checked: false },
  ]);
  
  const [statusFilters, setStatusFilters] = useState<FilterOption[]>([
    { id: "completed", label: "Completed", checked: false },
    { id: "in-progress", label: "In Progress", checked: false },
    { id: "not-started", label: "Not Started", checked: false },
  ]);
  
  const [typeFilters, setTypeFilters] = useState<FilterOption[]>([
    { id: "development", label: "Development", checked: false },
    { id: "design", label: "Design", checked: false },
    { id: "content", label: "Content Creation", checked: false },
    { id: "research", label: "Research", checked: false },
  ]);
  
  const { data: timeData = [], isLoading: timeLoading } = useQuery({
    queryKey: ['timeData', period],
    queryFn: () => getTimeData(period)
  });
  
  const { data: projectData = [], isLoading: projectLoading } = useQuery({
    queryKey: ['projectData'],
    queryFn: getProjectData
  });
  
  const { data: portfolioData = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolioData'],
    queryFn: getPortfolioData
  });
  
  const { data: taskStatusData = [], isLoading: taskStatusLoading } = useQuery({
    queryKey: ['taskStatusData'],
    queryFn: getTaskStatusData
  });
  
  const { data: taskEfficiencyData = [], isLoading: taskEfficiencyLoading } = useQuery({
    queryKey: ['taskEfficiencyData'],
    queryFn: getTaskEfficiencyData
  });
  
  const { data: productivityData = [], isLoading: productivityLoading } = useQuery({
    queryKey: ['productivityData'],
    queryFn: getProductivityData
  });
  
  const handleFilterChange = (category: string, id: string, checked: boolean) => {
    switch (category) {
      case "projects":
        setProjectFilters(
          projectFilters.map((filter) =>
            filter.id === id ? { ...filter, checked } : filter
          )
        );
        break;
      case "status":
        setStatusFilters(
          statusFilters.map((filter) =>
            filter.id === id ? { ...filter, checked } : filter
          )
        );
        break;
      case "type":
        setTypeFilters(
          typeFilters.map((filter) =>
            filter.id === id ? { ...filter, checked } : filter
          )
        );
        break;
    }
  };
  
  const handleResetFilters = () => {
    setProjectFilters(projectFilters.map(filter => ({ ...filter, checked: false })));
    setStatusFilters(statusFilters.map(filter => ({ ...filter, checked: false })));
    setTypeFilters(typeFilters.map(filter => ({ ...filter, checked: false })));
    
    toast({
      title: "Filters reset",
      description: "All filters have been cleared."
    });
  };
  
  const handleApplyFilters = () => {
    console.log("Applied filters:", {
      projects: projectFilters.filter(f => f.checked).map(f => f.id),
      status: statusFilters.filter(f => f.checked).map(f => f.id),
      type: typeFilters.filter(f => f.checked).map(f => f.id)
    });
    
    toast({
      title: "Filters applied",
      description: "Report data has been filtered based on your selection."
    });
  };
  
  const handleExport = async (format: string) => {
    try {
      const fileName = await exportReportData(reportType, period, format);
      
      toast({
        title: `Report exported as ${format.toUpperCase()}`,
        description: "Your report has been exported successfully."
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your report.",
        variant: "destructive"
      });
    }
  };
  
  const preparePortfolioDataForChart = (data: PortfolioDataPoint[]): PortfolioDataPoint[] => {
    const hourGroups: Record<number, PortfolioDataPoint[]> = {};
    
    data.forEach(portfolio => {
      if (!hourGroups[portfolio.hours]) {
        hourGroups[portfolio.hours] = [];
      }
      hourGroups[portfolio.hours].push(portfolio);
    });
    
    return data.map(portfolio => {
      const group = hourGroups[portfolio.hours];
      
      if (group.length > 1) {
        const index = group.findIndex(p => p.name === portfolio.name);
        const adjustedHours = portfolio.hours + (index * 0.001);
        
        return {
          ...portfolio,
          hours: adjustedHours
        };
      }
      
      return portfolio;
    });
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-purple-600" />
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />
              <FilterSelector 
                projectFilters={projectFilters}
                statusFilters={statusFilters}
                typeFilters={typeFilters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                onApplyFilters={handleApplyFilters}
              />
              <ExportOptions onExport={handleExport} isLoading={timeLoading || projectLoading || portfolioLoading} />
            </div>
          </div>
          
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs defaultValue="time" value={reportType} onValueChange={setReportType} className="w-auto">
              <TabsList>
                <TabsTrigger value="time">Time Analysis</TabsTrigger>
                <TabsTrigger value="tasks">Task Analytics</TabsTrigger>
                <TabsTrigger value="productivity">Productivity</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="w-full sm:w-[180px]">
              <Select defaultValue={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {reportType === "time" && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="card-glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Hours Logged {period === "week" ? "(This Week)" : period === "month" ? "(This Month)" : "(This Year)"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {timeLoading ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">Loading data...</div>
                          </div>
                        ) : timeData.length === 0 ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">No data available</div>
                          </div>
                        ) : (
                          <BarChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`${value} hrs`, 'Hours']}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '0.5rem',
                                border: 'none', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Bar dataKey="hours" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Hours by Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {portfolioLoading ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">Loading data...</div>
                          </div>
                        ) : portfolioData.length === 0 ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">No portfolios found</div>
                          </div>
                        ) : (
                          <RPieChart>
                            <Pie
                              data={preparePortfolioDataForChart(portfolioData)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              dataKey="hours"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {preparePortfolioDataForChart(portfolioData).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend />
                            <Tooltip 
                              formatter={(value) => [`${value} hrs`, 'Hours']}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '0.5rem',
                                border: 'none', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          </RPieChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="card-glass mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Project Hours Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      {projectLoading ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="text-center text-muted-foreground">Loading data...</div>
                        </div>
                      ) : projectData.length === 0 ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="text-center text-muted-foreground">No projects found</div>
                        </div>
                      ) : (
                        <BarChart
                          layout="vertical"
                          data={projectData}
                          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip 
                            formatter={(value) => [`${value} hrs`, 'Hours']}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              borderRadius: '0.5rem',
                              border: 'none', 
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Bar dataKey="hours" fill="#9b87f5" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {reportType === "tasks" && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="card-glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Task Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {taskStatusLoading ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">Loading data...</div>
                          </div>
                        ) : taskStatusData.length === 0 ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">No tasks found</div>
                          </div>
                        ) : (
                          <RPieChart>
                            <Pie
                              data={taskStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {taskStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend />
                            <Tooltip 
                              formatter={(value, name) => [`${value}%`, name]}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '0.5rem',
                                border: 'none', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          </RPieChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Task Efficiency: Estimated vs. Actual Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {taskEfficiencyLoading ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">Loading data...</div>
                          </div>
                        ) : taskEfficiencyData.length === 0 ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">No task efficiency data available</div>
                          </div>
                        ) : (
                          <BarChart
                            data={taskEfficiencyData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`${value} hrs`, 'Hours']}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '0.5rem',
                                border: 'none', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="estimate" fill="#9b87f5" name="Estimated" />
                            <Bar dataKey="actual" fill="#E5DEFF" name="Actual" />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="card-glass mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Task Completion Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      {timeLoading ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="text-center text-muted-foreground">Loading data...</div>
                        </div>
                      ) : timeData.length === 0 ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="text-center text-muted-foreground">No data available</div>
                        </div>
                      ) : (
                        <LineChart
                          data={timeData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`${value} tasks`, 'Completed']}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              borderRadius: '0.5rem',
                              border: 'none', 
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Line type="monotone" dataKey="hours" stroke="#9b87f5" strokeWidth={2} name="Tasks Completed" />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {reportType === "productivity" && (
            <>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <Card className="card-glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Productivity by Time of Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {productivityLoading ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">Loading data...</div>
                          </div>
                        ) : productivityData.length === 0 ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">No productivity data available</div>
                          </div>
                        ) : (
                          <LineChart
                            data={productivityData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`${value}%`, 'Productivity']}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '0.5rem',
                                border: 'none', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Line type="monotone" dataKey="productivity" stroke="#9b87f5" strokeWidth={2} name="Productivity" />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="card-glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Weekly Focus Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {projectLoading ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">Loading data...</div>
                          </div>
                        ) : projectData.length === 0 ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">No projects found</div>
                          </div>
                        ) : (
                          <RPieChart>
                            <Pie
                              data={projectData.filter(project => project.hours > 0)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              dataKey="hours"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {projectData.filter(project => project.hours > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend />
                            <Tooltip 
                              formatter={(value) => [`${value} hrs`, 'Focus Time']}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '0.5rem',
                                border: 'none', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          </RPieChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Daily Productivity Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {timeLoading ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">Loading data...</div>
                          </div>
                        ) : timeData.length === 0 ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-muted-foreground">No data available</div>
                          </div>
                        ) : (
                          <BarChart 
                            data={timeData} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`${value} hrs`, 'Hours']}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '0.5rem',
                                border: 'none', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Bar dataKey="hours" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
