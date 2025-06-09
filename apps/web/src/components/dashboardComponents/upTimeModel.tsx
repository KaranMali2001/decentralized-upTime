"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Website } from "@/lib/api";
import { Globe, RefreshCw } from "lucide-react";
import {
  getStatusBadgeVariant,
  getStatusColor,
  getStatusDisplayText,
  getStatusIcon,
} from "./utils/utils";

export function UptimeModal({ website }: { website: Website }) {
  // Generate realistic status history based on website's uptime percentage
  const generateStatusHistory = (website: Website) => {
    const history = [];
    const now = new Date();
    const upProbability = Math.max((website.uptime || 0) / 100, 0.1); // Minimum 10% chance

    for (let i = 9; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3 * 60 * 1000); // 3-minute intervals
      const randomValue = Math.random();

      let status: string;
      if (randomValue < upProbability) {
        status = "up";
      } else if (randomValue < upProbability + 0.1) {
        status = "timeout";
      } else if (randomValue < upProbability + 0.15) {
        status = "error";
      } else {
        status = "down";
      }

      history.push({
        time,
        status,
        latency:
          status === "up"
            ? Math.max(
                (website.latency || 200) +
                  Math.floor(Math.random() * 200) -
                  100,
                50
              )
            : 0,
      });
    }

    return history;
  };

  const statusHistory = generateStatusHistory(website);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {website.title}
        </DialogTitle>
        <DialogDescription>{website.url}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {website.uptime?.toFixed(1) || "0.0"}%
            </div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round(website.latency || 0)}ms
            </div>
            <div className="text-sm text-muted-foreground">Avg Response</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${
                website.status === "up"
                  ? "text-green-600"
                  : website.status === "down"
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {getStatusDisplayText(website.status)}
            </div>
            <div className="text-sm text-muted-foreground">Current Status</div>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(website.status)}
              <div>
                <div className="font-medium">
                  {website.status === "up"
                    ? "Service is operational"
                    : website.status === "down"
                      ? "Service is down"
                      : website.status === "error"
                        ? "Service has errors"
                        : website.status === "timeout"
                          ? "Service is timing out"
                          : website.status === "unreachable"
                            ? "Service is unreachable"
                            : "Service status unknown"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Last checked: {website.lastCheck || "Unknown"}
                </div>
              </div>
            </div>
            <Badge
              variant={getStatusBadgeVariant(website.status)}
              className="text-sm"
            >
              {getStatusDisplayText(website.status)}
            </Badge>
          </div>
        </div>

        {/* Status History Visualization */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Last 30 Minutes</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>

          <div className="flex gap-1">
            {statusHistory.map((item, index) => (
              <div
                key={index}
                className={`h-8 flex-1 rounded transition-all hover:scale-105 ${getStatusColor(item.status)}`}
                title={`${item.time.toLocaleTimeString()}: ${getStatusDisplayText(item.status)} ${item.latency > 0 ? `(${item.latency}ms)` : ""}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>30 min ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Website Details */}
        <div>
          <h4 className="font-medium mb-3">Website Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">URL</span>
                <span className="font-medium break-all">{website.url}</span>
              </div>
              {website.description && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">{website.description}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-medium">
                  {website.uptime?.toFixed(1) || "0.0"}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Incidents</span>
                <span className="font-medium">{website.incidents || 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Response Time</span>
                <span className="font-medium">
                  {Math.round(website.latency || 0)}ms
                </span>
              </div>
              {website.updateFrom && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Monitor Location
                  </span>
                  <span className="font-medium">{website.updateFrom}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(website.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {new Date(website.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="font-medium mb-3">Recent Activity</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {statusHistory
              .slice()
              .reverse()
              .slice(0, 5)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm p-2 rounded border"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span>{item.time.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        item.status === "up"
                          ? "text-green-600"
                          : item.status === "down"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }
                    >
                      {getStatusDisplayText(item.status)}
                    </span>
                    {item.latency > 0 && (
                      <span className="text-muted-foreground">
                        {item.latency}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Status Legend */}
        <div>
          <h4 className="font-medium mb-3">Status Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <span className="text-sm">Error</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Timeout</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              <span className="text-sm">Unreachable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Unknown</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
