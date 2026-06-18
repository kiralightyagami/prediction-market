"use client"
import { useState, useEffect } from "react";
import { useSupabase } from "./useSupabase";
import type { JWTPayload } from "jose";

export function useUser() {
  const [claims, setClaims] = useState<JWTPayload | null>(null);
  const supabase = useSupabase();

  useEffect(() => {
    supabase.auth.getClaims().then(({ data }) => {
      setClaims(data?.claims ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims().then(({ data }) => {
        setClaims(data?.claims ?? null);
      });
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return {
    claims
  }
}
