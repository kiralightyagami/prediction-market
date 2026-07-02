"use client";
import type { Market, Orderbook } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#components/ui/card";
import { Badge } from "#components/ui/badge";

interface MarketListProps {
  markets: Market[];
  onSelectMarket: (marketId: string) => void;
}

function parseOrderbook(value: string | Orderbook): Orderbook {
  return typeof value === "string" ? JSON.parse(value) : value;
}

function bestAsk(orderbook: Orderbook) {
  const prices = Object.keys(orderbook).map(Number).filter(Number.isFinite);
  return prices.length ? Math.min(...prices) : null;
}

function formatCents(price: number | null) {
  return price === null ? "—" : `${price}¢`;
}

function marketPrices(market: Market) {
  const yesOrderbook = parseOrderbook(market.yesOrderbook);
  const noOrderbook = parseOrderbook(market.noOrderbook);
  return {
    yes: bestAsk(yesOrderbook),
    no: bestAsk(noOrderbook),
  };
}

export function MarketList({ markets, onSelectMarket }: MarketListProps) {
  return (
    <section>
      {/* Section heading */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <span className="block text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5">
            Markets
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Trade live prediction markets
          </h2>
        </div>
        <Badge variant="secondary" className="px-3 py-1 font-bold">
          {markets.length} markets
        </Badge>
      </div>

      {markets.length === 0 ? (
        <div className="p-10 border-2 border-dashed border-muted rounded-xl text-muted-foreground text-center font-medium bg-muted/10">
          No markets available.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
          {markets.map((market) => {
            const prices = marketPrices(market);
            return (
              <Card
                key={market.id}
                className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/50 flex flex-col h-full bg-gradient-to-b from-card to-card/50"
                onClick={() => onSelectMarket(market.id)}
              >
                <CardHeader className="pb-3 flex-1">
                  <div className="flex justify-between items-center gap-2 mb-3">
                    <Badge variant="default" className="bg-green-600 hover:bg-green-600 text-white font-bold">
                      Open
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground font-semibold">
                      {market.totalQty.toLocaleString()} shares
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-tight font-bold">
                    {market.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {market.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="flex justify-center items-center h-12 rounded-lg font-bold text-sm bg-green-500/10 text-green-700 border border-green-500/20 dark:text-green-400">
                      Yes {formatCents(prices.yes)}
                    </div>
                    <div className="flex justify-center items-center h-12 rounded-lg font-bold text-sm bg-red-500/10 text-red-700 border border-red-500/20 dark:text-red-400">
                      No {formatCents(prices.no)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
