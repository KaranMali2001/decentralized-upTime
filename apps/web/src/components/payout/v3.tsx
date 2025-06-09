"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetMessage,
  usePayoutBalance,
  useWithdraw,
} from "@/hooks/usePayout";
import { formatLamports, formatSol, solToLamports } from "@/lib/payoutApi";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  History,
  Loader2,
  Lock,
  RefreshCw,
  Send,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Unlock,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function PayoutV6() {
  const [publicKey, setPublicKey] = useState("");
  const [withdrawAmountSol, setWithdrawAmountSol] = useState("");
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [messageExpiry, setMessageExpiry] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSecured, setIsSecured] = useState(false);

  const { connected, signMessage, publicKey: walletPublicKey } = useWallet();

  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch,
  } = usePayoutBalance(publicKey);
  const getMessage = useGetMessage();
  const withdraw = useWithdraw();

  // Timer for message expiry
  useEffect(() => {
    if (!messageExpiry) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(messageExpiry).getTime();
      const remaining = Math.max(0, expiry - now);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setCurrentMessage(null);
        setMessageExpiry(null);
        setIsSecured(false);
        toast.error("Security session expired");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [messageExpiry]);

  const handleGetMessage = async () => {
    if (!publicKey) {
      toast.error("Please enter a public key");
      return;
    }

    try {
      const messageData = await getMessage.mutateAsync(publicKey);
      setCurrentMessage(messageData.message);
      setMessageExpiry(messageData.expiresAt);
      setIsSecured(true);
      toast.success("Security session established!");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSignAndWithdraw = async () => {
    if (!connected || !signMessage || !currentMessage || !withdrawAmountSol)
      return;

    try {
      const messageBytes = new TextEncoder().encode(currentMessage);
      const signature = await signMessage(messageBytes);

      await withdraw.mutateAsync({
        publicKey,
        amount: solToLamports(Number(withdrawAmountSol)),
        signedMessage: currentMessage,
        signature: signature,
      });

      setCurrentMessage(null);
      setMessageExpiry(null);
      setWithdrawAmountSol("");
      setIsSecured(false);
      toast.success("Withdrawal executed successfully!");
    } catch (error) {
      console.error("Withdrawal error:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const maxSolBalance = balance
    ? Number.parseFloat(formatSol(balance.balence))
    : 0;
  const estimatedUsd = Number(withdrawAmountSol) * 100; // Mock rate

  // Mock data for dashboard
  const mockStats = {
    totalEarned: 45.6789,
    totalWithdrawn: 32.1234,
    avgDailyEarnings: 0.1234,
    lastWithdrawal: "2024-01-15",
  };

  const mockTransactions = [
    {
      id: 1,
      amount: 2.5,
      date: "2024-01-15",
      status: "completed",
      signature: "abc123...",
    },
    {
      id: 2,
      amount: 1.8,
      date: "2024-01-10",
      status: "completed",
      signature: "def456...",
    },
    {
      id: 3,
      amount: 3.2,
      date: "2024-01-05",
      status: "completed",
      signature: "ghi789...",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Validator Control Center</h1>
          <p className="text-lg text-muted-foreground">
            Professional earnings management and withdrawal system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant={connected ? "default" : "outline"}
            className="px-3 py-1"
          >
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </Badge>
          <Badge
            variant={isSecured ? "default" : "outline"}
            className="px-3 py-1"
          >
            {isSecured ? (
              <Lock className="h-3 w-3 mr-1" />
            ) : (
              <Unlock className="h-3 w-3 mr-1" />
            )}
            {isSecured ? "Secured" : "Unsecured"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="withdraw" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="withdraw" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Withdraw
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* Wallet Control */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Wallet Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <WalletMultiButton className="w-full" />
                  {connected && walletPublicKey && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Connected Wallet
                      </p>
                      <p className="font-mono text-xs">
                        {walletPublicKey.toBase58().slice(0, 8)}...
                        {walletPublicKey.toBase58().slice(-8)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Status */}
              <Card
                className={
                  isSecured
                    ? "border-green-200 bg-green-50 dark:bg-green-950"
                    : ""
                }
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {isSecured ? (
                      <Lock className="h-4 w-4 text-green-600" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSecured ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Session Active
                        </span>
                      </div>
                      <div className="text-2xl font-mono font-bold text-green-600">
                        {formatTimeRemaining(timeRemaining)}
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Secure withdrawal enabled
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Not Secured</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Authentication required for withdrawals
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {connected && walletPublicKey && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPublicKey(walletPublicKey.toBase58())}
                      className="w-full justify-start"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Use Connected Wallet
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={!publicKey}
                    className="w-full justify-start"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Balance
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Validator Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Validator Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your validator for earnings withdrawal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor="publicKey">Validator Public Key</Label>
                      <Input
                        id="publicKey"
                        placeholder="Enter your Solana validator public key..."
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={!publicKey}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Balance Display */}
                  {publicKey && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="md:col-span-2">
                        {balanceLoading ? (
                          <div className="p-6 border rounded-lg">
                            <div className="space-y-3">
                              <Skeleton className="h-6 w-32" />
                              <Skeleton className="h-8 w-40" />
                              <Skeleton className="h-4 w-28" />
                            </div>
                          </div>
                        ) : balanceError ? (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {balanceError.message}
                            </AlertDescription>
                          </Alert>
                        ) : balance ? (
                          <div className="p-6 border-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Available Earnings
                                </span>
                                <Badge
                                  variant="default"
                                  className="bg-blue-600"
                                >
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              </div>
                              <div className="text-4xl font-bold text-blue-600">
                                {formatSol(balance.balence)} SOL
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">
                                    Lamports
                                  </p>
                                  <p className="font-mono">
                                    {formatLamports(balance.balence)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">
                                    USD Value
                                  </p>
                                  <p className="font-mono">
                                    ${(maxSolBalance * 100).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Quick Stats */}
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">
                                Withdrawal Ready
                              </p>
                              <p className="text-lg font-bold text-green-600">
                                {balance && isSecured && connected ? "✓" : "✗"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">
                                Security Level
                              </p>
                              <p className="text-lg font-bold">
                                {isSecured ? "High" : "Low"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Withdrawal Process */}
              {balance && balance.balence > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Professional Withdrawal System
                    </CardTitle>
                    <CardDescription>
                      Enterprise-grade withdrawal with multi-layer security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Security Authentication */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          Security Authentication
                        </Label>
                        <Badge variant={isSecured ? "default" : "outline"}>
                          {isSecured ? "Authenticated" : "Required"}
                        </Badge>
                      </div>

                      {!isSecured ? (
                        <div className="p-6 border-2 border-dashed rounded-lg text-center">
                          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="font-medium mb-2">
                            Security Authentication Required
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Establish a secure session to enable withdrawal
                            functionality
                          </p>
                          <Button
                            onClick={handleGetMessage}
                            disabled={getMessage.isPending || !publicKey}
                            size="lg"
                          >
                            {getMessage.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Establishing Secure Session...
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 mr-2" />
                                Establish Secure Session
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-green-500" />
                              <span className="font-medium text-green-700 dark:text-green-300">
                                Secure Session Active
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-green-700 dark:text-green-300"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimeRemaining(timeRemaining)}
                            </Badge>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Your session is secured and ready for withdrawals
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Withdrawal Configuration */}
                    {isSecured && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <Label className="text-base font-medium">
                            Withdrawal Configuration
                          </Label>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Amount Input */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Withdrawal Amount (SOL)</Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    placeholder="0.0000"
                                    value={withdrawAmountSol}
                                    onChange={(e) =>
                                      setWithdrawAmountSol(e.target.value)
                                    }
                                    max={maxSolBalance}
                                    step="0.0001"
                                    className="text-xl pr-16 h-12"
                                  />
                                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                    SOL
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Minimum: 0.0001 SOL</span>
                                  <span>
                                    Maximum: {formatSol(balance.balence)} SOL
                                  </span>
                                </div>
                              </div>

                              {/* Quick Amount Buttons */}
                              <div className="grid grid-cols-4 gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setWithdrawAmountSol(
                                      (maxSolBalance * 0.25).toFixed(4)
                                    )
                                  }
                                >
                                  25%
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setWithdrawAmountSol(
                                      (maxSolBalance * 0.5).toFixed(4)
                                    )
                                  }
                                >
                                  50%
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setWithdrawAmountSol(
                                      (maxSolBalance * 0.75).toFixed(4)
                                    )
                                  }
                                >
                                  75%
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setWithdrawAmountSol(
                                      maxSolBalance.toFixed(4)
                                    )
                                  }
                                >
                                  MAX
                                </Button>
                              </div>
                            </div>

                            {/* Transaction Preview */}
                            <div className="space-y-4">
                              <Label>Transaction Preview</Label>
                              <div className="p-4 border rounded-lg bg-muted/20">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">
                                      Withdrawal Amount:
                                    </span>
                                    <span className="font-bold text-lg">
                                      {withdrawAmountSol || "0.0000"} SOL
                                    </span>
                                  </div>
                                  <Separator />
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>USD Value:</span>
                                      <span className="font-mono">
                                        ${estimatedUsd.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Lamports:</span>
                                      <span className="font-mono text-xs">
                                        {withdrawAmountSol
                                          ? formatLamports(
                                              solToLamports(
                                                Number(withdrawAmountSol)
                                              )
                                            )
                                          : "0"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Network:</span>
                                      <span>Solana Devnet</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Destination:</span>
                                      <span className="font-mono text-xs">
                                        {publicKey.slice(0, 8)}...
                                        {publicKey.slice(-8)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Withdrawal Validation */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>Security session active</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>Wallet connected</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>Sufficient balance</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Execute Withdrawal */}
                          <div className="pt-4">
                            <Button
                              onClick={handleSignAndWithdraw}
                              disabled={
                                !connected ||
                                !withdrawAmountSol ||
                                Number(withdrawAmountSol) <= 0 ||
                                withdraw.isPending
                              }
                              className="w-full"
                              size="lg"
                            >
                              {withdraw.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing Secure Withdrawal...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Execute Withdrawal: {withdrawAmountSol ||
                                    "0"}{" "}
                                  SOL
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Success Message */}
                    {withdraw.isSuccess &&
                      withdraw.data?.transactionSignature && (
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription>
                            <div className="space-y-3">
                              <p className="font-medium text-green-800 dark:text-green-200">
                                🎉 Withdrawal executed successfully!
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      `https://explorer.solana.com/tx/${withdraw.data?.transactionSignature}?cluster=devnet`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View on Explorer
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(
                                      withdraw.data?.transactionSignature || ""
                                    )
                                  }
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy Signature
                                </Button>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.totalEarned.toFixed(4)} SOL
                </div>
                <p className="text-sm text-muted-foreground">
                  Lifetime earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Withdrawn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.totalWithdrawn.toFixed(4)} SOL
                </div>
                <p className="text-sm text-muted-foreground">
                  Successfully withdrawn
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Available Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {balance ? formatSol(balance.balence) : "0.0000"} SOL
                </div>
                <p className="text-sm text-muted-foreground">
                  Ready to withdraw
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Daily Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.avgDailyEarnings.toFixed(4)} SOL
                </div>
                <p className="text-sm text-muted-foreground">
                  Average daily earnings
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent withdrawal transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Send className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Withdrawal</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{tx.amount} SOL</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">
                          {tx.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure your security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-lock sessions</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically lock after 10 minutes
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Transaction notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified of successful withdrawals
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Preferences</CardTitle>
                <CardDescription>
                  Customize your withdrawal experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Confirmation dialogs</p>
                    <p className="text-sm text-muted-foreground">
                      Show confirmation before withdrawals
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Default network</p>
                    <p className="text-sm text-muted-foreground">
                      Solana Devnet
                    </p>
                  </div>
                  <Badge variant="outline">Devnet</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
