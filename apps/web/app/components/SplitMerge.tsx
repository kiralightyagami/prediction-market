"use client";
import { useState } from "react";
import { api } from "../api/api";
import type { Market } from "../types";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#components/ui/card";
import { Alert, AlertDescription } from "#components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";

interface SplitMergeProps {
  markets?: Market[];
  market?: Market;
  token: string;
  onActionComplete: () => void;
}

export function SplitMerge({
  markets = [],
  market,
  token,
  onActionComplete,
}: SplitMergeProps) {
  const [marketId, setMarketId] = useState<string>(market?.id || "");
  const [amount, setAmount] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const selectedMarketId = market?.id || marketId;
  const selectedMarketTitle =
    market?.title ||
    markets.find((item) => item.id === selectedMarketId)?.title;

  const runAction = async (action: "split" | "merge") => {
    if (!selectedMarketId) {
      setError("Select a market first.");
      return;
    }

    const parsedAmount = Math.floor(Number(amount));
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      setError("Enter a valid quantity.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (action === "split") {
        await api.splitPosition(token, {
          marketId: selectedMarketId,
          amount: parsedAmount,
        });
      } else {
        await api.mergePosition(token, {
          marketId: selectedMarketId,
          amount: parsedAmount,
        });
      }
      setSuccess(action === "split" ? "Split completed." : "Merge completed.");
      onActionComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 border-primary/10 mt-4">
      <CardHeader className="pb-4 border-b bg-muted/20">
        <div className="flex justify-between items-start gap-3">
          <div>
            <span className="block text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-1">
              Market actions
            </span>
            <CardTitle className="text-lg leading-tight font-bold">
              Split / Merge
            </CardTitle>
          </div>
          <span className="text-primary text-[11px] font-black uppercase tracking-widest py-1 px-2 bg-primary/10 rounded-full line-clamp-1 max-w-[120px]" title={selectedMarketTitle || "Select market"}>
            {selectedMarketTitle || "Select market"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
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

        {!market && (
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Market
            </Label>
            <Select value={marketId} onValueChange={setMarketId}>
              <SelectTrigger className="h-11 font-medium">
                <SelectValue placeholder="Select a market" />
              </SelectTrigger>
              <SelectContent>
                {markets.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Quantity
          </Label>
          <Input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-11 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => runAction("split")}
            disabled={loading || !token}
            className="h-12 font-bold hover:bg-green-600 hover:text-white border-muted-foreground/30"
          >
            Split
          </Button>
          <Button
            variant="outline"
            onClick={() => runAction("merge")}
            disabled={loading || !token}
            className="h-12 font-bold hover:bg-blue-600 hover:text-white border-muted-foreground/30"
          >
            Merge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
