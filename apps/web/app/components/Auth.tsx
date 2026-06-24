"use client"
import React from 'react'
import { useSupabase } from "../hooks/useSupabase";
import { useUser } from "../hooks/useUser";

const Auth = () => {
    const {claims}= useUser();
    const supabase = useSupabase();
    return (
      <div>
        {!claims && <button
          onClick={async () => {
            await supabase.auth.signInWithWeb3({
              chain: "solana",
              statement: "signin with solana",
            });
          }}
        >
          Signin with solana
        </button>
        }
        {claims && <button onClick={async () => {
          await supabase.auth.signOut()
        }}>
          logout
          </button>}
      </div>
    );
}

export default Auth