"use client";
import { useState, useEffect } from "react";
import { api } from "../api/api";
import type { Market, Position } from "../types";

interface PositionsProps {
  token: string;
  markets: Market[];
}

export function Positions({ token, markets }: PositionsProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const marketTitleById = new Map(
    markets.map((market) => [market.id, market.title])
  );

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const data = await api.getPositions(token);
      setPositions(data.positions || []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [token]);

  if (loading) {
    return (
      <div className="p-5 bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)] text-muted">
        Loading positions...
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
      <h3 className="text-[28px] font-bold tracking-[-0.055em]">
        Your Positions
      </h3>

      {positions.length === 0 ? (
        <p className="text-muted mt-4">No positions yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mt-4">
            <thead>
              <tr>
                <th className="text-muted text-[11px] uppercase tracking-[0.09em] text-left py-3 px-3 border-b border-border-subtle font-[850]">
                  Market
                </th>
                <th className="text-muted text-[11px] uppercase tracking-[0.09em] text-left py-3 px-3 border-b border-border-subtle font-[850]">
                  Type
                </th>
                <th className="text-muted text-[11px] uppercase tracking-[0.09em] text-left py-3 px-3 border-b border-border-subtle font-[850]">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr
                  key={position.id}
                  className="hover:bg-[rgba(255,255,255,0.025)] transition-colors"
                >
                  <td className="py-3.5 px-3 border-b border-border-subtle text-text-soft">
                    <div className="grid gap-[3px]">
                      <span className="text-text font-[750]">
                        {marketTitleById.get(position.marketId) ||
                          "Unknown market"}
                      </span>
                      <span className="text-muted text-xs font-mono">
                        {position.marketId}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`py-3.5 px-3 border-b border-border-subtle font-[850] ${
                      position.type === "Yes" ? "text-green" : "text-red"
                    }`}
                  >
                    {position.type}
                  </td>
                  <td className="py-3.5 px-3 border-b border-border-subtle text-text-soft">
                    {position.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={fetchPositions}
        className="mt-4 border border-border bg-surface-1 text-text-soft rounded-[var(--radius-md)] px-3.5 py-2 cursor-pointer transition-all duration-150 hover:bg-surface-2 hover:border-[#34485d] hover:text-text"
      >
        Refresh
      </button>
    </div>
  );
}
