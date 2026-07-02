"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Market, Orderbook } from "../types";
import { api } from "../api/api";
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
import { Tabs, TabsList, TabsTrigger } from "#components/ui/tabs";

interface OrderFormProps {
  market: Market;
  token: string;
  onOrderPlaced: () => void;
}

function parseOrderbook(value: string | Orderbook): Orderbook {
  return typeof value === "string" ? JSON.parse(value) : value;
}

function prices(orderbook: Orderbook) {
  return Object.keys(orderbook).map(Number).filter(Number.isFinite);
}

function min(values: number[]) {
  return values.length ? Math.min(...values) : null;
}

function max(values: number[]) {
  return values.length ? Math.max(...values) : null;
}

function formatPrice(price: number | null) {
  return price === null ? "—" : `$${(price / 100).toFixed(2)}`;
}

export function OrderForm({ market, token, onOrderPlaced }: OrderFormProps) {
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState<string>("0.50");
  const [qty, setQty] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const bestPrices = useMemo(() => {
    const yesOrderbook = parseOrderbook(market.yesOrderbook);
    const noOrderbook = parseOrderbook(market.noOrderbook);
    const yesAskPrices = prices(yesOrderbook);
    const noAskPrices = prices(noOrderbook);
    const yesBids = noAskPrices.map((v) => 100 - v);
    const noBids = yesAskPrices.map((v) => 100 - v);

    return {
      yesAsk: min(yesAskPrices),
      yesBid: max(yesBids),
      noAsk: min(noAskPrices),
      noBid: max(noBids),
    };
  }, [market]);

  const suggestedPrice = useMemo(() => {
    if (side === "yes" && type === "buy") return bestPrices.yesAsk;
    if (side === "yes" && type === "sell") return bestPrices.yesBid;
    if (side === "no" && type === "buy") return bestPrices.noAsk;
    return bestPrices.noBid;
  }, [bestPrices, side, type]);

  useEffect(() => {
    if (suggestedPrice !== null) {
      setPrice((suggestedPrice / 100).toFixed(2));
    }
  }, [suggestedPrice]);

  const priceCents = Math.round(Number(price) * 100);
  const quantity = Math.max(0, Math.floor(Number(qty) || 0));
  const total = (priceCents * quantity) / 100;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (
      !Number.isFinite(priceCents) ||
      priceCents < 1 ||
      priceCents > 99 ||
      quantity < 1
    ) {
      setError("Enter a valid price and quantity.");
      setLoading(false);
      return;
    }

    try {
      await api.placeOrder(token, {
        marketId: market.id,
        side,
        type,
        price: priceCents,
        qty: quantity,
      });
      setSuccess("Order placed successfully.");
      onOrderPlaced();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 border-primary/10">
      <CardHeader className="pb-4 border-b bg-muted/20">
        <div className="flex justify-between items-start gap-3">
          <div>
            <span className="block text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-1">
              Trade
            </span>
            <CardTitle className="text-lg leading-tight font-bold max-w-[250px]">
              {market.title}
            </CardTitle>
          </div>
          <span className="text-primary text-[11px] font-black uppercase tracking-widest py-1 px-2 bg-primary/10 rounded-full">
            {type === "buy" ? "Buy" : "Sell"} {side.toUpperCase()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-semibold">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 stroke-green-600 dark:stroke-green-400" />
            <AlertDescription className="font-semibold">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={type} onValueChange={(v) => setType(v as "buy" | "sell")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="font-bold">Buy</TabsTrigger>
              <TabsTrigger value="sell" className="font-bold">Sell</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={side} onValueChange={(v) => setSide(v as "yes" | "no")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="yes" className="font-bold data-[state=active]:bg-green-500 data-[state=active]:text-white">Yes</TabsTrigger>
              <TabsTrigger value="no" className="font-bold data-[state=active]:bg-red-500 data-[state=active]:text-white">No</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Limit price
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max="0.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="h-11 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quantity
              </Label>
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
                className="h-11 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-muted/50 border rounded-lg p-3">
              <span className="block text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">
                Suggested
              </span>
              <strong className="text-lg">
                {formatPrice(suggestedPrice)}
              </strong>
            </div>
            <div className="bg-muted/50 border rounded-lg p-3">
              <span className="block text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">
                Order value
              </span>
              <strong className="text-lg text-primary">
                ${total.toFixed(2)}
              </strong>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !token}
            className="w-full h-12 text-base font-bold mt-2"
          >
            {loading
              ? "Processing..."
              : `${type === "buy" ? "Buy" : "Sell"} ${side.toUpperCase()}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
