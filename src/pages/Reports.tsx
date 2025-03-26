
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, Download, PieChart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

// Sample data for charts
const timeData = [
  { name: 'Mon', hours: 5.2 },
  { name: 'Tue', hours: 7.8 },
  { name: 'Wed', hours: 6.5 },
  { name: 'Thu', hours: 8.0 },
  { name: 'Fri', hours: 4.5 },
  { name: 'Sat', hours: 2.0 },
  { name: 'Sun', hours: 0.5 },
];

const monthlyData = [
  { name: 'Jan', hours: 82 },
  { name: 'Feb', hours: 75 },
  { name: 'Mar', hours: 98 },
  { name: 'Apr', hours: 87 },
  { name: 'May', hours: 105 },
  { name: 'Jun', hours: 92 },
  { name: 'Jul', hours: 78 },
  { name: 'Aug', hours: 110 },
  { name: 'Sep', hours: 95 },
  { name: 'Oct', hours: 86 },
  { name: 'Nov', hours: 0 },
  { name: 'Dec', hours: 0 },
];

const projectData = [
  { name: 'Website Redesign', hours: 42.5, color: '#9b87f5' },
  { name: 'Mobile App Development', hours: 68, color: '#7E69AB' },
  { name: 'E-commerce Integration', hours: 24.5, color: '#6E59A5' },
  { name: 'Marketing Campaign', hours: 56, color: '#D6BCFA' },
  { name: 'Data Analytics Dashboard', hours: 32, color: '#E5DEFF' },
];

const portfolioData = [
  { name: 'Client Work', hours: 156.5, color: '#9b87f5' },
  { name: 'Personal Projects', hours: 42.5, color: '#f97316' },
  { name: 'Learning & Development', hours: 28.0, color: '#4ade80' },
  { name: 'Administrative', hours: 12.5, color: '#0ea5e9' },
  { name: 'Content Creation', hours: 36.0, color: '#d946ef' },
];

const taskStatusData = [
  { name: 'Completed', value: 45, color: '#4ade80' },
  { name: 'In Progress', value: 30, color: '#f97316' },
  { name: 'Not Started', value: 25, color: '#9b87f5' }
];

const taskEfficiencyData = [
  { name: 'Website Redesign', estimate: 50, actual: 42.5 },
  { name: 'Mobile App', estimate: 80, actual: 68 },
  { name: 'E-commerce', estimate: 30, actual: 24.5 },
  { name: 'Marketing', estimate: 45, actual: 56 },
  { name: 'Analytics', estimate: 25, actual: 32 },
];

const productivityData = [
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

const Reports = () => {
  const [period, setPeriod] = useState("week");
  const [reportType, setReportType] = useState("time");
  
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
            
            <div className="flex gap-2">
              <Button variant="outline" className="gap-1">
                <Calendar size={16} />
                <span>Date Range</span>
              </Button>
              <Button variant="outline" className="gap-1">
                <Filter size={16} />
                <span>Filters</span>
              </Button>
              <Button className="purple-gradient text-white border-none gap-1">
                <Download size={16} />
                <span>Export</span>
              </Button>
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
                        <BarChart data={period === "year" ? monthlyData : timeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                        <RPieChart>
                          <Pie
                            data={portfolioData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            dataKey="hours"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {portfolioData.map((entry, index) => (
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
                      <LineChart
                        data={monthlyData}
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
                        <RPieChart>
                          <Pie
                            data={projectData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            dataKey="hours"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {projectData.map((entry, index) => (
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
