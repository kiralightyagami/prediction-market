"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Market, Orderbook } from "../types";
import { api } from "../api/api";

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

  const btnBase =
    "min-h-[38px] rounded-[var(--radius-sm)] font-[850] cursor-pointer transition-colors duration-150";

  return (
    <section className="bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start gap-3.5 p-4 border-b border-border-subtle">
        <div>
          <span className="block text-muted text-[11px] font-[850] uppercase tracking-[0.095em] mb-[7px]">
            Trade
          </span>
          <h3 className="text-[17px] leading-[1.28] tracking-[-0.035em] font-semibold max-w-[250px]">
            {market.title}
          </h3>
        </div>
        <span className="text-muted text-[11px] font-[850] uppercase tracking-[0.095em]">
          {type === "buy" ? "Buy" : "Sell"} {side.toUpperCase()}
        </span>
      </div>

      {/* Messages */}
      <div className="px-4">
        {error && (
          <div className="rounded-[var(--radius-md)] p-2.5 mt-4 text-[13px] font-[750] text-red-text bg-red-bg border border-red-border">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-[var(--radius-md)] p-2.5 mt-4 text-[13px] font-[750] text-green-text-dark bg-green-bg border border-green-border">
            {success}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4">
        {/* Buy / Sell toggle */}
        <div className="grid grid-cols-2 gap-[5px] mb-3 p-1 bg-surface-0 border border-border-subtle rounded-[var(--radius-md)]">
          <button
            type="button"
            className={`${btnBase} ${type === "buy" ? "bg-surface-2 text-text" : "bg-transparent text-muted"}`}
            onClick={() => setType("buy")}
          >
            Buy
          </button>
          <button
            type="button"
            className={`${btnBase} ${type === "sell" ? "bg-surface-2 text-text" : "bg-transparent text-muted"}`}
            onClick={() => setType("sell")}
          >
            Sell
          </button>
        </div>

        {/* Yes / No toggle */}
        <div className="grid grid-cols-2 gap-[5px] mb-3 p-1 bg-surface-0 border border-border-subtle rounded-[var(--radius-md)]">
          <button
            type="button"
            className={`${btnBase} ${side === "yes" ? "bg-green-bg text-green-text" : "bg-transparent text-muted"}`}
            onClick={() => setSide("yes")}
          >
            Yes
          </button>
          <button
            type="button"
            className={`${btnBase} ${side === "no" ? "bg-red-bg text-red-text" : "bg-transparent text-muted"}`}
            onClick={() => setSide("no")}
          >
            No
          </button>
        </div>

        {/* Price input */}
        <div className="mb-3">
          <label className="block text-muted text-xs font-[850] mb-[7px]">
            Limit price
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="0.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full min-h-[43px] border border-border rounded-[var(--radius-md)] bg-surface-0 text-text px-3 outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(76,141,255,0.17)] transition-all duration-150"
          />
        </div>

        {/* Quantity input */}
        <div className="mb-3">
          <label className="block text-muted text-xs font-[850] mb-[7px]">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
            className="w-full min-h-[43px] border border-border rounded-[var(--radius-md)] bg-surface-0 text-text px-3 outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(76,141,255,0.17)] transition-all duration-150"
          />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="bg-surface-0 border border-border-subtle rounded-[var(--radius-md)] p-3">
            <span className="block text-muted text-[11px] font-[850] uppercase tracking-[0.095em] mb-[7px]">
              Suggested
            </span>
            <strong className="text-[17px] tracking-[-0.02em]">
              {formatPrice(suggestedPrice)}
            </strong>
          </div>
          <div className="bg-surface-0 border border-border-subtle rounded-[var(--radius-md)] p-3">
            <span className="block text-muted text-[11px] font-[850] uppercase tracking-[0.095em] mb-[7px]">
              Order value
            </span>
            <strong className="text-[17px] tracking-[-0.02em]">
              ${total.toFixed(2)}
            </strong>
          </div>
        </div>

        <button
          className="w-full min-h-[46px] rounded-[var(--radius-md)] bg-blue text-white font-extrabold cursor-pointer transition-all duration-150 hover:bg-blue-hover hover:-translate-y-0.5 disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          type="submit"
          disabled={loading || !token}
        >
          {loading
            ? "Processing..."
            : `${type === "buy" ? "Buy" : "Sell"} ${side.toUpperCase()}`}
        </button>
      </form>
    </section>
  );
}
