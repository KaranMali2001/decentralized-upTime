import { useAxiosClient } from "@/config/axios";
import {
  createApiClient,
  type CreateWebsiteRequest,
  type Website,
} from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const websiteKeys = {
  all: ["websites"] as const,
  lists: () => [...websiteKeys.all, "list"] as const,
  list: (filters: string) => [...websiteKeys.lists(), { filters }] as const,
  details: () => [...websiteKeys.all, "detail"] as const,
  detail: (id: number) => [...websiteKeys.details(), id] as const,
};

export function useWebsites() {
  const axiosClient = useAxiosClient();
  const api = createApiClient(axiosClient);

  return useQuery({
    queryKey: websiteKeys.lists(),
    queryFn: api.getWebsites,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 2000, // Refetch every minute
  });
}

// Create website mutation
export function useCreateWebsite() {
  const queryClient = useQueryClient();
  const axiosClient = useAxiosClient();
  const api = createApiClient(axiosClient);

  return useMutation({
    mutationFn: api.createWebsite,
    onMutate: async (newWebsite) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: websiteKeys.lists() });

      // Snapshot the previous value
      const previousWebsites = queryClient.getQueryData<Website[]>(
        websiteKeys.lists()
      );

      // Optimistically update to the new value
      queryClient.setQueryData<Website[]>(websiteKeys.lists(), (old) => {
        const optimisticWebsite: Website = {
          id: Date.now(), // Temporary ID
          ...newWebsite,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "unknown",
          uptime: 0,
          latency: 0,
          lastCheck: "Just created",
          incidents: 0,
        };
        return old ? [...old, optimisticWebsite] : [optimisticWebsite];
      });

      // Return a context object with the snapshotted value
      return { previousWebsites };
    },
    onError: (error, newWebsite, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(websiteKeys.lists(), context?.previousWebsites);
      toast.error(error.message || "Failed to add website");
    },
    onSuccess: (newWebsite) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
      toast.success("Website added successfully!");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
    },
  });
}

// Delete website mutation
export function useDeleteWebsite() {
  const queryClient = useQueryClient();
  const axiosClient = useAxiosClient();
  const api = createApiClient(axiosClient);

  return useMutation({
    mutationFn: api.deleteWebsite,
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: websiteKeys.lists() });

      // Snapshot the previous value
      const previousWebsites = queryClient.getQueryData<Website[]>(
        websiteKeys.lists()
      );

      // Optimistically update to the new value
      queryClient.setQueryData<Website[]>(websiteKeys.lists(), (old) => {
        return old ? old.filter((website) => website.id !== deletedId) : [];
      });

      return { previousWebsites };
    },
    onError: (error, deletedId, context) => {
      // If the mutation fails, use the context to roll back
      queryClient.setQueryData(websiteKeys.lists(), context?.previousWebsites);
      toast.error(error.message || "Failed to delete website");
    },
    onSuccess: () => {
      toast.success("Website deleted successfully!");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
    },
  });
}

// Update website mutation
export function useUpdateWebsite() {
  const queryClient = useQueryClient();
  const axiosClient = useAxiosClient();
  const api = createApiClient(axiosClient);

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateWebsiteRequest>;
    }) => api.updateWebsite(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: websiteKeys.lists() });

      // Snapshot the previous value
      const previousWebsites = queryClient.getQueryData<Website[]>(
        websiteKeys.lists()
      );

      // Optimistically update to the new value
      queryClient.setQueryData<Website[]>(websiteKeys.lists(), (old) => {
        return old
          ? old.map((website) =>
              website.id === id
                ? {
                    ...website,
                    ...data,
                    updatedAt: new Date().toISOString(),
                  }
                : website
            )
          : [];
      });

      return { previousWebsites };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context to roll back
      queryClient.setQueryData(websiteKeys.lists(), context?.previousWebsites);
      toast.error(error.message || "Failed to update website");
    },
    onSuccess: () => {
      toast.success("Website updated successfully!");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
    },
  });
}

// Health check hook
export function useHealthCheck() {
  const axiosClient = useAxiosClient();
  const api = createApiClient(axiosClient);

  return useQuery({
    queryKey: ["health"],
    queryFn: api.healthCheck,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
