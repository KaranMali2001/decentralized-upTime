"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";
function OverViewCard({
  activeWebsites,
  totalWebsites,
  upWebsites,
  overallUptime,
}: {
  activeWebsites: { avgLatency: number }[];
  totalWebsites: number;
  upWebsites: number;
  overallUptime: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
          <div
            className={`h-3 w-3 rounded-full ${upWebsites === totalWebsites ? "bg-green-500" : "bg-red-500"}`}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {upWebsites}/{totalWebsites}
          </div>
          <p className="text-xs text-muted-foreground">Services Online</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overallUptime.toFixed(1)}%</div>
          <Progress value={overallUptime} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg Response Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(
              activeWebsites.reduce((acc, w) => acc + w.avgLatency, 0) /
                totalWebsites
            )}
            ms
          </div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Incidents</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2</div>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default OverViewCard;
