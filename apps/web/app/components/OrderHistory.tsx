"use client";
import { useState, useEffect } from "react";
import { api } from "../api/api";
import type { Market, OrderHistory as OrderHistoryType } from "../types";

interface OrderHistoryProps {
  token: string;
  markets: Market[];
}

export function OrderHistory({ token, markets }: OrderHistoryProps) {
  const [history, setHistory] = useState<OrderHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const marketTitleById = new Map(
    markets.map((market) => [market.id, market.title])
  );

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getOrderHistory(token);
      setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to fetch order history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const formatPrice = (price: number) => {
    if (price === 0) return "-";
    return `$${(price / 100).toFixed(2)}`;
  };

  const typeColor = (orderType: string) => {
    switch (orderType.toLowerCase()) {
      case "buy":
      case "split":
        return "text-green font-[850]";
      case "sell":
      case "merge":
        return "text-red font-[850]";
      default:
        return "text-text-soft";
    }
  };

  if (loading) {
    return (
      <div className="p-5 bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)] text-muted">
        Loading order history...
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
      <h3 className="text-[28px] font-bold tracking-[-0.055em]">
        Order History
      </h3>

      {history.length === 0 ? (
        <p className="text-muted mt-4">No order history yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mt-4">
            <thead>
              <tr>
                <th className="text-muted text-[11px] uppercase tracking-[0.09em] text-left py-3 px-3 border-b border-border-subtle font-[850]">
                  Type
                </th>
                <th className="text-muted text-[11px] uppercase tracking-[0.09em] text-left py-3 px-3 border-b border-border-subtle font-[850]">
                  Market
                </th>
                <th className="text-muted text-[11px] uppercase tracking-[0.09em] text-left py-3 px-3 border-b border-border-subtle font-[850]">
                  Price
                </th>
                <th className="text-muted text-[11px] uppercase tracking-[0.09em] text-left py-3 px-3 border-b border-border-subtle font-[850]">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[rgba(255,255,255,0.025)] transition-colors"
                >
                  <td
                    className={`py-3.5 px-3 border-b border-border-subtle ${typeColor(order.orderType)}`}
                  >
                    {order.orderType}
                  </td>
                  <td className="py-3.5 px-3 border-b border-border-subtle text-text-soft">
                    <div className="grid gap-[3px]">
                      <span className="text-text font-[750]">
                        {marketTitleById.get(order.marketId) || "Unknown market"}
                      </span>
                      <span className="text-muted text-xs font-mono">
                        {order.marketId}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 border-b border-border-subtle text-text-soft">
                    {formatPrice(order.price)}
                  </td>
                  <td className="py-3.5 px-3 border-b border-border-subtle text-text-soft">
                    {order.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={fetchHistory}
        className="mt-4 border border-border bg-surface-1 text-text-soft rounded-[var(--radius-md)] px-3.5 py-2 cursor-pointer transition-all duration-150 hover:bg-surface-2 hover:border-[#34485d] hover:text-text"
      >
        Refresh
      </button>
    </div>
  );
}
