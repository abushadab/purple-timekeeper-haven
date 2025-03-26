
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
}

const FilterSelector: React.FC<FilterSelectorProps> = ({
  projectFilters,
  statusFilters,
  typeFilters,
  onFilterChange,
}) => {
  return (
    <Popover>
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
            options={projectFilters}
            onChange={(id, checked) => onFilterChange("projects", id, checked)}
          />
          <Separator />
          <FilterCategory
            title="Status"
            options={statusFilters}
            onChange={(id, checked) => onFilterChange("status", id, checked)}
          />
          <Separator />
          <FilterCategory
            title="Task Type"
            options={typeFilters}
            onChange={(id, checked) => onFilterChange("type", id, checked)}
          />
          <div className="flex justify-between">
            <Button variant="outline" size="sm">
              Reset Filters
            </Button>
            <Button size="sm" className="purple-gradient text-white border-none">
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterSelector;
