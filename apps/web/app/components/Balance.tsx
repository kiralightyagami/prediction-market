"use client";
import { useState, useEffect } from "react";
import { api } from "../api/api";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#components/ui/card";
import { Alert, AlertDescription } from "#components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface BalanceProps {
  token: string;
}

export function Balance({ token }: BalanceProps) {
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fetchBalance = async () => {
    try {
      const data = await api.getBalance(token);
      setBalance(data.balance / 100);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [token]);

  const handleOnramp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.onramp(token, parseFloat(amount));
      setSuccess(`Successfully added $${amount} to your balance!`);
      fetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onramp failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOfframp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.offramp(token, parseFloat(amount));
      setSuccess(`Successfully withdrew $${amount} from your balance!`);
      fetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Offramp failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight">Balance</CardTitle>
        <CardDescription>Manage your account balance</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-xl p-6 text-center border border-border">
          <span className="text-5xl font-black tracking-tight text-primary">
            ${balance.toFixed(2)}
          </span>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-semibold">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 stroke-green-600 dark:stroke-green-400" />
            <AlertDescription className="font-semibold">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold text-muted-foreground uppercase text-xs tracking-wider">
              Amount ($)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleOnramp}
              disabled={loading}
              className="h-12 font-bold bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Processing..." : "Onramp"}
            </Button>
            <Button
              onClick={handleOfframp}
              disabled={loading}
              variant="destructive"
              className="h-12 font-bold"
            >
              {loading ? "Processing..." : "Offramp"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
