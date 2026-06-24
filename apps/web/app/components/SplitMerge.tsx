"use client";
import { useState } from "react";
import { api } from "../api/api";
import type { Market } from "../types";

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
    <section className="bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start gap-3.5 p-4 border-b border-border-subtle">
        <div>
          <span className="block text-muted text-[11px] font-[850] uppercase tracking-[0.095em] mb-[7px]">
            Market actions
          </span>
          <h3 className="text-[17px] leading-[1.28] tracking-[-0.035em] font-semibold">
            Split / Merge
          </h3>
        </div>
        <span className="text-muted text-[11px] font-[850] uppercase tracking-[0.095em]">
          {selectedMarketTitle || "Select market"}
        </span>
      </div>

      <div className="px-4 pb-4">
        {/* Messages */}
        {error && (
          <div className="rounded-[var(--radius-md)] px-3 py-2.5 mt-4 text-[13px] font-[750] text-red-text bg-red-bg border border-red-border">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-[var(--radius-md)] px-3 py-2.5 mt-4 text-[13px] font-[750] text-green-text-dark bg-green-bg border border-green-border">
            {success}
          </div>
        )}

        {/* Market selector (only when not in a specific market) */}
        {!market && (
          <div className="mt-4">
            <label className="block text-muted text-xs font-[850] mb-[7px]">
              Market
            </label>
            <select
              value={marketId}
              onChange={(e) => setMarketId(e.target.value)}
              className="w-full min-h-[43px] border border-border rounded-[var(--radius-md)] bg-surface-0 text-text px-3 outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(76,141,255,0.17)] transition-all duration-150"
            >
              <option value="">Select a market</option>
              {markets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity input */}
        <div className="mt-4">
          <label className="block text-muted text-xs font-[850] mb-[7px]">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full min-h-[43px] border border-border rounded-[var(--radius-md)] bg-surface-0 text-text px-3 outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(76,141,255,0.17)] transition-all duration-150"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={() => runAction("split")}
            disabled={loading || !token}
            className="min-h-[42px] rounded-[var(--radius-md)] bg-surface-2 text-text-soft border border-border font-[850] cursor-pointer transition-all duration-150 hover:text-green-text hover:bg-green-bg disabled:opacity-55 disabled:cursor-not-allowed"
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => runAction("merge")}
            disabled={loading || !token}
            className="min-h-[42px] rounded-[var(--radius-md)] bg-surface-2 text-text-soft border border-border font-[850] cursor-pointer transition-all duration-150 hover:text-blue-text hover:bg-blue-bg disabled:opacity-55 disabled:cursor-not-allowed"
          >
            Merge
          </button>
        </div>
      </div>
    </section>
  );
}
