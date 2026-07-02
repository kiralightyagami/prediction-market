"use client";
import type { Market, Orderbook } from "../types";
import { Button } from "#components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#components/ui/card";
import { Badge } from "#components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
}

interface Level {
  price: number;
  availableQty: number;
  total: number;
}

function parseOrderbook(value: string | Orderbook): Orderbook {
  return typeof value === "string" ? JSON.parse(value) : value;
}

function formatPrice(price: number) {
  return `$${(price / 100).toFixed(2)}`;
}

function formatCents(price: number | null) {
  return price === null ? "—" : `${price}¢`;
}

function formatTotal(total: number) {
  return `$${total.toFixed(2)}`;
}

function toLevels(
  orderbook: Orderbook,
  getPrice: (price: number) => number
): Level[] {
  return Object.entries(orderbook).map(([price, data]) => {
    const displayPrice = getPrice(Number(price));
    return {
      price: displayPrice,
      availableQty: data.availableQty,
      total: (displayPrice / 100) * data.availableQty,
    };
  });
}

function bestBid(levels: Level[]) {
  return levels.length ? Math.max(...levels.map((l) => l.price)) : null;
}

function bestAsk(levels: Level[]) {
  return levels.length ? Math.min(...levels.map((l) => l.price)) : null;
}

function OrderbookCard({
  title,
  bids,
  asks,
}: {
  title: string;
  bids: Level[];
  asks: Level[];
}) {
  const bid = bestBid(bids);
  const ask = bestAsk(asks);
  const spread = bid !== null && ask !== null ? ask - bid : null;
  const asksForDisplay = [...asks].sort((a, b) => b.price - a.price);
  const bidsForDisplay = [...bids].sort((a, b) => b.price - a.price);

  return (
    <Card className="w-full shadow-md overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/10 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-lg leading-tight font-bold">
            {title}
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            {formatCents(bid)} bid &middot; {formatCents(ask)} ask
          </p>
        </div>
        <Badge variant="outline" className="font-bold py-1">
          Spread {spread !== null ? `${spread}¢` : "—"}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-[minmax(72px,1fr)_1fr_1fr] items-center py-2 px-4 text-muted-foreground text-[10px] font-bold uppercase tracking-widest bg-muted/5 border-b">
          <span>Price</span>
          <span className="text-right">Shares</span>
          <span className="text-right">Total</span>
        </div>

        <div className="p-2 border-b">
          <Badge variant="destructive" className="ml-2 mb-2">Asks</Badge>
          {asksForDisplay.length === 0 ? (
            <div className="text-muted-foreground px-3 py-2 text-sm italic">No asks</div>
          ) : (
            asksForDisplay.map((level) => (
              <div
                key={`ask-${level.price}`}
                className="grid grid-cols-[minmax(72px,1fr)_1fr_1fr] items-center min-h-[32px] gap-2.5 px-3 rounded-md text-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <span className="font-bold text-red-600 dark:text-red-400">
                  {formatPrice(level.price)}
                </span>
                <span className="text-right text-muted-foreground font-medium">
                  {level.availableQty.toLocaleString()}
                </span>
                <span className="text-right text-muted-foreground font-medium">
                  {formatTotal(level.total)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center py-2 px-5 text-muted-foreground text-sm bg-muted/10 border-b">
          <span className="font-medium">Spread</span>
          <strong className="text-foreground">
            {spread !== null ? `${spread}¢` : "—"}
          </strong>
        </div>

        <div className="p-2">
          <Badge className="ml-2 mb-2 bg-green-600 hover:bg-green-700 text-white">Bids</Badge>
          {bidsForDisplay.length === 0 ? (
            <div className="text-muted-foreground px-3 py-2 text-sm italic">No bids</div>
          ) : (
            bidsForDisplay.map((level) => (
              <div
                key={`bid-${level.price}`}
                className="grid grid-cols-[minmax(72px,1fr)_1fr_1fr] items-center min-h-[32px] gap-2.5 px-3 rounded-md text-sm hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
              >
                <span className="font-bold text-green-600 dark:text-green-400">
                  {formatPrice(level.price)}
                </span>
                <span className="text-right text-muted-foreground font-medium">
                  {level.availableQty.toLocaleString()}
                </span>
                <span className="text-right text-muted-foreground font-medium">
                  {formatTotal(level.total)}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketDetail({ market, onBack }: MarketDetailProps) {
  const yesOrderbook = parseOrderbook(market.yesOrderbook);
  const noOrderbook = parseOrderbook(market.noOrderbook);

  const yesAsks = toLevels(yesOrderbook, (price) => price);
  const noAsks = toLevels(noOrderbook, (price) => price);
  const yesBids = toLevels(noOrderbook, (price) => 100 - price);
  const noBids = toLevels(yesOrderbook, (price) => 100 - price);
  const yesBid = bestBid(yesBids);
  const yesAsk = bestAsk(yesAsks);
  const noBid = bestBid(noBids);
  const noAsk = bestAsk(noAsks);

  return (
    <div className="grid gap-5">
      <Button
        variant="ghost"
        onClick={onBack}
        className="w-fit pl-2 font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        All markets
      </Button>

      <Card className="w-full shadow-xl bg-gradient-to-br from-card to-card/50 overflow-hidden border-2 border-primary/5">
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8">
            <div>
              <span className="block text-primary text-xs font-bold uppercase tracking-widest mb-2">
                Prediction market
              </span>
              <h2 className="max-w-[880px] text-3xl sm:text-4xl leading-tight font-extrabold mb-4">
                {market.title}
              </h2>
              <p className="max-w-[840px] text-muted-foreground text-lg leading-relaxed">
                {market.description}
              </p>
            </div>

            <div className="grid gap-4 self-center">
              <div className="flex flex-col p-5 rounded-2xl border bg-green-500/5 dark:bg-green-500/10 border-green-500/20">
                <span className="text-green-700 dark:text-green-400 text-sm font-black uppercase tracking-widest">Yes</span>
                <strong className="text-4xl font-black tracking-tight text-green-600 dark:text-green-500 mt-1">
                  {formatCents(yesAsk)}
                </strong>
                <small className="text-muted-foreground mt-2 font-medium">
                  Best ask &middot; Bid {formatCents(yesBid)}
                </small>
              </div>
              <div className="flex flex-col p-5 rounded-2xl border bg-red-500/5 dark:bg-red-500/10 border-red-500/20">
                <span className="text-red-700 dark:text-red-400 text-sm font-black uppercase tracking-widest">No</span>
                <strong className="text-4xl font-black tracking-tight text-red-600 dark:text-red-500 mt-1">
                  {formatCents(noAsk)}
                </strong>
                <small className="text-muted-foreground mt-2 font-medium">
                  Best ask &middot; Bid {formatCents(noBid)}
                </small>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Liquidity",
            value: `${market.totalQty.toLocaleString()} shares`,
          },
          {
            label: "Yes spread",
            value:
              yesBid !== null && yesAsk !== null
                ? `${yesAsk - yesBid}¢`
                : "—",
          },
          {
            label: "No spread",
            value:
              noBid !== null && noAsk !== null ? `${noAsk - noBid}¢` : "—",
          },
        ].map((item) => (
          <Card key={item.label} className="shadow-sm">
            <CardContent className="p-4 flex flex-col justify-center">
              <span className="block text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-1.5">
                {item.label}
              </span>
              <strong className="text-xl font-bold tracking-tight">
                {item.value}
              </strong>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <span className="block text-primary/70 text-[11px] font-bold uppercase tracking-widest mb-3">
            Resolution criteria
          </span>
          <p className="max-w-[840px] text-foreground font-medium leading-relaxed">
            {market.resolutionDescription}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-2">
        <OrderbookCard title="Yes orderbook" bids={yesBids} asks={yesAsks} />
        <OrderbookCard title="No orderbook" bids={noBids} asks={noAsks} />
      </div>
    </div>
  );
}
