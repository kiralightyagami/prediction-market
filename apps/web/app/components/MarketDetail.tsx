"use client";
import type { Market, Orderbook } from "../types";

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
    <section className="bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start gap-3.5 p-4 border-b border-border-subtle">
        <div>
          <h3 className="text-[17px] leading-[1.28] tracking-[-0.035em] font-semibold">
            {title}
          </h3>
          <p className="text-muted text-[13px] mt-1">
            {formatCents(bid)} bid · {formatCents(ask)} ask
          </p>
        </div>
        <span className="flex-none inline-flex items-center h-[26px] px-2.5 rounded-full border border-border-subtle bg-surface-1 text-muted text-[11px] font-extrabold">
          Spread {spread !== null ? `${spread}¢` : "—"}
        </span>
      </div>

      {/* Table */}
      <div className="px-3 py-2.5 pb-3.5">
        {/* Head */}
        <div className="grid grid-cols-[minmax(72px,1fr)_1fr_1fr] items-center min-h-[28px] gap-2.5 px-2 text-muted text-[10px] font-[850] uppercase tracking-[0.09em]">
          <span>Price</span>
          <span className="text-right">Shares</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks label */}
        <span className="inline-flex items-center h-[21px] px-2 my-1 ml-2 rounded-full text-[10px] font-[850] uppercase tracking-[0.09em] text-red-text bg-red-bg border border-red-border">
          Asks
        </span>

        {asksForDisplay.length === 0 ? (
          <div className="text-muted px-2 py-2.5 text-[13px]">No asks</div>
        ) : (
          asksForDisplay.map((level) => (
            <div
              key={`ask-${level.price}`}
              className="grid grid-cols-[minmax(72px,1fr)_1fr_1fr] items-center min-h-[32px] gap-2.5 px-2 rounded-[var(--radius-sm)] text-[13px] hover:bg-red-bg"
            >
              <span className="font-[850] text-red-text-alt">
                {formatPrice(level.price)}
              </span>
              <span className="text-right text-text-soft">
                {level.availableQty.toLocaleString()}
              </span>
              <span className="text-right text-text-soft">
                {formatTotal(level.total)}
              </span>
            </div>
          ))
        )}

        {/* Spread row */}
        <div className="flex justify-between items-center my-2 py-2 px-2.5 border-t border-b border-border-subtle text-muted text-xs">
          <span>Spread</span>
          <strong className="text-text-soft">
            {spread !== null ? `${spread}¢` : "—"}
          </strong>
        </div>

        {/* Bids label */}
        <span className="inline-flex items-center h-[21px] px-2 my-1 ml-2 rounded-full text-[10px] font-[850] uppercase tracking-[0.09em] text-green-text-dark bg-green-bg border border-green-border">
          Bids
        </span>

        {bidsForDisplay.length === 0 ? (
          <div className="text-muted px-2 py-2.5 text-[13px]">No bids</div>
        ) : (
          bidsForDisplay.map((level) => (
            <div
              key={`bid-${level.price}`}
              className="grid grid-cols-[minmax(72px,1fr)_1fr_1fr] items-center min-h-[32px] gap-2.5 px-2 rounded-[var(--radius-sm)] text-[13px] hover:bg-green-bg"
            >
              <span className="font-[850] text-[#77e99d]">
                {formatPrice(level.price)}
              </span>
              <span className="text-right text-text-soft">
                {level.availableQty.toLocaleString()}
              </span>
              <span className="text-right text-text-soft">
                {formatTotal(level.total)}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
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
    <div className="grid gap-3.5">
      {/* Back button */}
      <button
        onClick={onBack}
        className="w-fit border border-border bg-surface-1 text-text-soft rounded-[var(--radius-md)] px-3.5 py-2 cursor-pointer transition-all duration-150 hover:bg-surface-2 hover:border-[#34485d] hover:text-text"
      >
        ← All markets
      </button>

      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-[18px] p-[22px] bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
        <div>
          <span className="block text-muted text-xs font-[850] uppercase tracking-[0.1em] mb-1.5">
            Prediction market
          </span>
          <h2 className="max-w-[880px] text-[clamp(26px,3vw,42px)] leading-[1.05] tracking-[-0.065em] font-bold mb-3">
            {market.title}
          </h2>
          <p className="max-w-[840px] text-text-soft leading-relaxed">
            {market.description}
          </p>
        </div>

        {/* Outcome cards */}
        <div className="grid gap-2.5">
          <div className="grid gap-1 p-4 rounded-2xl border border-border-subtle bg-[rgba(255,255,255,0.025)]">
            <span className="text-muted text-[13px] font-extrabold">Yes</span>
            <strong className="text-[34px] tracking-[-0.06em] text-green">
              {formatCents(yesAsk)}
            </strong>
            <small className="text-muted">
              Best ask · Bid {formatCents(yesBid)}
            </small>
          </div>
          <div className="grid gap-1 p-4 rounded-2xl border border-border-subtle bg-[rgba(255,255,255,0.025)]">
            <span className="text-muted text-[13px] font-extrabold">No</span>
            <strong className="text-[34px] tracking-[-0.06em] text-red">
              {formatCents(noAsk)}
            </strong>
            <small className="text-muted">
              Best ask · Bid {formatCents(noBid)}
            </small>
          </div>
        </div>
      </section>

      {/* Meta row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <div
            key={item.label}
            className="p-[15px] bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)]"
          >
            <span className="block text-muted text-[11px] font-[850] uppercase tracking-[0.095em] mb-[7px]">
              {item.label}
            </span>
            <strong className="text-[17px] tracking-[-0.02em]">
              {item.value}
            </strong>
          </div>
        ))}
      </div>

      {/* Resolution criteria */}
      <section className="p-[15px] bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
        <span className="block text-muted text-[11px] font-[850] uppercase tracking-[0.095em] mb-[7px]">
          Resolution criteria
        </span>
        <p className="max-w-[840px] text-text-soft leading-relaxed">
          {market.resolutionDescription}
        </p>
      </section>

      {/* Orderbooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <OrderbookCard title="Yes orderbook" bids={yesBids} asks={yesAsks} />
        <OrderbookCard title="No orderbook" bids={noBids} asks={noAsks} />
      </div>
    </div>
  );
}
