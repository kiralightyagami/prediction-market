"use client";
import type { Market, Orderbook } from "../types";

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
      <div className="flex items-end justify-between gap-4 mb-[18px]">
        <div>
          <span className="block text-muted text-xs font-[850] uppercase tracking-[0.1em] mb-1.5">
            Markets
          </span>
          <h2 className="text-[28px] font-bold tracking-[-0.055em]">
            Trade live prediction markets
          </h2>
        </div>
        <span className="inline-flex items-center h-7 px-2.5 rounded-full border border-border-subtle bg-surface-1 text-muted text-xs font-extrabold">
          {markets.length} markets
        </span>
      </div>

      {markets.length === 0 ? (
        <div className="p-7 border border-dashed border-border rounded-[var(--radius-lg)] text-muted bg-[rgba(17,25,34,0.45)]">
          No markets available.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(310px,1fr))] gap-3.5">
          {markets.map((market) => {
            const prices = marketPrices(market);
            return (
              <button
                key={market.id}
                className="appearance-none text-left min-h-[220px] bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] p-[18px] cursor-pointer text-text transition-all duration-150 hover:-translate-y-0.5 hover:border-[#3a5066] hover:from-surface-2 hover:to-surface-1"
                onClick={() => onSelectMarket(market.id)}
              >
                <div className="flex justify-between gap-2.5 mb-[18px]">
                  <span className="inline-flex items-center h-7 px-2.5 rounded-full border border-green-border bg-green-bg text-green-text-alt text-xs font-extrabold">
                    Open
                  </span>
                  <span className="inline-flex items-center h-7 px-2.5 rounded-full border border-border-subtle bg-surface-1 text-muted text-xs font-extrabold">
                    {market.totalQty.toLocaleString()} shares
                  </span>
                </div>

                <h3 className="text-lg leading-[1.3] tracking-[-0.03em] mb-2 font-semibold">
                  {market.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {market.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-[18px]">
                  <span className="flex justify-center items-center min-h-[38px] rounded-[var(--radius-md)] font-[850] text-sm text-green-text bg-green-bg border border-green-border">
                    Yes {formatCents(prices.yes)}
                  </span>
                  <span className="flex justify-center items-center min-h-[38px] rounded-[var(--radius-md)] font-[850] text-sm text-red-text bg-red-bg border border-red-border">
                    No {formatCents(prices.no)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
