"use client";

import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

export const getStatusColor = (status: string | undefined | null) => {
  switch (status) {
    case "up":
      return "bg-green-500";
    case "down":
      return "bg-red-500";
    case "error":
      return "bg-orange-500";
    case "timeout":
      return "bg-yellow-500";
    case "unreachable":
      return "bg-purple-500";
    case "unknown":
      return "bg-blue-500";
    default:
      return "bg-gray-400";
  }
};

// Helper function to get status badge variant
export const getStatusBadgeVariant = (status: string | undefined | null) => {
  switch (status) {
    case "up":
      return "default";
    case "down":
      return "destructive";
    case "error":
      return "outline";
    case "timeout":
      return "secondary";
    case "unreachable":
      return "outline";
    case "unknown":
      return "secondary";
    default:
      return "outline";
  }
};

// Helper function to get status display text
export const getStatusDisplayText = (status: string | undefined | null) => {
  switch (status) {
    case "up":
      return "Online";
    case "down":
      return "Offline";
    case "error":
      return "Error";
    case "timeout":
      return "Timeout";
    case "unreachable":
      return "Unreachable";
    case "unknown":
      return "Unknown";
    default:
      return "No Data";
  }
};

// Helper function to get status icon
export const getStatusIcon = (status: string | undefined | null) => {
  switch (status) {
    case "up":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "down":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "error":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "timeout":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "unreachable":
      return <XCircle className="h-4 w-4 text-purple-500" />;
    case "unknown":
      return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-400" />;
  }
};
