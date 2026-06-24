"use client";
import { useState, useEffect } from "react";
import { api } from "../api/api";

interface BalanceProps {
  token: string;
}

export function Balance({ token }: BalanceProps) {
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fetchBalance = async () => {
    try {
      const data = await api.getBalance(token);
      setBalance(data.balance / 100);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [token]);

  const handleOnramp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.onramp(token, parseFloat(amount));
      setSuccess(`Successfully added $${amount} to your balance!`);
      fetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onramp failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOfframp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.offramp(token, parseFloat(amount));
      setSuccess(`Successfully withdrew $${amount} from your balance!`);
      fetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Offramp failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-gradient-to-b from-surface-1 to-surface-0 border border-border-subtle rounded-[var(--radius-lg)] shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
      <h3 className="text-[28px] font-bold tracking-[-0.055em]">Balance</h3>

      <div className="bg-surface-0 border border-border-subtle rounded-[var(--radius-lg)] p-6 my-4">
        <span className="text-[40px] font-black tracking-[-0.06em]">
          ${balance.toFixed(2)}
        </span>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] px-3 py-2.5 mb-3 text-[13px] font-[750] text-red-text bg-red-bg border border-red-border">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-[var(--radius-md)] px-3 py-2.5 mb-3 text-[13px] font-[750] text-green-text-dark bg-green-bg border border-green-border">
          {success}
        </div>
      )}

      <div className="grid gap-2.5">
        <div>
          <label className="block text-muted text-xs font-[850] mb-[7px]">
            Amount ($):
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full min-h-[43px] border border-border rounded-[var(--radius-md)] bg-surface-0 text-text px-3 outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(76,141,255,0.17)] transition-all duration-150"
          />
        </div>

        <button
          onClick={handleOnramp}
          disabled={loading}
          className="min-h-[42px] rounded-[var(--radius-md)] bg-green text-white font-[850] cursor-pointer transition-all duration-150 hover:brightness-110 disabled:opacity-55 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Onramp"}
        </button>
        <button
          onClick={handleOfframp}
          disabled={loading}
          className="min-h-[42px] rounded-[var(--radius-md)] bg-red text-white font-[850] cursor-pointer transition-all duration-150 hover:brightness-110 disabled:opacity-55 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Offramp"}
        </button>
      </div>
    </div>
  );
}
