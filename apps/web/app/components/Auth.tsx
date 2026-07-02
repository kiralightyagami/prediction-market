"use client"
import React, { useState } from 'react'
import { useSupabase } from "../hooks/useSupabase";
import { useUser } from "../hooks/useUser";

const Auth = () => {
  const { claims } = useUser();
  const supabase = useSupabase();
  const [status, setStatus] = useState<string>("");

  const handleSignIn = async () => {
    try {
      setStatus("Connecting wallet...");
      const result = await supabase.auth.signInWithWeb3({
        chain: "solana",
        statement: "signin with solana",
      });
      console.log("signInWithWeb3 result:", result);

      if (result.error) {
        console.error("Sign-in error:", result.error);
        setStatus(`Error: ${result.error.message}`);
      } else {
        setStatus("Signed in! Session: " + (result.data?.session ? "yes" : "no"));
        console.log("Session:", result.data?.session);
        console.log("User:", result.data?.user);
      }
    } catch (err: any) {
      console.error("Sign-in exception:", err);
      setStatus(`Exception: ${err.message}`);
    }
  };

  return (
    <div>
      {!claims && <button onClick={handleSignIn}>
        Signin with solana
      </button>}
      {status && <p style={{ marginTop: 10, color: status.startsWith("Error") || status.startsWith("Exception") ? "red" : "gray" }}>{status}</p>}
      {claims && <button onClick={async () => {
        await supabase.auth.signOut()
      }}>
        logout
      </button>}
    </div>
  );
}

export default Auth