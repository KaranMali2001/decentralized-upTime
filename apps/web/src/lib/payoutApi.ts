// Payout API functions with improved UX and lamports conversion
import type { AxiosInstance } from "axios";

export interface PayoutBalance {
  balence: number; // Note: keeping the typo from backend (lamports)
}

export interface PayoutMessage {
  message: string;
  expiresAt: string;
}

export interface WithdrawRequest {
  publicKey: string;
  amount: number; // in lamports
  signedMessage: string;
  signature: Uint8Array;
}

export interface WithdrawResponse {
  success: boolean;
  data?: any;
  transactionSignature?: string;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Utility functions for lamports/SOL conversion
export const LAMPORTS_PER_SOL = 1_000_000_000;

export const lamportsToSol = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

export const solToLamports = (sol: number): number => {
  return Math.floor(sol * LAMPORTS_PER_SOL);
};

export const formatSol = (lamports: number, decimals = 4): string => {
  return lamportsToSol(lamports).toFixed(decimals);
};

export const formatLamports = (lamports: number): string => {
  return lamports.toLocaleString();
};

// Process website data with proper balance conversion
const processBalanceData = (balance: PayoutBalance) => {
  return {
    ...balance,
    solBalance: lamportsToSol(balance.balence),
    formattedSol: formatSol(balance.balence),
    formattedLamports: formatLamports(balance.balence),
  };
};

export const createPayoutApiClient = (axiosClient: AxiosInstance) => ({
  // Get payout balance for a public key
  getBalance: async (publicKey: string) => {
    try {
      const response = await axiosClient.get<ApiResponse<PayoutBalance>>(
        `/payout/balance/${publicKey}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to fetch balance");
      }

      return processBalanceData(response.data.data);
    } catch (error: any) {
      console.error("Failed to fetch payout balance:", error);
      if (error.response?.status === 404) {
        throw new Error("Validator not found. Please check your public key.");
      }
      if (error.response?.status === 400) {
        throw new Error("Invalid public key format.");
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch balance"
      );
    }
  },

  // Get message to sign
  getMessage: async (publicKey: string): Promise<PayoutMessage> => {
    try {
      const response = await axiosClient.get<PayoutMessage>(
        `/payout/getMessage/${publicKey}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to get message:", error);
      if (error.response?.status === 404) {
        throw new Error("Validator not found. Please verify your public key.");
      }
      if (error.response?.status === 400) {
        throw new Error("Invalid public key format.");
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate authentication message"
      );
    }
  },

  // Process withdrawal with lamports conversion
  withdraw: async (
    withdrawData: WithdrawRequest
  ): Promise<WithdrawResponse> => {
    try {
      const response = await axiosClient.post<WithdrawResponse>(
        "/payout/withdraw",
        withdrawData
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to process withdrawal:", error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        const message = error.response?.data?.message;
        if (message?.includes("Insufficient funds")) {
          throw new Error("Insufficient balance for this withdrawal amount.");
        }
        if (message?.includes("Invalid signature")) {
          throw new Error(
            "Transaction signature verification failed. Please try again."
          );
        }
        if (message?.includes("expired")) {
          throw new Error(
            "Authentication message has expired. Please generate a new one."
          );
        }
        throw new Error(message || "Invalid withdrawal request.");
      }

      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please verify your signature.");
      }

      if (error.response?.status === 500) {
        throw new Error("Server error occurred. Please try again later.");
      }

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to process withdrawal"
      );
    }
  },
});
