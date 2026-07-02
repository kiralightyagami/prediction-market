"use client";
import { useState, useEffect } from "react";
import { api } from "../api/api";
import type { Market, Position } from "../types";
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
      <Card className="w-full shadow-lg">
        <CardContent className="p-10 flex items-center justify-center text-muted-foreground font-medium">
          Loading positions...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Your Positions
          </CardTitle>
          <CardDescription>View your active market positions</CardDescription>
        </div>
        <Button variant="outline" onClick={fetchPositions}>
          Refresh
        </Button>
      </CardHeader>

      <CardContent>
        {positions.length === 0 ? (
          <div className="p-8 mt-4 border-2 border-dashed border-muted rounded-xl text-center text-muted-foreground font-medium bg-muted/10">
            No positions yet
          </div>
        ) : (
          <div className="rounded-md border mt-4 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold uppercase tracking-wider text-xs">Market</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-xs">Type</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-xs text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="grid gap-1">
                        <span className="font-bold text-base">
                          {marketTitleById.get(position.marketId) || "Unknown market"}
                        </span>
                        <span className="text-muted-foreground text-xs font-mono">
                          {position.marketId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={position.type === "Yes" ? "default" : "destructive"} 
                        className={`font-bold ${position.type === "Yes" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                      >
                        {position.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {position.qty}
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
