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
  Info,
  Loader2,
  RefreshCw,
  Send,
  Shield,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function PayoutV4() {
  const [publicKey, setPublicKey] = useState("");
  const [withdrawAmountSol, setWithdrawAmountSol] = useState("");
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [messageExpiry, setMessageExpiry] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

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
        toast.error(
          "Authentication message expired. Please generate a new one."
        );
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
      toast.success("Authentication message generated successfully!");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSignAndWithdraw = async () => {
    if (!connected || !signMessage) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!currentMessage) {
      toast.error("Please generate an authentication message first");
      return;
    }

    if (
      !withdrawAmountSol ||
      isNaN(Number(withdrawAmountSol)) ||
      Number(withdrawAmountSol) <= 0
    ) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    const withdrawAmountLamports = solToLamports(Number(withdrawAmountSol));

    if (balance && withdrawAmountLamports > balance.balence) {
      toast.error("Withdrawal amount exceeds available balance");
      return;
    }

    try {
      // Sign the message
      const messageBytes = new TextEncoder().encode(currentMessage);
      const signature = await signMessage(messageBytes);
      const signatureBase58 = Buffer.from(signature).toString("base64");

      // Process withdrawal
      await withdraw.mutateAsync({
        publicKey,
        amount: withdrawAmountLamports,
        signedMessage: currentMessage,
        signature: signature,
      });

      // Reset form
      setCurrentMessage(null);
      setMessageExpiry(null);
      setWithdrawAmountSol("");
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
  const canWithdraw =
    balance &&
    balance.balence > 0 &&
    currentMessage &&
    !isMessageExpired &&
    connected;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Validator Earnings
        </h1>
        <p className="text-lg text-muted-foreground">
          Withdraw your validator rewards securely and efficiently
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Wallet & Balance */}
        <div className="lg:col-span-1 space-y-6">
          {/* Wallet Connection */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <div>
                    <p className="font-medium">
                      {connected ? "Connected" : "Not Connected"}
                    </p>
                    {connected && walletPublicKey && (
                      <p className="text-xs font-mono text-muted-foreground">
                        {walletPublicKey.toBase58().slice(0, 8)}...
                        {walletPublicKey.toBase58().slice(-8)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <WalletMultiButton className="w-full" />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {connected && walletPublicKey && (
                <Button
                  variant="outline"
                  onClick={() => setPublicKey(walletPublicKey.toBase58())}
                  className="w-full justify-start"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Use Connected Wallet
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={!publicKey}
                className="w-full justify-start"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Balance
              </Button>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Shield className="h-4 w-4" />
                Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
              <p>• Authentication messages expire in 10 minutes</p>
              <p>• Always verify transaction details before signing</p>
              <p>• Only use this official interface for withdrawals</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Main Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Public Key Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Validator Information
              </CardTitle>
              <CardDescription>
                Enter your validator public key to check available earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="publicKey">Validator Public Key</Label>
                <Input
                  id="publicKey"
                  placeholder="Enter your Solana validator public key..."
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Balance Display */}
              {publicKey && (
                <div className="p-6 border-2 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                  {balanceLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-8 w-40" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ) : balanceError ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {balanceError.message}
                      </AlertDescription>
                    </Alert>
                  ) : balance ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Available Balance
                        </span>
                        <Badge variant="default" className="bg-green-600">
                          Ready to Withdraw
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatSol(balance.balence)} SOL
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatLamports(balance.balence)} lamports
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ≈ $
                        {(
                          Number.parseFloat(formatSol(balance.balence)) * 100
                        ).toFixed(2)}{" "}
                        USD (estimated)
                      </div>
                    </div>
                  ) : null}
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
                  Withdraw Earnings
                </CardTitle>
                <CardDescription>
                  Complete the secure withdrawal process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Authentication */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      Step 1: Authentication
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
                          Generating Authentication...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Generate Authentication Message
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-green-700 dark:text-green-300">
                              Authentication Ready
                            </span>
                          </div>
                          {timeRemaining > 0 && (
                            <Badge
                              variant="outline"
                              className="text-green-700 dark:text-green-300"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimeRemaining(timeRemaining)}
                            </Badge>
                          )}
                        </div>
                        <div className="relative">
                          <p className="text-xs font-mono break-all bg-background p-3 rounded border">
                            {currentMessage}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1"
                            onClick={() => copyToClipboard(currentMessage)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {isMessageExpired && (
                        <Button
                          onClick={handleGetMessage}
                          disabled={getMessage.isPending}
                          variant="outline"
                          className="w-full"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Generate New Authentication
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2: Withdrawal Amount */}
                {currentMessage && !isMessageExpired && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Step 2: Withdrawal Amount
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="0.0000"
                              value={withdrawAmountSol}
                              onChange={(e) =>
                                setWithdrawAmountSol(e.target.value)
                              }
                              max={Number.parseFloat(
                                formatSol(balance.balence)
                              )}
                              step="0.0001"
                              className="text-lg pr-12"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                              SOL
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Min: 0.0001 SOL</span>
                            <span>Max: {formatSol(balance.balence)} SOL</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setWithdrawAmountSol(
                                  (
                                    Number.parseFloat(
                                      formatSol(balance.balence)
                                    ) * 0.25
                                  ).toFixed(4)
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
                                  (
                                    Number.parseFloat(
                                      formatSol(balance.balence)
                                    ) * 0.5
                                  ).toFixed(4)
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
                                  (
                                    Number.parseFloat(
                                      formatSol(balance.balence)
                                    ) * 0.75
                                  ).toFixed(4)
                                )
                              }
                            >
                              75%
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setWithdrawAmountSol(formatSol(balance.balence))
                              }
                            >
                              Max
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                          <div className="space-y-2">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Transaction Summary
                            </p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Amount:</span>
                                <span className="font-medium">
                                  {withdrawAmountSol || "0.0000"} SOL
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Lamports:</span>
                                <span className="font-mono text-xs">
                                  {withdrawAmountSol
                                    ? formatLamports(
                                        solToLamports(Number(withdrawAmountSol))
                                      )
                                    : "0"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Est. USD:</span>
                                <span>
                                  $
                                  {withdrawAmountSol
                                    ? (Number(withdrawAmountSol) * 100).toFixed(
                                        2
                                      )
                                    : "0.00"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Execute Withdrawal */}
                    <Separator />
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Step 3: Execute Withdrawal
                      </Label>
                      <Button
                        onClick={handleSignAndWithdraw}
                        disabled={
                          !canWithdraw ||
                          withdraw.isPending ||
                          !withdrawAmountSol
                        }
                        className="w-full"
                        size="lg"
                      >
                        {withdraw.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing Withdrawal...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Sign & Withdraw {withdrawAmountSol || "0"} SOL
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>

                      {!connected && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Please connect your wallet to proceed with the
                            withdrawal.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </>
                )}

                {/* Success Message */}
                {withdraw.isSuccess && withdraw.data?.transactionSignature && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium text-green-800 dark:text-green-200">
                          Withdrawal completed successfully!
                        </p>
                        <div className="flex items-center gap-2">
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
                            View on Solana Explorer
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
