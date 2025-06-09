import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { Website } from "@/lib/api";
import { UptimeModal } from "./upTimeModel";
import {
  getStatusBadgeVariant,
  getStatusColor,
  getStatusDisplayText,
} from "./utils/utils";

export function WebsiteCard({ website }: { website: Website }) {
  // Generate mini status bars based on uptime percentage
  const generateMiniStatusBars = (website: Website) => {
    const bars = [];
    const upProbability = Math.max((website.uptime || 0) / 100, 0.1); // Minimum 10% chance

    for (let i = 0; i < 10; i++) {
      const randomValue = Math.random();
      let status: string;

      if (randomValue < upProbability) {
        status = "up";
      } else if (randomValue < upProbability + 0.05) {
        status = "timeout";
      } else if (randomValue < upProbability + 0.1) {
        status = "error";
      } else {
        status = "down";
      }

      bars.push({ status });
    }

    return bars;
  };

  const miniStatusBars = generateMiniStatusBars(website);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${getStatusColor(website.status)}`}
                />
                <CardTitle className="text-lg truncate">
                  {website.title}
                </CardTitle>
              </div>
              <Badge variant={getStatusBadgeVariant(website.status)}>
                {getStatusDisplayText(website.status)}
              </Badge>
            </div>
            <CardDescription className="text-sm truncate">
              {website.url}
            </CardDescription>
            {website.description && (
              <CardDescription className="text-xs text-muted-foreground truncate">
                {website.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="font-medium">
                {website.uptime?.toFixed(1) || "0.0"}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Response Time
              </span>
              <span className="font-medium">
                {Math.round(website.latency || 0)}ms
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Check</span>
              <span className="font-medium text-xs truncate">
                {website.lastCheck || "Never"}
              </span>
            </div>

            {website.incidents !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Incidents</span>
                <span className="font-medium">{website.incidents}</span>
              </div>
            )}

            {/* Mini status bars */}
            <div className="flex gap-1 mt-3">
              {miniStatusBars.map((bar, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded ${getStatusColor(bar.status)}`}
                  title={getStatusDisplayText(bar.status)}
                />
              ))}
            </div>

            {/* Additional info */}
            {website.updateFrom && (
              <div className="text-xs text-muted-foreground text-center">
                Monitored from: {website.updateFrom}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>

      <UptimeModal website={website} />
    </Dialog>
  );
}
