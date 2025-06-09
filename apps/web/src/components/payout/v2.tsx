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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
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
  Calculator,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Loader2,
  RefreshCw,
  Send,
  Shield,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function PayoutV5() {
  const [publicKey, setPublicKey] = useState("");
  const [withdrawAmountSol, setWithdrawAmountSol] = useState("");
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [messageExpiry, setMessageExpiry] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState([0]);

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
        toast.error("Authentication expired. Please generate a new message.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [messageExpiry]);

  // Update slider when balance changes
  useEffect(() => {
    if (balance) {
      const maxSol = Number.parseFloat(formatSol(balance.balence));
      if (sliderValue[0] > 0) {
        const solAmount = (sliderValue[0] / 100) * maxSol;
        setWithdrawAmountSol(solAmount.toFixed(4));
      }
    }
  }, [sliderValue, balance]);

  const handleGetMessage = async () => {
    if (!publicKey) {
      toast.error("Please enter a public key");
      return;
    }

    try {
      const messageData = await getMessage.mutateAsync(publicKey);
      setCurrentMessage(messageData.message);
      setMessageExpiry(messageData.expiresAt);
      toast.success("Authentication message generated!");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleConfirmWithdraw = async () => {
    if (!connected || !signMessage || !currentMessage || !withdrawAmountSol)
      return;

    try {
      const messageBytes = new TextEncoder().encode(currentMessage);
      const signature = await signMessage(messageBytes);
      const signatureBase58 = Buffer.from(signature).toString("base64");

      await withdraw.mutateAsync({
        publicKey,
        amount: solToLamports(Number(withdrawAmountSol)),
        signedMessage: currentMessage,
        signature: signature,
      });

      setCurrentMessage(null);
      setMessageExpiry(null);
      setWithdrawAmountSol("");
      setSliderValue([0]);
      setConfirmationOpen(false);
      toast.success("Withdrawal completed successfully!");
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

  const isMessageExpired = timeRemaining === 0 && messageExpiry;
  const maxSolBalance = balance
    ? Number.parseFloat(formatSol(balance.balence))
    : 0;
  const estimatedUsd = Number(withdrawAmountSol) * 100; // Mock rate

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Smart Withdrawal Interface
          </span>
        </div>
        <h1 className="text-4xl font-bold">Validator Earnings Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Intelligent withdrawal system with advanced controls and real-time
          validation
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Sidebar - Status & Info */}
        <div className="xl:col-span-1 space-y-4">
          {/* Connection Status */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Connection Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                />
                <div>
                  <p className="font-medium">
                    {connected ? "Wallet Connected" : "Wallet Disconnected"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {connected
                      ? "Ready for transactions"
                      : "Connect to continue"}
                  </p>
                </div>
              </div>
              <WalletMultiButton className="w-full" />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {balance && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available:</span>
                    <span className="font-mono">
                      {formatSol(balance.balence)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>USD Value:</span>
                    <span className="font-mono">
                      ${(maxSolBalance * 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lamports:</span>
                    <span className="font-mono text-xs">
                      {formatLamports(balance.balence)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Timer */}
          {currentMessage && timeRemaining > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Clock className="h-4 w-4" />
                  Security Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-mono font-bold text-amber-700 dark:text-amber-300">
                    {formatTimeRemaining(timeRemaining)}
                  </div>
                  <Progress
                    value={(timeRemaining / 600000) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Authentication expires soon
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Validator Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Validator Configuration
              </CardTitle>
              <CardDescription>
                Enter your validator details to access earnings
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
                <div className="flex flex-col justify-end gap-2">
                  {connected && walletPublicKey && (
                    <Button
                      variant="outline"
                      onClick={() => setPublicKey(walletPublicKey.toBase58())}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Use Wallet
                    </Button>
                  )}
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
                <div className="mt-4">
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
                    <div className="p-6 border-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Available Earnings
                          </p>
                          <p className="text-3xl font-bold text-green-600">
                            {formatSol(balance.balence)} SOL
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ≈ ${(maxSolBalance * 100).toFixed(2)} USD
                          </p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal Interface */}
          {balance && balance.balence > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Smart Withdrawal
                </CardTitle>
                <CardDescription>
                  Configure your withdrawal with intelligent controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Authentication Step */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      Authentication
                    </Label>
                    <Badge
                      variant={
                        currentMessage && !isMessageExpired
                          ? "default"
                          : "outline"
                      }
                    >
                      {currentMessage && !isMessageExpired
                        ? "Authenticated"
                        : "Required"}
                    </Badge>
                  </div>

                  {!currentMessage ? (
                    <Button
                      onClick={handleGetMessage}
                      disabled={getMessage.isPending || !publicKey}
                      className="w-full"
                      size="lg"
                    >
                      {getMessage.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Secure Authentication...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Generate Authentication Message
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-700 dark:text-green-300">
                          Authentication Active
                        </span>
                        {timeRemaining > 0 && (
                          <Badge variant="outline" className="ml-auto">
                            {formatTimeRemaining(timeRemaining)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="text-xs"
                        >
                          {showAdvanced ? (
                            <EyeOff className="h-3 w-3 mr-1" />
                          ) : (
                            <Eye className="h-3 w-3 mr-1" />
                          )}
                          {showAdvanced ? "Hide" : "Show"} Message
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(currentMessage)}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      {showAdvanced && (
                        <p className="text-xs font-mono break-all bg-background p-2 rounded border mt-2">
                          {currentMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount Selection */}
                {currentMessage && !isMessageExpired && (
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      Withdrawal Amount
                    </Label>

                    {/* Slider Control */}
                    <div className="space-y-4">
                      <div className="px-3">
                        <Slider
                          value={sliderValue}
                          onValueChange={setSliderValue}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Amount (SOL)</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="0.0000"
                              value={withdrawAmountSol}
                              onChange={(e) => {
                                setWithdrawAmountSol(e.target.value);
                                const percentage =
                                  (Number(e.target.value) / maxSolBalance) *
                                  100;
                                setSliderValue([
                                  Math.min(100, Math.max(0, percentage)),
                                ]);
                              }}
                              max={maxSolBalance}
                              step="0.0001"
                              className="text-lg pr-12"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                              SOL
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sliderValue[0]}% of available balance
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Transaction Preview</Label>
                          <div className="p-3 border rounded-lg bg-muted/20">
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Amount:</span>
                                <span className="font-mono">
                                  {withdrawAmountSol || "0.0000"} SOL
                                </span>
                              </div>
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
                                        solToLamports(Number(withdrawAmountSol))
                                      )
                                    : "0"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Amount Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSliderValue([25]);
                            setWithdrawAmountSol(
                              (maxSolBalance * 0.25).toFixed(4)
                            );
                          }}
                        >
                          25%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSliderValue([50]);
                            setWithdrawAmountSol(
                              (maxSolBalance * 0.5).toFixed(4)
                            );
                          }}
                        >
                          50%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSliderValue([75]);
                            setWithdrawAmountSol(
                              (maxSolBalance * 0.75).toFixed(4)
                            );
                          }}
                        >
                          75%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSliderValue([100]);
                            setWithdrawAmountSol(maxSolBalance.toFixed(4));
                          }}
                        >
                          Max
                        </Button>
                      </div>
                    </div>

                    {/* Withdrawal Button */}
                    <Dialog
                      open={confirmationOpen}
                      onOpenChange={setConfirmationOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          disabled={
                            !connected ||
                            !withdrawAmountSol ||
                            Number(withdrawAmountSol) <= 0
                          }
                          className="w-full"
                          size="lg"
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Review Withdrawal: {withdrawAmountSol || "0"} SOL
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Withdrawal</DialogTitle>
                          <DialogDescription>
                            Please review your withdrawal details carefully
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg bg-muted/20">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Withdrawal Amount:</span>
                                <span className="font-bold">
                                  {withdrawAmountSol} SOL
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>USD Value:</span>
                                <span>${estimatedUsd.toFixed(2)}</span>
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
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              This action cannot be undone. Please verify all
                              details before proceeding.
                            </AlertDescription>
                          </Alert>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setConfirmationOpen(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleConfirmWithdraw}
                              disabled={withdraw.isPending}
                              className="flex-1"
                            >
                              {withdraw.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Confirm Withdrawal
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Success Message */}
                {withdraw.isSuccess && withdraw.data?.transactionSignature && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <div className="space-y-3">
                        <p className="font-medium text-green-800 dark:text-green-200">
                          🎉 Withdrawal completed successfully!
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
                            View Transaction
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
    </div>
  );
}
