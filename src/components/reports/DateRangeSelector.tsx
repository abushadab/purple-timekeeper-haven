
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangeSelectorProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

const DateRangeSelector = ({ dateRange, setDateRange }: DateRangeSelectorProps) => {
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(dateRange);

  // Apply the selected date range
  const applyDateRange = () => {
    setDateRange(tempRange);
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className="w-[260px] justify-start text-left font-normal gap-1"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                "Pick a date range"
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={tempRange}
              onSelect={setTempRange}
              numberOfMonths={2}
              className="pointer-events-auto"
            />
            <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTempRange(dateRange)}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={applyDateRange}
              >
                Apply Range
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeSelector;
