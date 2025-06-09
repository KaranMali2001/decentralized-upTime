import { useAxiosClient } from "@/config/axios";
import { createPayoutApiClient, type WithdrawRequest } from "@/lib/payoutApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
export const payoutKeys = {
  all: ["payout"] as const,
  balance: (publicKey: string) =>
    [...payoutKeys.all, "balance", publicKey] as const,
  message: (publicKey: string) =>
    [...payoutKeys.all, "message", publicKey] as const,
};

// Get payout balance
export function usePayoutBalance(publicKey: string) {
  const axiosClient = useAxiosClient();
  const api = createPayoutApiClient(axiosClient);

  return useQuery({
    queryKey: payoutKeys.balance(publicKey),
    queryFn: () => api.getBalance(publicKey),
    enabled: !!publicKey && publicKey.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}

// Get message to sign
export function useGetMessage() {
  const axiosClient = useAxiosClient();
  const api = createPayoutApiClient(axiosClient);

  return useMutation({
    mutationFn: (publicKey: string) => api.getMessage(publicKey),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to get message");
    },
  });
}

// Process withdrawal
export function useWithdraw() {
  const queryClient = useQueryClient();
  const axiosClient = useAxiosClient();
  const api = createPayoutApiClient(axiosClient);

  return useMutation({
    mutationFn: (withdrawData: WithdrawRequest) => api.withdraw(withdrawData),
    onSuccess: (data, variables) => {
      // Invalidate balance query to refresh the data
      queryClient.invalidateQueries({
        queryKey: payoutKeys.balance(variables.publicKey),
      });

      if (data.success) {
        toast.success(data.message || "Withdrawal processed successfully!");
      } else {
        toast.error(data.message || "Withdrawal failed");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process withdrawal");
    },
  });
}
