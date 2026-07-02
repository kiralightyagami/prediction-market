"use client";
import { useState, useEffect } from "react";
import { useSupabase } from "./hooks/useSupabase";
import { useUser } from "./hooks/useUser";
import { api } from "./api/api";
import type { Market } from "./types";
import Auth from "./components/Auth";
import { MarketList } from "./components/MarketList";
import { MarketDetail } from "./components/MarketDetail";
import { OrderForm } from "./components/OrderForm";
import { Balance } from "./components/Balance";
import { Positions } from "./components/Positions";
import { OrderHistory } from "./components/OrderHistory";
import { SplitMerge } from "./components/SplitMerge";

import { Button } from "#components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "#components/ui/tabs";

const TABS = [
  { key: "markets", label: "Markets", needsMarket: false },
  { key: "trading", label: "Trading", needsMarket: true },
  { key: "balance", label: "Balance", needsMarket: false },
  { key: "positions", label: "Positions", needsMarket: false },
  { key: "history", label: "History", needsMarket: false },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Home() {
  const { claims, token } = useUser();
  const supabase = useSupabase();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("markets");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchMarkets = async () => {
    try {
      const data = await api.getMarkets();
      const nextMarkets = data.markets || [];
      setMarkets(nextMarkets);
      setSelectedMarket((current) =>
        current
          ? nextMarkets.find((m: Market) => m.id === current.id) || current
          : current
      );
    } catch (err) {
      console.error("Failed to fetch markets:", err);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSelectedMarket(null);
    setActiveTab("markets");
  };

  const handleSelectMarket = (marketId: string) => {
    const market = markets.find((m) => m.id === marketId);
    if (market) {
      setSelectedMarket(market);
      setActiveTab("trading");
    }
  };

  const handleActionComplete = () => {
    setRefreshKey((prev) => prev + 1);
    fetchMarkets();
  };

  // Not logged in — show auth
  if (!claims) {
    return <Auth />;
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto p-[22px]">
      <header className="flex items-center justify-between gap-[18px] mb-[18px]">
        <h1 className="text-2xl font-bold tracking-[-0.04em] flex items-center gap-2.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green shadow-[0_0_0_5px_rgba(46,203,112,0.1)]" />
          Polymark
        </h1>
        <Button variant="outline" onClick={handleSignOut}>
          Logout
        </Button>
      </header>

      {/* Tab navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val === "markets") {
            setActiveTab("markets");
            setSelectedMarket(null);
          } else {
            setActiveTab(val as TabKey);
          }
        }}
        className="mb-6 w-full"
      >
        <TabsList className="h-11">
          {TABS.map((tab) => {
            const disabled = tab.needsMarket && !selectedMarket;
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                disabled={disabled}
                className="px-6 data-[state=active]:font-bold"
              >
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Content */}
      <main className="min-h-[560px]">
        {activeTab === "markets" && (
          <MarketList markets={markets} onSelectMarket={handleSelectMarket} />
        )}

        {activeTab === "trading" && selectedMarket && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-[18px] items-start">
            <MarketDetail
              market={selectedMarket}
              onBack={() => {
                setActiveTab("markets");
                setSelectedMarket(null);
              }}
            />
            <aside className="grid gap-3.5 xl:sticky xl:top-[18px]">
              <OrderForm
                market={selectedMarket}
                token={token}
                onOrderPlaced={handleActionComplete}
              />
              <SplitMerge
                market={selectedMarket}
                token={token}
                onActionComplete={handleActionComplete}
              />
            </aside>
          </div>
        )}

        {activeTab === "balance" && (
          <Balance token={token} key={refreshKey} />
        )}

        {activeTab === "positions" && (
          <Positions token={token} markets={markets} key={refreshKey} />
        )}

        {activeTab === "history" && (
          <OrderHistory token={token} markets={markets} key={refreshKey} />
        )}
      </main>
    </div>
  );
}
