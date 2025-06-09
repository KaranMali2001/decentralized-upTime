"use client";
import { AddWebsiteModal } from "@/components/dashboardComponents/addWebsiteModel";
import { BackendStatus } from "@/components/dashboardComponents/Backend-status";
import { LoadingSkeleton } from "@/components/dashboardComponents/loadingSkeleton";
import { WebsiteCard } from "@/components/dashboardComponents/websiteCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebsites } from "@/hooks/useWebsite";
import { AlertTriangle, Clock, Globe, Plus, TrendingUp } from "lucide-react";

export default function DashboardV1WithQuery() {
  const { data: websites, isLoading, error, refetch } = useWebsites();

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Failed to load websites
            </h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => refetch()}>Try Again</Button>
              <BackendStatus />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeWebsites = websites || [];
  const upWebsites = activeWebsites.filter((w) => w.status === "up").length;
  const totalWebsites = activeWebsites.length;
  const overallUptime =
    totalWebsites > 0
      ? activeWebsites.reduce((acc, w) => acc + (w.uptime || 0), 0) /
        totalWebsites
      : 0;
  const avgLatency =
    totalWebsites > 0
      ? Math.round(
          activeWebsites.reduce((acc, w) => acc + (w.latency || 0), 0) /
            totalWebsites
        )
      : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Uptime Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your websites and services
            </p>
          </div>
          <div className="flex items-center gap-4">
            <BackendStatus />
            <AddWebsiteModal />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Status
              </CardTitle>
              <div
                className={`h-3 w-3 rounded-full ${upWebsites === totalWebsites && totalWebsites > 0 ? "bg-green-500" : "bg-red-500"}`}
              />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {upWebsites}/{totalWebsites}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Services Online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Uptime
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {overallUptime.toFixed(1)}%
                  </div>
                  <Progress value={overallUptime} className="mt-2" />
                </>
              )}
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
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{avgLatency}ms</div>
              )}
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-8" />
              ) : (
                <div className="text-2xl font-bold">
                  {websites?.reduce((acc, w) => acc + (w.incidents || 0), 0) ||
                    0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Websites Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : websites && websites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {websites.map((website) => (
              <WebsiteCard key={website.id} website={website} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No websites yet</h2>
            <p className="text-muted-foreground mb-4">
              Add your first website to start monitoring its uptime and
              performance.
            </p>
            <AddWebsiteModal
              trigger={
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Website
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
