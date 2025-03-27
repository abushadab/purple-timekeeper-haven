
import * as React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

export interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

interface FilterCategoryProps {
  title: string;
  options: FilterOption[];
  onChange: (value: string, checked: boolean) => void;
}

const FilterCategory: React.FC<FilterCategoryProps> = ({
  title,
  options,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
      <div className="grid gap-1.5">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={option.checked}
              onCheckedChange={(checked) => onChange(option.id, !!checked)}
            />
            <Label htmlFor={option.id} className="text-sm font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

interface FilterSelectorProps {
  projectFilters: FilterOption[];
  statusFilters: FilterOption[];
  typeFilters: FilterOption[];
  onFilterChange: (category: string, id: string, checked: boolean) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({
  projectFilters,
  statusFilters,
  typeFilters,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
}) => {
  // Create temporary state for filters
  const [tempProjectFilters, setTempProjectFilters] = React.useState<FilterOption[]>(projectFilters);
  const [tempStatusFilters, setTempStatusFilters] = React.useState<FilterOption[]>(statusFilters);
  const [tempTypeFilters, setTempTypeFilters] = React.useState<FilterOption[]>(typeFilters);
  const [open, setOpen] = React.useState(false);

  // Reset filters when the popover opens to match current filter state
  React.useEffect(() => {
    if (open) {
      setTempProjectFilters([...projectFilters]);
      setTempStatusFilters([...statusFilters]);
      setTempTypeFilters([...typeFilters]);
    }
  }, [open, projectFilters, statusFilters, typeFilters]);

  const handleTempFilterChange = (category: string, id: string, checked: boolean) => {
    if (category === "projects") {
      setTempProjectFilters(
        tempProjectFilters.map((filter) =>
          filter.id === id ? { ...filter, checked } : filter
        )
      );
    } else if (category === "status") {
      setTempStatusFilters(
        tempStatusFilters.map((filter) =>
          filter.id === id ? { ...filter, checked } : filter
        )
      );
    } else if (category === "type") {
      setTempTypeFilters(
        tempTypeFilters.map((filter) =>
          filter.id === id ? { ...filter, checked } : filter
        )
      );
    }
  };

  const handleResetFilters = () => {
    setTempProjectFilters(tempProjectFilters.map(filter => ({ ...filter, checked: false })));
    setTempStatusFilters(tempStatusFilters.map(filter => ({ ...filter, checked: false })));
    setTempTypeFilters(tempTypeFilters.map(filter => ({ ...filter, checked: false })));
  };

  const handleApplyFilters = () => {
    // Apply all temporary filters to the actual filters
    tempProjectFilters.forEach(filter => {
      onFilterChange("projects", filter.id, filter.checked);
    });
    
    tempStatusFilters.forEach(filter => {
      onFilterChange("status", filter.id, filter.checked);
    });
    
    tempTypeFilters.forEach(filter => {
      onFilterChange("type", filter.id, filter.checked);
    });
    
    // Call the parent's apply filters method
    onApplyFilters();
    
    // Close the popover
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-1">
          <Filter size={16} />
          <span>Filters</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Filters</h3>
            <p className="text-xs text-muted-foreground">
              Narrow down the reports based on various criteria.
            </p>
          </div>
          <FilterCategory
            title="Projects"
            options={tempProjectFilters}
            onChange={(id, checked) => handleTempFilterChange("projects", id, checked)}
          />
          <Separator />
          <FilterCategory
            title="Status"
            options={tempStatusFilters}
            onChange={(id, checked) => handleTempFilterChange("status", id, checked)}
          />
          <Separator />
          <FilterCategory
            title="Task Type"
            options={tempTypeFilters}
            onChange={(id, checked) => handleTempFilterChange("type", id, checked)}
          />
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
            <Button 
              size="sm" 
              className="purple-gradient text-white border-none"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterSelector;
