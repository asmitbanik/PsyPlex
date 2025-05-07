
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProgressMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    positive: boolean;
  };
  trendIndicator?: "significant-improvement" | "improving" | "stable" | "declining" | "significant-decline";
  progressValue?: number;
  progressColor?: string;
  icon?: React.ReactNode;
}

const ProgressMetricCard = ({
  title,
  value,
  subtitle,
  change,
  trendIndicator,
  progressValue,
  progressColor = "bg-therapy-purple",
  icon
}: ProgressMetricCardProps) => {
  return (
    <Card className="shadow-md border-0 transition-all duration-200 hover:shadow-lg relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 ${progressColor}`}></div>
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
          <div className="text-2xl font-bold">{value}</div>
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
              className="h-2 bg-gray-100"
              indicatorClassName={progressColor}
            />
          </div>
        )}

        {trendIndicator && (
          <div className="mt-3">
            <Badge variant="outline" className={
              trendIndicator === "significant-improvement" ? "bg-green-50 text-green-700 border-green-200" :
              trendIndicator === "improving" ? "bg-green-50 text-green-600 border-green-200" :
              trendIndicator === "stable" ? "bg-gray-50 text-gray-700 border-gray-200" :
              trendIndicator === "declining" ? "bg-amber-50 text-amber-700 border-amber-200" :
              "bg-red-50 text-red-700 border-red-200"
            }>
              <span className="flex items-center">
                {trendIndicator === "significant-improvement" && <ArrowUp className="h-3 w-3 mr-1" />}
                {trendIndicator === "improving" && <ArrowUp className="h-3 w-3 mr-1" />}
                {trendIndicator === "stable" && <Activity className="h-3 w-3 mr-1" />}
                {trendIndicator === "declining" && <ArrowDown className="h-3 w-3 mr-1" />}
                {trendIndicator === "significant-decline" && <ArrowDown className="h-3 w-3 mr-1" />}
                {
                  trendIndicator === "significant-improvement" ? "Significant improvement" :
                  trendIndicator === "improving" ? "Improving" :
                  trendIndicator === "stable" ? "Stable" :
                  trendIndicator === "declining" ? "Declining" :
                  "Significant decline"
                }
              </span>
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressMetricCard;
