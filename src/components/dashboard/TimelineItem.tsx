
import React from "react";
import { CheckCircle, Circle, Activity } from "lucide-react";

interface TimelineItemProps {
  title: string;
  projectName: string;
  time: string;
  status: 'in_progress' | 'completed' | 'not_started';
}

const TimelineItem = ({
  title,
  projectName,
  time,
  status = 'not_started',
}: TimelineItemProps) => {
  // Get status-based styling
  const getStatusStyles = () => {
    switch (status) {
      case 'in_progress':
        return {
          card: "bg-purple-50 rounded-xl mb-4",
          icon: <Activity className="h-5 w-5 text-purple-500" />,
          statusText: "In Progress",
          statusColor: "text-purple-500",
        };
      case 'completed':
        return {
          card: "bg-green-50 rounded-xl mb-4",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          statusText: "Completed",
          statusColor: "text-green-500",
        };
      case 'not_started':
      default:
        return {
          card: "bg-slate-50 rounded-xl mb-4",
          icon: <Circle className="h-5 w-5 text-slate-400" />,
          statusText: "Not Started",
          statusColor: "text-slate-400",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={styles.card}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {styles.icon}
            <span className={`text-sm font-bold ${styles.statusColor}`}>
              {styles.statusText}
            </span>
          </div>
          <span className="text-sm text-slate-500">{time}</span>
        </div>
        
        <h4 className="text-base font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-sm font-medium text-slate-600">{projectName}</p>
      </div>
    </div>
  );
};

export default TimelineItem;
