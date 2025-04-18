
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, 
  Plus, 
  Filter,
  SlidersHorizontal, 
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TaskHeaderProps {
  onAddTask: () => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  filterOptions: { priority: string };
  setFilterOptions: (options: { priority: string }) => void;
}

export const TaskHeader = ({ 
  onAddTask, 
  sortOption, 
  setSortOption, 
  filterOptions, 
  setFilterOptions 
}: TaskHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-bold">Tasks</h2>
      </div>
      
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4">
            <div className="space-y-2">
              <h4 className="font-medium">Filter Tasks</h4>
              <div className="pt-2">
                <h5 className="text-sm font-medium mb-1.5">Priority</h5>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="priority"
                      checked={filterOptions.priority === "all"}
                      onChange={() => setFilterOptions({ priority: "all" })}
                    />
                    All
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="priority"
                      checked={filterOptions.priority === "high"}
                      onChange={() => setFilterOptions({ priority: "high" })}
                    />
                    High
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="priority"
                      checked={filterOptions.priority === "medium"}
                      onChange={() => setFilterOptions({ priority: "medium" })}
                    />
                    Medium
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="priority"
                      checked={filterOptions.priority === "low"}
                      onChange={() => setFilterOptions({ priority: "low" })}
                    />
                    Low
                  </label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1">
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4">
            <div className="space-y-2">
              <h4 className="font-medium">Sort Tasks</h4>
              <div className="pt-2">
                <h5 className="text-sm font-medium mb-1.5">Sort by</h5>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortOption === "dueDate"}
                      onChange={() => setSortOption("dueDate")}
                    />
                    Due Date
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortOption === "priority"}
                      onChange={() => setSortOption("priority")}
                    />
                    Priority
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortOption === "title"}
                      onChange={() => setSortOption("title")}
                    />
                    Title
                  </label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button 
          className="purple-gradient text-white border-none gap-1"
          onClick={onAddTask}
        >
          <Plus size={16} />
          <span>Add Task</span>
        </Button>
      </div>
    </div>
  );
};
