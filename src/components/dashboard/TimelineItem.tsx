
import React from "react";
import { LucideIcon } from "lucide-react";

interface TimelineItemProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  time: string;
  isLast?: boolean;
  status?: 'in_progress' | 'completed' | 'not_started';
}

const TimelineItem = ({
  icon: Icon,
  iconClassName,
  title,
  description,
  time,
  isLast = false,
  status = 'not_started',
}: TimelineItemProps) => {
  // Get status-based styling
  const getStatusStyles = () => {
    switch (status) {
      case 'in_progress':
        return {
          card: "bg-blue-50 border-blue-200",
          icon: "bg-blue-100 text-blue-600",
        };
      case 'completed':
        return {
          card: "bg-green-50 border-green-200",
          icon: "bg-green-100 text-green-600",
        };
      case 'not_started':
      default:
        return {
          card: "bg-white border-gray-200",
          icon: iconClassName || "bg-purple-100 text-purple-600",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="pb-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
      <div className={`flex items-start p-3 rounded-lg border ${styles.card}`}>
        <div className="mr-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${styles.icon}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col">
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        
        <div className="ml-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
