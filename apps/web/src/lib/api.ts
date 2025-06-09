// API functions that use the custom axios client hook
import type { AxiosInstance } from "axios";

// Interface for the API response structure
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Website {
  id: number;
  url: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status?:
    | "up"
    | "down"
    | "unknown"
    | "unreachable"
    | "timeout"
    | "error"
    | null;
  latency?: number | null;
  updateFrom?: string | null;
  // Additional calculated fields
  uptime?: number;
  incidents?: number;
  lastCheck?: string;
}

export interface CreateWebsiteRequest {
  url: string;
  title: string;
  description?: string;
}

// Helper function to process website data and calculate metrics
const processWebsiteData = (websites: Website[]): Website[] => {
  if (!websites || websites.length === 0) {
    return [];
  }

  // Group websites by ID to calculate metrics
  const websiteMap = new Map<number, Website[]>();

  websites.forEach((website) => {
    if (!websiteMap.has(website.id)) {
      websiteMap.set(website.id, []);
    }
    websiteMap.get(website.id)?.push(website);
  });

  // Process each website group
  return Array.from(websiteMap.entries()).map(([id, entries]) => {
    // Use the first entry as the base website data
    const baseWebsite = entries[0];

    // If there's only one entry with no status, return it with default values
    if (entries.length === 1 && baseWebsite.status === null) {
      return {
        ...baseWebsite,
        uptime: 0,
        incidents: 0,
        lastCheck: "No data",
      };
    }

    // Filter entries with status data
    const entriesWithStatus = entries.filter((e) => e.status !== null);

    if (entriesWithStatus.length === 0) {
      return {
        ...baseWebsite,
        uptime: 0,
        incidents: 0,
        lastCheck: "No data",
      };
    }

    // Calculate metrics
    const upEntries = entriesWithStatus.filter((e) => e.status === "up");
    const uptime = (upEntries.length / entriesWithStatus.length) * 100;

    // Calculate incidents (status changes from up to down)
    let incidents = 0;
    const sortedEntries = [...entriesWithStatus].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Get the latest entry for current status
    const latestEntry = sortedEntries[0];

    // Count incidents
    for (let i = 1; i < sortedEntries.length; i++) {
      if (sortedEntries[i - 1].status !== sortedEntries[i].status) {
        incidents++;
      }
    }

    // Calculate average latency from entries with valid latency
    const validLatencyEntries = entriesWithStatus.filter(
      //@ts-ignore
      (e) => e.latency !== null && e.latency > 0
    );
    const avgLatency =
      validLatencyEntries.length > 0
        ? validLatencyEntries.reduce((sum, e) => sum + (e.latency || 0), 0) /
          validLatencyEntries.length
        : 0;

    return {
      ...baseWebsite,
      status: latestEntry.status,
      latency: avgLatency,
      uptime: Math.round(uptime * 10) / 10, // Round to 1 decimal
      incidents,
      lastCheck: new Date(latestEntry.updatedAt).toLocaleString(),
      updateFrom: latestEntry.updateFrom,
    };
  });
};

// API functions that accept axios client as parameter
export const createApiClient = (axiosClient: AxiosInstance) => ({
  // Fetch all websites
  getWebsites: async (): Promise<Website[]> => {
    try {
      const response =
        await axiosClient.get<ApiResponse<Website[]>>("/website");

      if (!response.data.success) {
        throw new Error("API returned unsuccessful response");
      }

      // Process the website data to calculate metrics
      return processWebsiteData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch websites:", error);
      throw new Error("Failed to fetch websites");
    }
  },

  // Create a new website
  createWebsite: async (data: CreateWebsiteRequest): Promise<Website> => {
    try {
      // Validate required fields
      if (!data.url || !data.title) {
        throw new Error("URL and title are required");
      }

      // Validate URL format
      try {
        new URL(data.url);
      } catch {
        throw new Error("Please enter a valid URL");
      }
      console.log("data", data);
      const response = await axiosClient.post<ApiResponse<Website>>(
        "/website",
        data
      );

      if (!response.data.success) {
        throw new Error("Failed to create website");
      }

      const newWebsite = response.data.data;

      // Return with default metrics since it's newly created
      return {
        ...newWebsite,
        uptime: 0,
        status: "unknown",
        lastCheck: "Just created",
        incidents: 0,
      };
    } catch (error: any) {
      console.error("Failed to create website:", error);
      if (error.response?.status === 409) {
        throw new Error("A website with this URL already exists");
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create website"
      );
    }
  },

  // Delete a website
  deleteWebsite: async (id: number): Promise<void> => {
    try {
      await axiosClient.delete(`/website/${id}`);
    } catch (error: any) {
      console.error("Failed to delete website:", error);
      if (error.response?.status === 404) {
        throw new Error("Website not found");
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete website"
      );
    }
  },

  // Update a website
  updateWebsite: async (
    id: number,
    data: Partial<CreateWebsiteRequest>
  ): Promise<Website> => {
    try {
      const response = await axiosClient.put<ApiResponse<Website>>(
        `/website/${id}`,
        data
      );

      if (!response.data.success) {
        throw new Error("Failed to update website");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Failed to update website:", error);
      if (error.response?.status === 404) {
        throw new Error("Website not found");
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update website"
      );
    }
  },

  // Health check endpoint
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    try {
      const response = await axiosClient.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw new Error("Backend service is unavailable");
    }
  },
});
