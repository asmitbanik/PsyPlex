
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    positive: boolean;
  };
  progressValue?: number;
  progressColor?: string;
  icon?: React.ReactNode;
}

const ProgressMetricCard = ({
  title,
  value,
  subtitle,
  change,
  progressValue,
  progressColor = "bg-therapy-purple",
  icon
}: ProgressMetricCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && <div className="text-therapy-gray">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-semibold">{value}</div>
          {change && (
            <span
              className={`text-xs font-medium inline-flex items-center ${
                change.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {change.positive ? (
                <ArrowUp className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-0.5" />
              )}
              {change.value}%
            </span>
          )}
        </div>
        
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        
        {progressValue !== undefined && (
          <div className="mt-3">
            <Progress
              value={progressValue}
              className="h-1.5"
              indicatorClassName={progressColor}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressMetricCard;
