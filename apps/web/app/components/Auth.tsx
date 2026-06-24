"use client";
import React from "react";
import { useSupabase } from "../hooks/useSupabase";
import { useUser } from "../hooks/useUser";

declare global {
  interface Window {
    solflare?: any;
  }
}

export default function Auth() {
  const { claims } = useUser();
  const supabase = useSupabase();

  if (claims) return null;

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-[420px] bg-gradient-to-b from-surface-1 to-surface-0 border border-border rounded-[22px] p-8 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green shadow-[0_0_0_5px_rgba(46,203,112,0.1)]" />
          <h1 className="text-[30px] font-bold tracking-[-0.04em] text-text">
            Polymark
          </h1>
        </div>
        <p className="text-muted mb-6 text-[15px] leading-relaxed">
          Trade live prediction markets. Sign in with your Solana wallet to get
          started.
        </p>

        {typeof window !== "undefined" && window.solflare ? (
          <button
            onClick={async () => {
              await supabase.auth.signInWithWeb3({
                chain: "solana",
                statement:
                  "I accept the Terms of Service at https://example.com/tos",
                wallet: window.solflare,
              });
            }}
            className="w-full min-h-[46px] rounded-[var(--radius-md)] bg-blue text-white font-extrabold cursor-pointer transition-all duration-150 hover:bg-blue-hover hover:-translate-y-0.5 active:translate-y-0"
          >
            Sign in with Solflare
          </button>
        ) : (
          <button
            onClick={async () => {
              await supabase.auth.signInWithWeb3({
                chain: "solana",
                statement: "signin with solana",
              });
            }}
            className="w-full min-h-[46px] rounded-[var(--radius-md)] bg-blue text-white font-extrabold cursor-pointer transition-all duration-150 hover:bg-blue-hover hover:-translate-y-0.5 active:translate-y-0"
          >
            Sign in with Solana
          </button>
        )}
      </div>
    </div>
  );
}