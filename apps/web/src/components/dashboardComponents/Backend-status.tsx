"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHealthCheck } from "@/hooks/useWebsite";
import { AlertTriangle, CheckCircle, Loader2, Server } from "lucide-react";

export function BackendStatus() {
  const { data: health, isLoading, error } = useHealthCheck();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Server className="h-4 w-4" />
          Backend Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Checking...</span>
            </>
          ) : error ? (
            <>
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <Badge variant="destructive">Offline</Badge>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Badge variant="default">Online</Badge>
            </>
          )}
        </div>
        {health && (
          <CardDescription className="mt-2 text-xs">
            Last checked: {new Date(health.timestamp).toLocaleTimeString()}
          </CardDescription>
        )}
        {error && (
          <CardDescription className="mt-2 text-xs text-red-600">
            Backend service unavailable at {process.env.NEXT_PUBLIC_API_URL}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
