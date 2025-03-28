
import React from "react";
import { LucideIcon, Activity, CheckCircle, Circle } from "lucide-react";

interface TimelineItemProps {
  icon?: LucideIcon;
  title: string;
  projectName: string;
  time: string;
  isLast?: boolean;
  status: 'in_progress' | 'completed' | 'not_started';
}

const TimelineItem = ({
  icon,
  title,
  projectName,
  time,
  isLast = false,
  status = 'not_started',
}: TimelineItemProps) => {
  // Get status-based styling
  const getStatusStyles = () => {
    switch (status) {
      case 'in_progress':
        return {
          card: "bg-blue-50 border-blue-50",
          icon: <Activity className="h-5 w-5 text-blue-500" />,
          iconContainer: "text-blue-500",
        };
      case 'completed':
        return {
          card: "bg-green-50 border-green-50",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          iconContainer: "text-green-500",
        };
      case 'not_started':
      default:
        return {
          card: "bg-slate-50 border-slate-50",
          icon: <Circle className="h-5 w-5 text-slate-400" />,
          iconContainer: "text-slate-400",
        };
    }
  };

  const styles = getStatusStyles();
  
  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'in_progress':
        return "In Progress";
      case 'completed':
        return "Completed";
      case 'not_started':
        return "Not Started";
      default:
        return "Not Started";
    }
  };

  return (
    <div className="mb-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
      <div className={`p-4 rounded-lg ${styles.card}`}>
        <div className="flex items-center gap-3 mb-2">
          {styles.icon}
          <span className={`text-sm font-bold ${styles.iconContainer}`}>
            {getStatusText()}
          </span>
          <span className="text-sm text-slate-500 ml-auto">{time}</span>
        </div>
        
        <h4 className="text-base font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-sm font-medium text-slate-700">{projectName}</p>
      </div>
    </div>
  );
};

export default TimelineItem;
