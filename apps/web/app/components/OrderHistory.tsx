"use client";
import { useState, useEffect } from "react";
import { api } from "../api/api";
import type { Market, OrderHistory as OrderHistoryType } from "../types";
import { Button } from "#components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import { Badge } from "#components/ui/badge";

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

  const typeVariant = (orderType: string): "default" | "destructive" | "secondary" => {
    switch (orderType.toLowerCase()) {
      case "buy":
      case "split":
        return "default";
      case "sell":
      case "merge":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const typeClass = (orderType: string): string => {
    switch (orderType.toLowerCase()) {
      case "buy":
      case "split":
        return "bg-green-600 hover:bg-green-700 text-white font-bold";
      case "sell":
      case "merge":
        return "font-bold";
      default:
        return "font-bold";
    }
  };

  if (loading) {
    return (
      <Card className="w-full shadow-lg">
        <CardContent className="p-10 flex items-center justify-center text-muted-foreground font-medium">
          Loading order history...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Order History
          </CardTitle>
          <CardDescription>View your past orders and transactions</CardDescription>
        </div>
        <Button variant="outline" onClick={fetchHistory}>
          Refresh
        </Button>
      </CardHeader>

      <CardContent>
        {history.length === 0 ? (
          <div className="p-8 mt-4 border-2 border-dashed border-muted rounded-xl text-center text-muted-foreground font-medium bg-muted/10">
            No order history yet
          </div>
        ) : (
          <div className="rounded-md border mt-4 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold uppercase tracking-wider text-xs">Type</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-xs">Market</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-xs">Price</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-xs text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Badge variant={typeVariant(order.orderType)} className={typeClass(order.orderType)}>
                        {order.orderType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="grid gap-1">
                        <span className="font-bold text-base">
                          {marketTitleById.get(order.marketId) || "Unknown market"}
                        </span>
                        <span className="text-muted-foreground text-xs font-mono">
                          {order.marketId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-base">
                      {formatPrice(order.price)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-base">
                      {order.qty}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
