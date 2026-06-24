"use client";
import { useState, useEffect } from "react";
import { useSupabase } from "./useSupabase";
import type { JWTPayload } from "jose";

export function useUser() {
  const [claims, setClaims] = useState<JWTPayload | null>(null);
  const [token, setToken] = useState<string>("");
  const supabase = useSupabase();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setToken(session.access_token);
      }
    });

    supabase.auth.getClaims().then(({ data }) => {
      setClaims(data?.claims ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims().then(({ data }) => {
        setClaims(data?.claims ?? null);
      });
      supabase.auth.getSession().then(({ data: { session } }) => {
        setToken(session?.access_token ?? "");
      });
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return {
    claims,
    token,
  };
}
