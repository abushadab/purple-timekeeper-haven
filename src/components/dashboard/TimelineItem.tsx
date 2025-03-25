
import React from "react";
import { LucideIcon } from "lucide-react";

interface TimelineItemProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  time: string;
  isLast?: boolean;
}

const TimelineItem = ({
  icon: Icon,
  iconClassName,
  title,
  description,
  time,
  isLast = false,
}: TimelineItemProps) => {
  return (
    <div className="flex gap-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${iconClassName || "bg-purple-100"}`}>
          <Icon className="h-4 w-4 text-purple-600" />
        </div>
        {!isLast && <div className="w-px h-full bg-border mt-2" />}
      </div>
      
      <div className="pb-6 pt-1 space-y-1.5">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-medium">{title}</h4>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default TimelineItem;
