
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden card-glass hover-scale", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="stat-label">{title}</p>
            <p className="stat-value">{value}</p>
            
            {trend && (
              <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span className="flex items-center">
                  {trend.isPositive ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      className="w-4 h-4 mr-1"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      className="w-4 h-4 mr-1"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                  {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
          
          {Icon && (
            <div className={cn("p-2 rounded-full bg-purple-100", iconClassName)}>
              <Icon className="h-5 w-5 text-purple-600" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
