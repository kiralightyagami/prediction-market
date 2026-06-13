"use client";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

export default function Home() {
  // create a Component
  const [claims, setClaims] = useState(null);

  useEffect(() => {
    
    supabase.auth.getClaims().then(({ data: { claims } }) => {
      setClaims(claims);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims().then(({ data: { claims } }) => {
        setClaims(claims)
      })
    })

    return () => subscription.unsubscribe()
  }, []);

  return (
    <div>
      <button
        onClick={async () => {
          await supabase.auth.signInWithWeb3({
            chain: "solana",
            statement: "signin with solana",
          });
        }}
      >
        Signin with solana
      </button>
    </div>
  );
}
